export interface ConfigSetRequest {
  key: string // Key of the config
  value: string // Value that the config will be set to
  signerId: string //
  signature: string // Signature
}
