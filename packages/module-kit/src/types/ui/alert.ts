import { AirGapUIAction } from './action'
import { AirGapUIText } from './text'

export interface AirGapUIAlert {
  type: 'success' | 'info' | 'warrning' | 'error'
  title: AirGapUIText
  description: AirGapUIText
  icon?: string // TODO: we should define a set of acceptable values
  actions?: AirGapUIAction[]
}
