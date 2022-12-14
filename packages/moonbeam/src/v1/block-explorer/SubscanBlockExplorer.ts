import { SubscanBlockExplorer } from '@airgap/substrate/v1'

const MOONBEAM_BLOCK_EXPLORER_URL: string = 'https://moonbeam.subscan.io'
const MOONRIVER_BLOCK_EXPLORER_URL: string = 'https://moonriver.subscan.io'
const MOONBASE_BLOCK_EXPLORER_URL: string = 'https://moonbase.subscan.io'

// Factory

export function createMoonbeamSubscanBlockExplorer(): SubscanBlockExplorer {
  return new SubscanBlockExplorer(MOONBEAM_BLOCK_EXPLORER_URL)
}

export function createMoonriverSubscanBlockExplorer(): SubscanBlockExplorer {
  return new SubscanBlockExplorer(MOONRIVER_BLOCK_EXPLORER_URL)
}

export function createMoonbaseSubscanBlockExplorer(): SubscanBlockExplorer {
  return new SubscanBlockExplorer(MOONBASE_BLOCK_EXPLORER_URL)
}
