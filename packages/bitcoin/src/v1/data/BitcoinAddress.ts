export class BitcoinAddress {
  private constructor(protected readonly value: string) {}

  /**
   * Derives the P2PKH address for a public key.
   *
   * The address hash is whatever the injected library uses: `bitcoinjs-lib` hashes with SHA256d,
   * `groestlcoinjs-lib` with groestl. Keeping this decision inside the library — rather than
   * threading a hash function through the protocol — is why Groestlcoin needs its own library
   * rather than its own parameter.
   */
  public static fromPublicKey(publicKey: Uint8Array, lib: { payments: any }, network: any): BitcoinAddress {
    return new BitcoinAddress(lib.payments.p2pkh({ pubkey: Buffer.from(publicKey), network }).address)
  }

  public asString(): string {
    return this.value
  }
}
