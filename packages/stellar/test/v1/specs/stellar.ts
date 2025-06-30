// tslint:disable: no-object-literal-type-assertion
import { Amount, newAmount, PublicKey, SecretKey } from '@airgap/module-kit'

import { StellarSignedTransaction, StellarUnits, StellarUnsignedTransaction, createStellarProtocol } from '../../../src/v1'
import { TestProtocolSpec } from '../implementations'
import { StellarProtocolStub } from '../stubs/stellar.stub'

export class StellarTestProtocolSpec extends TestProtocolSpec {
  public name = 'Stellar'
  public lib = createStellarProtocol()
  public stub = new StellarProtocolStub()
  public validAddresses = [
    'GAA363KTDFGJRBIOKEUZH2SM46XDEW6NRRQAKJG4ZIJ5VMKHG2GYMLFM',
    'GCM6FFRCYBBS2DUFLCNGBYTVQH4LDA3BCPBKCLJ72ATROTHYTHXCO2RB'
  ]
  public wallet = {
    secretKey: {
      type: 'priv',
      format: 'hex',
      value: '3ce720b54664526964b4393f0275082278b5207acd4fe410822e72af184ecc27'
    } as SecretKey,
    publicKey: {
      type: 'pub',
      format: 'hex',
      value: '01bf6d53194c98850e512993ea4ce7ae325bcd8c600524dcca13dab147368d86'
    } as PublicKey,
    addresses: ['GAA363KTDFGJRBIOKEUZH2SM46XDEW6NRRQAKJG4ZIJ5VMKHG2GYMLFM']
  }

  public txs = [
    {
      to: ['GCM6FFRCYBBS2DUFLCNGBYTVQH4LDA3BCPBKCLJ72ATROTHYTHXCO2RB'],
      from: ['GAA363KTDFGJRBIOKEUZH2SM46XDEW6NRRQAKJG4ZIJ5VMKHG2GYMLFM'],
      amount: newAmount('10000000', 'blockchain') as Amount<StellarUnits>,
      fee: newAmount('100', 'blockchain') as Amount<StellarUnits>,
      unsignedTx: {
        type: 'unsigned',
        transaction:
          'AAAAAgAAAAABv21TGUyYhQ5RKZPqTOeuMlvNjGAFJNzKE9qxRzaNhgAAAGQADaVsAAAAFgAAAAEAAAAAAAAAAAAAAABjsM9YAAAAAAAAAAEAAAAAAAAAAQAAAACZ4pYiwEMtDoVYmmDidYH4sYNhE8KhLT/QJxdM+JnuJwAAAAAAAAAAAJiWgAAAAAAAAAAA'
      } as StellarUnsignedTransaction,
      signedTx: {
        type: 'signed',
        transaction:
          'AAAAAgAAAAABv21TGUyYhQ5RKZPqTOeuMlvNjGAFJNzKE9qxRzaNhgAAAGQADaVsAAAAFgAAAAEAAAAAAAAAAAAAAABjsM9YAAAAAAAAAAEAAAAAAAAAAQAAAACZ4pYiwEMtDoVYmmDidYH4sYNhE8KhLT/QJxdM+JnuJwAAAAAAAAAAAJiWgAAAAAAAAAABRzaNhgAAAEBxK1rqag77QN1UrYCyJryPOUzOenJVStP0xREziYdzmphPzM6ZGJHsfJhJLDfZD3Gj0cYfpBCa3IbzJjQ0rpcM'
      } as StellarSignedTransaction
    }
  ]

  public setOptions = {
    unsignedTx: {
      type: 'unsigned',
      transaction:
        'AAAAAgAAAAABv21TGUyYhQ5RKZPqTOeuMlvNjGAFJNzKE9qxRzaNhgAAAGQADaVsAAAAFgAAAAEAAAAAAAAAAAAAAABjsM9YAAAAAAAAAAEAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAwAAAAEAAAADAAAAAQAAAAMAAAAAAAAAAQAAAACZ4pYiwEMtDoVYmmDidYH4sYNhE8KhLT/QJxdM+JnuJwAAAAIAAAAAAAAAAA=='
    } as StellarUnsignedTransaction
  }

  public mnemonic(): string {
    return 'mango club state husband keen fiber float jelly major include horse infant square spike equip caught version must pen swim setup right poem economy'
  }

  public seed(): string {
    return 'a109e38f00824ea80107cd7ccbac4e7afe7abe588eeac9191d71adf98fb1fba73311182c010a0182e20e67f4daa45bf1cbbbecab8ff407f33e50045d7d516e0c'
  }

  public transactionList(address: string): {
    first: { data: any }
    next: { data: any }
  } {
    const first = {
      data: {
        _links: {
          next: {
            href: `https://horizon.stellar.org/accounts/${address}/payments?cursor=246092211492552800&join=transactions&limit=1&order=desc`
          }
        },
        _embedded: {
          records: [
            {
              id: '246092211492552800',
              paging_token: '246092211492552800',
              transaction_successful: true,
              source_account: `${address}`,
              type: 'payment',
              type_i: 1,
              created_at: '2025-05-29T13:23:02Z',
              transaction_hash: '72facec8b2b4059469989057e473ab7534a2a198024ab5b1a891aafc7af4da8c',
              transaction: {
                memo: 'VGS IS NEW',
                memo_bytes: 'VkdTIElTIE5FVw==',
                id: '72facec8b2b4059469989057e473ab7534a2a198024ab5b1a891aafc7af4da8c',
                paging_token: '246092211492552704',
                successful: true,
                hash: '72facec8b2b4059469989057e473ab7534a2a198024ab5b1a891aafc7af4da8c',
                ledger: 57297808,
                created_at: '2025-05-29T13:23:02Z',
                source_account: `${address}`,
                source_account_sequence: '243849431110124865',
                fee_account: `${address}`,
                fee_charged: '10000',
                max_fee: '11500',
                operation_count: 100,
                memo_type: 'text',
                signatures: ['+o1b9J4f/+j6ez0053IUbj8R23nhx3oJxp0aExWqUY2YE/ZpIchNHECLqy1IQKmN3PcbnYI9dnSX7O+dsbaABA=='],
                preconditions: {
                  timebounds: {
                    min_time: '0',
                    max_time: '1748584980'
                  }
                }
              },
              asset_type: 'native',
              from: `${address}`,
              to: `${address}`,
              amount: '0.0000010'
            }
          ]
        }
      }
    }

    const next = {
      data: {
        _links: {
          next: {
            href: undefined
          }
        },
        _embedded: {
          records: [
            {
              id: '246091992449687553',
              paging_token: '246091992449687553',
              transaction_successful: true,
              source_account: `${address}`,
              type: 'payment',
              type_i: 1,
              created_at: '2025-05-29T13:18:16Z',
              transaction_hash: 'fc618ec39a49e8c0662bc34acffd97c336d62d8bd42f497e25a83018c54afc88',
              transaction: {
                id: 'fc618ec39a49e8c0662bc34acffd97c336d62d8bd42f497e25a83018c54afc88',
                paging_token: '246091992449687552',
                successful: true,
                hash: 'fc618ec39a49e8c0662bc34acffd97c336d62d8bd42f497e25a83018c54afc88',
                ledger: 57297757,
                created_at: '2025-05-29T13:18:16Z',
                source_account: `${address}`,
                source_account_sequence: '245503019288887329',
                fee_account: `${address}`,
                fee_charged: '100',
                max_fee: '100',
                operation_count: 1,
                memo_type: 'none',
                signatures: [
                  'tt3hJ3R7F+lZ2aLgHf4p1TT57HV9hKk/6uoiW3QTh74Pz6tuP/ZVGlXkm+jJUwb4AMVkemfnLG24fckpID//CA==',
                  'rBkLeCwQHQr/0UrWc/l5ugH/IBl0w7PKpGXJazkhFNDFEh5WYURPgTRwSILgahvBq8kyGIlm9RSYLfJkIO1KAg=='
                ],
                preconditions: {
                  timebounds: {
                    min_time: '0',
                    max_time: '1748525221'
                  }
                }
              },
              asset_type: 'native',
              from: `${address}`,
              to: 'GCQW2SG4NJ56RIP3JI24NWMQUXBKDEAF2BYNW4TXVKK2PIG5SIPKLENM',
              amount: '2.0000000'
            }
          ]
        }
      }
    }

    return { first, next }
  }
}
