export interface Amount<_Units extends string = string> {
  value: string
  unit: _Units
}
