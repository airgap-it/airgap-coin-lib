import { SubstrateSignatureType } from '../../common/data/transaction/SubstrateSignature'
import { SubstrateTransaction } from '../../common/data/transaction/SubstrateTransaction'
import { SubstrateTransactionController } from '../../common/SubstrateTransactionController'
import { SubstrateNetwork } from '../../SubstrateNetwork'

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