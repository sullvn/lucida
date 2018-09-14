export function assertValid<T>(value: T | null, message: string): T {
  if (value === null) {
    throw new Error(message)
  }

  return value
}
