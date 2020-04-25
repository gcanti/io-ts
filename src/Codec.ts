/**
 * @since 2.2.0
 */
import { Invariant1 } from 'fp-ts/lib/Invariant'
import * as D from './Decoder'
import * as E from './Encoder'
import { Schemable, Literal } from './Schemable'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * Laws:
 *
 * 1. `pipe(codec.decode(u), E.fold(() => u, codec.encode) = u` for all `u` in `unknown`
 * 2. `codec.decode(codec.encode(a)) = E.right(a)` for all `a` in `A`
 *
 * @since 2.2.0
 */
export interface Codec<A> extends D.Decoder<A>, E.Encoder<A> {}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.0
 */
export function make<A>(decoder: D.Decoder<A>, encoder: E.Encoder<A>): Codec<A> {
  return {
    decode: decoder.decode,
    encode: encoder.encode
  }
}

/**
 * @since 2.2.0
 */
export function literal<A extends ReadonlyArray<Literal>>(...values: A): Codec<A[number]> {
  return make(D.decoder.literal(...values), E.encoder.literal(...values))
}

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.0
 */
export const string: Codec<string> = make(D.decoder.string, E.encoder.string)

/**
 * @since 2.2.0
 */
export const number: Codec<number> = make(D.decoder.number, E.encoder.number)

/**
 * @since 2.2.0
 */
export const boolean: Codec<boolean> = make(D.decoder.boolean, E.encoder.boolean)

/**
 * @since 2.2.0
 */
export const UnknownArray: Codec<Array<unknown>> = make(D.decoder.UnknownArray, E.encoder.UnknownArray)

/**
 * @since 2.2.0
 */
export const UnknownRecord: Codec<Record<string, unknown>> = make(D.decoder.UnknownRecord, E.encoder.UnknownRecord)

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.0
 */
export function withExpected<A>(
  codec: Codec<A>,
  expected: (actual: unknown, e: D.DecodeError) => D.DecodeError
): Codec<A> {
  return make(D.withExpected(codec, expected), codec)
}

/**
 * @since 2.2.0
 */
export function refinement<A, B extends A>(from: Codec<A>, refinement: (a: A) => a is B, expected: string): Codec<B> {
  return make(D.refinement(from, refinement, expected), from)
}

/**
 * @since 2.2.0
 */
export function nullable<A>(or: Codec<A>): Codec<null | A> {
  return make(D.decoder.nullable(or), E.encoder.nullable(or))
}

/**
 * @since 2.2.0
 */
export function type<A>(properties: { [K in keyof A]: Codec<A[K]> }): Codec<A> {
  return make(D.decoder.type(properties), E.encoder.type(properties))
}

/**
 * @since 2.2.0
 */
export function partial<A>(properties: { [K in keyof A]: Codec<A[K]> }): Codec<Partial<A>> {
  return make(D.decoder.partial(properties), E.encoder.partial(properties))
}

/**
 * @since 2.2.0
 */
export function record<A>(codomain: Codec<A>): Codec<Record<string, A>> {
  return make(D.decoder.record(codomain), E.encoder.record(codomain))
}

/**
 * @since 2.2.0
 */
export function array<A>(items: Codec<A>): Codec<Array<A>> {
  return make(D.decoder.array(items), E.encoder.array(items))
}

/**
 * @since 2.2.0
 */
export function tuple<A extends ReadonlyArray<unknown>>(...components: { [K in keyof A]: Codec<A[K]> }): Codec<A> {
  return make(D.decoder.tuple<A>(...(components as any)), E.encoder.tuple<A>(...(components as any)))
}

/**
 * @since 2.2.0
 */
export function intersection<A, B>(left: Codec<A>, right: Codec<B>): Codec<A & B> {
  return make(D.decoder.intersection(left, right), E.encoder.intersection(left, right))
}

/**
 * @since 2.2.0
 */
export function sum<T extends string>(
  tag: T
): <A>(members: { [K in keyof A]: Codec<A[K] & Record<T, K>> }) => Codec<A[keyof A]> {
  const sumD = D.decoder.sum(tag)
  const sumE = E.encoder.sum(tag)
  return (members) => make(sumD(members), sumE(members))
}

/**
 * @since 2.2.0
 */
export function lazy<A>(id: string, f: () => Codec<A>): Codec<A> {
  return make(D.decoder.lazy(id, f), E.encoder.lazy(id, f))
}

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.0
 */
export const URI = 'Codec'

/**
 * @since 2.2.0
 */
export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly Codec: Codec<A>
  }
}

/**
 * @since 2.2.0
 */
export const codec: Invariant1<URI> & Schemable<URI> = {
  URI,
  imap: (fa, f, g) => make(D.decoder.map(fa, f), E.encoder.contramap(fa, g)),
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
  tuple: tuple as Schemable<URI>['tuple'],
  intersection,
  sum,
  lazy
}
