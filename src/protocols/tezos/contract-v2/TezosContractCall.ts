import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { TezosTransactionOperation } from '../types/operations/Transaction'
import { TezosOperationType } from '../types/TezosOperationType'

import { MichelineDataNode } from './micheline/MichelineNode'
import { MichelsonTypeMapping } from './michelson/MichelsonTypeMapping'

export interface TezosContractCallJSON {
  entrypoint: string
  value: MichelineDataNode
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

export class TezosContractCall {

  constructor(
    readonly entrypoint: string, 
    readonly value: MichelsonTypeMapping | undefined,
    readonly parameterRegistry?: Map<string, MichelsonTypeMapping>
  ) {}

  public argument<T extends MichelsonTypeMapping>(name: string): T | undefined {
    return this.parameterRegistry?.get(name) as T
  }

  public toJSON(): TezosContractCallJSON {
    return {
      entrypoint: this.entrypoint,
      value: this.value ? this.value.toMichelineJSON() : []
    }
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
}