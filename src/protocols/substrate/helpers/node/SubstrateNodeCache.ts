interface CachedValue<T> {
  value: T
  lastInvalidated: number
}

interface CacheConfig {
  cacheValue: boolean
}

export class SubstrateNodeCache {
  public constructor(public expirationTime: number) {}

  private readonly cachedValues: Map<string, CachedValue<any>> = new Map()
  private readonly promises: Map<string, Promise<any>> = new Map()

  public async get<T>(key: string): Promise<T> {
    const promise = this.promises.get(key)
    if (promise) {
      return promise
    }

    const cached = this.cachedValues.get(key)
    if (cached && this.isValidOrDelete(key, cached)) {
      return cached.value
    }

    return Promise.reject('No valid cached value.')
  }

  public save(key: string, promise: Promise<any>, config: CacheConfig = { cacheValue: true }): Promise<any> {
    const newPromise = promise
      .then((value) => {
        if (value !== undefined && value !== null && config.cacheValue) {
          this.cachedValues.set(key, {
            value,
            lastInvalidated: new Date().getTime()
          })
        }
        return value
      })
      .finally(() => this.promises.delete(key))

    this.promises.set(key, newPromise)
    return newPromise
  }

  private isValidOrDelete(key: string, cached: CachedValue<any>): boolean {
    const expired = cached.lastInvalidated + this.expirationTime < new Date().getTime()

    if (expired) {
      this.cachedValues.delete(key)
    }

    return !expired
  }
}
