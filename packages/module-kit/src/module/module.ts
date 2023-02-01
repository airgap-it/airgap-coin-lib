import { AirGapBlockExplorer } from '../block-explorer/block-explorer'
import { AirGapOfflineProtocol, AirGapOnlineProtocol } from '../protocol/protocol'
import { AirGapV3SerializerCompanion } from '../serializer/serializer'
import { AirGapInterface } from '../types/airgap'
import { Complement } from '../types/meta/utility-types'
import { ProtocolConfiguration } from '../types/module'

// ##### Type #####

interface ModuleGeneric<_Protocols extends string = string> {
  Protocols: _Protocols
}

type TypedProtocols<G extends Partial<ModuleGeneric>> = Complement<ModuleGeneric, G>['Protocols']

// ##### Module #####

interface _Module<_Protocols extends ModuleGeneric['Protocols'] = any> {
  supportedProtocols: Record<_Protocols, ProtocolConfiguration>

  createOfflineProtocol(identifier: _Protocols): Promise<AirGapOfflineProtocol | undefined>
  createOnlineProtocol(identifier: _Protocols, networkId?: string): Promise<AirGapOnlineProtocol | undefined>

  createBlockExplorer(identifier: _Protocols, networkId?: string): Promise<AirGapBlockExplorer | undefined>

  createV3SerializerCompanion(): Promise<AirGapV3SerializerCompanion>
}

export type Module<G extends Partial<ModuleGeneric> = {}> = _Module<TypedProtocols<G>>

// ##### Convinience Types #####

export type AirGapModule<G extends Partial<ModuleGeneric> = {}> = AirGapInterface<Module<G>>
