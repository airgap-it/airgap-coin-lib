import { AirGapTransactionStatus, IAirGapTransactionResult } from '../interfaces/IAirGapTransaction'

import { IProtocolTransactionCursor } from './../interfaces/IAirGapTransaction'
import { FeeDefaults, ICoinBaseProtocol } from './ICoinBaseProtocol'
import { ICoinSubProtocol } from './ICoinSubProtocol'

export interface ICoinOnlineProtocol extends ICoinBaseProtocol {
  getBlockExplorerLinkForAddress(address: string): Promise<string>
  getBlockExplorerLinkForTxId(txId: string): Promise<string>

  getTransactionsFromPublicKey(publicKey: string, limit: number, cursor?: IProtocolTransactionCursor): Promise<IAirGapTransactionResult>
  getTransactionsFromExtendedPublicKey(
    extendedPublicKey: string,
    limit: number,
    cursor?: IProtocolTransactionCursor
  ): Promise<IAirGapTransactionResult>
  getTransactionsFromAddresses(addresses: string[], limit: number, cursor?: IProtocolTransactionCursor): Promise<IAirGapTransactionResult>

  getBalanceOfAddresses(addresses: string[], data?: { [key: string]: unknown }): Promise<string>
  getBalanceOfPublicKey(publicKey: string, data?: { addressIndex?: number; [key: string]: unknown }): Promise<string>
  getBalanceOfExtendedPublicKey(extendedPublicKey: string, offset: number, data?: { [key: string]: unknown }): Promise<string>
  getAvailableBalanceOfAddresses(addresses: string[], data?: { [key: string]: unknown }): Promise<string>
  getTransactionStatuses(transactionHash: string[]): Promise<AirGapTransactionStatus[]>
  getBalanceOfPublicKeyForSubProtocols(publicKey: string, subProtocols: ICoinSubProtocol[]): Promise<string[]>

  estimateMaxTransactionValueFromExtendedPublicKey(
    extendedPublicKey: string,
    recipients: string[],
    fee?: string,
    data?: { [key: string]: unknown }
  ): Promise<string>
  estimateMaxTransactionValueFromPublicKey(
    publicKey: string,
    recipients: string[],
    fee?: string,
    data?: { addressIndex?: number; [key: string]: unknown }
  ): Promise<string>

  estimateFeeDefaultsFromExtendedPublicKey(
    publicKey: string,
    recipients: string[],
    values: string[],
    data?: { [key: string]: unknown }
  ): Promise<FeeDefaults>
  estimateFeeDefaultsFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: string[],
    data?: { [key: string]: unknown }
  ): Promise<FeeDefaults>

  prepareTransactionFromExtendedPublicKey(
    extendedPublicKey: string,
    offset: number,
    recipients: string[],
    values: string[],
    fee: string,
    extras?: { [key: string]: unknown }
  ): Promise<any> // only broadcaster
  prepareTransactionFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: string[],
    fee: string,
    extras?: { [key: string]: unknown }
  ): Promise<any> // only broadcaster
  broadcastTransaction(rawTransaction: any): Promise<string>
}
