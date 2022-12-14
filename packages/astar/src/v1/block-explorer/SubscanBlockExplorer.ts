import { SubscanBlockExplorer } from '@airgap/substrate/v1'

const ASTAR_BLOCK_EXPLORER_URL: string = 'https://shiden.subscan.io'
const SHIDEN_BLOCK_EXPLORER_URL: string = 'https://shiden.subscan.io'

// Factory

export function createAstarSubscanBlockExplorer(): SubscanBlockExplorer {
  return new SubscanBlockExplorer(ASTAR_BLOCK_EXPLORER_URL)
}

export function createShidenSubscanBlockExplorer(): SubscanBlockExplorer {
  return new SubscanBlockExplorer(SHIDEN_BLOCK_EXPLORER_URL)
}
