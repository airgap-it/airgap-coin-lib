import { MoonbeamCollatorDetails } from './MoonbeamCollatorDetails'
import { MoonbeamNominatorDetails } from './MoonbeamNominatorDetails'

export interface MoonbeamNominationDetails {
  nominatorDetails: MoonbeamNominatorDetails
  collatorDetails: MoonbeamCollatorDetails
  bond: string
}