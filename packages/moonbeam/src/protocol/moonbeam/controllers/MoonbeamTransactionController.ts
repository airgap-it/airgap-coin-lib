import { SubstrateSignatureType } from '@airgap/substrate/protocol/common/data/transaction/SubstrateSignature'
import { SubstrateTransaction } from '@airgap/substrate/protocol/common/data/transaction/SubstrateTransaction'
import { SubstrateTransactionController } from '@airgap/substrate/protocol/common/SubstrateTransactionController'
import { SubstrateNetwork } from '@airgap/substrate/protocol/SubstrateNetwork'

export class MoonbeamTransactionController extends SubstrateTransactionController<SubstrateNetwork.MOONBEAM> {
  public getDefaultSignatureType(): SubstrateSignatureType {
    return SubstrateSignatureType.Ecdsa
  }

  public async signTransaction(
    privateKey: Buffer,
    transaction: SubstrateTransaction<SubstrateNetwork.MOONBEAM>,
    payload: string
  ): Promise<SubstrateTransaction<SubstrateNetwork.MOONBEAM>> {
    return this.signWithPrivateKey(privateKey, transaction, payload, SubstrateSignatureType.Ecdsa)
  }
}
