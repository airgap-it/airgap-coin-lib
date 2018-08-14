"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var bignumber_js_1 = require("bignumber.js");
var AirGapWallet_1 = require("./AirGapWallet");
var cryptocompare = require("cryptocompare");
var TimeUnit;
(function (TimeUnit) {
    TimeUnit["Hours"] = "hours";
    TimeUnit["Days"] = "days";
    TimeUnit["Minutes"] = "minutes";
})(TimeUnit = exports.TimeUnit || (exports.TimeUnit = {}));
var AirGapMarketWallet = /** @class */ (function (_super) {
    __extends(AirGapMarketWallet, _super);
    function AirGapMarketWallet(protocolIdentifier, publicKey, isExtendedPublicKey, derivationPath) {
        var _this = _super.call(this, protocolIdentifier, publicKey, isExtendedPublicKey, derivationPath) || this;
        _this.protocolIdentifier = protocolIdentifier;
        _this.publicKey = publicKey;
        _this.isExtendedPublicKey = isExtendedPublicKey;
        _this.derivationPath = derivationPath;
        _this.marketSample = [];
        _this.minuteMarketSample = [];
        _this.dailyMarketSample = [];
        _this.hourlyMarketSample = [];
        return _this;
    }
    AirGapMarketWallet.prototype.synchronize = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            Promise.all([
                _this.balanceOf(),
                _this.fetchCurrentMarketPrice()
            ]).then(function (results) {
                _this.currentBalance = results[0];
                _this.currentMarketPrice = results[1];
                resolve();
            }).catch(function (error) {
                reject(error);
            });
        });
    };
    AirGapMarketWallet.prototype.fetchCurrentMarketPrice = function (baseSymbol) {
        var _this = this;
        if (baseSymbol === void 0) { baseSymbol = 'USD'; }
        return new Promise(function (resolve, reject) {
            cryptocompare.price(_this.coinProtocol.symbol.toUpperCase(), baseSymbol)
                .then(function (prices) {
                _this.currentMarketPrice = new bignumber_js_1.default(prices.USD);
                resolve(_this.currentMarketPrice);
            }).catch(console.error);
        });
    };
    AirGapMarketWallet.prototype.fetchDailyMarketPrices = function (numberOfDays, date, baseSymbol) {
        var _this = this;
        if (baseSymbol === void 0) { baseSymbol = 'USD'; }
        this.dailyMarketSample = [];
        return new Promise(function (resolve, reject) {
            _this.algoSelector(numberOfDays, TimeUnit.Days, date, baseSymbol).then(function (marketSample) {
                _this.dailyMarketSample = marketSample;
                resolve(_this.dailyMarketSample);
            }).catch();
        });
    };
    AirGapMarketWallet.prototype.fetchHourlyMarketPrices = function (numberOfHours, date, baseSymbol) {
        var _this = this;
        if (baseSymbol === void 0) { baseSymbol = 'USD'; }
        this.hourlyMarketSample = [];
        return new Promise(function (resolve, reject) {
            _this.algoSelector(numberOfHours, TimeUnit.Hours, date, baseSymbol).then(function (marketSample) {
                _this.hourlyMarketSample = marketSample;
                resolve(_this.hourlyMarketSample);
            }).catch();
        });
    };
    AirGapMarketWallet.prototype.fetchMinutesMarketPrices = function (numberOfMinutes, date, baseSymbol) {
        var _this = this;
        if (baseSymbol === void 0) { baseSymbol = 'USD'; }
        this.minuteMarketSample = [];
        return new Promise(function (resolve, reject) {
            _this.algoSelector(numberOfMinutes, TimeUnit.Minutes, date, baseSymbol).then(function (marketSample) {
                _this.minuteMarketSample = marketSample;
                resolve(_this.minuteMarketSample);
            }).catch();
        });
    };
    AirGapMarketWallet.prototype.fetchWalletValue = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.currentMarketPrice) {
                _this.balanceOf().then(function (balance) {
                    resolve(new bignumber_js_1.default(balance.toNumber() * _this.currentMarketPrice.toNumber()));
                }).catch(reject);
            }
            else {
                _this.fetchCurrentMarketPrice().then(function () {
                    _this.balanceOf().then(function (balance) {
                        resolve(new bignumber_js_1.default(balance.toNumber() * _this.currentMarketPrice.toNumber()));
                    }).catch(reject);
                }).catch(reject);
            }
        });
    };
    AirGapMarketWallet.prototype.algoSelector = function (numberOfMinutes, timeUnit, date, baseSymbol) {
        var _this = this;
        if (baseSymbol === void 0) { baseSymbol = 'USD'; }
        return new Promise(function (resolve, reject) {
            var promise;
            if (timeUnit === 'days') {
                promise = cryptocompare.histoDay(_this.coinProtocol.symbol.toUpperCase(), baseSymbol, {
                    limit: numberOfMinutes - 1,
                    timestamp: date
                });
            }
            else if (timeUnit === 'hours') {
                promise = cryptocompare.histoHour(_this.coinProtocol.symbol.toUpperCase(), baseSymbol, {
                    limit: numberOfMinutes - 1,
                    timestamp: date
                });
            }
            else if (timeUnit === 'minutes') {
                promise = cryptocompare.histoMinute(_this.coinProtocol.symbol.toUpperCase(), baseSymbol, {
                    limit: numberOfMinutes - 1,
                    timestamp: date
                });
            }
            else {
                promise = Promise.reject('Invalid time unit');
            }
            promise.then(function (prices) {
                for (var idx in prices) {
                    var marketDataObject = {
                        time: prices[idx].time,
                        close: prices[idx].close,
                        high: prices[idx].high,
                        low: prices[idx].low,
                        volumefrom: prices[idx].volumefrom,
                        volumeto: prices[idx].volumeto
                    };
                    _this.marketSample.push(marketDataObject);
                }
                resolve(_this.marketSample);
            }).catch(console.error);
        });
    };
    return AirGapMarketWallet;
}(AirGapWallet_1.AirGapWallet));
exports.AirGapMarketWallet = AirGapMarketWallet;
