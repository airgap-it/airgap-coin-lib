import { SubstrateProtocolNetwork, SubstrateProtocolOptions } from '@airgap/substrate/v1'

import { MoonbeamProtocolConfiguration } from './configuration'

export type MoonbeamUnits = 'GLMR' | 'mGLMR' | 'uGLMR' | 'GWEI' | 'MWEI' | 'kWEI' | 'WEI'
export type MoonriverUnits = 'MOVR' | 'mMOVR' | 'uMOVR' | 'GWEI' | 'MWEI' | 'kWEI' | 'WEI'
export type MoonbaseUnits = 'DEV' | 'mDEV' | 'uDEV' | 'nDEV' | 'pDEV' | 'fDEV' | 'aDEV'

export interface MoonbeamProtocolNetwork extends SubstrateProtocolNetwork {
  blockExplorerApi: string
}

export interface MoonbeamProtocolOptions {
  network: MoonbeamProtocolNetwork
}

export interface MoonbeamBaseProtocolOptions<_Units extends string>
  extends SubstrateProtocolOptions<_Units, MoonbeamProtocolConfiguration, MoonbeamProtocolNetwork> {}
