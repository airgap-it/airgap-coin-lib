import { PublicKey } from '@airgap/module-kit'
import { getNextPaymentAddressFromViewingKey, getPaymentAddressFromViewingKey, SaplingPaymentAddress } from '@airgap/sapling-wasm'

import { decodeBase58, encodeBase58 } from '../utils/encoding'
import { convertPublicKey } from '../utils/key'

export class TezosSaplingAddress {
  private constructor(private readonly value: string, public readonly raw: Buffer, public readonly diversifierIndex?: string) {}

  public static async fromViewingKey(viewingKey: string | PublicKey, index?: Buffer | string | number): Promise<TezosSaplingAddress> {
    const hexViewingKey: string =
      typeof viewingKey === 'string' ? viewingKey : convertPublicKey(viewingKey, 'hex', 'saplingViewingKey').value
    const paymentAddress: SaplingPaymentAddress = await getPaymentAddressFromViewingKey(hexViewingKey, index)

    return TezosSaplingAddress.fromRaw(paymentAddress.raw, paymentAddress.index)
  }

  public static async fromRaw(raw: Buffer, diversifierIndex?: Buffer): Promise<TezosSaplingAddress> {
    return new TezosSaplingAddress(encodeBase58(raw, 'saplingAddress'), raw, diversifierIndex?.toString('hex'))
  }

  public static async fromValue(value: string, diversifierIndex?: string): Promise<TezosSaplingAddress> {
    return new TezosSaplingAddress(value, decodeBase58(value, 'saplingAddress'), diversifierIndex)
  }

  public static async next(viewingKey: PublicKey, current: TezosSaplingAddress): Promise<TezosSaplingAddress> {
    if (current.diversifierIndex === undefined) {
      return Promise.reject(`Can't get next address for undefined diversifier index`)
    }

    const hexViewingKey: PublicKey = convertPublicKey(viewingKey, 'hex', 'saplingViewingKey')

    const nextAddress: SaplingPaymentAddress = await getNextPaymentAddressFromViewingKey(hexViewingKey.value, current.diversifierIndex)

    return TezosSaplingAddress.fromRaw(nextAddress.raw, nextAddress.index)
  }

  public static isZetAddress(address: string): boolean {
    return address.startsWith('zet1')
  }

  public asString(): string {
    return this.value
  }
}
