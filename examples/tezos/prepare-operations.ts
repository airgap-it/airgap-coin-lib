import { TezosProtocol } from '../../src/index'
import { TezosOperationType } from '../../src/protocols/tezos/TezosProtocol'

const tezosProtocol = new TezosProtocol()

const pubKey = '700d993c90aa176d3513d32c8ba411258631d8b15856dbec7b1b45398092c718'

tezosProtocol.prepareOperations(pubKey, [{kind: TezosOperationType.TRANSACTION, destination: 'tz1MJx9vhaNRSimcuXPK2rW4fLccQnDAnVKJ', amount: '1'} as any]).then(res => {
    console.log(res)
    tezosProtocol.getTransactionDetails({publicKey: pubKey, transaction: res}).then(tx => {
        console.log(tx)
    }).catch(error => console.error('error1', error))
}).catch(error => console.error('error2', error))
