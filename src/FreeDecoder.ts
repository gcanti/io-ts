/**
 * @since 2.2.7
 */
import * as FS from './FreeSemigroup'
import * as DE from './DecoderError'
import * as DT from './DecoderT'
import * as E from 'fp-ts/lib/Either'
import * as T from 'fp-ts/lib/Tree'
import * as NEA from 'fp-ts/lib/NonEmptyArray'

const M = E.getValidation(DE.getSemigroup<any>())

/**
 * @since 2.2.7
 */
export interface FreeDecoder<E, A> extends DT.DecoderT<E.URI, FS.FreeSemigroup<DE.DecodeError<E>>, A> {}

/**
 * @since 2.2.7
 */
export const UnknownRecord = <E>(e: E): FreeDecoder<E, Record<string, unknown>> =>
  DT.UnknownRecord(M)((u) => FS.of(DE.leaf(u, e)))

/**
 * @since 2.2.7
 */
export const string = <E>(e: E): FreeDecoder<E, string> => DT.string(M)((u) => FS.of(DE.leaf(u, e)))

/**
 * @since 2.2.7
 */
export const number = <E>(e: E): FreeDecoder<E, number> => DT.number(M)((u) => FS.of(DE.leaf(u, e)))

/**
 * @since 2.2.7
 */
export const type = <E>(
  UnknownRecord: FreeDecoder<E, Record<string, unknown>>
): (<A>(properties: { [K in keyof A]: FreeDecoder<E, A[K]> }) => FreeDecoder<E, { [K in keyof A]: A[K] }>) =>
  DT.type(M)(UnknownRecord, (k, e) => FS.of(DE.required(k, e)))

/**
 * @since 2.2.7
 */
export function toForest<E>(s: FS.FreeSemigroup<DE.DecodeError<E>>): NEA.NonEmptyArray<T.Tree<string>> {
  const toTree: (e: DE.DecodeError<E>) => T.Tree<string> = DE.fold({
    Leaf: (input, error) => T.make(`cannot decode ${JSON.stringify(input)}, should be ${error}`),
    Required: (key, errors) => T.make(`required property ${JSON.stringify(key)}`, toForest(errors))
  })
  const toForest: (f: FS.FreeSemigroup<DE.DecodeError<E>>) => NEA.NonEmptyArray<T.Tree<string>> = FS.fold(
    (value) => [toTree(value)],
    (left, right) => NEA.concat(toForest(left), toForest(right))
  )
  return toForest(s)
}
