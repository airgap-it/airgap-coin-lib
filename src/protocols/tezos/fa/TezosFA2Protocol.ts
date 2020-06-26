import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { IAirGapTransaction } from '../../../interfaces/IAirGapTransaction'
import { RawTezosTransaction } from '../../../serializer/types'
import { FeeDefaults } from '../../ICoinProtocol'
import { TezosContractCall } from '../contract/TezosContractCall'
import { TezosNetwork } from '../TezosProtocol'
import { TezosUtils } from '../TezosUtils'
import { MichelsonAddress } from '../types/michelson/primitives/MichelsonAddress'
import { MichelsonBytes } from '../types/michelson/primitives/MichelsonBytes'
import { MichelsonInt } from '../types/michelson/primitives/MichelsonInt'
import { MichelsonString } from '../types/michelson/primitives/MichelsonString'
import { TezosTransactionParameters } from '../types/operations/Transaction'

import { TezosFAProtocol, TezosFAProtocolConfiguration } from './TezosFAProtocol'

enum FA2ContractEntrypointName {
  BALANCE = 'balance_of',
  TRANSFER = 'transfer',
  UPDATE_OPERATORS = 'update_operators',
  TOKEN_METADATA_REGISTRY = 'token_metadata_regitry', // TODO: set proper entrypoint name when the typo is fixed in the test contract
  TOKEN_METADATA = 'token_metadata'
}

export interface TezosFA2BalanceOfRequest {
  address: string
  tokenID: number
}

export interface TezosFA2TransferRequest {
  from: string
  txs: {
    to: string
    tokenID: number
    amount: string
  }[]
}

export interface TezosFA2UpdateOperatorRequest {
  operation: 'add' | 'remove'
  owner: string
  operator: string
}

export class TezosFA2Protocol extends TezosFAProtocol {
  constructor(configuration: TezosFAProtocolConfiguration) {
    super({
      // TODO: set proper addresses
      callbackDefaults: [
        [TezosNetwork.MAINNET, ''],
        [TezosNetwork.CARTHAGENET, '']
      ],
      ...configuration
    })
  }

  public async getBalanceOfAddresses(addresses: string[]): Promise<string> {
    throw new Error('Method not implemented.')
  }

  public async estimateFeeDefaultsFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: string[],
    data?: any
  ): Promise<FeeDefaults> {
    // return this.feeDefaults
    if (recipients.length !== values.length) {
      throw new Error('length of recipients and values does not match!')
    }
    throw new Error('Method not implemented.')
  }

  public async prepareTransactionFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: string[],
    fee: string,
    data?: { addressIndex: number }
  ): Promise<RawTezosTransaction> {
    throw new Error('Method not implemented.')
  }

  public async transactionDetailsFromParameters(parameters: TezosTransactionParameters): Promise<Partial<IAirGapTransaction>[]> {
    if (parameters.entrypoint !== FA2ContractEntrypointName.TRANSFER) {
      throw new Error('Only calls to the transfer entrypoint can be converted to IAirGapTransaction')
    }
    
    const contractCall: TezosContractCall = await this.contract.parseContractCall(parameters)

    return contractCall.args().map((callArguments: unknown) => {
      if (!this.isTransferRequest(callArguments)) {
        return {}
      }

      const fromAddress: MichelsonString | MichelsonBytes = callArguments.from_.address
      let from: string | undefined
      if (Buffer.isBuffer(fromAddress.value)) {
        from = TezosUtils.parseAddress(fromAddress.value.toString('hex'))
      } else if (fromAddress && typeof fromAddress.value === 'string') {
        from = fromAddress.value
      }


      const recipientsWithAmount: [string, BigNumber][] = callArguments.txs.map((tx) => {
        const toAddress: MichelsonString | MichelsonBytes = tx.to_.address

        let stringAddress: string | undefined
        if (Buffer.isBuffer(toAddress.value)) {
          stringAddress = TezosUtils.parseAddress(toAddress?.value.toString('hex'))
        } else if (toAddress && typeof toAddress.value === 'string') {
          stringAddress = toAddress.value
        }

        return [stringAddress, tx.amount.value] as [string | undefined, BigNumber]
      }).filter(([address, _]: [string | undefined, BigNumber]) => address !== undefined) as [string, BigNumber][]

      const amount: BigNumber = recipientsWithAmount.reduce(
        (sum: BigNumber, [_, next]: [string, BigNumber]) => sum.plus(next),
        new BigNumber(0)
      )
      const to: string[] = recipientsWithAmount.map(([recipient, _]: [string, BigNumber]) => recipient)

      return {
        amount: amount.toFixed(),
        from: [from || ''],
        to
      }
    })
  }

  public async balanceOf(
    balanceRequests: TezosFA2BalanceOfRequest[],
    source?: string,
    callbackContract: string = this.callbackContract()
  ): Promise<string> {
    const balanceOfCall: TezosContractCall = await this.contract.createContractCall(
      FA2ContractEntrypointName.BALANCE, 
      {
        requests: balanceRequests.map((request: TezosFA2BalanceOfRequest) => {
          return {
            owner: request.address,
            token_id: request.tokenID
          }
        }),
        callback: callbackContract
      }
    )

    return this.runContractCall(balanceOfCall, this.requireSource(source))
  }

  public async transfer(
    transferRequests: TezosFA2TransferRequest[],
    fee: string,
    publicKey: string
  ): Promise<RawTezosTransaction> {
    const transferCall: TezosContractCall = await this.contract.createContractCall(
      FA2ContractEntrypointName.TRANSFER,
      transferRequests.map((request: TezosFA2TransferRequest) => {
        return {
          from_: request.from,
          txs: request.txs.map((tx) => {
            return {
              to_: tx.to,
              token_id: tx.tokenID,
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
    fee: string,
    publicKey: string
  ): Promise<RawTezosTransaction> {
    const updateCall: TezosContractCall = await this.contract.createContractCall(
      FA2ContractEntrypointName.UPDATE_OPERATORS,
      updateRequests.map((request: TezosFA2UpdateOperatorRequest) => {
        return {
          [`${request.operation}_operator`]: {
            owner: request.owner,
            operator: request.operator
          }
        }
      })
    )

    return this.prepareContractCall([updateCall], fee, publicKey)
  }

  public async tokenMetadataRegistry(source?: string, callbackContract: string = this.callbackContract()): Promise<string> {
    const tokenMetadataRegistryCall: TezosContractCall = await this.contract.createContractCall(
      FA2ContractEntrypointName.TOKEN_METADATA_REGISTRY,
      callbackContract
    )

    return this.runContractCall(tokenMetadataRegistryCall, this.requireSource(source))
  }

  public async tokenMetadata(
    tokenIDs: number[], 
    source?: string, 
    callbackContract: string = this.callbackContract()
  ): Promise<string> {
    const tokenMetadataCall: TezosContractCall = await this.contract.createContractCall(
      FA2ContractEntrypointName.TOKEN_METADATA,
      {
        token_ids: tokenIDs,
        handler: callbackContract
      }
    )

    return this.runContractCall(tokenMetadataCall, this.requireSource(source))
  }

  private isTransferRequest(obj: unknown): obj is { 
    from_: MichelsonAddress, txs: { to_: MichelsonAddress, token_id: MichelsonInt, amount: MichelsonInt }[]
  } {
    const anyObj = obj as any
    
    return (
      anyObj instanceof Object &&
      anyObj.from_ !== undefined &&
      Array.isArray(anyObj.txs) &&
      anyObj.txs.every((tx: any) => 
        tx instanceof Object && tx.to_ !== undefined && tx.token_id !== undefined && tx.amount !== undefined
      )
    )
  }
}