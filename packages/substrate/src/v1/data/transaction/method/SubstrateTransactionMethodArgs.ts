// tslint:disable: max-classes-per-file
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { assertFields } from '@airgap/coinlib-core/utils/assert'
import { AirGapTransaction, newAmount } from '@airgap/module-kit'
import { SubstrateProtocolConfiguration } from '../../../types/configuration'
import { SubstrateAccountId } from '../../account/address/SubstrateAddress'
import { scaleAddressFactory, substrateAddressFactory, TypedSubstrateAddress } from '../../account/address/SubstrateAddressFactory'
import { SCALEDecoder, SCALEDecodeResult } from '../../scale/SCALEDecoder'
import { SCALECompactInt } from '../../scale/type/SCALECompactInt'
import { SCALEType } from '../../scale/type/SCALEType'
import { SubstrateTransactionType } from '../SubstrateTransaction'

interface TransferArgs<C extends SubstrateProtocolConfiguration> {
  to: SubstrateAccountId<TypedSubstrateAddress<C>>
  value: number | BigNumber
}

export abstract class TransactionMethodArgsFactory<T, C extends SubstrateProtocolConfiguration> {
  public static create<C extends SubstrateProtocolConfiguration>(
    configuration: C,
    type: SubstrateTransactionType<C>,
    args: any
  ): TransactionMethodArgsFactory<any, C> {
    switch (type) {
      case 'transfer':
        assertFields('transfer', args, 'to', 'value')

        return new TransferArgsFactory(configuration, args)
      default:
        return configuration.transaction.createTransactionMethodArgsFactory(configuration, type, args)
    }
  }

  protected constructor(protected readonly configuration: C, protected readonly args: T) {}

  public abstract createFields(): [string, SCALEType][]
  public abstract createToAirGapTransactionParts(): () => Partial<AirGapTransaction>[]
}

export abstract class TransactionMethodArgsDecoder<T, C extends SubstrateProtocolConfiguration> {
  public static create<C extends SubstrateProtocolConfiguration>(
    configuration: C,
    type: SubstrateTransactionType<C>
  ): TransactionMethodArgsDecoder<any, C> {
    switch (type) {
      case 'transfer':
        return new TransferArgsDecoder()
      default:
        return configuration.transaction.createTransactionMethodArgsDecoder(configuration, type)
    }
  }

  public decode(configuration: C, runtimeVersion: number | undefined, raw: string): SCALEDecodeResult<T> {
    const decoder = new SCALEDecoder(configuration, runtimeVersion, raw)

    return this._decode(decoder)
  }

  protected abstract _decode(decoder: SCALEDecoder<C>): SCALEDecodeResult<T>
}

class TransferArgsFactory<C extends SubstrateProtocolConfiguration> extends TransactionMethodArgsFactory<TransferArgs<C>, C> {
  public createFields(): [string, SCALEType][] {
    return [
      ['destination', scaleAddressFactory(this.configuration).from(this.args.to, this.configuration)],
      ['value', SCALECompactInt.from(this.args.value)]
    ]
  }

  public createToAirGapTransactionParts(): () => Partial<AirGapTransaction>[] {
    return () => [
      {
        to: [substrateAddressFactory(this.configuration).from(this.args.to).asString()],
        amount: newAmount(this.args.value.toString(), 'blockchain')
      }
    ]
  }
}

class TransferArgsDecoder<C extends SubstrateProtocolConfiguration> extends TransactionMethodArgsDecoder<TransferArgs<C>, C> {
  protected _decode(decoder: SCALEDecoder<C>): SCALEDecodeResult<TransferArgs<C>> {
    const destination = decoder.decodeNextAccount()
    const value = decoder.decodeNextCompactInt()

    return {
      bytesDecoded: destination.bytesDecoded + value.bytesDecoded,
      decoded: {
        to: destination.decoded.toString(),
        value: value.decoded.value
      }
    }
  }
}
