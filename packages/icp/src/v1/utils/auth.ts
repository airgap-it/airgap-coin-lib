import { compare, concat, toHex } from './buffer'
import { HttpAgentRequest } from './http'
import { sha256 as jsSha256 } from 'js-sha256'
import borc from 'borc'
import { lebEncode } from './leb128'
import { Principal } from './principal'

const domainSeparator = new TextEncoder().encode('\x0Aic-request')

export type RequestId = ArrayBuffer & { __requestId__: void }

export enum RequestStatusResponseStatus {
  Received = 'received',
  Processing = 'processing',
  Replied = 'replied',
  Rejected = 'rejected',
  Unknown = 'unknown',
  Done = 'done'
}

interface ToHashable {
  toHash(): unknown
}

/**
 *
 * @param value unknown value
 * @returns ArrayBuffer
 */
export function hashValue(value: any): ArrayBuffer {
  if (value instanceof borc.Tagged) {
    return hashValue(value.value)
  } else if (typeof value === 'string') {
    return hashString(value)
  } else if (typeof value === 'number') {
    return hash(lebEncode(value))
  } else if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
    return hash(value as ArrayBuffer)
  } else if (Array.isArray(value)) {
    const vals = value.map(hashValue)
    return hash(concat(...vals))
  } else if (value && typeof value === 'object' && (value as any)._isPrincipal) {
    return hash((value as Principal).toUint8Array())
  } else if (typeof value === 'object' && value !== null && typeof (value as ToHashable).toHash === 'function') {
    return hashValue((value as ToHashable).toHash())
    // TODO This should be move to a specific async method as the webauthn flow required
    // the flow to be synchronous to ensure Safari touch id works.
    // } else if (value instanceof Promise) {
    //   return value.then(x => hashValue(x));
  } else if (typeof value === 'bigint') {
    // Do this check much later than the other bigint check because this one is much less
    // type-safe.
    // So we want to try all the high-assurance type guards before this 'probable' one.
    return hash(lebEncode(value))
  }
  throw Object.assign(new Error(`Attempt to hash a value of unsupported type: ${value}`), {
    // include so logs/callers can understand the confusing value.
    // (when stringified in error message, prototype info is lost)
    value
  })
}

/**
 * sha256 hash the provided Buffer
 * @param data - input to hash function
 */
export function hash(data: ArrayBuffer): ArrayBuffer {
  return jsSha256.create().update(new Uint8Array(data)).arrayBuffer()
}

const hashString = (value: string): ArrayBuffer => {
  const encoded = new TextEncoder().encode(value)
  return hash(encoded)
}

export function requestIdOf(request: Record<string, any>): RequestId {
  const hashed: Array<[ArrayBuffer, ArrayBuffer]> = Object.entries(request)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]: [string, unknown]) => {
      const hashedKey = hashString(key)
      const hashedValue = hashValue(value)

      return [hashedKey, hashedValue] as [ArrayBuffer, ArrayBuffer]
    })

  const traversed: Array<[ArrayBuffer, ArrayBuffer]> = hashed

  const sorted: Array<[ArrayBuffer, ArrayBuffer]> = traversed.sort(([k1], [k2]) => {
    return compare(k1, k2)
  })

  const concatenated: ArrayBuffer = concat(...sorted.map((x) => concat(...x)))
  const requestId = hash(concatenated) as RequestId
  return requestId
}

/**
 * A Key Pair, containing a secret and public key.
 */
export interface KeyPair {
  secretKey: ArrayBuffer
  publicKey: PublicKey
}

/**
 * A public key that is DER encoded. This is a branded ArrayBuffer.
 */
export type DerEncodedPublicKey = ArrayBuffer & { __derEncodedPublicKey__?: void }

/**
 * A signature array buffer.
 */
export type Signature = ArrayBuffer & { __signature__: void }

/**
 * A Public Key implementation.
 */
export interface PublicKey {
  // Get the public key bytes encoded with DER.
  toDer(): DerEncodedPublicKey
}

/**
 * A General Identity object. This does not have to be a private key (for example,
 * the Anonymous identity), but it must be able to transform request.
 */
export interface Identity {
  /**
   * Get the principal represented by this identity. Normally should be a
   * `Principal.selfAuthenticating()`.
   */
  getPrincipal(): Principal

  /**
   * Transform a request into a signed version of the request. This is done last
   * after the transforms on the body of a request. The returned object can be
   * anything, but must be serializable to CBOR.
   */
  transformRequest(request: HttpAgentRequest): Promise<unknown>
}

/**
 * An Identity that can sign blobs.
 */
export abstract class SignIdentity implements Identity {
  protected _principal: Principal | undefined

  /**
   * Returns the public key that would match this identity's signature.
   */
  public abstract getPublicKey(): PublicKey

  /**
   * Signs a blob of data, with this identity's private key.
   */
  public abstract sign(blob: ArrayBuffer): Promise<Signature>

  /**
   * Get the principal represented by this identity. Normally should be a
   * `Principal.selfAuthenticating()`.
   */
  public getPrincipal(): Principal {
    if (!this._principal) {
      this._principal = Principal.selfAuthenticating(new Uint8Array(this.getPublicKey().toDer()))
    }
    return this._principal
  }

  /**
   * Transform a request into a signed version of the request. This is done last
   * after the transforms on the body of a request. The returned object can be
   * anything, but must be serializable to CBOR.
   * @param request - internet computer request to transform
   */
  public async transformRequest(request: HttpAgentRequest): Promise<unknown> {
    const { body, ...fields } = request
    const requestId = await requestIdOf(body)
    return {
      ...fields,
      body: {
        content: body,
        sender_pubkey: this.getPublicKey().toDer(),
        sender_sig: await this.sign(concat(domainSeparator, requestId))
      }
    }
  }
}

export class AnonymousIdentity implements Identity {
  public getPrincipal(): Principal {
    return Principal.anonymous()
  }

  public async transformRequest(request: HttpAgentRequest): Promise<unknown> {
    return {
      ...request,
      body: { content: request.body }
    }
  }
}

/*
 * We need to communicate with other agents on the page about identities,
 * but those messages may need to go across boundaries where it's not possible to
 * serialize/deserialize object prototypes easily.
 * So these are lightweight, serializable objects that contain enough information to recreate
 * SignIdentities, but don't commit to having all methods of SignIdentity.
 *
 * Use Case:
 * * DOM Events that let differently-versioned components communicate to one another about
 *   Identities, even if they're using slightly different versions of agent packages to
 *   create/interpret them.
 */
export interface AnonymousIdentityDescriptor {
  type: 'AnonymousIdentity'
}
export interface PublicKeyIdentityDescriptor {
  type: 'PublicKeyIdentity'
  publicKey: string
}
export type IdentityDescriptor = AnonymousIdentityDescriptor | PublicKeyIdentityDescriptor

/**
 * Create an IdentityDescriptor from a @dfinity/identity Identity
 * @param identity - identity describe in returned descriptor
 */
export function createIdentityDescriptor(identity: SignIdentity | AnonymousIdentity): IdentityDescriptor {
  const identityIndicator: IdentityDescriptor =
    'getPublicKey' in identity
      ? { type: 'PublicKeyIdentity', publicKey: toHex(identity.getPublicKey().toDer()) }
      : { type: 'AnonymousIdentity' }
  return identityIndicator
}
