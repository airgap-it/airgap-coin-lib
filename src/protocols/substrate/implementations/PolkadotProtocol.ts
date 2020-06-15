import { SubstrateProtocol } from '../SubstrateProtocol'
import { SubstrateNetwork } from '../SubstrateNetwork'
import { FeeDefaults, CurrencyUnit } from '../../ICoinProtocol'
import { SubstrateNodeClient } from '../helpers/node/SubstrateNodeClient'
import { SubstrateBlockExplorerClient } from '../helpers/blockexplorer/SubstrateBlockExplorerClient'

const NODE_URL = ''

const BLOCK_EXPLORER_URL = ''
const BLOCK_EXPLORER_API = ''

export class PolkadotProtocol extends SubstrateProtocol {
  public symbol: string = 'DOT'
  public name: string = 'Polkadot'
  public marketSymbol: string = 'DOT'
  public feeSymbol: string = 'DOT'

  public decimals: number = 12
  public feeDecimals: number = 12
  public identifier: string = 'polkadot'

  public feeDefaults: FeeDefaults = {
    low: '0.01', // 10 000 000 000
    medium: '0.01',
    high: '0.01'
  }

  public units: CurrencyUnit[] = [
    {
      unitSymbol: 'DOT',
      factor: '1'
    },
    {
      unitSymbol: 'mDOT',
      factor: '0.001'
    },
    {
      unitSymbol: 'uDOT',
      factor: '0.000001'
    },
    {
      unitSymbol: 'Point',
      factor: '0.000000001'
    },
    {
      unitSymbol: 'Planck',
      factor: '0.000000000001'
    }
  ]

  public standardDerivationPath: string = `m/44'/354'/0'/0/0` // TODO: verify

  public constructor(
    network: SubstrateNetwork = SubstrateNetwork.POLKADOT,
    nodeClient: SubstrateNodeClient = new SubstrateNodeClient(network, NODE_URL),
    blockExplorerClient: SubstrateBlockExplorerClient = new SubstrateBlockExplorerClient(network, BLOCK_EXPLORER_URL, BLOCK_EXPLORER_API)
  ) {
    super(network, nodeClient, blockExplorerClient)
  }
}
