"""
Lightverse Verifier — Layer 2
Takes signals.json from the collector and enriches each signal with:
- Topic grouping (what story does this belong to?)
- Corroboration score (how many independent sources cover this?)
- Source bias label (known editorial stance)
- Flags for single-source stories

Output: verified_signals.json
Zero cost. No paid APIs required.

Install deps (already covered by collector):
    pip install requests scikit-learn numpy
"""

import json
import hashlib
import logging
from datetime import datetime, timezone
from dataclasses import dataclass, asdict, field
from typing import Optional
from collections import defaultdict

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("lightverse.verifier")


# ─────────────────────────────────────────────
#  SOURCE BIAS REGISTRY
#  Known editorial stances for each source.
#  Scale: left | centre-left | centre | centre-right | right | state
#  Funding: private | state | nonprofit | unknown
# ─────────────────────────────────────────────

SOURCE_BIAS = {
    "rss:bbc_world": {
        "label": "BBC World",
        "bias": "centre",
        "funding": "state",
        "country": "GB",
        "note": "UK public broadcaster. Generally reliable, state-funded.",
    },
    "rss:aljazeera": {
        "label": "Al Jazeera",
        "bias": "centre-left",
        "funding": "state",
        "country": "QA",
        "note": "Qatari state-funded. Strong Middle East coverage, some regional bias.",
    },
    "rss:reuters_world": {
        "label": "Reuters",
        "bias": "centre",
        "funding": "private",
        "country": "GB",
        "note": "Wire service. Widely considered neutral and factual.",
    },
    "rss:reuters_business": {
        "label": "Reuters Business",
        "bias": "centre",
        "funding": "private",
        "country": "GB",
        "note": "Wire service. Widely considered neutral and factual.",
    },
    "rss:ft": {
        "label": "Financial Times",
        "bias": "centre-right",
        "funding": "private",
        "country": "GB",
        "note": "Pro-market, finance-focused. Reliable but pro-business perspective.",
    },
    "rss:bbc_world": {
        "label": "BBC World",
        "bias": "centre",
        "funding": "state",
        "country": "GB",
        "note": "UK public broadcaster. Generally reliable, state-funded.",
    },
    "rss:ap_top": {
        "label": "Associated Press",
        "bias": "centre",
        "funding": "nonprofit",
        "country": "US",
        "note": "US wire service. Widely considered factual and neutral.",
    },
    "rss:ecb": {
        "label": "European Central Bank",
        "bias": "centre",
        "funding": "state",
        "country": "EU",
        "note": "Official EU monetary authority. Primary source for eurozone policy.",
    },
    "rss:fed": {
        "label": "Federal Reserve",
        "bias": "centre",
        "funding": "state",
        "country": "US",
        "note": "Official US monetary authority. Primary source for US monetary policy.",
    },
    "rss:imf_blog": {
        "label": "IMF Blog",
        "bias": "centre",
        "funding": "state",
        "country": "INT",
        "note": "International Monetary Fund. Pro-globalization institutional perspective.",
    },
    "rss:coindesk": {
        "label": "CoinDesk",
        "bias": "centre",
        "funding": "private",
        "country": "US",
        "note": "Crypto-native publication. Generally pro-crypto perspective.",
    },
    "rss:cointelegraph": {
        "label": "CoinTelegraph",
        "bias": "centre",
        "funding": "private",
        "country": "US",
        "note": "Crypto-native publication. Generally pro-crypto perspective.",
    },
    "rss:decrypt": {
        "label": "Decrypt",
        "bias": "centre",
        "funding": "private",
        "country": "US",
        "note": "Crypto and Web3 focused. Generally pro-crypto perspective.",
    },
    "rss:nature": {
        "label": "Nature",
        "bias": "centre",
        "funding": "private",
        "country": "GB",
        "note": "Peer-reviewed science journal. High reliability for scientific claims.",
    },
    "rss:arxiv_cs": {
        "label": "arXiv CS",
        "bias": "centre",
        "funding": "nonprofit",
        "country": "INT",
        "note": "Preprint server. Not peer-reviewed but direct from researchers.",
    },
}

UNKNOWN_SOURCE_BIAS = {
    "label": "Unknown",
    "bias": "unknown",
    "funding": "unknown",
    "country": "unknown",
    "note": "Source bias not yet catalogued.",
}


# ─────────────────────────────────────────────
#  CORROBORATION SCORING
#  Groups signals by topic and scores by how many
#  independent sources cover the same story.
# ─────────────────────────────────────────────

def extract_keywords(text: str, n: int = 8) -> set[str]:
    """
    Simple keyword extraction — no ML needed.
    Strips stopwords, returns top N meaningful words.
    """
    STOPWORDS = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
        'has', 'have', 'had', 'will', 'would', 'could', 'should', 'may', 'might',
        'that', 'this', 'it', 'its', 'as', 'after', 'before', 'over', 'under',
        'new', 'says', 'said', 'say', 'he', 'she', 'they', 'his', 'her', 'their',
        'also', 'not', 'no', 'up', 'out', 'more', 'than', 'into', 'about', 'what',
        'how', 'who', 'which', 'when', 'where', 'why', 'all', 'any', 'both',
    }

    words = text.lower().split()
    cleaned = []
    for w in words:
        w = ''.join(c for c in w if c.isalpha())
        if len(w) > 3 and w not in STOPWORDS:
            cleaned.append(w)

    # Return most frequent meaningful words
    freq = defaultdict(int)
    for w in cleaned:
        freq[w] += 1

    return set(sorted(freq, key=lambda x: -freq[x])[:n])


def keyword_overlap(kw1: set, kw2: set) -> float:
    """Jaccard similarity between two keyword sets."""
    if not kw1 or not kw2:
        return 0.0
    intersection = kw1 & kw2
    union = kw1 | kw2
    return len(intersection) / len(union)


def group_by_topic(signals: list[dict], threshold: float = 0.25) -> dict[str, list[str]]:
    """
    Groups signal IDs by topic similarity using keyword overlap.
    Returns: { topic_id: [signal_id, ...] }
    threshold: minimum Jaccard similarity to consider same topic
    """
    # Extract keywords for each signal
    keywords = {}
    for s in signals:
        text = f"{s['title']} {s['body'] or ''}"
        keywords[s['id']] = extract_keywords(text)

    # Group by overlap
    groups: dict[str, list[str]] = {}
    assigned: set[str] = set()

    for s in signals:
        sid = s['id']
        if sid in assigned:
            continue

        # Start a new group with this signal
        group_id = sid
        groups[group_id] = [sid]
        assigned.add(sid)

        # Find similar signals
        for other in signals:
            oid = other['id']
            if oid in assigned:
                continue
            overlap = keyword_overlap(keywords[sid], keywords.get(oid, set()))
            if overlap >= threshold:
                groups[group_id].append(oid)
                assigned.add(oid)

    return groups


def score_corroboration(signal_ids: list[str], all_signals: dict[str, dict]) -> dict:
    """
    Given a group of signals covering the same topic,
    score the corroboration based on source diversity.
    """
    signals_in_group = [all_signals[sid] for sid in signal_ids if sid in all_signals]

    # Count unique source organizations (not feeds — e.g. bbc_world and bbc_business = 1 org)
    def org(source_name: str) -> str:
        parts = source_name.replace('rss:', '').replace('reddit:', '').replace('youtube:', '')
        return parts.split('_')[0]  # e.g. "bbc", "reuters", "ft"

    unique_orgs   = set(org(s['source_name']) for s in signals_in_group)
    unique_countries = set(s['source_country'] for s in signals_in_group if s.get('source_country'))

    count = len(signals_in_group)
    org_count = len(unique_orgs)
    country_count = len(unique_countries)

    # Score 0-100
    # Base: number of unique orgs (capped at 5)
    # Bonus: geographic diversity
    base_score = min(org_count, 5) * 15          # max 75
    geo_bonus  = min(country_count - 1, 3) * 8   # max 24, 0 if single country
    score = min(base_score + geo_bonus, 100)

    # Label
    if score >= 60:
        label = "high"
    elif score >= 30:
        label = "moderate"
    elif score >= 15:
        label = "low"
    else:
        label = "single-source"

    return {
        "score": score,
        "label": label,
        "source_count": count,
        "unique_orgs": org_count,
        "unique_countries": country_count,
        "covering_orgs": list(unique_orgs),
    }


# ─────────────────────────────────────────────
#  MAIN VERIFIER
# ─────────────────────────────────────────────

def verify(signals: list[dict]) -> list[dict]:
    """
    Enriches each signal with:
    - source_bias: known bias and funding info
    - corroboration: how many sources cover this topic
    - topic_group: which topic cluster this belongs to
    - verified_at: timestamp
    """
    log.info(f"Verifying {len(signals)} signals...")

    # Index by ID for fast lookup
    signal_index = {s['id']: s for s in signals}

    # Group by topic
    log.info("Grouping by topic...")
    topic_groups = group_by_topic(signals, threshold=0.2)
    log.info(f"Found {len(topic_groups)} topic groups")

    # Build reverse map: signal_id → topic_group_id
    signal_to_group: dict[str, str] = {}
    for group_id, members in topic_groups.items():
        for sid in members:
            signal_to_group[sid] = group_id

    # Score each group
    group_scores: dict[str, dict] = {}
    for group_id, members in topic_groups.items():
        group_scores[group_id] = score_corroboration(members, signal_index)

    # Enrich each signal
    verified = []
    now = datetime.now(timezone.utc).isoformat()

    for s in signals:
        sid = s['id']
        group_id = signal_to_group.get(sid, sid)
        corroboration = group_scores.get(group_id, {
            "score": 0, "label": "single-source",
            "source_count": 1, "unique_orgs": 1,
            "unique_countries": 1, "covering_orgs": [],
        })

        enriched = {
            **s,
            "source_bias":    SOURCE_BIAS.get(s['source_name'], UNKNOWN_SOURCE_BIAS),
            "corroboration":  corroboration,
            "topic_group":    group_id,
            "verified_at":    now,
        }
        verified.append(enriched)

    # Summary
    labels = defaultdict(int)
    for s in verified:
        labels[s['corroboration']['label']] += 1

    log.info(f"Corroboration breakdown: {dict(labels)}")
    return verified


# ─────────────────────────────────────────────
#  ENTRY POINT
# ─────────────────────────────────────────────

if __name__ == "__main__":
    import sys
    import os

    script_dir   = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, '..', '..'))
    
    input_path  = os.path.join(project_root, 'storage', 'app', 'signals.json')
    output_path = os.path.join(project_root, 'storage', 'app', 'verified_signals.json')

    if not os.path.exists(input_path):
        log.error(f"Input file not found: {input_path}")
        sys.exit(1)

    with open(input_path, "r", encoding="utf-8") as f:
        signals = json.load(f)

    verified = verify(signals)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(verified, f, indent=2, ensure_ascii=False)

    log.info(f"Saved {len(verified)} verified signals to {output_path}")

    from collections import Counter
    labels = Counter(s['corroboration']['label'] for s in verified)
    print(f"\n{'─'*40}")
    print(f"  Total verified: {len(verified)}")
    print(f"  Corroboration: {dict(labels)}")
    print(f"{'─'*40}")
    print(f"Output: {output_path}")