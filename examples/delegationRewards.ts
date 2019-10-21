import { TezosProtocol } from '../src'

const tezosProtocol: TezosProtocol = new TezosProtocol()
// tz1MJx9vhaNRSimcuXPK2rW4fLccQnDAnVKJ: AirGap
tezosProtocol
  .calculateRewards('tz1eEnQhbwf6trb8Q8mPb2RaPkNk2rN7BKi8', 154)
  .then(result => {
    console.log('REWARDS', result)
    tezosProtocol.calculatePayouts(result, 0, 10).then(result => {
      console.log('PAYOUTS', result)
    })
  })
  .catch(error => {
    console.log(error)
  })
