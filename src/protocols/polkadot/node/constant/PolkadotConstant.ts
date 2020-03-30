import { MetadataConstant } from '../metadata/module/MetadataConstants'

export class PolkadotConstant {
    public static fromMetadata(constant: MetadataConstant): PolkadotConstant {
        return new PolkadotConstant(constant.value.bytes, constant.type.value)
    }

    private constructor(
        readonly value: Buffer,
        readonly type: string
    ) {}
}