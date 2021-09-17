import { AirGapWalletStatus, TezosShieldedTezProtocol } from '../../../src'
import { mnemonicToSeed } from '../../../src/dependencies/src/bip39-2.5.0'
import { TestProtocolSpec } from '../implementations'
import { TezosShieldedTezProtocolStub } from '../stubs/tezos-shielded-tez.stub'

import { TezosTestProtocolSpec } from './tezos'

// Mnemonic: leopard crouch simple blind castle they elder enact slow rate mad blanket saddle tail silk fury quarter obscure interest exact veteran volcano fabric cherry
// Derivation path: m/
// Address: tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L

export class TezosShieldedTezTestProtocolSpec extends TestProtocolSpec {
  public name = 'ShieldedTez'
  public lib = new TezosShieldedTezProtocol()
  public tezos = new TezosTestProtocolSpec()

  public stub = new TezosShieldedTezProtocolStub()

  public wallet = {
    privateKey:
      '000000000000000000977d725fc96387e8ec1e603e7ae60c6e63529fb84e36e126770e9db9899d7f233fe1deabce96fe39efe6cbe315755ad2938b3a7e112c61305a0ba1ed7ed561053f80bf8cb9a8da8deb290913e9302be00c56f4565d917a6170be1880f42bb70935c61a0e53de553a751c78fbc42d5e7eca807fd441206651c84bf88de803efba837583145a5f338b1a7af8a5f9bec4783054f9d063d365f2352f72cbced95e0a',
    publicKey:
      '000000000000000000977d725fc96387e8ec1e603e7ae60c6e63529fb84e36e126770e9db9899d7f2344259fd700dc80120d3c9ca65d698f6064043b048b079caa4f198aed96271740b1d6fd523d71b15cd0b3d75644afbe9abfedb6883e299165665ab692c14ca5c835c61a0e53de553a751c78fbc42d5e7eca807fd441206651c84bf88de803efba837583145a5f338b1a7af8a5f9bec4783054f9d063d365f2352f72cbced95e0a',
    addresses: ['zet12mVvzJ4QJhnNQetGHzdwTMcLgNrdC4SFact6BB5jpeqGAefWip3iGgEjvDA9z7b9Y'],
    masterFingerprint: 'f4e222fd',
    status: AirGapWalletStatus.ACTIVE
  }

  public seed(): string {
    const seed64: Buffer = mnemonicToSeed(this.mnemonic(), '')

    const first32: Buffer = seed64.slice(0, 32)
    const second32: Buffer = seed64.slice(32)

    return Buffer.from(first32.map((byte, index) => byte ^ second32[index])).toString('hex')
  }

  public mnemonic(): string {
    return 'leopard crouch simple blind castle they elder enact slow rate mad blanket saddle tail silk fury quarter obscure interest exact veteran volcano fabric cherry'
  }
}
