/**
 * @since 2.2.7
 */
import { Applicative2C } from 'fp-ts/lib/Applicative'
import { Bifunctor2 } from 'fp-ts/lib/Bifunctor'
import { Kind2, URIS2 } from 'fp-ts/lib/HKT'
import { Monad2C } from 'fp-ts/lib/Monad'
import { MonadThrow2C } from 'fp-ts/lib/MonadThrow'
import * as G from './Guard'
import * as E from 'fp-ts/lib/Either'

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
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 2.2.7
 */
export const fromGuard = <M extends URIS2, E>(M: MonadThrow2C<M, E>) => <A>(
  guard: G.Guard<A>,
  onError: (u: unknown) => E
): DecoderT<M, E, A> => {
  return {
    decode: (u) => (guard.is(u) ? M.of(u) : M.throwError(onError(u)))
  }
}

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * @category primitives
 * @since 2.2.7
 */
export const string = <M extends URIS2, E>(M: MonadThrow2C<M, E>) => (
  onError: (u: unknown) => E
): DecoderT<M, E, string> => {
  return fromGuard(M)(G.string, onError)
}

/**
 * @category primitives
 * @since 2.2.7
 */
export const number = <M extends URIS2, E>(M: MonadThrow2C<M, E>) => (
  onError: (u: unknown) => E
): DecoderT<M, E, number> => {
  return fromGuard(M)(G.number, onError)
}

/**
 * @category primitives
 * @since 2.2.7
 */
export const boolean = <M extends URIS2, E>(M: MonadThrow2C<M, E>) => (
  onError: (u: unknown) => E
): DecoderT<M, E, boolean> => {
  return fromGuard(M)(G.boolean, onError)
}

/**
 * @category primitives
 * @since 2.2.7
 */
export const UnknownArray = <M extends URIS2, E>(M: MonadThrow2C<M, E>) => (
  onError: (u: unknown) => E
): DecoderT<M, E, Array<unknown>> => {
  return fromGuard(M)(G.UnknownArray, onError)
}

/**
 * @category primitives
 * @since 2.2.7
 */
export const UnknownRecord = <M extends URIS2, E>(M: MonadThrow2C<M, E>) => (
  onError: (u: unknown) => E
): DecoderT<M, E, Record<string, unknown>> => {
  return fromGuard(M)(G.UnknownRecord, onError)
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
  return (UnknownRecord, onKeyError) => (properties) => ({
    decode: (u) =>
      M.map(
        M.chain(UnknownRecord.decode(u), (r) =>
          traverse(properties as Record<string, DecoderT<M, E, unknown>>, (k, decoder) => {
            const rk = r[k]
            if (rk === undefined) {
              return skip
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
  const ks = Object.keys(r).sort()
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
