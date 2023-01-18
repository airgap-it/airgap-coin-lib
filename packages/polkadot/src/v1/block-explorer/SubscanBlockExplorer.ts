import { SubscanBlockExplorer } from '@airgap/substrate/v1'

const POLKADOT_BLOCK_EXPLORER_URL: string = 'https://polkadot.subscan.io'
const KUSAMA_BLOCK_EXPLORER_URL: string = 'https://kusama.subscan.io'

// Factory

export function createPolkadotSubscanBlockExplorer(): SubscanBlockExplorer {
  return new SubscanBlockExplorer(POLKADOT_BLOCK_EXPLORER_URL)
}

export function createKusamaSubscanBlockExplorer(): SubscanBlockExplorer {
  return new SubscanBlockExplorer(KUSAMA_BLOCK_EXPLORER_URL)
}
