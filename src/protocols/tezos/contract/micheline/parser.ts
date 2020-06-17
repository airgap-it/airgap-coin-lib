import { MichelineNode, MichelineContract, MichelineContractNode } from './types'
import { isMichelinePrimitive, isMichelinePrimitiveApplication, isMichelineSequence } from './utils'
import { MichelsonTypeMapping, MichelsonInt, MichelsonString, MichelsonBytes } from '../michelson/types'
import { bytesToHex } from '../../../../utils/hex'
import { ITezosContractCode, TezosContractCode } from '../TezosContractCode'
import { createMichelsonMapping } from '../michelson/factories'

function parseNode(node?: MichelineNode): MichelsonTypeMapping | MichelsonTypeMapping[] {
  if (isMichelinePrimitive('int', node)) {
    return new MichelsonInt(parseInt(node.int, 10))
  } else if (isMichelinePrimitive('string', node)) {
    return new MichelsonString(node.string)
  } else if (isMichelinePrimitive('bytes', node)) {
    return new MichelsonBytes(bytesToHex(node.bytes, { withPrefix: true }))
  } else if (isMichelinePrimitiveApplication(node)) {
    const parsedArgs: MichelsonTypeMapping | MichelsonTypeMapping[] = parseNode(node.args)

    return createMichelsonMapping(node.prim, node.annots, parsedArgs)
  } else if (isMichelineSequence(node, false)) {
    return node
      .map(parseNode)
      .reduce((flatten: MichelsonTypeMapping[], toFlatten: MichelsonTypeMapping | MichelsonTypeMapping[]) => flatten.concat(toFlatten), [])
  } else {
    return []
  }
}

export function parseContractCode(code: MichelineContract): ITezosContractCode {
  const parsed: Partial<Record<keyof ITezosContractCode, MichelsonTypeMapping | MichelsonTypeMapping[]>> = {}
  code.forEach((node: MichelineContractNode) => {
    parsed[node.prim] = parseNode(node.args)
  })

  return new TezosContractCode(parsed.parameter, parsed.storage)
}