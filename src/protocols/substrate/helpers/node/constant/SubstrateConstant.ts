import { MetadataConstant } from '../../data/metadata/module/MetadataConstants'

export class SubstrateConstant {
    public static fromMetadata(constant: MetadataConstant): SubstrateConstant {
        return new SubstrateConstant(constant.value.bytes, constant.type.value)
    }

    private constructor(
        readonly value: Buffer,
        readonly type: string
    ) {}
}