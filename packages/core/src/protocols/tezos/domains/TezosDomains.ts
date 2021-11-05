import { toUnicode } from '../../../dependencies/src/idna-uts46-hx-3.4.0/uts46'
import { TezosUtils } from '../../..'
import { addHexPrefix, isHex, stripHexPrefix } from '../../../utils/hex'

import { TezosContract } from '../contract/TezosContract'
import { TezosProtocolNetwork } from '../TezosProtocolOptions'
import { BigMapResponse } from '../types/contract/BigMapResult'
import { TezosDomainsReverseRecord } from '../types/domains/TezosDomainsReverseRecord'
import { TezosDomainsRecord } from '../types/domains/TezosDomainsRecord'
import { MichelsonOption } from '../types/michelson/generics/MichelsonOption'
import { MichelsonPair } from '../types/michelson/generics/MichelsonPair'
import { MichelsonAddress } from '../types/michelson/primitives/MichelsonAddress'
import { MichelsonBytes } from '../types/michelson/primitives/MichelsonBytes'
import { MichelsonInt } from '../types/michelson/primitives/MichelsonInt'
import { MichelsonString } from '../types/michelson/primitives/MichelsonString'
import { Cache } from '../../../utils/cache'

const CACHE_DEFAULT_EXPIRATION_TIME = 5 * 60 * 1000 // 5 min

export class TezosDomains {
  private readonly contract: TezosContract
  private readonly cache: Cache

  private bigMapIDs?: {
    expiryMap: number
    records: number
    reverseRecords: number
  }
  private bigMapIDsPromise?: Promise<void>

  constructor(network: TezosProtocolNetwork, contractAddress: string) {
    this.contract = new TezosContract(
      contractAddress,
      network.extras.network,
      network.rpcUrl,
      network.extras.conseilUrl,
      network.extras.conseilNetwork,
      network.extras.conseilApiKey
    )
    this.cache = new Cache(CACHE_DEFAULT_EXPIRATION_TIME)
  }

  public async nameToAddress(name: string): Promise<string | undefined> {
    const cacheKey: string = this.nameCacheKey(name)
    const record: TezosDomainsRecord | undefined = await this.cache.get<TezosDomainsRecord | undefined>(cacheKey).catch(() => {
      return this.cache.save(cacheKey, this.resolveName(name), {
        cacheValue: true,
        validate: (record: TezosDomainsRecord | undefined) => record !== undefined && !this.checkIfExpired(record)
      })
    })

    return record?.address
  }

  public async addressToName(address: string): Promise<string | undefined> {
    const cacheKey: string = this.addressCacheKey(address)
    const reverseRecord: TezosDomainsReverseRecord | undefined = await this.cache
      .get<TezosDomainsReverseRecord | undefined>(cacheKey)
      .catch(() => {
        return this.cache.save(cacheKey, this.resolveAddress(address), {
          cacheValue: true,
          validate: (reverseRecord: TezosDomainsReverseRecord | undefined) =>
            reverseRecord !== undefined && !this.checkIfExpired(reverseRecord)
        })
      })

    return reverseRecord?.name
  }

  private async resolveName(name: string): Promise<TezosDomainsRecord | undefined> {
    await this.waitForBigMapIDs()

    let normalizedName: string
    try {
      normalizedName = this.normalizeDomainName(name)
    } catch {
      // The domain is invalid
      return undefined
    }

    const records: BigMapResponse[] = await this.contract.conseilBigMapValues({
      bigMapID: this.bigMapIDs?.records,
      predicates: [
        {
          field: 'key',
          operation: 'eq',
          set: [addHexPrefix(Buffer.from(normalizedName).toString('hex'))]
        }
      ]
    })

    if (records.length > 1) {
      throw new Error(`Records BigMap query returned more than 1 entry for name ${name}`)
    }

    if (records.length === 0) {
      // The domain is not resolvable
      return undefined
    }

    const record: TezosDomainsRecord = this.parseRecord(records[0])
    if (record.address === undefined || record.expiryKey === undefined) {
      // The domain is not resolvable
      return undefined
    }

    const expiryTimestamps: BigMapResponse[] = await this.contract.conseilBigMapValues({
      bigMapID: this.bigMapIDs?.expiryMap,
      predicates: [
        {
          field: 'key',
          operation: 'eq',
          set: [addHexPrefix(Buffer.from(record.expiryKey).toString('hex'))]
        }
      ]
    })

    if (expiryTimestamps.length > 1) {
      throw new Error(`Expiry Map BigMap query returned more than 1 entry for name ${name}`)
    }

    record.expiryTimestamp = this.parseExpiryTimestamp(expiryTimestamps[0])
    if (this.checkIfExpired(record)) {
      // The domain has expired
      return undefined
    }

    return record
  }

  private async resolveAddress(address: string): Promise<TezosDomainsReverseRecord | undefined> {
    await this.waitForBigMapIDs()

    const reverseRecords: BigMapResponse[] = await this.contract.conseilBigMapValues({
      bigMapID: this.bigMapIDs?.reverseRecords,
      predicates: [
        {
          field: 'key',
          operation: 'eq',
          set: [addHexPrefix(TezosUtils.encodeAddress(address).toString('hex'))]
        }
      ]
    })

    if (reverseRecords.length > 1) {
      throw new Error(`Reverse Records BigMap query returned more than 1 entry for address ${address}`)
    }

    if (reverseRecords.length === 0) {
      // The address is not resolvable
      return undefined
    }

    const reverseRecord: TezosDomainsReverseRecord = this.parseReverseRecord(reverseRecords[0])
    if (reverseRecord.name === undefined) {
      // The address is not resolvable
      return undefined
    }

    const forwardRecord: TezosDomainsRecord | undefined = await this.resolveName(reverseRecord.name)
    if (forwardRecord === undefined) {
      // If the name can't be resolved, the address is not resolvable too
      return undefined
    }

    reverseRecord.expiryTimestamp = forwardRecord.expiryTimestamp

    return reverseRecord
  }

  private async waitForBigMapIDs(): Promise<void> {
    if (this.bigMapIDs !== undefined) {
      return
    }

    if (this.bigMapIDsPromise === undefined) {
      this.bigMapIDsPromise = this.contract
        .readStorage()
        .then((content) => {
          const parsed = content?.asRawValue()
          if (parsed === undefined || Array.isArray(parsed)) {
            throw new Error('Failed to parse contract storage')
          }

          this.bigMapIDs = {
            expiryMap: parsed.store.expiry_map.toNumber(),
            records: parsed.store.records.toNumber(),
            reverseRecords: parsed.store.reverse_records.toNumber()
          }
        })
        .finally(() => {
          this.bigMapIDsPromise = undefined
        })
    }

    return this.bigMapIDsPromise
  }

  private normalizeDomainName(name: string): string {
    return toUnicode(name, { useStd3ASCII: false })
  }

  private checkIfExpired(record: TezosDomainsRecord | TezosDomainsReverseRecord): boolean {
    return record.expiryTimestamp === undefined || record.expiryTimestamp <= new Date().getTime() / 1000
  }

  private parseRecord(record: BigMapResponse): TezosDomainsRecord {
    const parsed = MichelsonPair.from(
      record.value,
      undefined,
      (value1: unknown) =>
        MichelsonPair.from(
          value1,
          undefined,
          (value2: unknown) =>
            MichelsonPair.from(
              value2,
              undefined,
              (value3: unknown) => MichelsonOption.from(value3, MichelsonAddress.from, 'address'),
              (value3: unknown) => MichelsonString.from(value3, 'data') /* ignoring unused map */
            ),
          (value2: unknown) =>
            MichelsonPair.from(
              value2,
              undefined,
              (value3: unknown) => MichelsonOption.from(value3, MichelsonBytes.from, 'expiryKey'),
              (value3: unknown) => MichelsonString.from(value3, 'internalData') /* ignoring unused map */
            )
        ),
      (value1: unknown) =>
        MichelsonPair.from(
          value1,
          undefined,
          (value2: unknown) =>
            MichelsonPair.from(
              value2,
              undefined,
              (value3: unknown) => MichelsonInt.from(value3, 'level'),
              (value3: unknown) => MichelsonAddress.from(value3, 'owner')
            ),
          (value2: unknown) => MichelsonOption.from(value2, MichelsonInt.from, 'tokenId')
        )
    ).asRawValue()

    if (Array.isArray(parsed)) {
      throw Error('Failed to parse Record BigMap data')
    }

    return {
      address: parsed.address !== undefined && isHex(parsed.address) ? TezosUtils.parseAddress(parsed.address) : parsed.address,
      expiryKey: parsed.expiryKey !== undefined ? Buffer.from(stripHexPrefix(parsed.expiryKey), 'hex').toString() : undefined,
      level: parsed.level,
      owner: isHex(parsed.owner) ? TezosUtils.parseAddress(parsed.owner) : parsed.owner,
      tokenId: parsed.tokenId
    }
  }

  private parseReverseRecord(reverseRecord: BigMapResponse): TezosDomainsReverseRecord {
    const parsed = MichelsonPair.from(
      reverseRecord.value,
      undefined,
      (value1: unknown) =>
        MichelsonPair.from(
          value1,
          undefined,
          (value2: unknown) => MichelsonString.from(value2, 'internalData') /* ignoring unused map */,
          (value2: unknown) => MichelsonOption.from(value2, MichelsonBytes.from, 'name')
        ),
      (value1: unknown) => MichelsonAddress.from(value1, 'owner')
    ).asRawValue()

    if (Array.isArray(parsed)) {
      throw new Error('Failed to parse Reverse Record BigMap data')
    }

    return {
      name: parsed.name !== undefined ? Buffer.from(stripHexPrefix(parsed.name), 'hex').toString() : undefined,
      owner: isHex(parsed.owner) ? TezosUtils.parseAddress(parsed.owner) : parsed.owner
    }
  }

  private parseExpiryTimestamp(expiryKey: BigMapResponse): number | undefined {
    const timestamp = expiryKey.value !== null ? parseInt(expiryKey.value) : undefined

    return timestamp !== undefined && !isNaN(timestamp) ? timestamp * 1000 /* value returned by the query is in seconds */ : undefined
  }

  private nameCacheKey(name: string): string {
    return `domain:${name}`
  }

  private addressCacheKey(address: string): string {
    return `address:${address}`
  }
}
