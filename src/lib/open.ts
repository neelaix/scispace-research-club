/**
 * Opens an external URL. If the value is a placeholder (#TODO),
 * shows a gentle browser alert instead of navigating away.
 */
export function openExternal(url: string, fallbackMessage = "Link not yet configured — update config.ts to set the real URL.") {
  if (!url || url === "#TODO" || url.startsWith("#TODO")) {
    window.alert(fallbackMessage);
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}