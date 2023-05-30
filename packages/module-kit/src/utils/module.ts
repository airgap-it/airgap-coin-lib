import { ProtocolSerializerExtension, ProtocolSerializerModule } from '../module/extensions/serialization/ProtocolSerializer'
import { Module } from '../module/module'
import { ModuleNetworkRegistry } from '../module/module-network-registry'
import { OfflineProtocolConfiguration, OnlineProtocolConfiguration, ProtocolConfiguration } from '../types/module'
import { ProtocolNetwork } from '../types/protocol'

import { implementsInterface, Schema } from './interface'

export function createSupportedProtocols<P extends string = string>(
  online: Record<P, ModuleNetworkRegistry> | Record<P, Record<string, ProtocolNetwork>>,
  offline?: P[]
): Record<P, ProtocolConfiguration> {
  const onlineIdentifiers: Set<P> = new Set(Object.keys(online) as P[])
  const offlineIdentifiers: Set<P> = offline ? new Set(offline) : onlineIdentifiers

  const identifiers: Set<P> = new Set(Array.from(onlineIdentifiers).concat(Array.from(onlineIdentifiers)))

  return Array.from(identifiers).reduce((obj: Record<P, ProtocolConfiguration>, next: P) => {
    const offlineConfiguration: OfflineProtocolConfiguration | undefined = offlineIdentifiers.has(next) ? { type: 'offline' } : undefined
    const onlineConfiguration: OnlineProtocolConfiguration | undefined = online[next]
      ? createOnlineProtocolConfiguration(online[next])
      : undefined

    const configuration: ProtocolConfiguration =
      offlineConfiguration !== undefined && onlineConfiguration !== undefined
        ? { type: 'full', offline: offlineConfiguration, online: onlineConfiguration }
        : ((offlineConfiguration ?? onlineConfiguration) as OfflineProtocolConfiguration | OnlineProtocolConfiguration)

    return Object.assign(obj, { [next]: configuration })
    // tslint:disable-next-line: no-object-literal-type-assertion
  }, {} as Record<P, ProtocolConfiguration>)
}

function createOnlineProtocolConfiguration(networks: ModuleNetworkRegistry | Record<string, ProtocolNetwork>): OnlineProtocolConfiguration {
  return {
    type: 'online',
    networks: (networks as ModuleNetworkRegistry).supportedNetworks ?? networks
  }
}

// Schemas

export const protocolSerializerSchema: Schema<ProtocolSerializerModule> = {
  serializeOfflineProtocol: 'required',
  deserializeOfflineProtocol: 'required',
  serializeOnlineProtocol: 'required',
  deserializeOnlineProtocol: 'required'
}

// Implementation Checks

export function canSerializeProtocols<T extends Module>(module: T): module is T & ProtocolSerializerExtension<T> {
  return implementsInterface<ProtocolSerializerModule>(module, protocolSerializerSchema)
}
