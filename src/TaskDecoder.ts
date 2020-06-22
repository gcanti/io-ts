/**
 * @since 2.2.7
 */
import * as TE from 'fp-ts/lib/TaskEither'
import * as DE from './DecodeError'
import * as DT from './DecoderT'
import * as FS from '../src/FreeSemigroup'
import * as G from './Guard'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as T from 'fp-ts/lib/Tree'
import { Literal } from './Schemable'

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

// TODO: add fromDecoder: <A>(decoder: D.Decoder<A>) => TaskDecoder<A>

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
export const never: TaskDecoder<never> = fromGuard(G.never, 'never')

/**
 * @category primitives
 * @since 2.2.7
 */
export const string: TaskDecoder<string> = fromGuard(G.string, 'string')

/**
 * @category primitives
 * @since 2.2.7
 */
export const number: TaskDecoder<number> = fromGuard(G.number, 'number')

/**
 * @category primitives
 * @since 2.2.7
 */
export const boolean: TaskDecoder<boolean> = fromGuard(G.boolean, 'boolean')

/**
 * @category primitives
 * @since 2.2.7
 */
export const UnknownArray: TaskDecoder<Array<unknown>> = fromGuard(G.UnknownArray, 'Array<unknown>')

/**
 * @category primitives
 * @since 2.2.7
 */
export const UnknownRecord: TaskDecoder<Record<string, unknown>> = fromGuard(G.UnknownRecord, 'Record<string, unknown>')

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

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
export const intersection: <A, B>(left: TaskDecoder<A>, right: TaskDecoder<B>) => TaskDecoder<A & B> = DT.intersection(
  M
)

/**
 * @category combinators
 * @since 2.2.7
 */
export const sum: <T extends string>(
  tag: T
) => <A>(members: { [K in keyof A]: TaskDecoder<A[K]> }) => TaskDecoder<A[keyof A]> = DT.sum(M)(
  UnknownRecord,
  (tag, value, keys) =>
    FS.of(DE.key(tag, DE.required, FS.of(DE.leaf(value, keys.map((k) => JSON.stringify(k)).join(' | ')))))
)

/**
 * @category combinators
 * @since 2.2.7
 */
export const lazy: <A>(id: string, f: () => TaskDecoder<A>) => TaskDecoder<A> = DT.lazy(M)((id, e) =>
  FS.of(DE.lazy(id, e))
)

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

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
