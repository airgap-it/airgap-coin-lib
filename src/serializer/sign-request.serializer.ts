import { toBuffer } from './utils/toBuffer'

// TODO: Should we allow optional values?
export interface SignMessageRequest {
  message: string // Message to be signed
  publicKey?: string // Allows wallet to pre-select signing identity
  ttl?: string // Blockheight or timestamp to prevent replay attacks
  origin?: string // eg. airgap.it
  callbackURL?: string // eg. https://airgap.it/?signedMessage=
}

export enum SyncProtocolSignMessageRequest {
  MESSAGE = 0,
  PUBLIC_KEY = 1,
  TTL = 2,
  ORIGIN = 3,
  CALLBACK_URL = 4
}

export interface SerializedSyncProtocolSignMessageRequest extends Array<Buffer> {
  [SyncProtocolSignMessageRequest.MESSAGE]: Buffer
  [SyncProtocolSignMessageRequest.PUBLIC_KEY]: Buffer
  [SyncProtocolSignMessageRequest.TTL]: Buffer
  [SyncProtocolSignMessageRequest.ORIGIN]: Buffer
  [SyncProtocolSignMessageRequest.CALLBACK_URL]: Buffer
}

export class MessageSignRequestSerializer {
  public serialize(signMessageRequest: SignMessageRequest): SerializedSyncProtocolSignMessageRequest {
    const toSerialize: any[] = []

    toSerialize[SyncProtocolSignMessageRequest.MESSAGE] = signMessageRequest.message
    toSerialize[SyncProtocolSignMessageRequest.PUBLIC_KEY] = signMessageRequest.publicKey || ''
    toSerialize[SyncProtocolSignMessageRequest.TTL] = signMessageRequest.ttl || ''
    toSerialize[SyncProtocolSignMessageRequest.ORIGIN] = signMessageRequest.origin || ''
    toSerialize[SyncProtocolSignMessageRequest.CALLBACK_URL] = signMessageRequest.callbackURL || ''

    const serializedBuffer: SerializedSyncProtocolSignMessageRequest = toBuffer(toSerialize) as SerializedSyncProtocolSignMessageRequest

    return serializedBuffer
  }

  public deserialize(serializedSignMessageRequest: SerializedSyncProtocolSignMessageRequest): SignMessageRequest {
    const deserializedObject: SignMessageRequest = {
      message: serializedSignMessageRequest[SyncProtocolSignMessageRequest.MESSAGE].toString(),
      publicKey: serializedSignMessageRequest[SyncProtocolSignMessageRequest.PUBLIC_KEY].toString(),
      ttl: serializedSignMessageRequest[SyncProtocolSignMessageRequest.TTL].toString(),
      origin: serializedSignMessageRequest[SyncProtocolSignMessageRequest.ORIGIN].toString(),
      callbackURL: serializedSignMessageRequest[SyncProtocolSignMessageRequest.CALLBACK_URL].toString()
    }

    // TODO: Should we allow optional values?
    if (!deserializedObject.publicKey) {
      delete deserializedObject.publicKey
    }
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
