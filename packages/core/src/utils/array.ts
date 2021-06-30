export function shuffledArray<T>(array: T[]): T[] {
  const shuffled: T[] = new Array(array.length)

  for (let i = array.length - 1; i > 0; i--) {
    const j: number = Math.floor(Math.random() * (i + 1))
    shuffled[i] = array[j]
    shuffled[j] = array[i]
  }

  return shuffled
}

export function chunkedArray<T>(array: T[], chunkSize: number): (T | undefined)[][] {
  const chunkSizeInverse: number = 1 / chunkSize
  const chunks: (T | undefined)[][] = new Array(Math.ceil(array.length * chunkSizeInverse))

  for (let i = 0; i < array.length; i += chunkSize) {
    chunks[Math.floor(i * chunkSizeInverse)] = array.slice(i, i + chunkSize)
  }

  return chunks
}

export function flattenArray<T>(array: T[][]): T[] {
  return array.reduce((flatten: T[], next: T[]) => flatten.concat(next), [])
}

export function zippedArrays<T, R>(a1: T[], a2: R[]): [T, R][] {
  const length: number = Math.min(a1.length, a2.length)
  const zipped: [T, R][] = new Array(length)

  for (let i = 0; i < length; i++) {
    zipped[i] = [a1[i], a2[i]]
  }

  return zipped
}
