import { assertNever, Domain } from '@airgap/coinlib-core'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { isPublicKey, PublicKey } from '@airgap/module-kit'
import {
  SubstrateAccountConfiguration,
  SubstrateEthAccountConfiguration,
  SubstrateSS58AccountConfiguration
} from '../../../types/configuration'
import { SubstrateProtocolConfiguration } from '../../../types/configuration'
import { convertPublicKey } from '../../../utils/keys'
import { SCALEDecodeResult } from '../../scale/SCALEDecoder'
import { SCALEAccountId } from '../../scale/type/SCALEAccountId'
import { SCALEMultiAddress, SCALEMultiAddressType } from '../../scale/type/SCALEMultiAddress'
import { SCALEType } from '../../scale/type/SCALEType'
import { SubstrateAccountId, SubstrateAddress } from './SubstrateAddress'
import { SubstrateEthAddress } from './SubstrateEthAddress'
import { SubstrateSS58Address } from './SubstrateSS58Address'

export interface SubstrateAddressFactory<C extends SubstrateProtocolConfiguration> {
  from(accountId: SubstrateAccountId<TypedSubstrateAddress<C>>): TypedSubstrateAddress<C>
  getPlaceholder(): TypedSubstrateAddress<C>
}

export interface SCALEAddressFactory<C extends SubstrateProtocolConfiguration> {
  from(value: string | PublicKey | Uint8Array | Buffer | TypedSubstrateAddress<C>, configuration: C): TypedSCALEAddress<C>
  decode(configuration: C, runtimeVersion: number | undefined, hex: string): SCALEDecodeResult<TypedSCALEAddress<C>>
}

export type TypedSubstrateAddress<C extends SubstrateProtocolConfiguration> = SubstrateAddressType[C['account']['type']]
interface SubstrateAddressType extends Record<SubstrateAccountConfiguration['type'], SubstrateAddress> {
  ss58: SubstrateSS58Address
  eth: SubstrateEthAddress
}

export type TypedSCALEAddress<C extends SubstrateProtocolConfiguration> = SCALEAddressRecord[C['account']['type']]
interface SCALEAddressRecord extends Record<SubstrateAccountConfiguration['type'], SCALEType> {
  ss58: SCALEMultiAddress<SCALEMultiAddressType.Id, SubstrateProtocolConfiguration<SubstrateSS58AccountConfiguration>>
  eth: SCALEAccountId<SubstrateProtocolConfiguration<SubstrateEthAccountConfiguration>>
}

export function substrateAddressFactory<C extends SubstrateProtocolConfiguration>(configuration: C): SubstrateAddressFactory<C> {
  const accountConfiguration: SubstrateAccountConfiguration = configuration.account

  switch (accountConfiguration.type) {
    case 'ss58':
      return {
        from: (accountId: SubstrateAccountId<SubstrateSS58Address>) => SubstrateSS58Address.from(accountId, accountConfiguration.format),
        getPlaceholder: SubstrateSS58Address.createPlaceholder
      } as SubstrateAddressFactory<C>
    case 'eth':
      return {
        from: SubstrateEthAddress.from,
        getPlaceholder: SubstrateEthAddress.createPlaceholder
      } as SubstrateAddressFactory<C>
    default:
      assertNever(accountConfiguration)
      throw new UnsupportedError(Domain.SUBSTRATE, 'Unknown account configuration')
  }
}

export function scaleAddressFactory<C extends SubstrateProtocolConfiguration>(configuration: C): SCALEAddressFactory<C> {
  switch (configuration.account.type) {
    case 'ss58':
      return {
        from: (value: string | PublicKey | Uint8Array | Buffer | TypedSubstrateAddress<C>, configuration: C) =>
          SCALEMultiAddress.from(
            isPublicKey(value) ? convertPublicKey(value, 'hex').value : value,
            SCALEMultiAddressType.Id,
            configuration
          ),
        decode: (configuration: C, runtimeVersion: number | undefined, hex: string) =>
          SCALEMultiAddress.decode(configuration, hex, SCALEMultiAddressType.Id, runtimeVersion)
      } as unknown as SCALEAddressFactory<C>
    case 'eth':
      return {
        from: SCALEAccountId.from,
        decode: (configuration: C, _: number | undefined, hex: string) => SCALEAccountId.decode(configuration, hex, 20)
      } as unknown as SCALEAddressFactory<C>
    default:
      throw new UnsupportedError(Domain.SUBSTRATE, 'Unknown account configuration')
  }
}
