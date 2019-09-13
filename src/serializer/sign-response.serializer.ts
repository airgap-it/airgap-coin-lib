import { toBuffer } from './utils/toBuffer'

// TODO: Should we allow optional values?
// TODO: Should we allow multiple signatures?
export interface SignMessageResponse {
  message: string // Message to be signed
  signature: string // Allows wallet to pre-select signing identity
  ttl?: string // Blockheight or timestamp to prevent replay attacks
  origin?: string // eg. airgap.it
  callbackURL?: string // eg. https://airgap.it/?signedMessage=
}

export enum SyncProtocolSignMessageResponse {
  MESSAGE = 0,
  SIGNATURE = 1,
  TTL = 2,
  ORIGIN = 3,
  CALLBACK_URL = 4
}

export interface SerializedSyncProtocolSignMessageResponse extends Array<Buffer> {
  [SyncProtocolSignMessageResponse.MESSAGE]: Buffer
  [SyncProtocolSignMessageResponse.SIGNATURE]: Buffer
  [SyncProtocolSignMessageResponse.TTL]: Buffer
  [SyncProtocolSignMessageResponse.ORIGIN]: Buffer
  [SyncProtocolSignMessageResponse.CALLBACK_URL]: Buffer
}

export class MessageSignResponseSerializer {
  public serialize(signMessageResponse: SignMessageResponse): SerializedSyncProtocolSignMessageResponse {
    const toSerialize: any[] = []

    toSerialize[SyncProtocolSignMessageResponse.MESSAGE] = signMessageResponse.message
    toSerialize[SyncProtocolSignMessageResponse.SIGNATURE] = signMessageResponse.signature
    toSerialize[SyncProtocolSignMessageResponse.TTL] = signMessageResponse.ttl || ''
    toSerialize[SyncProtocolSignMessageResponse.ORIGIN] = signMessageResponse.origin || ''
    toSerialize[SyncProtocolSignMessageResponse.CALLBACK_URL] = signMessageResponse.callbackURL || ''

    const serializedBuffer: SerializedSyncProtocolSignMessageResponse = toBuffer(toSerialize) as SerializedSyncProtocolSignMessageResponse

    return serializedBuffer
  }

  public deserialize(serializedSignMessageResponse: SerializedSyncProtocolSignMessageResponse): SignMessageResponse {
    const deserializedObject: SignMessageResponse = {
      message: serializedSignMessageResponse[SyncProtocolSignMessageResponse.MESSAGE].toString(),
      signature: serializedSignMessageResponse[SyncProtocolSignMessageResponse.SIGNATURE].toString(),
      ttl: serializedSignMessageResponse[SyncProtocolSignMessageResponse.TTL].toString(),
      origin: serializedSignMessageResponse[SyncProtocolSignMessageResponse.ORIGIN].toString(),
      callbackURL: serializedSignMessageResponse[SyncProtocolSignMessageResponse.CALLBACK_URL].toString()
    }

    // TODO: Should we allow optional values?
    if (!deserializedObject.ttl) {
      delete deserializedObject.ttl
    }
    if (!deserializedObject.origin) {
      delete deserializedObject.origin
    }
    if (!deserializedObject.callbackURL) {
      delete deserializedObject.callbackURL
    }

    return deserializedObject
  }
}
