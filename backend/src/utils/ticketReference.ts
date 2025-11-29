/**
 * Generate a unique ticket reference
 * Format: EKO-YYYY-NNNNNN
 * Example: EKO-2024-000123
 */
export function generateTicketReference(sequenceNumber: number): string {
  const year = new Date().getFullYear();
  const paddedNumber = sequenceNumber.toString().padStart(6, '0');
  return `EKO-${year}-${paddedNumber}`;
}

/**
 * Extract sequence number from ticket reference
 */
export function extractSequenceNumber(ticketReference: string): number | null {
  const match = ticketReference.match(/^EKO-\d{4}-(\d{6})$/);
  return match ? parseInt(match[1], 10) : null;
}
