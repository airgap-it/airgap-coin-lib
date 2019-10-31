(function(root, f) {
  'use strict';
  if (typeof module !== 'undefined' && module.exports) module.exports = f(require('tweetnacl'));
  else root.nacl.auth = f(root.nacl);

}(this, function(nacl) {
  'use strict';

  if (!nacl) throw new Error('tweetnacl not loaded');

  var BLOCK_SIZE = 128, HASH_SIZE = 64;

  function hmac(message, key) {
    var buf = new Uint8Array(BLOCK_SIZE + Math.max(HASH_SIZE, message.length));
    var i, innerHash;

    if (key.length > BLOCK_SIZE)
      key = nacl.hash(key);

    for (i = 0; i < BLOCK_SIZE; i++) buf[i] = 0x36;
    for (i = 0; i < key.length; i++) buf[i] ^= key[i];
    buf.set(message, BLOCK_SIZE);
    innerHash = nacl.hash(buf.subarray(0, BLOCK_SIZE + message.length));

    for (i = 0; i < BLOCK_SIZE; i++) buf[i] = 0x5c;
    for (i = 0; i < key.length; i++) buf[i] ^= key[i];
    buf.set(innerHash, BLOCK_SIZE);
    return nacl.hash(buf.subarray(0, BLOCK_SIZE + innerHash.length));
  }

  function auth(message, key) {
    var out = new Uint8Array(32);
    out.set(hmac(message, key).subarray(0, 32));
    return out;
  }

  auth.full = function (message, key) {
    return hmac(message, key);
  };

  auth.authLength = 32;
  auth.authFullLength = 64;
  auth.keyLength = 32;

  return auth;

}));
