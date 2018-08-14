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
var EthereumProtocol_1 = require("./EthereumProtocol");
var ethUtil = require("ethereumjs-util");
var axios_1 = require("axios");
var bignumber_js_1 = require("bignumber.js");
var assert_1 = require("assert");
var EthereumTransaction = require('ethereumjs-tx');
var AUTH_TOKEN_ABI = [
    {
        'constant': true,
        'inputs': [
            {
                'name': '_owner',
                'type': 'address'
            }
        ],
        'name': 'balanceOf',
        'outputs': [
            {
                'name': 'balance',
                'type': 'uint256'
            }
        ],
        'payable': false,
        'type': 'function'
    },
    {
        'constant': false,
        'inputs': [
            {
                'name': '_to',
                'type': 'address'
            },
            {
                'name': '_value',
                'type': 'uint256'
            }
        ],
        'name': 'transfer',
        'outputs': [
            {
                'name': 'success',
                'type': 'bool'
            }
        ],
        'payable': false,
        'type': 'function'
    }
];
var GenericERC20 = /** @class */ (function (_super) {
    __extends(GenericERC20, _super);
    function GenericERC20(contractAddress, jsonRPCAPI, infoAPI, chainId) {
        if (jsonRPCAPI === void 0) { jsonRPCAPI = 'https://mainnet.infura.io/'; }
        if (infoAPI === void 0) { infoAPI = 'https://api.trustwalletapp.com/'; }
        if (chainId === void 0) { chainId = 1; }
        var _this = _super.call(this, jsonRPCAPI, infoAPI, chainId) // we probably need another network here, explorer is ok
         || this;
        _this.tokenContract = new _this.web3.eth.Contract(AUTH_TOKEN_ABI, contractAddress);
        return _this;
    }
    GenericERC20.prototype.getBalanceOfPublicKey = function (publicKey) {
        var address = this.getAddressFromPublicKey(publicKey);
        return this.getBalanceOfAddresses([address]);
    };
    GenericERC20.prototype.getBalanceOfAddresses = function (addresses) {
        var promises = [];
        for (var _i = 0, addresses_1 = addresses; _i < addresses_1.length; _i++) {
            var address = addresses_1[_i];
            promises.push(this.tokenContract.methods.balanceOf(address).call());
        }
        return new Promise(function (resolve, reject) {
            Promise.all(promises).then(function (values) {
                resolve(values.map(function (obj) { return new bignumber_js_1.default(obj); }).reduce(function (a, b) { return a.plus(b); }));
            }).catch(reject);
        });
    };
    GenericERC20.prototype.signWithPrivateKey = function (extendedPrivateKey, transaction) {
        if (transaction.from !== ethUtil.toChecksumAddress(ethUtil.privateToAddress(Buffer.from(extendedPrivateKey)).toString('hex'))) {
            return Promise.reject('from property and private-key do not match');
        }
        var txParams = {
            nonce: this.web3.utils.toHex(transaction.nonce),
            gasPrice: this.web3.utils.toHex(transaction.gasPrice),
            gasLimit: this.web3.utils.toHex(transaction.gasLimit),
            to: this.tokenContract.options.address,
            data: this.tokenContract.methods.transfer(transaction.to, transaction.value).encodeABI(),
            chainId: this.web3.utils.toHex(this.chainId)
        };
        var tx = new EthereumTransaction(txParams);
        tx.sign(extendedPrivateKey);
        return Promise.resolve(tx.serialize().toString('hex'));
    };
    GenericERC20.prototype.prepareTransactionFromPublicKey = function (publicKey, recipients, values, fee) {
        var _this = this;
        if (recipients.length !== values.length) {
            return Promise.reject('recipients length does not match with values');
        }
        if (recipients.length !== 1) {
            return Promise.reject('you cannot have 0 recipients');
        }
        return new Promise(function (resolve, reject) {
            _this.getBalanceOfPublicKey(publicKey).then(function (balance) {
                if (balance >= values[0]) {
                    _super.prototype.getBalanceOfPublicKey.call(_this, publicKey).then(function (ethBalance) {
                        var address = _this.getAddressFromPublicKey(publicKey);
                        _this.tokenContract.methods.transfer(recipients[0], values[0]).estimateGas({ from: address }, function (error, gasAmount) {
                            if (error) {
                                reject(error);
                            }
                            var gasLimit = new bignumber_js_1.default(gasAmount).plus(21000); // unsure about this calculation
                            if (ethBalance.gte(fee)) {
                                _this.web3.eth.getTransactionCount(address).then(function (txCount) {
                                    var transaction = {
                                        nonce: txCount,
                                        gasLimit: gasLimit,
                                        gasPrice: fee.div(gasAmount).integerValue(bignumber_js_1.default.ROUND_CEIL),
                                        to: recipients[0],
                                        from: address,
                                        value: values[0],
                                        chainId: _this.chainId
                                    };
                                    resolve(transaction);
                                });
                            }
                            else {
                                reject('not enough ETH balance');
                            }
                        });
                    }).catch(reject);
                }
                else {
                    reject('not enough token balance');
                }
            }).catch(reject);
        });
    };
    GenericERC20.prototype.getTransactionsFromAddresses = function (addresses, limit, offset) {
        var _this = this;
        var airGapTransactions = [];
        return new Promise(function (overallResolve, overallReject) {
            var promises = [];
            var _loop_1 = function (address) {
                promises.push(new Promise(function (resolve, reject) {
                    axios_1.default.get(_this.infoAPI + 'transactions?address=' + address + '&contract=' + _this.tokenContract.options.address + '&page=' + (offset / limit) + '&limit=' + limit).then(function (response) {
                        var transactionResponse = response.data;
                        for (var _i = 0, _a = transactionResponse.docs; _i < _a.length; _i++) {
                            var transaction = _a[_i];
                            if (transaction.operations.length >= 1) {
                                var transactionPayload = transaction.operations[0];
                                var fee = new bignumber_js_1.default(transactionPayload.gasUsed).times(new bignumber_js_1.default(transactionPayload.gasPrice));
                                var airGapTransaction = {
                                    hash: transaction.id,
                                    from: [transactionPayload.from],
                                    to: [transactionPayload.to],
                                    isInbound: transactionPayload.to.toLowerCase() === address.toLowerCase(),
                                    blockHeight: transaction.blockNumber,
                                    protocolIdentifier: _this.identifier,
                                    amount: new bignumber_js_1.default(transactionPayload.value),
                                    fee: fee,
                                    timestamp: parseInt(transaction.timeStamp, 10)
                                };
                                airGapTransactions.push(airGapTransaction);
                            }
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
            }).catch(assert_1.rejects);
        });
    };
    return GenericERC20;
}(EthereumProtocol_1.EthereumProtocol));
exports.GenericERC20 = GenericERC20;
