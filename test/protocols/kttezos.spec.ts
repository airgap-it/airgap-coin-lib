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
        'd2794ab875a213d0f89e6fc3cf7df9c7188f888cb7fa435c054b85b1778bb95509000091a9d2b003f19cf5a1f38f04f1000ab482d33176f80ac4fe37904e81020091a9d2b003f19cf5a1f38f04f1000ab482d3317600ffff0000'
      )
    })

    it('should be able to forge a delegation TX', async () => {
      const tz = await ktTezosLib.delegate(tezosProtocolSpec.wallet.publicKey, 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L')
      expect(tz.binaryTransaction).to.equal(
        'd2794ab875a213d0f89e6fc3cf7df9c7188f888cb7fa435c054b85b1778bb9550a000091a9d2b003f19cf5a1f38f04f1000ab482d33176f80ac4fe37904e00ff0091a9d2b003f19cf5a1f38f04f1000ab482d33176'
      )
    })

    it('should be able to forge a un-delegation TX', async () => {
      const tz = await ktTezosLib.undelegate(tezosProtocolSpec.wallet.publicKey)
      expect(tz.binaryTransaction).to.equal(
        'd2794ab875a213d0f89e6fc3cf7df9c7188f888cb7fa435c054b85b1778bb9550a000091a9d2b003f19cf5a1f38f04f1000ab482d33176f80ac4fe37904e0000'
      )
    })

    after(async () => {
      sinon.restore()
    })
  })
})
