import axios, { AxiosResponse, ResponseType } from '../../dependencies/src/axios-0.33.0/index'

/**
 * Remote data URIs can originate from untrusted, attacker-controlled sources, e.g. the `token_info`
 * big map of an arbitrary Tezos FA2 contract. Fetching them unguarded turns the wallet into an SSRF
 * proxy against whatever the host can reach (cloud metadata endpoints, a local node's RPC, ...).
 *
 * Every remote data fetch therefore goes through `remoteDataGet`, which rejects non-public targets
 * and bounds the request.
 *
 * Known limitation: only *literal* addresses are checked, so a hostname that resolves to a private
 * address (DNS rebinding) is not caught. Closing that requires a custom `lookup` passed down to
 * `http.request`.
 */

const ALLOWED_PROTOCOLS: string[] = ['http:', 'https:']

export const REMOTE_DATA_TIMEOUT = 30000
export const REMOTE_DATA_MAX_CONTENT_LENGTH = 10 * 1024 * 1024
export const REMOTE_DATA_MAX_REDIRECTS = 3

function parseUrl(uri: string): URL | undefined {
  try {
    return new URL(uri)
  } catch (error) {
    return undefined
  }
}

function parseIPv4(hostname: string): number[] | undefined {
  const parts = hostname.split('.')
  if (parts.length !== 4) {
    return undefined
  }

  const bytes: number[] = []
  for (const part of parts) {
    if (!/^[0-9]{1,3}$/.test(part)) {
      return undefined
    }
    const byte = parseInt(part, 10)
    if (byte > 255) {
      return undefined
    }
    bytes.push(byte)
  }

  return bytes
}

function parseIPv6(hostname: string): number[] | undefined {
  const [head, tail, ...rest] = hostname.split('::')
  if (rest.length > 0) {
    return undefined
  }

  const parseGroups = (value: string): number[] | undefined => {
    if (value === '') {
      return []
    }

    const groups = value.split(':')
    const bytes: number[] = []
    for (let i = 0; i < groups.length; i++) {
      // an IPv4 address may only appear as the very last piece, e.g. ::ffff:127.0.0.1
      if (i === groups.length - 1 && groups[i].includes('.')) {
        const ipv4 = parseIPv4(groups[i])
        if (ipv4 === undefined) {
          return undefined
        }
        bytes.push(...ipv4)
        continue
      }

      if (!/^[0-9a-fA-F]{1,4}$/.test(groups[i])) {
        return undefined
      }
      const group = parseInt(groups[i], 16)
      bytes.push(group >>> 8, group & 0xff)
    }

    return bytes
  }

  const headBytes = parseGroups(head)
  // `tail === undefined` means the address was not compressed and must be complete
  const tailBytes = tail === undefined ? [] : parseGroups(tail)
  if (headBytes === undefined || tailBytes === undefined) {
    return undefined
  }

  const missing = 16 - headBytes.length - tailBytes.length
  if (tail === undefined ? missing !== 0 : missing < 0) {
    return undefined
  }

  return [...headBytes, ...new Array(missing).fill(0), ...tailBytes]
}

function isBlockedIPv4(bytes: number[]): boolean {
  const [a, b] = bytes

  return (
    a === 0 || // 0.0.0.0/8, "this network"
    a === 10 || // private
    a === 127 || // loopback
    (a === 100 && b >= 64 && b <= 127) || // 100.64.0.0/10, carrier-grade NAT
    (a === 169 && b === 254) || // link-local, incl. cloud metadata endpoints
    (a === 172 && b >= 16 && b <= 31) || // private
    (a === 192 && b === 0) || // 192.0.0.0/24, IETF protocol assignments
    (a === 192 && b === 168) || // private
    (a === 198 && (b === 18 || b === 19)) || // 198.18.0.0/15, benchmarking
    a >= 224 // multicast and reserved, incl. 255.255.255.255
  )
}

function isBlockedIPv6(bytes: number[]): boolean {
  const isPrefix = (...prefix: number[]): boolean => prefix.every((byte, index) => bytes[index] === byte)

  // IPv4-mapped (::ffff:0:0/96) and IPv4-translated/NAT64 (64:ff9b::/96) addresses embed an IPv4
  // address in the last four bytes and are routed as such, so they must be judged as IPv4.
  // Node normalizes ::ffff:127.0.0.1 to the hex form ::ffff:7f00:1, hence the check on bytes.
  if (isPrefix(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xff, 0xff) || isPrefix(0, 0x64, 0xff, 0x9b, 0, 0, 0, 0, 0, 0, 0, 0)) {
    return isBlockedIPv4(bytes.slice(12))
  }

  return (
    bytes.every((byte) => byte === 0) || // :: unspecified
    isPrefix(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1) || // ::1 loopback
    (bytes[0] & 0xfe) === 0xfc || // fc00::/7 unique local
    (bytes[0] === 0xfe && (bytes[1] & 0xc0) === 0x80) || // fe80::/10 link-local
    bytes[0] === 0xff // ff00::/8 multicast
  )
}

/**
 * Whether `uri` is an `http(s)` URL that does not obviously point back at the host or its private
 * network. Anything unparseable, non-`http(s)`, credential-bearing or address-literal-private is
 * rejected.
 */
export function isPublicHttpUrl(uri: string): boolean {
  const url: URL | undefined = parseUrl(uri)
  if (url === undefined) {
    return false
  }

  if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
    return false
  }

  // credentials in an untrusted URL are only ever a way to make us leak them
  if (url.username !== '' || url.password !== '') {
    return false
  }

  // `new URL` keeps IPv6 hosts bracketed and may keep a fully qualified name's trailing dot
  const hostname = url.hostname
    .replace(/^\[|\]$/g, '')
    .replace(/\.$/, '')
    .toLowerCase()
  if (hostname === '') {
    return false
  }

  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    return false
  }

  // `new URL` already normalizes the integer, octal and hex spellings of an IPv4 host
  const ipv4 = parseIPv4(hostname)
  if (ipv4 !== undefined) {
    return !isBlockedIPv4(ipv4)
  }

  const ipv6 = parseIPv6(hostname)
  if (ipv6 !== undefined) {
    return !isBlockedIPv6(ipv6)
  }

  return true
}

/**
 * The single entry point through which remote data is fetched. Validates the target, bounds the
 * request, and re-validates every redirect hop, since a one-off check on the initial URL is
 * trivially defeated by a redirect.
 */
export async function remoteDataGet<T>(uri: string, responseType: ResponseType = 'json'): Promise<AxiosResponse<T>> {
  if (!isPublicHttpUrl(uri)) {
    throw new Error(`Refusing to fetch remote data from a non-public URL: ${uri}`)
  }

  return axios.get<T, AxiosResponse<T>>(uri, {
    responseType,
    timeout: REMOTE_DATA_TIMEOUT,
    maxContentLength: REMOTE_DATA_MAX_CONTENT_LENGTH,
    maxRedirects: REMOTE_DATA_MAX_REDIRECTS,
    beforeRedirect: (options: Record<string, any>): void => {
      const href: unknown = options.href
      if (typeof href !== 'string' || !isPublicHttpUrl(href)) {
        throw new Error(`Refusing to follow a remote data redirect to a non-public URL: ${String(href)}`)
      }
    }
  })
}
