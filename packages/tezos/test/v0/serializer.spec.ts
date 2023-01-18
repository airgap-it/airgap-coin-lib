import { Serializer } from '@airgap/serializer'
import { FullPayload } from '@airgap/serializer/v2/payloads/full-payload'
import { expect } from 'chai'
import 'mocha'

import { TestProtocolSpec } from './implementations'
import { TezosTestProtocolSpec } from './specs/tezos'

const protocols = [new TezosTestProtocolSpec()]

protocols.forEach((protocol: TestProtocolSpec) => {
  let serializer: Serializer

  describe(`Serialization Protocol for ${protocol.name} (v0)`, () => {
    beforeEach(() => {
      serializer = new (Serializer as any)()
      protocol.schemasV2.forEach((schema) => {
        serializer.addSchema(schema.type, schema.info, protocol.lib.identifier)
      })
    })
    it(`should be able to serialize a transaction to a airgap protocol string`, async () => {
      for (const tx of protocol.txs) {
        const txBefore = await protocol.unsignedTransaction(tx)
        serializer
          .serialize(txBefore)
          .then((serializedTx: string[]) => {
            serializer
              .deserialize(serializedTx)
              .then((deserializedTx) => {
                const objExpected = JSON.parse(JSON.stringify(deserializedTx[0]))
                const objActual = JSON.parse(JSON.stringify(txBefore[0]))
                expect(objExpected).to.deep.eq(objActual)
                expect(objExpected.id).to.deep.eq(objActual.id)
                expect(objExpected.type).to.deep.eq(objActual.type)
                expect(objExpected.protocol).to.deep.eq(objActual.protocol)
                expect(objExpected.payload).to.deep.eq(objActual.payload)
              })
              .catch((err) => console.error(err))
          })
          .catch((err) => console.error(err))
      }
    })

    it(`should break serialized transaction into correct number of chunks`, async () => {
      const chunkSizeCombos = [
        {
          singleChunkSize: 350,
          multiChunkSize: 100
        },
        {
          singleChunkSize: 200,
          multiChunkSize: 100
        },
        {
          singleChunkSize: 350,
          multiChunkSize: 200
        },
        {
          singleChunkSize: 500,
          multiChunkSize: 10
        },
        {
          singleChunkSize: 10,
          multiChunkSize: 200
        }
      ]
      for (const tx of protocol.txs) {
        for (const chunkSizeCombo of chunkSizeCombos) {
          const data = await protocol.unsignedTransaction(tx)
          const payload: FullPayload = FullPayload.fromDecoded(data)
          const rawPayload: Buffer = payload.asBuffer(serializer)
          const bytes = rawPayload.length
          const serializedTx = await serializer.serialize(data, chunkSizeCombo.singleChunkSize, chunkSizeCombo.multiChunkSize)
          if (bytes < chunkSizeCombo.singleChunkSize) {
            expect(serializedTx.length).to.eq(1) // it fits into one QR!
          } else {
            // many QRs needed
            expect(serializedTx.length).to.eq(Math.ceil(rawPayload.length / chunkSizeCombo.multiChunkSize))
          }
        }
      }
    })
    /*

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
