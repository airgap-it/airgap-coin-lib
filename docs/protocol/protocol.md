# Getting Started

Each protocol of `airgap-coin-lib` implements the `ICoinProtocol`, a unified interface that allows to

- Generate keypairs and addresses from a mnemonic
- Prepare transactions
- Sign transactions
- Fetch transaction details of individual transactions
- Fetch all transactions from a publicKey or address

## Preparing a Transaction

To facilitate a transaction using `airgap-coin-lib`, there is a standardised interface available that all supported protocols have implemented:

```typescript
prepareTransactionFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: BigNumber[],
    fee: BigNumber,
    data?: any
)
```

This means, that after instantiating your desired protocol you can simply use this function to prepare a raw transcation:

```typescript
import { EthereumProtocol } from 'airgap-coin-lib'

const ethereumProtocol = new EthereumProtocol()

const publicKey = '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932'
const recipient = '0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e'

const amount = new BigNumber('1000000000000000000')
const fee = new BigNumber('420000000000000')

const unsignedTx = ethereumProtocol.prepareTransactionFromPublicKey(publicKey, [recipient], [amount], fee)
```

The unsigned transaction you will get back is, in the case of Ethereum, a `RawEthereumTransaction`:

```typescript
export interface RawEthereumTransaction {
  nonce: string
  gasPrice: string
  gasLimit: string
  to: string
  value: string
  chainId: number
  data: string
}
```

This is the object / transaction that you can plug into the corresponding `signWithPrivateKey` function to sign the transaction, or serialize/deserialize it to do this on another device.

## Transaction Details

If you should wish to recover your original input (amount, fee) in an easy manner, you can use the following functions:

```typescript
getTransactionDetails(transaction: UnsignedTransaction)
getTransactionDetailsFromSigned(transaction: SignedTransaction)
```

These will extract the properties form your unsigned transactions, and return an `IAirGapTransaction` object.

```typescript
export interface IAirGapTransaction {
  from: string[]
  to: string[]
  isInbound: boolean
  amount: BigNumber
  fee: BigNumber
  timestamp?: number

  protocolIdentifier: ProtocolSymbols

  hash?: string
  blockHeight?: string
  data?: string

  meta?: {}
}
```
