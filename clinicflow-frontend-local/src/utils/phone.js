export function cleanPhoneForWa(raw) {
  if (!raw) return ''
  const digits = String(raw).replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('0')) return `234${digits.slice(1)}`
  if (digits.startsWith('234')) return digits
  if (digits.startsWith('+')) return digits.replace(/[^0-9]/g, '')
  // If user entered a 10-digit local number without a leading zero (e.g. 8012345678),
  // assume it's a Nigerian number and prefix with country code 234.
  if (digits.length === 10) return `234${digits}`
  return digits
}

export function buildWaUrl(phoneRaw, message) {
  const cleaned = cleanPhoneForWa(phoneRaw)
  // Require a reasonable length for Nigerian numbers (234 + 10 digits = 13)
  if (!cleaned || cleaned.length < 11) return ''
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`
}
