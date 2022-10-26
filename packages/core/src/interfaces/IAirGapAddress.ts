export interface IAirGapAddress {
  asString(): string
}

export interface IProtocolAddressCursor {
  hasNext: boolean
}

export interface IAirGapAddressResult<T extends IProtocolAddressCursor = IProtocolAddressCursor> {
  address: string
  cursor: T
}
