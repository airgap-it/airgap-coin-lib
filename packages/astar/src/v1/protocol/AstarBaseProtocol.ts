import {
  SubscanBlockExplorerClient,
  SubstrateAccountId,
  SubstrateProtocol,
  SubstrateProtocolImpl,
  SubstrateSS58Address,
  SubstrateTransactionType
} from '@airgap/substrate/v1'

import { AstarAccountController } from '../controller/AstarAccountController'
import { AstarTransactionController } from '../controller/AstarTransactionController'
import { AstarNodeClient } from '../node/AstarNodeClient'
import { AstarProtocolConfiguration } from '../types/configuration'
import { AstarCryptoConfiguration } from '../types/crypto'
import { AstarBaseProtocolOptions, AstarProtocolNetwork } from '../types/protocol'

// Interface

export interface AstarBaseProtocol<_Units extends string = string>
  extends SubstrateProtocol<AstarProtocolConfiguration, _Units, AstarProtocolNetwork, AstarCryptoConfiguration> {}

// Implemenation

export abstract class AstarBaseProtocolImpl<_Units extends string>
  extends SubstrateProtocolImpl<
    _Units,
    AstarProtocolConfiguration,
    AstarProtocolNetwork,
    AstarNodeClient,
    AstarAccountController,
    AstarTransactionController
  >
  implements AstarBaseProtocol<_Units>
{
  public constructor(options: AstarBaseProtocolOptions<_Units>) {
    const nodeClient: AstarNodeClient = new AstarNodeClient(options.configuration, options.network.rpcUrl)

    const accountController: AstarAccountController = new AstarAccountController(options.configuration, nodeClient)
    const transactionController: AstarTransactionController = new AstarTransactionController(options.configuration, nodeClient)

    const blockExplorer: SubscanBlockExplorerClient = new SubscanBlockExplorerClient(options.network.blockExplorerApi)

    super(options, nodeClient, accountController, transactionController, blockExplorer)
  }

  protected async getFutureRequiredTransactions(
    accountId: SubstrateAccountId<SubstrateSS58Address>,
    intention: 'transfer' | 'check'
  ): Promise<[SubstrateTransactionType<AstarProtocolConfiguration>, any][]> {
    const balance = await this.accountController.getBalance(accountId)

    const transferableBalance = balance.transferable.minus(balance.existentialDeposit)

    const requiredTransactions: [SubstrateTransactionType<AstarProtocolConfiguration>, any][] = []

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
