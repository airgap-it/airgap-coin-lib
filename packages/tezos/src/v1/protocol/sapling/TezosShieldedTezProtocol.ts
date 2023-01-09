import { Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { PropertyUndefinedError } from '@airgap/coinlib-core/errors'
import { isHex } from '@airgap/coinlib-core/utils/hex'
import { ProtocolMetadata, RecursivePartial } from '@airgap/module-kit'

import { TezosContractCall } from '../../contract/TezosContractCall'
import { createTezosIndexerClient } from '../../indexer/factory'
import { TezosIndexerClient } from '../../indexer/TezosIndexerClient'
import { MichelsonList } from '../../types/michelson/generics/MichelsonList'
import { MichelsonBytes } from '../../types/michelson/primitives/MichelsonBytes'
import { TezosTransactionParameters } from '../../types/operations/kinds/Transaction'
import { TezosSaplingProtocolNetwork, TezosShieldedTezProtocolOptions, TezosUnits } from '../../types/protocol'
import { TezosSaplingExternalMethodProvider } from '../../types/sapling/TezosSaplingExternalMethodProvider'
import { TEZOS_GHOSTNET_PROTOCOL_NETWORK, TEZOS_MAINNET_PROTOCOL_NETWORK, TEZOS_UNITS } from '../TezosProtocol'

import { TezosSaplingProtocol, TezosSaplingProtocolImpl } from './TezosSaplingProtocol'

// Interface

export interface TezosShieldedTezProtocol extends TezosSaplingProtocol<TezosUnits> {}

// Implementation

const SHIELDED_TEZ_METADATA: ProtocolMetadata<TezosUnits> = {
  identifier: MainProtocolSymbols.XTZ_SHIELDED,
  name: 'Shielded Tez',

  units: TEZOS_UNITS,
  mainUnit: 'tez'
}

const TYPE_HASH: string = '1724054251'
const CODE_HASH: string = '522589455'

export class TezosShieldedTezProtocolImpl extends TezosSaplingProtocolImpl<TezosUnits> implements TezosShieldedTezProtocol {
  private readonly indexerClient: TezosIndexerClient

  public constructor(options: RecursivePartial<TezosShieldedTezProtocolOptions>) {
    const completeOptions: TezosShieldedTezProtocolOptions = createTezosShieldedTezProtocolOptions(options.network)
    super({
      ...completeOptions,
      metadata: SHIELDED_TEZ_METADATA
    })

    this.indexerClient = createTezosIndexerClient(this.network.indexer)
  }

  public async isContractValid(address: string): Promise<boolean> {
    if (!address.startsWith('KT1')) {
      return false
    }

    try {
      const { typeHash, codeHash } = await this.indexerClient.getContractCodeHash(address)

      return typeHash === TYPE_HASH && codeHash === CODE_HASH
    } catch (error) {
      return false
    }
  }

  public async prepareContractCalls(transactions: string[]): Promise<TezosContractCall[]> {
    if (this.contract === undefined) {
      throw new PropertyUndefinedError(Domain.TEZOS, 'Contract address not set.')
    }

    const balances: BigNumber[] = transactions.map((transaction: string) => {
      const signedBuffer = Buffer.isBuffer(transaction) ? transaction : isHex(transaction) ? Buffer.from(transaction, 'hex') : undefined

      return signedBuffer ? this.encoder.decodeBalanceFromTransaction(signedBuffer) : new BigNumber(0)
    })

    const callAmount: BigNumber = balances.reduce(
      (sum: BigNumber, next: BigNumber) => (next.isNegative() ? sum.plus(next.negated()) : sum),
      new BigNumber(0)
    )

    const contractCall: TezosContractCall = await this.contract.createContractCall('default', transactions, callAmount)

    return [contractCall]
  }

  public async parseParameters(parameters: TezosTransactionParameters): Promise<string[]> {
    if (parameters.entrypoint === 'default') {
      try {
        const callArgumentsList = MichelsonList.from(parameters.value, (bytesJSON: unknown) =>
          MichelsonBytes.from(bytesJSON, 'tx')
        ).asRawValue()

        return Array.isArray(callArgumentsList) ? callArgumentsList.map((args) => args.tx) : []
      } catch (error) {
        console.error(error)
        return []
      }
    }

    return []
  }
}

// Factory

export function createTezosShieldedTezProtocol(options: RecursivePartial<TezosShieldedTezProtocolOptions> = {}): TezosShieldedTezProtocol {
  return new TezosShieldedTezProtocolImpl(options)
}

export const SHIELDED_TEZ_MAINNET_PROTOCOL_NETWORK: TezosSaplingProtocolNetwork = TEZOS_MAINNET_PROTOCOL_NETWORK

export const SHIELDED_TEZ_GHOSTNET_PROTOCOL_NETWORK: TezosSaplingProtocolNetwork = TEZOS_GHOSTNET_PROTOCOL_NETWORK

const DEFAULT_SHIELDED_TEZ_PROTOCOL_NETWORK: TezosSaplingProtocolNetwork = SHIELDED_TEZ_MAINNET_PROTOCOL_NETWORK

const DEFAULT_MEMO_SIZE: number = 8
const DEFAULT_MERKLE_TREE_HEIGHT: number = 32

export function createTezosShieldedTezProtocolOptions(
  network: RecursivePartial<TezosSaplingProtocolNetwork> = {},
  memoSize?: number,
  merkleTreeHeight?: number,
  externalProvider?: TezosSaplingExternalMethodProvider
): TezosShieldedTezProtocolOptions {
  return {
    network: {
      ...DEFAULT_SHIELDED_TEZ_PROTOCOL_NETWORK,
      ...network,
      blockExplorer: {
        ...DEFAULT_SHIELDED_TEZ_PROTOCOL_NETWORK.blockExplorer,
        ...network.blockExplorer
      },
      indexer: {
        ...DEFAULT_SHIELDED_TEZ_PROTOCOL_NETWORK.indexer,
        ...network.indexer
      }
    },
    memoSize: memoSize ?? DEFAULT_MEMO_SIZE,
    merkleTreeHeight: merkleTreeHeight ?? DEFAULT_MERKLE_TREE_HEIGHT,
    externalProvider
  }
}
