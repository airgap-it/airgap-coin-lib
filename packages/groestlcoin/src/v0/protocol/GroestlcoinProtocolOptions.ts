import * as ecc from '@airgap/coinlib-core/dependencies/src/@bitcoinerlab/secp256k1-1.2.0/src/index'
import { BIP32Factory as GroestlcoinBIP32Factory } from '@airgap/coinlib-core/dependencies/src/bip32grs-4.0.1/src/index'
import * as bitGoUTXO from '@airgap/coinlib-core/dependencies/src/groestlcoinjs-lib-6.1.5/src/index'
import { ProtocolBlockExplorer } from '@airgap/coinlib-core/utils/ProtocolBlockExplorer'
import { NetworkType, ProtocolNetwork } from '@airgap/coinlib-core/utils/ProtocolNetwork'
import { ProtocolOptions } from '@airgap/coinlib-core/utils/ProtocolOptions'

// tslint:disable:max-classes-per-file

// Constructed once at module load: BIP32Factory runs a full elliptic-curve self-test (testEcc) on
// every construction, which is far too expensive to repeat per `GroestlcoinProtocolConfig`.
const groestlcoinBip32 = GroestlcoinBIP32Factory(ecc as any)

const MAINNET_NAME: string = 'Mainnet'

const NODE_URL: string = ''

const BLOCK_EXPLORER_URL: string = 'https://chainz.cryptoid.info/grs'
const INDEXER_API: string = `https://cors-proxy.airgap.prod.gke.papers.tech/proxy?url=${'https://blockbook.groestlcoin.org'}`

export class GroestlcoinProtocolNetworkExtras {
  constructor(
    public readonly indexerApi: string = INDEXER_API,
    public readonly network: any = bitGoUTXO.networks.bitcoin
  ) {}
}

export class CryptoidBlockExplorer implements ProtocolBlockExplorer {
  constructor(public readonly blockExplorer: string = BLOCK_EXPLORER_URL) {}

  public async getAddressLink(address: string): Promise<string> {
    return `${this.blockExplorer}/address.dws?${address}.htm`
  }
  public async getTransactionLink(transactionId: string): Promise<string> {
    return `${this.blockExplorer}/tx.dws?${transactionId}.htm`
  }
}

export class GroestlcoinProtocolNetwork extends ProtocolNetwork<GroestlcoinProtocolNetworkExtras> {
  constructor(
    name: string = MAINNET_NAME,
    type: NetworkType = NetworkType.MAINNET,
    rpcUrl: string = NODE_URL,
    blockExplorer: ProtocolBlockExplorer = new CryptoidBlockExplorer(),
    extras: GroestlcoinProtocolNetworkExtras = new GroestlcoinProtocolNetworkExtras()
  ) {
    super(name, type, rpcUrl, blockExplorer, extras)
  }
}

export class GroestlcoinProtocolConfig {
  constructor(
    public readonly bitcoinJSLib: any = bitGoUTXO,
    // Groestlcoin base58check-encodes extended keys with groestl, so it needs its own BIP32.
    public readonly bip32Lib: any = groestlcoinBip32
  ) {}
}

export class GroestlcoinProtocolOptions implements ProtocolOptions<GroestlcoinProtocolConfig> {
  constructor(
    public readonly network: GroestlcoinProtocolNetwork = new GroestlcoinProtocolNetwork(),
    public readonly config: GroestlcoinProtocolConfig = new GroestlcoinProtocolConfig()
  ) {}
}
