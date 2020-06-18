import { IAirGapWallet } from '../interfaces/IAirGapWallet'
import { ICoinProtocol } from '../protocols/ICoinProtocol'
import { ProtocolSymbols } from '../utils/ProtocolSymbols'

interface SerializedAirGapWallet {
  protocolIdentifier: ProtocolSymbols
  networkIdentifier: string
  publicKey: string
  isExtendedPublicKey: boolean
  derivationPath: string
  addresses: string[]
  addressIndex?: number
}

export class AirGapWallet implements IAirGapWallet {
  public addresses: string[] = [] // used for cache

  constructor(
    public protocol: ICoinProtocol,
    public publicKey: string,
    public isExtendedPublicKey: boolean,
    public derivationPath: string,
    public addressIndex?: number
  ) {}

  get receivingPublicAddress(): string {
    return this.addresses[this.addressIndex !== undefined ? this.addressIndex : 0]
  }

  public async setProtocol(protocol: ICoinProtocol): Promise<void> {
    if (this.protocol.identifier !== protocol.identifier) {
      throw new Error('Can only set same protocol with a different network')
    }
    this.protocol = protocol
  }

  public async deriveAddresses(amount: number = 50): Promise<string[]> {
    if (this.isExtendedPublicKey) {
      const parts: string[] = this.derivationPath.split('/')
      let offset: number = 0

      if (!parts[parts.length - 1].endsWith("'")) {
        offset = Number.parseInt(parts[parts.length - 1], 10)
      }

      return [
        ...(await this.protocol.getAddressesFromExtendedPublicKey(this.publicKey, 0, amount, offset)),
        ...(await this.protocol.getAddressesFromExtendedPublicKey(this.publicKey, 1, amount, offset))
      ]
    } else {
      return this.protocol.getAddressesFromPublicKey(this.publicKey)
    }
  }

  public toJSON(): SerializedAirGapWallet {
    const json: SerializedAirGapWallet & { protocol: ICoinProtocol } = Object.assign(
      { protocolIdentifier: this.protocol.identifier, networkIdentifier: this.protocol.options.network.identifier },
      this
    )
    delete json.protocol

    return json
  }
}
