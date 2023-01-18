// tslint:disable: max-classes-per-file
import { FeeDefaults } from '@airgap/coinlib-core'
import { CurrencyUnit } from '@airgap/coinlib-core/protocols/ICoinProtocol'
import { ProtocolOptions } from '@airgap/coinlib-core/utils/ProtocolOptions'
import { MainProtocolSymbols, ProtocolSymbols } from '@airgap/coinlib-core/utils/ProtocolSymbols'
import { SaplingPartialOutputDescription, SaplingUnsignedSpendDescription } from '@airgap/sapling-wasm'
import { TezosProtocolConfig, TezosProtocolNetwork } from '../TezosProtocolOptions'
import { TezosSaplingTransaction } from '../types/sapling/TezosSaplingTransaction'

export interface TezosSaplingExternalMethodProvider {
  initParameters?: (spendParams: Buffer, outputParams: Buffer) => Promise<void>
  withProvingContext?: (action: (context: number) => Promise<TezosSaplingTransaction>) => Promise<TezosSaplingTransaction>
  prepareSpendDescription?: (
    context: number,
    spendingKey: Buffer,
    address: Buffer,
    rcm: string,
    ar: Buffer,
    value: string,
    root: string,
    merklePath: string
  ) => Promise<SaplingUnsignedSpendDescription>
  preparePartialOutputDescription?: (
    context: number,
    address: Buffer,
    rcm: Buffer,
    esk: Buffer,
    value: string
  ) => Promise<SaplingPartialOutputDescription>
  createBindingSignature?: (context: number, balance: string, sighash: Buffer) => Promise<Buffer>
}

export class TezosSaplingProtocolConfig extends TezosProtocolConfig {
  constructor(
    public readonly name: string,
    public readonly identifier: ProtocolSymbols,
    public readonly memoSize: number,
    public readonly merkleTreeHeight: number = 32,
    public contractAddress?: string,
    public readonly symbol?: string,
    public readonly marketSymbol?: string,
    public readonly feeDefaults?: FeeDefaults,
    public readonly decimals?: number,
    public readonly units?: CurrencyUnit[],
    public readonly externalProvider?: TezosSaplingExternalMethodProvider,
    public injectorUrl?: string
  ) {
    super()
  }
}

export class TezosShieldedTezProtocolConfig extends TezosSaplingProtocolConfig {
  constructor(
    public readonly name: string = 'Shielded Tez',
    public readonly identifier: ProtocolSymbols = MainProtocolSymbols.XTZ_SHIELDED,
    public readonly contractAddress?: string,
    public readonly externalProvider?: TezosSaplingExternalMethodProvider,
    public readonly injectorUrl?: string,
    public readonly memoSize: number = 8,
    public readonly merkleTreeHeight: number = 32
  ) {
    super(
      name,
      identifier,
      memoSize,
      merkleTreeHeight,
      contractAddress,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      externalProvider,
      injectorUrl
    )
  }
}

export class TezosSaplingProtocolOptions implements ProtocolOptions<TezosSaplingProtocolConfig> {
  constructor(
    public network: TezosProtocolNetwork = new TezosProtocolNetwork(),
    public config: TezosSaplingProtocolConfig = new TezosShieldedTezProtocolConfig()
  ) {}
}
