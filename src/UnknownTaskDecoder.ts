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
import { Literal, Schemable1, WithRefine1, WithUnion1, WithUnknownContainers1 } from './Schemable'
import * as KTD from './TaskDecoder'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 2.2.7
 */
export interface UnknownTaskDecoder<A> extends KTD.TaskDecoder<unknown, A> {}

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
export const fromDecoder: <A>(decoder: D.Decoder<unknown, A>) => UnknownTaskDecoder<A> = KTD.fromDecoder

/**
 * @category constructors
 * @since 2.2.7
 */
export const fromGuard = <A>(guard: G.Guard<A>, expected: string): UnknownTaskDecoder<A> =>
  KTD.fromRefinement(guard.is, expected)

/**
 * @category constructors
 * @since 2.2.7
 */
export const literal: <A extends readonly [Literal, ...Array<Literal>]>(...values: A) => UnknownTaskDecoder<A[number]> =
  KTD.literal

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * @category primitives
 * @since 2.2.7
 */
export const string: UnknownTaskDecoder<string> =
  /*#__PURE__*/
  fromDecoder(D.string)

/**
 * @category primitives
 * @since 2.2.7
 */
export const number: UnknownTaskDecoder<number> =
  /*#__PURE__*/
  fromDecoder(D.number)

/**
 * @category primitives
 * @since 2.2.7
 */
export const boolean: UnknownTaskDecoder<boolean> =
  /*#__PURE__*/
  fromDecoder(D.boolean)

/**
 * @category primitives
 * @since 2.2.7
 */
export const UnknownArray: UnknownTaskDecoder<Array<unknown>> =
  /*#__PURE__*/
  fromDecoder(D.UnknownArray)

/**
 * @category primitives
 * @since 2.2.7
 */
export const UnknownRecord: UnknownTaskDecoder<Record<string, unknown>> =
  /*#__PURE__*/
  fromDecoder(D.UnknownRecord)

/**
 * @internal
 */
export const object: UnknownTaskDecoder<object> =
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
) => <A>(decoder: UnknownTaskDecoder<A>) => UnknownTaskDecoder<A> = KTD.mapLeftWithInput

/**
 * @category combinators
 * @since 2.2.7
 */
export const refine: <A, B extends A>(
  refinement: (a: A) => a is B,
  id: string
) => (from: UnknownTaskDecoder<A>) => UnknownTaskDecoder<B> = KTD.refine

/**
 * @category combinators
 * @since 2.2.7
 */
export const parse: <A, B>(
  parser: (a: A) => TE.TaskEither<DecodeError, B>
) => (from: UnknownTaskDecoder<A>) => UnknownTaskDecoder<B> = KTD.parse

/**
 * @category combinators
 * @since 2.2.7
 */
export const nullable: <A>(or: UnknownTaskDecoder<A>) => UnknownTaskDecoder<null | A> = KTD.nullable

/**
 * @category combinators
 * @since 2.2.7
 */
export const type = <A>(
  properties: { [K in keyof A]: UnknownTaskDecoder<A[K]> }
): UnknownTaskDecoder<{ [K in keyof A]: A[K] }> => pipe(object as any, compose(KTD.ktype(properties)))

/**
 * @category combinators
 * @since 2.2.7
 */
export const partial = <A>(
  properties: { [K in keyof A]: UnknownTaskDecoder<A[K]> }
): UnknownTaskDecoder<Partial<{ [K in keyof A]: A[K] }>> => pipe(object as any, compose(KTD.kpartial(properties)))

/**
 * @category combinators
 * @since 2.2.7
 */
export const array = <A>(items: UnknownTaskDecoder<A>): UnknownTaskDecoder<Array<A>> =>
  pipe(UnknownArray, compose(KTD.karray(items)))

/**
 * @category combinators
 * @since 2.2.7
 */
export const record = <A>(codomain: UnknownTaskDecoder<A>): UnknownTaskDecoder<Record<string, A>> =>
  pipe(UnknownRecord, compose(KTD.krecord(codomain)))

/**
 * @category combinators
 * @since 2.2.7
 */
export const tuple = <A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: UnknownTaskDecoder<A[K]> }
): UnknownTaskDecoder<A> => pipe(UnknownArray as any, compose(KTD.ktuple(...components))) as any

/**
 * @category combinators
 * @since 2.2.7
 */
export const union: <A extends readonly [unknown, ...Array<unknown>]>(
  ...members: { [K in keyof A]: UnknownTaskDecoder<A[K]> }
) => UnknownTaskDecoder<A[number]> = KTD.union as any

/**
 * @category combinators
 * @since 2.2.7
 */
export const intersect: <B>(
  right: UnknownTaskDecoder<B>
) => <A>(left: UnknownTaskDecoder<A>) => UnknownTaskDecoder<A & B> = KTD.intersect

/**
 * @category combinators
 * @since 2.2.7
 */
export const sum = <T extends string>(tag: T) => <A>(
  members: { [K in keyof A]: UnknownTaskDecoder<A[K]> }
): UnknownTaskDecoder<A[keyof A]> => pipe(object as any, compose(KTD.ksum(tag)(members)))

/**
 * @category combinators
 * @since 2.2.7
 */
export const lazy: <A>(id: string, f: () => UnknownTaskDecoder<A>) => UnknownTaskDecoder<A> = KTD.lazy

/**
 * @category combinators
 * @since 2.2.7
 */
export const compose: <A, B>(to: KTD.TaskDecoder<A, B>) => (from: UnknownTaskDecoder<A>) => UnknownTaskDecoder<B> =
  KTD.compose

// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------

const map_: <A, B>(fa: UnknownTaskDecoder<A>, f: (a: A) => B) => UnknownTaskDecoder<B> = (fa, f) => pipe(fa, map(f))

const alt_: <A>(me: UnknownTaskDecoder<A>, that: () => UnknownTaskDecoder<A>) => UnknownTaskDecoder<A> = (me, that) =>
  pipe(me, alt(that))

// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------

/**
 * @category Functor
 * @since 2.2.7
 */
export const map: <A, B>(f: (a: A) => B) => (fa: UnknownTaskDecoder<A>) => UnknownTaskDecoder<B> = KTD.map

/**
 * @category Alt
 * @since 2.2.7
 */
export const alt: <A>(that: () => UnknownTaskDecoder<A>) => (me: UnknownTaskDecoder<A>) => UnknownTaskDecoder<A> =
  KTD.alt

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 2.2.7
 */
export const URI = 'io-ts/UnknownTaskDecoder'

/**
 * @category instances
 * @since 2.2.7
 */
export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly [URI]: UnknownTaskDecoder<A>
  }
}

/**
 * @category instances
 * @since 2.2.7
 */
export const Functor: Functor1<URI> = {
  URI,
  map: map_
}

/**
 * @category instances
 * @since 2.2.7
 */
export const Alt: Alt1<URI> = {
  URI,
  map: map_,
  alt: alt_
}

/**
 * @category instances
 * @since 2.2.7
 */
export const Schemable: Schemable1<URI> & WithUnknownContainers1<URI> & WithUnion1<URI> & WithRefine1<URI> = {
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
