/**
 * @since 2.2.7
 */
import { Applicative2C } from 'fp-ts/lib/Applicative'
import { Bifunctor2 } from 'fp-ts/lib/Bifunctor'
import * as E from 'fp-ts/lib/Either'
import { Kind2, URIS2 } from 'fp-ts/lib/HKT'
import { Monad2C } from 'fp-ts/lib/Monad'
import { MonadThrow2C } from 'fp-ts/lib/MonadThrow'
import * as G from './Guard'
import { Literal, memoize, intersect_ } from './Schemable'
import { Alt2C } from 'fp-ts/lib/Alt'
import { Apply2C } from 'fp-ts/lib/Apply'

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
): DecoderT<M, E, A> => ({
  decode: (u) => (guard.is(u) ? M.of(u) : M.throwError(onError(u)))
})

/**
 * @category constructors
 * @since 2.2.7
 */
export const literal = <M extends URIS2, E>(M: MonadThrow2C<M, E>) => (
  onError: (u: unknown, values: readonly [Literal, ...Array<Literal>]) => E
) => <A extends readonly [Literal, ...Array<Literal>]>(...values: A): DecoderT<M, E, A[number]> => ({
  decode: (u) => (G.literal(...values).is(u) ? M.of(u) : M.throwError(onError(u, values)))
})

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 2.2.7
 */
export const withExpected = <M extends URIS2>(M: Bifunctor2<M>) => <E, A>(
  decoder: DecoderT<M, E, A>,
  expected: (u: unknown, e: E) => E
): DecoderT<M, E, A> => ({
  decode: (u) => M.mapLeft(decoder.decode(u), (e) => expected(u, e))
})

/**
 * @category combinators
 * @since 2.2.7
 */
export const refine = <M extends URIS2, E>(M: MonadThrow2C<M, E> & Bifunctor2<M>) => <A, B extends A>(
  refinement: (a: A) => a is B,
  onError: (a: A) => E
) => (from: DecoderT<M, E, A>): DecoderT<M, E, B> => ({
  decode: (u) => M.chain(from.decode(u), (a) => (refinement(a) ? M.of(a) : M.throwError(onError(a))))
})

/**
 * @category combinators
 * @since 2.2.7
 */
export const parse = <M extends URIS2, E>(M: MonadThrow2C<M, E> & Bifunctor2<M>) => <A, B>(
  parser: (a: A) => Kind2<M, E, B>
) => (from: DecoderT<M, E, A>): DecoderT<M, E, B> => ({
  decode: (u) => M.chain(from.decode(u), (a) => parser(a))
})

/**
 * @category combinators
 * @since 2.2.7
 */
export const nullable = <M extends URIS2, E>(M: Applicative2C<M, E> & Bifunctor2<M>) => (
  onError: (u: unknown, e: E) => E
) => <A>(or: DecoderT<M, E, A>): DecoderT<M, E, null | A> => ({
  decode: (u) =>
    u === null
      ? M.of<null | A>(null)
      : M.bimap(
          or.decode(u),
          (e) => onError(u, e),
          (a): A | null => a
        )
})

/**
 * @category combinators
 * @since 2.2.7
 */
export function type<M extends URIS2, E>(
  M: Monad2C<M, E> & Bifunctor2<M>
): (
  UnknownRecord: DecoderT<M, E, Record<string, unknown>>,
  onKeyError: (key: string, e: E) => E
) => <A>(properties: { [K in keyof A]: DecoderT<M, E, A[K]> }) => DecoderT<M, E, { [K in keyof A]: A[K] }> {
  const traverse = traverseRecordWithIndex(M)
  return (UnknownRecord, onKeyError) => (properties) => ({
    decode: (u) =>
      M.chain(UnknownRecord.decode(u), (r) =>
        traverse(properties as Record<string, DecoderT<M, E, unknown>>, (key, decoder) =>
          M.mapLeft(decoder.decode(r[key]), (e) => onKeyError(key, e))
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
  onKeyError: (key: string, e: E) => E
) => <A>(properties: { [K in keyof A]: DecoderT<M, E, A[K]> }) => DecoderT<M, E, Partial<{ [K in keyof A]: A[K] }>> {
  const traverse = traverseRecordWithIndex(M)
  const skip = M.of<E.Either<void, unknown>>(E.left(undefined))
  const undef = M.of<E.Either<void, unknown>>(E.right(undefined))
  return (UnknownRecord, onKeyError) => (properties) => ({
    decode: (u) =>
      M.map(
        M.chain(UnknownRecord.decode(u), (r) =>
          traverse(properties as Record<string, DecoderT<M, E, unknown>>, (key, decoder) => {
            const rk = r[key]
            if (rk === undefined) {
              return key in r
                ? // don't strip undefined properties
                  undef
                : // don't add missing properties
                  skip
            }
            return M.bimap(
              decoder.decode(rk),
              (e) => onKeyError(key, e),
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
  onItemError: (index: number, e: E) => E
) => <A>(items: DecoderT<M, E, A>) => DecoderT<M, E, Array<A>> {
  const traverse = traverseArrayWithIndex(M)
  return (UnknownArray, onItemError) => (items) => ({
    decode: (u) =>
      M.chain(UnknownArray.decode(u), (us) =>
        traverse(us, (index, u) => M.mapLeft(items.decode(u), (e) => onItemError(index, e)))
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
  onKeyError: (key: string, e: E) => E
) => <A>(codomain: DecoderT<M, E, A>) => DecoderT<M, E, Record<string, A>> {
  const traverse = traverseRecordWithIndex(M)
  return (UnknownRecord, onKeyError) => (codomain) => ({
    decode: (u) =>
      M.chain(UnknownRecord.decode(u), (r) =>
        traverse(r, (key, u) => M.mapLeft(codomain.decode(u), (e) => onKeyError(key, e)))
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
  onIndexError: (index: number, e: E) => E
) => <A extends ReadonlyArray<unknown>>(...components: { [K in keyof A]: DecoderT<M, E, A[K]> }) => DecoderT<M, E, A> {
  const traverse = traverseArrayWithIndex(M)
  return (UnknownArray, onIndexError) => (...components) => ({
    decode: (u) =>
      M.chain(UnknownArray.decode(u), (us) =>
        traverse((components as unknown) as Array<DecoderT<M, E, unknown>>, (index, decoder) =>
          M.mapLeft(decoder.decode(us[index]), (e) => onIndexError(index, e))
        )
      ) as any
  })
}

/**
 * @category combinators
 * @since 2.2.7
 */
export const union = <M extends URIS2, E>(M: Alt2C<M, E> & Bifunctor2<M>) => (
  onMemberError: (i: number, e: E) => E
) => <A extends readonly [unknown, ...Array<unknown>]>(
  ...members: { [K in keyof A]: DecoderT<M, E, A[K]> }
): DecoderT<M, E, A[number]> => ({
  decode: (u) => {
    let out: Kind2<M, E, unknown> = M.mapLeft(members[0].decode(u), (e) => onMemberError(0, e))
    for (let index = 1; index < members.length; index++) {
      out = M.alt(out, () => M.mapLeft(members[index].decode(u), (e) => onMemberError(index, e)))
    }
    return out
  }
})

/**
 * @category combinators
 * @since 2.2.7
 */
export const intersect = <M extends URIS2, E>(M: Apply2C<M, E>) => <B>(right: DecoderT<M, E, B>) => <A>(
  left: DecoderT<M, E, A>
): DecoderT<M, E, A & B> => ({
  decode: (u) =>
    M.ap(
      M.map(left.decode(u), (a: A) => (b: B) => intersect_(a, b)),
      right.decode(u)
    )
})

/**
 * @category combinators
 * @since 2.2.7
 */
export const sum = <M extends URIS2, E>(M: MonadThrow2C<M, E>) => (
  UnknownRecord: DecoderT<M, E, Record<string, unknown>>,
  onTagError: (tag: string, value: unknown, tags: ReadonlyArray<string>) => E
) => <T extends string>(
  tag: T
): (<A>(members: { [K in keyof A]: DecoderT<M, E, A[K]> }) => DecoderT<M, E, A[keyof A]>) => {
  return <A>(members: { [K in keyof A]: DecoderT<M, E, A[K]> }): DecoderT<M, E, A[keyof A]> => {
    const keys = Object.keys(members)
    return {
      decode: (u) =>
        M.chain(UnknownRecord.decode(u), (r) => {
          const v = r[tag] as keyof A
          if (v in members) {
            return members[v].decode(u)
          }
          return M.throwError(onTagError(tag, v, keys))
        })
    }
  }
}

/**
 * @category combinators
 * @since 2.2.7
 */
export const lazy = <M extends URIS2, E>(M: MonadThrow2C<M, E> & Bifunctor2<M>) => (
  onError: (id: string, e: E) => E
): (<A>(id: string, f: () => DecoderT<M, E, A>) => DecoderT<M, E, A>) => {
  return <A>(id: string, f: () => DecoderT<M, E, A>): DecoderT<M, E, A> => {
    const get = memoize<void, DecoderT<M, E, A>>(f)
    return {
      decode: (u) => M.mapLeft(get().decode(u), (e) => onError(id, e))
    }
  }
}

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

const traverseArrayWithIndex = <M extends URIS2, E>(M: Applicative2C<M, E>) => <A, B>(
  as: Array<A>,
  f: (i: number, a: A) => Kind2<M, E, B>
): Kind2<M, E, Array<B>> => {
  return as.reduce(
    (mbs, a, index) =>
      M.ap(
        M.map(mbs, (bs) => (b: B) => {
          bs.push(b)
          return bs
        }),
        f(index, a)
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
  for (const key in r) {
    const rk = r[key]
    if (E.isRight(rk)) {
      out[key] = rk.right
    }
  }
  return out
}
