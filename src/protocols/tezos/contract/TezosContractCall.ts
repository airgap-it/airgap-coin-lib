import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { TezosContractPair } from './TezosContractPair'
import { TezosContractEntrypoint } from './TezosContractEntrypoint'
import { TezosContractEntity } from './TezosContractEntity'

export class TezosContractCall extends TezosContractEntity {
  readonly entrypoint: TezosContractEntrypoint
  readonly args: TezosContractPair

  constructor(entrypoint: TezosContractEntrypoint, args: TezosContractPair) {
    super()
    this.entrypoint = entrypoint
    this.args = args
  }

  toOperationJSONBody(
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
        branch: branch,
        signature: 'sigUHx32f9wesZ1n2BWpixXz4AQaZggEtchaQNHYGRCoWNAXx45WGW2ua3apUUUAGMLPwAU41QoaFCzVSL61VaessLg4YbbP', // signature will not be checked, so it is ok to always use this one
        contents: [
          {
            kind: 'transaction',
            counter: counter.toFixed(),
            amount: '0',
            source: source,
            destination: contractAddress,
            fee: fee,
            gas_limit: '400000',
            storage_limit: '60000',
            parameters: this.toJSON()
          }
        ]
      }
    }
  }

  toJSON(): any {
    return {
      entrypoint: this.entrypoint.toJSON(),
      value: this.args.toJSON()
    }
  }

  static fromJSON(json: any): TezosContractCall {
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
  contents: TezosRPCTransaction[]
  signature: string
}

export interface TezosRPCTransaction {
  kind: 'transaction'
  counter: string
  amount: string
  source: string
  destination: string
  fee: string
  gas_limit: string
  storage_limit: string
  parameters?: TezosRPCTransactionParameters
}

interface TezosRPCTransactionParameters {
  entrypoint: String
  value: any
}
