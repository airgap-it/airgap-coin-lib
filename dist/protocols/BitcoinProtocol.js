"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var bitcoinJS = require("bitcoinjs-lib");
var axios_1 = require("axios");
var bignumber_js_1 = require("bignumber.js");
var BitcoinProtocol = /** @class */ (function () {
    function BitcoinProtocol(network, baseApiUrl, bitcoinJSLib) {
        if (network === void 0) { network = bitcoinJS.networks.bitcoin; }
        if (baseApiUrl === void 0) { baseApiUrl = 'https://insight.bitpay.com'; }
        if (bitcoinJSLib === void 0) { bitcoinJSLib = bitcoinJS; }
        this.symbol = 'BTC';
        this.name = 'Bitcoin';
        this.feeSymbol = 'btc';
        this.feeDefaults = {
            low: new bignumber_js_1.default('0.00002'),
            medium: new bignumber_js_1.default('0.00004'),
            high: new bignumber_js_1.default('0.00005')
        };
        this.decimals = 8;
        this.feeDecimals = 8;
        this.identifier = 'btc';
        this.units = [
            {
                unitSymbol: 'BTC',
                factor: new bignumber_js_1.default(1)
            },
            {
                unitSymbol: 'mBTC',
                factor: new bignumber_js_1.default(1).shiftedBy(-4)
            },
            {
                unitSymbol: 'Satoshi',
                factor: new bignumber_js_1.default(1).shiftedBy(-8)
            }
        ];
        this.supportsHD = true;
        this.standardDerivationPath = "m/44'/0'/0'";
        this.addressValidationPattern = '\bbc(0([ac-hj-np-z02-9]{39}|[ac-hj-np-z02-9]{59})|1[ac-hj-np-z02-9]{8,87})\b';
        this.network = network;
        this.baseApiUrl = baseApiUrl;
        this.bitcoinJSLib = bitcoinJSLib;
    }
    BitcoinProtocol.prototype.getPublicKeyFromHexSecret = function (secret, derivationPath) {
        var bitcoinNode = bitcoinJS.HDNode.fromSeedHex(secret, this.network);
        return bitcoinNode.derivePath(derivationPath).neutered().toBase58();
    };
    BitcoinProtocol.prototype.getPrivateKeyFromHexSecret = function (secret, derivationPath) {
        var bitcoinNode = bitcoinJS.HDNode.fromSeedHex(secret, this.network);
        return bitcoinNode.derivePath(derivationPath).keyPair.d.toBuffer(32);
    };
    BitcoinProtocol.prototype.getExtendedPrivateKeyFromHexSecret = function (secret, derivationPath) {
        var bitcoinNode = bitcoinJS.HDNode.fromSeedHex(secret, this.network);
        return bitcoinNode.derivePath(derivationPath).toBase58();
    };
    BitcoinProtocol.prototype.getAddressFromPublicKey = function (publicKey) {
        return this.bitcoinJSLib.HDNode.fromBase58(publicKey, this.network).getAddress();
    };
    BitcoinProtocol.prototype.getAddressFromExtendedPublicKey = function (extendedPublicKey, visibilityDerivationIndex, addressDerivationIndex) {
        return this.bitcoinJSLib.HDNode.fromBase58(extendedPublicKey, this.network).derive(visibilityDerivationIndex).derive(addressDerivationIndex).getAddress();
    };
    BitcoinProtocol.prototype.getAddressesFromExtendedPublicKey = function (extendedPublicKey, visibilityDerivationIndex, addressCount, offset) {
        var node = this.bitcoinJSLib.HDNode.fromBase58(extendedPublicKey, this.network);
        var generatorArray = Array.from(new Array(addressCount), function (x, i) { return i + offset; });
        return generatorArray.map(function (x) { return node.derive(visibilityDerivationIndex).derive(x).getAddress(); });
    };
    BitcoinProtocol.prototype.signWithPrivateKey = function (privateKey, transaction) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var transactionBuilder = new _this.bitcoinJSLib.TransactionBuilder(_this.network);
            for (var _i = 0, _a = transaction.ins; _i < _a.length; _i++) {
                var input = _a[_i];
                transactionBuilder.addInput(input.txId, input.vout);
            }
            for (var _b = 0, _c = transaction.outs; _b < _c.length; _b++) {
                var output = _c[_b];
                transactionBuilder.addOutput(output.recipient, output.value);
            }
            for (var i = 0; i < transaction.ins.length; i++) {
                transactionBuilder.sign(i, privateKey);
            }
            resolve(transactionBuilder.build().toHex());
        });
    };
    BitcoinProtocol.prototype.signWithExtendedPrivateKey = function (extendedPrivateKey, transaction) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var transactionBuilder = new _this.bitcoinJSLib.TransactionBuilder(_this.network);
            var node = _this.bitcoinJSLib.HDNode.fromBase58(extendedPrivateKey, _this.network);
            for (var _i = 0, _a = transaction.ins; _i < _a.length; _i++) {
                var input = _a[_i];
                transactionBuilder.addInput(input.txId, input.vout);
            }
            for (var _b = 0, _c = transaction.outs; _b < _c.length; _b++) {
                var output = _c[_b];
                transactionBuilder.addOutput(output.recipient, output.value);
            }
            for (var i = 0; i < transaction.ins.length; i++) {
                transactionBuilder.sign(i, node.derivePath(transaction.ins[i].derivationPath));
            }
            resolve(transactionBuilder.build().toHex());
        });
    };
    BitcoinProtocol.prototype.getTransactionDetails = function (transaction) {
        var feeCalculator = new bignumber_js_1.default(0);
        for (var _i = 0, _a = transaction.ins; _i < _a.length; _i++) {
            var txIn = _a[_i];
            feeCalculator = feeCalculator.plus(new bignumber_js_1.default(txIn.value));
        }
        for (var _b = 0, _c = transaction.outs; _b < _c.length; _b++) {
            var txOut = _c[_b];
            feeCalculator = feeCalculator.minus(new bignumber_js_1.default(txOut.value));
        }
        return {
            from: transaction.ins.map(function (obj) { return obj.address; }),
            to: transaction.outs.filter(function (obj) { return obj.isChange === false; }).map(function (obj) { return obj.recipient; }),
            amount: transaction.outs.filter(function (obj) { return obj.isChange === false; }).map(function (obj) { return new bignumber_js_1.default(obj.value); }).reduce(function (accumulator, currentValue) { return accumulator.plus(currentValue); }),
            fee: feeCalculator,
            protocolIdentifier: this.identifier,
            isInbound: false,
            timestamp: transaction.timestamp
        };
    };
    BitcoinProtocol.prototype.getTransactionDetailsFromRaw = function (transaction, rawTx) {
        var _this = this;
        var tx = {
            to: [],
            from: transaction.from,
            amount: transaction.amount,
            fee: transaction.fee,
            protocolIdentifier: this.identifier,
            isInbound: false
        };
        var bitcoinTx = this.bitcoinJSLib.Transaction.fromHex(rawTx);
        bitcoinTx.outs.forEach(function (output) {
            var address = _this.bitcoinJSLib.address.fromOutputScript(output.script, _this.network);
            tx.to.push(address);
        });
        return tx;
    };
    BitcoinProtocol.prototype.getBalanceOfAddresses = function (addresses) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            axios_1.default.get(_this.baseApiUrl + '/api/addrs/' + addresses.join(',') + '/utxo', { responseType: 'json' }).then(function (response) {
                var utxos = response.data;
                var valueAccumulator = new bignumber_js_1.default(0);
                for (var _i = 0, utxos_1 = utxos; _i < utxos_1.length; _i++) {
                    var utxo = utxos_1[_i];
                    valueAccumulator = valueAccumulator.plus(utxo.satoshis);
                }
                resolve(valueAccumulator);
            }).catch(reject);
        });
    };
    BitcoinProtocol.prototype.getBalanceOfPublicKey = function (publicKey) {
        var address = this.getAddressFromPublicKey(publicKey);
        return this.getBalanceOfAddresses([address]);
    };
    BitcoinProtocol.prototype.getBalanceOfExtendedPublicKey = function (extendedPublicKey, offset) {
        var _this = this;
        if (offset === void 0) { offset = 0; }
        return new Promise(function (resolve, reject) {
            var derivedAddresses = [];
            var internalAddresses = _this.getAddressesFromExtendedPublicKey(extendedPublicKey, 1, 20, offset);
            var externalAddresses = _this.getAddressesFromExtendedPublicKey(extendedPublicKey, 0, 20, offset);
            derivedAddresses.push(internalAddresses); // we don't add the last one
            derivedAddresses.push(externalAddresses); // we don't add the last one to make change address possible
            axios_1.default.get(_this.baseApiUrl + '/api/addrs/' + derivedAddresses.join(',') + '/utxo', { responseType: 'json' }).then(function (response) {
                var utxos = response.data;
                var valueAccumulator = new bignumber_js_1.default(0);
                for (var _i = 0, utxos_2 = utxos; _i < utxos_2.length; _i++) {
                    var utxo = utxos_2[_i];
                    valueAccumulator = valueAccumulator.plus(utxo.satoshis);
                }
                axios_1.default.get(_this.baseApiUrl + '/api/addrs/' + derivedAddresses.join(',') + '/txs?from=0&to=1', { responseType: 'json' }).then(function (response) {
                    var transactions = response.data;
                    if (transactions.items.length > 0) {
                        _this.getBalanceOfExtendedPublicKey(extendedPublicKey, offset + 100).then(function (value) {
                            resolve(valueAccumulator.plus(value));
                        }).catch(function (error) {
                            reject(error);
                        });
                    }
                    else {
                        resolve(valueAccumulator);
                    }
                }).catch(reject);
            }).catch(reject);
        });
    };
    BitcoinProtocol.prototype.prepareTransactionFromExtendedPublicKey = function (extendedPublicKey, offset, recipients, values, fee) {
        var _this = this;
        var transaction = {
            ins: [],
            outs: []
        };
        if (recipients.length !== values.length) {
            return Promise.reject('recipients do not match values');
        }
        var derivedAddresses = [];
        var internalAddresses = this.getAddressesFromExtendedPublicKey(extendedPublicKey, 1, 101, offset);
        var externalAddresses = this.getAddressesFromExtendedPublicKey(extendedPublicKey, 0, 101, offset);
        derivedAddresses.push.apply(derivedAddresses, internalAddresses.slice(0, -1)); // we don't add the last one
        derivedAddresses.push.apply(// we don't add the last one
        derivedAddresses, externalAddresses.slice(0, -1)); // we don't add the last one to make change address possible
        return new Promise(function (resolve, reject) {
            axios_1.default.get(_this.baseApiUrl + '/api/addrs/' + derivedAddresses.join(',') + '/utxo', { responseType: 'json' }).then(function (response) {
                var utxos = response.data;
                var totalRequiredBalance = values.reduce(function (accumulator, currentValue) { return accumulator.plus(currentValue); }).plus(fee);
                var valueAccumulator = new bignumber_js_1.default(0);
                for (var _i = 0, utxos_3 = utxos; _i < utxos_3.length; _i++) {
                    var utxo = utxos_3[_i];
                    valueAccumulator = valueAccumulator.plus(utxo.satoshis);
                    if (derivedAddresses.indexOf(utxo.address) >= 0) {
                        transaction.ins.push({
                            txId: utxo.txid,
                            value: utxo.satoshis,
                            vout: utxo.vout,
                            address: utxo.address,
                            derivationPath: externalAddresses.indexOf(utxo.address) >= 0 ? '0/' + (externalAddresses.indexOf(utxo.address) + offset) : '1/' + (internalAddresses.indexOf(utxo.address) + offset)
                        });
                    }
                    // tx.addInput(utxo.txid, utxo.vout)
                    if (valueAccumulator.isGreaterThanOrEqualTo(totalRequiredBalance)) {
                        for (var i = 0; i < recipients.length; i++) {
                            transaction.outs.push({
                                recipient: recipients[i],
                                isChange: false,
                                value: values[i].toNumber()
                            });
                            valueAccumulator = valueAccumulator.minus(values[i]);
                            // tx.addOutput(recipients[i], values[i])
                        }
                        axios_1.default.get(_this.baseApiUrl + '/api/addrs/' + internalAddresses.join(',') + '/txs', { responseType: 'json' }).then(function (response) {
                            var transactions = response.data;
                            var maxIndex = -1;
                            for (var _i = 0, _a = transactions.items; _i < _a.length; _i++) {
                                var transaction_1 = _a[_i];
                                for (var _b = 0, _c = transaction_1.vout; _b < _c.length; _b++) {
                                    var vout = _c[_b];
                                    for (var _d = 0, _e = vout.scriptPubKey.addresses; _d < _e.length; _d++) {
                                        var address = _e[_d];
                                        maxIndex = Math.max(maxIndex, internalAddresses.indexOf(address));
                                    }
                                }
                            }
                            transaction.outs.push({
                                recipient: internalAddresses[maxIndex + 1],
                                isChange: true,
                                value: valueAccumulator.minus(fee).toNumber()
                            });
                            // tx.addOutput(internalAddresses[maxIndex + 1], valueAccumulator - fee) //this is why we sliced the arrays earlier
                            resolve(transaction);
                        }).catch(reject);
                        break;
                    }
                }
                if (valueAccumulator.isLessThan(totalRequiredBalance)) {
                    axios_1.default.get(_this.baseApiUrl + '/api/addrs/' + internalAddresses.join(',') + '/txs?from=0&to=1', { responseType: 'json' }).then(function (response) {
                        var transactions = response.data;
                        if (transactions.items.length > 0) {
                            return _this.prepareTransactionFromExtendedPublicKey(extendedPublicKey, offset + 10, recipients, values, fee); // recursion needed to navigate through HD wallet
                        }
                        else {
                            reject('not enough balance'); // no transactions found on those addresses, probably won't find anything in the next ones
                        }
                    }).catch(reject);
                }
            }).catch(reject);
        });
    };
    BitcoinProtocol.prototype.prepareTransactionFromPublicKey = function (publicKey, recipients, values, fee) {
        var _this = this;
        var transaction = {
            ins: [],
            outs: []
        };
        assert(recipients.length === values.length);
        var address = this.getAddressFromPublicKey(publicKey);
        return new Promise(function (resolve, reject) {
            axios_1.default.get(_this.baseApiUrl + '/api/addrs/' + address + '/utxo', { responseType: 'json' }).then(function (response) {
                var utxos = response.data;
                var totalRequiredBalance = values.reduce(function (accumulator, currentValue) { return accumulator.plus(currentValue); }).plus(fee);
                var valueAccumulator = new bignumber_js_1.default(0);
                for (var _i = 0, utxos_4 = utxos; _i < utxos_4.length; _i++) {
                    var utxo = utxos_4[_i];
                    valueAccumulator = valueAccumulator.plus(utxo.satoshis);
                    if (address === utxo.address) {
                        transaction.ins.push({
                            txId: utxo.txid,
                            value: utxo.satoshis,
                            vout: utxo.vout,
                            address: utxo.address
                        });
                    }
                    // tx.addInput(utxo.txid, utxo.vout)
                    if (valueAccumulator.isGreaterThanOrEqualTo(totalRequiredBalance)) {
                        for (var i = 0; i < recipients.length; i++) {
                            transaction.outs.push({
                                recipient: recipients[i],
                                isChange: false,
                                value: values[i].toNumber()
                            });
                            valueAccumulator = valueAccumulator.minus(values[i]);
                            // tx.addOutput(recipients[i], values[i])
                        }
                        transaction.outs.push({
                            recipient: address,
                            isChange: true,
                            value: valueAccumulator.minus(fee)
                        });
                        resolve(transaction);
                    }
                    else {
                        reject('not enough balance');
                    }
                }
            }).catch(reject);
        });
    };
    BitcoinProtocol.prototype.broadcastTransaction = function (rawTransaction) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            axios_1.default.post(_this.baseApiUrl + '/api/tx/send', { form: { rawtx: rawTransaction } }).then(function (response) {
                var payload = response.data;
                resolve(payload.txid);
            }).catch(reject);
        });
    };
    BitcoinProtocol.prototype.getTransactionsFromExtendedPublicKey = function (extendedPublicKey, limit, offset, addressOffset) {
        var _this = this;
        if (addressOffset === void 0) { addressOffset = 0; }
        return new Promise(function (resolve, reject) {
            var derivedAddresses = [];
            derivedAddresses.push.apply(derivedAddresses, _this.getAddressesFromExtendedPublicKey(extendedPublicKey, 1, 100, addressOffset));
            derivedAddresses.push.apply(derivedAddresses, _this.getAddressesFromExtendedPublicKey(extendedPublicKey, 0, 100, addressOffset));
            var airGapTransactions = [];
            axios_1.default.get(_this.baseApiUrl + '/api/addrs/' + derivedAddresses.join(',') + '/txs?from=' + offset + '&to=' + (offset + limit), { responseType: 'json' }).then(function (response) {
                var transactionResponse = response.data;
                for (var _i = 0, _a = transactionResponse.items; _i < _a.length; _i++) {
                    var transaction = _a[_i];
                    var tempAirGapTransactionFrom = [];
                    var tempAirGapTransactionTo = [];
                    var tempAirGapTransactionIsInbound = true;
                    var amount = new bignumber_js_1.default(0);
                    for (var _b = 0, _c = transaction.vin; _b < _c.length; _b++) {
                        var vin = _c[_b];
                        if (derivedAddresses.indexOf(vin.addr) > -1) {
                            tempAirGapTransactionIsInbound = false;
                        }
                        tempAirGapTransactionFrom.push(vin.addr);
                        amount.plus(vin.valueSat);
                    }
                    for (var _d = 0, _e = transaction.vout; _d < _e.length; _d++) {
                        var vout = _e[_d];
                        tempAirGapTransactionTo.push.apply(tempAirGapTransactionTo, vout.scriptPubKey.addresses);
                        if (_this.containsSome(vout.scriptPubKey.addresses, derivedAddresses) && !tempAirGapTransactionIsInbound) { // remove only if related to this address
                            amount = amount.minus(new bignumber_js_1.default(vout.value).multipliedBy(Math.pow(10, 8)));
                        }
                        else if (!_this.containsSome(vout.scriptPubKey.addresses, derivedAddresses) && tempAirGapTransactionIsInbound) {
                            amount = amount.minus(new bignumber_js_1.default(vout.value).multipliedBy(Math.pow(10, 8)));
                        }
                    }
                    var airGapTransaction = {
                        hash: transaction.txid,
                        from: tempAirGapTransactionFrom,
                        to: tempAirGapTransactionTo,
                        isInbound: tempAirGapTransactionIsInbound,
                        amount: amount,
                        blockHeight: transaction.blockheight,
                        protocolIdentifier: _this.identifier,
                        timestamp: transaction.time
                    };
                    airGapTransactions.push(airGapTransaction);
                }
                if (airGapTransactions.length < limit) {
                    if (airGapTransactions.length > 0) {
                        _this.getTransactionsFromExtendedPublicKey(extendedPublicKey, 0, limit - airGapTransactions.length, addressOffset + 100).then(function (transactions) {
                            airGapTransactions.push.apply(airGapTransactions, transactions);
                            resolve(airGapTransactions);
                        }).catch(reject);
                    }
                    else {
                        resolve(airGapTransactions);
                    }
                }
                else {
                    resolve(airGapTransactions);
                }
            }).catch(reject);
        });
    };
    BitcoinProtocol.prototype.getTransactionsFromPublicKey = function (publicKey, limit, offset) {
        return this.getTransactionsFromAddresses([this.getAddressFromPublicKey(publicKey)], limit, offset);
    };
    BitcoinProtocol.prototype.getTransactionsFromAddresses = function (addresses, limit, offset) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var airGapTransactions = [];
            axios_1.default.get(_this.baseApiUrl + '/api/addrs/' + addresses.join(',') + '/txs?from=' + offset + '&to=' + (offset + limit), { responseType: 'json' }).then(function (response) {
                var transactions = response.data;
                for (var _i = 0, _a = transactions.items; _i < _a.length; _i++) {
                    var transaction = _a[_i];
                    var tempAirGapTransactionFrom = [];
                    var tempAirGapTransactionTo = [];
                    var amount = new bignumber_js_1.default(0);
                    for (var _b = 0, _c = transaction.vin; _b < _c.length; _b++) {
                        var vin = _c[_b];
                        tempAirGapTransactionFrom.push(vin.addr);
                        amount.plus(vin.valueSat);
                    }
                    for (var _d = 0, _e = transaction.vout; _d < _e.length; _d++) {
                        var vout = _e[_d];
                        if (vout.scriptPubKey.addresses) {
                            tempAirGapTransactionTo.push.apply(tempAirGapTransactionTo, vout.scriptPubKey.addresses);
                            if (_this.containsSome(addresses, vout.scriptPubKey.addresses)) { // remove only if related to this address
                                amount.minus(new bignumber_js_1.default(vout.value).multipliedBy(Math.pow(10, 8)));
                            }
                        }
                    }
                    var airGapTransaction = {
                        hash: transaction.txid,
                        from: tempAirGapTransactionFrom,
                        to: tempAirGapTransactionTo,
                        amount: amount,
                        blockHeight: transaction.blockheight,
                        timestamp: transaction.time
                    };
                    airGapTransactions.push(airGapTransaction);
                }
                resolve(airGapTransactions);
            }).catch(reject);
        });
    };
    BitcoinProtocol.prototype.containsSome = function (needles, haystack) {
        for (var _i = 0, needles_1 = needles; _i < needles_1.length; _i++) {
            var needle = needles_1[_i];
            if (haystack.indexOf(needle) > -1) {
                return true;
            }
        }
        return false;
    };
    return BitcoinProtocol;
}());
exports.BitcoinProtocol = BitcoinProtocol;
