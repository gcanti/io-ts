/**
 * @since 2.2.7
 */
import { Alt2C } from 'fp-ts/lib/Alt'
import { Applicative2C } from 'fp-ts/lib/Applicative'
import { Apply2C } from 'fp-ts/lib/Apply'
import { Bifunctor2 } from 'fp-ts/lib/Bifunctor'
import * as E from 'fp-ts/lib/Either'
import { Functor2C } from 'fp-ts/lib/Functor'
import { Kind2, URIS2 } from 'fp-ts/lib/HKT'
import { Monad2C } from 'fp-ts/lib/Monad'
import { MonadThrow2C } from 'fp-ts/lib/MonadThrow'
import * as G from './Guard'
import { intersect_, Literal, memoize } from './Schemable'
import { Lazy } from 'fp-ts/lib/function'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 2.2.7
 */
export interface Kleisli2<M extends URIS2, I, E, A> {
  readonly decode: (i: I) => Kind2<M, E, A>
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 2.2.7
 */
export const fromGuard = <M extends URIS2, E>(M: MonadThrow2C<M, E>) => <A, I>(
  guard: G.Guard<A>,
  onError: (i: I) => E
): Kleisli2<M, I, E, A> => ({
  decode: (i) => (guard.is(i) ? M.of<A>(i) : M.throwError(onError(i)))
})

/**
 * @category constructors
 * @since 2.2.7
 */
export const literal = <M extends URIS2, E>(M: MonadThrow2C<M, E>) => <I>(
  onError: (i: I, values: readonly [Literal, ...Array<Literal>]) => E
) => <A extends readonly [Literal, ...Array<Literal>]>(...values: A): Kleisli2<M, I, E, A[number]> => ({
  decode: (i) => (G.literal(...values).is(i) ? M.of<A[number]>(i) : M.throwError(onError(i, values)))
})

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 2.2.7
 */
export const mapLeftWithInput = <M extends URIS2>(M: Bifunctor2<M>) => <I, E>(f: (i: I, e: E) => E) => <A>(
  decoder: Kleisli2<M, I, E, A>
): Kleisli2<M, I, E, A> => ({
  decode: (i) => M.mapLeft(decoder.decode(i), (e) => f(i, e))
})

/**
 * @category combinators
 * @since 2.2.7
 */
export const refine = <M extends URIS2, E>(M: MonadThrow2C<M, E> & Bifunctor2<M>) => <A, B extends A>(
  refinement: (a: A) => a is B,
  onError: (a: A) => E
) => <I>(from: Kleisli2<M, I, E, A>): Kleisli2<M, I, E, B> => ({
  decode: (u) => M.chain(from.decode(u), (a) => (refinement(a) ? M.of(a) : M.throwError(onError(a))))
})

/**
 * @category combinators
 * @since 2.2.7
 */
export const parse = <M extends URIS2, E>(M: Monad2C<M, E>) => <A, B>(parser: (a: A) => Kind2<M, E, B>) => <I>(
  from: Kleisli2<M, I, E, A>
): Kleisli2<M, I, E, B> => ({
  decode: (u) => M.chain(from.decode(u), (a) => parser(a))
})

/**
 * @category combinators
 * @since 2.2.7
 */
export const nullable = <M extends URIS2, E>(M: Applicative2C<M, E> & Bifunctor2<M>) => <I>(
  onError: (i: I, e: E) => E
) => <A>(or: Kleisli2<M, I, E, A>): Kleisli2<M, I, E, null | A> => ({
  decode: (i) =>
    i === null
      ? M.of<null | A>(null)
      : M.bimap(
          or.decode(i),
          (e) => onError(i, e),
          (a): A | null => a
        )
})

/**
 * @category combinators
 * @since 2.2.7
 */
export function type<M extends URIS2, E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
): (
  onKeyError: (key: string, e: E) => E
) => <I, A>(
  properties: { [K in keyof A]: Kleisli2<M, I, E, A[K]> }
) => Kleisli2<M, Record<string, I>, E, { [K in keyof A]: A[K] }> {
  const traverse = traverseRecordWithIndex(M)
  return (onKeyError) => (properties) => ({
    decode: (i) =>
      traverse(properties as Record<string, Kleisli2<M, unknown, E, unknown>>, (k, decoder) =>
        M.mapLeft(decoder.decode(i[k]), (e) => onKeyError(k, e))
      ) as any
  })
}

/**
 * @category combinators
 * @since 2.2.7
 */
export function partial<M extends URIS2, E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
): (
  onKeyError: (key: string, e: E) => E
) => <I, A>(
  properties: { [K in keyof A]: Kleisli2<M, I, E, A[K]> }
) => Kleisli2<M, Record<string, I>, E, Partial<{ [K in keyof A]: A[K] }>> {
  const traverse = traverseRecordWithIndex(M)
  const skip = M.of<E.Either<void, unknown>>(E.left(undefined))
  const undef = M.of<E.Either<void, unknown>>(E.right(undefined))
  return (onKeyError) => (properties) => ({
    decode: (i) =>
      M.map(
        traverse(properties as Record<string, Kleisli2<M, unknown, E, unknown>>, (k, decoder) => {
          const ik = i[k]
          if (ik === undefined) {
            return k in i
              ? // don't strip undefined properties
                undef
              : // don't add missing properties
                skip
          }
          return M.bimap(
            decoder.decode(ik),
            (e) => onKeyError(k, e),
            (a) => E.right<void, unknown>(a)
          )
        }),
        compactRecord
      ) as any
  })
}

/**
 * @category combinators
 * @since 2.2.7
 */
export function array<M extends URIS2, E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
): (
  onItemError: (index: number, e: E) => E
) => <I, A>(items: Kleisli2<M, I, E, A>) => Kleisli2<M, Array<I>, E, Array<A>> {
  const traverse = traverseArrayWithIndex(M)
  return (onItemError) => (items) => ({
    decode: (is) => traverse(is, (index, i) => M.mapLeft(items.decode(i), (e) => onItemError(index, e)))
  })
}

/**
 * @category combinators
 * @since 2.2.7
 */
export function record<M extends URIS2, E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
): (
  onKeyError: (key: string, e: E) => E
) => <I, A>(codomain: Kleisli2<M, I, E, A>) => Kleisli2<M, Record<string, I>, E, Record<string, A>> {
  const traverse = traverseRecordWithIndex(M)
  return (onKeyError) => (codomain) => ({
    decode: (ir) => traverse(ir, (key, i) => M.mapLeft(codomain.decode(i), (e) => onKeyError(key, e)))
  })
}

/**
 * @category combinators
 * @since 2.2.7
 */
export function tuple<M extends URIS2, E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
): (
  onIndexError: (index: number, e: E) => E
) => <I, A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: Kleisli2<M, I, E, A[K]> }
) => Kleisli2<M, Array<I>, E, A> {
  const traverse = traverseArrayWithIndex(M)
  return (onIndexError) => (...components) => ({
    decode: (is) =>
      traverse((components as unknown) as Array<Kleisli2<M, unknown, E, unknown>>, (index, decoder) =>
        M.mapLeft(decoder.decode(is[index]), (e) => onIndexError(index, e))
      ) as any
  })
}

/**
 * @category combinators
 * @since 2.2.7
 */
export const union = <M extends URIS2, E>(M: Alt2C<M, E> & Bifunctor2<M>) => (
  onMemberError: (index: number, e: E) => E
) => <I, A extends readonly [unknown, ...Array<unknown>]>(
  ...members: { [K in keyof A]: Kleisli2<M, I, E, A[K]> }
): Kleisli2<M, I, E, A[number]> => ({
  decode: (i) => {
    let out: Kind2<M, E, unknown> = M.mapLeft(members[0].decode(i), (e) => onMemberError(0, e))
    for (let index = 1; index < members.length; index++) {
      out = M.alt(out, () => M.mapLeft(members[index].decode(i), (e) => onMemberError(index, e)))
    }
    return out
  }
})

/**
 * @category combinators
 * @since 2.2.7
 */
export const intersect = <M extends URIS2, E>(M: Apply2C<M, E>) => <IB, B>(right: Kleisli2<M, IB, E, B>) => <IA, A>(
  left: Kleisli2<M, IA, E, A>
): Kleisli2<M, IA & IB, E, A & B> => ({
  decode: (i) =>
    M.ap(
      M.map(left.decode(i), (a: A) => (b: B) => intersect_(a, b)),
      right.decode(i)
    )
})

/**
 * @category combinators
 * @since 2.2.7
 */
export const sum = <M extends URIS2, E>(M: MonadThrow2C<M, E>) => (
  onTagError: (tag: string, value: unknown, tags: ReadonlyArray<string>) => E
) => <T extends string>(
  tag: T
): (<I extends Record<string, unknown>, A>(
  members: { [K in keyof A]: Kleisli2<M, I, E, A[K]> }
) => Kleisli2<M, I, E, A[keyof A]>) => {
  return <I extends Record<string, unknown>, A>(
    members: { [K in keyof A]: Kleisli2<M, I, E, A[K]> }
  ): Kleisli2<M, I, E, A[keyof A]> => {
    const keys = Object.keys(members)
    return {
      decode: (ir) => {
        const v = ir[tag]
        if (v in members) {
          return (members as any)[v].decode(ir)
        }
        return M.throwError(onTagError(tag, v, keys))
      }
    }
  }
}

/**
 * @category combinators
 * @since 2.2.7
 */
export const lazy = <M extends URIS2>(M: Bifunctor2<M>) => <E>(
  onError: (id: string, e: E) => E
): (<I, A>(id: string, f: () => Kleisli2<M, I, E, A>) => Kleisli2<M, I, E, A>) => {
  return <I, A>(id: string, f: () => Kleisli2<M, I, E, A>): Kleisli2<M, I, E, A> => {
    const get = memoize<void, Kleisli2<M, I, E, A>>(f)
    return {
      decode: (u) => M.mapLeft(get().decode(u), (e) => onError(id, e))
    }
  }
}

/**
 * @category combinators
 * @since 2.2.7
 */
export const pipe = <M extends URIS2, E>(M: Monad2C<M, E>) => <I, A, B>(
  ia: Kleisli2<M, I, E, A>,
  ab: Kleisli2<M, A, E, B>
): Kleisli2<M, I, E, B> => ({
  decode: (i) => M.chain(ia.decode(i), ab.decode)
})

/**
 * @category combinators
 * @since 2.2.7
 */
export const map = <F extends URIS2, E>(F: Functor2C<F, E>) => <A, B>(f: (a: A) => B) => <I>(
  ia: Kleisli2<F, I, E, A>
): Kleisli2<F, I, E, B> => ({
  decode: (i) => F.map(ia.decode(i), f)
})

/**
 * @category combinators
 * @since 2.2.7
 */
export const alt = <F extends URIS2, E>(A: Alt2C<F, E>) => <I, A>(that: Lazy<Kleisli2<F, I, E, A>>) => (
  me: Kleisli2<F, I, E, A>
): Kleisli2<F, I, E, A> => ({
  decode: (i) => A.alt(me.decode(i), () => that().decode(i))
})

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
