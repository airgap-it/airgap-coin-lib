import * as sodium from 'libsodium-wrappers'

const isCoinlibReady = function() {
  return sodium.ready
}

export { isCoinlibReady }
