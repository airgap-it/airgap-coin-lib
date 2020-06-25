import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { TezosTransactionOperation } from '../types/operations/Transaction'
import { TezosOperationType } from '../types/TezosOperationType'

import { TezosContractEntity } from './TezosContractEntity'
import { TezosContractEntrypoint } from './TezosContractEntrypoint'
import { TezosContractPair } from './TezosContractPair'

export class TezosContractCall extends TezosContractEntity {
  public readonly entrypoint: TezosContractEntrypoint
  public readonly args: TezosContractPair

  constructor(entrypoint: TezosContractEntrypoint, args: TezosContractPair) {
    super()
    this.entrypoint = entrypoint
    this.args = args
  }

  public toOperationJSONBody(
    chainID: string,
    branch: string,
    counter: BigNumber,
    source: string,
    contractAddress: string,
    fee: string = '0'
  ): TezosRPCOperationBody {
    return {
      chain_id: chainID,
      operation: {
        branch,
        signature: 'sigUHx32f9wesZ1n2BWpixXz4AQaZggEtchaQNHYGRCoWNAXx45WGW2ua3apUUUAGMLPwAU41QoaFCzVSL61VaessLg4YbbP', // signature will not be checked, so it is ok to always use this one
        contents: [
          {
            kind: TezosOperationType.TRANSACTION,
            counter: counter.toFixed(),
            amount: '0',
            source,
            destination: contractAddress,
            fee,
            gas_limit: '400000',
            storage_limit: '60000',
            parameters: this.toJSON()
          }
        ]
      }
    }
  }

  public toJSON(): any {
    return {
      entrypoint: this.entrypoint.toJSON(),
      value: this.args.toJSON()
    }
  }

  public static fromJSON(json: any): TezosContractCall {
    const entrypoint = TezosContractEntrypoint.fromJSON(json.entrypoint)
    const args = TezosContractPair.fromJSON(json.value)

    return new TezosContractCall(entrypoint, args)
  }
}

export interface TezosRPCOperationBody {
  operation: TezosRPCOperation
  chain_id: string
}

export interface TezosRPCOperation {
  branch: string
  contents: TezosTransactionOperation[]
  signature: string
}
