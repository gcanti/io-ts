/**
 * @since 2.2.7
 */
import { Applicative2C } from 'fp-ts/lib/Applicative'
import { Bifunctor2 } from 'fp-ts/lib/Bifunctor'
import * as E from 'fp-ts/lib/Either'
import { Kind2, URIS2 } from 'fp-ts/lib/HKT'
import { Monad2C } from 'fp-ts/lib/Monad'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 2.2.7
 */
export interface DecoderT<M extends URIS2, E, A> {
  readonly decode: (u: unknown) => Kind2<M, E, A>
}

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 2.2.7
 */
export function type<M extends URIS2, E>(
  M: Monad2C<M, E> & Bifunctor2<M>
): (
  UnknownRecord: DecoderT<M, E, Record<string, unknown>>,
  onKeyError: (k: string, e: E) => E
) => <A>(properties: { [K in keyof A]: DecoderT<M, E, A[K]> }) => DecoderT<M, E, { [K in keyof A]: A[K] }> {
  const traverse = traverseRecordWithIndex(M)
  return (UnknownRecord, onKeyError) => (properties) => ({
    decode: (u) =>
      M.chain(UnknownRecord.decode(u), (r) =>
        traverse(properties as Record<string, DecoderT<M, E, unknown>>, (k, decoder) =>
          M.mapLeft(decoder.decode(r[k]), (e) => onKeyError(k, e))
        )
      ) as any
  })
}

/**
 * @category combinators
 * @since 2.2.7
 */
export function partial<M extends URIS2, E>(
  M: Monad2C<M, E> & Bifunctor2<M>
): (
  UnknownRecord: DecoderT<M, E, Record<string, unknown>>,
  onKeyError: (k: string, e: E) => E
) => <A>(properties: { [K in keyof A]: DecoderT<M, E, A[K]> }) => DecoderT<M, E, Partial<{ [K in keyof A]: A[K] }>> {
  const traverse = traverseRecordWithIndex(M)
  const skip = M.of<E.Either<void, unknown>>(E.left(undefined))
  const undef = M.of<E.Either<void, unknown>>(E.right(undefined))
  return (UnknownRecord, onKeyError) => (properties) => ({
    decode: (u) =>
      M.map(
        M.chain(UnknownRecord.decode(u), (r) =>
          traverse(properties as Record<string, DecoderT<M, E, unknown>>, (k, decoder) => {
            const rk = r[k]
            if (rk === undefined) {
              return k in r
                ? // don't strip undefined properties
                  undef
                : // don't add missing properties
                  skip
            }
            return M.bimap(
              decoder.decode(rk),
              (e) => onKeyError(k, e),
              (a) => E.right<void, unknown>(a)
            )
          })
        ),
        compactRecord
      ) as any
  })
}

/**
 * @category combinators
 * @since 2.2.7
 */
export function array<M extends URIS2, E>(
  M: Monad2C<M, E> & Bifunctor2<M>
): (
  UnknownArray: DecoderT<M, E, Array<unknown>>,
  onItemError: (i: number, e: E) => E
) => <A>(items: DecoderT<M, E, A>) => DecoderT<M, E, Array<A>> {
  const traverse = traverseArrayWithIndex(M)
  return (UnknownArray, onItemError) => (items) => ({
    decode: (u) =>
      M.chain(UnknownArray.decode(u), (us) =>
        traverse(us, (i, u) => M.mapLeft(items.decode(u), (e) => onItemError(i, e)))
      )
  })
}

/**
 * @category combinators
 * @since 2.2.7
 */
export function record<M extends URIS2, E>(
  M: Monad2C<M, E> & Bifunctor2<M>
): (
  UnknownRecord: DecoderT<M, E, Record<string, unknown>>,
  onKeyError: (k: string, e: E) => E
) => <A>(codomain: DecoderT<M, E, A>) => DecoderT<M, E, Record<string, A>> {
  const traverse = traverseRecordWithIndex(M)
  return (UnknownRecord, onKeyError) => (codomain) => ({
    decode: (u) =>
      M.chain(UnknownRecord.decode(u), (r) =>
        traverse(r, (k, u) => M.mapLeft(codomain.decode(u), (e) => onKeyError(k, e)))
      )
  })
}

/**
 * @category combinators
 * @since 2.2.7
 */
export function tuple<M extends URIS2, E>(
  M: Monad2C<M, E> & Bifunctor2<M>
): (
  UnknownArray: DecoderT<M, E, Array<unknown>>,
  onIndexError: (i: number, e: E) => E
) => <A extends ReadonlyArray<unknown>>(...components: { [K in keyof A]: DecoderT<M, E, A[K]> }) => DecoderT<M, E, A> {
  const traverse = traverseArrayWithIndex(M)
  return (UnknownArray, onIndexError) => (...components) => ({
    decode: (u) =>
      M.chain(UnknownArray.decode(u), (us) =>
        traverse((components as unknown) as Array<DecoderT<M, E, unknown>>, (i, decoder) =>
          M.mapLeft(decoder.decode(us[i]), (e) => onIndexError(i, e))
        )
      ) as any
  })
}

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

const traverseArrayWithIndex = <M extends URIS2, E>(M: Applicative2C<M, E>) => <A, B>(
  as: Array<A>,
  f: (i: number, a: A) => Kind2<M, E, B>
): Kind2<M, E, Array<B>> => {
  return as.reduce(
    (mbs, a, i) =>
      M.ap(
        M.map(mbs, (bs) => (b: B) => {
          bs.push(b)
          return bs
        }),
        f(i, a)
      ),
    M.of<Array<B>>([])
  )
}

const traverseRecordWithIndex = <M extends URIS2, E>(M: Applicative2C<M, E>) => <A, B>(
  r: Record<string, A>,
  f: (k: string, a: A) => Kind2<M, E, B>
): Kind2<M, E, Record<string, B>> => {
  const ks = Object.keys(r)
  if (ks.length === 0) {
    return M.of({})
  }
  let fr: Kind2<M, E, Record<string, B>> = M.of({})
  for (const key of ks) {
    fr = M.ap(
      M.map(fr, (r) => (b: B) => {
        r[key] = b
        return r
      }),
      f(key, r[key])
    )
  }
  return fr
}

const compactRecord = <A>(r: Record<string, E.Either<void, A>>): Record<string, A> => {
  const out: Record<string, A> = {}
  for (const k in r) {
    const rk = r[k]
    if (E.isRight(rk)) {
      out[k] = rk.right
    }
  }
  return out
}
