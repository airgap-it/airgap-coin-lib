import { SCALEType } from "./scaleType";

export abstract class SCALEClass extends SCALEType {
    protected abstract readonly scaleFields: SCALEType[]

    protected _encode(): string {
        return this.scaleFields.reduce((encoded: string, current: SCALEType) => encoded + current.encode(), '')
    }
}