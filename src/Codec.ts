/**
 * @since 2.2.3
 */
import { Invariant2 } from 'fp-ts/lib/Invariant'
import * as D from './Decoder'
import * as E from './Encoder'
import { Literal } from './Schemable'
import { identity } from 'fp-ts/lib/function'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * Laws:
 *
 * 1. `pipe(codec.decode(u), E.fold(() => u, codec.encode)) = u` for all `u` in `unknown`
 * 2. `codec.decode(codec.encode(a)) = E.right(a)` for all `a` in `A`
 *
 * @category model
 * @since 2.2.3
 */
export interface Codec<O, A> extends D.Decoder<A>, E.Encoder<O, A> {}

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.3
 */
export type TypeOf<C> = E.TypeOf<C>

/**
 * @since 2.2.3
 */
export type OutputOf<C> = E.OutputOf<C>

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 2.2.3
 */
export function make<O, A>(decoder: D.Decoder<A>, encoder: E.Encoder<O, A>): Codec<O, A> {
  return {
    decode: decoder.decode,
    encode: encoder.encode
  }
}

/**
 * @category constructors
 * @since 2.2.3
 */
export function fromDecoder<A>(decoder: D.Decoder<A>): Codec<A, A> {
  return {
    decode: decoder.decode,
    encode: identity
  }
}

/**
 * @category constructors
 * @since 2.2.3
 */
export function literal<A extends ReadonlyArray<Literal>>(...values: A): Codec<A[number], A[number]> {
  return fromDecoder(D.literal(...values))
}

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * @category primitives
 * @since 2.2.3
 */
export const string: Codec<string, string> = fromDecoder(D.string)

/**
 * @category primitives
 * @since 2.2.3
 */
export const number: Codec<number, number> = fromDecoder(D.number)

/**
 * @category primitives
 * @since 2.2.3
 */
export const boolean: Codec<boolean, boolean> = fromDecoder(D.boolean)

/**
 * @category primitives
 * @since 2.2.3
 */
export const UnknownArray: Codec<Array<unknown>, Array<unknown>> = fromDecoder(D.UnknownArray)

/**
 * @category primitives
 * @since 2.2.3
 */
export const UnknownRecord: Codec<Record<string, unknown>, Record<string, unknown>> = fromDecoder(D.UnknownRecord)

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 2.2.3
 */
export function withExpected<O, A>(
  codec: Codec<O, A>,
  expected: (actual: unknown, e: D.DecodeError) => D.DecodeError
): Codec<O, A> {
  return make(D.withExpected(codec, expected), codec)
}

/**
 * @category combinators
 * @since 2.2.3
 */
export function refinement<O, A, B extends A>(
  from: Codec<O, A>,
  refinement: (a: A) => a is B,
  expected: string
): Codec<O, B> {
  return make(D.refinement(from, refinement, expected), from)
}

/**
 * @category combinators
 * @since 2.2.3
 */
export function nullable<O, A>(or: Codec<O, A>): Codec<null | O, null | A> {
  return make(D.nullable(or), E.nullable(or))
}

/**
 * @category combinators
 * @since 2.2.3
 */
export function type<P extends Record<string, Codec<any, any>>>(
  properties: P
): Codec<{ [K in keyof P]: OutputOf<P[K]> }, { [K in keyof P]: TypeOf<P[K]> }> {
  const decoder: D.Decoder<{ [K in keyof P]: TypeOf<P[K]> }> = D.type(properties) as any
  return make(decoder, E.type(properties))
}

/**
 * @category combinators
 * @since 2.2.3
 */
export function partial<P extends Record<string, Codec<any, any>>>(
  properties: P
): Codec<Partial<{ [K in keyof P]: OutputOf<P[K]> }>, Partial<{ [K in keyof P]: TypeOf<P[K]> }>> {
  // these two `any`s are required to make typescript@3.5 compile
  //                               vvvvvv                          vvvvvv
  return make(D.partial(properties as any), E.partial(properties)) as any
}

/**
 * @category combinators
 * @since 2.2.3
 */
export function record<O, A>(codomain: Codec<O, A>): Codec<Record<string, O>, Record<string, A>> {
  return make(D.record(codomain), E.record(codomain))
}

/**
 * @category combinators
 * @since 2.2.3
 */
export function array<O, A>(items: Codec<O, A>): Codec<Array<O>, Array<A>> {
  return make(D.array(items), E.array(items))
}

/**
 * @category combinators
 * @since 2.2.3
 */
export function tuple<C extends ReadonlyArray<Codec<any, any>>>(
  ...components: C
): Codec<{ [K in keyof C]: OutputOf<C[K]> }, { [K in keyof C]: TypeOf<C[K]> }> {
  const decoder: D.Decoder<{ [K in keyof C]: TypeOf<C[K]> }> = D.tuple(...components) as any
  const encoder = E.tuple(...components)
  return make(decoder, encoder)
}

/**
 * @category combinators
 * @since 2.2.3
 */
export function intersection<O, A, P, B>(left: Codec<O, A>, right: Codec<P, B>): Codec<O & P, A & B> {
  return make(D.intersection(left, right), E.intersection(left, right))
}

/**
 * @category combinators
 * @since 2.2.3
 */
export function sum<T extends string>(
  tag: T
): <M extends Record<string, Codec<any, any>>>(members: M) => Codec<OutputOf<M[keyof M]>, TypeOf<M[keyof M]>> {
  const sumD = D.sum(tag)
  const sumE = E.sum(tag)
  return (members) => make(sumD(members), sumE(members))
}

/**
 * @category combinators
 * @since 2.2.3
 */
export function lazy<O, A>(id: string, f: () => Codec<O, A>): Codec<O, A> {
  return make(D.lazy(id, f), E.lazy(f))
}

// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------

/**
 * @category Invariant
 * @since 2.2.3
 */
export const imap: <E, A, B>(f: (a: A) => B, g: (b: B) => A) => (fa: Codec<E, A>) => Codec<E, B> = (f, g) => (fa) =>
  imap_(fa, f, g)

const imap_: <E, A, B>(fa: Codec<E, A>, f: (a: A) => B, g: (b: B) => A) => Codec<E, B> = (fa, f, g) =>
  make(D.functorDecoder.map(fa, f), E.contravariantEncoder.contramap(fa, g))

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 2.2.3
 */
export const URI = 'io-ts/Codec'

/**
 * @category instances
 * @since 2.2.3
 */
export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind2<E, A> {
    readonly [URI]: Codec<E, A>
  }
}

/**
 * @category instances
 * @since 2.2.3
 */
export const invariantCodec: Invariant2<URI> = {
  URI,
  imap: imap_
}
