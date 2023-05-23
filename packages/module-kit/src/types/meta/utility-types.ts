export type Complement<T, P extends Partial<T>> = Required<Omit<T, keyof P> & P>

export type RecursivePartial<T> = {
  [K in keyof T]?: T[K] extends (infer U)[] ? RecursivePartial<U>[] : T[K] extends object ? RecursivePartial<T[K]> : T[K]
}

export type Override<T, U> = Omit<T, keyof U> & U

export type ExtractTyped<T, K extends T> = Extract<T, K>
export type ExcludeTyped<T, K extends T> = Exclude<T, K>

export type OmitTyped<T, K extends keyof T> = Omit<T, K>
