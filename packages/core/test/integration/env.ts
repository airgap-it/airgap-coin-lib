export function isIntegrationLive(): boolean {
  return process.env.INTEGRATION_LIVE === '1'
}
