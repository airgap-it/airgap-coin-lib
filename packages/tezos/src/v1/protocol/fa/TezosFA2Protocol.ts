import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import {
  AirGapInterface,
  Amount,
  Balance,
  MultiTokenBalanceConfiguration,
  newAmount,
  PublicKey,
  RecursivePartial,
  TransactionFullConfiguration,
  TransactionDetails,
  AirGapTransactionsWithCursor,
  AirGapTransaction
} from '@airgap/module-kit'

import { TezosContractCall } from '../../contract/TezosContractCall'
import { BigMap } from '../../types/contract/bigmap/BigMap'
import { TezosFA2BalanceOfRequest } from '../../types/fa/TezosFA2BalanceOfRequest'
import { TezosFA2BalanceOfResponse } from '../../types/fa/TezosFA2BalanceOfResponse'
import { TezosFA2ContractEntrypoint } from '../../types/fa/TezosFA2ContractEntrypoint'
import { TezosFA2TransferRequest } from '../../types/fa/TezosFA2TransferRequest'
import { TezosFA2UpdateOperatorRequest } from '../../types/fa/TezosFA2UpdateOperatorRequest'
import { TezosFATokenMetadata } from '../../types/fa/TezosFATokenMetadata'
import { MichelineDataNode } from '../../types/micheline/MichelineNode'
import { MichelsonPair } from '../../types/michelson/generics/MichelsonPair'
import { MichelsonAddress } from '../../types/michelson/primitives/MichelsonAddress'
import { MichelsonInt } from '../../types/michelson/primitives/MichelsonInt'
import { MichelsonString } from '../../types/michelson/primitives/MichelsonString'
import { TezosFA2ProtocolNetwork, TezosFA2ProtocolOptions, TezosUnits } from '../../types/protocol'
import { TezosTransactionCursor, TezosUnsignedTransaction } from '../../types/transaction'
import { isMichelinePrimitive, isMichelinePrimitiveApplication, isMichelineSequence } from '../../utils/micheline'
import { parseAddress } from '../../utils/pack'
import { TezosFA2Accountant } from '../../utils/protocol/fa/TezosFA2Accountant'
import { TezosForger } from '../../utils/protocol/tezos/TezosForger'

import { createTezosFAProtocolOptions, TEZOS_FA_MAINNET_PROTOCOL_NETWORK, TezosFAProtocol, TezosFAProtocolImpl } from './TezosFAProtocol'

// Interface

export interface TezosFA2Protocol<_Units extends string = string>
  extends AirGapInterface<TezosFAProtocol<_Units, TezosFA2ProtocolNetwork>, 'MultiTokenSubProtocol'> {
  isTezosFA2Protocol: true

  getTokenId(): Promise<number | undefined>

  getTokenMetadata(tokenID?: number): Promise<TezosFATokenMetadata | undefined>

  balanceOf(balanceRequests: TezosFA2BalanceOfRequest[], source?: string, callbackContract?: string): Promise<TezosFA2BalanceOfResponse[]>
  transfer(transferRequests: TezosFA2TransferRequest[], fee: Amount<TezosUnits>, publicKey: PublicKey): Promise<TezosUnsignedTransaction>
  updateOperators(
    updateRequests: TezosFA2UpdateOperatorRequest[],
    fee: Amount<TezosUnits>,
    publicKey: PublicKey
  ): Promise<TezosUnsignedTransaction>

  getTotalSupply(tokenId?: number): Promise<string>

  fetchTokenHolders(tokenId?: number): Promise<{ address: string; amount: Amount<_Units> }[]>
}

// Implementation

export class TezosFA2ProtocolImpl<_Units extends string, _Entrypoints extends string = string>
  extends TezosFAProtocolImpl<_Entrypoints | TezosFA2ContractEntrypoint, _Units, TezosFA2ProtocolNetwork>
  implements TezosFA2Protocol<_Units>
{
  public isTezosFA2Protocol: true = true

  protected readonly tokenId?: number

  public constructor(options: TezosFA2ProtocolOptions<_Units>) {
    const forger: TezosForger = new TezosForger()
    const accountant: TezosFA2Accountant<_Units> = new TezosFA2Accountant(forger, options.network)

    super(options, accountant)

    this.tokenId = options.network.tokenId
  }

  public async getBalanceOfPublicKey(publicKey: PublicKey, configuration?: MultiTokenBalanceConfiguration): Promise<Balance<_Units>> {
    const address: string = await this.getAddressFromPublicKey(publicKey)

    return this.getBalanceOfAddress(address, configuration)
  }

  public async getBalanceOfAddress(address: string, configuration?: MultiTokenBalanceConfiguration): Promise<Balance<_Units>> {
    const balance: TezosFA2BalanceOfResponse[] = await this.balanceOf([
      {
        address,
        tokenID: configuration?.tokenId ?? this.tokenId ?? 0
      }
    ])

    const total: BigNumber = balance.reduce((sum: BigNumber, next: TezosFA2BalanceOfResponse) => sum.plus(next.amount), new BigNumber(0))

    return { total: newAmount(total, 'blockchain') }
  }

  public async getTokenId(): Promise<number | undefined> {
    return this.tokenId
  }

  public async getTokenMetadata(tokenID?: number | undefined): Promise<TezosFATokenMetadata | undefined> {
    return this.getTokenMetadataForTokenId(tokenID ?? this.tokenId ?? 0)
  }

  public async balanceOf(
    balanceRequests: TezosFA2BalanceOfRequest[],
    source?: string,
    callbackContract: string = this.options.network.callbackContracts.balance_of
  ): Promise<TezosFA2BalanceOfResponse[]> {
    const balanceOfCall: TezosContractCall = await this.contract.createContractCall('balance_of', {
      requests: balanceRequests.map((request: TezosFA2BalanceOfRequest) => {
        return {
          owner: request.address,
          token_id: typeof request.tokenID === 'string' ? parseInt(request.tokenID, 10) : request.tokenID
        }
      }),
      callback: callbackContract
    })

    const results: MichelineDataNode = await this.runContractCall(balanceOfCall, this.requireSource(source))
    if (isMichelineSequence(results)) {
      return results
        .map((node: MichelineDataNode) => {
          try {
            const pair: MichelsonPair = MichelsonPair.from(
              node,
              undefined,
              (value: unknown) => MichelsonPair.from(value, undefined, MichelsonAddress.from, MichelsonInt.from),
              MichelsonInt.from
            )

            const accountWithTokenID: MichelsonPair = MichelsonPair.from(pair.items[0].get())
            const account: MichelsonAddress = MichelsonAddress.from(accountWithTokenID.items[0].get())
            const tokenID: MichelsonInt = MichelsonInt.from(accountWithTokenID.items[1].get())

            const amount: MichelsonInt = MichelsonInt.from(pair.items[1].get())

            return {
              address: account.address instanceof MichelsonString ? account.address.value : parseAddress(account.address.value),
              tokenID: tokenID.value.toNumber(),
              amount: amount.value.toFixed()
            }
          } catch (error) {
            console.warn(error)

            return undefined
          }
        })
        .filter((balanceOfResults: TezosFA2BalanceOfResponse | undefined) => balanceOfResults !== undefined) as TezosFA2BalanceOfResponse[]
    } else {
      return []
    }
  }

  public async transfer(
    transferRequests: TezosFA2TransferRequest[],
    fee: Amount<TezosUnits>,
    publicKey: PublicKey
  ): Promise<TezosUnsignedTransaction> {
    const transferCall: TezosContractCall = await this.contract.createContractCall(
      'transfer',
      transferRequests.map((request: TezosFA2TransferRequest) => {
        return {
          from_: request.from,
          txs: request.txs.map((tx) => {
            return {
              to_: tx.to,
              token_id: tx.tokenId,
              amount: tx.amount
            }
          })
        }
      })
    )

    return this.prepareContractCall([transferCall], fee, publicKey)
  }

  public async updateOperators(
    updateRequests: TezosFA2UpdateOperatorRequest[],
    fee: Amount<TezosUnits>,
    publicKey: PublicKey
  ): Promise<TezosUnsignedTransaction> {
    const updateCall: TezosContractCall = await this.contract.createContractCall(
      'update_operators',
      updateRequests.map((request: TezosFA2UpdateOperatorRequest) => {
        const args = {
          [`${request.operation}_operator`]: {
            owner: request.owner,
            operator: request.operator,
            token_id: request.tokenId
          }
        }

        return [request.operation === 'add' ? 'Left' : 'Right', args]
      })
    )

    return this.prepareContractCall([updateCall], fee, publicKey)
  }

  public async getTotalSupply(tokenId?: number | undefined): Promise<string> {
    const bigMaps = await this.contract.getBigMaps()
    const bigMapIndex = this.options.network.totalSupplyBigMapId
    let bigMap: BigMap | undefined = undefined
    if (bigMapIndex !== undefined) {
      bigMap = bigMaps.find((bigMap) => bigMap.id === bigMapIndex)
    } else {
      bigMap = bigMaps.find(
        (bigMap) =>
          (bigMap.path === 'total_supply' || bigMap.path.endsWith('.total_supply')) &&
          isMichelinePrimitiveApplication('nat', bigMap.keyType) &&
          isMichelinePrimitiveApplication('nat', bigMap.valueType)
      )
    }
    const result = await this.contract.getBigMapValue({
      bigMap,
      key: `${tokenId ?? this.tokenId ?? 0}`,
      resultType: 'micheline'
    })
    if (result !== undefined && isMichelinePrimitive('int', result.value)) {
      return result.value.int
    }

    return '0'
  }

  public async fetchTokenHolders(tokenId?: number): Promise<{ address: string; amount: Amount<_Units> }[]> {
    return this.indexer.getTokenBalances({
      contractAddress: this.options.network.contractAddress,
      id: tokenId ?? this.tokenId ?? 0
    })
  }

  public override async getTransactionsForAddress(
    address: string,
    limit: number,
    cursor?: TezosTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<TezosTransactionCursor, _Units, TezosUnits>> {
    const transactions: Omit<AirGapTransaction<never, TezosUnits>, 'network'>[] = await this.indexer.getTokenTransactionsForAddress(
      { contractAddress: this.contract.address, id: this.tokenId ?? 0 },
      address,
      limit,
      cursor?.offset
    )

    return {
      transactions: transactions.map((transaction: Omit<AirGapTransaction<never, TezosUnits>, 'network'>) => ({
        ...transaction,
        network: this.options.network
      })),
      cursor: {
        hasNext: transactions.length >= limit,
        offset: (cursor?.offset ?? 0) + transactions.length
      }
    }
  }

  protected async createTransferCalls(
    publicKey: PublicKey,
    details: TransactionDetails<_Units>[],
    configuration?: TransactionFullConfiguration<TezosUnits>
  ): Promise<TezosContractCall[]> {
    const tokenID: number = configuration?.assetId ?? this.tokenId ?? 0

    const from: string = await this.getAddressFromPublicKey(publicKey)
    const transferCall: TezosContractCall = await this.contract.createContractCall('transfer', [
      {
        from_: from,
        txs: details.map(({ to, amount }) => {
          return {
            to_: to,
            token_id: tokenID,
            amount: newAmount(amount).blockchain(this.metadata.units).value
          }
        })
      }
    ])

    return [transferCall]
  }
}

// Factory

interface PartialTezosFA2ProtocolNetwork extends RecursivePartial<TezosFA2ProtocolNetwork> {
  contractAddress: TezosFA2ProtocolNetwork['contractAddress']
}
interface PartialTezosFA2ProtocolOptions<_Units extends string>
  extends RecursivePartial<Omit<TezosFA2ProtocolOptions<_Units>, 'units' | 'mainUnit'>> {
  network: PartialTezosFA2ProtocolNetwork
  identifier: TezosFA2ProtocolOptions<_Units>['identifier']
  units?: TezosFA2ProtocolOptions<_Units>['units']
  mainUnit?: TezosFA2ProtocolOptions<_Units>['mainUnit']
}

export function createTezosFA2Protocol<_Units extends string>(options: PartialTezosFA2ProtocolOptions<_Units>): TezosFA2Protocol<_Units> {
  const completeOptions: TezosFA2ProtocolOptions<_Units> = createTezosFA2ProtocolOptions(
    options.network,
    options.identifier,
    options.name,
    options.units,
    options.mainUnit,
    options.feeDefaults
  )

  return new TezosFA2ProtocolImpl(completeOptions)
}

export const TEZOS_FA2_MAINNET_PROTOCOL_NETWORK: Omit<TezosFA2ProtocolNetwork, 'contractAddress'> = {
  ...TEZOS_FA_MAINNET_PROTOCOL_NETWORK,
  callbackContracts: {
    balance_of: 'KT1LyHDYnML5eCuTEVCTynUpivwG6ns6khiG'
  }
}

const DEFAULT_TEZOS_FA2_PROTOCOL_NETWORK: Omit<TezosFA2ProtocolNetwork, 'contractAddress'> = TEZOS_FA2_MAINNET_PROTOCOL_NETWORK

export function createTezosFA2ProtocolOptions<_Units extends string>(
  network: PartialTezosFA2ProtocolNetwork,
  identifier: TezosFA2ProtocolOptions<_Units>['identifier'],
  name?: TezosFA2ProtocolOptions<_Units>['name'],
  units?: TezosFA2ProtocolOptions<_Units>['units'],
  mainUnit?: TezosFA2ProtocolOptions<_Units>['mainUnit'],
  feeDefaults?: TezosFA2ProtocolOptions<_Units>['feeDefaults']
): TezosFA2ProtocolOptions<_Units> {
  const completeNetwork: TezosFA2ProtocolNetwork = {
    ...DEFAULT_TEZOS_FA2_PROTOCOL_NETWORK,
    ...network,
    callbackContracts: {
      ...DEFAULT_TEZOS_FA2_PROTOCOL_NETWORK.callbackContracts,
      ...network.callbackContracts
    }
  }

  return createTezosFAProtocolOptions(completeNetwork, identifier, name, units, mainUnit, feeDefaults)
}
