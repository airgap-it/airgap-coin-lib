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
var GenericERC20_1 = require("./GenericERC20");
var AETokenProtocol = /** @class */ (function (_super) {
    __extends(AETokenProtocol, _super);
    function AETokenProtocol() {
        var _this = _super.call(this, '0x5ca9a71b1d01849c0a95490cc00559717fcf0d1d') // we probably need another network here, explorer is ok
         || this;
        _this.symbol = 'AE';
        _this.name = 'Aeternity';
        _this.identifier = 'eth-erc20-ae';
        return _this;
    }
    return AETokenProtocol;
}(GenericERC20_1.GenericERC20));
exports.AETokenProtocol = AETokenProtocol;
