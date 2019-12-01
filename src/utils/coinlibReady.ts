import * as sodium from 'libsodium-wrappers'

const isCoinlibReady: () => boolean = (): boolean => {
  return sodium.ready
}

export { isCoinlibReady }
