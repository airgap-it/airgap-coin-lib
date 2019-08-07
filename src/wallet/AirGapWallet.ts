import { IAirGapWallet } from '../interfaces/IAirGapWallet'
import { ICoinProtocol } from '../protocols/ICoinProtocol'
import { getProtocolByIdentifier } from '../utils/protocolsByIdentifier'

export class AirGapWallet implements IAirGapWallet {
  public addresses: string[] = [] // used for cache
  public coinProtocol: ICoinProtocol

  constructor(
    public protocolIdentifier: string,
    public publicKey: string,
    public isExtendedPublicKey: boolean,
    public derivationPath: string,
    public addressIndex?: number
  ) {
    this.coinProtocol = getProtocolByIdentifier(this.protocolIdentifier)
  }

  get receivingPublicAddress(): string {
    return this.addresses[this.addressIndex !== undefined ? this.addressIndex : 0]
  }

  public async deriveAddresses(amount: number = 50): Promise<string[]> {
    if (this.isExtendedPublicKey) {
      const parts = this.derivationPath.split('/')
      let offset = 0

      if (!parts[parts.length - 1].endsWith("'")) {
        offset = Number.parseInt(parts[parts.length - 1], 10)
      }

      return [
        ...(await this.coinProtocol.getAddressesFromExtendedPublicKey(this.publicKey, 0, amount, offset)),
        ...(await this.coinProtocol.getAddressesFromExtendedPublicKey(this.publicKey, 1, amount, offset))
      ]
    } else {
      return this.coinProtocol.getAddressesFromPublicKey(this.publicKey)
    }
  }

  public toJSON(): any {
    const json = Object.assign({}, this)
    delete json.coinProtocol
    return json
  }
}
