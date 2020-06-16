global.fetch = require('node-fetch') // cryptocompare needs fetch internally
const chai = require('chai')
const expect = chai.expect
const CoinLib = require('../dist/index')

const btcProtocol = new CoinLib.BitcoinProtocol()

CoinLib.addSupportedProtocol(btcProtocol)

describe('AirGapMarketWallet', async () => {
  it('should display the fiat value of a BTC wallet', async () => {
    let wallet = new CoinLib.AirGapMarketWallet(
      btcProtocol,
      'xpub6Bv7qYygQufkTA66AXywij8ejyphw49EAPnPYWCryfgRnfUFQhdG2RkMDjXyU59c8LaW3jHvgJdxHai3x2VTYwZhCbMFQvUhxSmWvmBH7qh',
      true,
      ''
    )
    const data = await wallet.fetchWalletValue()
    expect(data.toNumber()).to.be.above(0)
  })

  // TODO: infura proxy is not working currently. Can be commented in again once it works.
  // it('should display the fiat value of an ETH wallet', async () => {
  //   let wallet = new CoinLib.AirGapMarketWallet('eth', '030b6de6d7bdc70570bf08ee7e8e0360e6bd69dc4c07671110f975d9f39ad089d3', false, '')
  //   const data = await wallet.fetchWalletValue()
  //   expect(data.toNumber()).to.be.above(0)
  // })

  it('should fetch current price', async () => {
    let wallet = new CoinLib.AirGapMarketWallet(btcProtocol, '15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi', false, '')
    const data = await wallet.fetchCurrentMarketPrice()
    expect(wallet.currentMarketPrice.toNumber()).to.be.above(0)
  })

  it('should fetch daily prices for the specified number of days', async () => {
    let wallet = new CoinLib.AirGapMarketWallet(btcProtocol, '15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi', false, '')
    const data = await wallet.fetchDailyMarketPrices(50)
    expect(data.length).to.be.equal(50)
  })

  it('should fetch daily prices for the specified period of days', async () => {
    let wallet = new CoinLib.AirGapMarketWallet(btcProtocol, '15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi', false, '')
    let date = new Date('2017-03-01')
    let numberOfDays = 50
    const data = await wallet.fetchDailyMarketPrices(numberOfDays, date)
    let firstTimeStamp = data[0].time
    let lastTimeStamp = data[data.length - 1].time
    expect(firstTimeStamp).to.be.equal(lastTimeStamp - (numberOfDays - 1) * 24 * 60 * 60)
  })

  it('should fetch hourly prices for the specified period of hours', async () => {
    let wallet = new CoinLib.AirGapMarketWallet(btcProtocol, '15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi', false, '')
    let date = new Date('2017-03-01')
    let numberOfHours = 50
    const data = await wallet.fetchHourlyMarketPrices(numberOfHours, date)
    let firstTimeStamp = data[0].time
    let lastTimeStamp = data[data.length - 1].time
    expect(firstTimeStamp).to.be.equal(lastTimeStamp - (numberOfHours - 1) * 60 * 60)
  })

  it('should fetch hourly prices for the specified number of hours', async () => {
    let wallet = new CoinLib.AirGapMarketWallet(btcProtocol, '15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi', false, '')
    let date = new Date('2018-07-20')
    let numberOfHours = 50
    const data = await wallet.fetchHourlyMarketPrices(numberOfHours, date)
    expect(data.length).to.be.equal(50)
  })

  it('should fetch prices every minute for the specified number of minutes', async () => {
    let wallet = new CoinLib.AirGapMarketWallet(btcProtocol, '15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi', false, '')
    const data = await wallet.fetchMinutesMarketPrices(7)
    expect(data.length).to.be.equal(7)
  })

  it('should fetch prices for the specified period of minutes', async () => {
    let wallet = new CoinLib.AirGapMarketWallet(btcProtocol, '15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi', false, '')
    let date = new Date(new Date().getTime() - 1000 * 60 * 60 * 10)
    let numberOfMinutes = 50
    const data = await wallet.fetchMinutesMarketPrices(numberOfMinutes, date)
    let firstTimeStamp = data[0].time
    let lastTimeStamp = data[data.length - 1].time
    expect(firstTimeStamp).to.be.equal(lastTimeStamp - (numberOfMinutes - 1) * 60)
    expect(wallet.minuteMarketSample).to.be.equal(data)
  })
})
