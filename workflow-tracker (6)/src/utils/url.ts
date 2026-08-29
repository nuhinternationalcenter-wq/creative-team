/**
 * Safely formats external URLs so they always start with http:// or https://
 * Prevents relative URL navigation in SPA that causes blank screens and data loss.
 */
export function formatExternalUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function openExternalUrl(url: string, e?: { preventDefault?: () => void; stopPropagation?: () => void }): void {
  if (e) {
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
  }
  const formatted = formatExternalUrl(url);
  if (formatted) {
    window.open(formatted, '_blank', 'noopener,noreferrer');
  }
}
