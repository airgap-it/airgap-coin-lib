/*
 * ISC License (ISC)
 * Copyright 2018 aeternity developers
 *
 *  Permission to use, copy, modify, and/or distribute this software for any
 *  purpose with or without fee is hereby granted, provided that the above
 *  copyright notice and this permission notice appear in all copies.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 *  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 *  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 *  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 *  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 *  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 *  PERFORMANCE OF THIS SOFTWARE.
 */

import { derivePathFromKey, derivePathFromSeed, getKeyPair } from './hd-key'

export function generateHDWallet(seed) {
  return derivePathFromSeed('m/44h/457h', seed)
}

export function generateWalletUsingDerivationPath(seed, derivationPath = 'm/44h/457h/0h/0h/0h') {
  return getKeyPair(derivePathFromSeed(derivationPath, seed).privateKey)
}

export function getHDWalletAccounts(wallet, accountCount) {
  return (new Array(accountCount) as any).fill().map((_, idx) => getKeyPair(derivePathFromKey(`${idx}h/0h/0h`, wallet).privateKey))
}
