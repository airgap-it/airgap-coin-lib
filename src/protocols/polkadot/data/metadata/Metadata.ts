import { MetadataModule } from "./module/MetadataModule"
import { SCALEClass } from "../../type/SCALEClass";
import { SCALEInt } from "../../type/primitive/SCALEInt";
import { SCALEArray } from "../../type/collection/SCALEArray";
import { SCALEDecoder } from "../../type/SCALEDecoder";

const MAGIC_NUMBER = '6174656d' // `meta` in hex
const EXPECTED_VERSION = 11

export interface ExtrinsicId {
    moduleIndex: number,
    callIndex: number
}
export class Metadata extends SCALEClass {

    public static decode(raw: string): Metadata {
        const decoder = new SCALEDecoder(raw)

        const magicNumber = decoder.decodeNextInt(32) // 32 bits
        this.assertMagicNumber(magicNumber.decoded.asNumber())

        const version = decoder.decodeNextInt(8) // 8 bits
        this.assertVersion(version.decoded.asNumber())

        const modules = decoder.decodeNextArray(MetadataModule.decode)

        return new Metadata(magicNumber.decoded, version.decoded, modules.decoded)
    }

    private static assertMagicNumber(magicNumber: number) {
        if (magicNumber !== parseInt(MAGIC_NUMBER, 16)) {
            throw new Error('Error while parsing metadata, invalid magic number')
        }
    }

    private static assertVersion(version: number) {
        if (version !== EXPECTED_VERSION) {
            throw new Error(`Error while parsing metadata, metadata version ${EXPECTED_VERSION} was expected, got ${version}`)
        }
    }

    protected scaleFields = [this.magicNumber, this.version, this.modules]

    private readonly extrinsicIds: Map<string, ExtrinsicId> = new Map()

    private constructor(
        readonly magicNumber: SCALEInt,
        readonly version: SCALEInt,
        readonly modules: SCALEArray<MetadataModule>
    ) { 
        super()
        modules.elements
            .filter(module => module.hasCalls)
            .map((module, moduleIndex) => module.calls.value.elements.map((call, callIndex) => [`${module.name.toCamelCase()}_${call.name.toCamelCase()}`, { moduleIndex, callIndex }] as [string, ExtrinsicId]))
            .reduce((prev, curr) => prev.concat(curr), [])
            .forEach(pair => this.extrinsicIds[pair[0]] = pair[1])
    }

    public getExtrinsicId(endpoint: string): ExtrinsicId {
        return this.extrinsicIds[endpoint]
    }

    public hasExtrinsicId(endpoint: string): boolean {
        return !!this.extrinsicIds[endpoint]
    }
}