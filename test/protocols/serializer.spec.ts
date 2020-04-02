import { expect } from 'chai'
import 'mocha'

// import { IACMessageDefinitionObject } from '../../src/serializer/message'
import { Serializer } from '../../src/serializer/serializer'

import { TestProtocolSpec } from './implementations'
import { EthereumTestProtocolSpec } from './specs/ethereum'

import { AETestProtocolSpec } from './specs/ae'
import { BitcoinProtocolSpec } from './specs/bitcoin'
import { CosmosTestProtocolSpec } from './specs/cosmos'
import { GenericERC20TokenTestProtocolSpec } from './specs/generic-erc20-token'
import { TezosTestProtocolSpec } from './specs/tezos'

const protocols = [
  new EthereumTestProtocolSpec(),
  new BitcoinProtocolSpec(),
  new AETestProtocolSpec(),
  new CosmosTestProtocolSpec(),
  new TezosTestProtocolSpec(),
  new GenericERC20TokenTestProtocolSpec()
]

protocols.forEach((protocol: TestProtocolSpec) => {
  const syncProtocol = new Serializer()

  describe(`Serialization Protocol for ${protocol.name}`, () => {
    it(`should be able to serialize a transaction to a airgap protocol string`, async () => {
      for (const tx of protocol.txs) {
        syncProtocol
          .serialize(protocol.unsignedTransaction(tx))
          .then((serializedTx: string[]) => {
            syncProtocol
              .deserialize(serializedTx)
              .then(deserializedTx => {
                expect(JSON.parse(JSON.stringify(protocol.unsignedTransaction(tx)))).to.deep.equal(
                  JSON.parse(JSON.stringify(deserializedTx))
                )
              })
              .catch(err => console.error(err))
          })
          .catch(err => console.error(err))
      }
    })
    /*
    it(`should be able to properly extract amount/fee using getTransactionDetails in combination with the coin-lib`, async () => {
      for (const tx of protocol.txs) {
        const serializedTx = syncProtocol.serialize(protocol.unsignedTransaction(tx))
        const deserializedTxs = syncProtocol.deserialize(serializedTx)
        const deserializedTx = deserializedTxs[0]

        const airGapTxs: IAirGapTransaction[] = await protocol.lib.getTransactionDetails(deserializedTx.data as UnsignedTransaction)

        if (airGapTxs.length !== 1) {
          throw new Error('Unexpected number of transactions')
        }

        const airGapTx: IAirGapTransaction = airGapTxs[0]

        expect(airGapTx.from).to.deep.equal(protocol.wallet.addresses)
        expect(airGapTx.amount).to.deep.equal(tx.amount)
        expect(airGapTx.fee).to.deep.equal(tx.fee)
      }
    })

    it(`should be able to properly extract amount/fee using from signedTx in combination with the coin-lib`, async () => {
      for (const tx of protocol.txs) {
        const serializedTx = syncProtocol.serialize(protocol.signedTransaction(tx))

        const deserializedTxs: IACMessageDefinition[] = syncProtocol.deserialize(serializedTx)
        const deserializedTx: IACMessageDefinition = deserializedTxs[0]

        const airGapTxs = await protocol.lib.getTransactionDetailsFromSigned(deserializedTx.data as SignedTransaction)

        if (airGapTxs.length !== 1) {
          throw new Error('Unexpected number of transactions')
        }

        const airGapTx: IAirGapTransaction = airGapTxs[0]

        // console.log('airGapTx', airGapTx)
        expect(airGapTx.from).to.deep.equal(tx.from)
        expect(airGapTx.amount).to.deep.equal(tx.amount)
        expect(airGapTx.fee).to.deep.equal(tx.fee)
      }
    })

    it(`should be able to serialize and deserialize a sync-wallet request`, async () => {
      for (const tx of protocol.txs) {
        const serializedWalletRequest = syncProtocol.serialize(protocol.signedTransaction(tx))
        const deserializedWalletRequest = syncProtocol.deserialize(serializedWalletRequest)

        expect(protocol.signedTransaction(tx)).to.deep.equal(deserializedWalletRequest)
      }
    })

    it(`should be able to serialize and deserialize a signed-tx request`, async () => {
      for (const tx of protocol.txs) {
        const serializedSignedTx = syncProtocol.serialize(protocol.signedTransaction(tx))
        const deserializedTx = syncProtocol.deserialize(serializedSignedTx)

        expect(protocol.signedTransaction(tx)).to.deep.equal(deserializedTx)
      }
    })

    it(`should be able to properly construct the protocol from a unsigned tx`, async () => {
      for (const tx of protocol.txs) {
        const serializedTx = syncProtocol.serialize(protocol.unsignedTransaction(tx))
        const deserializedTxs: IACMessageDefinition[] = syncProtocol.deserialize(serializedTx)
        const deserializedTx: IACMessageDefinition = deserializedTxs[0]

        if (!deserializedTx.protocol) {
          throw new Error('No protocol present')
        }

        const reConstructedProtocol = getProtocolByIdentifier(deserializedTx.protocol)

        expect(protocol.lib.identifier).to.equal(reConstructedProtocol.identifier)
      }
    })

    it(`should be able to serialize and deserialize a message sign request`, async () => {
      const originalJson = [
        {
          protocol: protocol.lib.identifier,
          type: 3,
          data: {
            message: 'TestMessage'
          }
        }
      ]

      const serialized: string[] = syncProtocol.serialize(originalJson)
      const deserialized: IACMessageDefinition[] = syncProtocol.deserialize(serialized)

      expect(originalJson).to.deep.equal(deserialized)
    })

    it(`should be able to serialize and deserialize a message sign response`, async () => {
      const originalJson = [
        {
          protocol: protocol.lib.identifier,
          type: 4,
          data: {
            message: 'TestMessage',
            signature: 'asdfasdf'
          }
        }
      ]

      const serialized: string[] = syncProtocol.serialize(originalJson)
      const deserialized: IACMessageDefinition[] = syncProtocol.deserialize(serialized)

      expect(originalJson).to.deep.equal(deserialized)
    }) */
  })
})
