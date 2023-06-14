import { MainProtocolSymbols } from '@airgap/coinlib-core'
import { CosmosBaseProtocolImpl, CosmosBaseStakingProtocol, CosmosProtocolNetwork, CosmosProtocolOptions } from '@airgap/cosmos-core'
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

export type CoreumDenom = 'core' | 'ucore'

const DEFAULT_GAS: Amount<CoreumDenom> = newAmount('200000', 'blockchain')

export interface CoreumProtocol extends CosmosBaseStakingProtocol<CoreumDenom> {}

export class CoreumProtocolImpl extends CosmosBaseProtocolImpl<CoreumDenom> implements CoreumProtocol {
  public constructor(options: RecursivePartial<CosmosProtocolOptions<CoreumDenom>> = {}) {
    const fullOptions = createCoreumProtocolOptions(options)

    super(fullOptions)
  }

  private readonly units: ProtocolUnitsMetadata<CoreumDenom> = {
    core: {
      symbol: { value: 'CORE', market: 'CORE' },
      decimals: 6
    },
    ucore: {
      symbol: { value: 'uCORE' },
      decimals: 0
    }
  }

  private readonly feeDefaults: FeeDefaults<CoreumDenom> = {
    low: newAmount(0.007, 'core').blockchain(this.units),
    medium: newAmount(0.0085, 'core').blockchain(this.units),
    high: newAmount(0.01, 'core').blockchain(this.units)
  }

  private readonly metadata: ProtocolMetadata<CoreumDenom> = {
    identifier: MainProtocolSymbols.COREUM,
    name: 'Coreum',

    units: this.units,
    mainUnit: 'core',

    fee: {
      defaults: this.feeDefaults
    },

    account: {
      standardDerivationPath: `m/44'/990'/0'/0/0`,
      address: {
        isCaseSensitive: false,
        placeholder: 'core...',
        regex: '^(core|corevaloper)[a-zA-Z0-9]{39}$'
      }
    },

    transaction: {
      arbitraryData: {
        name: 'memo'
      }
    }
  }

  public async getMetadata(): Promise<ProtocolMetadata<CoreumDenom>> {
    return this.metadata
  }

  public async getTransactionFeeWithPublicKey(
    _publicKey: PublicKey,
    _details: TransactionDetails<CoreumDenom>[],
    _configuration?: TransactionSimpleConfiguration
  ): Promise<FeeDefaults<CoreumDenom>> {
    return this.feeDefaults
  }
}

// Factory

export function createCoreumProtocol(options: RecursivePartial<CosmosProtocolOptions<CoreumDenom>> = {}): CoreumProtocol {
  return new CoreumProtocolImpl(options)
}

export const COREUM_PROTOCOL_NETWORK: CosmosProtocolNetwork = {
  name: 'Mainnet',
  type: 'mainnet',
  rpcUrl: 'https://coreum-node.prod.gke.papers.tech',
  blockExplorerUrl: 'https://explorer.coreum.com/coreum',
  useCORSProxy: true
}

const DEFAULT_COREUM_PROTOCOL_NETWORK: CosmosProtocolNetwork = COREUM_PROTOCOL_NETWORK

export function createCoreumProtocolOptions(
  partialOptions: RecursivePartial<CosmosProtocolOptions<CoreumDenom>> = {}
): CosmosProtocolOptions<CoreumDenom> {
  return {
    network: { ...DEFAULT_COREUM_PROTOCOL_NETWORK, ...partialOptions.network },
    addressPrefix: partialOptions.addressPrefix ?? 'core',
    baseUnit: partialOptions.baseUnit ?? 'ucore',
    defaultGas: {
      value: partialOptions.defaultGas?.value ?? DEFAULT_GAS.value,
      unit: partialOptions.defaultGas?.unit ?? DEFAULT_GAS.unit
    }
  }
}
