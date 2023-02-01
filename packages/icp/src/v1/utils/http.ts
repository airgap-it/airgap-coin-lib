import { Principal } from './principal'
import { AccountIdentifier } from './account'
import { AnonymousIdentity, Identity, RequestId, requestIdOf } from './auth'
import { JsonObject } from './idl'
import { fromHex } from './buffer'
import * as Cbor from './cbor'
import * as cbor from 'simple-cbor'
import { lebEncode } from './leb128'
import { AgentError } from './errors'

const NANOSECONDS_PER_MILLISECONDS = BigInt(1_000_000)

const REPLICA_PERMITTED_DRIFT_MILLISECONDS = BigInt(60 * 1000)

export type E8s = bigint

export type QueryResponse = QueryResponseReplied | QueryResponseRejected

export enum ReplicaRejectCode {
  SysFatal = 1,
  SysTransient = 2,
  DestinationInvalid = 3,
  CanisterReject = 4,
  CanisterError = 5
}

export interface SubmitResponse {
  requestId: RequestId
  response: {
    ok: boolean
    status: number
    statusText: string
  }
}

export const enum QueryResponseStatus {
  Replied = 'replied',
  Rejected = 'rejected'
}

export interface QueryResponseBase {
  status: QueryResponseStatus
}

export interface QueryResponseReplied extends QueryResponseBase {
  status: QueryResponseStatus.Replied
  reply: { arg: ArrayBuffer }
}

export interface QueryResponseRejected extends QueryResponseBase {
  status: QueryResponseStatus.Rejected
  reject_code: ReplicaRejectCode
  reject_message: string
}

export type TransferRequest = {
  to: AccountIdentifier
  amount: bigint
  memo?: bigint
  fee?: E8s
  // TODO: If didc is updated in nns-dapp as well, this array of number will become a Uint8Array
  fromSubAccount?: number[]
  // Nanoseconds since unix epoc to trigger deduplication and avoid other issues
  // See the link for more details on deduplication
  // https://github.com/dfinity/ICRC-1/blob/main/standards/ICRC-1/README.md#transaction_deduplication
  createdAt?: bigint
}

export class Expiry {
  private readonly _value: bigint

  constructor(deltaInMSec: number) {
    // Use bigint because it can overflow the maximum number allowed in a double float.
    this._value = (BigInt(Date.now()) + BigInt(deltaInMSec) - REPLICA_PERMITTED_DRIFT_MILLISECONDS) * NANOSECONDS_PER_MILLISECONDS
  }

  //@ts-ignore
  public toCBOR(): cbor.CborValue {
    // TODO: change this to take the minimum amount of space (it always takes 8 bytes now).
    return cbor.value.u64(this._value.toString(16), 16)
  }

  public toHash(): ArrayBuffer {
    return lebEncode(this._value)
  }
}

/**
 * @internal
 */
export const enum Endpoint {
  Query = 'read',
  ReadState = 'read_state',
  Call = 'call'
}

// An HttpAgent request, before it gets encoded and sent to the server.
// We create an empty request that we will fill later.
export type HttpAgentRequest = HttpAgentQueryRequest | HttpAgentSubmitRequest | HttpAgentReadStateRequest

export interface HttpAgentBaseRequest {
  readonly endpoint: Endpoint
  request: RequestInit
}

export interface HttpAgentSubmitRequest extends HttpAgentBaseRequest {
  readonly endpoint: Endpoint.Call
  body: CallRequest
}

export interface HttpAgentQueryRequest extends HttpAgentBaseRequest {
  readonly endpoint: Endpoint.Query
  body: ReadRequest
}

export interface HttpAgentReadStateRequest extends HttpAgentBaseRequest {
  readonly endpoint: Endpoint.ReadState
  body: ReadRequest
}

export interface Signed<T> {
  content: T
  sender_pubkey: ArrayBuffer
  sender_sig: ArrayBuffer
}

export interface UnSigned<T> {
  content: T
}

export type Envelope<T> = Signed<T> | UnSigned<T>

export interface HttpAgentRequestTransformFn {
  (args: HttpAgentRequest): Promise<HttpAgentRequest | undefined | void>
  priority?: number
}

// The fields in a "call" submit request.
// tslint:disable:camel-case
export interface CallRequest extends Record<string, any> {
  request_type: SubmitRequestType.Call
  canister_id: Principal
  method_name: string
  arg: ArrayBuffer
  sender: Uint8Array | Principal
  ingress_expiry: Expiry
}
// tslint:enable:camel-case

// The types of values allowed in the `request_type` field for submit requests.
export enum SubmitRequestType {
  Call = 'call'
}

// The types of values allowed in the `request_type` field for read requests.
export const enum ReadRequestType {
  Query = 'query',
  ReadState = 'read_state'
}

// The fields in a "query" read request.
export interface QueryRequest extends Record<string, any> {
  request_type: ReadRequestType.Query
  canister_id: Principal
  method_name: string
  arg: ArrayBuffer
  sender: Uint8Array | Principal
  ingress_expiry: Expiry
}

export interface ReadStateRequest extends Record<string, any> {
  request_type: ReadRequestType.ReadState
  paths: ArrayBuffer[][]
  ingress_expiry: Expiry
  sender: Uint8Array | Principal
}

export type ReadRequest = QueryRequest | ReadStateRequest

// A Nonce that can be used for calls.
export type Nonce = Uint8Array & { __nonce__: void }

/**
 * Create a random Nonce, based on date and a random suffix.
 */
export function makeNonce(): Nonce {
  // Encode 128 bits.
  const buffer = new ArrayBuffer(16)
  const view = new DataView(buffer)
  const now = BigInt(+Date.now())
  const randHi = Math.floor(Math.random() * 0xffffffff)
  const randLo = Math.floor(Math.random() * 0xffffffff)
  // Fix for IOS < 14.8 setBigUint64 absence
  if (typeof view.setBigUint64 === 'function') {
    view.setBigUint64(0, now)
  } else {
    const TWO_TO_THE_32 = BigInt(1) << BigInt(32)
    view.setUint32(0, Number(now >> BigInt(32)))
    view.setUint32(4, Number(now % TWO_TO_THE_32))
  }
  view.setUint32(8, randHi)
  view.setUint32(12, randLo)

  return buffer as Nonce
}

export interface ReadStateOptions {
  /**
   * A list of paths to read the state of.
   */
  paths: ArrayBuffer[][]
}

export interface ReadStateResponse {
  certificate: ArrayBuffer
}

export interface CallOptions {
  /**
   * The method name to call.
   */
  methodName: string

  /**
   * A binary encoded argument. This is already encoded and will be sent as is.
   */
  arg: ArrayBuffer

  /**
   * An effective canister ID, used for routing. This should only be mentioned if
   * it's different from the canister ID.
   */
  effectiveCanisterId: Principal | string
}

export interface QueryFields {
  /**
   * The method name to call.
   */
  methodName: string

  /**
   * A binary encoded argument. This is already encoded and will be sent as is.
   */
  arg: ArrayBuffer
}

export interface Agent {
  readonly rootKey: ArrayBuffer | null
  /**
   * Returns the principal ID associated with this agent (by default). It only shows
   * the principal of the default identity in the agent, which is the principal used
   * when calls don't specify it.
   */
  getPrincipal(): Promise<Principal>

  /**
   * Create the request for the read state call.
   * `readState` uses this internally.
   * Useful to avoid signing the same request multiple times.
   */
  createReadStateRequest?(
    options: ReadStateOptions,
    identity?: Identity
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  ): Promise<any>

  /**
   * Send a read state query to the replica. This includes a list of paths to return,
   * and will return a Certificate. This will only reject on communication errors,
   * but the certificate might contain less information than requested.
   * @param effectiveCanisterId A Canister ID related to this call.
   * @param options The options for this call.
   * @param identity Identity for the call. If not specified, uses the instance identity.
   * @param request The request to send in case it has already been created.
   */
  readState(
    effectiveCanisterId: Principal | string,
    options: ReadStateOptions,
    identity?: Identity,
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    request?: any
  ): Promise<ReadStateResponse>

  call(canisterId: Principal | string, fields: CallOptions): Promise<SubmitResponse>

  /**
   * Query the status endpoint of the replica. This normally has a few fields that
   * corresponds to the version of the replica, its root public key, and any other
   * information made public.
   * @returns A JsonObject that is essentially a record of fields from the status
   *     endpoint.
   */
  status(): Promise<JsonObject>

  /**
   * Send a query call to a canister. See
   * {@link https://sdk.dfinity.org/docs/interface-spec/#http-query | the interface spec}.
   * @param canisterId The Principal of the Canister to send the query to. Sending a query to
   *     the management canister is not supported (as it has no meaning from an agent).
   * @param options Options to use to create and send the query.
   * @returns The response from the replica. The Promise will only reject when the communication
   *     failed. If the query itself failed but no protocol errors happened, the response will
   *     be of type QueryResponseRejected.
   */
  query(canisterId: Principal | string, options: QueryFields): Promise<QueryResponse>

  /**
   * By default, the agent is configured to talk to the main Internet Computer,
   * and verifies responses using a hard-coded public key.
   *
   * This function will instruct the agent to ask the endpoint for its public
   * key, and use that instead. This is required when talking to a local test
   * instance, for example.
   *
   * Only use this when you are  _not_ talking to the main Internet Computer,
   * otherwise you are prone to man-in-the-middle attacks! Do not call this
   * function by default.
   */
  fetchRootKey(): Promise<ArrayBuffer>
  /**
   * If an application needs to invalidate an identity under certain conditions, an `Agent` may expose an `invalidateIdentity` method.
   * Invoking this method will set the inner identity used by the `Agent` to `null`.
   *
   * A use case for this would be - after a certain period of inactivity, a secure application chooses to invalidate the identity of any `HttpAgent` instances. An invalid identity can be replaced by `Agent.replaceIdentity`
   */
  invalidateIdentity?(): void
  /**
   * If an application needs to replace an identity under certain conditions, an `Agent` may expose a `replaceIdentity` method.
   * Invoking this method will set the inner identity used by the `Agent` to a newly provided identity.
   *
   * A use case for this would be - after authenticating using `@dfinity/auth-client`, you can replace the `AnonymousIdentity` of your `Actor` with a `DelegationIdentity`.
   *
   * ```Actor.agentOf(defaultActor).replaceIdentity(await authClient.getIdentity());```
   */
  replaceIdentity?(identity: Identity): void
}

export enum RequestStatusResponseStatus {
  Received = 'received',
  Processing = 'processing',
  Replied = 'replied',
  Rejected = 'rejected',
  Unknown = 'unknown',
  Done = 'done'
}

// Default delta for ingress expiry is 5 minutes.
const DEFAULT_INGRESS_EXPIRY_DELTA_IN_MSECS = 5 * 60 * 1000

// Root public key for the IC, encoded as hex
const IC_ROOT_KEY =
  '308182301d060d2b0601040182dc7c0503010201060c2b0601040182dc7c05030201036100814' +
  'c0e6ec71fab583b08bd81373c255c3c371b2e84863c98a4f1e08b74235d14fb5d9c0cd546d968' +
  '5f913a0c0b2cc5341583bf4b4392e467db96d65b9bb4cb717112f8472e0d5a4d14505ffd7484' +
  'b01291091c5f87b98883463f98091a0baaae'

// IC0 domain info
const IC0_DOMAIN = 'ic0.app'
const IC0_SUB_DOMAIN = '.ic0.app'

class HttpDefaultFetchError extends AgentError {
  constructor(public readonly message: string) {
    super(message)
  }
}
export class IdentityInvalidError extends AgentError {
  constructor(public readonly message: string) {
    super(message)
  }
}

// HttpAgent options that can be used at construction.
export interface HttpAgentOptions {
  // Another HttpAgent to inherit configuration (pipeline and fetch) of. This
  // is only used at construction.
  source?: HttpAgent

  // A surrogate to the global fetch function. Useful for testing.
  fetch?: typeof fetch

  // The host to use for the client. By default, uses the same host as
  // the current page.
  host?: string

  // The principal used to send messages. This cannot be empty at the request
  // time (will throw).
  identity?: Identity | Promise<Identity>

  credentials?: {
    name: string
    password?: string
  }
}

function getDefaultFetch(): typeof fetch {
  let defaultFetch

  if (typeof window !== 'undefined') {
    // Browser context
    if (window.fetch) {
      defaultFetch = window.fetch.bind(window)
    } else {
      throw new HttpDefaultFetchError(
        'Fetch implementation was not available. You appear to be in a browser context, but window.fetch was not present.'
      )
    }
  } else if (typeof global !== 'undefined') {
    // Node context
    if (global.fetch) {
      defaultFetch = global.fetch.bind(global)
    } else {
      throw new HttpDefaultFetchError(
        'Fetch implementation was not available. You appear to be in a Node.js context, but global.fetch was not available.'
      )
    }
  } else if (typeof self !== 'undefined') {
    if (self.fetch) {
      defaultFetch = self.fetch.bind(self)
    }
  }

  if (defaultFetch) {
    return defaultFetch
  }
  throw new HttpDefaultFetchError(
    'Fetch implementation was not available. Please provide fetch to the HttpAgent constructor, or ensure it is available in the window or global context.'
  )
}

// A HTTP agent allows users to interact with a client of the internet computer
// using the available methods. It exposes an API that closely follows the
// public view of the internet computer, and is not intended to be exposed
// directly to the majority of users due to its low-level interface.
//
// There is a pipeline to apply transformations to the request before sending
// it to the client. This is to decouple signature, nonce generation and
// other computations so that this class can stay as simple as possible while
// allowing extensions.
export class HttpAgent implements Agent {
  public rootKey = fromHex(IC_ROOT_KEY)
  private readonly _pipeline: HttpAgentRequestTransformFn[] = []
  private _identity: Promise<Identity> | null
  private readonly _fetch: typeof fetch
  private readonly _host: URL
  private readonly _credentials: string | undefined
  private _rootKeyFetched = false

  constructor(options: HttpAgentOptions = {}) {
    if (options.source) {
      if (!(options.source instanceof HttpAgent)) {
        throw new Error("An Agent's source can only be another HttpAgent")
      }
      this._pipeline = [...options.source._pipeline]
      this._identity = options.source._identity
      this._fetch = options.source._fetch
      this._host = options.source._host
      this._credentials = options.source._credentials
    } else {
      this._fetch = options.fetch || getDefaultFetch() || fetch.bind(global)
    }
    if (options.host !== undefined) {
      if (!options.host.match(/^[a-z]+:/) && typeof window !== 'undefined') {
        this._host = new URL(window.location.protocol + '//' + options.host)
      } else {
        this._host = new URL(options.host)
      }
    } else if (options.source !== undefined) {
      // Safe to ignore here.
      this._host = options.source._host
    } else {
      const location = typeof window !== 'undefined' ? window.location : undefined
      if (!location) {
        throw new Error('Must specify a host to connect to.')
      }
      this._host = new URL(location + '')
    }

    // Rewrite to avoid redirects
    if (this._host.hostname.endsWith(IC0_SUB_DOMAIN)) {
      this._host.hostname = IC0_DOMAIN
    }

    if (options.credentials) {
      const { name, password } = options.credentials
      this._credentials = `${name}${password ? ':' + password : ''}`
    }
    this._identity = Promise.resolve(options.identity || new AnonymousIdentity())
  }

  public addTransform(fn: HttpAgentRequestTransformFn, priority = fn.priority || 0): void {
    // Keep the pipeline sorted at all time, by priority.
    const i = this._pipeline.findIndex((x) => (x.priority || 0) < priority)
    this._pipeline.splice(i >= 0 ? i : this._pipeline.length, 0, Object.assign(fn, { priority }))
  }

  public async getPrincipal(): Promise<Principal> {
    if (!this._identity) {
      throw new IdentityInvalidError(
        "This identity has expired due this application's security policy. Please refresh your authentication."
      )
    }
    //@ts-ignore
    return (await this._identity).getPrincipal()
  }

  public async call(
    canisterId: Principal | string,
    options: {
      methodName: string
      arg: ArrayBuffer
      effectiveCanisterId?: Principal | string
    },
    identity?: Identity | Promise<Identity>
  ): Promise<SubmitResponse> {
    const id = await (identity !== undefined ? await identity : await this._identity)
    if (!id) {
      throw new IdentityInvalidError(
        "This identity has expired due this application's security policy. Please refresh your authentication."
      )
    }
    const canister = Principal.from(canisterId)
    const ecid = options.effectiveCanisterId ? Principal.from(options.effectiveCanisterId) : canister

    //@ts-ignore
    const sender: Principal = id.getPrincipal() || Principal.anonymous()

    const submit: CallRequest = {
      request_type: SubmitRequestType.Call,
      canister_id: canister,
      method_name: options.methodName,
      arg: options.arg,
      sender,
      ingress_expiry: new Expiry(DEFAULT_INGRESS_EXPIRY_DELTA_IN_MSECS)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let transformedRequest: any = (await this._transform({
      request: {
        body: null,
        method: 'POST',
        headers: {
          'Content-Type': 'application/cbor',
          ...(this._credentials ? { Authorization: 'Basic ' + btoa(this._credentials) } : {})
        }
      },
      endpoint: Endpoint.Call,
      body: submit
    })) as HttpAgentSubmitRequest

    // Apply transform for identity.
    transformedRequest = await id.transformRequest(transformedRequest)

    const body = Cbor.encode(transformedRequest.body)

    // Run both in parallel. The fetch is quite expensive, so we have plenty of time to
    // calculate the requestId locally.
    const [response, requestId] = await Promise.all([
      this._fetch('' + new URL(`/api/v2/canister/${ecid.toText()}/call`, this._host), {
        ...transformedRequest.request,
        body
      }),
      requestIdOf(submit)
    ])

    if (!response.ok) {
      throw new Error(
        `Server returned an error:\n` + `  Code: ${response.status} (${response.statusText})\n` + `  Body: ${await response.text()}\n`
      )
    }

    return {
      requestId,
      response: {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      }
    }
  }

  public async query(canisterId: Principal | string, fields: QueryFields, identity?: Identity | Promise<Identity>): Promise<QueryResponse> {
    const id = await (identity !== undefined ? await identity : await this._identity)
    if (!id) {
      throw new IdentityInvalidError(
        "This identity has expired due this application's security policy. Please refresh your authentication."
      )
    }

    const canister = typeof canisterId === 'string' ? Principal.fromText(canisterId) : canisterId
    const sender = id?.getPrincipal() || Principal.anonymous()

    const request: QueryRequest = {
      request_type: ReadRequestType.Query,
      canister_id: canister,
      method_name: fields.methodName,
      arg: fields.arg,
      //@ts-ignore
      sender,
      ingress_expiry: new Expiry(DEFAULT_INGRESS_EXPIRY_DELTA_IN_MSECS)
    }

    // TODO: remove this any. This can be a Signed or UnSigned request.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let transformedRequest: any = await this._transform({
      request: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/cbor',
          ...(this._credentials ? { Authorization: 'Basic ' + btoa(this._credentials) } : {})
        }
      },
      endpoint: Endpoint.Query,
      body: request
    })

    // Apply transform for identity.
    transformedRequest = await id?.transformRequest(transformedRequest)

    const body = Cbor.encode(transformedRequest.body)
    const response = await this._fetch('' + new URL(`/api/v2/canister/${canister.toText()}/query`, this._host), {
      ...transformedRequest.request,
      body
    })

    if (!response.ok) {
      throw new Error(
        `Server returned an error:\n` + `  Code: ${response.status} (${response.statusText})\n` + `  Body: ${await response.text()}\n`
      )
    }
    return Cbor.decode(await response.arrayBuffer())
  }

  public async readState(
    canisterId: Principal | string,
    fields: ReadStateOptions,
    identity?: Identity | Promise<Identity>
  ): Promise<ReadStateResponse> {
    const canister = typeof canisterId === 'string' ? Principal.fromText(canisterId) : canisterId
    const id = await (identity !== undefined ? await identity : await this._identity)
    if (!id) {
      throw new IdentityInvalidError(
        "This identity has expired due this application's security policy. Please refresh your authentication."
      )
    }
    const sender = id?.getPrincipal() || Principal.anonymous()

    // TODO: remove this any. This can be a Signed or UnSigned request.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let transformedRequest: any = await this._transform({
      request: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/cbor',
          ...(this._credentials ? { Authorization: 'Basic ' + btoa(this._credentials) } : {})
        }
      },
      endpoint: Endpoint.ReadState,
      body: {
        request_type: ReadRequestType.ReadState,
        paths: fields.paths,
        //@ts-ignore
        sender,
        ingress_expiry: new Expiry(DEFAULT_INGRESS_EXPIRY_DELTA_IN_MSECS)
      }
    })

    // Apply transform for identity.
    transformedRequest = await id?.transformRequest(transformedRequest)

    const body = Cbor.encode(transformedRequest.body)

    const response = await this._fetch('' + new URL(`/api/v2/canister/${canister}/read_state`, this._host), {
      ...transformedRequest.request,
      body
    })

    if (!response.ok) {
      throw new Error(
        `Server returned an error:\n` + `  Code: ${response.status} (${response.statusText})\n` + `  Body: ${await response.text()}\n`
      )
    }
    return Cbor.decode(await response.arrayBuffer())
  }

  public async status(): Promise<JsonObject> {
    const headers: Record<string, string> = this._credentials
      ? {
          Authorization: 'Basic ' + btoa(this._credentials)
        }
      : {}

    const response = await this._fetch('' + new URL(`/api/v2/status`, this._host), { headers })

    if (!response.ok) {
      throw new Error(
        `Server returned an error:\n` + `  Code: ${response.status} (${response.statusText})\n` + `  Body: ${await response.text()}\n`
      )
    }

    return Cbor.decode(await response.arrayBuffer())
  }

  public async fetchRootKey(): Promise<ArrayBuffer> {
    if (!this._rootKeyFetched) {
      // Hex-encoded version of the replica root key
      this.rootKey = ((await this.status()) as any).root_key
      this._rootKeyFetched = true
    }
    return this.rootKey
  }

  public invalidateIdentity(): void {
    this._identity = null
  }

  public replaceIdentity(identity: Identity): void {
    this._identity = Promise.resolve(identity)
  }

  protected _transform(request: HttpAgentRequest): Promise<HttpAgentRequest> {
    let p = Promise.resolve(request)

    for (const fn of this._pipeline) {
      p = p.then((r) => fn(r).then((r2) => r2 || r))
    }

    return p
  }
}
