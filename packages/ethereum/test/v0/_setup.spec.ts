import Axios from '@airgap/coinlib-core/dependencies/src/axios-0.19.0'

const MockAdapter = require('axios-mock-adapter')

// This sets the mock adapter on the default instance
const mock = new MockAdapter(Axios)

mock.onAny().replyOnce((config) => {
  console.log('UNMOCKED URL, RETURNING ERROR 500', config.url)

  return [500, {}]
})

// mock.onAny().passThrough()
