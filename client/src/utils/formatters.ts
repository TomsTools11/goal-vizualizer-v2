/**
 * Numeric parsing and formatting utilities
 */

/**
 * Parse a numeric value from a string or number
 * Handles currency strings ($1,234.56), percentages (12.5%), and plain numbers
 */
export function parseNumeric(value: unknown): number {
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value;
  }
  
  if (typeof value === 'string') {
    // Remove common non-numeric characters (currency symbols, commas, spaces, %)
    const cleaned = value
      .trim()
      .replace(/[\$,\s%]/g, '');
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  return 0;
}

/**
 * Format a number as currency (USD)
 */
export function formatCurrency(value: number, options?: { decimals?: number }): string {
  const decimals = options?.decimals ?? 2;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a number as a percentage
 */
export function formatPercentage(value: number, options?: { decimals?: number }): string {
  const decimals = options?.decimals ?? 1;
  
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

/**
 * Format a number with thousands separators
 */
export function formatNumber(value: number, options?: { decimals?: number }): string {
  const decimals = options?.decimals ?? 0;
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a number as a multiplier (e.g., 2.5x)
 */
export function formatMultiplier(value: number, options?: { decimals?: number }): string {
  const decimals = options?.decimals ?? 1;
  return `${value.toFixed(decimals)}x`;
}

/**
 * Format a metric value based on its format type
 */
export function formatMetricValue(
  value: number,
  format: 'currency' | 'percentage' | 'number' | 'multiplier',
  options?: { decimals?: number }
): string {
  switch (format) {
    case 'currency':
      return formatCurrency(value, options);
    case 'percentage':
      return formatPercentage(value, options);
    case 'number':
      return formatNumber(value, options);
    case 'multiplier':
      return formatMultiplier(value, options);
    default:
      return String(value);
  }
}

/**
 * Calculate "x better" comparison
 * Returns a multiplier (e.g., 2.1 means "2.1x better")
 */
export function calculateComparison(value: number, baseline: number, lowerIsBetter = false): number {
  if (baseline === 0) return 0;
  
  if (lowerIsBetter) {
    // For cost metrics, lower is better, so we invert the ratio
    return baseline / value;
  } else {
    // For conversion/rate metrics, higher is better
    return value / baseline;
  }
}

/**
 * Format a comparison as "Nx better" or "Nx worse"
 */
export function formatComparison(
  value: number,
  baseline: number,
  lowerIsBetter = false,
  options?: { showDirection?: boolean }
): string {
  const multiplier = calculateComparison(value, baseline, lowerIsBetter);
  
  if (multiplier === 0 || !isFinite(multiplier)) {
    return 'N/A';
  }
  
  const showDirection = options?.showDirection ?? true;
  
  if (multiplier >= 1) {
    return showDirection 
      ? `${multiplier.toFixed(1)}x better`
      : `${multiplier.toFixed(1)}x`;
  } else {
    const inverse = 1 / multiplier;
    return showDirection
      ? `${inverse.toFixed(1)}x worse`
      : `${inverse.toFixed(1)}x`;
  }
}

/**
 * Safe division (returns 0 if divisor is 0)
 */
export function safeDivide(numerator: number, denominator: number): number {
  if (denominator === 0 || !isFinite(denominator)) {
    return 0;
  }
  const result = numerator / denominator;
  return isFinite(result) ? result : 0;
}

/**
 * Calculate percentage (returns value as percentage, not decimal)
 */
export function calculatePercentage(numerator: number, denominator: number): number {
  return safeDivide(numerator, denominator) * 100;
}

/**
 * Round to specified decimal places
 */
export function roundTo(value: number, decimals: number): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
