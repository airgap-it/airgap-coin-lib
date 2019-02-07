import 'mocha'

import { expect } from 'chai'
import * as sinon from 'sinon'
import { TezosTestProtocolSpec } from './specs/tezos'
import { TezosKtProtocol, isCoinlibReady } from '../../lib'
import axios from 'axios'

const tezosProtocolSpec = new TezosTestProtocolSpec()
const ktTezosLib = new TezosKtProtocol()

describe(`ICoinProtocol KtTezos - Custom Tests`, () => {
  describe('Kt Transactions', () => {
    before(async () => {
      await isCoinlibReady()
      const stub = sinon.stub(axios, 'get')

      stub
        .withArgs(`${ktTezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L/counter`)
        .returns(Promise.resolve({ data: 917315 }))
      stub
        .withArgs(`${ktTezosLib.jsonRPCAPI}/chains/main/blocks/head/hash`)
        .returns(Promise.resolve({ data: 'BMJyc7ga9kLV3vH4kbn6GXbBNjRkLEJVSyovoXyY84Er1zMmKKT' }))
      stub
        .withArgs(`${ktTezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L/balance`)
        .returns(Promise.resolve({ data: 100000000 }))
      stub
        .withArgs(`${ktTezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L/manager_key`)
        .returns(Promise.resolve({ data: { key: 'test-key' } }))
    })

    it('should be able to forge a origination TX', async () => {
      const tz = await ktTezosLib.originate(tezosProtocolSpec.wallet.publicKey)
      expect(tz.binaryTransaction).to.equal(
        'bfaed5702d6c50c8f9142eb96fd7106b9581a4a6eb1457b677de5c6384b9158909000091a9d2b003f19cf5a1f38f04f1000ab482d33176f80ad3fe37904e81020091a9d2b003f19cf5a1f38f04f1000ab482d331760000000000'
      )
    })

    after(async () => {
      sinon.restore()
    })
  })
})
