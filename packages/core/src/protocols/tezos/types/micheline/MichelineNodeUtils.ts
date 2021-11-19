import { MichelsonGrammarData } from '../michelson/grammar/MichelsonGrammarData'
import { MichelsonGrammarType } from '../michelson/grammar/MichelsonGrammarType'
import { isMichelinePrimitiveApplication, isMichelineSequence } from '../utils'
import { MichelineGenericNode } from './MichelineNode'

export class MichelineNodeUtils {
  public static normalize<T extends MichelsonGrammarData | MichelsonGrammarType>(node: MichelineGenericNode<T>): MichelineGenericNode<T> {
    if (isMichelineSequence(node, false)) {
      return node.map((value) => MichelineNodeUtils.normalize(value))
    } else if (isMichelinePrimitiveApplication(node)) {
      let args: MichelineGenericNode<T>[] | undefined
      if ((node.prim === 'pair' || node.prim === 'Pair') && node.args && node.args.length > 2) {
        args = [
          MichelineNodeUtils.normalize(node.args[0]),
          MichelineNodeUtils.normalize({
            prim: node.prim,
            args: node.args.slice(1)
          })
        ]
      } else {
        args = node.args?.map((arg) => MichelineNodeUtils.normalize(arg))
      }

      return {
        prim: node.prim,
        args,
        annots: node.annots
      }
    } else {
      return node
    }
  }
}
