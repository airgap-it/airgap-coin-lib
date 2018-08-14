
global.fetch = require('node-fetch')
const chai = require('chai')
const assert = chai.assert
const CoinLib = require('../dist/index')

describe('AirGapMarketWallet', function () {

    it('should display the fiat value of a BTC wallet', function () {
        let wallet = new CoinLib.AirGapMarketWallet('btc', 'xpub6Bv7qYygQufkTA66AXywij8ejyphw49EAPnPYWCryfgRnfUFQhdG2RkMDjXyU59c8LaW3jHvgJdxHai3x2VTYwZhCbMFQvUhxSmWvmBH7qh', true, '')
        wallet.fetchWalletValue().then(value => {
            assert.isAbove(value.toNumber(), 0)
        })
    })

    it('should display the fiat value of an ETH wallet', function () {
        let wallet = new CoinLib.AirGapMarketWallet('eth', '030b6de6d7bdc70570bf08ee7e8e0360e6bd69dc4c07671110f975d9f39ad089d3', false, '')
        wallet.fetchWalletValue().then(value => {
            assert.isAbove(value.toNumber(), 0)
        })
    })

    it('should fetch current price', function () {
        let wallet = new CoinLib.AirGapMarketWallet('btc', '15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi', false, '')
        wallet.fetchCurrentMarketPrice().then(() => {
            assert.isAbove(wallet.currentMarketPrice.toNumber(), 5000)
        })
    })

    it('should fetch daily prices for the specified number of days', function () {
        let wallet = new CoinLib.AirGapMarketWallet('btc', '15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi', false, '')
        wallet.fetchDailyMarketPrices(50).then( data => {
            assert.equal(data.length, 50)
        })
    })

    it('should fetch daily prices for the specified period of days', function () {
        let wallet = new CoinLib.AirGapMarketWallet('btc', '15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi', false, '')
        let date = new Date('2017-03-01')
        let numberOfDays = 50
        wallet.fetchDailyMarketPrices(numberOfDays, date).then( data => {
            let firstTimeStamp = data[0].time
            let lastTimeStamp = data[data.length-1].time
            assert.equal(firstTimeStamp, lastTimeStamp - (numberOfDays-1) * 24 * 60 * 60)
        })
    })

    it('should fetch hourly prices for the specified period of hours', function () {
        let wallet = new CoinLib.AirGapMarketWallet('btc', '15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi', false, '')
        let date = new Date('2017-03-01')
        let numberOfHours = 50
        wallet.fetchHourlyMarketPrices(numberOfHours, date).then( data => {
            let firstTimeStamp = data[0].time
            let lastTimeStamp = data[data.length-1].time
            assert.equal(firstTimeStamp, lastTimeStamp - (numberOfHours-1) * 60 * 60)
        })
    })

    it('should fetch hourly prices for the specified number of hours', function () {
        let wallet = new CoinLib.AirGapMarketWallet('btc', '15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi', false, '')
        let date = new Date('2018-07-20')
        let numberOfHours = 50
        wallet.fetchHourlyMarketPrices(numberOfHours, date).then( data => {
            assert.equal(data.length, 50)
        })
    })

    it('should fetch prices every minute for the specified number of minutes', function () {
        let wallet = new CoinLib.AirGapMarketWallet('btc', '15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi', false, '')
        wallet.fetchMinutesMarketPrices(7).then( data => {
            assert.equal(data.length, 7)
        })
    })

    it('should fetch prices for the specified period of minutes', function () {
        let wallet = new CoinLib.AirGapMarketWallet('btc', '15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi', false, '')
        let date = new Date('2018-07-20')
        let numberOfMinutes = 50
        wallet.fetchMinutesMarketPrices(numberOfMinutes, date).then( data => {
            let firstTimeStamp = data[0].time
            let lastTimeStamp = data[data.length-1].time
            assert.equal(firstTimeStamp, lastTimeStamp - (numberOfMinutes-1) * 60)
            assert.equal(wallet.minuteMarketSample, data)
        })
    })

})
