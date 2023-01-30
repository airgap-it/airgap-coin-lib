import { SaplingPartialOutputDescription, SaplingUnsignedSpendDescription } from '@airgap/sapling-wasm'

import { TezosSaplingTransaction } from './TezosSaplingTransaction'

export interface TezosSaplingExternalMethodProvider {
  initParameters?(spendParams: Buffer, outputParams: Buffer): Promise<void>
  withProvingContext?(action: (context: string) => Promise<TezosSaplingTransaction>): Promise<TezosSaplingTransaction>
  prepareSpendDescription(
    context: string,
    spendingKey: Buffer,
    address: Buffer,
    rcm: string,
    ar: Buffer,
    value: string,
    root: string,
    merklePath: string
  ): Promise<SaplingUnsignedSpendDescription>
  preparePartialOutputDescription?(
    context: string,
    address: Buffer,
    rcm: Buffer,
    esk: Buffer,
    value: string
  ): Promise<SaplingPartialOutputDescription>
  createBindingSignature?(context: string, balance: string, sighash: Buffer): Promise<Buffer>
}
