import { SCALEEncodable } from "./scale";
import { PolkadotTransactionMethod } from "./PolkadotTransactionMethod";
import BigNumber from "../../../../dependencies/src/bignumber.js-9.0.0/bignumber";
import { encodeCompactIntToHex, encodeIntToHex } from "../../utils/scale";
import { PolkadotEra } from "./PolkadotEra";

export class PolkadotTransactionPayload implements SCALEEncodable {

    constructor(
        private readonly method: PolkadotTransactionMethod,
        private readonly era: PolkadotEra,
        private readonly nonce: number | BigNumber,
        private readonly tip: number | BigNumber,
        private readonly specVersion: number | BigNumber,
        private readonly genesisHash: string,
        private readonly blockHash: string
    ) {}

    public encode(): string {
        const methodEncoded = this.method.encode()

        const eraEncoded = this.era.encode()
        const nonceEncoded = encodeCompactIntToHex(this.nonce)
        const tipEncoded = encodeCompactIntToHex(this.tip)
        const specVersionEncoded = encodeIntToHex(this.specVersion)

        return methodEncoded + eraEncoded + nonceEncoded + tipEncoded + specVersionEncoded + this.genesisHash + this.blockHash
    }
}