// tslint:disable: max-classes-per-file

import { Lazy } from '../../../../data/Lazy'
import { MichelinePrimitiveApplication, MichelineTypeNode } from '../../types/micheline/MichelineNode'
import { MichelsonGrammarType } from '../../types/michelson/grammar/MichelsonGrammarType'
import { isMichelinePrimitiveApplication } from '../utils'

import { MichelsonType } from './MichelsonType'
import { MichelsonTypeUtils } from './MichelsonTypeUtils'

export enum MichelsonAnnotationPrefix {
  TYPE = ':',
  VARIABLE = '@',
  FIELD = '%'
}

export interface MichelsonTypeMetaCreateValueConfiguration {
  lazyEval?: boolean
  readAnnots?: boolean

  beforeNext?(meta: MichelsonTypeMeta, raw: unknown): void
  onNext?(meta: MichelsonTypeMeta, raw: unknown, value: MichelsonType): void
}

export class MichelsonTypeMeta {
  constructor(
    public readonly type: MichelsonGrammarType,
    public readonly parent?: MichelsonGenericTypeMeta,
    public readonly annots: string[] = []
  ) {}

  public static fromMichelineNode(node: MichelineTypeNode): MichelsonTypeMeta | undefined {
    if (!isMichelinePrimitiveApplication(node)) {
      return undefined
    }

    return this.fromMichelinePrimitiveApplication(node)
  }

  public static fromMichelinePrimitiveApplication(
    primitiveApplication: MichelinePrimitiveApplication<any>,
    parent?: MichelsonGenericTypeMeta
  ): MichelsonTypeMeta {
    return this.from(
      primitiveApplication.prim,
      primitiveApplication.annots ?? [],
      primitiveApplication.args?.filter(isMichelinePrimitiveApplication) ?? [],
      parent
    )
  }

  public static from(
    type: MichelsonGrammarType,
    annots: string[],
    args: MichelinePrimitiveApplication<any>[],
    parent?: MichelsonGenericTypeMeta
  ): MichelsonTypeMeta {
    return args.length === 0 ? new MichelsonTypeMeta(type, parent, annots) : new MichelsonGenericTypeMeta(type, args, parent, annots)
  }

  public createValue(value: unknown, configuration: MichelsonTypeMetaCreateValueConfiguration = {}): MichelsonType {
    if (value instanceof MichelsonType) {
      return value
    }

    const raw: unknown = this.getRawValue(value)

    if (configuration.beforeNext) {
      configuration.beforeNext(this, raw)
    }

    const michelsonValue: MichelsonType = this.getMichelsonValue(raw, configuration)

    if (!(configuration.lazyEval ?? true)) {
      michelsonValue.eval()
    }

    if (configuration.readAnnots ?? true) {
      const name: string | undefined = this.getAnnotation(MichelsonAnnotationPrefix.FIELD, MichelsonAnnotationPrefix.TYPE)
      if (name) {
        michelsonValue.setName(name)
      }
    }

    if (configuration.onNext) {
      configuration.onNext(this, raw, michelsonValue)
    }

    return michelsonValue
  }

  public getAnnotation(...prefixes: MichelsonAnnotationPrefix[]): string | undefined {
    for (const annot of this.annots) {
      const matchedPrefix: MichelsonAnnotationPrefix | undefined = prefixes.find((prefix: MichelsonAnnotationPrefix) =>
        annot.startsWith(prefix)
      )

      if (matchedPrefix !== undefined) {
        return annot.slice(matchedPrefix.length)
      }
    }

    return undefined
  }

  protected getMichelsonValue(raw: unknown, _configuration: MichelsonTypeMetaCreateValueConfiguration = {}): MichelsonType {
    return MichelsonTypeUtils.create(this.type, raw)
  }

  protected getRawValue(value: unknown): unknown {
    const argName: string | undefined = this.getAnnotation(MichelsonAnnotationPrefix.TYPE, MichelsonAnnotationPrefix.FIELD)

    return value instanceof Object && argName && argName in value ? value[argName] : value
  }
}

export class MichelsonGenericTypeMeta extends MichelsonTypeMeta {
  public readonly generics: Lazy<MichelsonTypeMeta>[]

  constructor(
    type: MichelsonGrammarType,
    genericTypes: MichelinePrimitiveApplication<any>[],
    parent?: MichelsonGenericTypeMeta,
    annots: string[] = []
  ) {
    super(type, parent, annots)

    this.generics = genericTypes.map((type: MichelinePrimitiveApplication<any>) => {
      return new Lazy(() => MichelsonTypeMeta.fromMichelinePrimitiveApplication(type, this))
    })
  }

  protected getMichelsonValue(raw: unknown, configuration: MichelsonTypeMetaCreateValueConfiguration = {}): MichelsonType {
    const genericFactories: ((genericValue: unknown) => MichelsonType)[] = this.generics.map((genericMeta: Lazy<MichelsonTypeMeta>) => {
      return (genericValue: unknown): MichelsonType => genericMeta.get().createValue(genericValue, configuration)
    })

    return MichelsonTypeUtils.create(this.type, raw, ...genericFactories)
  }
}
