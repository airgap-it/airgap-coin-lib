// Upstream ships two shims (`crypto.ts` for Node, `cryptoBrowser.ts` for browsers) and picks one
// through package.json's `browser` field. Vendoring bypasses that, so this copy resolves
// WebCrypto via `globalThis` like the sibling @noble/hashes-1.8.0 does - it works in browsers
// and in Node 19+ (or 18 with the webcrypto global), where `self` does not exist.
declare const globalThis: Record<string, any> | undefined;
export const crypto: { node?: any; web?: any } = {
  node: undefined,
  web: typeof globalThis === 'object' && 'crypto' in globalThis ? globalThis.crypto : undefined,
};
