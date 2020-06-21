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

const M = TE.getTaskValidation(DE.getSemigroup<string>())

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
export const fromGuard = <A>(guard: G.Guard<A>, expected: string): TaskDecoder<A> => ({
  decode: (u) => (guard.is(u) ? success(u) : failure(u, expected))
})

// TODO: add fromDecoder: <A>(decoder: D.Decoder<A>) => TaskDecoder<A>

/**
 * @category combinators
 * @since 2.2.7
 */
export const literal = <A extends ReadonlyArray<Literal>>(...values: A): TaskDecoder<A[number]> =>
  values.length === 0
    ? never
    : fromGuard(G.literal(...values), values.map((value) => JSON.stringify(value)).join(' | '))

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

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

const toForest = (e: DecodeError): NEA.NonEmptyArray<T.Tree<string>> => {
  const toTree: (e: DE.DecodeError<string>) => T.Tree<string> = DE.fold({
    Leaf: (input, error) => T.make(`cannot decode ${JSON.stringify(input)}, should be ${error}`),
    Key: (key, kind, errors) => T.make(`${kind} property ${JSON.stringify(key)}`, toForest(errors)),
    Index: (index, kind, errors) => T.make(`${kind} index ${index}`, toForest(errors))
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
