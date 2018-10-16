const DEFAULT_MESSAGE = 'Failed type assertion'

export function assertValid<T>(
  value: T | null,
  message: string = DEFAULT_MESSAGE,
): T {
  if (value === null) {
    throw new TypeError(message)
  }

  return value
}

export function assertDefined<T>(value: T | undefined, message?: string): T {
  return assertValid(value === undefined ? null : value, message)
}
