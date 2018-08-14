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
var EthereumClassicProtocol = /** @class */ (function (_super) {
    __extends(EthereumClassicProtocol, _super);
    function EthereumClassicProtocol() {
        return _super.call(this, 'https://mew.epool.io/', 'https://classic.trustwalletapp.com', 61) || this; // we probably need another network here, explorer is ok
    }
    return EthereumClassicProtocol;
}(EthereumProtocol_1.EthereumProtocol));
exports.EthereumClassicProtocol = EthereumClassicProtocol;
