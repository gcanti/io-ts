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
import * as E from 'fp-ts/lib/Either'
import { Functor1 } from 'fp-ts/lib/Functor'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import { pipe } from 'fp-ts/lib/pipeable'
import * as T from 'fp-ts/lib/Tree'
import * as DE from './DecodeError'
import * as FS from './FreeSemigroup'
import * as G from './Guard'
import * as KD from './KleisliDecoder'
import { Literal, Schemable1, WithRefine1, WithUnion1, WithUnknownContainers1 } from './Schemable'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 2.2.7
 */
export interface Decoder<A> extends KD.KleisliDecoder<unknown, A> {}

// -------------------------------------------------------------------------------------
// DecodeError
// -------------------------------------------------------------------------------------

/**
 * @category DecodeError
 * @since 2.2.7
 */
export type DecodeError = KD.DecodeError

/**
 * @category DecodeError
 * @since 2.2.7
 */
export const error: (actual: unknown, message: string) => DecodeError = KD.error

/**
 * @category DecodeError
 * @since 2.2.7
 */
export const success: <A>(a: A) => E.Either<DecodeError, A> = KD.success

/**
 * @category DecodeError
 * @since 2.2.7
 */
export const failure: <A = never>(actual: unknown, message: string) => E.Either<DecodeError, A> = KD.failure

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 2.2.7
 */
export const fromGuard = <A>(guard: G.Guard<A>, expected: string): Decoder<A> => KD.fromRefinement(guard.is, expected)

/**
 * @category constructors
 * @since 2.2.7
 */
export const literal: <A extends readonly [Literal, ...Array<Literal>]>(...values: A) => Decoder<A[number]> = KD.literal

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * @category primitives
 * @since 2.2.7
 */
export const string: Decoder<string> =
  /*#__PURE__*/
  fromGuard(G.string, 'string')

/**
 * @category primitives
 * @since 2.2.7
 */
export const number: Decoder<number> =
  /*#__PURE__*/
  fromGuard(G.number, 'number')

/**
 * @category primitives
 * @since 2.2.7
 */
export const boolean: Decoder<boolean> =
  /*#__PURE__*/
  fromGuard(G.boolean, 'boolean')

/**
 * @category primitives
 * @since 2.2.7
 */
export const UnknownArray: Decoder<Array<unknown>> =
  /*#__PURE__*/
  fromGuard(G.UnknownArray, 'Array<unknown>')

/**
 * @category primitives
 * @since 2.2.7
 */
export const UnknownRecord: Decoder<Record<string, unknown>> =
  /*#__PURE__*/
  fromGuard(G.UnknownRecord, 'Record<string, unknown>')

/**
 * @internal
 */
export const object: Decoder<object> =
  /*#__PURE__*/
  fromGuard(G.object, 'object')

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 2.2.7
 */
export const mapLeftWithInput: (
  f: (input: unknown, e: DecodeError) => DecodeError
) => <A>(decoder: Decoder<A>) => Decoder<A> = KD.mapLeftWithInput

/**
 * @category combinators
 * @since 2.2.7
 */
export const refine: <A, B extends A>(refinement: (a: A) => a is B, id: string) => (from: Decoder<A>) => Decoder<B> =
  KD.refine

/**
 * @category combinators
 * @since 2.2.7
 */
export const parse: <A, B>(parser: (a: A) => E.Either<DecodeError, B>) => (from: Decoder<A>) => Decoder<B> = KD.parse

/**
 * @category combinators
 * @since 2.2.7
 */
export const nullable: <A>(or: Decoder<A>) => Decoder<null | A> = KD.nullable

/**
 * @category combinators
 * @since 2.2.7
 */
export const type = <A>(properties: { [K in keyof A]: Decoder<A[K]> }): Decoder<{ [K in keyof A]: A[K] }> =>
  pipe(object as any, compose(KD.type(properties)))

/**
 * @category combinators
 * @since 2.2.7
 */
export const partial = <A>(properties: { [K in keyof A]: Decoder<A[K]> }): Decoder<Partial<{ [K in keyof A]: A[K] }>> =>
  pipe(object as any, compose(KD.partial(properties)))

/**
 * @category combinators
 * @since 2.2.7
 */
export const array = <A>(items: Decoder<A>): Decoder<Array<A>> => pipe(UnknownArray, compose(KD.array(items)))

/**
 * @category combinators
 * @since 2.2.7
 */
export const record = <A>(codomain: Decoder<A>): Decoder<Record<string, A>> =>
  pipe(UnknownRecord, compose(KD.record(codomain)))

/**
 * @category combinators
 * @since 2.2.7
 */
export const tuple = <A extends ReadonlyArray<unknown>>(...components: { [K in keyof A]: Decoder<A[K]> }): Decoder<A> =>
  pipe(UnknownArray as any, compose(KD.tuple(...components))) as any

/**
 * @category combinators
 * @since 2.2.7
 */
export const union: <A extends readonly [unknown, ...Array<unknown>]>(
  ...members: { [K in keyof A]: Decoder<A[K]> }
) => Decoder<A[number]> = KD.union as any

/**
 * @category combinators
 * @since 2.2.7
 */
export const intersect: <B>(right: Decoder<B>) => <A>(left: Decoder<A>) => Decoder<A & B> = KD.intersect

/**
 * @category combinators
 * @since 2.2.7
 */
export const sum = <T extends string>(tag: T) => <A>(members: { [K in keyof A]: Decoder<A[K]> }): Decoder<A[keyof A]> =>
  pipe(object as any, compose(KD.sum(tag)(members)))

/**
 * @category combinators
 * @since 2.2.7
 */
export const lazy: <A>(id: string, f: () => Decoder<A>) => Decoder<A> = KD.lazy

/**
 * @category combinators
 * @since 2.2.7
 */
export const compose: <A, B>(to: KD.KleisliDecoder<A, B>) => (from: Decoder<A>) => Decoder<B> = KD.compose

// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------

const map_: <A, B>(fa: Decoder<A>, f: (a: A) => B) => Decoder<B> = (fa, f) => pipe(fa, map(f))

const alt_: <A>(me: Decoder<A>, that: () => Decoder<A>) => Decoder<A> = (me, that) => pipe(me, alt(that))

// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------

/**
 * @category Functor
 * @since 2.2.7
 */
export const map: <A, B>(f: (a: A) => B) => (fa: Decoder<A>) => Decoder<B> = KD.map

/**
 * @category Alt
 * @since 2.2.7
 */
export const alt: <A>(that: () => Decoder<A>) => (me: Decoder<A>) => Decoder<A> = KD.alt

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 2.2.7
 */
export const URI = 'io-ts/Decoder'

/**
 * @category instances
 * @since 2.2.7
 */
export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly [URI]: Decoder<A>
  }
}

/**
 * @category instances
 * @since 2.2.7
 */
export const functorDecoder: Functor1<URI> = {
  URI,
  map: map_
}

/**
 * @category instances
 * @since 2.2.7
 */
export const altDecoder: Alt1<URI> = {
  URI,
  map: map_,
  alt: alt_
}

/**
 * @category instances
 * @since 2.2.7
 */
export const schemableDecoder: Schemable1<URI> & WithUnknownContainers1<URI> & WithUnion1<URI> & WithRefine1<URI> = {
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
export type TypeOf<D> = KD.TypeOf<D>

const toForest = (e: DecodeError): NEA.NonEmptyArray<T.Tree<string>> => {
  const toTree: (e: DE.DecodeError<string>) => T.Tree<string> = DE.fold({
    Leaf: (input, error) => T.make(`cannot decode ${JSON.stringify(input)}, should be ${error}`),
    Key: (key, kind, errors) => T.make(`${kind} property ${JSON.stringify(key)}`, toForest(errors)),
    Index: (index, kind, errors) => T.make(`${kind} index ${index}`, toForest(errors)),
    Member: (index, errors) => T.make(`member ${index}`, toForest(errors)),
    Lazy: (id, errors) => T.make(`lazy type ${id}`, toForest(errors))
  })
  const toForest: (f: DecodeError) => NEA.NonEmptyArray<T.Tree<string>> = FS.fold(
    (value) => [toTree(value)],
    (left, right) => NEA.concat(toForest(left), toForest(right))
  )
  return toForest(e)
}

/**
 * @since 2.2.7
 */
export const draw = (e: DecodeError): string => toForest(e).map(T.drawTree).join('\n')

/**
 * @internal
 */
export const stringify: <A>(e: E.Either<DecodeError, A>) => string = E.fold(
  (e) => draw(e),
  (a) => JSON.stringify(a, null, 2)
)
