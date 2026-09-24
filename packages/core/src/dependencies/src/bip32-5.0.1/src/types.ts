// Minimal inline replacement for the valibot subset used below (see deps.json patch
// note). valibot's TS-5-only source cannot be vendored under this repo's TS 4.8; this
// shim reproduces parse/throw-on-invalid semantics for exactly these combinators.
type Schema<T> = (input: unknown) => T;
export type InferOutput<S> = S extends Schema<infer T> ? T : never;
function fail(msg: string): never {
  throw new TypeError('Invalid input: ' + msg);
}
export const v = {
  number(): Schema<number> {
    return (x) => (typeof x === 'number' && !Number.isNaN(x) ? x : fail('expected number'));
  },
  integer(): (x: number) => number {
    return (x) => (Number.isInteger(x) ? x : fail('expected integer'));
  },
  minValue(min: number): (x: number) => number {
    return (x) => (x >= min ? x : fail('expected >= ' + min));
  },
  maxValue(max: number): (x: number) => number {
    return (x) => (x <= max ? x : fail('expected <= ' + max));
  },
  string(): Schema<string> {
    return (x) => (typeof x === 'string' ? x : fail('expected string'));
  },
  regex(re: RegExp): (x: string) => string {
    return (x) => (re.test(x) ? x : fail('expected pattern ' + re));
  },
  length(n: number): (x: { length: number }) => any {
    return (x) => (x.length === n ? x : fail('expected length ' + n));
  },
  instance<C extends new (...args: any[]) => any>(ctor: C): Schema<InstanceType<C>> {
    return (x) => (x instanceof ctor ? (x as InstanceType<C>) : fail('expected ' + ctor.name));
  },
  object<S extends { [key: string]: Schema<any> }>(shape: S): Schema<{ [K in keyof S]: InferOutput<S[K]> }> {
    return (x) => {
      if (typeof x !== 'object' || x === null) fail('expected object');
      const out: any = {};
      for (const key of Object.keys(shape)) {
        out[key] = shape[key]((x as any)[key]);
      }
      return out;
    };
  },
  pipe<T>(first: Schema<T>, ...rest: Array<(x: T) => T>): Schema<T> {
    return (x) => rest.reduce((acc, fn) => fn(acc), first(x));
  },
  parse<T>(schema: Schema<T>, input: unknown): T {
    return schema(input);
  },
};

export const Uint32Schema = v.pipe(
  v.number(),
  v.integer(),
  v.minValue(0),
  v.maxValue(0xffffffff),
);

export const Uint31Schema = v.pipe(
  v.number(),
  v.integer(),
  v.minValue(0),
  v.maxValue(0x7fffffff),
);

const Uint8Schema = v.pipe(
  v.number(),
  v.integer(),
  v.minValue(0),
  v.maxValue(0xff),
);

export const Buffer256Bit = v.pipe(
  v.instance(Uint8Array),
  v.length(32),
);

export const Buffer33Bytes = v.pipe(
  v.instance(Uint8Array),
  v.length(33),
);

export const NetworkSchema = v.object({
  wif: Uint8Schema,
  bip32: v.object({
    public: Uint32Schema,
    private: Uint32Schema,
  }),
});

export const Bip32PathSchema = v.pipe(
  v.string(),
  v.regex(/^(m\/)?(\d+'?\/)*\d+'?$/),
);

export type Network = InferOutput<typeof NetworkSchema>;
