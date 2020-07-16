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
 * @since 2.2.8
 */
export const fromRefinement = <I, A extends I>(refinement: Refinement<I, A>, expected: string): Decoder<I, A> =>
  K.fromRefinement(M)(refinement, (u) => error(u, expected))

/**
 * @category constructors
 * @since 2.2.8
 */
export const fromGuard = <I, A extends I>(guard: G.Guard<I, A>, expected: string): Decoder<I, A> =>
  fromRefinement(guard.is, expected)

/**
 * @category constructors
 * @since 2.2.7
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
 * @since 2.2.7
 */
export const string: Decoder<unknown, string> =
  /*#__PURE__*/
  fromGuard(G.string, 'string')

/**
 * @category primitives
 * @since 2.2.7
 */
export const number: Decoder<unknown, number> =
  /*#__PURE__*/
  fromGuard(G.number, 'number')

/**
 * @category primitives
 * @since 2.2.7
 */
export const boolean: Decoder<unknown, boolean> =
  /*#__PURE__*/
  fromGuard(G.boolean, 'boolean')

/**
 * @category primitives
 * @since 2.2.7
 */
export const UnknownArray: Decoder<unknown, Array<unknown>> =
  /*#__PURE__*/
  fromGuard(G.UnknownArray, 'Array<unknown>')

/**
 * @category primitives
 * @since 2.2.7
 */
export const UnknownRecord: Decoder<unknown, Record<string, unknown>> =
  /*#__PURE__*/
  fromGuard(G.UnknownRecord, 'Record<string, unknown>')

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
 * @since 2.2.9
 */
export const withMessage = <I>(
  message: (input: I, e: DecodeError) => string
): (<A>(decoder: Decoder<I, A>) => Decoder<I, A>) =>
  mapLeftWithInput((input, e) => FS.of(DE.wrap(message(input, e), e)))

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
 * @since 2.2.8
 */
export const fromType = <P extends Record<string, Decoder<any, any>>>(
  properties: P
): Decoder<{ [K in keyof P]: InputOf<P[K]> }, { [K in keyof P]: TypeOf<P[K]> }> =>
  K.fromType(M)((k, e) => FS.of(DE.key(k, DE.required, e)))(properties)

/**
 * @category combinators
 * @since 2.2.7
 */
export const type = <A>(
  properties: { [K in keyof A]: Decoder<unknown, A[K]> }
): Decoder<unknown, { [K in keyof A]: A[K] }> => pipe(UnknownRecord as any, compose(fromType(properties)))

/**
 * @category combinators
 * @since 2.2.8
 */
export const fromPartial = <P extends Record<string, Decoder<any, any>>>(
  properties: P
): Decoder<Partial<{ [K in keyof P]: InputOf<P[K]> }>, Partial<{ [K in keyof P]: TypeOf<P[K]> }>> =>
  K.fromPartial(M)((k, e) => FS.of(DE.key(k, DE.optional, e)))(properties)

/**
 * @category combinators
 * @since 2.2.7
 */
export const partial = <A>(
  properties: { [K in keyof A]: Decoder<unknown, A[K]> }
): Decoder<unknown, Partial<{ [K in keyof A]: A[K] }>> => pipe(UnknownRecord as any, compose(fromPartial(properties)))

/**
 * @category combinators
 * @since 2.2.8
 */
export const fromArray = <I, A>(item: Decoder<I, A>): Decoder<Array<I>, Array<A>> =>
  K.fromArray(M)((i, e) => FS.of(DE.index(i, DE.optional, e)))(item)

/**
 * @category combinators
 * @since 2.2.7
 */
export const array = <A>(item: Decoder<unknown, A>): Decoder<unknown, Array<A>> =>
  pipe(UnknownArray, compose(fromArray(item)))

/**
 * @category combinators
 * @since 2.2.8
 */
export const fromRecord = <I, A>(codomain: Decoder<I, A>): Decoder<Record<string, I>, Record<string, A>> =>
  K.fromRecord(M)((k, e) => FS.of(DE.key(k, DE.optional, e)))(codomain)

/**
 * @category combinators
 * @since 2.2.7
 */
export const record = <A>(codomain: Decoder<unknown, A>): Decoder<unknown, Record<string, A>> =>
  pipe(UnknownRecord, compose(fromRecord(codomain)))

/**
 * @category combinators
 * @since 2.2.8
 */
export const fromTuple = <C extends ReadonlyArray<Decoder<any, any>>>(
  ...components: C
): Decoder<{ [K in keyof C]: InputOf<C[K]> }, { [K in keyof C]: TypeOf<C[K]> }> =>
  K.fromTuple(M)((i, e) => FS.of(DE.index(i, DE.required, e)))(...components)

/**
 * @category combinators
 * @since 2.2.7
 */
export const tuple = <A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: Decoder<unknown, A[K]> }
): Decoder<unknown, A> => pipe(UnknownArray as any, compose(fromTuple(...components))) as any

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
 * @since 2.2.8
 */
export const fromSum = <T extends string>(tag: T) => <MS extends Record<string, Decoder<any, any>>>(
  members: MS
): Decoder<InputOf<MS[keyof MS]>, TypeOf<MS[keyof MS]>> =>
  K.fromSum(M)((tag, value, keys) =>
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
export const sum = <T extends string>(tag: T) => <A>(
  members: { [K in keyof A]: Decoder<unknown, A[K]> }
): Decoder<unknown, A[keyof A]> => pipe(UnknownRecord as any, compose(fromSum(tag)(members)))

/**
 * @category combinators
 * @since 2.2.7
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
 * @since 2.2.7
 */
export const URI = 'io-ts/Decoder'

/**
 * @category instances
 * @since 2.2.7
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
export const Schemable: S.Schemable2C<URI, unknown> = {
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
  lazy
}

/**
 * @category instances
 * @since 2.2.8
 */
export const WithUnknownContainers: S.WithUnknownContainers2C<URI, unknown> = {
  UnknownArray,
  UnknownRecord
}

/**
 * @category instances
 * @since 2.2.8
 */
export const WithUnion: S.WithUnion2C<URI, unknown> = {
  union: union as S.WithUnion2C<URI, unknown>['union']
}

/**
 * @category instances
 * @since 2.2.8
 */
export const WithRefine: S.WithRefine2C<URI, unknown> = {
  refine: refine as S.WithRefine2C<URI, unknown>['refine']
}

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.8
 */
export type InputOf<D> = K.InputOf<E.URI, D>

/**
 * @since 2.2.7
 */
export type TypeOf<D> = K.TypeOf<E.URI, D>

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
  Lazy: (id, errors) => make(`lazy type ${id}`, toForest(errors)),
  Wrap: (error, errors) => make(error, toForest(errors))
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
