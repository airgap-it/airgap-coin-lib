import { ConditionViolationError } from '../errors'
import { Domain } from '../errors/coinlib-error'
import { IAirGapWallet } from '../interfaces/IAirGapWallet'
import { ICoinProtocol, CoinAddress } from '../protocols/ICoinProtocol'
import { ProtocolSymbols } from '../utils/ProtocolSymbols'

export enum AirGapWalletStatus {
  ACTIVE = 'active',
  HIDDEN = 'hidden',
  DELETED = 'deleted',
  TRANSIENT = 'transient'
}

export interface SerializedAirGapWallet {
  protocolIdentifier: ProtocolSymbols
  networkIdentifier: string
  publicKey: string
  isExtendedPublicKey: boolean
  derivationPath: string
  addresses: string[]
  masterFingerprint?: string
  status?: AirGapWalletStatus
  addressIndex?: number
}

export class AirGapWallet implements IAirGapWallet {
  public addresses: string[] = [] // used for cache

  constructor(
    public protocol: ICoinProtocol,
    public publicKey: string,
    public isExtendedPublicKey: boolean,
    public derivationPath: string,
    public masterFingerprint: string,
    public status: AirGapWalletStatus,
    public addressIndex?: number
  ) {}

  get receivingPublicAddress(): string {
    return this.addresses[this.addressIndex !== undefined ? this.addressIndex : 0]
  }

  public async setProtocol(protocol: ICoinProtocol): Promise<void> {
    if (this.protocol.identifier !== protocol.identifier) {
      throw new ConditionViolationError(Domain.WALLET, 'Can only set same protocol with a different network')
    }
    this.protocol = protocol
  }

  public async deriveAddresses(amount: number = 50): Promise<string[]> {
    let addresses: CoinAddress[]
    if (this.isExtendedPublicKey) {
      const parts: string[] = this.derivationPath.split('/')
      let offset: number = 0

      if (!parts[parts.length - 1].endsWith("'")) {
        offset = Number.parseInt(parts[parts.length - 1], 10)
      }

      addresses = (
        await Promise.all([
          this.protocol.getAddressesFromExtendedPublicKey(this.publicKey, 0, amount, offset),
          this.protocol.getAddressesFromExtendedPublicKey(this.publicKey, 1, amount, offset)
        ])
      ).reduce((flatten, next) => flatten.concat(next), [])
    } else {
      addresses = await this.protocol.getAddressesFromPublicKey(this.publicKey)
    }

    return addresses.map((address: CoinAddress) => address.getValue())
  }

  public toJSON(): SerializedAirGapWallet {
    return {
      protocolIdentifier: this.protocol.identifier,
      networkIdentifier: this.protocol.options.network.identifier,
      publicKey: this.publicKey,
      isExtendedPublicKey: this.isExtendedPublicKey,
      derivationPath: this.derivationPath,
      addresses: this.addresses,
      masterFingerprint: this.masterFingerprint,
      status: this.status,
      addressIndex: this.addressIndex
    }
  }
}
