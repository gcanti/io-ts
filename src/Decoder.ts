/**
 * **This module is experimental**
 *
 * Experimental features are published in order to get early feedback from the community, see these tracking
 * [issues](https://github.com/gcanti/io-ts/issues?q=label%3Av2.2+) for further discussions and enhancements.
 *
 * A feature tagged as _Experimental_ is in a high state of flux, you're at risk of it changing without notice.
 *
 * @since 2.2.8
 */
import { Alt2, Alt2C } from 'fp-ts/lib/Alt'
import { Bifunctor2 } from 'fp-ts/lib/Bifunctor'
import { Category2 } from 'fp-ts/lib/Category'
import * as E from 'fp-ts/lib/Either'
import { Refinement } from 'fp-ts/lib/function'
import { Functor2 } from 'fp-ts/lib/Functor'
import { MonadThrow2C } from 'fp-ts/lib/MonadThrow'
import { pipe } from 'fp-ts/lib/pipeable'
import * as DE from './DecodeError'
import * as FS from './FreeSemigroup'
import * as G from './Guard'
import * as K from './Kleisli'
import * as S from './Schemable'

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
 * @since 2.2.8
 */
export interface Decoder<I, A> extends K.Kleisli<E.URI, I, DecodeError, A> {}

// -------------------------------------------------------------------------------------
// DecodeError
// -------------------------------------------------------------------------------------

/**
 * @category DecodeError
 * @since 2.2.8
 */
export type DecodeError = FS.FreeSemigroup<DE.DecodeError<string>>

/**
 * @category DecodeError
 * @since 2.2.8
 */
export const error = (actual: unknown, message: string): DecodeError => FS.of(DE.leaf(actual, message))

/**
 * @category DecodeError
 * @since 2.2.8
 */
export const success: <A>(a: A) => E.Either<DecodeError, A> = E.right

/**
 * @category DecodeError
 * @since 2.2.8
 */
export const failure = <A = never>(actual: unknown, message: string): E.Either<DecodeError, A> =>
  E.left(error(actual, message))

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 2.2.8
 */
export const fromRefinement = <I, A extends I>(refinement: Refinement<I, A>, expected: string): Decoder<I, A> =>
  K.fromRefinement(M)(refinement, (u) => error(u, expected))

/**
 * @category constructors
 * @since 2.2.8
 */
export const fromGuard = <A>(guard: G.Guard<A>, expected: string): Decoder<unknown, A> =>
  fromRefinement(guard.is, expected)

/**
 * @category constructors
 * @since 2.2.8
 */
export const literal: <A extends readonly [S.Literal, ...Array<S.Literal>]>(
  ...values: A
) => Decoder<unknown, A[number]> =
  /*#__PURE__*/
  K.literal(M)((u, values) => error(u, values.map((value) => JSON.stringify(value)).join(' | ')))

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * @category primitives
 * @since 2.2.8
 */
export const string: Decoder<unknown, string> =
  /*#__PURE__*/
  fromGuard(G.string, 'string')

/**
 * @category primitives
 * @since 2.2.8
 */
export const number: Decoder<unknown, number> =
  /*#__PURE__*/
  fromGuard(G.number, 'number')

/**
 * @category primitives
 * @since 2.2.8
 */
export const boolean: Decoder<unknown, boolean> =
  /*#__PURE__*/
  fromGuard(G.boolean, 'boolean')

/**
 * @category primitives
 * @since 2.2.8
 */
export const UnknownArray: Decoder<unknown, Array<unknown>> =
  /*#__PURE__*/
  fromGuard(G.UnknownArray, 'Array<unknown>')

/**
 * @category primitives
 * @since 2.2.8
 */
export const UnknownRecord: Decoder<unknown, Record<string, unknown>> =
  /*#__PURE__*/
  fromGuard(G.UnknownRecord, 'Record<string, unknown>')

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 2.2.8
 */
export const mapLeftWithInput: <I>(
  f: (input: I, e: DecodeError) => DecodeError
) => <A>(decoder: Decoder<I, A>) => Decoder<I, A> =
  /*#__PURE__*/
  K.mapLeftWithInput(M)

/**
 * @category combinators
 * @since 2.2.8
 */
export const refine = <A, B extends A>(
  refinement: (a: A) => a is B,
  id: string
): (<I>(from: Decoder<I, A>) => Decoder<I, B>) => K.refine(M)(refinement, (a) => error(a, id))

/**
 * @category combinators
 * @since 2.2.8
 */
export const parse: <A, B>(parser: (a: A) => E.Either<DecodeError, B>) => <I>(from: Decoder<I, A>) => Decoder<I, B> =
  /*#__PURE__*/
  K.parse(M)

/**
 * @category combinators
 * @since 2.2.8
 */
export const nullable: <I, A>(or: Decoder<I, A>) => Decoder<null | I, null | A> =
  /*#__PURE__*/
  K.nullable(M)((u, e) => FS.concat(FS.of(DE.member(0, error(u, 'null'))), FS.of(DE.member(1, e))))

/**
 * @category combinators
 * @since 2.2.8
 */
export const composeType: <I, A>(
  properties: { [K in keyof A]: Decoder<I, A[K]> }
) => <H>(decoder: Decoder<H, Record<string, I>>) => Decoder<H, { [K in keyof A]: A[K] }> =
  /*#__PURE__*/
  K.composeType(M)((k, e) => FS.of(DE.key(k, DE.required, e)))

/**
 * @category combinators
 * @since 2.2.8
 */
export const type = <A>(
  properties: { [K in keyof A]: Decoder<unknown, A[K]> }
): Decoder<unknown, { [K in keyof A]: A[K] }> => pipe(UnknownRecord, composeType(properties))

/**
 * @category combinators
 * @since 2.2.8
 */
export const composePartial: <I, A>(
  properties: { [K in keyof A]: Decoder<I, A[K]> }
) => <H>(decoder: Decoder<H, Record<string, I>>) => Decoder<H, Partial<{ [K in keyof A]: A[K] }>> =
  /*#__PURE__*/
  K.composePartial(M)((k, e) => FS.of(DE.key(k, DE.optional, e)))

/**
 * @category combinators
 * @since 2.2.8
 */
export const partial = <A>(
  properties: { [K in keyof A]: Decoder<unknown, A[K]> }
): Decoder<unknown, Partial<{ [K in keyof A]: A[K] }>> => pipe(UnknownRecord, composePartial(properties))

/**
 * @category combinators
 * @since 2.2.8
 */
export const composeArray: <I, A>(item: Decoder<I, A>) => <H>(decoder: Decoder<H, Array<I>>) => Decoder<H, Array<A>> =
  /*#__PURE__*/
  K.composeArray(M)((i, e) => FS.of(DE.index(i, DE.optional, e)))

/**
 * @category combinators
 * @since 2.2.8
 */
export const array = <A>(item: Decoder<unknown, A>): Decoder<unknown, Array<A>> =>
  pipe(UnknownArray, composeArray(item))

/**
 * @category combinators
 * @since 2.2.8
 */
export const composeRecord: <I, A>(
  codomain: Decoder<I, A>
) => <H>(decoder: Decoder<H, Record<string, I>>) => Decoder<H, Record<string, A>> =
  /*#__PURE__*/
  K.composeRecord(M)((k, e) => FS.of(DE.key(k, DE.optional, e)))

/**
 * @category combinators
 * @since 2.2.8
 */
export const record = <A>(codomain: Decoder<unknown, A>): Decoder<unknown, Record<string, A>> =>
  pipe(UnknownRecord, composeRecord(codomain))

/**
 * @category combinators
 * @since 2.2.8
 */
export const composeTuple: <I, A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: Decoder<I, A[K]> }
) => <H>(decoder: Decoder<H, Array<I>>) => Decoder<H, A> =
  /*#__PURE__*/
  K.composeTuple(M)((i, e) => FS.of(DE.index(i, DE.required, e))) as any

/**
 * @category combinators
 * @since 2.2.8
 */
export const tuple = <A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: Decoder<unknown, A[K]> }
): Decoder<unknown, A> => pipe(UnknownArray, composeTuple(...(components as any)))

/**
 * @category combinators
 * @since 2.2.8
 */
export const composeUnion: <I, A extends readonly [unknown, ...Array<unknown>]>(
  ...members: { [K in keyof A]: Decoder<I, A[K]> }
) => <H>(decoder: Decoder<H, I>) => Decoder<H, A[number]> =
  /*#__PURE__*/
  K.composeUnion(M)((i, e) => FS.of(DE.member(i, e))) as any

/**
 * @category combinators
 * @since 2.2.8
 */
export const union = <A extends readonly [unknown, ...Array<unknown>]>(
  ...members: { [K in keyof A]: Decoder<unknown, A[K]> }
): Decoder<unknown, A[number]> => pipe(id(), composeUnion(...(members as any)))

/**
 * @category combinators
 * @since 2.2.8
 */
export const intersect: <IB, B>(right: Decoder<IB, B>) => <IA, A>(left: Decoder<IA, A>) => Decoder<IA & IB, A & B> =
  /*#__PURE__*/
  K.intersect(M)

/**
 * @category combinators
 * @since 2.2.8
 */
export const composeSum: <T extends string>(
  tag: T
) => <I, A>(
  members: { [K in keyof A]: Decoder<I, A[K]> }
) => <H>(decoder: Decoder<H, Record<string, I>>) => Decoder<H, A[keyof A]> = K.composeSum(M)((tag, value, keys) =>
  FS.of(
    DE.key(tag, DE.required, error(value, keys.length === 0 ? 'never' : keys.map((k) => JSON.stringify(k)).join(' | ')))
  )
)

/**
 * @category combinators
 * @since 2.2.8
 */
export const sum = <T extends string>(tag: T) => <A>(
  members: { [K in keyof A]: Decoder<unknown, A[K]> }
): Decoder<unknown, A[keyof A]> => pipe(UnknownRecord, composeSum(tag)(members))

/**
 * @category combinators
 * @since 2.2.8
 */
export const lazy: <I, A>(id: string, f: () => Decoder<I, A>) => Decoder<I, A> =
  /*#__PURE__*/
  K.lazy(M)((id, e) => FS.of(DE.lazy(id, e)))

// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------

const map_: Functor2<URI>['map'] = (fa, f) => pipe(fa, map(f))

const alt_: Alt2<URI>['alt'] = (me, that) => pipe(me, alt(that))

const compose_: Category2<URI>['compose'] = (ab, la) => pipe(la, compose(ab))

// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------

/**
 * @category Functor
 * @since 2.2.8
 */
export const map: <A, B>(f: (a: A) => B) => <I>(fa: Decoder<I, A>) => Decoder<I, B> =
  /*#__PURE__*/
  K.map(M)

/**
 * @category Alt
 * @since 2.2.8
 */
export const alt: <I, A>(that: () => Decoder<I, A>) => (me: Decoder<I, A>) => Decoder<I, A> =
  /*#__PURE__*/
  K.alt(M)

/**
 * @category Semigroupoid
 * @since 2.2.8
 */
export const compose: <A, B>(to: Decoder<A, B>) => <I>(from: Decoder<I, A>) => Decoder<I, B> =
  /*#__PURE__*/
  K.compose(M)

/**
 * @category Category
 * @since 2.2.8
 */
export const id: <A>() => Decoder<A, A> =
  /*#__PURE__*/
  K.id(M)

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 2.2.8
 */
export const URI = 'io-ts/Decoder'

/**
 * @category instances
 * @since 2.2.8
 */
export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind2<E, A> {
    readonly [URI]: Decoder<E, A>
  }
}

/**
 * @category instances
 * @since 2.2.8
 */
export const Functor: Functor2<URI> = {
  URI,
  map: map_
}

/**
 * @category instances
 * @since 2.2.8
 */
export const Alt: Alt2<URI> = {
  URI,
  map: map_,
  alt: alt_
}

/**
 * @category instances
 * @since 2.2.8
 */
export const Category: Category2<URI> = {
  URI,
  compose: compose_,
  id
}

/**
 * @category instances
 * @since 2.2.8
 */
export const Schemable: S.Schemable2C<URI, unknown> &
  S.WithUnknownContainers2C<URI, unknown> &
  S.WithUnion2C<URI, unknown> &
  S.WithRefine2C<URI, unknown> = {
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
  tuple: tuple as S.Schemable2C<URI, unknown>['tuple'],
  intersect,
  sum,
  lazy,
  UnknownArray,
  UnknownRecord,
  union: union as S.WithUnion2C<URI, unknown>['union'],
  refine: refine as S.WithRefine2C<URI, unknown>['refine']
}

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.8
 */
export type TypeOf<KD> = K.TypeOf<E.URI, KD>

/**
 * @since 2.2.8
 */
export type InputOf<KD> = K.InputOf<E.URI, KD>

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
 * @since 2.2.8
 */
export const draw = (e: DecodeError): string => toForest(e).map(drawTree).join('\n')

/**
 * @internal
 */
export const stringify: <A>(e: E.Either<DecodeError, A>) => string =
  /*#__PURE__*/
  E.fold(draw, (a) => JSON.stringify(a, null, 2))
