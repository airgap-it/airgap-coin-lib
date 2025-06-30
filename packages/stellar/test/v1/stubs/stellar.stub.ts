import axios from '@airgap/coinlib-core/dependencies/src/axios-0.19.0/index'
import * as sinon from 'sinon'

import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'

export class StellarProtocolStub implements ProtocolHTTPStub {
  public async balanceStub(testProtocolSpec: TestProtocolSpec) {
    sinon.restore()

    const address = testProtocolSpec.wallet.addresses[0]
    const horizonUrl = (await testProtocolSpec.lib.getNetwork()).rpcUrl

    sinon
      .stub(axios, 'get')
      .withArgs(`${horizonUrl}/accounts/${address}`)
      .returns(
        Promise.resolve({
          data: {
            balances: [{ asset_type: 'native', balance: '0.0000000' }]
          }
        })
      )
  }

  public async transactionListStub(testProtocolSpec: TestProtocolSpec, address: string): Promise<any> {
    sinon.restore()

    const horizonUrl = (await testProtocolSpec.lib.getNetwork()).rpcUrl
    const transactions = testProtocolSpec.transactionList(address)

    sinon
      .stub(axios, 'get')
      .withArgs(
        `${horizonUrl}/accounts/${address}/payments?limit=${transactions.first.data._embedded.records.length}&order=desc&join=transactions`
      )
      .returns(Promise.resolve(transactions.first))
      .withArgs(`${transactions.first.data._links.next.href}`)
      .returns(Promise.resolve(transactions.next))
  }

  public async loadAccountStub(testProtocolSpec: TestProtocolSpec, address: string) {
    sinon
      .stub(testProtocolSpec.lib.server, 'loadAccount')
      .withArgs(address)
      .resolves({ ...getAccount(address) })
  }
}

function getAccount(address: string) {
  const account = {
    _baseAccount: {
      _accountId: address
    },
    id: address,
    account_id: address,
    sequence: '3841057972289557',
    sequence_ledger: 1326609,
    sequence_time: '1749044462',
    subentry_count: 0,
    last_modified_ledger: 1326609,
    last_modified_time: '2025-06-04T13:41:02Z',
    thresholds: { low_threshold: 2, med_threshold: 2, high_threshold: 2 },
    flags: {
      auth_required: false,
      auth_revocable: false,
      auth_immutable: false,
      auth_clawback_enabled: false
    },
    balances: [
      {
        balance: '1.0000000',
        buying_liabilities: '0.0000000',
        selling_liabilities: '0.0000000',
        asset_type: 'native'
      }
    ],
    signers: [
      {
        weight: 1,
        key: address,
        type: 'ed25519_public_key'
      },
      {
        weight: 1,
        key: 'GCM6FFRCYBBS2DUFLCNGBYTVQH4LDA3BCPBKCLJ72ATROTHYTHXCO2RB',
        type: 'ed25519_public_key'
      }
    ],
    num_sponsoring: 0,
    num_sponsored: 0,
    paging_token: address,
    data_attr: {},

    sequenceNumber(): string {
      return this.sequence
    },

    accountId(): string {
      return this.id
    },

    incrementSequenceNumber(): void {
      this.sequence = String(Number(this.sequence) + 1)
    }
  }

  return account
}
