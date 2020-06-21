/**
 * @since 2.2.7
 */
import * as FS from './FreeSemigroup'
import * as DE from './DecoderError'
import * as DT from './DecoderT'
import * as E from 'fp-ts/lib/Either'
import * as T from 'fp-ts/lib/Tree'
import * as NEA from 'fp-ts/lib/NonEmptyArray'

const M = E.getValidation(DE.getSemigroup())

/**
 * @since 2.2.7
 */
export interface FreeDecoder<A> extends DT.DecoderT<E.URI, FS.FreeSemigroup<DE.DecodeError>, A> {}

/**
 * @since 2.2.7
 */
export const UnknownRecord: FreeDecoder<Record<string, unknown>> = DT.UnknownRecord(M)((u) =>
  FS.of(DE.leaf(u, 'Record<string, unknown>'))
)

/**
 * @since 2.2.7
 */
export const string: FreeDecoder<string> = DT.string(M)((u) => FS.of(DE.leaf(u, 'string')))

/**
 * @since 2.2.7
 */
export const number: FreeDecoder<number> = DT.number(M)((u) => FS.of(DE.leaf(u, 'number')))

/**
 * @since 2.2.7
 */
export const type: <A>(
  properties: { [K in keyof A]: FreeDecoder<A[K]> }
) => FreeDecoder<{ [K in keyof A]: A[K] }> = DT.type(M)(UnknownRecord, (k, e) => FS.of(DE.required(k, e)))

/**
 * @since 2.2.7
 */
export function toForest(s: FS.FreeSemigroup<DE.DecodeError>): NEA.NonEmptyArray<T.Tree<string>> {
  const toTree: (e: DE.DecodeError) => T.Tree<string> = DE.fold({
    Leaf: (input, expected) => T.make(`cannot decode ${JSON.stringify(input)}, should be ${expected}`),
    Required: (key, errors) => T.make(`required property ${JSON.stringify(key)}`, toForest(errors))
  })
  const toForest: (f: FS.FreeSemigroup<DE.DecodeError>) => NEA.NonEmptyArray<T.Tree<string>> = FS.fold(
    (value) => [toTree(value)],
    (left, right) => NEA.concat(toForest(left), toForest(right))
  )
  return toForest(s)
}
