import { Network } from './networks';
import * as networks from './networks';
import * as types from './types';
import * as randomBytes from 'randombytes';
import * as wif from 'wif';
import { testEcc } from './testecc';
export { networks };

const isOptions = types.typeforce.maybe(
  types.typeforce.compile({
    compressed: types.maybe(types.Boolean),
    network: types.maybe(types.Network),
  }),
);

const toXOnly = (pubKey: Buffer) =>
  pubKey.length === 32 ? pubKey : pubKey.slice(1, 33);

interface ECPairOptions {
  compressed?: boolean;
  network?: Network;
  rng?(arg0: number): Buffer;
}

export interface Signer {
  publicKey: Buffer;
  network?: any;
  sign(hash: Buffer, lowR?: boolean): Buffer;
  getPublicKey?(): Buffer;
}

export interface SignerAsync {
  publicKey: Buffer;
  network?: any;
  sign(hash: Buffer, lowR?: boolean): Promise<Buffer>;
  getPublicKey?(): Buffer;
}

export interface ECPairInterface extends Signer {
  compressed: boolean;
  network: Network;
  lowR: boolean;
  privateKey?: Buffer;
  toWIF(): string;
  tweak(t: Buffer): ECPairInterface;
  verify(hash: Buffer, signature: Buffer): boolean;
  verifySchnorr(hash: Buffer, signature: Buffer): boolean;
  signSchnorr(hash: Buffer): Buffer;
}

export interface ECPairAPI {
  isPoint(maybePoint: any): boolean;
  fromPrivateKey(buffer: Buffer, options?: ECPairOptions): ECPairInterface;
  fromPublicKey(buffer: Buffer, options?: ECPairOptions): ECPairInterface;
  fromWIF(wifString: string, network?: Network | Network[]): ECPairInterface;
  makeRandom(options?: ECPairOptions): ECPairInterface;
}

export interface TinySecp256k1Interface {
  isPoint(p: Uint8Array): boolean;
  pointCompress(p: Uint8Array, compressed?: boolean): Uint8Array;
  isPrivate(d: Uint8Array): boolean;
  pointFromScalar(d: Uint8Array, compressed?: boolean): Uint8Array | null;
  xOnlyPointAddTweak(
    p: Uint8Array,
    tweak: Uint8Array,
  ): XOnlyPointAddTweakResult | null;

  privateAdd(d: Uint8Array, tweak: Uint8Array): Uint8Array | null;
  privateNegate(d: Uint8Array): Uint8Array;

  sign(h: Uint8Array, d: Uint8Array, e?: Uint8Array): Uint8Array;
  signSchnorr?(h: Uint8Array, d: Uint8Array, e?: Uint8Array): Uint8Array;

  verify(
    h: Uint8Array,
    Q: Uint8Array,
    signature: Uint8Array,
    strict?: boolean,
  ): boolean;
  verifySchnorr?(h: Uint8Array, Q: Uint8Array, signature: Uint8Array): boolean;
}

interface XOnlyPointAddTweakResult {
  parity: 1 | 0;
  xOnlyPubkey: Uint8Array;
}

export function ECPairFactory(ecc: TinySecp256k1Interface): ECPairAPI {
  testEcc(ecc);
  function isPoint(maybePoint: any): boolean {
    return ecc.isPoint(maybePoint);
  }

  function fromPrivateKey(
    buffer: Buffer,
    options?: ECPairOptions,
  ): ECPairInterface {
    types.typeforce(types.Buffer256bit, buffer);
    if (!ecc.isPrivate(buffer))
      throw new TypeError('Private key not in range [1, n)');
    types.typeforce(isOptions, options);

    return new ECPair(buffer, undefined, options);
  }

  function fromPublicKey(
    buffer: Buffer,
    options?: ECPairOptions,
  ): ECPairInterface {
    types.typeforce(ecc.isPoint, buffer);
    types.typeforce(isOptions, options);
    return new ECPair(undefined, buffer, options);
  }

  function fromWIF(
    wifString: string,
    network?: Network | Network[],
  ): ECPairInterface {
    const decoded = wif.decode(wifString);
    const version = decoded.version;

    // list of networks?
    if (types.Array(network)) {
      network = (network as Network[])
        .filter((x: Network) => {
          return version === x.wif;
        })
        .pop() as Network;

      if (!network) throw new Error('Unknown network version');

      // otherwise, assume a network object (or default to bitcoin)
    } else {
      network = network || networks.bitcoin;

      if (version !== (network as Network).wif)
        throw new Error('Invalid network version');
    }

    return fromPrivateKey(decoded.privateKey, {
      compressed: decoded.compressed,
      network: network as Network,
    });
  }

  function makeRandom(options?: ECPairOptions): ECPairInterface {
    types.typeforce(isOptions, options);
    if (options === undefined) options = {};
    const rng = options.rng || randomBytes;

    let d;
    do {
      d = rng(32);
      types.typeforce(types.Buffer256bit, d);
    } while (!ecc.isPrivate(d));

    return fromPrivateKey(d, options);
  }

  class ECPair implements ECPairInterface {
    compressed: boolean;
    network: Network;
    lowR: boolean;

    constructor(
      private __D?: Buffer,
      private __Q?: Buffer,
      options?: ECPairOptions,
    ) {
      this.lowR = false;
      if (options === undefined) options = {};
      this.compressed =
        options.compressed === undefined ? true : options.compressed;
      this.network = options.network || networks.bitcoin;

      if (__Q !== undefined)
        this.__Q = Buffer.from(ecc.pointCompress(__Q, this.compressed));
    }

    get privateKey(): Buffer | undefined {
      return this.__D;
    }

    get publicKey(): Buffer {
      if (!this.__Q) {
        // It is not possible for both `__Q` and `__D` to be `undefined` at the same time.
        // The factory methods guard for this.
        const p = ecc.pointFromScalar(this.__D!, this.compressed)!;
        // It is not possible for `p` to be null.
        // `fromPrivateKey()` checks that `__D` is a valid scalar.
        this.__Q = Buffer.from(p);
      }

      return this.__Q;
    }

    toWIF(): string {
      if (!this.__D) throw new Error('Missing private key');
      return wif.encode(this.network.wif, this.__D, this.compressed);
    }

    tweak(t: Buffer): ECPairInterface {
      if (this.privateKey) return this.tweakFromPrivateKey(t);
      return this.tweakFromPublicKey(t);
    }

    sign(hash: Buffer, lowR?: boolean): Buffer {
      if (!this.__D) throw new Error('Missing private key');
      if (lowR === undefined) lowR = this.lowR;
      if (lowR === false) {
        return Buffer.from(ecc.sign(hash, this.__D));
      } else {
        let sig = ecc.sign(hash, this.__D);
        const extraData = Buffer.alloc(32, 0);
        let counter = 0;
        // if first try is lowR, skip the loop
        // for second try and on, add extra entropy counting up
        while (sig[0] > 0x7f) {
          counter++;
          extraData.writeUIntLE(counter, 0, 6);
          sig = ecc.sign(hash, this.__D, extraData);
        }
        return Buffer.from(sig);
      }
    }

    signSchnorr(hash: Buffer): Buffer {
      if (!this.privateKey) throw new Error('Missing private key');
      if (!ecc.signSchnorr)
        throw new Error('signSchnorr not supported by ecc library');
      return Buffer.from(ecc.signSchnorr(hash, this.privateKey));
    }

    verify(hash: Buffer, signature: Buffer): boolean {
      return ecc.verify(hash, this.publicKey, signature);
    }

    verifySchnorr(hash: Buffer, signature: Buffer): boolean {
      if (!ecc.verifySchnorr)
        throw new Error('verifySchnorr not supported by ecc library');
      return ecc.verifySchnorr(hash, this.publicKey.subarray(1, 33), signature);
    }

    private tweakFromPublicKey(t: Buffer): ECPairInterface {
      const xOnlyPubKey = toXOnly(this.publicKey);
      const tweakedPublicKey = ecc.xOnlyPointAddTweak(xOnlyPubKey, t);
      if (!tweakedPublicKey || tweakedPublicKey.xOnlyPubkey === null)
        throw new Error('Cannot tweak public key!');
      const parityByte = Buffer.from([
        tweakedPublicKey.parity === 0 ? 0x02 : 0x03,
      ]);
      return fromPublicKey(
        Buffer.concat([parityByte, tweakedPublicKey.xOnlyPubkey]),
        { network: this.network, compressed: this.compressed },
      );
    }

    private tweakFromPrivateKey(t: Buffer): ECPairInterface {
      const hasOddY =
        this.publicKey[0] === 3 ||
        (this.publicKey[0] === 4 && (this.publicKey[64] & 1) === 1);
      const privateKey = hasOddY
        ? ecc.privateNegate(this.privateKey!)
        : this.privateKey;

      const tweakedPrivateKey = ecc.privateAdd(privateKey!, t);
      if (!tweakedPrivateKey) throw new Error('Invalid tweaked private key!');

      return fromPrivateKey(Buffer.from(tweakedPrivateKey), {
        network: this.network,
        compressed: this.compressed,
      });
    }
  }

  return {
    isPoint,
    fromPrivateKey,
    fromPublicKey,
    fromWIF,
    makeRandom,
  };
}
