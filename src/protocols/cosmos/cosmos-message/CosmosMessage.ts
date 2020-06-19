import { IAirGapTransaction, CosmosProtocol } from '../../..'
import { CosmosCoinJSON } from '../CosmosCoin'
import { JSONConvertible, RPCConvertible } from '../CosmosTransaction'

export interface CosmosMessageJSON {
  type: CosmosMessageTypeIndex
  amount: CosmosCoinJSON[]
  fromAddress: string
  toAddress: string
}

export enum CosmosMessageTypeIndex {
  SEND = 0,
  DELEGATE = 1,
  UNDELEGATE = 2,
  WITHDRAW_DELEGATION_REWARD = 3
}

export class CosmosMessageType {
  public static Send: CosmosMessageType = new CosmosMessageType(CosmosMessageTypeIndex.SEND)
  public static Delegate: CosmosMessageType = new CosmosMessageType(CosmosMessageTypeIndex.DELEGATE)
  public static Undelegate: CosmosMessageType = new CosmosMessageType(CosmosMessageTypeIndex.UNDELEGATE)
  public static WithdrawDelegationReward: CosmosMessageType = new CosmosMessageType(CosmosMessageTypeIndex.WITHDRAW_DELEGATION_REWARD)

  public readonly index: CosmosMessageTypeIndex
  public readonly value: string

  constructor(index: CosmosMessageTypeIndex) {
    this.index = index
    switch (index) {
      case CosmosMessageTypeIndex.SEND:
        this.value = 'cosmos-sdk/MsgSend'
        break
      case CosmosMessageTypeIndex.DELEGATE:
        this.value = 'cosmos-sdk/MsgDelegate'
        break
      case CosmosMessageTypeIndex.UNDELEGATE:
        this.value = 'cosmos-sdk/MsgUndelegate'
        break
      case CosmosMessageTypeIndex.WITHDRAW_DELEGATION_REWARD:
        this.value = 'cosmos-sdk/MsgWithdrawDelegationReward'
        break
      default:
        throw new Error('Unknown message type')
    }
  }
}

export interface CosmosMessage extends JSONConvertible, RPCConvertible {
  type: CosmosMessageType

  toAirGapTransaction(protocol: CosmosProtocol, fee: string): IAirGapTransaction

  toJSON(): CosmosMessageJSON
}
