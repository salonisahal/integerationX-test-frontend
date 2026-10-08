// Reusable field validators shared across all forms in the app.
// Each returns an empty string when the value is valid, otherwise a
// human-readable error message to render under the field.

export function validateRequired(value: string, label = 'This field'): string {
  if (!value || !value.trim()) {
    return `${label} is required`
  }
  return ''
}

export function validateEmail(value: string): string {
  if (!value || !value.trim()) {
    return 'Email is required'
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(value)) {
    return 'Enter a valid email address'
  }
  return ''
}

export function validatePhone(value: string): string {
  if (!value || !value.trim()) {
    return 'Phone number is required'
  }
  const phonePattern = /^[+]?[0-9()\-\s]{7,15}$/
  if (!phonePattern.test(value)) {
    return 'Enter a valid phone number'
  }
  return ''
}

export function validatePassword(value: string): string {
  if (!value) {
    return 'Password is required'
  }
  if (value.length < 6) {
    return 'Password must be at least 6 characters'
  }
  return ''
}

export function validateDate(value: string, label = 'Date'): string {
  if (!value) {
    return `${label} is required`
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return `${label} must be a valid date`
  }
  return ''
}

export function validateNumeric(value: string | number, label = 'Value'): string {
  if (value === '' || value === null || value === undefined) {
    return `${label} is required`
  }
  if (Number.isNaN(Number(value))) {
    return `${label} must be a number`
  }
  return ''
}

export function validateMinLength(value: string, min: number, label = 'This field'): string {
  if (!value || value.trim().length < min) {
    return `${label} must be at least ${min} characters`
  }
  return ''
}
