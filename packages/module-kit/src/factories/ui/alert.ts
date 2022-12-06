import { AirGapUIAlert } from '../../types/ui/alert'

export function newSuccessUIAlert(alert: Omit<AirGapUIAlert, 'type'>): AirGapUIAlert {
  return { ...alert, type: 'success' }
}

export function newInfoUIAlert(alert: Omit<AirGapUIAlert, 'type'>): AirGapUIAlert {
  return { ...alert, type: 'info' }
}

export function newWarningUIAlert(alert: Omit<AirGapUIAlert, 'type'>): AirGapUIAlert {
  return { ...alert, type: 'warning' }
}

export function newErrorUIAlert(alert: Omit<AirGapUIAlert, 'type'>): AirGapUIAlert {
  return { ...alert, type: 'error' }
}
