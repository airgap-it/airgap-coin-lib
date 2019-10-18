import { TezosProtocol } from '../src'

const tezosProtocol: TezosProtocol = new TezosProtocol()

tezosProtocol
  .calculateRewards('tz1MJx9vhaNRSimcuXPK2rW4fLccQnDAnVKJ', 159)
  .then(result => {
    console.log('REWARDS', result)
    tezosProtocol.calculatePayouts(result, 0, result.delegatedContracts.length).then(result => {
      console.log('PAYOUTS', result)
    })
  })
  .catch(error => {
    console.log(error)
  })
