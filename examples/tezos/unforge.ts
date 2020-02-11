import { TezosProtocol } from "../../src"

const rawForged = "4393ee10fb3f22106d470837bb1a0fa3ca90573902ca07c5a5d874050282aa796c00bf97f5f1dbfd6ada0cf986d0a812f1bf0a572abcb817958139997800e8070000bf97f5f1dbfd6ada0cf986d0a812f1bf0a572abc00"

const protocol = new TezosProtocol()

console.log(protocol.unforgeUnsignedTezosWrappedOperation(rawForged))