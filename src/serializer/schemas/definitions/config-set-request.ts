export interface ConfigSetRequest {
  key: string // Key of the config
  value: string // Value that the config will be set to
  peerId: string // ID of the peer that wants to set the value
  signature: string // Signature of the peer
}
