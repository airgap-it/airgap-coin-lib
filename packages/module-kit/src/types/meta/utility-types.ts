export type Complement<T, P extends Partial<T>> = Required<Omit<T, keyof P> & P>
