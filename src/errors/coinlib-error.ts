export enum Domain {
  SERIALIZER = 'serializer'
}

export class CoinlibError extends Error {
  constructor(public domain: Domain, public code: string, public description: string = '') {
    super(`${domain}(${code}): ${description}`)
  }
}
