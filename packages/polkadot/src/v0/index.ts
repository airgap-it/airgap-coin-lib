import { KusamaProtocol } from './protocol/kusama/KusamaProtocol'
import {
  KusamaProtocolConfig,
  KusamaProtocolNetwork,
  KusamaProtocolNetworkExtras,
  KusamaProtocolOptions,
  KusamaSubscanBlockExplorer
} from './protocol/kusama/KusamaProtocolOptions'
import { PolkadotProtocol } from './protocol/polkadot/PolkadotProtocol'
import {
  PolkadotProtocolConfig,
  PolkadotProtocolNetwork,
  PolkadotProtocolNetworkExtras,
  PolkadotProtocolOptions,
  PolkadotSubscanBlockExplorer
} from './protocol/polkadot/PolkadotProtocolOptions'

export {
  PolkadotProtocol,
  KusamaProtocol,
  KusamaProtocolNetworkExtras,
  KusamaSubscanBlockExplorer as KusamaPolkascanBlockExplorer,
  KusamaProtocolConfig,
  KusamaProtocolNetwork,
  KusamaProtocolOptions,
  PolkadotProtocolNetworkExtras,
  PolkadotSubscanBlockExplorer,
  PolkadotProtocolConfig,
  PolkadotProtocolNetwork,
  PolkadotProtocolOptions
}
