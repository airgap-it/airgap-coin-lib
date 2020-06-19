import { MichelsonTypeMapping } from './MichelsonType'
import { hexToBytes } from '../../../../utils/hex'
import { MichelineNode } from '../micheline/MichelineNode'

export class MichelsonBytes extends MichelsonTypeMapping {
  public static from(...args: any[]): MichelsonBytes {
    if (args.length !== 1 || typeof args[0] !== 'string' || Buffer.isBuffer(args[0])) {
      throw new Error('MichelsonBytes: expected string or Buffer')
    }

    return new MichelsonBytes(hexToBytes(args[0]))
  }

  constructor(readonly value: Buffer) {
    super()
  }

  public toMichelineJSON(): MichelineNode {
    return {
      bytes: this.value.toString('hex')
    }
  }

}