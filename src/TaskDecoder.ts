/**
 * @since 2.2.7
 */
import { Alt1 } from 'fp-ts/lib/Alt'
import { Functor1 } from 'fp-ts/lib/Functor'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import { pipe } from 'fp-ts/lib/pipeable'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import { drawTree, make, Tree } from 'fp-ts/lib/Tree'
import * as FS from '../src/FreeSemigroup'
import * as DE from './DecodeError'
import * as DT from './DecoderT'
import * as G from './Guard'
import * as D from './Decoder2'
import { Literal, Schemable1, WithRefinement1, WithUnion1, WithUnknownContainers1 } from './Schemable'

// -------------------------------------------------------------------------------------
// config
// -------------------------------------------------------------------------------------

const M = TE.getTaskValidation(DE.getSemigroup<string>())
const fromGuardM = DT.fromGuard(M)
const literalM = DT.literal(M)((u, values) =>
  FS.of(DE.leaf(u, values.map((value) => JSON.stringify(value)).join(' | ')))
)
const refinementM = DT.refinement(M)

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 2.2.7
 */
export interface TaskDecoder<A> {
  readonly decode: (u: unknown) => TE.TaskEither<DecodeError, A>
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
export function success<A>(a: A): TE.TaskEither<DecodeError, A> {
  return TE.right(a)
}

/**
 * @category DecodeError
 * @since 2.2.7
 */
export function failure<A = never>(actual: unknown, message: string): TE.TaskEither<DecodeError, A> {
  return TE.left(FS.of(DE.leaf(actual, message)))
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 2.2.7
 */
export const fromDecoder = <A>(decoder: D.Decoder<A>): TaskDecoder<A> => ({
  decode: TE.fromEitherK(decoder.decode)
})

/**
 * @category constructors
 * @since 2.2.7
 */
export const fromGuard = <A>(guard: G.Guard<A>, expected: string): TaskDecoder<A> =>
  fromGuardM(guard, (u) => FS.of(DE.leaf(u, expected)))

/**
 * @category constructors
 * @since 2.2.7
 */
export const literal = <A extends readonly [Literal, ...Array<Literal>]>(...values: A): TaskDecoder<A[number]> =>
  literalM(...values)

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * @category primitives
 * @since 2.2.7
 */
export const string: TaskDecoder<string> = fromDecoder(D.string)

/**
 * @category primitives
 * @since 2.2.7
 */
export const number: TaskDecoder<number> = fromDecoder(D.number)

/**
 * @category primitives
 * @since 2.2.7
 */
export const boolean: TaskDecoder<boolean> = fromDecoder(D.boolean)

/**
 * @category primitives
 * @since 2.2.7
 */
export const UnknownArray: TaskDecoder<Array<unknown>> = fromDecoder(D.UnknownArray)

/**
 * @category primitives
 * @since 2.2.7
 */
export const UnknownRecord: TaskDecoder<Record<string, unknown>> = fromDecoder(D.UnknownRecord)

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 2.2.7
 */
export const withExpected: <A>(
  decoder: TaskDecoder<A>,
  expected: (actual: unknown, e: DecodeError) => DecodeError
) => TaskDecoder<A> = DT.withExpected(M)

/**
 * @category combinators
 * @since 2.2.7
 */
export const parse: <A, B>(
  from: TaskDecoder<A>,
  parser: (a: A) => TE.TaskEither<DecodeError, B>
) => TaskDecoder<B> = DT.parse(M)

/**
 * @category combinators
 * @since 2.2.7
 */
export const refinement = <A, B extends A>(
  from: TaskDecoder<A>,
  refinement: (a: A) => a is B,
  expected: string
): TaskDecoder<B> => refinementM(from, refinement, (u) => FS.of(DE.leaf(u, expected)))

/**
 * @category combinators
 * @since 2.2.7
 */
export const nullable: <A>(or: TaskDecoder<A>) => TaskDecoder<null | A> = DT.nullable(M)((u, e) =>
  FS.concat(FS.of(DE.member(0, FS.of(DE.leaf(u, 'null')))), FS.of(DE.member(1, e)))
)

/**
 * @category combinators
 * @since 2.2.7
 */
export const type: <A>(
  properties: { [K in keyof A]: TaskDecoder<A[K]> }
) => TaskDecoder<{ [K in keyof A]: A[K] }> = DT.type(M)(UnknownRecord, (k, e) => FS.of(DE.key(k, DE.required, e)))

/**
 * @category combinators
 * @since 2.2.7
 */
export const partial: <A>(
  properties: { [K in keyof A]: TaskDecoder<A[K]> }
) => TaskDecoder<Partial<{ [K in keyof A]: A[K] }>> = DT.partial(M)(UnknownRecord, (k, e) =>
  FS.of(DE.key(k, DE.optional, e))
)

/**
 * @category combinators
 * @since 2.2.7
 */
export const array: <A>(items: TaskDecoder<A>) => TaskDecoder<Array<A>> = DT.array(M)(UnknownArray, (i, e) =>
  FS.of(DE.index(i, DE.optional, e))
)

/**
 * @category combinators
 * @since 2.2.7
 */
export const record: <A>(codomain: TaskDecoder<A>) => TaskDecoder<Record<string, A>> = DT.record(M)(
  UnknownRecord,
  (k, e) => FS.of(DE.key(k, DE.optional, e))
)

/**
 * @category combinators
 * @since 2.2.7
 */
export const tuple: <A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: TaskDecoder<A[K]> }
) => TaskDecoder<A> = DT.tuple(M)(UnknownArray, (i, e) => FS.of(DE.index(i, DE.required, e))) as any

/**
 * @category combinators
 * @since 2.2.7
 */
export const union: <A extends readonly [unknown, ...Array<unknown>]>(
  ...members: { [K in keyof A]: TaskDecoder<A[K]> }
) => TaskDecoder<A[number]> = DT.union(M)((i, e) => FS.of(DE.member(i, e))) as any

/**
 * @category combinators
 * @since 2.2.7
 */
export const intersect: <B>(right: TaskDecoder<B>) => <A>(left: TaskDecoder<A>) => TaskDecoder<A & B> = DT.intersect(M)

/**
 * @category combinators
 * @since 2.2.7
 */
export const sum: <T extends string>(
  tag: T
) => <A>(members: { [K in keyof A]: TaskDecoder<A[K]> }) => TaskDecoder<A[keyof A]> = DT.sum(M)(
  UnknownRecord,
  (tag, value, keys) =>
    FS.of(
      DE.key(
        tag,
        DE.required,
        FS.of(DE.leaf(value, keys.length === 0 ? 'never' : keys.map((k) => JSON.stringify(k)).join(' | ')))
      )
    )
)

/**
 * @category combinators
 * @since 2.2.7
 */
export const lazy: <A>(id: string, f: () => TaskDecoder<A>) => TaskDecoder<A> = DT.lazy(M)((id, e) =>
  FS.of(DE.lazy(id, e))
)

// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------

const map_: <A, B>(fa: TaskDecoder<A>, f: (a: A) => B) => TaskDecoder<B> = (fa, f) => ({
  decode: (u) => pipe(fa.decode(u), TE.map(f))
})

const alt_: <A>(me: TaskDecoder<A>, that: () => TaskDecoder<A>) => TaskDecoder<A> = (me, that) => ({
  decode: (u) =>
    pipe(
      me.decode(u),
      TE.alt(() => that().decode(u))
    )
})

// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------

/**
 * @category Functor
 * @since 2.2.7
 */
export const map: <A, B>(f: (a: A) => B) => (fa: TaskDecoder<A>) => TaskDecoder<B> = (f) => (fa) => map_(fa, f)

/**
 * @category Alt
 * @since 2.2.7
 */
export const alt: <A>(that: () => TaskDecoder<A>) => (me: TaskDecoder<A>) => TaskDecoder<A> = (that) => (fa) =>
  alt_(fa, that)

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
export const schemableTaskDecoder: Schemable1<URI> &
  WithUnknownContainers1<URI> &
  WithUnion1<URI> &
  WithRefinement1<URI> = {
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
  refinement: refinement as WithRefinement1<URI>['refinement']
}

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

const toForest = (e: DecodeError): NEA.NonEmptyArray<Tree<string>> => {
  const toTree: (e: DE.DecodeError<string>) => Tree<string> = DE.fold({
    Leaf: (input, error) => make(`cannot decode ${JSON.stringify(input)}, should be ${error}`),
    Key: (key, kind, errors) => make(`${kind} property ${JSON.stringify(key)}`, toForest(errors)),
    Index: (index, kind, errors) => make(`${kind} index ${index}`, toForest(errors)),
    Member: (index, errors) => make(`member ${index}`, toForest(errors)),
    Lazy: (id, errors) => make(`lazy type ${id}`, toForest(errors))
  })
  const toForest: (f: DecodeError) => NEA.NonEmptyArray<Tree<string>> = FS.fold(
    (value) => [toTree(value)],
    (left, right) => NEA.concat(toForest(left), toForest(right))
  )
  return toForest(e)
}

/**
 * @since 2.2.7
 */
export const draw = (e: DecodeError): string => toForest(e).map(drawTree).join('\n')

/**
 * @since 2.2.7
 */
export const stringify: <A>(e: TE.TaskEither<DecodeError, A>) => T.Task<string> = TE.fold(
  (e) => T.of(draw(e)),
  (a) => T.of(JSON.stringify(a, null, 2))
)
