/**
 * @since 2.2.7
 */
import * as E from 'fp-ts/lib/Either'
import { Refinement } from 'fp-ts/lib/function'
import * as DE from './DecodeError'
import * as FS from './FreeSemigroup'
import * as K from './Kleisli'
import { Literal } from './Schemable'

// -------------------------------------------------------------------------------------
// Kleisli config
// -------------------------------------------------------------------------------------

const M =
  /*#__PURE__*/
  E.getValidation(DE.getSemigroup<string>())

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 2.2.7
 */
export interface KleisliDecoder<I, A> {
  readonly decode: (i: I) => E.Either<DecodeError, A>
}

// -------------------------------------------------------------------------------------
// DecodeError
// -------------------------------------------------------------------------------------

/**
 * @category DecodeError
 * @since 2.2.7
 */
export type DecodeError = FS.FreeSemigroup<DE.DecodeError<string>>

/**
 * @category DecodeError
 * @since 2.2.7
 */
export const error = (actual: unknown, message: string): DecodeError => FS.of(DE.leaf(actual, message))

/**
 * @category DecodeError
 * @since 2.2.7
 */
export const success: <A>(a: A) => E.Either<DecodeError, A> = E.right

/**
 * @category DecodeError
 * @since 2.2.7
 */
export const failure = <A = never>(actual: unknown, message: string): E.Either<DecodeError, A> =>
  E.left(error(actual, message))

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 2.2.7
 */
export const fromRefinement = <I, A extends I>(refinement: Refinement<I, A>, expected: string): KleisliDecoder<I, A> =>
  K.fromRefinement(M)(refinement, (u) => error(u, expected))

/**
 * @category constructors
 * @since 2.2.7
 */
export const literal: <A extends readonly [Literal, ...Array<Literal>]>(
  ...values: A
) => KleisliDecoder<unknown, A[number]> =
  /*#__PURE__*/
  K.literal(M)((u, values) => error(u, values.map((value) => JSON.stringify(value)).join(' | ')))

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 2.2.7
 */
export const mapLeftWithInput: <I>(
  f: (input: I, e: DecodeError) => DecodeError
) => <A>(decoder: KleisliDecoder<I, A>) => KleisliDecoder<I, A> =
  /*#__PURE__*/
  K.mapLeftWithInput(M)

/**
 * @category combinators
 * @since 2.2.7
 */
export const refine = <A, B extends A>(
  refinement: (a: A) => a is B,
  id: string
): (<I>(from: KleisliDecoder<I, A>) => KleisliDecoder<I, B>) => K.refine(M)(refinement, (a) => error(a, id))

/**
 * @category combinators
 * @since 2.2.7
 */
export const parse: <A, B>(
  parser: (a: A) => E.Either<DecodeError, B>
) => <I>(from: KleisliDecoder<I, A>) => KleisliDecoder<I, B> =
  /*#__PURE__*/
  K.parse(M)

/**
 * @category combinators
 * @since 2.2.7
 */
export const nullable: <I, A>(or: KleisliDecoder<I, A>) => KleisliDecoder<null | I, null | A> =
  /*#__PURE__*/
  K.nullable(M)((u, e) => FS.concat(FS.of(DE.member(0, error(u, 'null'))), FS.of(DE.member(1, e))))

/**
 * @category combinators
 * @since 2.2.7
 */
export const type = <P extends Record<string, KleisliDecoder<any, any>>>(
  properties: P
): KleisliDecoder<{ [K in keyof P]: InputOf<P[K]> }, { [K in keyof P]: TypeOf<P[K]> }> =>
  K.type(M)((k, e) => FS.of(DE.key(k, DE.required, e)))(properties)

/**
 * @category combinators
 * @since 2.2.7
 */
export const partial = <P extends Record<string, KleisliDecoder<any, any>>>(
  properties: P
): KleisliDecoder<{ [K in keyof P]: InputOf<P[K]> }, Partial<{ [K in keyof P]: TypeOf<P[K]> }>> =>
  K.partial(M)((k, e) => FS.of(DE.key(k, DE.optional, e)))(properties)

/**
 * @category combinators
 * @since 2.2.7
 */
export const array = <I, A>(items: KleisliDecoder<I, A>): KleisliDecoder<Array<I>, Array<A>> =>
  K.array(M)((i, e) => FS.of(DE.index(i, DE.optional, e)))(items)

/**
 * @category combinators
 * @since 2.2.7
 */
export const record = <I, A>(codomain: KleisliDecoder<I, A>): KleisliDecoder<Record<string, I>, Record<string, A>> =>
  K.record(M)((k, e) => FS.of(DE.key(k, DE.optional, e)))(codomain)

/**
 * @category combinators
 * @since 2.2.7
 */
export const tuple = <C extends ReadonlyArray<KleisliDecoder<any, any>>>(
  ...components: C
): KleisliDecoder<{ [K in keyof C]: InputOf<C[K]> }, { [K in keyof C]: TypeOf<C[K]> }> =>
  K.tuple(M)((i, e) => FS.of(DE.index(i, DE.required, e)))(...components)

/**
 * @category combinators
 * @since 2.2.7
 */
export const union: <MS extends readonly [KleisliDecoder<any, any>, ...Array<KleisliDecoder<any, any>>]>(
  ...members: MS
) => KleisliDecoder<InputOf<MS[keyof MS]>, TypeOf<MS[keyof MS]>> =
  /*#__PURE__*/
  K.union(M)((i, e) => FS.of(DE.member(i, e)))

/**
 * @category combinators
 * @since 2.2.7
 */
export const intersect: <IB, B>(
  right: KleisliDecoder<IB, B>
) => <IA, A>(left: KleisliDecoder<IA, A>) => KleisliDecoder<IA & IB, A & B> =
  /*#__PURE__*/
  K.intersect(M)

/**
 * @category combinators
 * @since 2.2.7
 */
export const sum = <T extends string>(tag: T) => <MS extends Record<string, KleisliDecoder<any, any>>>(
  members: MS
): KleisliDecoder<InputOf<MS[keyof MS]>, TypeOf<MS[keyof MS]>> =>
  K.sum(M)((tag, value, keys) =>
    FS.of(
      DE.key(
        tag,
        DE.required,
        error(value, keys.length === 0 ? 'never' : keys.map((k) => JSON.stringify(k)).join(' | '))
      )
    )
  )(tag)(members)

/**
 * @category combinators
 * @since 2.2.7
 */
export const lazy: <I, A>(id: string, f: () => KleisliDecoder<I, A>) => KleisliDecoder<I, A> =
  /*#__PURE__*/
  K.lazy(M)((id, e) => FS.of(DE.lazy(id, e)))

/**
 * @category combinators
 * @since 2.2.7
 */
export const compose = <A, B>(to: KleisliDecoder<A, B>) => <I>(from: KleisliDecoder<I, A>): KleisliDecoder<I, B> =>
  K.pipe(M)(from, to)

// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------

/**
 * @category Functor
 * @since 2.2.7
 */
export const map: <A, B>(f: (a: A) => B) => <I>(fa: KleisliDecoder<I, A>) => KleisliDecoder<I, B> =
  /*#__PURE__*/
  K.map(M)

/**
 * @category Alt
 * @since 2.2.7
 */
export const alt: <I, A>(that: () => KleisliDecoder<I, A>) => (me: KleisliDecoder<I, A>) => KleisliDecoder<I, A> =
  /*#__PURE__*/
  K.alt(M)

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.7
 */
export type TypeOf<KD> = K.TypeOf<E.URI, KD>

/**
 * @since 2.2.7
 */
export type InputOf<KD> = K.InputOf<E.URI, KD>
