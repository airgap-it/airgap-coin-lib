import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { Amount, Balance, newAmount, PublicKey, TransactionConfiguration, TransactionDetails } from '@airgap/module-kit'

import { TezosContractCall } from '../../contract/TezosContractCall'
import { TezosFA1ContractEntrypoint } from '../../types/fa/TezosFA1ContractEntrypoint'
import { MichelineDataNode } from '../../types/micheline/MichelineNode'
import { MichelsonAddress } from '../../types/michelson/primitives/MichelsonAddress'
import { MichelsonString } from '../../types/michelson/primitives/MichelsonString'
import { TezosFA1ProtocolNetwork, TezosFA1ProtocolOptions, TezosUnits } from '../../types/protocol'
import { TezosUnsignedTransaction } from '../../types/transaction'
import { isMichelinePrimitive } from '../../utils/micheline'
import { TezosFA1Accountant } from '../../utils/protocol/fa/TezosFA1Accountant'
import { TezosForger } from '../../utils/protocol/tezos/TezosForger'

import { TezosFAProtocol, TezosFAProtocolImpl } from './TezosFAProtocol'

// Interface

export interface TezosFA1Protocol<_Units extends string = string> extends TezosFAProtocol<_Units, TezosFA1ProtocolNetwork> {
  getBalance(address: string, source?: string, callbackContract?: string): Promise<Balance<_Units>>
  getTotalSupply(source?: string, callbackContract?: string): Promise<string>
  transfer(
    from: string,
    to: string,
    amount: Amount<_Units>,
    fee: Amount<TezosUnits>,
    publicKey: PublicKey
  ): Promise<TezosUnsignedTransaction>
  fetchTokenHolders(): Promise<{ address: string; amount: Amount<_Units> }[]>
}

// Implementation

export const FA1_MAINNET_CALLBACK_CONTRACT: string = 'KT19ptNzn4MVAN45KUUNpyL5AdLVhujk815u'

export class TezosFA1ProtocolImpl<_Units extends string, _Entrypoints extends string = string>
  extends TezosFAProtocolImpl<_Entrypoints | TezosFA1ContractEntrypoint, _Units, TezosFA1ProtocolNetwork>
  implements TezosFA1Protocol<_Units> {
  public constructor(options: TezosFA1ProtocolOptions<_Units>) {
    const forger: TezosForger = new TezosForger()
    const accountant: TezosFA1Accountant<_Units> = new TezosFA1Accountant(forger, options.network)

    super(options, accountant)
  }

  public async getBalanceOfAddress(address: string): Promise<Balance<_Units>> {
    return this.getBalance(address)
  }

  public async getBalance(
    address: string,
    source?: string,
    callbackContract: string = this.options.network.defaultCallbackContract
  ): Promise<Balance<_Units>> {
    const getBalanceCall: TezosContractCall = await this.contract.createContractCall('getBalance', [
      new MichelsonAddress(new MichelsonString(address)),
      new MichelsonAddress(new MichelsonString(callbackContract))
    ])

    const balance: string = await this.getContractCallIntResult(getBalanceCall, this.requireSource(source, address, 'kt'))

    return { total: newAmount(balance, 'blockchain') }
  }

  public async getTotalSupply(source?: string, callbackContract?: string): Promise<string> {
    const getTotalSupplyCall: TezosContractCall = await this.contract.createContractCall('getTotalSupply', [[], callbackContract])

    return this.getContractCallIntResult(getTotalSupplyCall, this.requireSource(source))
  }

  public async transfer(
    from: string,
    to: string,
    amount: Amount<_Units>,
    fee: Amount<TezosUnits>,
    publicKey: PublicKey
  ): Promise<TezosUnsignedTransaction> {
    const transferCall: TezosContractCall = await this.contract.createContractCall('transfer', {
      from,
      to,
      value: new BigNumber(newAmount(amount).blockchain(this.metadata.units).value).toNumber()
    })

    return this.prepareContractCall([transferCall], fee, publicKey)
  }

  public async fetchTokenHolders(): Promise<{ address: string; amount: Amount<_Units> }[]> {
    // there is no standard way to fetch token holders for now, every subclass needs to implement its own logic
    return []
  }

  protected async createTransferCalls(
    publicKey: PublicKey,
    details: TransactionDetails<_Units>[],
    configuration?: TransactionConfiguration<TezosUnits>
  ): Promise<TezosContractCall[]> {
    const from: string = await this.getAddressFromPublicKey(publicKey)

    const transferCalls: TezosContractCall[] = []
    for (let i: number = 0; i < details.length; i++) {
      const transferCall: TezosContractCall = await this.contract.createContractCall('transfer', {
        from,
        to: details[i].to,
        value: new BigNumber(newAmount(details[i].amount).blockchain(this.metadata.units).value).toNumber()
      })
      transferCalls.push(transferCall)
    }

    return transferCalls
  }

  protected async getContractCallIntResult(transferCall: TezosContractCall, source: string): Promise<string> {
    try {
      const operationResult: MichelineDataNode = await this.runContractCall(transferCall, source)

      if (isMichelinePrimitive('int', operationResult)) {
        return operationResult.int
      }
    } catch {}

    return '0'
  }
}

// Factory

export function createTezosFA1Protocol<_Units extends string>(options: TezosFA1ProtocolOptions<_Units>): TezosFA1Protocol<_Units> {
  return new TezosFA1ProtocolImpl(options)
}
