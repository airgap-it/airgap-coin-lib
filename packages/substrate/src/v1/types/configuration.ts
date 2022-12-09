// Protocol

import { TransactionMethodArgsDecoder, TransactionMethodArgsFactory } from '../data/transaction/method/SubstrateTransactionMethodArgs'
import { SubstrateSignatureType } from '../data/transaction/SubstrateSignature'

export interface SubstrateProtocolConfiguration<
  _AccountConfiguration extends SubstrateAccountConfiguration = SubstrateAccountConfiguration,
  _TransactionType extends string = string,
  _RpcConfiguration extends SubstrateRpcConfiguration = SubstrateRpcConfiguration
> {
  account: _AccountConfiguration
  signature?: SubstrateSignatureConfiguration
  transaction: SubstrateTransactionConfiguration<this, _TransactionType>
  rpc?: _RpcConfiguration
}

// Account

type SubstrateAccountType = 'ss58' | 'eth'
interface SubstrateBaseAccountConfiguration<_Type extends SubstrateAccountType> {
  type: _Type
}

export interface SubstrateSS58AccountConfiguration extends SubstrateBaseAccountConfiguration<'ss58'> {
  format: number
}

export interface SubstrateEthAccountConfiguration extends SubstrateBaseAccountConfiguration<'eth'> {}

export type SubstrateAccountConfiguration = SubstrateSS58AccountConfiguration | SubstrateEthAccountConfiguration

// Signature

export interface SubstrateSignatureConfiguration {
  fixedType?: SubstrateSignatureType
}

// Transaction

export interface SubstrateTransactionConfiguration<
  _ProtocolConfiguration extends SubstrateProtocolConfiguration,
  _Types extends string = string
> {
  types: Record<
    _Types,
    {
      index?: number // for legacy reasons, transaction types used to be gathered in one enum
      createArgsFactory(configuration: _ProtocolConfiguration, args: any): TransactionMethodArgsFactory<any, _ProtocolConfiguration>
      createArgsDecoder(configuration: _ProtocolConfiguration): TransactionMethodArgsDecoder<any, _ProtocolConfiguration>
    }
  >
}

// RPC

export interface SubstrateRpcConfiguration<
  _Methods extends SubstrateRpcMethods = SubstrateRpcMethods,
  _StorageEntries extends SubstrateRpcStorageEntries = SubstrateRpcStorageEntries,
  _Calls extends SubstrateRpcCalls = SubstrateRpcCalls,
  _Constants extends SubstrateRpcConstants = SubstrateRpcConstants
> {
  methods?: _Methods
  storageEntries?: _StorageEntries
  calls?: _Calls
  constants?: _Constants
}

type SubstrateRpcMethods = Record<string, Readonly<string[]>>
type SubstrateRpcStorageEntries = Record<string, Readonly<string[]>>
type SubstrateRpcCalls = Record<string, Readonly<string[]>>
type SubstrateRpcConstants = Record<string, Readonly<string[]>>
