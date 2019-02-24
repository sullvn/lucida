import { zip } from 'wu'

/**
 * equalObjects by shallow comparison
 *
 * @param a any object
 * @param b any object
 */
export function equalObjects(a: any, b: any): boolean {
  const bothEntries = zip(Object.entries(a), Object.entries(b))

  for (const [[ak, av], [bk, bv]] of bothEntries) {
    if (ak !== bk || av !== bv) {
      return false
    }
  }

  return true
}
