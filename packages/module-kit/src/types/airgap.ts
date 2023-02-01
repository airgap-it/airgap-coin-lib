import { BlockExplorer } from '../block-explorer/block-explorer'
import { BlockExplorerExtensions } from '../block-explorer/extensions/extensions'
import { ModuleExtensions } from '../module/extensions/extensions'
import { Module } from '../module/module'
import { ProtocolExtensions } from '../protocol/extensions/extensions'
import { _AnyProtocol } from '../protocol/protocol'

import { Override } from './meta/utility-types'

export type AirGapInterface<
  T,
  E0 extends ApplicableExtension<T> = undefined,
  E1 extends ApplicableExtension<T> = undefined,
  E2 extends ApplicableExtension<T> = undefined,
  E3 extends ApplicableExtension<T> = undefined,
  E4 extends ApplicableExtension<T> = undefined,
  E5 extends ApplicableExtension<T> = undefined,
  E6 extends ApplicableExtension<T> = undefined,
  E7 extends ApplicableExtension<T> = undefined,
  E8 extends ApplicableExtension<T> = undefined,
  E9 extends ApplicableExtension<T> = undefined
> = _Interface<T, [E0, E1, E2, E3, E4, E5, E6, E7, E8, E9]>

type _Interface<T, E extends readonly any[]> = E extends [infer Head, ...infer Tail]
  ? Head extends undefined
    ? T
    : Head extends keyof AirGapExtensions<T>
    ? _Interface<Override<T, AirGapExtensions<T>[Head]>, [...Tail]> extends infer I
      ? I
      : never
    : never
  : never

export type ApplicableExtension<T> = keyof AirGapExtensions<T> | undefined
export type ApplicableBlockExplorerExtension<T> = keyof BlockExplorerExtensions<T> | undefined
export type ApplicableModuleExtension<T> = keyof ModuleExtensions<T> | undefined
export type ApplicableProtocolExtension<T> = keyof ProtocolExtensions<T> | undefined

type AirGapExtensions<T> = T extends BlockExplorer
  ? BlockExplorerExtensions<T>
  : T extends Module
  ? ModuleExtensions<T>
  : T extends _AnyProtocol
  ? ProtocolExtensions<T>
  : never
