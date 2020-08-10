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
import { Invariant3 } from 'fp-ts/lib/Invariant'
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
export interface Codec<I, O, A> extends D.Decoder<I, A>, E.Encoder<O, A> {}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 2.2.3
 */
export function make<I, O, A>(decoder: D.Decoder<I, A>, encoder: E.Encoder<O, A>): Codec<I, O, A> {
  return {
    decode: decoder.decode,
    encode: encoder.encode
  }
}

/**
 * @category constructors
 * @since 2.2.3
 */
export function fromDecoder<I, A>(decoder: D.Decoder<I, A>): Codec<I, A, A> {
  return {
    decode: decoder.decode,
    encode: identity
  }
}

/**
 * @category constructors
 * @since 2.2.3
 */
export function literal<A extends readonly [Literal, ...Array<Literal>]>(
  ...values: A
): Codec<unknown, A[number], A[number]> {
  return fromDecoder(D.literal(...values))
}

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * @category primitives
 * @since 2.2.3
 */
export const string: Codec<unknown, string, string> =
  /*#__PURE__*/
  fromDecoder(D.string)

/**
 * @category primitives
 * @since 2.2.3
 */
export const number: Codec<unknown, number, number> =
  /*#__PURE__*/
  fromDecoder(D.number)

/**
 * @category primitives
 * @since 2.2.3
 */
export const boolean: Codec<unknown, boolean, boolean> =
  /*#__PURE__*/
  fromDecoder(D.boolean)

/**
 * @category primitives
 * @since 2.2.3
 */
export const UnknownArray: Codec<unknown, Array<unknown>, Array<unknown>> =
  /*#__PURE__*/
  fromDecoder(D.UnknownArray)

/**
 * @category primitives
 * @since 2.2.3
 */
export const UnknownRecord: Codec<unknown, Record<string, unknown>, Record<string, unknown>> =
  /*#__PURE__*/
  fromDecoder(D.UnknownRecord)

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 2.2.3
 */
export const mapLeftWithInput = <I>(f: (i: I, e: D.DecodeError) => D.DecodeError) => <O, A>(
  codec: Codec<I, O, A>
): Codec<I, O, A> => make(pipe(codec, D.mapLeftWithInput(f)), codec)

/**
 * @category combinators
 * @since 2.2.3
 */
export const refine = <A, B extends A>(
  refinement: (a: A) => a is B,
  id: string
): (<I, O>(from: Codec<I, O, A>) => Codec<I, O, B>) => {
  const refine = D.refine(refinement, id)
  return (from) => make(refine(from), from)
}

/**
 * @category combinators
 * @since 2.2.3
 */
export function nullable<I, O, A>(or: Codec<I, O, A>): Codec<null | I, null | O, null | A> {
  return make(D.nullable(or), E.nullable(or))
}

/**
 * @category combinators
 * @since 2.2.8
 */
export function fromType<P extends Record<string, Codec<any, any, any>>>(
  properties: P
): Codec<{ [K in keyof P]: InputOf<P[K]> }, { [K in keyof P]: OutputOf<P[K]> }, { [K in keyof P]: TypeOf<P[K]> }> {
  return make(D.fromType(properties) as any, E.type(properties))
}

/**
 * @category combinators
 * @since 2.2.3
 */
export function type<P extends Record<string, Codec<unknown, any, any>>>(
  properties: P
): Codec<unknown, { [K in keyof P]: OutputOf<P[K]> }, { [K in keyof P]: TypeOf<P[K]> }> {
  return pipe(UnknownRecord, compose(fromType(properties as any))) as any
}

/**
 * @category combinators
 * @since 2.2.8
 */
export function fromPartial<P extends Record<string, Codec<any, any, any>>>(
  properties: P
): Codec<
  Partial<{ [K in keyof P]: InputOf<P[K]> }>,
  Partial<{ [K in keyof P]: OutputOf<P[K]> }>,
  Partial<{ [K in keyof P]: TypeOf<P[K]> }>
> {
  return make(D.fromPartial(properties), E.partial(properties))
}

/**
 * @category combinators
 * @since 2.2.3
 */
export function partial<P extends Record<string, Codec<unknown, any, any>>>(
  properties: P
): Codec<unknown, Partial<{ [K in keyof P]: OutputOf<P[K]> }>, Partial<{ [K in keyof P]: TypeOf<P[K]> }>> {
  return pipe(UnknownRecord, compose(fromPartial(properties as any))) as any
}

/**
 * @category combinators
 * @since 2.2.3
 */
export function fromArray<I, O, A>(item: Codec<I, O, A>): Codec<Array<I>, Array<O>, Array<A>> {
  return make(D.fromArray(item), E.array(item))
}

/**
 * @category combinators
 * @since 2.2.3
 */
export function array<O, A>(item: Codec<unknown, O, A>): Codec<unknown, Array<O>, Array<A>> {
  return pipe(UnknownArray, compose(fromArray(item))) as any
}

/**
 * @category combinators
 * @since 2.2.3
 */
export function fromRecord<I, O, A>(
  codomain: Codec<I, O, A>
): Codec<Record<string, I>, Record<string, O>, Record<string, A>> {
  return make(D.fromRecord(codomain), E.record(codomain))
}

/**
 * @category combinators
 * @since 2.2.3
 */
export function record<O, A>(codomain: Codec<unknown, O, A>): Codec<unknown, Record<string, O>, Record<string, A>> {
  return pipe(UnknownRecord, compose(fromRecord(codomain))) as any
}

/**
 * @category combinators
 * @since 2.2.8
 */
export const fromTuple = <C extends ReadonlyArray<Codec<any, any, any>>>(
  ...components: C
): Codec<{ [K in keyof C]: InputOf<C[K]> }, { [K in keyof C]: OutputOf<C[K]> }, { [K in keyof C]: TypeOf<C[K]> }> =>
  make(D.fromTuple(...components) as any, E.tuple(...components))

/**
 * @category combinators
 * @since 2.2.3
 */
export function tuple<C extends ReadonlyArray<Codec<unknown, any, any>>>(
  ...components: C
): Codec<unknown, { [K in keyof C]: OutputOf<C[K]> }, { [K in keyof C]: TypeOf<C[K]> }> {
  return pipe(UnknownArray as any, compose(fromTuple(...components) as any)) as any
}

/**
 * @category combinators
 * @since 2.2.3
 */
export const intersect = <IB, OB, B>(
  right: Codec<IB, OB, B>
): (<IA, OA, A>(left: Codec<IA, OA, A>) => Codec<IA & IB, OA & OB, A & B>) => {
  const intersectD = D.intersect(right)
  const intersectE = E.intersect(right)
  return (left) => make(intersectD(left), intersectE(left))
}

/**
 * @category combinators
 * @since 2.2.8
 */
export const fromSum = <T extends string>(
  tag: T
): (<MS extends Record<string, Codec<any, any, any>>>(
  members: MS
) => Codec<InputOf<MS[keyof MS]>, OutputOf<MS[keyof MS]>, TypeOf<MS[keyof MS]>>) => {
  const decoder = D.fromSum(tag)
  const encoder = E.sum(tag)
  return (members) => make(decoder(members) as any, encoder(members))
}

/**
 * @category combinators
 * @since 2.2.3
 */
export function sum<T extends string>(
  tag: T
): <M extends Record<string, Codec<unknown, any, any>>>(
  members: M
) => Codec<unknown, OutputOf<M[keyof M]>, TypeOf<M[keyof M]>> {
  const sum = fromSum(tag)
  return (members) => pipe(UnknownRecord, compose(sum(members) as any)) as any
}

/**
 * @category combinators
 * @since 2.2.3
 */
export function lazy<I, O, A>(id: string, f: () => Codec<I, O, A>): Codec<I, O, A> {
  return make(D.lazy(id, f), E.lazy(f))
}

/**
 * @category combinators
 * @since 2.2.8
 */
export const compose = <L, A extends L, P extends A, B>(to: Codec<L, P, B>) => <I, O>(
  from: Codec<I, O, A>
): Codec<I, O, B> => make(D.compose(to)(from), E.compose(from)(to))

// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------

const imap_: Invariant3<URI>['imap'] = (fa, f, g) => make(D.Functor.map(fa, f), E.Contravariant.contramap(fa, g))

// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------

/**
 * @category Invariant
 * @since 2.2.3
 */
export const imap: <I, O, A, B>(f: (a: A) => B, g: (b: B) => A) => (fa: Codec<I, O, A>) => Codec<I, O, B> = (f, g) => (
  fa
) => imap_(fa, f, g)

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
  interface URItoKind3<R, E, A> {
    readonly [URI]: Codec<R, E, A>
  }
}

/**
 * @category instances
 * @since 2.2.8
 */
export const Invariant: Invariant3<URI> = {
  URI,
  imap: imap_
}

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.8
 */
export type InputOf<C> = D.InputOf<C>

/**
 * @since 2.2.3
 */
export type OutputOf<C> = E.OutputOf<C>

/**
 * @since 2.2.3
 */
export type TypeOf<C> = E.TypeOf<C>
