import { TezosProtocol } from '../../src/index'

const tezosProtocol = new TezosProtocol()

const pubKey = '700d993c90aa176d3513d32c8ba411258631d8b15856dbec7b1b45398092c718'

tezosProtocol.prepareTransactionFromPublicKey(pubKey, ['tz1MJx9vhaNRSimcuXPK2rW4fLccQnDAnVKJ'], ['1'], '0.001320').then(res => {
    console.log(res)
    tezosProtocol.getTransactionDetails({publicKey: pubKey, transaction: res}).then(tx => {
        console.log(tx)
    }).catch(error => console.error('error1', error))
}).catch(error => console.error('error2', error))
