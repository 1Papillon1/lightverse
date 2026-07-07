"""
Lightverse Collector — Layer 1
Pulls from GDELT, RSS feeds, Reddit, and YouTube transcripts.
Normalizes everything into a unified RawSignal format.
Zero cost. No paid APIs required.

Install deps:
    pip install requests feedparser praw youtube-transcript-api
"""

import requests
import feedparser
import json
import time
import hashlib
from datetime import datetime, timezone
from dataclasses import dataclass, asdict
from typing import Optional
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("lightverse.collector")


# ─────────────────────────────────────────────
#  UNIFIED SIGNAL FORMAT
#  Everything from every source normalizes here.
#  This is what gets passed to Layer 2 (Verifier).
# ─────────────────────────────────────────────

@dataclass
class RawSignal:
    id: str                        # sha256 of url+title (dedup key)
    source_name: str               # "gdelt", "rss:reuters", "reddit:r/CryptoCurrency", etc.
    source_country: Optional[str]  # ISO country code if known
    source_type: str               # "news" | "social" | "onchain" | "academic"
    title: str
    body: str                      # full text or best available excerpt
    url: str
    published_at: str              # ISO 8601
    galaxy_hints: list[str]        # rough tags for galaxy routing: ["economics", "crypto", ...]
    raw_metadata: dict             # source-specific extras (tone score, upvotes, etc.)


def make_id(url: str, title: str) -> str:
    return hashlib.sha256(f"{url}{title}".encode()).hexdigest()[:16]


# ─────────────────────────────────────────────
#  SOURCE 1 — GDELT
#  Free. No key. Updated every 15 minutes.
#  Returns top news articles globally, filtered by theme.
# ─────────────────────────────────────────────

GDELT_THEMES = {
    "economics": "ECON",
    "crypto": "BLOCKCHAIN",
    "conflict": "KILL",
    "science": "SCIENCE",
    "politics": "GOV",
    "health": "MED",
}

def collect_gdelt(theme_key: str = "economics", max_records: int = 20) -> list[RawSignal]:
    """
    Pulls from GDELT's free Article Search API (GKG).
    Docs: https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/
    """
    theme = GDELT_THEMES.get(theme_key, "ECON")
    url = (
        f"https://api.gdeltproject.org/api/v2/doc/doc"
        f"?query=theme:{theme}"
        f"&mode=ArtList"
        f"&maxrecords={max_records}"
        f"&format=json"
        f"&timespan=1d"  # last 24 hours
    )

    signals = []
    try:
        resp = requests.get(url, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        articles = data.get("articles", [])

        for art in articles:
            title = art.get("title", "").strip()
            src_url = art.get("url", "")
            if not title or not src_url:
                continue

            signals.append(RawSignal(
                id=make_id(src_url, title),
                source_name="gdelt",
                source_country=art.get("sourcecountry", None),
                source_type="news",
                title=title,
                body=art.get("seendate", ""),  # GDELT free tier doesn't give full body
                url=src_url,
                published_at=_parse_gdelt_date(art.get("seendate", "")),
                galaxy_hints=[theme_key],
                raw_metadata={
                    "domain": art.get("domain", ""),
                    "language": art.get("language", ""),
                    "tone": art.get("tone", None),
                    "sourcecountry": art.get("sourcecountry", ""),
                }
            ))

        log.info(f"GDELT [{theme_key}]: {len(signals)} articles")
    except Exception as e:
        log.error(f"GDELT error: {e}")

    return signals


def _parse_gdelt_date(raw: str) -> str:
    # GDELT format: "20240115T120000Z"
    try:
        dt = datetime.strptime(raw, "%Y%m%dT%H%M%SZ").replace(tzinfo=timezone.utc)
        return dt.isoformat()
    except Exception:
        return datetime.now(timezone.utc).isoformat()


# ─────────────────────────────────────────────
#  SOURCE 2 — RSS FEEDS
#  Free. No key. Direct from primary sources.
#  Add any feed you want to RSS_FEEDS below.
# ─────────────────────────────────────────────

RSS_FEEDS = {
    # Global wire services
    "rss:reuters_world":    ("https://feeds.reuters.com/reuters/worldNews",         ["politics", "economics"], "GB"),
    "rss:reuters_business": ("https://feeds.reuters.com/reuters/businessNews",      ["economics"],             "GB"),
    "rss:ap_top":           ("https://rsshub.app/apnews/topics/ap-top-news",        ["politics", "economics"], "US"),
    "rss:bbc_world":        ("https://feeds.bbci.co.uk/news/world/rss.xml",         ["politics"],              "GB"),
    "rss:aljazeera":        ("https://www.aljazeera.com/xml/rss/all.xml",           ["politics"],              "QA"),

    # Economics / Finance
    "rss:ft":               ("https://www.ft.com/rss/home",                         ["economics"],             "GB"),
    "rss:imf_blog":         ("https://www.imf.org/en/Blogs/rss",                    ["economics"],             "INT"),
    "rss:ecb":              ("https://www.ecb.europa.eu/rss/press.html",            ["economics"],             "EU"),
    "rss:fed":              ("https://www.federalreserve.gov/feeds/press_all.xml",  ["economics"],             "US"),

    # Crypto / Blockchain
    "rss:coindesk":         ("https://www.coindesk.com/arc/outboundfeeds/rss/",     ["economics", "crypto"],   "US"),
    "rss:cointelegraph":    ("https://cointelegraph.com/rss",                       ["economics", "crypto"],   "US"),
    "rss:decrypt":          ("https://decrypt.co/feed",                             ["economics", "crypto"],   "US"),

    # Science / Tech
    "rss:nature":           ("https://www.nature.com/nature.rss",                   ["science"],               "GB"),
    "rss:arxiv_cs":         ("https://export.arxiv.org/rss/cs.AI",                  ["science", "technology"], "INT"),
}

def collect_rss(source_keys: list[str] = None, max_per_feed: int = 10) -> list[RawSignal]:
    """
    Pulls from all configured RSS feeds (or a subset by key).
    feedparser handles almost any RSS/Atom format automatically.
    """
    targets = {k: v for k, v in RSS_FEEDS.items() if source_keys is None or k in source_keys}
    signals = []

    for source_name, (feed_url, galaxy_hints, country) in targets.items():
        try:
            feed = feedparser.parse(feed_url)
            count = 0
            for entry in feed.entries[:max_per_feed]:
                title = entry.get("title", "").strip()
                link = entry.get("link", "")
                if not title or not link:
                    continue

                # Best-effort body extraction
                body = (
                    entry.get("summary", "")
                    or entry.get("description", "")
                    or ""
                )
                # Strip basic HTML tags
                body = _strip_html(body)

                published = entry.get("published", "") or entry.get("updated", "")

                signals.append(RawSignal(
                    id=make_id(link, title),
                    source_name=source_name,
                    source_country=country,
                    source_type="news",
                    title=title,
                    body=body[:1000],  # cap at 1000 chars for now
                    url=link,
                    published_at=published,
                    galaxy_hints=galaxy_hints,
                    raw_metadata={
                        "feed_url": feed_url,
                        "author": entry.get("author", ""),
                        "tags": [t.get("term", "") for t in entry.get("tags", [])],
                    }
                ))
                count += 1

            log.info(f"RSS [{source_name}]: {count} articles")
            time.sleep(0.3)  # polite delay between feeds

        except Exception as e:
            log.warning(f"RSS error [{source_name}]: {e}")

    return signals


def _strip_html(text: str) -> str:
    import re
    return re.sub(r"<[^>]+>", " ", text).strip()


# ─────────────────────────────────────────────
#  SOURCE 3 — REDDIT
#  Free. Requires a free API key (30 seconds to set up).
#  Get one at: https://www.reddit.com/prefs/apps
#  Set type = "script", fill any redirect URI.
# ─────────────────────────────────────────────

REDDIT_SOURCES = {
    "reddit:r/CryptoCurrency":   ("CryptoCurrency",   ["economics", "crypto"]),
    "reddit:r/worldnews":        ("worldnews",         ["politics"]),
    "reddit:r/economics":        ("economics",         ["economics"]),
    "reddit:r/technology":       ("technology",        ["technology"]),
    "reddit:r/science":          ("science",           ["science"]),
    "reddit:r/geopolitics":      ("geopolitics",       ["politics"]),
}

def collect_reddit(
    client_id: str,
    client_secret: str,
    user_agent: str = "lightverse-collector/0.1",
    subreddit_keys: list[str] = None,
    post_limit: int = 15,
    min_upvotes: int = 50,
) -> list[RawSignal]:
    """
    Pulls top/hot posts from configured subreddits.
    Filters by minimum upvote count to get signal over noise.

    Reddit app setup (free, takes 2 minutes):
    1. Go to https://www.reddit.com/prefs/apps
    2. Click 'create another app' → type: script
    3. Copy client_id (under app name) and client_secret
    """
    try:
        import praw
    except ImportError:
        log.error("Install praw: pip install praw")
        return []

    try:
        reddit = praw.Reddit(
            client_id=client_id,
            client_secret=client_secret,
            user_agent=user_agent,
        )
    except Exception as e:
        log.error(f"Reddit auth error: {e}")
        return []

    targets = {k: v for k, v in REDDIT_SOURCES.items()
               if subreddit_keys is None or k in subreddit_keys}
    signals = []

    for source_name, (subreddit_name, galaxy_hints) in targets.items():
        try:
            subreddit = reddit.subreddit(subreddit_name)
            count = 0
            for post in subreddit.hot(limit=post_limit):
                if post.score < min_upvotes or post.stickied:
                    continue

                body = post.selftext[:1000] if post.selftext else ""

                signals.append(RawSignal(
                    id=make_id(post.url, post.title),
                    source_name=source_name,
                    source_country=None,  # Reddit is global
                    source_type="social",
                    title=post.title,
                    body=body,
                    url=f"https://reddit.com{post.permalink}",
                    published_at=datetime.fromtimestamp(
                        post.created_utc, tz=timezone.utc
                    ).isoformat(),
                    galaxy_hints=galaxy_hints,
                    raw_metadata={
                        "upvotes": post.score,
                        "upvote_ratio": post.upvote_ratio,
                        "num_comments": post.num_comments,
                        "flair": post.link_flair_text,
                        "external_url": post.url if not post.is_self else None,
                    }
                ))
                count += 1

            log.info(f"Reddit [{subreddit_name}]: {count} posts (min {min_upvotes} upvotes)")
            time.sleep(1)  # respect rate limits

        except Exception as e:
            log.warning(f"Reddit error [{subreddit_name}]: {e}")

    return signals


# ─────────────────────────────────────────────
#  SOURCE 4 — YOUTUBE TRANSCRIPTS
#  Free. No API key needed for transcripts.
#  Pass a list of channel/video IDs to monitor.
# ─────────────────────────────────────────────

# Channels to monitor — add any YouTube channel ID here
YOUTUBE_CHANNELS = {
    "yt:coinbureau":        ("UCqK_GSMbpiV8spgD3ZGloSw", ["economics", "crypto"]),
    "yt:misesnstitute":     ("UCuSon3dVEKrSqVeQHaVW5TA", ["economics"]),
    "yt:pbsspacetime":      ("UC7_gcs09iThXybpVgjHZ_7g", ["science"]),
    "yt:tldr_news":         ("UCRm96I5kmb_iGFofE5N691w", ["politics"]),
}

def collect_youtube_transcripts(
    video_ids: list[tuple[str, str, list[str]]],  # [(video_id, channel_name, galaxy_hints)]
    max_transcript_chars: int = 3000,
) -> list[RawSignal]:
    """
    Fetches transcripts for specific YouTube videos.
    No API key required — uses youtube-transcript-api.

    Usage: pass a list of (video_id, source_label, galaxy_hints).
    You can get recent video IDs from a channel's RSS feed (see get_youtube_rss below).
    """
    try:
        from youtube_transcript_api import YouTubeTranscriptApi
    except ImportError:
        log.error("Install: pip install youtube-transcript-api")
        return []

    signals = []

    for video_id, channel_name, galaxy_hints in video_ids:
        try:
            transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
            # Join all transcript segments into one text
            full_text = " ".join(seg["text"] for seg in transcript_list)
            full_text = full_text[:max_transcript_chars]

            video_url = f"https://www.youtube.com/watch?v={video_id}"

            signals.append(RawSignal(
                id=make_id(video_url, channel_name),
                source_name=f"youtube:{channel_name}",
                source_country=None,
                source_type="social",
                title=f"[YouTube] {channel_name} — {video_id}",
                body=full_text,
                url=video_url,
                published_at=datetime.now(timezone.utc).isoformat(),
                galaxy_hints=galaxy_hints,
                raw_metadata={
                    "video_id": video_id,
                    "channel": channel_name,
                    "transcript_segments": len(transcript_list),
                }
            ))
            log.info(f"YouTube [{channel_name}]: transcript fetched ({len(full_text)} chars)")
            time.sleep(0.5)

        except Exception as e:
            log.warning(f"YouTube transcript error [{video_id}]: {e}")

    return signals


def get_youtube_channel_rss(channel_id: str) -> list[dict]:
    """
    Gets recent video IDs from a YouTube channel — no API key needed.
    YouTube exposes an RSS feed for every channel.
    """
    url = f"https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"
    try:
        feed = feedparser.parse(url)
        videos = []
        for entry in feed.entries[:5]:  # latest 5 videos
            video_id = entry.get("yt_videoid", "")
            title = entry.get("title", "")
            if video_id:
                videos.append({"id": video_id, "title": title})
        return videos
    except Exception as e:
        log.warning(f"YouTube RSS error [{channel_id}]: {e}")
        return []


# ─────────────────────────────────────────────
#  MAIN RUNNER
#  Pulls from all sources, deduplicates, saves to JSON.
#  In production this becomes a queue worker.
# ─────────────────────────────────────────────

def run_collection(config: dict) -> list[RawSignal]:
    all_signals: list[RawSignal] = []

    # 1. GDELT
    if config.get("gdelt", True):
        for theme in ["economics", "crypto", "politics", "science"]:
            all_signals += collect_gdelt(theme_key=theme, max_records=30)
            time.sleep(1)

    # 2. RSS
    if config.get("rss", True):
        all_signals += collect_rss(max_per_feed=15)

    # 3. Reddit (only if credentials provided)
    reddit_cfg = config.get("reddit", {})
    if reddit_cfg.get("client_id") and reddit_cfg.get("client_secret"):
        all_signals += collect_reddit(
            client_id=reddit_cfg["client_id"],
            client_secret=reddit_cfg["client_secret"],
            min_upvotes=100,
        )
    else:
        log.info("Reddit: skipped (no credentials in config)")

    # 4. YouTube — auto-pull latest videos from configured channels
    if config.get("youtube", True):
        video_targets = []
        for source_name, (channel_id, galaxy_hints) in YOUTUBE_CHANNELS.items():
            recent = get_youtube_channel_rss(channel_id)
            for v in recent[:2]:  # latest 2 videos per channel
                video_targets.append((v["id"], source_name, galaxy_hints))

        all_signals += collect_youtube_transcripts(video_targets)

    # Deduplicate by ID
    seen = set()
    unique_signals = []
    for s in all_signals:
        if s.id not in seen:
            seen.add(s.id)
            unique_signals.append(s)

    log.info(f"Collection complete: {len(unique_signals)} unique signals ({len(all_signals) - len(unique_signals)} dupes removed)")
    return unique_signals


def save_signals(signals: list[RawSignal], path: str = "signals.json"):
    with open(path, "w", encoding="utf-8") as f:
        json.dump([asdict(s) for s in signals], f, indent=2, ensure_ascii=False)
    log.info(f"Saved {len(signals)} signals to {path}")


# ─────────────────────────────────────────────
#  ENTRY POINT
# ─────────────────────────────────────────────

if __name__ == "__main__":
    config = {
        "gdelt": True,
        "rss": True,
        "youtube": True,
        "reddit": {
            # Paste your free Reddit app credentials here
            # Get them at: https://www.reddit.com/prefs/apps
            "client_id": "",      # ← paste here
            "client_secret": "",  # ← paste here
        }
    }

    signals = run_collection(config)
    save_signals(signals, "signals.json")

    # Print a quick summary
    from collections import Counter
    by_source_type = Counter(s.source_type for s in signals)
    by_galaxy = Counter(h for s in signals for h in s.galaxy_hints)

    print(f"\n{'─'*40}")
    print(f"  Total signals: {len(signals)}")
    print(f"  By type:  {dict(by_source_type)}")
    print(f"  By galaxy hint: {dict(by_galaxy.most_common(8))}")
    print(f"{'─'*40}\n")
    print("Output saved to signals.json — ready for Layer 2 (Verifier)")