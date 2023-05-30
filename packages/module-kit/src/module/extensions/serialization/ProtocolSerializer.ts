import { AirGapOfflineProtocol, AirGapOnlineProtocol } from '../../../protocol/protocol'
import { Module } from '../../module'

interface AirGapSerializedBaseProtocol<T extends string> {
  type: T
  identifier: string
}

export interface AirGapSerializedOfflineProtocol extends AirGapSerializedBaseProtocol<'offline'> {}
export interface AirGapSerializedOnlineProtocol extends AirGapSerializedBaseProtocol<'online'> {}

export type AirGapSerializedAnyProtocol = AirGapSerializedOfflineProtocol | AirGapSerializedOnlineProtocol

export type ProtocolSerializerExtension<_T extends Module> = ProtocolSerializerModule

export interface ProtocolSerializerModule {
  serializeOfflineProtocol(protocol: AirGapOfflineProtocol): Promise<AirGapSerializedOfflineProtocol | undefined>
  deserializeOfflineProtocol(serialized: AirGapSerializedOfflineProtocol): Promise<AirGapOfflineProtocol | undefined>

  serializeOnlineProtocol(protocol: AirGapOnlineProtocol): Promise<AirGapSerializedOnlineProtocol | undefined>
  deserializeOnlineProtocol(serialized: AirGapSerializedOnlineProtocol): Promise<AirGapOnlineProtocol | undefined>
}
