import { MainProtocolSymbols } from '@airgap/coinlib-core'
// @ts-ignore
import * as ethUtil from '@airgap/coinlib-core/dependencies/src/ethereumjs-util-5.2.0'
import { AirGapInterface, RecursivePartial } from '@airgap/module-kit'

import { EthereumInfoClient } from '../../clients/info/EthereumInfoClient'
import { EtherscanInfoClient } from '../../clients/info/EtherscanInfoClient'
import { HttpEthereumNodeClient } from '../../clients/node/HttpEthereumNodeClient'
import { EthereumNodeClient } from '../../clients/node/EthereumNodeClient'
import { ERC20TokenMetadata, ERC20TokenOptions, EthereumProtocolNetwork } from '../../types/protocol'
import { ETHEREUM_MAINNET_PROTOCOL_NETWORK } from '../EthereumProtocol'

import { ERC20Protocol, ERC20ProtocolImpl } from './ERC20Protocol'

// Interface

export interface ERC20Token<_ProtocolNetwork extends EthereumProtocolNetwork = EthereumProtocolNetwork>
  extends AirGapInterface<ERC20Protocol<string, _ProtocolNetwork>, 'SingleTokenSubProtocol'> {}

// Implementation

export class ERC20TokenImpl<_ProtocolNetwork extends EthereumProtocolNetwork = EthereumProtocolNetwork>
  extends ERC20ProtocolImpl<string, _ProtocolNetwork>
  implements ERC20Token<_ProtocolNetwork> {
  public constructor(nodeClient: EthereumNodeClient, infoClient: EthereumInfoClient, options: ERC20TokenOptions<_ProtocolNetwork>) {
    super(nodeClient, infoClient, options)

    this._mainProtocol = options.mainIdentifier
  }

  // SubProtocol

  public async getType(): Promise<'token'> {
    return 'token'
  }

  private readonly _mainProtocol: string
  public async mainProtocol(): Promise<string> {
    return this._mainProtocol
  }

  public async getContractAddress(): Promise<string> {
    return this.contractAddress
  }
}

// Factory

type ERC20TokenOptionsWithoutMetadata = Omit<
  ERC20TokenOptions,
  'name' | 'identifier' | 'contractAddress' | 'symbol' | 'marketSymbol' | 'decimals'
>

export function createERC20Token(
  metadata: ERC20TokenMetadata,
  options: RecursivePartial<ERC20TokenOptionsWithoutMetadata> = {}
): ERC20Token {
  const completeOptions: ERC20TokenOptions = createERC20TokenOptions(metadata, options.network, options.mainIdentifier)

  return new ERC20TokenImpl(
    new HttpEthereumNodeClient(completeOptions.network.rpcUrl),
    new EtherscanInfoClient(completeOptions.network.blockExplorerApi),
    completeOptions
  )
}

export const ETHEREUM_ERC20_MAINNET_PROTOCOL_NETWORK: EthereumProtocolNetwork = {
  ...ETHEREUM_MAINNET_PROTOCOL_NETWORK
}

const DEFAULT_ERC20_PROTOCOL_NETWORK: EthereumProtocolNetwork = ETHEREUM_ERC20_MAINNET_PROTOCOL_NETWORK

export function createERC20TokenOptions(
  metadata: ERC20TokenMetadata,
  network: Partial<EthereumProtocolNetwork> = {},
  mainIdentifier?: string
): ERC20TokenOptions {
  return {
    network: { ...DEFAULT_ERC20_PROTOCOL_NETWORK, ...network },
    name: metadata.name,
    identifier: metadata.identifier,
    mainIdentifier: mainIdentifier ?? MainProtocolSymbols.ETH,

    contractAddress: metadata.contractAddress,

    units: {
      [metadata.symbol]: {
        symbol: { value: metadata.symbol, market: metadata.marketSymbol },
        decimals: metadata.decimals
      }
    },
    mainUnit: metadata.symbol
  }
}
