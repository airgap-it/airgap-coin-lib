"use strict";
exports.__esModule = true;
var fs_1 = require("fs");
var replaceInFile = function (file, src, dest) {
    var content = fs_1.readFileSync(file, 'utf-8');
    var newContent = content.split(src).join(dest);
    fs_1.writeFileSync(file, newContent);
};
replaceInFile('./dist/protocols/ethereum/BaseEthereumProtocol.d.ts', 'get subProtocols(): any[];', 'readonly subProtocols: any[];');
replaceInFile('./dist/protocols/tezos/TezosProtocol.d.ts', 'get subProtocols(): any[];', 'readonly subProtocols: any[];');
replaceInFile('./dist/wallet/AirGapWallet.d.ts', 'get receivingPublicAddress(): string;', 'readonly receivingPublicAddress: string;');
replaceInFile('./dist/serializer/utils/toBuffer.d.ts', 'export declare type RLPData = number | string | boolean | BigNumber | Buffer | RLPData[]', 'export declare type RLPData = number | string | boolean | BigNumber | Buffer');
