import {
  SubscanBlockExplorerClient,
  SubstrateAccountId,
  SubstrateProtocol,
  SubstrateProtocolImpl,
  SubstrateSS58Address,
  SubstrateTransactionType
} from '@airgap/substrate/v1'

import { AcurastAccountController } from '../controller/AcurastAccountController'
import { AcurastTransactionController } from '../controller/AcurastTransactionController'
import { AcurastNodeClient } from '../node/AcurastNodeClient'
import { AcurastProtocolConfiguration } from '../types/configuration'
import { AcurastCryptoConfiguration } from '../types/crypto'
import { AcurastBaseProtocolOptions, AcurastProtocolNetwork } from '../types/protocol'

// Interface

export interface AcurastBaseProtocol<_Units extends string = string>
  extends SubstrateProtocol<AcurastProtocolConfiguration, _Units, AcurastProtocolNetwork, AcurastCryptoConfiguration> {}

// Implemenation

export abstract class AcurastBaseProtocolImpl<_Units extends string>
  extends SubstrateProtocolImpl<
    _Units,
    AcurastProtocolConfiguration,
    AcurastProtocolNetwork,
    AcurastNodeClient,
    AcurastAccountController,
    AcurastTransactionController
  >
  implements AcurastBaseProtocol<_Units>
{
  public constructor(options: AcurastBaseProtocolOptions<_Units>) {
    const nodeClient: AcurastNodeClient = new AcurastNodeClient(options.configuration, options.network.rpcUrl)

    const accountController: AcurastAccountController = new AcurastAccountController(options.configuration, nodeClient)
    const transactionController: AcurastTransactionController = new AcurastTransactionController(options.configuration, nodeClient)

    const blockExplorer: SubscanBlockExplorerClient = new SubscanBlockExplorerClient(options.network.blockExplorerApi)

    super(options, nodeClient, accountController, transactionController, blockExplorer)
  }

  protected async getFutureRequiredTransactions(
    accountId: SubstrateAccountId<SubstrateSS58Address>,
    intention: 'transfer' | 'check'
  ): Promise<[SubstrateTransactionType<AcurastProtocolConfiguration>, any][]> {
    const balance = await this.accountController.getBalance(accountId)

    const transferableBalance = balance.transferable.minus(balance.existentialDeposit)

    const requiredTransactions: [SubstrateTransactionType<AcurastProtocolConfiguration>, any][] = []

    if (intention === 'transfer') {
      requiredTransactions.push([
        'transfer',
        {
          to: SubstrateSS58Address.createPlaceholder(),
          value: transferableBalance
        }
      ])
    }

    return requiredTransactions
  }
}
