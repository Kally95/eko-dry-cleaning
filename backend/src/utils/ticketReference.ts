/**
 * Generate a unique ticket reference
 * Format: LASTNAME-NNNNN
 * Example: MEHMET-00001, SMITH-00042
 *
 * Rules:
 * - Maximum 10 characters total (flexible - can be longer if needed for clarity)
 * - Last name in uppercase (truncated if necessary)
 * - At least 5 digits
 * - If last name + hyphen + 5 digits > 10 chars, truncate last name
 */
export function generateTicketReference(lastName: string, sequenceNumber: number): string {
  // Convert last name to uppercase and remove special characters
  let namePrefix = lastName.toUpperCase().replace(/[^A-Z]/g, '');

  // Ensure we have at least 5 digits
  const paddedNumber = sequenceNumber.toString().padStart(5, '0');

  // Calculate max name length to keep total ≤ 10 chars (name + hyphen + 5 digits)
  // Total = nameLength + 1 (hyphen) + 5 (digits) ≤ 10
  // nameLength ≤ 4
  const maxNameLength = 4;

  // Truncate name if needed (but use more if name is naturally short)
  if (namePrefix.length > maxNameLength) {
    namePrefix = namePrefix.substring(0, maxNameLength);
  }

  return `${namePrefix}-${paddedNumber}`;
}

/**
 * Extract sequence number from ticket reference
 * Supports both old (EKO-YYYY-NNNNNN) and new (LASTNAME-NNNNN) formats
 */
export function extractSequenceNumber(ticketReference: string): number | null {
  // Try new format first: LASTNAME-NNNNN
  const newFormatMatch = ticketReference.match(/^[A-Z]+-(\d{5,})$/);
  if (newFormatMatch) {
    return parseInt(newFormatMatch[1], 10);
  }

  // Fall back to old format: EKO-YYYY-NNNNNN
  const oldFormatMatch = ticketReference.match(/^EKO-\d{4}-(\d{6})$/);
  if (oldFormatMatch) {
    return parseInt(oldFormatMatch[1], 10);
  }

  return null;
}
