export enum IACMessageType {
  // PairRequest = 1,
  // PairResponse = 2,
  AccountShareRequest = 3,
  AccountShareResponse = 4,
  TransactionSignRequest = 5,
  TransactionSignResponse = 6,
  MessageSignRequest = 7,
  MessageSignResponse = 8
  // MessageVerifyRequest = 9,
  // MessageVerifyResponse = 10,
  // MessageEncryptRequest = 11,
  // MessageEncryptResponse = 12,
  // MessageDecryptRequest = 13,
  // MessageDecryptResponse = 14,
  // ItemStoreRequest = 15,
  // ItemStoreResponse = 16,
  // ItemRetrieveRequest = 17,
  // ItemRetrieveResponse = 18,
  // ConfigSetRequest = 19,
  // ConfigSetResponse = 20,
  // MultisigRequest = 21,
  // MultisigResponse = 22,
  // SocialRecoveryShareRequest = 23,
  // SocialRecoveryShareResponse = 24
}

export type Result<T, E> = Success<T> | Failure<E>

export interface Success<T> {
  ok: true
  value: T
}

export interface Failure<E> {
  ok: false
  error: E
}

export function success<T>(value: T): Result<T, never> {
  return { ok: true, value }
}

export function failure<E>(error: E): Result<never, E> {
  return { ok: false, error }
}
