/**
 * **This module is experimental**
 *
 * Experimental features are published in order to get early feedback from the community, see these tracking
 * [issues](https://github.com/gcanti/io-ts/issues?q=label%3Av2.2+) for further discussions and enhancements.
 *
 * A feature tagged as _Experimental_ is in a high state of flux, you're at risk of it changing without notice.
 *
 * @since 2.2.7
 */
import { Alt2C } from 'fp-ts/lib/Alt'
import { Bifunctor2 } from 'fp-ts/lib/Bifunctor'
import * as E from 'fp-ts/lib/Either'
import { Refinement } from 'fp-ts/lib/function'
import { MonadThrow2C } from 'fp-ts/lib/MonadThrow'
import { pipe } from 'fp-ts/lib/pipeable'
import * as DE from './DecodeError'
import * as FS from './FreeSemigroup'
import * as K from './Kleisli'
import { Literal } from './Schemable'

// -------------------------------------------------------------------------------------
// Kleisli config
// -------------------------------------------------------------------------------------

/**
 * @internal
 */
export const SE =
  /*#__PURE__*/
  DE.getSemigroup<string>()

/**
 * @internal
 */
export const ap = <A, B>(
  fab: E.Either<DecodeError, (a: A) => B>,
  fa: E.Either<DecodeError, A>
): E.Either<DecodeError, B> =>
  E.isLeft(fab)
    ? E.isLeft(fa)
      ? E.left(SE.concat(fab.left, fa.left))
      : fab
    : E.isLeft(fa)
    ? fa
    : E.right(fab.right(fa.right))

const M: MonadThrow2C<E.URI, DecodeError> & Bifunctor2<E.URI> & Alt2C<E.URI, DecodeError> = {
  URI: E.URI,
  _E: undefined as any,
  map: (fa, f) => pipe(fa, E.map(f)),
  ap,
  of: E.right,
  chain: (ma, f) => pipe(ma, E.chain(f)),
  throwError: E.left,
  bimap: (fa, f, g) => pipe(fa, E.bimap(f, g)),
  mapLeft: (fa, f) => pipe(fa, E.mapLeft(f)),
  alt: (me, that) => {
    if (E.isRight(me)) {
      return me
    }
    const ea = that()
    return E.isLeft(ea) ? E.left(SE.concat(me.left, ea.left)) : ea
  }
}

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 2.2.7
 */
export interface Decoder<I, A> extends K.Kleisli<E.URI, I, DecodeError, A> {}

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
export const fromRefinement = <I, A extends I>(refinement: Refinement<I, A>, expected: string): Decoder<I, A> =>
  K.fromRefinement(M)(refinement, (u) => error(u, expected))

/**
 * @category constructors
 * @since 2.2.7
 */
export const literal: <A extends readonly [Literal, ...Array<Literal>]>(...values: A) => Decoder<unknown, A[number]> =
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
) => <A>(decoder: Decoder<I, A>) => Decoder<I, A> =
  /*#__PURE__*/
  K.mapLeftWithInput(M)

/**
 * @category combinators
 * @since 2.2.7
 */
export const refine = <A, B extends A>(
  refinement: (a: A) => a is B,
  id: string
): (<I>(from: Decoder<I, A>) => Decoder<I, B>) => K.refine(M)(refinement, (a) => error(a, id))

/**
 * @category combinators
 * @since 2.2.7
 */
export const parse: <A, B>(parser: (a: A) => E.Either<DecodeError, B>) => <I>(from: Decoder<I, A>) => Decoder<I, B> =
  /*#__PURE__*/
  K.parse(M)

/**
 * @category combinators
 * @since 2.2.7
 */
export const nullable: <I, A>(or: Decoder<I, A>) => Decoder<null | I, null | A> =
  /*#__PURE__*/
  K.nullable(M)((u, e) => FS.concat(FS.of(DE.member(0, error(u, 'null'))), FS.of(DE.member(1, e))))

/**
 * @category combinators
 * @since 2.2.7
 */
export const type = <P extends Record<string, Decoder<any, any>>>(
  properties: P
): Decoder<{ [K in keyof P]: InputOf<P[K]> }, { [K in keyof P]: TypeOf<P[K]> }> =>
  K.type(M)((k, e) => FS.of(DE.key(k, DE.required, e)))(properties)

/**
 * @category combinators
 * @since 2.2.7
 */
export const partial = <P extends Record<string, Decoder<any, any>>>(
  properties: P
): Decoder<{ [K in keyof P]: InputOf<P[K]> }, Partial<{ [K in keyof P]: TypeOf<P[K]> }>> =>
  K.partial(M)((k, e) => FS.of(DE.key(k, DE.optional, e)))(properties)

/**
 * @category combinators
 * @since 2.2.7
 */
export const array = <I, A>(items: Decoder<I, A>): Decoder<Array<I>, Array<A>> =>
  K.array(M)((i, e) => FS.of(DE.index(i, DE.optional, e)))(items)

/**
 * @category combinators
 * @since 2.2.7
 */
export const record = <I, A>(codomain: Decoder<I, A>): Decoder<Record<string, I>, Record<string, A>> =>
  K.record(M)((k, e) => FS.of(DE.key(k, DE.optional, e)))(codomain)

/**
 * @category combinators
 * @since 2.2.7
 */
export const tuple = <C extends ReadonlyArray<Decoder<any, any>>>(
  ...components: C
): Decoder<{ [K in keyof C]: InputOf<C[K]> }, { [K in keyof C]: TypeOf<C[K]> }> =>
  K.tuple(M)((i, e) => FS.of(DE.index(i, DE.required, e)))(...components)

/**
 * @category combinators
 * @since 2.2.7
 */
export const union: <MS extends readonly [Decoder<any, any>, ...Array<Decoder<any, any>>]>(
  ...members: MS
) => Decoder<InputOf<MS[keyof MS]>, TypeOf<MS[keyof MS]>> =
  /*#__PURE__*/
  K.union(M)((i, e) => FS.of(DE.member(i, e)))

/**
 * @category combinators
 * @since 2.2.7
 */
export const intersect: <IB, B>(right: Decoder<IB, B>) => <IA, A>(left: Decoder<IA, A>) => Decoder<IA & IB, A & B> =
  /*#__PURE__*/
  K.intersect(M)

/**
 * @category combinators
 * @since 2.2.7
 */
export const sum = <T extends string>(tag: T) => <MS extends Record<string, Decoder<any, any>>>(
  members: MS
): Decoder<InputOf<MS[keyof MS]>, TypeOf<MS[keyof MS]>> =>
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
export const lazy: <I, A>(id: string, f: () => Decoder<I, A>) => Decoder<I, A> =
  /*#__PURE__*/
  K.lazy(M)((id, e) => FS.of(DE.lazy(id, e)))

/**
 * @category combinators
 * @since 2.2.7
 */
export const compose: <A, B>(to: Decoder<A, B>) => <I>(from: Decoder<I, A>) => Decoder<I, B> =
  /*#__PURE__*/
  K.compose(M)

// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------

/**
 * @category Functor
 * @since 2.2.7
 */
export const map: <A, B>(f: (a: A) => B) => <I>(fa: Decoder<I, A>) => Decoder<I, B> =
  /*#__PURE__*/
  K.map(M)

/**
 * @category Alt
 * @since 2.2.7
 */
export const alt: <I, A>(that: () => Decoder<I, A>) => (me: Decoder<I, A>) => Decoder<I, A> =
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
