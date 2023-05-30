import { Module } from '../module'

import { ProtocolSerializerExtension } from './serialization/ProtocolSerializer'

export type ModuleExtensions<T> = T extends Module ? Extensions<T> : never

interface Extensions<T extends Module> {
  ProtocolSerializer: ProtocolSerializerExtension<T>
}
