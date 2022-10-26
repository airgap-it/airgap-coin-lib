// import { expect } from 'chai'
// import 'mocha'

// import * as rlp from '../../src/dependencies/src/rlp-2.2.3/index'
// import { jsonToArray, rlpArrayToJson, unwrapSchema } from '../../src/serializer/json-to-rlp/json-to-rlp'
// // import { AccountShareResponse } from '../../src/serializer/v2/schemas/definitions/account-share-response'
// // import { MessageSignRequest } from '../../src/serializer/v2/schemas/definitions/message-sign-request'
// // import { MessageSignResponse } from '../../src/serializer/v2/schemas/definitions/message-sign-response'

// export const testSchema = {
//   $schema: 'http://json-schema.org/draft-07/schema#',
//   title: 'Test Schema',
//   description: 'A schema to test the json to rlp feature.',
//   type: 'object',

//   properties: {
//     testInteger: {
//       type: 'integer'
//     },

//     testString: {
//       type: 'string'
//     },

//     testBoolean: {
//       type: 'boolean'
//     },

//     testObject: {
//       type: 'object',

//       properties: {
//         testNestedInteger: {
//           type: 'integer'
//         }
//       }
//     }
//     /*
//     testArray: {
//       type: 'array'
//     }
// 	*/
//   }
// }

// function getValidJson() {
//   return {
//     testInteger: 1,
//     testString: 'I am a text.',
//     testBoolean: true,
//     testObject: {
//       testNestedInteger: 2
//     }
//     // testArray: ['3']
//   }
// }

// describe(`JSON to RLP`, () => {
//   it('should correctly serialize and deserialize a json object', async () => {
//     const json = getValidJson()
//     const rlpEncoded = rlp.encode(jsonToArray('root', testSchema, json))

//     console.log('rlp hex', rlpEncoded.toString('hex'))
//     expect(rlpEncoded.toString('hex')).to.equal('d13131c1328c4920616d206120746578742e')

//     const decodedJson = rlpArrayToJson(unwrapSchema(testSchema), rlp.decode(rlpEncoded as any, false))
//     expect(decodedJson).to.deep.equal(json)
//   })

//   describe(`serializer messages`, () => {
//     it('should correctly serialize and deserialize "accountShareResponse"', async () => {
//       const json: AccountShareResponse = {
//         publicKey: '1',
//         derivationPath: '2',
//         isExtendedPublicKey: true
//       }

//       const rlp = jsonToRlp(unwrapSchema(accountShareResponse), json)

//       expect(rlp.toString('hex')).to.equal('c3323131')

//       const decodedJson = rlpToJson(unwrapSchema(accountShareResponse), rlp as any)
//       expect(decodedJson).to.deep.equal(json)
//     })

//     it('should correctly serialize and deserialize "messageSignRequest"', async () => {
//       const json: MessageSignRequest = {
//         message: 'test',
//         publicKey: 'pubkey',
//         ttl: '1',
//         origin: 'https://airgap.it',
//         callbackURL: 'https://airgap.it?signedMessage='
//       }

//       const rlp = jsonToRlp(unwrapSchema(messageSignRequest), json)

//       console.log('rlp hex', rlp.toString('hex'))
//       expect(rlp.toString('hex')).to.equal(
//         'f840a068747470733a2f2f6169726761702e69743f7369676e65644d6573736167653d84746573749168747470733a2f2f6169726761702e6974867075626b657931'
//       )

//       const decodedJson: MessageSignRequest | undefined = rlpToJson(unwrapSchema(messageSignRequest), rlp as any)
//       expect(decodedJson).to.deep.equal(json)
//     })

//     it('should correctly serialize and deserialize "messageSignResponse"', async () => {
//       const json: MessageSignResponse = {
//         message: 'test',
//         signature: 'sig',
//         ttl: '1',
//         origin: 'https://airgap.it',
//         callbackURL: 'https://airgap.it?signedMessage='
//       }

//       const rlp = jsonToRlp(unwrapSchema(messageSignResponse), json)

//       console.log('rlp hex', rlp.toString('hex'))
//       expect(rlp.toString('hex')).to.equal(
//         'f83da068747470733a2f2f6169726761702e69743f7369676e65644d6573736167653d84746573749168747470733a2f2f6169726761702e69748373696731'
//       )

//       const decodedJson: MessageSignResponse | undefined = rlpToJson(unwrapSchema(messageSignResponse), rlp as any)
//       expect(decodedJson).to.deep.equal(json)
//     })
//   })
// })
