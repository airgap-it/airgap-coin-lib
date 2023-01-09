import { FeeDefaults, ProtocolSymbols } from '@airgap/coinlib-core'
import { validators } from '@airgap/coinlib-core/dependencies/src/validate.js-0.13.1/validate'
import { CurrencyUnit } from '@airgap/coinlib-core/protocols/ICoinProtocol'

import { SubstrateNodeClient } from '../../protocol/common/node/SubstrateNodeClient'
import { SubstrateAccountController } from '../../protocol/common/SubstrateAccountController'
import { SubstrateTransactionController } from '../../protocol/common/SubstrateTransactionController'
import { SubstrateNetwork } from '../../protocol/SubstrateNetwork'
import { SubstrateProtocol } from '../../protocol/SubstrateProtocol'
import {
  SubscanBlockExplorer,
  SubstrateProtocolConfig,
  SubstrateProtocolNetwork,
  SubstrateProtocolNetworkExtras,
  SubstrateProtocolOptions
} from '../../protocol/SubstrateProtocolOptions'
import { SignedSubstrateTransaction } from '../../types/signed-transaction-substrate'

class GenericSubstrateProtocol extends SubstrateProtocol<SubstrateNetwork> {
  public symbol: string = 'DEV'
  public name: string = 'Substrate'
  public marketSymbol: string = 'DEV'
  public feeSymbol: string = 'DEV'
  public decimals: number = 12
  public feeDecimals: number = 12
  public identifier: ProtocolSymbols = 'substrate' as ProtocolSymbols
  public feeDefaults: FeeDefaults = {
    low: '0.001',
    medium: '0.001',
    high: '0.001'
  }
  public units: CurrencyUnit[] = []
  public standardDerivationPath: string = 'm/'

  constructor() {
    const network = new SubstrateProtocolNetwork(
      undefined,
      undefined,
      '',
      new SubscanBlockExplorer(''),
      new SubstrateProtocolNetworkExtras('', ('SUBSTRATE' as any) as SubstrateNetwork)
    )

    const nodeClient = new SubstrateNodeClient(network.extras.network, '')

    super(
      new SubstrateProtocolOptions(
        network,
        new SubstrateProtocolConfig(),
        nodeClient,
        new SubstrateAccountController(network.extras.network, nodeClient),
        new SubstrateTransactionController(network.extras.network, nodeClient)
      )
    )
  }
}

validators.isValidSubstrateUnsignedTransaction = (encoded: string) => {
  const unsignedTx = {
    transaction: { encoded },
    publicKey: '',
    callbackURL: ''
  }

  return new Promise<void>(async (resolve, reject) => {
    if (encoded === null || typeof encoded === 'undefined') {
      reject('not a valid Substrate transaction')
    }

    const protocol = new GenericSubstrateProtocol()

    try {
      await protocol.getTransactionDetails(unsignedTx)
      resolve()
    } catch (error) {
      reject('not a valid Substrate transaction')
    }
  })
}

validators.isValidSubstrateSignedTransaction = (transaction: string) => {
  const signedTx: SignedSubstrateTransaction = {
    accountIdentifier: '',
    transaction
  }

  return new Promise<void>(async (resolve, reject) => {
    if (transaction === null || typeof transaction === 'undefined') {
      reject('not a valid Substrate transaction')
    }
    const protocol = new GenericSubstrateProtocol()
    try {
      await protocol.getTransactionDetailsFromSigned(signedTx)
      resolve()
    } catch (error) {
      reject('not a valid Substrate transaction')
    }
  })
}
