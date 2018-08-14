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
var BitcoinProtocol_1 = require("./BitcoinProtocol");
var zcashJS = require('bitcoinjs-lib-zcash');
var networks_1 = require("../networks");
var ZCashTestnetProtocol = /** @class */ (function (_super) {
    __extends(ZCashTestnetProtocol, _super);
    function ZCashTestnetProtocol() {
        return _super.call(this, networks_1.networks.zcash, 'https://explorer.testnet.z.cash', zcashJS) || this; // we probably need another network here, explorer is ok
    }
    return ZCashTestnetProtocol;
}(BitcoinProtocol_1.BitcoinProtocol));
exports.ZCashTestnetProtocol = ZCashTestnetProtocol;
