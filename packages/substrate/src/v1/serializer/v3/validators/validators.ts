import { newPublicKey, newSignedTransaction, newUnsignedTransaction, ProtocolMetadata } from '@airgap/module-kit'
import { SubscanBlockExplorerClient } from '../../../block-explorer/subscan/SubscanBlockExplorerClient'

import { SubstrateAccountController } from '../../../controller/account/SubstrateAccountController'
import { SubstrateCommonAccountController } from '../../../controller/account/SubstrateCommonAccountController'
import { SubstrateCommonTransactionController } from '../../../controller/transaction/SubstrateCommonTransactionController'
import { SubstrateTransactionController } from '../../../controller/transaction/SubstrateTransactionController'
import { SubstrateAccountId } from '../../../data/account/address/SubstrateAddress'
import { TypedSubstrateAddress } from '../../../data/account/address/SubstrateAddressFactory'
import { SubstrateCommonNodeClient } from '../../../node/SubstrateCommonNodeClient'
import { SubstrateNodeClient } from '../../../node/SubstrateNodeClient'
import { SubstrateProtocolImpl } from '../../../protocol/SubstrateProtocol'
import { SubstrateProtocolConfiguration } from '../../../types/configuration'
import { SubstrateProtocolNetwork } from '../../../types/protocol'
import { SubstrateSignedTransaction, SubstrateUnsignedTransaction } from '../../../types/transaction'

class GenericSubstrateProtocol extends SubstrateProtocolImpl<string, SubstrateProtocolConfiguration> {
  constructor() {
    const configuration: SubstrateProtocolConfiguration = {
      account: {
        type: 'ss58',
        format: 42
      },
      transaction: {
        types: {}
      }
    }
    const metadata: ProtocolMetadata<string> = {
      name: 'Substrate',
      identifier: 'substrate',
      units: {},
      mainUnit: ''
    }
    const network: SubstrateProtocolNetwork = {
      name: '',
      type: 'mainnet',
      rpcUrl: ''
    }

    const nodeClient: SubstrateNodeClient<SubstrateProtocolConfiguration> = new SubstrateCommonNodeClient(configuration, '')

    const accountController: SubstrateAccountController<SubstrateProtocolConfiguration> = new SubstrateCommonAccountController(
      configuration,
      nodeClient
    )
    const transactionController: SubstrateTransactionController<SubstrateProtocolConfiguration> = new SubstrateCommonTransactionController(
      configuration,
      nodeClient
    )

    const blockExplorer: SubscanBlockExplorerClient = new SubscanBlockExplorerClient('')

    super({ configuration, metadata, network }, nodeClient, accountController, transactionController, blockExplorer)
  }

  protected async getFutureRequiredTransactions(
    accountId: SubstrateAccountId<TypedSubstrateAddress<SubstrateProtocolConfiguration>>,
    intention: 'check' | 'transfer'
  ): Promise<[string, any][]> {
    return []
  }
}

export const substrateValidators = {
  isValidSubstrateUnsignedTransaction: (encoded: string) => {
    return new Promise<void>(async (resolve, reject) => {
      if (encoded === null || typeof encoded === 'undefined') {
        reject('not a valid Substrate transaction')
      }

      const protocol = new GenericSubstrateProtocol()

      try {
        await protocol.getDetailsFromTransaction(
          newUnsignedTransaction<SubstrateUnsignedTransaction>({ encoded }),
          newPublicKey('00', 'hex')
        )
        resolve()
      } catch (error) {
        reject('not a valid Substrate transaction')
      }
    })
  },

  isValidSubstrateSignedTransaction: (transaction: string) => {
    return new Promise<void>(async (resolve, reject) => {
      if (transaction === null || typeof transaction === 'undefined') {
        reject('not a valid Substrate transaction')
      }
      const protocol = new GenericSubstrateProtocol()
      try {
        await protocol.getDetailsFromTransaction(
          newSignedTransaction<SubstrateSignedTransaction>({ encoded: transaction }),
          newPublicKey('00', 'hex')
        )
        resolve()
      } catch (error) {
        reject('not a valid Substrate transaction')
      }
    })
  }
}
