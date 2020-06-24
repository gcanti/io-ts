/**
 * @since 2.2.7
 */
import { Alt2C } from 'fp-ts/lib/Alt'
import { Applicative2C } from 'fp-ts/lib/Applicative'
import { Apply2C } from 'fp-ts/lib/Apply'
import { Bifunctor2 } from 'fp-ts/lib/Bifunctor'
import { Kind2, URIS2 } from 'fp-ts/lib/HKT'
import { Monad2C } from 'fp-ts/lib/Monad'
import { MonadThrow2C } from 'fp-ts/lib/MonadThrow'
import * as G from './Guard'
import * as K from './Kleisli'
import { Literal } from './Schemable'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 2.2.7
 */
export interface DecoderT<M extends URIS2, E, A> extends K.Kleisli<M, unknown, E, A> {}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 2.2.7
 */
export const fromGuard: <M extends URIS2, E>(
  M: MonadThrow2C<M, E>
) => <A>(guard: G.Guard<A>, onError: (u: unknown) => E) => DecoderT<M, E, A> = K.fromGuard

/**
 * @category constructors
 * @since 2.2.7
 */
export const literal: <M extends URIS2, E>(
  M: MonadThrow2C<M, E>
) => (
  onError: (u: unknown, values: readonly [Literal, ...Array<Literal>]) => E
) => <A extends readonly [Literal, ...Array<Literal>]>(...values: A) => DecoderT<M, E, A[number]> = K.literal

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 2.2.7
 */
export const withExpected: <M extends URIS2>(
  M: Bifunctor2<M>
) => <E, A>(decoder: DecoderT<M, E, A>, expected: (u: unknown, e: E) => E) => DecoderT<M, E, A> = K.withExpected

/**
 * @category combinators
 * @since 2.2.7
 */
export const refine: <M extends URIS2, E>(
  M: MonadThrow2C<M, E> & Bifunctor2<M>
) => <A, B extends A>(
  refinement: (a: A) => a is B,
  onError: (a: A) => E
) => (from: DecoderT<M, E, A>) => DecoderT<M, E, B> = K.refine

/**
 * @category combinators
 * @since 2.2.7
 */
export const parse: <M extends URIS2, E>(
  M: Monad2C<M, E>
) => <A, B>(parser: (a: A) => Kind2<M, E, B>) => (from: DecoderT<M, E, A>) => DecoderT<M, E, B> = K.parse

/**
 * @category combinators
 * @since 2.2.7
 */
export const nullable: <M extends URIS2, E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
) => (onError: (u: unknown, e: E) => E) => <A>(or: DecoderT<M, E, A>) => DecoderT<M, E, null | A> = K.nullable

/**
 * @category combinators
 * @since 2.2.7
 */
export const type = <M extends URIS2, E>(M: Monad2C<M, E> & Bifunctor2<M>) => (
  UnknownRecord: DecoderT<M, E, Record<string, unknown>>,
  onKeyError: (key: string, e: E) => E
) => <A>(properties: { [K in keyof A]: DecoderT<M, E, A[K]> }): DecoderT<M, E, { [K in keyof A]: A[K] }> =>
  K.pipe(M)(UnknownRecord, K.type(M)(onKeyError)(properties))

/**
 * @category combinators
 * @since 2.2.7
 */
export const partial = <M extends URIS2, E>(M: Monad2C<M, E> & Bifunctor2<M>) => (
  UnknownRecord: DecoderT<M, E, Record<string, unknown>>,
  onKeyError: (key: string, e: E) => E
) => <A>(properties: { [K in keyof A]: DecoderT<M, E, A[K]> }): DecoderT<M, E, Partial<{ [K in keyof A]: A[K] }>> =>
  K.pipe(M)(UnknownRecord, K.partial(M)(onKeyError)(properties))

/**
 * @category combinators
 * @since 2.2.7
 */
export const array = <M extends URIS2, E>(M: Monad2C<M, E> & Bifunctor2<M>) => (
  UnknownArray: DecoderT<M, E, Array<unknown>>,
  onItemError: (index: number, e: E) => E
) => <A>(items: DecoderT<M, E, A>): DecoderT<M, E, Array<A>> => K.pipe(M)(UnknownArray, K.array(M)(onItemError)(items))

/**
 * @category combinators
 * @since 2.2.7
 */
export const record = <M extends URIS2, E>(M: Monad2C<M, E> & Bifunctor2<M>) => (
  UnknownRecord: DecoderT<M, E, Record<string, unknown>>,
  onKeyError: (key: string, e: E) => E
) => <A>(codomain: DecoderT<M, E, A>): DecoderT<M, E, Record<string, A>> =>
  K.pipe(M)(UnknownRecord, K.record(M)(onKeyError)(codomain))

/**
 * @category combinators
 * @since 2.2.7
 */
export const tuple = <M extends URIS2, E>(M: Monad2C<M, E> & Bifunctor2<M>) => (
  UnknownArray: DecoderT<M, E, Array<unknown>>,
  onIndexError: (index: number, e: E) => E
) => <A extends ReadonlyArray<unknown>>(...components: { [K in keyof A]: DecoderT<M, E, A[K]> }): DecoderT<M, E, A> =>
  K.pipe(M)(UnknownArray, K.tuple(M)(onIndexError)(...components)) as any

/**
 * @category combinators
 * @since 2.2.7
 */
export const union: <M extends URIS2, E>(
  M: Alt2C<M, E> & Bifunctor2<M>
) => (
  onMemberError: (index: number, e: E) => E
) => <A extends readonly [unknown, ...Array<unknown>]>(
  ...members: { [K in keyof A]: DecoderT<M, E, A[K]> }
) => DecoderT<M, E, A[number]> = K.union as any

/**
 * @category combinators
 * @since 2.2.7
 */
export const intersect: <M extends URIS2, E>(
  M: Apply2C<M, E>
) => <B>(right: DecoderT<M, E, B>) => <A>(left: DecoderT<M, E, A>) => DecoderT<M, E, A & B> = K.intersect

/**
 * @category combinators
 * @since 2.2.7
 */
export const sum = <M extends URIS2, E>(M: MonadThrow2C<M, E>) => (
  UnknownRecord: DecoderT<M, E, Record<string, unknown>>,
  onTagError: (tag: string, value: unknown, tags: ReadonlyArray<string>) => E
) => <T extends string>(tag: T) => <A>(members: { [K in keyof A]: DecoderT<M, E, A[K]> }): DecoderT<M, E, A[keyof A]> =>
  K.pipe(M)(UnknownRecord, K.sum(M)(onTagError)(tag)(members))

/**
 * @category combinators
 * @since 2.2.7
 */
export const lazy: <M extends URIS2>(
  M: Bifunctor2<M>
) => <E>(onError: (id: string, e: E) => E) => <A>(id: string, f: () => DecoderT<M, E, A>) => DecoderT<M, E, A> = K.lazy
