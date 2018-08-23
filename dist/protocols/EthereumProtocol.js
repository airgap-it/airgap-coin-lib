"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bitcoinJS = require("bitcoinjs-lib");
var bignumber_js_1 = require("bignumber.js");
var ethUtil = require("ethereumjs-util");
var axios_1 = require("axios");
var Web3 = require('web3'); // tslint:disable-line
var EthereumTransaction = require('ethereumjs-tx');
var EthereumProtocol = /** @class */ (function () {
    function EthereumProtocol(jsonRPCAPI, infoAPI, chainId) {
        if (jsonRPCAPI === void 0) { jsonRPCAPI = 'https://eth-rpc-proxy.kubernetes.papers.tech/'; }
        if (infoAPI === void 0) { infoAPI = 'https://api.trustwalletapp.com/'; }
        if (chainId === void 0) { chainId = 1; }
        this.symbol = 'ETH';
        this.name = 'Ethereum';
        this.feeSymbol = 'eth';
        this.feeDefaults = {
            low: new bignumber_js_1.BigNumber('0.00021'),
            medium: new bignumber_js_1.BigNumber('0.000315'),
            high: new bignumber_js_1.BigNumber('0.00084') // 21000 Gas * 40 Gwei
        };
        this.decimals = 18;
        this.feeDecimals = 18;
        this.identifier = 'eth';
        this.units = [{
                unitSymbol: 'ETH',
                factor: new bignumber_js_1.BigNumber(1)
            }, {
                unitSymbol: 'GWEI',
                factor: new bignumber_js_1.BigNumber(1).shiftedBy(-9)
            }, {
                unitSymbol: 'WEI',
                factor: new bignumber_js_1.BigNumber(1).shiftedBy(-18)
            }];
        this.supportsHD = false;
        this.standardDerivationPath = "m/44'/60'/0'/0/0";
        this.addressValidationPattern = '^0x[a-fA-F0-9]{40}$';
        this.infoAPI = infoAPI;
        this.web3 = new Web3(new Web3.providers.HttpProvider(jsonRPCAPI));
        this.network = bitcoinJS.networks.bitcoin;
        this.chainId = chainId;
    }
    EthereumProtocol.prototype.getPublicKeyFromHexSecret = function (secret, derivationPath) {
        var ethereumNode = bitcoinJS.HDNode.fromSeedHex(secret, this.network);
        return ethereumNode.derivePath(derivationPath).neutered().getPublicKeyBuffer().toString('hex');
    };
    EthereumProtocol.prototype.getPrivateKeyFromHexSecret = function (secret, derivationPath) {
        var ethereumNode = bitcoinJS.HDNode.fromSeedHex(secret, this.network);
        return ethereumNode.derivePath(derivationPath).keyPair.d.toBuffer(32);
    };
    EthereumProtocol.prototype.getExtendedPrivateKeyFromHexSecret = function (secret, derivationPath) {
        throw (new Error('extended private key support for ether not implemented'));
    };
    EthereumProtocol.prototype.getAddressFromPublicKey = function (publicKey) {
        if (typeof publicKey === 'string') {
            return ethUtil.toChecksumAddress(ethUtil.pubToAddress(Buffer.from(publicKey, 'hex'), true).toString('hex'));
        }
        else {
            return ethUtil.toChecksumAddress(ethUtil.pubToAddress(publicKey, true).toString('hex'));
        }
    };
    EthereumProtocol.prototype.getAddressFromExtendedPublicKey = function (extendedPublicKey, visibilityDerivationIndex, addressDerivationIndex) {
        return this.getAddressFromPublicKey(bitcoinJS.HDNode.fromBase58(extendedPublicKey, this.network).derive(visibilityDerivationIndex).derive(addressDerivationIndex).getPublicKeyBuffer().toString('hex'));
    };
    EthereumProtocol.prototype.getAddressesFromExtendedPublicKey = function (extendedPublicKey, visibilityDerivationIndex, addressCount, offset) {
        var _this = this;
        var node = bitcoinJS.HDNode.fromBase58(extendedPublicKey, this.network);
        var generatorArray = [addressCount].map(function (x, i) { return i + offset; });
        return generatorArray.map(function (x) { return _this.getAddressFromPublicKey(node.derive(visibilityDerivationIndex).derive(x).getPublicKeyBuffer().toString('hex')); });
    };
    EthereumProtocol.prototype.signWithExtendedPrivateKey = function (extendedPrivateKey, transaction) {
        return Promise.reject('extended private key signing for ether not implemented');
    };
    EthereumProtocol.prototype.signWithPrivateKey = function (extendedPrivateKey, transaction) {
        if (transaction.from !== ethUtil.toChecksumAddress(ethUtil.privateToAddress(Buffer.from(extendedPrivateKey)).toString('hex'))) {
            return Promise.reject('from property and private-key do not match');
        }
        var txParams = {
            nonce: this.web3.utils.toHex(transaction.nonce),
            gasPrice: this.web3.utils.toHex(transaction.gasPrice),
            gasLimit: this.web3.utils.toHex(transaction.gasLimit),
            to: transaction.to,
            value: this.web3.utils.toHex(new bignumber_js_1.BigNumber(transaction.value)),
            chainId: this.web3.utils.toHex(this.chainId)
        };
        var tx = new EthereumTransaction(txParams);
        tx.sign(extendedPrivateKey);
        return Promise.resolve(tx.serialize().toString('hex'));
    };
    EthereumProtocol.prototype.getTransactionDetails = function (transaction) {
        return {
            from: transaction.from ? [transaction.from] : [],
            to: [transaction.to],
            amount: new bignumber_js_1.BigNumber(transaction.value),
            fee: new bignumber_js_1.BigNumber(transaction.gasLimit).multipliedBy(new bignumber_js_1.BigNumber(transaction.gasPrice)),
            protocolIdentifier: this.identifier,
            isInbound: false,
            timestamp: parseInt(transaction.timestamp, 10)
        };
    };
    EthereumProtocol.prototype.getTransactionDetailsFromRaw = function (transaction, rawTx) {
        var ethTx = new EthereumTransaction(rawTx);
        var hexValue = ethTx.value.toString('hex') || '0x0';
        var hexGasPrice = ethTx.gasPrice.toString('hex') || '0x0';
        var hexGasLimit = ethTx.gasLimit.toString('hex') || '0x0';
        var hexNonce = ethTx.nonce.toString('hex') || '0x0';
        return {
            from: ['0x' + ethTx.from.toString('hex')],
            to: ['0x' + ethTx.to.toString('hex')],
            amount: new bignumber_js_1.BigNumber(parseInt(hexValue, 16)),
            fee: new bignumber_js_1.BigNumber(parseInt(hexGasLimit, 16)).multipliedBy(new bignumber_js_1.BigNumber(parseInt(hexGasPrice, 16))),
            protocolIdentifier: this.identifier,
            isInbound: ethTx.toCreationAddress(),
            hash: ethTx.hash,
            meta: {
                nonce: parseInt(hexNonce, 16)
            },
            data: '0x' + ethTx.data.toString('hex')
        };
    };
    EthereumProtocol.prototype.getBalanceOfPublicKey = function (publicKey) {
        var address = this.getAddressFromPublicKey(publicKey);
        return this.getBalanceOfAddresses([address]);
    };
    EthereumProtocol.prototype.getBalanceOfExtendedPublicKey = function (extendedPublicKey, offset) {
        if (offset === void 0) { offset = 0; }
        return Promise.reject('extended public balance for ether not implemented');
    };
    EthereumProtocol.prototype.prepareTransactionFromExtendedPublicKey = function (extendedPublicKey, offset, recipients, values, fee) {
        return Promise.reject('extended public tx for ether not implemented');
    };
    EthereumProtocol.prototype.prepareTransactionFromPublicKey = function (publicKey, recipients, values, fee) {
        var _this = this;
        var address = this.getAddressFromPublicKey(publicKey);
        if (recipients.length !== values.length) {
            return Promise.reject('recipients length does not match with values');
        }
        if (recipients.length !== 1) {
            return Promise.reject('you cannot have 0 recipients');
        }
        return new Promise(function (resolve, reject) {
            _this.getBalanceOfAddresses([address]).then(function (balance) {
                var gasLimit = 21000;
                var gasPrice = fee.div(gasLimit).integerValue(bignumber_js_1.BigNumber.ROUND_CEIL);
                if (new bignumber_js_1.BigNumber(balance).gte(new bignumber_js_1.BigNumber(values[0].plus(fee)))) {
                    _this.web3.eth.getTransactionCount(address).then(function (txCount) {
                        var transaction = {
                            nonce: txCount,
                            gasLimit: gasLimit,
                            gasPrice: gasPrice,
                            to: recipients[0],
                            from: address,
                            value: values[0],
                            chainId: _this.chainId
                        };
                        resolve(transaction);
                    });
                }
                else {
                    reject('not enough balance');
                }
            }).catch(reject);
        });
    };
    EthereumProtocol.prototype.broadcastTransaction = function (rawTransaction) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.web3.eth.sendSignedTransaction('0x' + rawTransaction).then(function (receipt) {
                resolve(receipt.transactionHash);
            }).catch(function (err) {
                reject(err);
            });
        });
    };
    EthereumProtocol.prototype.getTransactionsFromExtendedPublicKey = function (extendedPublicKey, limit, offset) {
        return Promise.reject('extended public transaction list for ether not implemented');
    };
    EthereumProtocol.prototype.getTransactionsFromPublicKey = function (publicKey, limit, offset) {
        if (limit === void 0) { limit = 50; }
        if (offset === void 0) { offset = 0; }
        var address = this.getAddressFromPublicKey(publicKey);
        return this.getTransactionsFromAddresses([address], limit, offset);
    };
    EthereumProtocol.prototype.getBalanceOfAddresses = function (addresses) {
        var promises = [];
        for (var _i = 0, addresses_1 = addresses; _i < addresses_1.length; _i++) {
            var address = addresses_1[_i];
            promises.push(this.web3.eth.getBalance(address));
        }
        return new Promise(function (resolve, reject) {
            Promise.all(promises).then(function (values) {
                resolve(values.map(function (obj) { return new bignumber_js_1.BigNumber(obj); }).reduce(function (a, b) { return a.plus(b); }));
            }).catch(reject);
        });
    };
    EthereumProtocol.prototype.getTransactionsFromAddresses = function (addresses, limit, offset) {
        var _this = this;
        var airGapTransactions = [];
        return new Promise(function (overallResolve, overallReject) {
            var promises = [];
            var _loop_1 = function (address) {
                promises.push(new Promise(function (resolve, reject) {
                    axios_1.default.get(_this.infoAPI + 'transactions?address=' + address + '&page=' + (offset / limit) + '&limit=' + limit + '&filterContractInteraction=true').then(function (response) {
                        var transactionResponse = response.data;
                        for (var _i = 0, _a = transactionResponse.docs; _i < _a.length; _i++) {
                            var transaction = _a[_i];
                            var fee = new bignumber_js_1.BigNumber(transaction.gasUsed).times(new bignumber_js_1.BigNumber(transaction.gasPrice));
                            var airGapTransaction = {
                                hash: transaction.id,
                                from: [transaction.from],
                                to: [transaction.to],
                                isInbound: transaction.to.toLowerCase() === address.toLowerCase(),
                                amount: new bignumber_js_1.BigNumber(transaction.value),
                                fee: fee,
                                blockHeight: transaction.blockNumber,
                                protocolIdentifier: _this.identifier,
                                timestamp: parseInt(transaction.timeStamp, 10)
                            };
                            airGapTransactions.push(airGapTransaction);
                        }
                        resolve(airGapTransactions);
                    }).catch(reject);
                }));
            };
            for (var _i = 0, addresses_2 = addresses; _i < addresses_2.length; _i++) {
                var address = addresses_2[_i];
                _loop_1(address);
            }
            Promise.all(promises).then(function (values) {
                overallResolve([].concat.apply([], values));
            }).catch(overallReject);
        });
    };
    return EthereumProtocol;
}());
exports.EthereumProtocol = EthereumProtocol;
