import { ConditionViolationError } from '@airgap/coinlib-core/errors'
import { Domain } from '@airgap/coinlib-core/errors/coinlib-error'
import { AddressWithCursor, AirGapAnyProtocol, Bip32Extension, ExtendedPublicKey, isBip32Protocol, PublicKey } from '@airgap/module-kit'

import { normalizeAddress } from '../utils/address'
import { deriveAddresses } from '../utils/protocol'

export enum AirGapWalletStatus {
  ACTIVE = 'active',
  HIDDEN = 'hidden',
  DELETED = 'deleted',
  TRANSIENT = 'transient'
}

// TODO: we'll have to migrate serialized legacy wallets
export interface SerializedAirGapWallet {
  protocolIdentifier: string
  publicKey: PublicKey | ExtendedPublicKey
  derivationPath: string
  addresses: string[]
  masterFingerprint?: string
  status?: AirGapWalletStatus
  addressIndex?: number
}

export abstract class AirGapWallet<
  Protocol extends AirGapAnyProtocol = AirGapAnyProtocol,
  T extends Protocol | Bip32Extension<Protocol> = Protocol | Bip32Extension<Protocol>
> {
  public addresses: string[] = [] // used for cache

  public constructor(
    public protocol: T,
    public readonly publicKey: T extends Bip32Extension<Protocol> ? PublicKey | ExtendedPublicKey : T extends Protocol ? PublicKey : never,
    public readonly derivationPath: string,
    public readonly masterFingerprint: string,
    public status: AirGapWalletStatus,
    public addressIndex?: number
  ) {}

  get receivingPublicAddress(): string {
    return this.addresses[this.addressIndex !== undefined ? this.addressIndex : 0]
  }

  public async setProtocol(protocol: T): Promise<void> {
    const [currentProtocolIdentifier, nextProtocolIdentifier] = await Promise.all([
      this.protocol.getMetadata().then((metadata) => metadata.identifier),
      protocol.getMetadata().then((metadata) => metadata.identifier)
    ])

    if (nextProtocolIdentifier !== currentProtocolIdentifier) {
      throw new ConditionViolationError(Domain.WALLET, 'Can only set same protocol with a different network')
    }

    this.protocol = protocol
  }

  public async deriveAddresses(amount: number = 50): Promise<string[]> {
    let addresses: AddressWithCursor[]
    if (this.publicKey.type === 'xpub') {
      if (!isBip32Protocol(this.protocol)) {
        // This *should* never happen because of how the constructor is typed, but the compiler doesn't know it.
        // TODO: check if there's a way to tell the compiler here that `publicKey: ExtendedPublicKey => protocol: AirGapAnyExtendedProtocol`
        throw this.xpubRequiresExtendedProtocolError()
      }

      const parts: string[] = this.derivationPath.split('/')
      let offset: number = 0

      if (!parts[parts.length - 1].endsWith("'")) {
        offset = Number.parseInt(parts[parts.length - 1], 10)
      }

      addresses = (
        await Promise.all([
          deriveAddresses(this.protocol, this.publicKey, 0, amount, offset),
          deriveAddresses(this.protocol, this.publicKey, 1, amount, offset)
        ])
      ).reduce((flatten, next) => flatten.concat(next), [])
    } else {
      addresses = [normalizeAddress(await this.protocol.getAddressFromPublicKey(this.publicKey))]
    }

    return addresses.map((address: AddressWithCursor) => address.address)
  }

  public async toJSON(): Promise<SerializedAirGapWallet> {
    const protocolIdentifier = (await this.protocol.getMetadata()).identifier

    return {
      protocolIdentifier,
      publicKey: this.publicKey,
      derivationPath: this.derivationPath,
      addresses: this.addresses,
      masterFingerprint: this.masterFingerprint,
      status: this.status,
      addressIndex: this.addressIndex
    }
  }

  protected xpubRequiresExtendedProtocolError(): ConditionViolationError {
    return new ConditionViolationError(Domain.WALLET, 'Extended public keys are supported only when paired with an extended protocol')
  }
}
