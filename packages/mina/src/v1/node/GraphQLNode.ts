import { gql, request } from 'graphql-request'

import { AccountBalance } from '../types/node'
import { MinaPayment, MinaSignature } from '../types/transaction'

import { MinaNode } from './MinaNode'

interface AccountNonceResponse {
  account?: {
    nonce?: string | null
    inferredNonce?: string | null
  }
}

interface AccountBalanceResponse {
  account?: {
    balance?: Partial<AccountBalance> | null
  }
}

interface SendTransactionResponse {
  sendPayment?: {
    payment?: {
      hash?: string | null
    }
  }
}

export class GraphQLNode implements MinaNode {
  public constructor(private readonly url: string) {}

  public async getNonce(publicKey: string): Promise<string> {
    const query = gql`
      query AccountNonce($publicKey: PublicKey!) {
        account(publicKey: $publicKey) {
          nonce
          inferredNonce
        }
      }
    `

    const response: AccountNonceResponse = await request(this.url, query, { publicKey })

    return response.account?.inferredNonce ?? response.account?.nonce ?? '0'
  }

  public async getBalance(publicKey: string): Promise<AccountBalance> {
    const query = gql`
      query AccountBalance($publicKey: PublicKey!) {
        account(publicKey: $publicKey) {
          balance {
            total
            liquid
          }
        }
      }
    `

    const response: AccountBalanceResponse = await request(this.url, query, { publicKey })

    return {
      total: response.account?.balance?.total ?? '0',
      liquid: response.account?.balance?.liquid ?? '0'
    }
  }

  public async sendTransaction(payment: MinaPayment, signature: MinaSignature): Promise<string> {
    const mutation = gql`
      mutation SendTransaction(
        $to: PublicKey!
        $from: PublicKey!
        $amount: UInt64!
        $fee: UInt64!
        $nonce: UInt32!
        $memo: String
        $validUntil: UInt32
        $rawSignature: String
        $field: String
        $scalar: String
      ) {
        sendPayment(
          input: { to: $to, from: $from, amount: $amount, fee: $fee, nonce: $nonce, memo: $memo, validUntil: $validUntil }
          signature: { rawSignature: $rawSignature, field: $field, scalar: $scalar }
        ) {
          payment {
            hash
          }
        }
      }
    `

    const response: SendTransactionResponse = await request(this.url, mutation, {
      to: payment.to,
      from: payment.from,
      amount: payment.amount,
      fee: payment.fee,
      nonce: payment.nonce,
      memo: payment.memo ?? null,
      validUntil: payment.validUntil ?? null,
      rawSignature: signature.type === 'raw' ? signature.value : null,
      field: signature.type === 'legacy' ? signature.field : null,
      scalar: signature.type === 'legacy' ? signature.scalar : null
    })

    return response.sendPayment?.payment?.hash ?? ''
  }
}
