import { AirGapBlockExplorer } from '../block-explorer/block-explorer'
import { AirGapOfflineProtocol, AirGapOnlineProtocol } from '../protocol/protocol'
import { AirGapV3SerializerCompanion } from '../serializer/serializer'
import { AirGapInterface } from '../types/airgap'
import { ApplicableModuleExtension } from '../types/airgap'
import { Complement } from '../types/meta/utility-types'
import { ProtocolConfiguration } from '../types/module'
import { ProtocolNetwork } from '../types/protocol'

// ##### Type #####

interface ModuleGeneric<_Protocols extends string = string, _ProtocolNetwork extends ProtocolNetwork = ProtocolNetwork> {
  Protocols: _Protocols
  ProtocolNetwork: _ProtocolNetwork
}

type TypedProtocols<G extends Partial<ModuleGeneric>> = Complement<ModuleGeneric, G>['Protocols']
type TypedProtocolNetwork<G extends Partial<ModuleGeneric>> = Complement<ModuleGeneric, G>['ProtocolNetwork']

// ##### Module #####

interface _Module<_Protocols extends ModuleGeneric['Protocols'] = any, _ProtocolNetwork extends ModuleGeneric['ProtocolNetwork'] = any> {
  supportedProtocols: Record<_Protocols, ProtocolConfiguration>

  createOfflineProtocol(identifier: _Protocols): Promise<AirGapOfflineProtocol | undefined>
  createOnlineProtocol(identifier: _Protocols, networkOrId?: _ProtocolNetwork | string): Promise<AirGapOnlineProtocol | undefined>

  createBlockExplorer(identifier: _Protocols, networkOrId?: _ProtocolNetwork | string): Promise<AirGapBlockExplorer | undefined>

  createV3SerializerCompanion(): Promise<AirGapV3SerializerCompanion>
}

export type Module<G extends Partial<ModuleGeneric> = {}> = _Module<TypedProtocols<G>, TypedProtocolNetwork<G>>

// ##### Convinience Types #####

export type AirGapModule<
  G extends Partial<ModuleGeneric> = {},
  E0 extends ApplicableModuleExtension<Module> = undefined,
  E1 extends ApplicableModuleExtension<Module> = undefined,
  E2 extends ApplicableModuleExtension<Module> = undefined,
  E3 extends ApplicableModuleExtension<Module> = undefined,
  E4 extends ApplicableModuleExtension<Module> = undefined,
  E5 extends ApplicableModuleExtension<Module> = undefined,
  E6 extends ApplicableModuleExtension<Module> = undefined,
  E7 extends ApplicableModuleExtension<Module> = undefined,
  E8 extends ApplicableModuleExtension<Module> = undefined,
  E9 extends ApplicableModuleExtension<Module> = undefined
> = AirGapInterface<Module<G>, E0, E1, E2, E3, E4, E5, E6, E7, E8, E9>
