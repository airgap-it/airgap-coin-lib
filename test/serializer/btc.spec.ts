import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import 'mocha'

import { IACMessageDefinitionObject, IACMessageType, Serializer } from '../../src'
import { MainProtocolSymbols } from '../../src/utils/ProtocolSymbols'

// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect: Chai.ExpectStatic = chai.expect

const serializeAndDeserialize = async (messages: IACMessageDefinitionObject[], size: number) => {
  const serializer: Serializer = new Serializer()

  const result: string[] = await serializer.serialize(messages, size)

  const serializer2: Serializer = new Serializer()

  const reconstructed: IACMessageDefinitionObject[] = await serializer2.deserialize(result)

  return reconstructed
}

describe(`Serializer (BTC)`, async () => {
  it('should correctly serialize and deserialize a v2 (first version) bitcoin sign response', async () => {
    const syncCode =
      'Gfeetd57BGjJdZNGa2RFaYNASLxbbvnUCphrgCthrSv3C8pt8Vt5awPZj9pe64jQUeHDpWNPczcUVrruB331UJVRh2RsCgdH4rBuwVpPqVUzcK7kUbMpZ3MSGZJLXt9DhWmqSHCNt6ihVqkZyepfbfYb2Cno,Gfeetd57BJPpnkzFkZCxmW1CWqzrnuPwbArEvGTD44UBzN3VLQqCrM953YmPMsFaMaBQXdd37khXRoEts35W3LE1rdfHrNuyJTydqM1x4EtKnk79QKbvhorbnx56WiGNP3wAxhE78nVDWzbyfWwoYrt5Q4kp,Gfeetd57BL4Lwy34oMbobcsXJwdeZpm3KNsd16ZZTAe9VeU1KYhUqHRLnaTa93cKrumunDmCfrFGEmZ7uSam2oVcrZEvqshDvhHRzByJ8mhSVApBgvbZuMGQ9dQBbmxGF2KtrBizwGXoqXMcXmn1Hzaf5CaY,Gfeetd57BMis7BKSAPDCBryvzWVsiwFGr4zKtLqy66Z8B5DvcyKjZ9wb9GkK4Bi8kw4JbbFvz3RgFcDo5ogBwsmZ7ZMeeAEDBxVhGFw6MonzYQNxrXmBtqY7JdpnmF9mwJihfbztDTEf8u4RKx5ozD7RBSyZ,Gfeetd57BPPPGPajQoCUWNVrwbgdVbGEhzTNHy2x3LkcWeQpDXN7aeJM5S7mYHKmM8EgWnueDq5h6Ew8frThsF2eXzLfB427HPujHY5x8yhCQuDCpQ6HH5t5vXTNcEx8B9hfbcid54njx9WznMs9u7cGWuzJ,HB6K2QCAYxGBtAYeKD7QF7crdLC9UiUp1SUzZ8mFt9ehuygFzvgYMryMRdJzY5LgVfDe2EvJHzHn571MEQvbCBoRurUrz9u4ZkmX'
    const parts = syncCode.split(',')

    const serializer: Serializer = new Serializer()

    const reconstructed: IACMessageDefinitionObject[] = await serializer.deserialize(parts)

    expect(reconstructed[0]).to.deep.equal({
      type: 6,
      protocol: 'btc',
      id: reconstructed[0].id, // ID is generated randomly because it doesn't exist
      payload: {
        accountIdentifier: '2aARXc',
        amount: '2000',
        fee: '2000',
        from: ['183XzNbDspYzBE2BF55WS233BqsxMQiBS6'],
        to: ['1DMxQBjjz4ss1CZfqaE4uqNyQtyx8HdJ8w'],
        transaction:
          '0100000001cdeb9462061394fb98639f5b865109367e3901fb68d4263d7f1f4b9e1b9d33da010000006b483045022100c28a236687b222a54b21b52bd19fd6431b5ec747e1ca503309015eaf61bb06d9022076fa9a91673930779ab95f3f9c6e93e57e6c16a34c86e88fff61ae9787bd91160121028136b6e75b004f4fba6583cfd77216d4f67964bdaf97d82eceea1d1806c1d1a5ffffffff02d0070000000000001976a914879812f2d8920b22b62162a0c4a80d0266fa8a7a88acd8090000000000001976a91473990bf72773932450e34c078a2fb3249e31902188ac00000000'
      }
    })
  })

  it('should correctly serialize and deserialize a bitcoin sign response', async () => {
    const signedBitcoinTransaction: IACMessageDefinitionObject = {
      id: 'random__id',
      type: IACMessageType.TransactionSignResponse,
      protocol: MainProtocolSymbols.BTC,
      payload: {
        from: ['addr1', 'addr2'],
        to: ['addr3', 'addr4'],
        amount: '123',
        fee: '321',
        accountIdentifier: 'identifier',
        transaction: '000402040204100'
      }
    }

    const reconstructed: IACMessageDefinitionObject[] = await serializeAndDeserialize([signedBitcoinTransaction], 100)

    expect(reconstructed).to.deep.equal([signedBitcoinTransaction])
  })
})
