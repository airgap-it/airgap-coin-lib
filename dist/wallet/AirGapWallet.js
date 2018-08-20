"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var __1 = require("..");
var AirGapWallet = /** @class */ (function () {
    function AirGapWallet(protocolIdentifier, publicKey, isExtendedPublicKey, derivationPath) {
        this.protocolIdentifier = protocolIdentifier;
        this.publicKey = publicKey;
        this.isExtendedPublicKey = isExtendedPublicKey;
        this.derivationPath = derivationPath;
        this.addresses = []; // used for cache
        var coinProtocol = __1.getProtocolByIdentifier(this.protocolIdentifier);
        if (coinProtocol) {
            this.coinProtocol = coinProtocol;
        }
        else {
            throw Error('Unknown protocol');
        }
    }
    Object.defineProperty(AirGapWallet.prototype, "receivingPublicAddress", {
        get: function () {
            return this.addresses[0];
        },
        enumerable: true,
        configurable: true
    });
    AirGapWallet.prototype.deriveAddresses = function (amount) {
        if (amount === void 0) { amount = 50; }
        if (this.isExtendedPublicKey) {
            var parts = this.derivationPath.split('/');
            var offset = 0;
            if (!parts[parts.length - 1].endsWith('\'')) {
                offset = Number.parseInt(parts[parts.length - 1], 10);
            }
            return this.coinProtocol.getAddressesFromExtendedPublicKey(this.publicKey, 0, amount, offset).concat(this.coinProtocol.getAddressesFromExtendedPublicKey(this.publicKey, 1, amount, offset));
        }
        else {
            return [this.coinProtocol.getAddressFromPublicKey(this.publicKey)];
        }
    };
    AirGapWallet.prototype.balanceOf = function () {
        if (this.addresses.length > 0) {
            return this.coinProtocol.getBalanceOfAddresses(this.addresses);
        }
        else if (this.isExtendedPublicKey) {
            return this.coinProtocol.getBalanceOfExtendedPublicKey(this.publicKey, 0);
        }
        else {
            return this.coinProtocol.getBalanceOfPublicKey(this.publicKey);
        }
    };
    AirGapWallet.prototype.fetchTransactions = function (limit, offset) {
        if (this.addresses.length > 0) {
            return this.coinProtocol.getTransactionsFromAddresses(this.addresses, limit, offset);
        }
        else if (this.isExtendedPublicKey) {
            return this.coinProtocol.getTransactionsFromExtendedPublicKey(this.publicKey, limit, offset);
        }
        else {
            return this.coinProtocol.getTransactionsFromPublicKey(this.publicKey, limit, offset);
        }
    };
    AirGapWallet.prototype.prepareTransaction = function (recipients, values, fee) {
        if (this.isExtendedPublicKey) {
            return this.coinProtocol.prepareTransactionFromExtendedPublicKey(this.publicKey, 0, recipients, values, fee);
        }
        else {
            return this.coinProtocol.prepareTransactionFromPublicKey(this.publicKey, recipients, values, fee);
        }
    };
    AirGapWallet.prototype.toJSON = function () {
        var json = Object.assign({}, this);
        delete json.coinProtocol;
        return json;
    };
    return AirGapWallet;
}());
exports.AirGapWallet = AirGapWallet;
