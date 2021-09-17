import { getNextPaymentAddressFromViewingKey, getPaymentAddressFromViewingKey, SaplingPaymentAddress } from '@airgap/sapling-wasm'

import * as bs58check from '../../../dependencies/src/bs58check-2.1.2/index'
import { TezosAddress } from '../TezosAddress'
import { TezosUtils } from '../TezosUtils'

export class TezosSaplingAddress extends TezosAddress {
  private constructor(value: string, public readonly raw: Buffer, public readonly diversifierIndex?: string) {
    super(value)
  }

  public static async fromViewingKey(viewingKey: string, index?: Buffer | string | number): Promise<TezosSaplingAddress> {
    const paymentAddress: SaplingPaymentAddress = await getPaymentAddressFromViewingKey(viewingKey, index)

    return TezosSaplingAddress.fromRaw(paymentAddress.raw, paymentAddress.index)
  }

  public static async fromRaw(raw: Buffer, diversifierIndex?: Buffer): Promise<TezosSaplingAddress> {
    return new TezosSaplingAddress(
      bs58check.encode(Buffer.concat([TezosUtils.tezosPrefixes.zet1, raw])),
      raw,
      diversifierIndex?.toString('hex')
    )
  }

  public static async fromValue(value: string, diversifierIndex?: string): Promise<TezosSaplingAddress> {
    return new TezosSaplingAddress(value, bs58check.decode(value).slice(TezosUtils.tezosPrefixes.zet1.length), diversifierIndex)
  }

  public static async next(viewingKey: string, current: TezosSaplingAddress): Promise<TezosSaplingAddress> {
    if (current.diversifierIndex === undefined) {
      return Promise.reject(`Can't get next address for undefined diversifier index`)
    }

    const nextAddress: SaplingPaymentAddress = await getNextPaymentAddressFromViewingKey(viewingKey, current.diversifierIndex)

    return TezosSaplingAddress.fromRaw(nextAddress.raw, nextAddress.index)
  }

  public static isZetAddress(address: string): boolean {
    return address.startsWith('zet1')
  }
}
