export type Schema<T> = Record<keyof T, 'required' | 'optional'>

export function implementsInterface<T>(object: unknown, schema: Schema<T>): object is T {
  if (typeof object !== 'object' || !object) {
    return false
  }

  return Object.keys(schema).every((key: string) => schema[key as keyof Schema<T>] === 'optional' || key in object)
}
