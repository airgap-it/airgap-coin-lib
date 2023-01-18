export type Complement<T, P extends Partial<T>> = Required<Omit<T, keyof P> & P>

export type RecursivePartial<T> = {
  [K in keyof T]?: T[K] extends (infer U)[] ? RecursivePartial<U>[] : T[K] extends object ? RecursivePartial<T[K]> : T[K]
}

export type Override<T, U> = Omit<T, keyof U> & U
