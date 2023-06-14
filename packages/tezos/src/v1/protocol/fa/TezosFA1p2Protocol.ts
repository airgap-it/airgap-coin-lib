import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { Amount, newAmount, PublicKey, RecursivePartial } from '@airgap/module-kit'

import { TezosContractCall } from '../../contract/TezosContractCall'
import { TezosFA1p2ContractEntrypoint } from '../../types/fa/TezosFA1p2ContractEntrypoint'
import { TezosFATokenMetadata } from '../../types/fa/TezosFATokenMetadata'
import { TezosFA1p2ProtocolNetwork, TezosFA1p2ProtocolOptions, TezosUnits } from '../../types/protocol'
import { TezosUnsignedTransaction } from '../../types/transaction'

import {
  createTezosFA1ProtocolOptions,
  TEZOS_FA1_MAINNET_PROTOCOL_NETWORK,
  TezosFA1Protocol,
  TezosFA1ProtocolImpl
} from './TezosFA1Protocol'

// Interface

export interface TezosFA1p2Protocol<_Units extends string = string> extends TezosFA1Protocol<_Units> {
  isTezosFA1p2Protocol: true

  getTokenMetadata(): Promise<TezosFATokenMetadata | undefined>

  getAllowance(owner: string, spender: string, callbackContract?: string, source?: string): Promise<Amount<_Units>>
  approve(spender: string, amount: Amount<_Units>, fee: Amount<TezosUnits>, publicKey: PublicKey): Promise<TezosUnsignedTransaction>
}

// Implementation

export class TezosFA1p2ProtocolImpl<_Units extends string, _Entrypoints extends string = string>
  extends TezosFA1ProtocolImpl<_Units, _Entrypoints | TezosFA1p2ContractEntrypoint>
  implements TezosFA1p2Protocol<_Units>
{
  public readonly isTezosFA1p2Protocol: true = true

  public constructor(options: TezosFA1p2ProtocolOptions<_Units>) {
    super(options)
  }

  public async getTokenMetadata(): Promise<TezosFATokenMetadata | undefined> {
    return this.getTokenMetadataForTokenId(0)
  }

  public async getAllowance(
    owner: string,
    spender: string,
    callbackContract: string = this.options.network.callbackContracts.getBalance,
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

interface PartialTezosFA1p2ProtocolNetwork extends RecursivePartial<TezosFA1p2ProtocolNetwork> {
  contractAddress: TezosFA1p2ProtocolNetwork['contractAddress']
}
interface PartialTezosFA1p2ProtocolOptions<_Units extends string>
  extends RecursivePartial<Omit<TezosFA1p2ProtocolOptions<_Units>, 'units' | 'mainUnit'>> {
  network: PartialTezosFA1p2ProtocolNetwork
  identifier: TezosFA1p2ProtocolOptions<_Units>['identifier']
  units?: TezosFA1p2ProtocolOptions<_Units>['units']
  mainUnit?: TezosFA1p2ProtocolOptions<_Units>['mainUnit']
}

export function createTezosFA1p2Protocol<_Units extends string>(
  options: PartialTezosFA1p2ProtocolOptions<_Units>
): TezosFA1p2Protocol<_Units> {
  const completeOptions: TezosFA1p2ProtocolOptions<_Units> = createTezosFA1p2ProtocolOptions(
    options.network,
    options.identifier,
    options.name,
    options.units,
    options.mainUnit,
    options.feeDefaults
  )

  return new TezosFA1p2ProtocolImpl(completeOptions)
}

export const TEZOS_FA1P2_MAINNET_PROTOCOL_NETWORK: Omit<TezosFA1p2ProtocolNetwork, 'contractAddress'> = TEZOS_FA1_MAINNET_PROTOCOL_NETWORK

export function createTezosFA1p2ProtocolOptions<_Units extends string>(
  network: PartialTezosFA1p2ProtocolNetwork,
  identifier: TezosFA1p2ProtocolOptions<_Units>['identifier'],
  name?: TezosFA1p2ProtocolOptions<_Units>['name'],
  units?: TezosFA1p2ProtocolOptions<_Units>['units'],
  mainUnit?: TezosFA1p2ProtocolOptions<_Units>['mainUnit'],
  feeDefaults?: TezosFA1p2ProtocolOptions<_Units>['feeDefaults']
): TezosFA1p2ProtocolOptions<_Units> {
  return createTezosFA1ProtocolOptions(network, identifier, name, units, mainUnit, feeDefaults)
}
