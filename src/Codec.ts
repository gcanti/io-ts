/**
 * **This module is experimental**
 *
 * Experimental features are published in order to get early feedback from the community, see these tracking
 * [issues](https://github.com/gcanti/io-ts/issues?q=label%3Av2.2+) for further discussions and enhancements.
 *
 * A feature tagged as _Experimental_ is in a high state of flux, you're at risk of it changing without notice.
 *
 * @since 2.2.3
 */
import { identity } from 'fp-ts/lib/function'
import { Invariant2 } from 'fp-ts/lib/Invariant'
import { pipe } from 'fp-ts/lib/pipeable'
import * as D from './Decoder'
import * as E from './Encoder'
import { Literal } from './Schemable'

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
export interface Codec<O, A> extends D.Decoder<unknown, A>, E.Encoder<O, A> {}

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
export function make<O, A>(decoder: D.Decoder<unknown, A>, encoder: E.Encoder<O, A>): Codec<O, A> {
  return {
    decode: decoder.decode,
    encode: encoder.encode
  }
}

/**
 * @category constructors
 * @since 2.2.3
 */
export function fromDecoder<A>(decoder: D.Decoder<unknown, A>): Codec<A, A> {
  return {
    decode: decoder.decode,
    encode: identity
  }
}

/**
 * @category constructors
 * @since 2.2.3
 */
export function literal<A extends readonly [Literal, ...Array<Literal>]>(...values: A): Codec<A[number], A[number]> {
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
export const mapLeftWithInput = (f: (actual: unknown, e: D.DecodeError) => D.DecodeError) => <O, A>(
  codec: Codec<O, A>
): Codec<O, A> => make(pipe(codec, D.mapLeftWithInput(f)), codec)

/**
 * @category combinators
 * @since 2.2.3
 */
export const refine = <A, B extends A>(
  refinement: (a: A) => a is B,
  id: string
): (<O>(from: Codec<O, A>) => Codec<O, B>) => {
  const refine = D.refine(refinement, id)
  return (from) => make(refine(from), from)
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
  const decoder: D.Decoder<unknown, { [K in keyof P]: TypeOf<P[K]> }> = D.type(properties) as any
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
  const decoder: D.Decoder<unknown, { [K in keyof C]: TypeOf<C[K]> }> = D.tuple(...components) as any
  const encoder = E.tuple(...components)
  return make(decoder, encoder)
}

/**
 * @category combinators
 * @since 2.2.3
 */
export const intersect = <P, B>(right: Codec<P, B>): (<O, A>(left: Codec<O, A>) => Codec<O & P, A & B>) => {
  const intersectD = D.intersect(right)
  const intersectE = E.intersect(right)
  return (left) => make(intersectD(left), intersectE(left))
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
  make(D.Functor.map(fa, f), E.Contravariant.contramap(fa, g))

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
export const Invariant: Invariant2<URI> = {
  URI,
  imap: imap_
}
