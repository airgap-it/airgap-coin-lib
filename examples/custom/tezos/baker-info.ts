// tslint:disable:no-console

import { BakerInfo, TezosKtProtocol } from '../../../src'

const kt: TezosKtProtocol = new TezosKtProtocol()

const bakerAddress: string = 'tz1MJx9vhaNRSimcuXPK2rW4fLccQnDAnVKJ'

kt.bakerInfo(bakerAddress)
  .then((info: BakerInfo) => {
    console.log('balance', info.balance.toNumber() / 1000000)
    console.log('delegatedBalance', info.delegatedBalance.toNumber() / 1000000)
    console.log('stakingBalance', info.stakingBalance.toNumber() / 1000000)
    console.log('selfBond', info.selfBond.toNumber() / 1000000)
    console.log('bakerCapacity', info.bakerCapacity.toNumber() / 1000000)
    console.log('bakerUsage', info.bakerUsage.toNumber())
  })
  .catch((error: Error) => {
    console.error('BAKER_INFO ERROR:', error)
  })
