import sodium = require('libsodium-wrappers')

const isCoinlibReady: () => Promise<boolean> = (): Promise<boolean> => {
  return sodium.ready
}

export { isCoinlibReady }
