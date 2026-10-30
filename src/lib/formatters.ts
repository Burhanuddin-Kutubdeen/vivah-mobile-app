/**
 * Checks if a name contains only letters (including letters with accents, spaces, hyphens, or apostrophes)
 * and strictly NO digits/numbers or special symbols (@, #, $, %, etc.).
 */
export function isValidNameString(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  const trimmed = input.trim();
  if (trimmed.length === 0) return false;
  // Must NOT contain any numbers
  if (/\d/.test(trimmed)) return false;
  // Must contain only letters, spaces, hyphens, and apostrophes
  return /^[a-zA-Z\s'-]+$/.test(trimmed);
}

/**
 * Formats a name with proper capitalization (Title Case), keeping spaces between words.
 * e.g., "john doe" -> "John Doe", "AARAV SHARMA" -> "Aarav Sharma".
 */
export function toPascalCase(input: string): string {
  if (!input || typeof input !== 'string') return '';
  // Remove numbers and unwanted special chars, keeping letters, spaces, hyphens
  const cleanInput = input.replace(/[^a-zA-Z\s'-]/g, '');
  return cleanInput
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Calculates precise age given year, month (1-12), and day (1-31).
 */
export function calculateAge(year: number, month: number, day: number): number {
  const today = new Date();
  let age = today.getFullYear() - year;
  const monthDiff = today.getMonth() - (month - 1);
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
    age--;
  }
  return age;
}

/**
 * Returns the number of days in a given month and year.
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

