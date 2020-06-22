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
import { Literal } from './Schemable'
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
export function literal<M extends URIS2, E>(
  M: MonadThrow2C<M, E>
): (
  onError: (u: unknown, values: readonly [Literal, ...Array<Literal>]) => E
) => <A extends readonly [Literal, ...Array<Literal>]>(...values: A) => DecoderT<M, E, A[number]> {
  return (onError) => (...values) => ({
    decode: (u) => (G.literal(...values).is(u) ? M.of(u) : M.throwError(onError(u, values)))
  })
}

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 2.2.7
 */
export function refinement<M extends URIS2, E>(
  M: MonadThrow2C<M, E> & Bifunctor2<M>
): <A, B extends A>(
  from: DecoderT<M, E, A>,
  refinement: (a: A) => a is B,
  onError: (u: unknown) => E
) => DecoderT<M, E, B> {
  return (from, refinement, onError) => ({
    decode: (u) => M.chain(from.decode(u), (a) => (refinement(a) ? M.of(a) : M.throwError(onError(u))))
  })
}

/**
 * @category combinators
 * @since 2.2.7
 */
export const nullable = <M extends URIS2, E>(M: Applicative2C<M, E> & Bifunctor2<M>) => (
  onError: (u: unknown, e: E) => E
) => <A>(or: DecoderT<M, E, A>): DecoderT<M, E, null | A> => ({
  decode: (u) =>
    u === null
      ? M.of<null | A>(u)
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

/**
 * @category combinators
 * @since 2.2.7
 */
export function union<M extends URIS2, E>(
  M: Alt2C<M, E> & Bifunctor2<M>
): (
  onMemberError: (i: number, e: E) => E
) => <A extends readonly [unknown, ...Array<unknown>]>(
  ...members: { [K in keyof A]: DecoderT<M, E, A[K]> }
) => DecoderT<M, E, A[number]> {
  return (onMemberError) => (...members) => ({
    decode: (u) => {
      let out: Kind2<M, E, unknown> = M.mapLeft(members[0].decode(u), (e) => onMemberError(0, e))
      for (let i = 1; i < members.length; i++) {
        out = M.alt(out, () => M.mapLeft(members[i].decode(u), (e) => onMemberError(i, e)))
      }
      return out
    }
  })
}

function typeOf(x: unknown): string {
  return x === null ? 'null' : typeof x
}

/**
 * @internal
 */
export function intersect<A, B>(a: A, b: B): A & B {
  if (a !== undefined && b !== undefined) {
    const tx = typeOf(a)
    const ty = typeOf(b)
    if (tx === 'object' || ty === 'object') {
      return Object.assign({}, a, b)
    }
  }
  return b as any
}

/**
 * @category combinators
 * @since 2.2.7
 */
export function intersection<M extends URIS2, E>(
  M: Apply2C<M, E>
): <A, B>(left: DecoderT<M, E, A>, right: DecoderT<M, E, B>) => DecoderT<M, E, A & B> {
  return <A, B>(left: DecoderT<M, E, A>, right: DecoderT<M, E, B>) => ({
    decode: (u) =>
      M.ap(
        M.map(left.decode(u), (a: A) => (b: B) => intersect(a, b)),
        right.decode(u)
      )
  })
}

/**
 * @category combinators
 * @since 2.2.7
 */
export function sum<M extends URIS2, E>(
  M: MonadThrow2C<M, E>
): (
  UnknownRecord: DecoderT<M, E, Record<string, unknown>>,
  onTagError: (tag: string, value: unknown, tags: ReadonlyArray<string>) => E
) => <T extends string>(
  tag: T
) => <A>(members: { [K in keyof A]: DecoderT<M, E, A[K]> }) => DecoderT<M, E, A[keyof A]> {
  return (UnknownRecord, onTagError) => (tag) => <A>(
    members: { [K in keyof A]: DecoderT<M, E, A[K]> }
  ): DecoderT<M, E, A[keyof A]> => {
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
