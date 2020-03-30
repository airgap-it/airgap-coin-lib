import { SCALEClass } from '../../codec/type/SCALEClass'
import { MetadataConstant } from './MetadataConstants'
import { MetadataStorage } from './storage/MetadataStorage'
import { MetadataCall } from './MetadataCall'
import { MetadataEvent } from './MetadataEvent'
import { MetadataError } from './MetadataError'
import { SCALEString } from '../../codec/type/SCALEString'
import { SCALEOptional } from '../../codec/type/SCALEOptional'
import { SCALEArray } from '../../codec/type/SCALEArray'
import { SCALEDecodeResult } from '../../codec/SCALEDecoder'
import { SCALEDecoder } from '../../codec/SCALEDecoder'

export class MetadataModule extends SCALEClass {

    public static decode(raw: string): SCALEDecodeResult<MetadataModule> {
        const decoder = new SCALEDecoder(raw)
        
        const name = decoder.decodeNextString()
        const storage = decoder.decodeNextOptional(MetadataStorage.decode)
        const calls = decoder.decodeNextOptional(hex => SCALEArray.decode(hex, MetadataCall.decode))
        const events = decoder.decodeNextOptional(hex => SCALEArray.decode(hex, MetadataEvent.decode))
        const constants =  decoder.decodeNextArray(MetadataConstant.decode)
        const errors = decoder.decodeNextArray(MetadataError.decode)

        return {
            bytesDecoded: name.bytesDecoded + storage.bytesDecoded + calls.bytesDecoded + events.bytesDecoded + constants.bytesDecoded + errors.bytesDecoded,
            decoded: new MetadataModule(name.decoded, storage.decoded, calls.decoded, events.decoded, constants.decoded, errors.decoded)
        }
    }

    protected scaleFields = [this.name, this.storage, this.calls, this.events, this.constants, this.errors]

    private constructor(
        readonly name: SCALEString,
        readonly storage: SCALEOptional<MetadataStorage>,
        readonly calls: SCALEOptional<SCALEArray<MetadataCall>>,
        readonly events: SCALEOptional<SCALEArray<MetadataEvent>>,
        readonly constants: SCALEArray<MetadataConstant>,
        readonly errors: SCALEArray<MetadataError>
    ) { super() }
}