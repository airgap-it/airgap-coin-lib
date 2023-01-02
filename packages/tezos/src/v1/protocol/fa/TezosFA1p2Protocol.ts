import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { Amount, newAmount, PublicKey } from '@airgap/module-kit'

import { TezosContractCall } from '../../contract/TezosContractCall'
import { TezosFA1p2ContractEntrypoint } from '../../types/fa/TezosFA1p2ContractEntrypoint'
import { TezosFATokenMetadata } from '../../types/fa/TezosFATokenMetadata'
import { TezosFA1p2ProtocolOptions, TezosUnits } from '../../types/protocol'
import { TezosUnsignedTransaction } from '../../types/transaction'

import { TezosFA1Protocol, TezosFA1ProtocolImpl } from './TezosFA1Protocol'

// Interface

export interface TezosFA1p2Protocol<_Units extends string = string> extends TezosFA1Protocol<_Units> {
  getTokenMetadata(): Promise<TezosFATokenMetadata | undefined>

  getAllowance(owner: string, spender: string, callbackContract?: string, source?: string): Promise<Amount<_Units>>
  approve(spender: string, amount: Amount<_Units>, fee: Amount<TezosUnits>, publicKey: PublicKey): Promise<TezosUnsignedTransaction>
}

// Implementation

export class TezosFA1p2ProtocolImpl<_Units extends string, _Entrypoints extends string = string>
  extends TezosFA1ProtocolImpl<_Units, _Entrypoints | TezosFA1p2ContractEntrypoint>
  implements TezosFA1p2Protocol<_Units> {
  public constructor(options: TezosFA1p2ProtocolOptions<_Units>) {
    super(options)
  }

  public async getTokenMetadata(): Promise<TezosFATokenMetadata | undefined> {
    return this.getTokenMetadataForTokenId(0)
  }

  public async getAllowance(
    owner: string,
    spender: string,
    callbackContract: string = this.options.network.defaultCallbackContract,
    source?: string
  ): Promise<Amount<_Units>> {
    const getAllowanceCall: TezosContractCall = await this.contract.createContractCall('getAllowance', [
      {
        owner,
        spender
      },
      callbackContract
    ])

    const allowance: string = await this.getContractCallIntResult(getAllowanceCall, this.requireSource(source, spender, 'kt'))

    return newAmount(allowance, 'blockchain')
  }

  public async approve(
    spender: string,
    amount: Amount<_Units>,
    fee: Amount<TezosUnits>,
    publicKey: PublicKey
  ): Promise<TezosUnsignedTransaction> {
    const approveCall: TezosContractCall = await this.contract.createContractCall('approve', {
      spender,
      value: new BigNumber(newAmount(amount).blockchain(this.metadata.units).value).toNumber()
    })

    return this.prepareContractCall([approveCall], fee, publicKey)
  }
}

// Factory

export function createTezosFA1p2Protocol<_Units extends string>(options: TezosFA1p2ProtocolOptions<_Units>): TezosFA1p2Protocol<_Units> {
  return new TezosFA1p2ProtocolImpl(options)
}
