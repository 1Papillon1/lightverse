// resources/js/components/signal/SignalCard.jsx
const sourceColors = {
  'rss:bbc_world':      '#bb1919',
  'rss:aljazeera':      '#c8a000',
  'rss:ft':             '#ff6600',
  'rss:reuters_world':  '#ff8000',
  'rss:ecb':            '#003399',
  'rss:fed':            '#285a36',
  'rss:cointelegraph':  '#2d9cdb',
  'rss:decrypt':        '#6c5ce7',
  'rss:nature':         '#007eb5',
  'rss:arxiv_cs':       '#b31b1b',
};

const countryFlags = {
  GB: '🇬🇧', US: '🇺🇸', QA: '🇶🇦',
  EU: '🇪🇺', INT: '🌐',
};

// Add these helpers at the top of SignalCard.jsx

const CORROBORATION_CONFIG = {
  'high':          { label: 'High corroboration', color: '#00ff88', icon: '◈◈◈' },
  'moderate':      { label: 'Moderate',            color: '#ffcc00', icon: '◈◈◇' },
  'low':           { label: 'Low',                 color: '#ff8800', icon: '◈◇◇' },
  'single-source': { label: 'Single source',       color: '#ff4444', icon: '◈◇◇' },
};

const BIAS_COLORS = {
  'centre':       '#aaaaaa',
  'centre-left':  '#6699ff',
  'centre-right': '#ff9944',
  'left':         '#4477ff',
  'right':        '#ff5544',
  'state':        '#cc88ff',
  'unknown':      '#555555',
};

const formatSource = (name) => {
  return name.replace('rss:', '').replace('reddit:', 'r/').replace('youtube:', 'YT: ');
};

const formatDate = (dateStr) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { 
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
    });
  } catch {
    return dateStr;
  }
};

const SignalCard = ({ signal, compact = false }) => {
  const color  = sourceColors[signal.source_name] ?? '#666';
  const flag   = countryFlags[signal.source_country] ?? '🌐';
  const corr   = signal.corroboration;
  const bias   = signal.source_bias;
  const corrConfig = corr ? CORROBORATION_CONFIG[corr.label] ?? CORROBORATION_CONFIG['single-source'] : null;

  return (
    <a
      href={signal.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`signal-card ${compact ? 'signal-card--compact' : ''}`}
      style={{ '--source-color': color }}
    >
      <div className="signal-card__bar" />
      <div className="signal-card__content">

        {/* Meta row */}
        <div className="signal-card__meta">
          <span className="signal-card__source">
            {flag} {formatSource(signal.source_name)}
          </span>
          <span className="signal-card__date">
            {formatDate(signal.published_at)}
          </span>
        </div>

        {/* Title */}
        <p className="signal-card__title">{signal.title}</p>

        {/* Body */}
        {!compact && signal.body && (
          <p className="signal-card__body">{signal.body}</p>
        )}

        {/* Bottom row — bias + corroboration + hints */}
        {!compact && (
          <div className="signal-card__footer">

            {/* Source bias */}
            {bias && bias.bias !== 'unknown' && (
              <span
                className="signal-card__bias"
                style={{ color: BIAS_COLORS[bias.bias] ?? '#888' }}
                title={bias.note}
              >
                {bias.bias}
              </span>
            )}

            {/* Corroboration */}
            {corrConfig && (
              <span
                className="signal-card__corr"
                style={{ color: corrConfig.color }}
                title={`${corr.unique_orgs} org(s) · ${corr.unique_countries} country(s)`}
              >
                {corrConfig.icon} {corrConfig.label}
              </span>
            )}

            {/* Galaxy hints */}
            <div className="signal-card__hints">
              {signal.galaxy_hints.map(hint => (
                <span key={hint} className="signal-card__hint">{hint}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </a>
  );
};

export default SignalCard;