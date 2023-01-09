import { TransactionSignRequest, TransactionSignRequestV2 } from '@airgap/serializer'

interface CosmosCoin {
  denom: string
  amount: string
}

interface CosmosFee {
  amount: CosmosCoin[]
  gas: string
}

enum CosmosMessageTypeIndex {
  SEND = 0,
  DELEGATE = 1,
  UNDELEGATE = 2,
  WITHDRAW_DELEGATION_REWARD = 3
}

interface CosmosMessage {
  type: CosmosMessageTypeIndex
  amount: CosmosCoin[]
  fromAddress: string
  toAddress: string
}

interface CosmosTransaction {
  messages: CosmosMessage[]
  fee: CosmosFee
  memo: string
  chainID: string
  accountNumber: string
  sequence: string
}

export interface SerializableUnsignedCosmosTransaction extends TransactionSignRequest, TransactionSignRequestV2 {
  transaction: CosmosTransaction
}
