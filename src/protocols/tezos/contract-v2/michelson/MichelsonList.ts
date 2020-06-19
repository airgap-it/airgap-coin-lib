import { MichelsonTypeMapping, MichelsonType, michelsonTypeMappings } from './MichelsonType'
import { MichelineNode } from '../micheline/MichelineNode'

export class MichelsonList extends MichelsonTypeMapping {
  public static from(...args: any[]): MichelsonList {
    if (args.length === 0 || !(args[0] in michelsonTypeMappings)) {
      throw new Error('MichelsonList: expected MichelsonType, any[]')
    }

    const type: MichelsonType = args[0]
    const list = args.length === 1 && Array.isArray(args[0]) ? args[0] : args

    const typeMapper = michelsonTypeMappings[type] as (...args: any[]) => MichelsonTypeMapping
    
    const elements: MichelsonTypeMapping[] = list.map(typeMapper)

    return new MichelsonList(elements)
  }

  constructor(readonly elements: MichelsonTypeMapping[]) {
    super()
  }

  public toMichelineJSON(): MichelineNode {
    return {
      prim: 'list',
      args: this.elements.map((element: MichelsonTypeMapping) => element.toMichelineJSON())
    }
  }
}