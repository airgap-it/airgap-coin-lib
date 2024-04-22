import { derive, mnemonicToSeed } from '@airgap/crypto'
import { Amount, CryptoDerivative, PublicKey, SecretKey, Signature } from '@airgap/module-kit'
import { SubstrateSignedTransaction, SubstrateUnsignedTransaction } from '@airgap/substrate/v1'

import { AcurastBaseProtocolImpl } from '../../src/v1/protocol/AcurastBaseProtocol'

interface ProtocolHTTPStub<_Units extends string = string> {
  registerStub(testProtocolSpec: TestProtocolSpec): Promise<any>
  noBalanceStub(testProtocolSpec: TestProtocolSpec): Promise<any>
  transactionListStub(testProtocolSpec: TestProtocolSpec<_Units>, address: string): Promise<any>
}

abstract class TestProtocolSpec<_Units extends string = string> {
  public name: string = 'TEST'
  // tslint:disable:no-object-literal-type-assertion
  public abstract lib: AcurastBaseProtocolImpl<_Units>
  public abstract stub: ProtocolHTTPStub
  // tslint:enable:no-object-literal-type-assertion
  public validAddresses: string[] = []
  public abstract wallet: {
    secretKey: SecretKey
    publicKey: PublicKey
    derivationPath: string
    addresses: string[]
  }
  public abstract txs: {
    to: string[]
    from: string[]
    amount: Amount<_Units>
    fee: Amount<_Units>
    unsignedTx: SubstrateUnsignedTransaction
    signedTx: SubstrateSignedTransaction
  }[]
  public messages: { message: string; signature: Signature }[] = []
  public encryptAsymmetric: { message: string; encrypted: string }[] = []
  public encryptAES: { message: string; encrypted: string }[] = []

  public abstract verifySignature: (publicKey: PublicKey, tx: SubstrateSignedTransaction) => Promise<boolean>

  public abstract seed(): string
  public abstract mnemonic(): string

  public async derivative(derivationPath?: string): Promise<CryptoDerivative> {
    const [metadata, cryptoConfiguration] = await Promise.all([this.lib.getMetadata(), this.lib.getCryptoConfiguration()])

    return derive(
      cryptoConfiguration,
      await mnemonicToSeed(cryptoConfiguration, this.mnemonic()),
      derivationPath ?? metadata.account.standardDerivationPath
    )
  }

  public transactionList(address: string): {
    first: {
      transfers: {
        code: number
        message: string
        data: { count: number; transfers: any[] }
      }
      rewardSlash: {
        code: number
        message: string
        data: { count: number; list: any[] }
      }
    }
    next: {
      transfers: {
        code: number
        message: string
        data: { count: number; transfers: any[] }
      }
      rewardSlash: {
        code: number
        message: string
        data: { count: number; list: any[] }
      }
    }
  } {
    const transfers: {
      code: number
      message: string
      data: { count: number; transfers: any[] }
    } = {
      code: 0,
      message: 'Success',
      data: {
        count: 3,
        transfers: [
          {
            from: address,
            to: address,
            success: true,
            hash: '0x3f88e87ec0ced6d64ef5b7b0ac4d0bd6a0ef16131c3fd0b04dda5bab36277727',
            block_num: 7739881,
            block_timestamp: 1637139150,
            module: 'balances',
            amount: '0.01',
            amount_v2: '0',
            amount_v3: '0',
            fee: '154000014'
          },
          {
            from: address,
            to: address,
            success: true,
            hash: '0x3f88e87ec0ced6d64ef5b7b0ac4d0bd6a0ef16131c3fd0b04dda5bab36277727',
            block_num: 7739881,
            block_timestamp: 1637139150,
            module: 'balances',
            amount: '0.01',
            amount_v2: '0',
            amount_v3: '0',
            fee: '154000014'
          }
        ]
      }
    }

    const rewardSlash: {
      code: number
      message: string
      data: { count: number; list: any[] }
    } = {
      code: 0,
      message: 'Success',
      data: {
        count: 3,
        list: [
          {
            account: address,
            amount: '7452710',
            block_num: 5760182,
            block_timestamp: 1625226342,
            event_id: 'Reward',
            event_idx: 15,
            event_index: '5760182-15',
            event_method: 'Reward',
            extrinsic_hash: '0x194d9bbe005bbec27741dd07a29cd2f852e600554ddd91f30f6bbd1d8702744c',
            extrinsic_idx: 1,
            extrinsic_index: '5760182-1',
            module_id: 'staking',
            stash: address
          },
          {
            account: address,
            amount: '7452710',
            block_num: 5760182,
            block_timestamp: 1625226342,
            event_id: 'Reward',
            event_idx: 15,
            event_index: '5760182-15',
            event_method: 'Reward',
            extrinsic_hash: '0x194d9bbe005bbec27741dd07a29cd2f852e600554ddd91f30f6bbd1d8702744c',
            extrinsic_idx: 1,
            extrinsic_index: '5760182-1',
            module_id: 'staking',
            stash: address
          }
        ]
      }
    }

    return {
      first: { transfers, rewardSlash },
      next: {
        transfers: {
          ...transfers,
          data: {
            ...transfers.data,
            transfers: [transfers.data.transfers[0]]
          }
        },
        rewardSlash: {
          ...rewardSlash,
          data: {
            ...rewardSlash.data,
            list: [rewardSlash.data.list[0]]
          }
        }
      }
    }
  }
}

export { TestProtocolSpec, ProtocolHTTPStub }
