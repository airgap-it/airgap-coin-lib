import { expect } from 'chai'
import 'mocha'

import axios from '../../../src/dependencies/src/axios-0.33.0/index'
import {
  isPublicHttpUrl,
  REMOTE_DATA_MAX_CONTENT_LENGTH,
  REMOTE_DATA_MAX_REDIRECTS,
  REMOTE_DATA_TIMEOUT,
  remoteDataGet
} from '../../../src/utils/remote-data/remoteDataRequest'

const PUBLIC_URLS: string[] = [
  'http://example.com/x',
  'https://example.com/x',
  'https://dweb.link/ipfs/Qm123',
  'http://93.184.216.34/',
  'https://[2606:2800:220:1:248:1893:25c8:1946]/',
  'http://example.com:8080/a?b=c#d'
]

const NON_PUBLIC_URLS: string[] = [
  // loopback, including the spellings `new URL` normalizes for us
  'http://127.0.0.1/',
  'http://2130706433/',
  'http://0x7f000001/',
  'http://017700000001/',
  'http://127.1/',
  'http://localhost/',
  'http://LOCALHOST./',
  'http://foo.localhost/',
  // link-local, i.e. the cloud metadata endpoint
  'http://169.254.169.254/latest/meta-data/',
  // private and reserved ranges
  'http://10.0.0.1/',
  'http://172.16.0.1/',
  'http://172.31.255.255/',
  'http://192.168.1.1/',
  'http://100.64.0.1/',
  'http://0.0.0.0/',
  'http://255.255.255.255/',
  'http://224.0.0.1/',
  'http://198.18.0.1/',
  // IPv6, including the hex form `new URL` normalizes IPv4-mapped addresses into
  'http://[::1]/',
  'http://[::]/',
  'http://[::ffff:127.0.0.1]/',
  'http://[::ffff:7f00:1]/',
  'http://[::ffff:169.254.169.254]/',
  'http://[64:ff9b::127.0.0.1]/',
  'http://[fe80::1]/',
  'http://[fc00::1]/',
  'http://[fd12:3456::1]/',
  'http://[ff02::1]/',
  // not http(s) at all — a `startsWith('http')` check would accept the first of these
  'httpfoo://example.com/',
  'file:///etc/passwd',
  'data:text/plain,hi',
  'ftp://example.com/',
  // credentials we would only ever leak
  'http://user:pw@example.com/',
  // unparseable
  'not a url',
  '',
  'javascript:alert(1)',
  '//example.com/x'
]

describe('remoteDataRequest', () => {
  describe('isPublicHttpUrl', () => {
    for (const uri of PUBLIC_URLS) {
      it(`should accept ${JSON.stringify(uri)}`, () => {
        expect(isPublicHttpUrl(uri)).to.be.true
      })
    }

    for (const uri of NON_PUBLIC_URLS) {
      it(`should reject ${JSON.stringify(uri)}`, () => {
        expect(isPublicHttpUrl(uri)).to.be.false
      })
    }
  })

  describe('remoteDataGet', () => {
    let originalGet: typeof axios.get
    let captured: { url?: string; config?: any }

    beforeEach(() => {
      originalGet = axios.get
      captured = {}
      axios.get = (async (url: string, config?: any) => {
        captured.url = url
        captured.config = config

        return { data: undefined, status: 200, statusText: 'OK', headers: {}, config }
      }) as any
    })

    afterEach(() => {
      axios.get = originalGet
    })

    it('should not issue a request for a non-public URL', async () => {
      try {
        await remoteDataGet('http://169.254.169.254/latest/meta-data/')
        throw new Error('expected remoteDataGet to reject')
      } catch (error) {
        expect(error.message).to.contain('Refusing to fetch remote data from a non-public URL')
      }

      expect(captured.url).to.be.undefined
    })

    it('should bound the request', async () => {
      await remoteDataGet('https://example.com/metadata.json')

      expect(captured.url).to.equal('https://example.com/metadata.json')
      expect(captured.config.timeout).to.equal(REMOTE_DATA_TIMEOUT)
      expect(captured.config.maxContentLength).to.equal(REMOTE_DATA_MAX_CONTENT_LENGTH)
      expect(captured.config.maxRedirects).to.equal(REMOTE_DATA_MAX_REDIRECTS)
    })

    it('should refuse a redirect hop to a non-public URL', async () => {
      await remoteDataGet('https://example.com/metadata.json')

      // a one-off check on the initial URL is defeated by a redirect, so every hop is re-validated
      expect(() => captured.config.beforeRedirect({ href: 'http://169.254.169.254/latest/meta-data/' })).to.throw(
        'Refusing to follow a remote data redirect to a non-public URL'
      )
      expect(() => captured.config.beforeRedirect({ href: 'http://[::ffff:127.0.0.1]:8732/chains/main' })).to.throw(
        'Refusing to follow a remote data redirect to a non-public URL'
      )
      expect(() => captured.config.beforeRedirect({})).to.throw('Refusing to follow a remote data redirect to a non-public URL')
    })

    it('should allow a redirect hop to a public URL', async () => {
      await remoteDataGet('https://example.com/metadata.json')

      expect(() => captured.config.beforeRedirect({ href: 'https://cdn.example.com/metadata.json' })).to.not.throw()
    })
  })
})
