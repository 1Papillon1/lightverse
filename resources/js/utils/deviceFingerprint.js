export function getDeviceFingerprint() {
  const nav = window.navigator;
  const screenInfo = `${window.screen.width}x${window.screen.height}x${window.devicePixelRatio}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown';
  const raw = [
    nav.userAgent,
    nav.platform,
    nav.language,
    screenInfo,
    timezone
  ].join('||');

  // simple hash (FNV-1a or simple djb2) — we use a quick djb2-like
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) + hash) + raw.charCodeAt(i);
    hash = hash & hash; // keep 32-bit
  }
  return 'dv_' + Math.abs(hash);
}
