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
import { pipe } from 'fp-ts/lib/pipeable'
import * as DE from './DecodeError'
import * as FS from './FreeSemigroup'
import * as G from './Guard'
import * as D from './Decoder'
import { Literal, Schemable1, WithRefine1, WithUnion1, WithUnknownContainers1 } from './Schemable'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 2.2.7
 */
export interface UnknownDecoder<A> extends D.Decoder<unknown, A> {}

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
export const success: <A>(a: A) => E.Either<DecodeError, A> = D.success

/**
 * @category DecodeError
 * @since 2.2.7
 */
export const failure: <A = never>(actual: unknown, message: string) => E.Either<DecodeError, A> = D.failure

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 2.2.7
 */
export const fromGuard = <A>(guard: G.Guard<A>, expected: string): UnknownDecoder<A> =>
  D.fromRefinement(guard.is, expected)

/**
 * @category constructors
 * @since 2.2.7
 */
export const literal: <A extends readonly [Literal, ...Array<Literal>]>(...values: A) => UnknownDecoder<A[number]> =
  D.literal

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * @category primitives
 * @since 2.2.7
 */
export const string: UnknownDecoder<string> =
  /*#__PURE__*/
  fromGuard(G.string, 'string')

/**
 * @category primitives
 * @since 2.2.7
 */
export const number: UnknownDecoder<number> =
  /*#__PURE__*/
  fromGuard(G.number, 'number')

/**
 * @category primitives
 * @since 2.2.7
 */
export const boolean: UnknownDecoder<boolean> =
  /*#__PURE__*/
  fromGuard(G.boolean, 'boolean')

/**
 * @category primitives
 * @since 2.2.7
 */
export const UnknownArray: UnknownDecoder<Array<unknown>> =
  /*#__PURE__*/
  fromGuard(G.UnknownArray, 'Array<unknown>')

/**
 * @category primitives
 * @since 2.2.7
 */
export const UnknownRecord: UnknownDecoder<Record<string, unknown>> =
  /*#__PURE__*/
  fromGuard(G.UnknownRecord, 'Record<string, unknown>')

/**
 * @internal
 */
export const object: UnknownDecoder<object> =
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
) => <A>(decoder: UnknownDecoder<A>) => UnknownDecoder<A> = D.mapLeftWithInput

/**
 * @category combinators
 * @since 2.2.7
 */
export const refine: <A, B extends A>(
  refinement: (a: A) => a is B,
  id: string
) => (from: UnknownDecoder<A>) => UnknownDecoder<B> = D.refine

/**
 * @category combinators
 * @since 2.2.7
 */
export const parse: <A, B>(
  parser: (a: A) => E.Either<DecodeError, B>
) => (from: UnknownDecoder<A>) => UnknownDecoder<B> = D.parse

/**
 * @category combinators
 * @since 2.2.7
 */
export const nullable: <A>(or: UnknownDecoder<A>) => UnknownDecoder<null | A> = D.nullable

/**
 * @category combinators
 * @since 2.2.7
 */
export const type = <A>(
  properties: { [K in keyof A]: UnknownDecoder<A[K]> }
): UnknownDecoder<{ [K in keyof A]: A[K] }> => pipe(object as any, compose(D.type(properties)))

/**
 * @category combinators
 * @since 2.2.7
 */
export const partial = <A>(
  properties: { [K in keyof A]: UnknownDecoder<A[K]> }
): UnknownDecoder<Partial<{ [K in keyof A]: A[K] }>> => pipe(object as any, compose(D.partial(properties)))

/**
 * @category combinators
 * @since 2.2.7
 */
export const array = <A>(items: UnknownDecoder<A>): UnknownDecoder<Array<A>> =>
  pipe(UnknownArray, compose(D.array(items)))

/**
 * @category combinators
 * @since 2.2.7
 */
export const record = <A>(codomain: UnknownDecoder<A>): UnknownDecoder<Record<string, A>> =>
  pipe(UnknownRecord, compose(D.record(codomain)))

/**
 * @category combinators
 * @since 2.2.7
 */
export const tuple = <A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: UnknownDecoder<A[K]> }
): UnknownDecoder<A> => pipe(UnknownArray as any, compose(D.tuple(...components))) as any

/**
 * @category combinators
 * @since 2.2.7
 */
export const union: <A extends readonly [unknown, ...Array<unknown>]>(
  ...members: { [K in keyof A]: UnknownDecoder<A[K]> }
) => UnknownDecoder<A[number]> = D.union as any

/**
 * @category combinators
 * @since 2.2.7
 */
export const intersect: <B>(right: UnknownDecoder<B>) => <A>(left: UnknownDecoder<A>) => UnknownDecoder<A & B> =
  D.intersect

/**
 * @category combinators
 * @since 2.2.7
 */
export const sum = <T extends string>(tag: T) => <A>(
  members: { [K in keyof A]: UnknownDecoder<A[K]> }
): UnknownDecoder<A[keyof A]> => pipe(object as any, compose(D.sum(tag)(members)))

/**
 * @category combinators
 * @since 2.2.7
 */
export const lazy: <A>(id: string, f: () => UnknownDecoder<A>) => UnknownDecoder<A> = D.lazy

/**
 * @category combinators
 * @since 2.2.7
 */
export const compose: <A, B>(to: D.Decoder<A, B>) => (from: UnknownDecoder<A>) => UnknownDecoder<B> = D.compose

// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------

const map_: <A, B>(fa: UnknownDecoder<A>, f: (a: A) => B) => UnknownDecoder<B> = (fa, f) => pipe(fa, map(f))

const alt_: <A>(me: UnknownDecoder<A>, that: () => UnknownDecoder<A>) => UnknownDecoder<A> = (me, that) =>
  pipe(me, alt(that))

// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------

/**
 * @category Functor
 * @since 2.2.7
 */
export const map: <A, B>(f: (a: A) => B) => (fa: UnknownDecoder<A>) => UnknownDecoder<B> = D.map

/**
 * @category Alt
 * @since 2.2.7
 */
export const alt: <A>(that: () => UnknownDecoder<A>) => (me: UnknownDecoder<A>) => UnknownDecoder<A> = D.alt

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 2.2.7
 */
export const URI = 'io-ts/UnknownDecoder'

/**
 * @category instances
 * @since 2.2.7
 */
export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly [URI]: UnknownDecoder<A>
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
export type TypeOf<D> = D.TypeOf<D>

interface Tree<A> {
  readonly value: A
  readonly forest: ReadonlyArray<Tree<A>>
}

const empty: Array<never> = []

const make = <A>(value: A, forest: ReadonlyArray<Tree<A>> = empty): Tree<A> => ({
  value,
  forest
})

const drawTree = (tree: Tree<string>): string => tree.value + drawForest('\n', tree.forest)

const drawForest = (indentation: string, forest: ReadonlyArray<Tree<string>>): string => {
  let r: string = ''
  const len = forest.length
  let tree: Tree<string>
  for (let i = 0; i < len; i++) {
    tree = forest[i]
    const isLast = i === len - 1
    r += indentation + (isLast ? '└' : '├') + '─ ' + tree.value
    r += drawForest(indentation + (len > 1 && !isLast ? '│  ' : '   '), tree.forest)
  }
  return r
}

const toTree: (e: DE.DecodeError<string>) => Tree<string> = DE.fold({
  Leaf: (input, error) => make(`cannot decode ${JSON.stringify(input)}, should be ${error}`),
  Key: (key, kind, errors) => make(`${kind} property ${JSON.stringify(key)}`, toForest(errors)),
  Index: (index, kind, errors) => make(`${kind} index ${index}`, toForest(errors)),
  Member: (index, errors) => make(`member ${index}`, toForest(errors)),
  Lazy: (id, errors) => make(`lazy type ${id}`, toForest(errors))
})

const toForest: (e: DecodeError) => ReadonlyArray<Tree<string>> = FS.fold(
  (value) => [toTree(value)],
  (left, right) => toForest(left).concat(toForest(right))
)

/**
 * @since 2.2.7
 */
export const draw = (e: DecodeError): string => toForest(e).map(drawTree).join('\n')

/**
 * @internal
 */
export const stringify: <A>(e: E.Either<DecodeError, A>) => string =
  /*#__PURE__*/
  E.fold(draw, (a) => JSON.stringify(a, null, 2))
