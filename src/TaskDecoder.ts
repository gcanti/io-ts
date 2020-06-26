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
import { Alt1 } from 'fp-ts/lib/Alt'
import { Functor1 } from 'fp-ts/lib/Functor'
import { pipe } from 'fp-ts/lib/pipeable'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import * as D from './Decoder'
import * as G from './Guard'
import * as KTD from './KleisliTaskDecoder'
import { Literal, Schemable1, WithRefine1, WithUnion1, WithUnknownContainers1 } from './Schemable'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 2.2.7
 */
export interface TaskDecoder<A> extends KTD.KleisliTaskDecoder<unknown, A> {}

// -------------------------------------------------------------------------------------
// DecodeError
// -------------------------------------------------------------------------------------

/**
 * @category DecodeError
 * @since 2.2.7
 */
export type DecodeError = D.DecodeError

/**
 * @category DecodeError
 * @since 2.2.7
 */
export const error: (actual: unknown, message: string) => DecodeError = D.error

/**
 * @category DecodeError
 * @since 2.2.7
 */
export const success: <A>(a: A) => TE.TaskEither<DecodeError, A> = KTD.success

/**
 * @category DecodeError
 * @since 2.2.7
 */
export const failure: <A = never>(actual: unknown, message: string) => TE.TaskEither<DecodeError, A> = KTD.failure

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 2.2.7
 */
export const fromDecoder: <A>(decoder: D.Decoder<A>) => TaskDecoder<A> = KTD.fromKleisliDecoder

/**
 * @category constructors
 * @since 2.2.7
 */
export const fromGuard = <A>(guard: G.Guard<A>, expected: string): TaskDecoder<A> =>
  KTD.fromRefinement(guard.is, expected)

/**
 * @category constructors
 * @since 2.2.7
 */
export const literal: <A extends readonly [Literal, ...Array<Literal>]>(...values: A) => TaskDecoder<A[number]> =
  KTD.literal

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * @category primitives
 * @since 2.2.7
 */
export const string: TaskDecoder<string> =
  /*#__PURE__*/
  fromDecoder(D.string)

/**
 * @category primitives
 * @since 2.2.7
 */
export const number: TaskDecoder<number> =
  /*#__PURE__*/
  fromDecoder(D.number)

/**
 * @category primitives
 * @since 2.2.7
 */
export const boolean: TaskDecoder<boolean> =
  /*#__PURE__*/
  fromDecoder(D.boolean)

/**
 * @category primitives
 * @since 2.2.7
 */
export const UnknownArray: TaskDecoder<Array<unknown>> =
  /*#__PURE__*/
  fromDecoder(D.UnknownArray)

/**
 * @category primitives
 * @since 2.2.7
 */
export const UnknownRecord: TaskDecoder<Record<string, unknown>> =
  /*#__PURE__*/
  fromDecoder(D.UnknownRecord)

/**
 * @internal
 */
export const object: TaskDecoder<object> =
  /*#__PURE__*/
  fromDecoder(D.object)

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 2.2.7
 */
export const mapLeftWithInput: (
  f: (input: unknown, e: DecodeError) => DecodeError
) => <A>(decoder: TaskDecoder<A>) => TaskDecoder<A> = KTD.mapLeftWithInput

/**
 * @category combinators
 * @since 2.2.7
 */
export const refine: <A, B extends A>(
  refinement: (a: A) => a is B,
  id: string
) => (from: TaskDecoder<A>) => TaskDecoder<B> = KTD.refine

/**
 * @category combinators
 * @since 2.2.7
 */
export const parse: <A, B>(
  parser: (a: A) => TE.TaskEither<DecodeError, B>
) => (from: TaskDecoder<A>) => TaskDecoder<B> = KTD.parse

/**
 * @category combinators
 * @since 2.2.7
 */
export const nullable: <A>(or: TaskDecoder<A>) => TaskDecoder<null | A> = KTD.nullable

/**
 * @category combinators
 * @since 2.2.7
 */
export const type = <A>(properties: { [K in keyof A]: TaskDecoder<A[K]> }): TaskDecoder<{ [K in keyof A]: A[K] }> =>
  pipe(object as any, compose(KTD.type(properties)))

/**
 * @category combinators
 * @since 2.2.7
 */
export const partial = <A>(
  properties: { [K in keyof A]: TaskDecoder<A[K]> }
): TaskDecoder<Partial<{ [K in keyof A]: A[K] }>> => pipe(object as any, compose(KTD.partial(properties)))

/**
 * @category combinators
 * @since 2.2.7
 */
export const array = <A>(items: TaskDecoder<A>): TaskDecoder<Array<A>> => pipe(UnknownArray, compose(KTD.array(items)))

/**
 * @category combinators
 * @since 2.2.7
 */
export const record = <A>(codomain: TaskDecoder<A>): TaskDecoder<Record<string, A>> =>
  pipe(UnknownRecord, compose(KTD.record(codomain)))

/**
 * @category combinators
 * @since 2.2.7
 */
export const tuple = <A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: TaskDecoder<A[K]> }
): TaskDecoder<A> => pipe(UnknownArray as any, compose(KTD.tuple(...components))) as any

/**
 * @category combinators
 * @since 2.2.7
 */
export const union: <A extends readonly [unknown, ...Array<unknown>]>(
  ...members: { [K in keyof A]: TaskDecoder<A[K]> }
) => TaskDecoder<A[number]> = KTD.union as any

/**
 * @category combinators
 * @since 2.2.7
 */
export const intersect: <B>(right: TaskDecoder<B>) => <A>(left: TaskDecoder<A>) => TaskDecoder<A & B> = KTD.intersect

/**
 * @category combinators
 * @since 2.2.7
 */
export const sum = <T extends string>(tag: T) => <A>(
  members: { [K in keyof A]: TaskDecoder<A[K]> }
): TaskDecoder<A[keyof A]> => pipe(object as any, compose(KTD.sum(tag)(members)))

/**
 * @category combinators
 * @since 2.2.7
 */
export const lazy: <A>(id: string, f: () => TaskDecoder<A>) => TaskDecoder<A> = KTD.lazy

/**
 * @category combinators
 * @since 2.2.7
 */
export const compose: <A, B>(to: KTD.KleisliTaskDecoder<A, B>) => (from: TaskDecoder<A>) => TaskDecoder<B> = KTD.compose

// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------

const map_: <A, B>(fa: TaskDecoder<A>, f: (a: A) => B) => TaskDecoder<B> = (fa, f) => pipe(fa, map(f))

const alt_: <A>(me: TaskDecoder<A>, that: () => TaskDecoder<A>) => TaskDecoder<A> = (me, that) => pipe(me, alt(that))

// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------

/**
 * @category Functor
 * @since 2.2.7
 */
export const map: <A, B>(f: (a: A) => B) => (fa: TaskDecoder<A>) => TaskDecoder<B> = KTD.map

/**
 * @category Alt
 * @since 2.2.7
 */
export const alt: <A>(that: () => TaskDecoder<A>) => (me: TaskDecoder<A>) => TaskDecoder<A> = KTD.alt

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 2.2.7
 */
export const URI = 'io-ts/TaskDecoder'

/**
 * @category instances
 * @since 2.2.7
 */
export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly [URI]: TaskDecoder<A>
  }
}

/**
 * @category instances
 * @since 2.2.7
 */
export const functorTaskDecoder: Functor1<URI> = {
  URI,
  map: map_
}

/**
 * @category instances
 * @since 2.2.7
 */
export const altTaskDecoder: Alt1<URI> = {
  URI,
  map: map_,
  alt: alt_
}

/**
 * @category instances
 * @since 2.2.7
 */
export const schemableTaskDecoder: Schemable1<URI> &
  WithUnknownContainers1<URI> &
  WithUnion1<URI> &
  WithRefine1<URI> = {
  URI,
  literal,
  string,
  number,
  boolean,
  nullable,
  type,
  partial,
  record,
  array,
  tuple: tuple as Schemable1<URI>['tuple'],
  intersect,
  sum,
  lazy,
  UnknownArray,
  UnknownRecord,
  union: union as WithUnion1<URI>['union'],
  refine: refine as WithRefine1<URI>['refine']
}

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.7
 */
export type TypeOf<TD> = KTD.TypeOf<TD>

/**
 * @since 2.2.7
 */
export const draw: (e: DecodeError) => string = D.draw

/**
 * @internal
 */
export const stringify: <A>(e: TE.TaskEither<DecodeError, A>) => T.Task<string> = TE.fold(
  (e) => T.of(draw(e)),
  (a) => T.of(JSON.stringify(a, null, 2))
)
