// https://tezos.gitlab.io/whitedoc/michelson.html#full-grammar

import { assertTypes } from '../../../../utils/assert'

// tslint:disable: max-classes-per-file

export interface MichelsonTypeMap {
  nat: MichelsonNat
  int: MichelsonInt
  string: MichelsonString
  bytes: MichelsonBytes
  mutez: MichelsonMutez
  bool: MichelsonBool
  key_hash: MichelsonKeyHash
  timestamp: MichelsonTimestamp
  address: MichelsonAddress
  key: MichelsonKey
  unit: MichelsonUnit
  signature: MichelsonSignature
  option: MichelsonOption
  list: MichelsonList<any>
  set: MichelsonSet<any>
  operation: MichelsonOperation
  contract: MichelsonContract
  pair: MichelsonPair<any, any>
  or: MichelsonOr<any, any>
  lambda: MichelsonLambda
  map: MichelsonMap
  big_map: MichelsonBigMap
  chain_id: MichelsonChainID
}

export type MichelsonType = keyof MichelsonTypeMap
export type MichelsonTypeMapping = {
  [T in MichelsonType]: MichelsonTypeMap[T]
}[MichelsonType]

abstract class MichelsonBase {
  readonly annotations: string[]

  constructor(annotations?: string[]) {
    this.annotations = annotations !== undefined ? annotations : []
  }
}

class MichelsonPrimitive<T extends string | number | boolean> extends MichelsonBase {
  constructor(public value?: T, annotations?: string[]) {
    super(annotations)
  }
}

export class MichelsonNat extends MichelsonPrimitive<number> {
  public static from(annotations?: string[], args?: MichelsonTypeMapping | MichelsonTypeMapping[]): MichelsonNat {
    assertTypes('MichelsonNat#from', [], args)

    return new MichelsonNat(undefined, annotations)
  }
}

export class MichelsonInt extends MichelsonPrimitive<number> {
  public static from(annotations?: string[], args?: MichelsonTypeMapping | MichelsonTypeMapping[]): MichelsonInt {
    assertTypes('MichelsonInt#from', [], args)
    
    return new MichelsonInt(undefined, annotations)
  }
}

export class MichelsonString extends MichelsonPrimitive<string> {
  public static from(annotations?: string[], args?: MichelsonTypeMapping | MichelsonTypeMapping[]): MichelsonString {
    assertTypes('MichelsonString#from', [], args)
    
    return new MichelsonString(undefined, annotations)
  }
}

export class MichelsonBytes extends MichelsonPrimitive<string> {
  public static from(annotations?: string[], args?: MichelsonTypeMapping | MichelsonTypeMapping[]): MichelsonBytes {
    assertTypes('MichelsonBytes#from', [], args)
    
    return new MichelsonBytes(undefined, annotations)
  }
}

export class MichelsonBool extends MichelsonPrimitive<boolean>{
  public static from(annotations?: string[], args?: MichelsonTypeMapping | MichelsonTypeMapping[]): MichelsonBool {
    assertTypes('MichelsonBool#from', [], args)
    
    return new MichelsonBool(undefined, annotations)
  }
}

export class MichelsonMutez extends MichelsonBase {}
export class MichelsonKeyHash extends MichelsonBase {}
export class MichelsonTimestamp extends MichelsonBase {}
export class MichelsonAddress extends MichelsonBase {}
export class MichelsonKey extends MichelsonBase {}
export class MichelsonUnit extends MichelsonBase {}
export class MichelsonSignature extends MichelsonBase {}
export class MichelsonOption extends MichelsonBase {}

export class MichelsonList<T extends MichelsonType> extends MichelsonBase {
  public elements?: MichelsonTypeMap[T][]
}

export class MichelsonSet<T extends MichelsonType> extends MichelsonList<T> {}

export class MichelsonOperation extends MichelsonBase{}
export class MichelsonContract extends MichelsonBase {}
export class MichelsonLambda extends MichelsonBase {}
export class MichelsonMap extends MichelsonBase {}
export class MichelsonBigMap extends MichelsonBase {}
export class MichelsonChainID extends MichelsonBase {}

export class MichelsonPair<F extends MichelsonType, S extends MichelsonType> extends MichelsonBase {
  public first?: MichelsonTypeMap[F]
  public second?: MichelsonTypeMap[S]
}

export class MichelsonOr<L extends MichelsonType, R extends MichelsonType> extends MichelsonBase {
  public left?: MichelsonTypeMap[L]
  public right?: MichelsonTypeMap[R]
}