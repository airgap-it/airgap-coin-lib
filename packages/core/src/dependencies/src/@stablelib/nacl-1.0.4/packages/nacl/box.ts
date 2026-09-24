// Copyright (C) 2016 Dmitry Chestnykh
// MIT License. See LICENSE file for details.

import { scalarMult } from "../../../../@stablelib/x25519-1.0.3/packages/x25519/x25519";
import { hsalsa } from "../../../../@stablelib/xsalsa20-1.0.2/packages/xsalsa20/xsalsa20";
import { secretBox, openSecretBox } from "./secretbox";
import { wipe } from "../../../../@stablelib/wipe-1.0.1/packages/wipe/wipe";

export { generateKeyPair } from "../../../../@stablelib/x25519-1.0.3/packages/x25519/x25519";

const zeros16 = new Uint8Array(16);

export function precomputeSharedKey(theirPublicKey: Uint8Array, mySecretKey: Uint8Array): Uint8Array {
    // Compute scalar multiplication result.
    const key = scalarMult(mySecretKey, theirPublicKey);

    // Hash key with HSalsa function.
    hsalsa(key, zeros16, key);

    return key;
}

export function box(theirPublicKey: Uint8Array, mySecretKey: Uint8Array,
    nonce: Uint8Array, data: Uint8Array): Uint8Array {
    const sharedKey = precomputeSharedKey(theirPublicKey, mySecretKey);
    const result = secretBox(sharedKey, nonce, data);
    wipe(sharedKey);
    return result;
}

export function openBox(theirPublicKey: Uint8Array, mySecretKey: Uint8Array,
    nonce: Uint8Array, data: Uint8Array): Uint8Array | null {
    const sharedKey = precomputeSharedKey(theirPublicKey, mySecretKey);
    const result = openSecretBox(sharedKey, nonce, data);
    wipe(sharedKey);
    return result;
}
