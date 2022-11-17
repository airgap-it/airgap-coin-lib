import { Sealed } from '../base/sealed'

type UITextType = 'plain'

interface BaseUIText<_Type extends UITextType> extends Sealed<_Type> {
  value: string
}

interface PlainUIText extends BaseUIText<'plain'> {}

export type AirGapUIText = PlainUIText
