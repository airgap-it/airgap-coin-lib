import 'mocha'

import { expect } from 'chai'
import * as sinon from 'sinon'
import { TezosTestProtocolSpec } from './specs/tezos'
import { TezosKtProtocol, isCoinlibReady } from '../../lib'
import axios from 'axios'
import { TezosOperationType, TezosDelegationOperation, TezosOriginationOperation } from '../../lib/protocols/tezos/TezosProtocol'

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
      stub.withArgs(`${ktTezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/KT1RBMUbb7QSD46VXhAvaMiyVSoys6QZiTxN`).returns(
        Promise.resolve({
          data: {
            delegate: {
              setable: true
            }
          }
        })
      )
      stub.withArgs(`${ktTezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy`).returns(
        Promise.resolve({
          data: {
            delegate: {
              setable: true,
              value: 'tz1cX93Q3KsiTADpCC4f12TBvAmS5tw7CW19'
            }
          }
        })
      )
    })

    it('should be able to forge and unforge an origination TX', async () => {
      const tz = await ktTezosLib.originate(tezosProtocolSpec.wallet.publicKey)
      expect(tz.binaryTransaction).to.equal(
        'd2794ab875a213d0f89e6fc3cf7df9c7188f888cb7fa435c054b85b1778bb95509000091a9d2b003f19cf5a1f38f04f1000ab482d33176f80ac4fe37904e81020091a9d2b003f19cf5a1f38f04f1000ab482d3317600ffff0000'
      )

      const tezosWrappedOperation = ktTezosLib.unforgeUnsignedTezosWrappedOperation(tz.binaryTransaction)
      const tezosOriginationOperation = tezosWrappedOperation.contents[0] as TezosOriginationOperation

      expect(tezosOriginationOperation.kind, 'kind').to.equal(TezosOperationType.ORIGINATION)
      expect(tezosOriginationOperation.source, 'source').to.equal('tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L')
      expect(tezosOriginationOperation.fee, 'fee').to.equal('1400')
      expect(tezosOriginationOperation.counter, 'counter').to.equal('917316')
      expect(tezosOriginationOperation.gas_limit, 'gas_limit').to.equal('10000')
      expect(tezosOriginationOperation.storage_limit, 'storage_limit').to.equal('257')
      expect(tezosOriginationOperation.managerPubkey, 'managerPubkey').to.equal('tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L')
      expect(tezosOriginationOperation.balance, 'balance').to.equal('0')
      expect(tezosOriginationOperation.delegatable, 'delegatable').to.equal(true)
      expect(tezosOriginationOperation.spendable, 'spendable').to.equal(true)
    })

    it('should be able to forge and unforge a delegation TX', async () => {
      /**
       * Delegate KT1 -> TZ1
       */
      const tz = await ktTezosLib.delegate(
        tezosProtocolSpec.wallet.publicKey,
        'KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy',
        'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'
      )

      const tezosWrappedOperation = ktTezosLib.unforgeUnsignedTezosWrappedOperation(tz.binaryTransaction)
      const tezosDelegationOperation = tezosWrappedOperation.contents[0] as TezosDelegationOperation

      expect(tezosDelegationOperation.kind, 'kind').to.equal(TezosOperationType.DELEGATION)
      expect(tezosDelegationOperation.source, 'source').to.equal('KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy')
      expect(tezosDelegationOperation.fee, 'fee').to.equal('1420')
      expect(tezosDelegationOperation.counter, 'counter').to.equal('917316')
      expect(tezosDelegationOperation.gas_limit, 'gas_limit').to.equal('10000')
      expect(tezosDelegationOperation.storage_limit, 'storage_limit').to.equal('0')
      expect(tezosDelegationOperation.delegate, 'delegate').to.equal('tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L')

      expect(tz.binaryTransaction).to.equal(
        'd2794ab875a213d0f89e6fc3cf7df9c7188f888cb7fa435c054b85b1778bb9550a01ba4e7349ac25dc5eb2df5a43fceacc58963df4f5008c0bc4fe37904e00ff0091a9d2b003f19cf5a1f38f04f1000ab482d33176'
      )

      /**
       * Delegate TZ1 -> TZ1
       */
      const tz2 = await ktTezosLib.delegate(
        tezosProtocolSpec.wallet.publicKey,
        'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L',
        'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'
      )

      const tezosWrappedOperation2 = ktTezosLib.unforgeUnsignedTezosWrappedOperation(tz2.binaryTransaction)
      const tezosDelegationOperation2 = tezosWrappedOperation2.contents[0] as TezosDelegationOperation

      expect(tezosDelegationOperation2.kind, 'kind').to.equal(TezosOperationType.DELEGATION)
      expect(tezosDelegationOperation2.source, 'source').to.equal('tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L')
      expect(tezosDelegationOperation2.fee, 'fee').to.equal('1420')
      expect(tezosDelegationOperation2.counter, 'counter').to.equal('917316')
      expect(tezosDelegationOperation2.gas_limit, 'gas_limit').to.equal('10000')
      expect(tezosDelegationOperation2.storage_limit, 'storage_limit').to.equal('0')
      expect(tezosDelegationOperation2.delegate, 'delegate').to.equal('tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L')

      expect(tz2.binaryTransaction).to.equal(
        'd2794ab875a213d0f89e6fc3cf7df9c7188f888cb7fa435c054b85b1778bb9550a000091a9d2b003f19cf5a1f38f04f1000ab482d331768c0bc4fe37904e00ff0091a9d2b003f19cf5a1f38f04f1000ab482d33176'
      )
    })

    it('should be able to forge a un-delegation TX', async () => {
      const tz = await ktTezosLib.undelegate(tezosProtocolSpec.wallet.publicKey, 'KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy')

      const tezosWrappedOperation = ktTezosLib.unforgeUnsignedTezosWrappedOperation(tz.binaryTransaction)
      const tezosDelegationOperation = tezosWrappedOperation.contents[0] as TezosDelegationOperation

      expect(tezosDelegationOperation.kind, 'kind').to.equal(TezosOperationType.DELEGATION)
      expect(tezosDelegationOperation.source, 'source').to.equal('KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy')
      expect(tezosDelegationOperation.fee, 'fee').to.equal('1420')
      expect(tezosDelegationOperation.counter, 'counter').to.equal('917316')
      expect(tezosDelegationOperation.gas_limit, 'gas_limit').to.equal('10000')
      expect(tezosDelegationOperation.storage_limit, 'storage_limit').to.equal('0')
      expect(tezosDelegationOperation.delegate, 'delegate').to.equal(undefined)

      expect(tz.binaryTransaction).to.equal(
        'd2794ab875a213d0f89e6fc3cf7df9c7188f888cb7fa435c054b85b1778bb9550a01ba4e7349ac25dc5eb2df5a43fceacc58963df4f5008c0bc4fe37904e0000'
      )
    })

    it('should be able to check the delegation state of an KT address', async () => {
      const delegatedState = await ktTezosLib.isAddressDelegated('KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy')

      expect(delegatedState.isDelegated).to.equal(true)
      expect(delegatedState.setable).to.equal(true)
      expect(delegatedState.value).to.equal('tz1cX93Q3KsiTADpCC4f12TBvAmS5tw7CW19')

      const undelegatedState = await ktTezosLib.isAddressDelegated('KT1RBMUbb7QSD46VXhAvaMiyVSoys6QZiTxN')

      expect(undelegatedState.isDelegated).to.equal(false)
      expect(undelegatedState.setable).to.equal(true)
      expect(undelegatedState.value).to.equal(undefined)
    })

    after(async () => {
      sinon.restore()
    })
  })
})
