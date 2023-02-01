import { RequestId, RequestStatusResponseStatus } from './auth'
import { toHex } from './buffer'
import { Certificate } from './certificate'
import { Agent } from './http'
import { Principal } from './principal'

export type PollStrategy = (canisterId: Principal, requestId: RequestId, status: RequestStatusResponseStatus) => Promise<void>
export type PollStrategyFactory = () => PollStrategy

export type Predicate<T> = (canisterId: Principal, requestId: RequestId, status: RequestStatusResponseStatus) => Promise<T>

const FIVE_MINUTES_IN_MSEC = 5 * 60 * 1000

/**
 * A best practices polling strategy: wait 2 seconds before the first poll, then 1 second
 * with an exponential backoff factor of 1.2. Timeout after 5 minutes.
 */
export function defaultStrategy(): PollStrategy {
  return chain(conditionalDelay(once(), 1000), backoff(1000, 1.2), timeout(FIVE_MINUTES_IN_MSEC))
}

/**
 * Predicate that returns true once.
 */
export function once(): Predicate<boolean> {
  let first = true
  return async () => {
    if (first) {
      first = false
      return true
    }
    return false
  }
}

/**
 * Delay the polling once.
 * @param condition A predicate that indicates when to delay.
 * @param timeInMsec The amount of time to delay.
 */
export function conditionalDelay(condition: Predicate<boolean>, timeInMsec: number): PollStrategy {
  return async (canisterId: Principal, requestId: RequestId, status: RequestStatusResponseStatus) => {
    if (await condition(canisterId, requestId, status)) {
      return new Promise((resolve) => setTimeout(resolve, timeInMsec))
    }
  }
}

/**
 * Error out after a maximum number of polling has been done.
 * @param count The maximum attempts to poll.
 */
export function maxAttempts(count: number): PollStrategy {
  let attempts = count
  return async (canisterId: Principal, requestId: RequestId, status: RequestStatusResponseStatus) => {
    if (--attempts <= 0) {
      throw new Error(
        `Failed to retrieve a reply for request after ${count} attempts:\n` +
          `  Request ID: ${toHex(requestId)}\n` +
          `  Request status: ${status}\n`
      )
    }
  }
}

/**
 * Throttle polling.
 * @param throttleInMsec Amount in millisecond to wait between each polling.
 */
export function throttle(throttleInMsec: number): PollStrategy {
  return () => new Promise((resolve) => setTimeout(resolve, throttleInMsec))
}

/**
 * Reject a call after a certain amount of time.
 * @param timeInMsec Time in milliseconds before the polling should be rejected.
 */
export function timeout(timeInMsec: number): PollStrategy {
  const end = Date.now() + timeInMsec
  return async (canisterId: Principal, requestId: RequestId, status: RequestStatusResponseStatus) => {
    if (Date.now() > end) {
      throw new Error(
        `Request timed out after ${timeInMsec} msec:\n` + `  Request ID: ${toHex(requestId)}\n` + `  Request status: ${status}\n`
      )
    }
  }
}

/**
 * A strategy that throttle, but using an exponential backoff strategy.
 * @param startingThrottleInMsec The throttle in milliseconds to start with.
 * @param backoffFactor The factor to multiple the throttle time between every poll. For
 *   example if using 2, the throttle will double between every run.
 */
export function backoff(startingThrottleInMsec: number, backoffFactor: number): PollStrategy {
  let currentThrottling = startingThrottleInMsec

  return () =>
    new Promise((resolve) =>
      setTimeout(() => {
        currentThrottling *= backoffFactor
        resolve()
      }, currentThrottling)
    )
}

/**
 * Chain multiple polling strategy. This _chains_ the strategies, so if you pass in,
 * say, two throttling strategy of 1 second, it will result in a throttle of 2 seconds.
 * @param strategies A strategy list to chain.
 */
export function chain(...strategies: PollStrategy[]): PollStrategy {
  return async (canisterId: Principal, requestId: RequestId, status: RequestStatusResponseStatus) => {
    for (const a of strategies) {
      await a(canisterId, requestId, status)
    }
  }
}

/**
 * Polls the IC to check the status of the given request then
 * returns the response bytes once the request has been processed.
 * @param agent The agent to use to poll read_state.
 * @param canisterId The effective canister ID.
 * @param requestId The Request ID to poll status for.
 * @param strategy A polling strategy.
 * @param request Request for the readState call.
 */
export async function pollForResponse(
  agent: Agent,
  canisterId: Principal,
  requestId: RequestId,
  strategy: PollStrategy,
  // eslint-disable-next-line
  request?: any
): Promise<ArrayBuffer> {
  const path = [new TextEncoder().encode('request_status'), requestId]
  const currentRequest = request ?? (await agent.createReadStateRequest?.({ paths: [path] }))
  const state = await agent.readState(canisterId, { paths: [path] }, undefined, currentRequest)
  if (agent.rootKey == null) throw new Error('Agent root key not initialized before polling')
  const cert = await Certificate.create({
    certificate: state.certificate,
    rootKey: agent.rootKey,
    canisterId: canisterId
  })
  const maybeBuf = cert.lookup([...path, new TextEncoder().encode('status')])
  let status
  if (typeof maybeBuf === 'undefined') {
    // Missing requestId means we need to wait
    status = RequestStatusResponseStatus.Unknown
  } else {
    status = new TextDecoder().decode(maybeBuf)
  }

  switch (status) {
    case RequestStatusResponseStatus.Replied: {
      return cert.lookup([...path, 'reply'])!
    }

    case RequestStatusResponseStatus.Received:
    case RequestStatusResponseStatus.Unknown:
    case RequestStatusResponseStatus.Processing:
      // Execute the polling strategy, then retry.
      await strategy(canisterId, requestId, status)
      return pollForResponse(agent, canisterId, requestId, strategy, currentRequest)

    case RequestStatusResponseStatus.Rejected: {
      const rejectCode = new Uint8Array(cert.lookup([...path, 'reject_code'])!)[0]
      const rejectMessage = new TextDecoder().decode(cert.lookup([...path, 'reject_message'])!)
      throw new Error(
        `Call was rejected:\n` +
          `  Request ID: ${toHex(requestId)}\n` +
          `  Reject code: ${rejectCode}\n` +
          `  Reject text: ${rejectMessage}\n`
      )
    }

    case RequestStatusResponseStatus.Done:
      // This is _technically_ not an error, but we still didn't see the `Replied` status so
      // we don't know the result and cannot decode it.
      throw new Error(`Call was marked as done but we never saw the reply:\n` + `  Request ID: ${toHex(requestId)}\n`)
  }
  throw new Error('unreachable')
}
