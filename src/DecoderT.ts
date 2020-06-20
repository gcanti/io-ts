/**
 * @since 2.2.7
 */
import { Applicative2C } from 'fp-ts/lib/Applicative'
import * as A from 'fp-ts/lib/Array'
import { Bifunctor2 } from 'fp-ts/lib/Bifunctor'
import { Kind2, URIS2 } from 'fp-ts/lib/HKT'
import { Monad2C } from 'fp-ts/lib/Monad'
import { MonadThrow2C } from 'fp-ts/lib/MonadThrow'
import { pipe } from 'fp-ts/lib/pipeable'
import * as G from './Guard'

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
export const UnknownArray = <M extends URIS2, E>(M: MonadThrow2C<M, E>) => (
  onError: (u: unknown) => E
): DecoderT<M, E, Array<unknown>> => {
  return fromGuard(M)(G.UnknownArray, onError)
}

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

const traverseWithIndex = <M extends URIS2, E>(M: Applicative2C<M, E>) => <A, B>(
  ta: Array<A>,
  f: (i: number, a: A) => Kind2<M, E, B>
): Kind2<M, E, Array<B>> => {
  return pipe(
    ta,
    A.reduceWithIndex(M.of<Array<B>>([]), (i, fbs, a) =>
      M.ap(
        M.map(fbs, (bs) => (b: B) => {
          bs.push(b)
          return bs
        }),
        f(i, a)
      )
    )
  )
}

/**
 * @category combinators
 * @since 2.2.7
 */
export const array = <M extends URIS2, E>(M: Monad2C<M, E> & Bifunctor2<M>) => (
  UnknownArray: DecoderT<M, E, Array<unknown>>,
  onItemError: (i: number, e: E) => E
) => <A>(items: DecoderT<M, E, A>): DecoderT<M, E, Array<A>> => {
  const traverseWithIndexM = traverseWithIndex(M)
  return {
    decode: (u) =>
      M.chain(UnknownArray.decode(u), (us) =>
        traverseWithIndexM(us, (i, u) => M.mapLeft(items.decode(u), (e) => onItemError(i, e)))
      )
  }
}
