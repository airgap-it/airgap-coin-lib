import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import {
  Amount,
  Balance,
  newAmount,
  PublicKey,
  RecursivePartial,
  TransactionFullConfiguration,
  TransactionDetails
} from '@airgap/module-kit'

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

import { TEZOS_FA_MAINNET_PROTOCOL_NETWORK, TezosFAProtocol, TezosFAProtocolImpl, createTezosFAProtocolOptions } from './TezosFAProtocol'

// Interface

export interface TezosFA1Protocol<_Units extends string = string> extends TezosFAProtocol<_Units, TezosFA1ProtocolNetwork> {
  isTezosFA1Protocol: true

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

export class TezosFA1ProtocolImpl<_Units extends string, _Entrypoints extends string = string>
  extends TezosFAProtocolImpl<_Entrypoints | TezosFA1ContractEntrypoint, _Units, TezosFA1ProtocolNetwork>
  implements TezosFA1Protocol<_Units>
{
  public readonly isTezosFA1Protocol: true = true

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
    callbackContract: string = this.options.network.callbackContracts.getBalance
  ): Promise<Balance<_Units>> {
    const getBalanceCall: TezosContractCall = await this.contract.createContractCall('getBalance', [
      new MichelsonAddress(new MichelsonString(address)),
      new MichelsonAddress(new MichelsonString(callbackContract))
    ])

    const balance: string = await this.getContractCallIntResult(getBalanceCall, this.requireSource(source, address, 'kt'))

    return { total: newAmount(balance, 'blockchain') }
  }

  public async getTotalSupply(
    source?: string,
    callbackContract: string = this.options.network.callbackContracts.getTotalSupply
  ): Promise<string> {
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
    configuration?: TransactionFullConfiguration<TezosUnits>
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

interface PartialTezosFA1ProtocolNetwork extends RecursivePartial<TezosFA1ProtocolNetwork> {
  contractAddress: TezosFA1ProtocolNetwork['contractAddress']
}
interface PartialTezosFA1ProtocolOptions<_Units extends string>
  extends RecursivePartial<Omit<TezosFA1ProtocolOptions<_Units>, 'units' | 'mainUnit'>> {
  network: PartialTezosFA1ProtocolNetwork
  identifier: TezosFA1ProtocolOptions<_Units>['identifier']
  units?: TezosFA1ProtocolOptions<_Units>['units']
  mainUnit?: TezosFA1ProtocolOptions<_Units>['mainUnit']
}

export function createTezosFA1Protocol<_Units extends string>(options: PartialTezosFA1ProtocolOptions<_Units>): TezosFA1Protocol<_Units> {
  const completeOptions: TezosFA1ProtocolOptions<_Units> = createTezosFA1ProtocolOptions(
    options.network,
    options.identifier,
    options.name,
    options.units,
    options.mainUnit,
    options.feeDefaults
  )

  return new TezosFA1ProtocolImpl(completeOptions)
}

export const TEZOS_FA1_MAINNET_PROTOCOL_NETWORK: Omit<TezosFA1ProtocolNetwork, 'contractAddress'> = {
  ...TEZOS_FA_MAINNET_PROTOCOL_NETWORK,
  callbackContracts: {
    getBalance: 'KT19ptNzn4MVAN45KUUNpyL5AdLVhujk815u',
    getTotalSupply: 'KT19ptNzn4MVAN45KUUNpyL5AdLVhujk815u'
  }
}

const DEFAULT_TEZOS_FA1_PROTOCOL_NETWORK: Omit<TezosFA1ProtocolNetwork, 'contractAddress'> = TEZOS_FA1_MAINNET_PROTOCOL_NETWORK

export function createTezosFA1ProtocolOptions<_Units extends string>(
  network: PartialTezosFA1ProtocolNetwork,
  identifier: TezosFA1ProtocolOptions<_Units>['identifier'],
  name?: TezosFA1ProtocolOptions<_Units>['name'],
  units?: TezosFA1ProtocolOptions<_Units>['units'],
  mainUnit?: TezosFA1ProtocolOptions<_Units>['mainUnit'],
  feeDefaults?: TezosFA1ProtocolOptions<_Units>['feeDefaults']
): TezosFA1ProtocolOptions<_Units> {
  const completeNetwork: TezosFA1ProtocolNetwork = {
    ...DEFAULT_TEZOS_FA1_PROTOCOL_NETWORK,
    ...network,
    callbackContracts: {
      ...DEFAULT_TEZOS_FA1_PROTOCOL_NETWORK.callbackContracts,
      ...network.callbackContracts
    }
  }

  return createTezosFAProtocolOptions(completeNetwork, identifier, name, units, mainUnit, feeDefaults)
}
