/**
 * Validates UK phone numbers
 * - Must start with 0
 * - Must be 10-11 digits (no spaces allowed)
 * - Examples: 07123456789, 02071234567
 */
export const validateUKPhone = (phone: string): { valid: boolean; error?: string } => {
  // Remove any whitespace to check the actual value
  const trimmed = phone.trim();

  if (!trimmed) {
    return { valid: false, error: 'Phone number is required' };
  }

  // Check for spaces in the number
  if (/\s/.test(trimmed)) {
    return { valid: false, error: 'Phone number must not contain spaces' };
  }

  // Check if it contains only digits
  if (!/^\d+$/.test(trimmed)) {
    return { valid: false, error: 'Phone number must contain only digits' };
  }

  // Check if it starts with 0
  if (!trimmed.startsWith('0')) {
    return { valid: false, error: 'UK phone number must start with 0' };
  }

  // Check length (10-11 digits)
  if (trimmed.length < 10 || trimmed.length > 11) {
    return { valid: false, error: 'UK phone number must be 10-11 digits' };
  }

  return { valid: true };
};

/**
 * Validates email addresses
 * - Must contain @
 * - Must have valid domain
 * - Must not contain invalid characters
 */
export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  const trimmed = email.trim();

  if (!trimmed) {
    return { valid: false, error: 'Email is required' };
  }

  // More comprehensive email validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  // Check for common mistakes
  if (!trimmed.includes('@')) {
    return { valid: false, error: 'Email must contain @' };
  }

  if (!trimmed.includes('.')) {
    return { valid: false, error: 'Email must contain a domain (e.g., .com, .co.uk)' };
  }

  return { valid: true };
};
