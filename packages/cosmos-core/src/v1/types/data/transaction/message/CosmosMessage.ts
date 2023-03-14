import { InvalidValueError } from '@airgap/coinlib-core/errors'
import { Domain } from '@airgap/coinlib-core/errors/coinlib-error'
import { JSONConvertible } from '@airgap/coinlib-core/interfaces/JSONConvertible'
import { RPCConvertible } from '@airgap/coinlib-core/interfaces/RPCConvertible'
import { AirGapTransaction } from '@airgap/module-kit'

import { CosmosProtocolNetwork } from '../../../../types/protocol'
import { CosmosCoinJSON } from '../../CosmosCoin'
import { Encodable } from '../CosmosTransaction'

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

export enum CosmosMessageTypeValue {
  SEND = '/cosmos.bank.v1beta1.MsgSend',
  DELEGATE = '/cosmos.staking.v1beta1.MsgDelegate',
  UNDELEGATE = '/cosmos.staking.v1beta1.MsgUndelegate',
  WITHDRAW_DELEGATION_REWARD = '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward'
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
        this.value = CosmosMessageTypeValue.SEND
        break
      case CosmosMessageTypeIndex.DELEGATE:
        this.value = CosmosMessageTypeValue.DELEGATE
        break
      case CosmosMessageTypeIndex.UNDELEGATE:
        this.value = CosmosMessageTypeValue.UNDELEGATE
        break
      case CosmosMessageTypeIndex.WITHDRAW_DELEGATION_REWARD:
        this.value = CosmosMessageTypeValue.WITHDRAW_DELEGATION_REWARD
        break
      default:
        throw new InvalidValueError(Domain.COSMOS, 'Unknown message')
    }
  }
}

export interface CosmosMessage extends JSONConvertible, RPCConvertible, Encodable {
  type: CosmosMessageType

  toAirGapTransaction<_Units extends string>(network: CosmosProtocolNetwork, fee: string): AirGapTransaction<_Units>

  toJSON(): CosmosMessageJSON
}
