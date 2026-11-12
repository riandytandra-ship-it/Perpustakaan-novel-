/**
 * Generate a short unique ID
 */
export function generateId(prefix = 'item'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Format plain number with thousand separators
 */
export function formatNumber(value: number | string | undefined | null): string {
  if (value === undefined || value === null || value === '') return '-';
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(num)) return String(value);
  return new Intl.NumberFormat('id-ID').format(num);
}

/**
 * Format ISO date string or timestamp to readable Indonesian date
 */
export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return String(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(dateString);
  }
}
