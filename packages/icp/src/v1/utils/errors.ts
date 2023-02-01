export class AgentError extends Error {
  constructor(public readonly message: string) {
    super(message)
    Object.setPrototypeOf(this, AgentError.prototype)
  }
}

export class CertificateVerificationError extends AgentError {
  constructor(reason: string) {
    super(`Invalid certificate: ${reason}`)
  }
}
