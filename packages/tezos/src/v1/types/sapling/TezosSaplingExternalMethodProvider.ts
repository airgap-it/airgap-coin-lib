import { SaplingPartialOutputDescription, SaplingUnsignedSpendDescription } from '@airgap/sapling-wasm'

import { TezosSaplingTransaction } from './TezosSaplingTransaction'

export interface TezosSaplingExternalMethodProvider {
  initParameters?(spendParams: Buffer, outputParams: Buffer): Promise<void>
  withProvingContext?(action: (context: number) => Promise<TezosSaplingTransaction>): Promise<TezosSaplingTransaction>
  prepareSpendDescription(
    context: number,
    spendingKey: Buffer,
    address: Buffer,
    rcm: string,
    ar: Buffer,
    value: string,
    root: string,
    merklePath: string
  ): Promise<SaplingUnsignedSpendDescription>
  preparePartialOutputDescription?(
    context: number,
    address: Buffer,
    rcm: Buffer,
    esk: Buffer,
    value: string
  ): Promise<SaplingPartialOutputDescription>
  createBindingSignature?(context: number, balance: string, sighash: Buffer): Promise<Buffer>
}
