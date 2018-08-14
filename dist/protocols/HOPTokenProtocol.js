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
var HOPTokenProtocol = /** @class */ (function (_super) {
    __extends(HOPTokenProtocol, _super);
    function HOPTokenProtocol() {
        return _super.call(this, '0x2dd847af80418D280B7078888B6A6133083001C9', 'https://ropsten.infura.io/', 'https://ropsten.trustwalletapp.com/', 3) || this; // we probably need another network here, explorer is ok
    }
    return HOPTokenProtocol;
}(GenericERC20_1.GenericERC20));
exports.HOPTokenProtocol = HOPTokenProtocol;
