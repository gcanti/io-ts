/**
 * An instance of `Schemable` for `fast-check` arbitraries that emit valid values
 */
import * as fc from 'fast-check'
import * as S from '../src/Schemable'
import { intersect } from '../src/Decoder'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

export interface Arbitrary<A> extends fc.Arbitrary<A> {}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

export function literal<A extends ReadonlyArray<S.Literal>>(...values: A): Arbitrary<A[number]> {
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

export const UnknownArray: Arbitrary<Array<unknown>> = fc.array(fc.anything())

export const UnknownRecord: Arbitrary<Record<string, unknown>> = fc.dictionary(string, fc.anything())

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

export function nullable<A>(or: Arbitrary<A>): Arbitrary<null | A> {
  return fc.oneof(fc.constant(null), or)
}

export function type<A>(properties: { [K in keyof A]: Arbitrary<A[K]> }): Arbitrary<A> {
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

export function array<A>(items: Arbitrary<A>): Arbitrary<Array<A>> {
  return fc.array(items)
}

export function tuple<A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: Arbitrary<A[K]> }
): Arbitrary<A> {
  if (components.length === 0) {
    return fc.constant([]) as any
  }
  return (fc.tuple as any)(...components)
}

export function intersection<A, B>(left: Arbitrary<A>, right: Arbitrary<B>): Arbitrary<A & B> {
  return fc.tuple(left, right).map(([a, b]) => intersect(a, b))
}

export function sum<T extends string>(
  _tag: T
): <A>(members: { [K in keyof A]: Arbitrary<A[K] & Record<T, K>> }) => Arbitrary<A[keyof A]> {
  return (members: Record<string, Arbitrary<any>>) => fc.oneof(...Object.keys(members).map((k) => members[k]))
}

export function lazy<A>(f: () => Arbitrary<A>): Arbitrary<A> {
  const get = S.memoize<void, Arbitrary<A>>(f)
  return fc.constant(null).chain(() => get())
}

export function union<A extends ReadonlyArray<unknown>>(
  ...members: { [K in keyof A]: Arbitrary<A[K]> }
): Arbitrary<A[number]> {
  return fc.oneof(...members)
}

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

export const URI = 'Arbitrary'

export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly Arbitrary: Arbitrary<A>
  }
}

export const arbitrary: S.Schemable<URI> & S.WithUnion<URI> = {
  URI,
  literal,
  string,
  number,
  boolean,
  UnknownArray,
  UnknownRecord,
  nullable,
  type,
  partial,
  record,
  array,
  tuple: tuple as S.Schemable<URI>['tuple'],
  intersection,
  sum,
  lazy: (_, f) => lazy(f),
  union
}
