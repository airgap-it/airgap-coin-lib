import { MainProtocolSymbols } from '@airgap/coinlib-core'
import {
  Amount,
  FeeDefaults,
  newAmount,
  ProtocolMetadata,
  ProtocolUnitsMetadata,
  PublicKey,
  RecursivePartial,
  TransactionDetails,
  TransactionSimpleConfiguration
} from '@airgap/module-kit'

import { CosmosBaseProtocolImpl, CosmosProtocolNetwork, CosmosProtocolOptions, CosmosBaseStakingProtocol } from '@airgap/cosmos-core'

export type CosmosDenom = 'atom' | 'uatom'

// Implementation
const DEFAULT_GAS: Amount<CosmosDenom> = newAmount('310000', 'blockchain')

export interface CosmosProtocol extends CosmosBaseStakingProtocol<CosmosDenom> {}

export class CosmosProtocolImpl extends CosmosBaseProtocolImpl<CosmosDenom> implements CosmosProtocol {
  public constructor(options: RecursivePartial<CosmosProtocolOptions<CosmosDenom>> = {}) {
    const fullOptions = createCosmosProtocolOptions(options)

    super(fullOptions)
  }

  // Common

  private readonly units: ProtocolUnitsMetadata<CosmosDenom> = {
    atom: {
      symbol: { value: 'ATOM', market: 'atom' },
      decimals: 6
    },
    uatom: {
      symbol: { value: 'uATOM' },
      decimals: 0
    }
  }

  private readonly feeDefaults: FeeDefaults<CosmosDenom> = {
    low: newAmount(0.0005, 'atom').blockchain(this.units),
    medium: newAmount(0.005, 'atom').blockchain(this.units),
    high: newAmount(0.0072, 'atom').blockchain(this.units)
  }

  private readonly metadata: ProtocolMetadata<CosmosDenom> = {
    identifier: MainProtocolSymbols.COSMOS,
    name: 'Cosmos',

    units: this.units,
    mainUnit: 'atom',

    fee: {
      defaults: this.feeDefaults
    },

    account: {
      standardDerivationPath: `m/44'/118'/0'/0/0`,
      address: {
        isCaseSensitive: false,
        placeholder: 'cosmos...',
        regex: '^(cosmos|cosmosvaloper)[a-zA-Z0-9]{39}$'
      }
    },

    transaction: {
      arbitraryData: {
        name: 'memo'
      }
    }
  }

  public async getMetadata(): Promise<ProtocolMetadata<CosmosDenom>> {
    return this.metadata
  }

  public async getTransactionFeeWithPublicKey(
    _publicKey: PublicKey,
    _details: TransactionDetails<CosmosDenom>[],
    _configuration?: TransactionSimpleConfiguration
  ): Promise<FeeDefaults<CosmosDenom>> {
    return this.feeDefaults
  }
}

// Factory

export function createCosmosProtocol(options: RecursivePartial<CosmosProtocolOptions<CosmosDenom>> = {}): CosmosProtocol {
  return new CosmosProtocolImpl(options)
}

export const COSMOS_MAINNET_PROTOCOL_NETWORK: CosmosProtocolNetwork = {
  name: 'Mainnet',
  type: 'mainnet',
  rpcUrl: 'https://cosmos-node.prod.gke.papers.tech',
  blockExplorerUrl: 'https://www.mintscan.io'
}

const DEFAULT_COSMOS_PROTOCOL_NETWORK: CosmosProtocolNetwork = COSMOS_MAINNET_PROTOCOL_NETWORK

export function createCosmosProtocolOptions(
  partialOptions: RecursivePartial<CosmosProtocolOptions<CosmosDenom>> = {}
): CosmosProtocolOptions<CosmosDenom> {
  return {
    network: { ...DEFAULT_COSMOS_PROTOCOL_NETWORK, ...partialOptions.network },
    addressPrefix: partialOptions.addressPrefix ?? 'cosmos',
    baseUnit: partialOptions.baseUnit ?? 'uatom',
    defaultGas: {
      value: partialOptions.defaultGas?.value ?? DEFAULT_GAS.value,
      unit: partialOptions.defaultGas?.unit ?? DEFAULT_GAS.unit
    }
  }
}
