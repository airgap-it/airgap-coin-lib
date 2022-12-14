function createWatermark(hex: string): Buffer {
  return Buffer.from(hex, 'hex')
}

export const WATERMARK = {
  block: createWatermark('01'),
  endorsement: createWatermark('02'),
  operation: createWatermark('03'),
  message: createWatermark('05')
}
