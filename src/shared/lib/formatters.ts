/**
 * Formats a raw Uzbekistan phone number string into a more readable format.
 * @param phoneNumber The raw phone number string.
 * @returns The formatted phone number string.
 */
export function formatPhoneNumber(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/\D/g, "") // Remove non-digits

  // Expecting 12 digits: 998XXYYYZZWW
  const match = cleaned.match(/^998(\d{2})(\d{3})(\d{2})(\d{2})$/)

  if (match) {
    return `+998 ${match[1]} ${match[2]} ${match[3]} ${match[4]}`
  }

  // Return original if it doesn't match expected pattern
  return phoneNumber
}

/**
 * Formats number with thousand separators.
 * @param price The price number.
 * @returns The formatted price string.
 */
export function formatNumber(price: number): string {
  return price.toLocaleString("ru-RU")
}
