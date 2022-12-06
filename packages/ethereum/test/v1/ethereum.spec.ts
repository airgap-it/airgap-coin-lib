import { AirGapTransaction } from '@airgap/module-kit'
import { expect } from 'chai'
import 'mocha'

import { EthereumSignedTransaction, EthereumUnsignedTransaction } from '../../src/v1'

import { EthereumTestProtocolSpec } from './specs/ethereum'

const ethProtocolSpec = new EthereumTestProtocolSpec()

const unsignedTxs: EthereumUnsignedTransaction[] = [
  {
    type: 'unsigned',
    nonce: '0x0',
    gasPrice: '0x4a817c800',
    gasLimit: '0x5208',
    to: '0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e',
    value: '100008',
    chainId: 1,
    data: '0x'
  },
  {
    type: 'unsigned',
    nonce: '0x0',
    gasPrice: '0x4a817c800',
    gasLimit: '0x5208',
    to: '0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e',
    value: '0x010',
    chainId: 1,
    data: '0x'
  }
]

describe(`Proper error handling`, () => {
  it('should return the correct error type ', async () => {
    const protocolMetadata = await ethProtocolSpec.lib.getMetadata()

    try {
      const { secretKey, publicKey } = await ethProtocolSpec.lib.getKeyPairFromSecret(
        { type: 'mnemonic', value: ethProtocolSpec.mnemonic() },
        protocolMetadata.account?.standardDerivationPath
      )

      for (const unsignedTx of unsignedTxs) {
        const signedTx: EthereumSignedTransaction = await ethProtocolSpec.lib.signTransactionWithSecretKey(unsignedTx, secretKey)

        const txsFromUnsigned: AirGapTransaction[] = await ethProtocolSpec.lib.getDetailsFromTransaction(unsignedTx, publicKey)

        const txsFromSigned: AirGapTransaction[] = await ethProtocolSpec.lib.getDetailsFromTransaction(signedTx, publicKey)

        expect(txsFromUnsigned[0].amount).to.deep.equal(txsFromSigned[0].amount)
      }
    } catch (error) {
      console.error(error)
    }
  })
})
