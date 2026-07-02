/**
 * Formats a numeric value into US dollar currency format (e.g., $17,900)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formats a numeric value into US mileage format (e.g., 68,000 mi)
 */
export function formatMileage(value: number): string {
  return `${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(value)} mi`;
}

/**
 * Masks a vehicle's VIN to show only the last 6 characters for privacy
 * on inventory cards (e.g., 1HGCR2F80GA123456 -> ...A123456)
 */
export function maskVin(vin: string): string {
  if (!vin) return '';
  if (vin.length <= 6) return vin;
  const visible = vin.slice(-6);
  return `...${visible}`;
}
