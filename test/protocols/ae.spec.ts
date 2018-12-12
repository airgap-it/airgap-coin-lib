import 'mocha'

import { expect } from 'chai'
import { AETestProtocolSpec } from './specs/ae'
import { AEProtocol } from '../../lib'
import BigNumber from 'bignumber.js'
import * as sinon from 'sinon'
import axios from 'axios'

const aeProtocolSpec = new AETestProtocolSpec()
const aeLib = aeProtocolSpec.lib as AEProtocol

describe(`ICoinProtocol Aeternity - Custom Tests`, () => {
  beforeEach(() => {
    sinon
      .stub(axios, 'get')
      .withArgs(`${aeLib.epochMiddleware}/middleware/transactions/account/${aeProtocolSpec.wallet.addresses[0]}`)
      .returns(
        Promise.resolve({
          data: {
            transactions: [
              {
                block_height: 443,
                block_hash: 'mh_EoB9uuMGwhncyRgXSqztAz4PqUX41rNLtEcrVPsVwXksf8u58',
                hash: 'th_z8bNzdugQdpiRUVXUmQbxoy5dLLEFLG6StBY95jF1KdXrRxiq',
                signatures: ['sg_JTXgD5WaKbDeVeDQXt9w7MyHXdxFdTqqzUvKFwoYsQZENc2zivckavGhBpX2h2a5QajiewuvsEgc3o7FxEB57oHTEn153'],
                tx: {
                  amount: aeProtocolSpec.wallet.tx.amount.toFixed(),
                  fee: aeProtocolSpec.wallet.tx.fee.toFixed(),
                  nonce: 1,
                  payload: '"create account" 1',
                  recipient_id: aeProtocolSpec.wallet.addresses[0],
                  sender_id: aeProtocolSpec.wallet.addresses[0],
                  ttl: 444,
                  type: 'SpendTx',
                  version: 1
                }
              }
            ]
          }
        })
      )
  })

  afterEach(() => {
    sinon.restore()
  })

  it('can give a list of transactions from endpoints', async () => {
    const transactions = await aeLib.getTransactionsFromAddresses(aeProtocolSpec.wallet.addresses, 0, 0)

    expect(transactions).to.deep.equal([
      {
        amount: new BigNumber(aeProtocolSpec.wallet.tx.amount),
        fee: new BigNumber(aeProtocolSpec.wallet.tx.fee),
        from: aeProtocolSpec.wallet.addresses,
        isInbound: true,
        protocolIdentifier: aeLib.identifier,
        to: aeProtocolSpec.wallet.addresses,
        hash: 'th_z8bNzdugQdpiRUVXUmQbxoy5dLLEFLG6StBY95jF1KdXrRxiq',
        blockHeight: 443
      }
    ])
  })
})
