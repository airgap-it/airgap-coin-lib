import { FeeDefaults, ProtocolNetwork, ProtocolUnitsMetadata } from '@airgap/module-kit'

export type ICPUnits = 'ICP'

export type CkBTCUnits = 'ckBTC'

export interface ICPProtocolNetwork extends ProtocolNetwork {
  ledgerCanisterId: string
  governanceCanisterId: string
  explorerUrl: string
}

export interface ICPProtocolOptions {
  network: ICPProtocolNetwork
}

// ICRC-1

export interface ICRC1OfflineProtocolOptions<_Units extends string = string> {
  ledgerCanisterId: string

  identifier: string
  name: string

  units: ProtocolUnitsMetadata<_Units>
  mainUnit: _Units

  feeDefaults: FeeDefaults<_Units>
}

export interface ICRC1ProtocolNetwork extends ICPProtocolNetwork {}

export interface ICRC1OnlineProtocolOptions<
  _ProtocolNetwork extends ICRC1ProtocolNetwork = ICRC1ProtocolNetwork,
  _Units extends string = string
> {
  network: _ProtocolNetwork

  identifier: string
  name?: string

  units?: ProtocolUnitsMetadata<_Units>
  mainUnit?: _Units

  feeDefaults?: FeeDefaults<_Units>
}

// ckBTC

export interface CkBTCProtocolNetwork extends ICRC1ProtocolNetwork {
  indexerCanisterId: string
}

export interface CkBTCOfflineProtocolOptions {
  ledgerCanisterId: string
}

export interface CkBTCOnlineProtocolOptions {
  network: CkBTCProtocolNetwork
}
