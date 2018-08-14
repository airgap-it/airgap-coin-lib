"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BitcoinProtocol_1 = require("./protocols/BitcoinProtocol");
exports.BitcoinProtocol = BitcoinProtocol_1.BitcoinProtocol;
var BitcoinTestnetProtocol_1 = require("./protocols/BitcoinTestnetProtocol");
exports.BitcoinTestnetProtocol = BitcoinTestnetProtocol_1.BitcoinTestnetProtocol;
var LitecoinProtocol_1 = require("./protocols/LitecoinProtocol");
exports.LitecoinProtocol = LitecoinProtocol_1.LitecoinProtocol;
var ZCashProtocol_1 = require("./protocols/ZCashProtocol");
exports.ZCashProtocol = ZCashProtocol_1.ZCashProtocol;
var ZCashTestnetProtocol_1 = require("./protocols/ZCashTestnetProtocol");
exports.ZCashTestnetProtocol = ZCashTestnetProtocol_1.ZCashTestnetProtocol;
var EthereumProtocol_1 = require("./protocols/EthereumProtocol");
exports.EthereumProtocol = EthereumProtocol_1.EthereumProtocol;
var EthereumRopstenProtocol_1 = require("./protocols/EthereumRopstenProtocol");
exports.EthereumRopstenProtocol = EthereumRopstenProtocol_1.EthereumRopstenProtocol;
var EthereumClassicProtocol_1 = require("./protocols/EthereumClassicProtocol");
exports.EthereumClassicProtocol = EthereumClassicProtocol_1.EthereumClassicProtocol;
var GenericERC20_1 = require("./protocols/GenericERC20");
exports.GenericERC20 = GenericERC20_1.GenericERC20;
var HOPTokenProtocol_1 = require("./protocols/HOPTokenProtocol");
exports.HOPTokenProtocol = HOPTokenProtocol_1.HOPTokenProtocol;
var AETokenProtocol_1 = require("./protocols/AETokenProtocol");
exports.AETokenProtocol = AETokenProtocol_1.AETokenProtocol;
var AirGapWallet_1 = require("./wallet/AirGapWallet");
exports.AirGapWallet = AirGapWallet_1.AirGapWallet;
var AirGapMarketWallet_1 = require("./wallet/AirGapMarketWallet");
exports.AirGapMarketWallet = AirGapMarketWallet_1.AirGapMarketWallet;
var supportedProtocols = function () {
    return [new BitcoinProtocol_1.BitcoinProtocol(), new EthereumProtocol_1.EthereumProtocol(), new AETokenProtocol_1.AETokenProtocol()];
};
exports.supportedProtocols = supportedProtocols;
var getProtocolByIdentifier = function (identifier) {
    for (var _i = 0, _a = supportedProtocols(); _i < _a.length; _i++) {
        var coinProtocol = _a[_i];
        if (coinProtocol.identifier === identifier) {
            return coinProtocol;
        }
    }
};
exports.getProtocolByIdentifier = getProtocolByIdentifier;
