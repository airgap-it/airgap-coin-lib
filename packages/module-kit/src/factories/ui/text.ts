import { AirGapUIText } from '../../types/ui/text'

export function plainUIText(text: string): AirGapUIText {
  return { type: 'plain', value: text }
}
