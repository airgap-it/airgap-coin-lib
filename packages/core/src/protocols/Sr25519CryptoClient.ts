import { NotImplementedError } from '../errors'
import { Domain } from '../errors/coinlib-error'
import { CryptoClient } from './CryptoClient'

export abstract class Sr25519CryptoClient extends CryptoClient {
  public async encryptAsymmetric(payload: string, publicKey: string): Promise<string> {
    // Currently not supported: https://github.com/polkadot-js/common/issues/633
    throw new NotImplementedError(Domain.UTILS, `encryptAsymmetric() not implemented.`)
  }

  public async decryptAsymmetric(encryptedPayload: string, keypair: { publicKey: string; privateKey: string }): Promise<string> {
    // Currently not supported: https://github.com/polkadot-js/common/issues/633
    throw new NotImplementedError(Domain.UTILS, `decryptAsymmetric() not implemented.`)
  }
}
