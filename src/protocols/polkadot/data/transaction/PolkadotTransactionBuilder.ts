import { PolkadotTransactionMethod, PolkadotSpendTransactionMethod } from "./PolkadotTransactionMethod"
import BigNumber from "../../../../dependencies/src/bignumber.js-9.0.0/bignumber"
import { PolkadotTransaction } from "./PolkadotTransaction"
import { PolkadotSignature, PolkadotSignatureType } from "./PolkadotSignature"

export abstract class PolkadotTransactionBuilder {
    protected _signer: string | null = null
    
    protected _tip: number | BigNumber | null = null
    protected _moduleIndex: number | null = null
    protected _callIndex: number | null = null

    public from(sender: string): this {
        this._signer = sender
        return this
    }

    public withMethod(moduleIndex: number, callIndex: number): this {
        this._moduleIndex = moduleIndex
        this._callIndex = callIndex
        return this
    }

    public setTip(tip: number | BigNumber): this {
        this._tip = tip
        return this
    }

    public build(): PolkadotTransaction {
        return new PolkadotTransaction(this.signer, this.signature, this.tip, this.method)
    }

    protected get signer(): string {
        this.assertHasParameter(this._signer, 'signer')
        return this._signer!
    }

    protected get signature(): PolkadotSignature {
        return new PolkadotSignature(PolkadotSignatureType.Sr25519, this.signer)
    }

    protected get tip(): number | BigNumber {
        this.assertHasParameter(this._tip, 'tip')
        return this._tip!
    }

    protected get moduleIndex(): number {
        this.assertHasParameter(this._moduleIndex, 'moduleIndex')
        return this._moduleIndex!
    }

    protected get callIndex(): number {
        this.assertHasParameter(this._callIndex, 'callIndex')
        return this._callIndex!
    }

    protected abstract get method(): PolkadotTransactionMethod

    protected assertHasParameter(parameter: any | null, parameterName: string) {
        if (parameter === null) {
            throw new Error(`PolkadotTransactionBuilder: parameter ${parameterName} is required.`)
        }
    }
}

export class PolkadotSpendTransactionBuilder extends PolkadotTransactionBuilder {
    private _destination: string | null = null
    private _value: number | BigNumber | null = null

    public to(destination: string): this {
        this._destination = destination
        return this
    }

    public setValue(value: number | BigNumber): this {
        this._value = value
        return this
    }

    protected get destination(): string {
        this.assertHasParameter(this._destination, 'destination')
        return this._destination!
    }

    protected get value(): number | BigNumber {
        this.assertHasParameter(this._value, 'value')
        return this._value!
    }

    protected get method(): PolkadotTransactionMethod {
        return new PolkadotSpendTransactionMethod(this.moduleIndex, this.callIndex, this.destination, this.value)
    }

}