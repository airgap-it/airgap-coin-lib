import { AirGapUIText } from '../../types/ui/text'

export function newPlainUIText(text: string): AirGapUIText {
  return { type: 'plain', value: text }
}
