import * as fc from 'fast-check'
import { ReadonlyNonEmptyArray } from 'fp-ts/lib/ReadonlyNonEmptyArray'
import * as D from '../src/Decoder2'
import * as DE from '../src/DecodeError2'
import { Schemable1, WithUnknownContainers1, WithUnion1 } from '../src/Schemable2'

// TODO: move to io-ts-contrib in v3

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

export interface Arbitrary<A> extends fc.Arbitrary<A> {}

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

export const number: Arbitrary<number> = fc.oneof(
  fc.float(),
  fc.double(),
  fc.integer(),
  fc.constant(NaN),
  fc.constant(Infinity),
  fc.constant(-Infinity)
)

export const boolean: Arbitrary<boolean> = fc.boolean()

export const UnknownArray: Arbitrary<Array<unknown>> = fc.array(fc.anything())

export const UnknownRecord: Arbitrary<Record<string, unknown>> = fc.dictionary(string, fc.anything())

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

export const literal = <A extends ReadonlyNonEmptyArray<DE.Literal>>(...values: A): Arbitrary<A[number]> =>
  fc.oneof(...values.map((v) => fc.constant(v)))

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

export const nullable = <A>(or: Arbitrary<A>): Arbitrary<null | A> => fc.oneof(fc.constant(null), or)

export const tuple = <A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: Arbitrary<A[K]> }
): Arbitrary<A> => (components.length === 0 ? fc.constant([]) : (fc.tuple as any)(...components))

export const struct = <A>(properties: { [K in keyof A]: Arbitrary<A[K]> }): Arbitrary<A> => fc.record(properties)

export const partial = <A>(properties: { [K in keyof A]: Arbitrary<A[K]> }): Arbitrary<Partial<A>> => {
  const keys = fc.oneof(...Object.keys(properties).map((p) => fc.constant(p)))
  return keys.chain((key) => {
    const p: any = { ...properties }
    delete p[key]
    return fc.record(p)
  })
}

export const array = <A>(item: Arbitrary<A>): Arbitrary<Array<A>> => fc.array(item)

export const record = <A>(codomain: Arbitrary<A>): Arbitrary<Record<string, A>> => fc.dictionary(string, codomain)

export const union = <A extends readonly [unknown, ...ReadonlyArray<unknown>]>(
  ...members: { [K in keyof A]: Arbitrary<A[K]> }
): Arbitrary<A[number]> => fc.oneof(...members)

export const intersect = <B>(right: Arbitrary<B>) => <A>(left: Arbitrary<A>): Arbitrary<A & B> =>
  fc.tuple(left, right).map(([a, b]) => D.intersect_(a, b))

export const lazy = <A>(f: () => Arbitrary<A>): Arbitrary<A> => {
  const get = D.memoize<void, Arbitrary<A>>(f)
  return fc.constant(null).chain(() => get())
}

export function sum<T extends string>(
  _tag: T
): <A>(members: { [K in keyof A]: Arbitrary<A[K]> }) => Arbitrary<A[keyof A]> {
  return (members: Record<string, Arbitrary<any>>) => fc.oneof(...Object.keys(members).map((k) => members[k]))
}

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

export const URI = 'io-ts/toArbitrary'

export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly [URI]: Arbitrary<A>
  }
}

export const Schemable: Schemable1<URI> = {
  URI: URI,
  literal,
  string,
  number,
  boolean,
  tuple: tuple as any,
  struct,
  partial,
  array,
  record,
  nullable,
  intersect,
  lazy: (_, f) => lazy(f),
  sum
}

/**
 * @category instances
 * @since 2.2.8
 */
export const WithUnknownContainers: WithUnknownContainers1<URI> = {
  UnknownArray,
  UnknownRecord
}

/**
 * @category instances
 * @since 2.2.8
 */
export const WithUnion: WithUnion1<URI> = {
  union: union as any
}
