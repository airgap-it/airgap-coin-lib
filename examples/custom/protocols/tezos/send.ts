import { send } from '../../generic/functions/send-transaction'
import { getTransactionDetailsFromSigned } from '../../generic/functions/get-transaction-details'
import { TezosProtocol } from '../../../src'

const protocol = new TezosProtocol()

const mnemonic = ''

send(protocol, mnemonic, 'tz1SfSYRf31y5EYC6Zn3CVYVnRRt2vQrJXoC', '200000', '1420').then((tx) => {
  getTransactionDetailsFromSigned(protocol, tx).then(console.log)
})
