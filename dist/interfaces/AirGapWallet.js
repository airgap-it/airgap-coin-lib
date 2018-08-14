"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../index");
var AirGapWallet = /** @class */ (function () {
    function AirGapWallet(protocolIdentifier, publicKey, isExtendedPublicKey, derivationPath) {
        this.protocolIdentifier = protocolIdentifier;
        this.publicKey = publicKey;
        this.isExtendedPublicKey = isExtendedPublicKey;
        this.derivationPath = derivationPath;
        this.addresses = []; // used for cache
    }
    Object.defineProperty(AirGapWallet.prototype, "receivingPublicAddress", {
        get: function () {
            return this.addresses[0];
        },
        enumerable: true,
        configurable: true
    });
    AirGapWallet.prototype.deriveAddresses = function (amount) {
        if (amount === void 0) { amount = 20; }
        if (this.isExtendedPublicKey) {
            var parts = this.derivationPath.split('/');
            var offset = 0;
            if (!parts[parts.length - 1].endsWith('\'')) {
                offset = Number.parseInt(parts[parts.length - 1]);
            }
            return this.coinProtocol.getAddressesFromExtendedPublicKey(this.publicKey, 0, amount, offset);
        }
        else {
            return [this.coinProtocol.getAddressFromPublicKey(this.publicKey)];
        }
    };
    Object.defineProperty(AirGapWallet.prototype, "coinProtocol", {
        get: function () {
            return index_1.getProtocolByIdentifier(this.protocolIdentifier);
        },
        enumerable: true,
        configurable: true
    });
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
    return AirGapWallet;
}());
exports.AirGapWallet = AirGapWallet;
