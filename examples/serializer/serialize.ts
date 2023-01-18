// // tslint:disable:no-console

// import { DeserializedSyncProtocol, SyncProtocolUtils } from '../../packages/core/src'
// import { EncodedType } from '../../packages/serializer/src/v2/serializer'

// const json: DeserializedSyncProtocol = {
//   version: 1,
//   type: EncodedType.UNSIGNED_TRANSACTION,
//   protocol: 'eth',
//   payload: {
//     publicKey: '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
//     transaction: {
//       nonce: '0x0',
//       gasPrice: '0x4a817c800',
//       gasLimit: '0x5208',
//       to: '0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e',
//       value: '0xde0b6b3a7640000',
//       chainId: 1,
//       data: '0x'
//     },
//     callback: 'airgap-wallet://?d='
//   }
// }

// const syncProtocol: SyncProtocolUtils = new SyncProtocolUtils()

// syncProtocol
//   .serialize(json)
//   .then((serialized: string) => {
//     console.log('sync string:', serialized)
//   })
//   .catch((error: Error) => {
//     console.error('SERIALIZE ERROR:', error)
//   })
