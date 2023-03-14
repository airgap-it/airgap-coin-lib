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
  TransactionDetails
} from '@airgap/module-kit'

export type CoreumDenom = 'testcore' | 'utestcore'

const DEFAULT_GAS: Amount<CoreumDenom> = newAmount('200000', 'blockchain')

export interface CoreumProtocol extends CosmosBaseStakingProtocol<CoreumDenom> {}

export class CoreumProtocolImpl extends CosmosBaseProtocolImpl<CoreumDenom> implements CoreumProtocol {
  public constructor(options: RecursivePartial<CosmosProtocolOptions<CoreumDenom>> = {}) {
    const fullOptions = createCoreumProtocolOptions(options)

    super(fullOptions)
  }

  private readonly units: ProtocolUnitsMetadata<CoreumDenom> = {
    testcore: {
      symbol: { value: 'TESTCORE', market: 'testcore' },
      decimals: 6
    },
    utestcore: {
      symbol: { value: 'uTESTCORE' },
      decimals: 0
    }
  }

  private readonly feeDefaults: FeeDefaults<CoreumDenom> = {
    low: newAmount(0.007, 'testcore').blockchain(this.units),
    medium: newAmount(0.0085, 'testcore').blockchain(this.units),
    high: newAmount(0.01, 'testcore').blockchain(this.units)
  }

  private readonly metadata: ProtocolMetadata<CoreumDenom> = {
    identifier: MainProtocolSymbols.COREUM,
    name: 'Coreum',

    units: this.units,
    mainUnit: 'testcore',

    fee: {
      defaults: this.feeDefaults
    },

    account: {
      standardDerivationPath: `m/44'/990'/0'/0/0`,
      address: {
        isCaseSensitive: false,
        placeholder: 'testcore...',
        regex: '^(testcore|testcorevaloper)[a-zA-Z0-9]{39}$'
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
    _details: TransactionDetails<CoreumDenom>[]
  ): Promise<FeeDefaults<CoreumDenom>> {
    return this.feeDefaults
  }
}

// Factory

export function createCoreumProtocol(options: RecursivePartial<CosmosProtocolOptions<CoreumDenom>> = {}): CoreumProtocol {
  return new CoreumProtocolImpl(options)
}

export const COREUM_PROTOCOL_NETWORK: CosmosProtocolNetwork = {
  name: 'Testnet',
  type: 'testnet',
  rpcUrl: 'https://full-node.testnet-1.coreum.dev:1317',
  useCORSProxy: true
}

const DEFAULT_COREUM_PROTOCOL_NETWORK: CosmosProtocolNetwork = COREUM_PROTOCOL_NETWORK

export function createCoreumProtocolOptions(
  partialOptions: RecursivePartial<CosmosProtocolOptions<CoreumDenom>> = {}
): CosmosProtocolOptions<CoreumDenom> {
  return {
    network: { ...DEFAULT_COREUM_PROTOCOL_NETWORK, ...partialOptions.network },
    addressPrefix: partialOptions.addressPrefix ?? 'testcore',
    baseUnit: partialOptions.baseUnit ?? 'utestcore',
    defaultGas: {
      value: partialOptions.defaultGas?.value ?? DEFAULT_GAS.value,
      unit: partialOptions.defaultGas?.unit ?? DEFAULT_GAS.unit
    }
  }
}
