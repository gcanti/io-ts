/**
 * An instance of `Schemable` for `fast-check` arbitraries that emit valid values
 */
import * as fc from 'fast-check'
import { identity, Refinement } from 'fp-ts/function'
import * as S from '../src/Schemable'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

export interface Arbitrary<A> extends fc.Arbitrary<A> {}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

export function literal<A extends readonly [S.Literal, ...ReadonlyArray<S.Literal>]>(
  ...values: A
): Arbitrary<A[number]> {
  return fc.oneof(...values.map((v) => fc.constant(v)))
}

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

export const string: Arbitrary<string> = fc.oneof(
  fc.string(),
  fc.asciiString(),
  fc.fullUnicodeString(),
  fc.hexaString(),
  fc.lorem()
)

export const number: Arbitrary<number> = fc.oneof(fc.float(), fc.double(), fc.integer())

export const boolean: Arbitrary<boolean> = fc.boolean()

// tslint:disable-next-line: readonly-array
export const UnknownArray: Arbitrary<Array<unknown>> = fc.array(fc.anything())

export const UnknownRecord: Arbitrary<Record<string, unknown>> = fc.dictionary(string, fc.anything())

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

export const refine = <A, B extends A>(refinement: Refinement<A, B>) => (from: Arbitrary<A>): Arbitrary<B> =>
  from.filter(refinement)

export function nullable<A>(or: Arbitrary<A>): Arbitrary<null | A> {
  return fc.oneof(fc.constant(null), or)
}

export function struct<A>(properties: { [K in keyof A]: Arbitrary<A[K]> }): Arbitrary<A> {
  return fc.record(properties)
}

export function partial<A>(properties: { [K in keyof A]: Arbitrary<A[K]> }): Arbitrary<Partial<A>> {
  const keys = fc.oneof(...Object.keys(properties).map((p) => fc.constant(p)))
  return keys.chain((key) => {
    const p: any = { ...properties }
    delete p[key]
    return fc.record(p)
  })
}

export function record<A>(codomain: Arbitrary<A>): Arbitrary<Record<string, A>> {
  return fc.dictionary(string, codomain)
}

// tslint:disable-next-line: readonly-array
export function array<A>(item: Arbitrary<A>): Arbitrary<Array<A>> {
  return fc.array(item)
}

export function tuple<A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: Arbitrary<A[K]> }
): Arbitrary<A> {
  if (components.length === 0) {
    return fc.constant([]) as any
  }
  return (fc.tuple as any)(...components)
}

export const intersect = <B>(right: Arbitrary<B>) => <A>(left: Arbitrary<A>): Arbitrary<A & B> =>
  fc.tuple(left, right).map(([a, b]) => S.intersect_(a, b))

export function sum<T extends string>(
  _tag: T
): <A>(members: { [K in keyof A]: Arbitrary<A[K] & Record<T, K>> }) => Arbitrary<A[keyof A]> {
  return (members: Record<string, Arbitrary<any>>) => fc.oneof(...Object.keys(members).map((k) => members[k]))
}

export function lazy<A>(f: () => Arbitrary<A>): Arbitrary<A> {
  const get = S.memoize<void, Arbitrary<A>>(f)
  return fc.constant(null).chain(() => get())
}

export const readonly: <A>(arb: Arbitrary<A>) => Arbitrary<Readonly<A>> = identity

export function union<A extends readonly [Arbitrary<unknown>, ...ReadonlyArray<Arbitrary<unknown>>]>(
  ...members: { [K in keyof A]: Arbitrary<A[K]> }
): Arbitrary<A[number]> {
  return fc.oneof(...members)
}

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

export const URI = 'Arbitrary'

export type URI = typeof URI

declare module 'fp-ts/HKT' {
  interface URItoKind<A> {
    readonly Arbitrary: Arbitrary<A>
  }
}

export const Schemable: S.Schemable1<URI> & S.WithUnknownContainers1<URI> & S.WithUnion1<URI> & S.WithRefine1<URI> = {
  URI,
  literal,
  string,
  number,
  boolean,
  nullable,
  struct,
  partial,
  record,
  array,
  tuple: tuple as S.Schemable1<URI>['tuple'],
  intersect,
  sum,
  lazy: (_, f) => lazy(f),
  readonly,
  UnknownArray,
  UnknownRecord,
  union: union as S.WithUnion1<URI>['union'],
  refine: refine as S.WithRefine1<URI>['refine']
}
