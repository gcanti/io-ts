/**
 * **This module is experimental**
 *
 * Experimental features are published in order to get early feedback from the community, see these tracking
 * [issues](https://github.com/gcanti/io-ts/issues?q=label%3Av2.2+) for further discussions and enhancements.
 *
 * A feature tagged as _Experimental_ is in a high state of flux, you're at risk of it changing without notice.
 *
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
import { Lazy, Refinement } from 'fp-ts/lib/function'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 2.2.7
 */
export interface Kleisli<M extends URIS2, I, E, A> {
  readonly decode: (i: I) => Kind2<M, E, A>
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 2.2.7
 */
export function fromRefinement<M extends URIS2, E>(
  M: MonadThrow2C<M, E>
): <I, A extends I>(refinement: Refinement<I, A>, onError: (i: I) => E) => Kleisli<M, I, E, A> {
  return (refinement, onError) => ({
    decode: (i) => (refinement(i) ? M.of(i) : M.throwError(onError(i)))
  })
}

/**
 * @category constructors
 * @since 2.2.7
 */
export function literal<M extends URIS2, E>(
  M: MonadThrow2C<M, E>
): <I>(
  onError: (i: I, values: readonly [Literal, ...Array<Literal>]) => E
) => <A extends readonly [Literal, ...Array<Literal>]>(...values: A) => Kleisli<M, I, E, A[number]> {
  return (onError) => <A extends readonly [Literal, ...Array<Literal>]>(...values: A) => ({
    decode: (i) => (G.literal(...values).is(i) ? M.of<A[number]>(i) : M.throwError(onError(i, values)))
  })
}

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 2.2.7
 */
export function mapLeftWithInput<M extends URIS2>(
  M: Bifunctor2<M>
): <I, E>(f: (i: I, e: E) => E) => <A>(decoder: Kleisli<M, I, E, A>) => Kleisli<M, I, E, A> {
  return (f) => (decoder) => ({
    decode: (i) => M.mapLeft(decoder.decode(i), (e) => f(i, e))
  })
}

/**
 * @category combinators
 * @since 2.2.7
 */
export function refine<M extends URIS2, E>(
  M: MonadThrow2C<M, E> & Bifunctor2<M>
): <A, B extends A>(
  refinement: (a: A) => a is B,
  onError: (a: A) => E
) => <I>(from: Kleisli<M, I, E, A>) => Kleisli<M, I, E, B> {
  return (refinement, onError) => (from) => compose(M)(fromRefinement(M)(refinement, onError))(from)
}

/**
 * @category combinators
 * @since 2.2.7
 */
export function parse<M extends URIS2, E>(
  M: Monad2C<M, E>
): <A, B>(decode: (a: A) => Kind2<M, E, B>) => <I>(from: Kleisli<M, I, E, A>) => Kleisli<M, I, E, B> {
  return (decode) => (from) => compose(M)({ decode })(from)
}

/**
 * @category combinators
 * @since 2.2.7
 */
export function nullable<M extends URIS2, E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
): <I>(onError: (i: I, e: E) => E) => <A>(or: Kleisli<M, I, E, A>) => Kleisli<M, null | I, E, null | A> {
  return <I>(onError: (i: I, e: E) => E) => <A>(or: Kleisli<M, I, E, A>): Kleisli<M, null | I, E, null | A> => ({
    decode: (i) =>
      i === null
        ? M.of<null | A>(null)
        : M.bimap(
            or.decode(i),
            (e) => onError(i, e),
            (a): A | null => a
          )
  })
}

/**
 * @category combinators
 * @since 2.2.7
 */
export function fromType<M extends URIS2, E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
): (
  onPropertyError: (key: string, e: E) => E
) => <P extends Record<string, Kleisli<M, any, E, any>>>(
  properties: P
) => Kleisli<M, { [K in keyof P]: InputOf<M, P[K]> }, E, { [K in keyof P]: TypeOf<M, P[K]> }> {
  const traverse = traverseRecordWithIndex(M)
  return (onPropertyError) => (properties) => ({
    decode: (i) =>
      traverse(properties as Record<string, Kleisli<M, unknown, E, unknown>>, (key, decoder) =>
        M.mapLeft(decoder.decode(i[key]), (e) => onPropertyError(key, e))
      ) as any
  })
}

/**
 * @category combinators
 * @since 2.2.7
 */
export function fromPartial<M extends URIS2, E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
): (
  onPropertyError: (key: string, e: E) => E
) => <P extends Record<string, Kleisli<M, any, E, any>>>(
  properties: P
) => Kleisli<M, Partial<{ [K in keyof P]: InputOf<M, P[K]> }>, E, Partial<{ [K in keyof P]: TypeOf<M, P[K]> }>> {
  const traverse = traverseRecordWithIndex(M)
  const undefinedProperty = M.of<E.Either<void, unknown>>(E.right(undefined))
  const skipProperty = M.of<E.Either<void, unknown>>(E.left(undefined))
  return (onPropertyError) => (properties) => ({
    decode: (i) =>
      M.map(
        traverse(properties as Record<string, Kleisli<M, unknown, E, unknown>>, (key, decoder) => {
          const ikey = i[key]
          if (ikey === undefined) {
            return key in i
              ? // don't strip undefined properties
                undefinedProperty
              : // don't add missing properties
                skipProperty
          }
          return M.bimap(
            decoder.decode(ikey),
            (e) => onPropertyError(key, e),
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
export function fromArray<M extends URIS2, E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
): (onItemError: (index: number, e: E) => E) => <I, A>(item: Kleisli<M, I, E, A>) => Kleisli<M, Array<I>, E, Array<A>> {
  const traverse = traverseArrayWithIndex(M)
  return (onItemError) => (item) => ({
    decode: (is) => traverse(is, (index, i) => M.mapLeft(item.decode(i), (e) => onItemError(index, e)))
  })
}

/**
 * @category combinators
 * @since 2.2.7
 */
export function fromRecord<M extends URIS2, E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
): (
  onKeyError: (key: string, e: E) => E
) => <I, A>(codomain: Kleisli<M, I, E, A>) => Kleisli<M, Record<string, I>, E, Record<string, A>> {
  const traverse = traverseRecordWithIndex(M)
  return (onKeyError) => (codomain) => ({
    decode: (ir) => traverse(ir, (key, i) => M.mapLeft(codomain.decode(i), (e) => onKeyError(key, e)))
  })
}

/**
 * @category combinators
 * @since 2.2.7
 */
export function fromTuple<M extends URIS2, E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
): (
  onIndexError: (index: number, e: E) => E
) => <C extends ReadonlyArray<Kleisli<M, any, E, any>>>(
  ...components: C
) => Kleisli<M, { [K in keyof C]: InputOf<M, C[K]> }, E, { [K in keyof C]: TypeOf<M, C[K]> }> {
  const traverse = traverseArrayWithIndex(M)
  return (onIndexError) => (...components) => ({
    decode: (is) =>
      traverse((components as unknown) as Array<Kleisli<M, unknown, E, unknown>>, (index, decoder) =>
        M.mapLeft(decoder.decode(is[index]), (e) => onIndexError(index, e))
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
  onMemberError: (index: number, e: E) => E
) => <MS extends readonly [Kleisli<M, any, E, any>, ...Array<Kleisli<M, any, E, any>>]>(
  ...members: MS
) => Kleisli<M, InputOf<M, MS[keyof MS]>, E, TypeOf<M, MS[keyof MS]>> {
  return (onMemberError) => <MS extends readonly [Kleisli<M, any, E, any>, ...Array<Kleisli<M, any, E, any>>]>(
    ...members: MS
  ) => ({
    decode: (i) => {
      let out: Kind2<M, E, TypeOf<M, MS[keyof MS]>> = M.mapLeft(members[0].decode(i), (e) => onMemberError(0, e))
      for (let index = 1; index < members.length; index++) {
        out = M.alt(out, () => M.mapLeft(members[index].decode(i), (e) => onMemberError(index, e)))
      }
      return out
    }
  })
}

/**
 * @category combinators
 * @since 2.2.7
 */
export function intersect<M extends URIS2, E>(
  M: Apply2C<M, E>
): <IB, B>(right: Kleisli<M, IB, E, B>) => <IA, A>(left: Kleisli<M, IA, E, A>) => Kleisli<M, IA & IB, E, A & B> {
  return <IB, B>(right: Kleisli<M, IB, E, B>) => <IA, A>(
    left: Kleisli<M, IA, E, A>
  ): Kleisli<M, IA & IB, E, A & B> => ({
    decode: (i) =>
      M.ap(
        M.map(left.decode(i), (a: A) => (b: B) => intersect_(a, b)),
        right.decode(i)
      )
  })
}

/**
 * @category combinators
 * @since 2.2.7
 */
export function fromSum<M extends URIS2, E>(
  M: MonadThrow2C<M, E>
): (
  onTagError: (tag: string, value: unknown, tags: ReadonlyArray<string>) => E
) => <T extends string>(
  tag: T
) => <MS extends Record<string, Kleisli<M, any, E, any>>>(
  members: MS
) => Kleisli<M, InputOf<M, MS[keyof MS]>, E, TypeOf<M, MS[keyof MS]>> {
  return (onTagError) => (tag) => <I extends Record<string, unknown>, A>(
    members: { [K in keyof A]: Kleisli<M, I, E, A[K]> }
  ): Kleisli<M, I, E, A[keyof A]> => {
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
export function lazy<M extends URIS2>(
  M: Bifunctor2<M>
): <E>(onError: (id: string, e: E) => E) => <I, A>(id: string, f: () => Kleisli<M, I, E, A>) => Kleisli<M, I, E, A> {
  return <E>(onError: (id: string, e: E) => E) => <I, A>(
    id: string,
    f: () => Kleisli<M, I, E, A>
  ): Kleisli<M, I, E, A> => {
    const get = memoize<void, Kleisli<M, I, E, A>>(f)
    return {
      decode: (u) => M.mapLeft(get().decode(u), (e) => onError(id, e))
    }
  }
}

/**
 * @category combinators
 * @since 2.2.7
 */
export function compose<M extends URIS2, E>(
  M: Monad2C<M, E>
): <A, B>(ab: Kleisli<M, A, E, B>) => <I>(ia: Kleisli<M, I, E, A>) => Kleisli<M, I, E, B> {
  return (ab) => (ia) => ({
    decode: (i) => M.chain(ia.decode(i), ab.decode)
  })
}

/**
 * @category combinators
 * @since 2.2.8
 */
export function id<M extends URIS2, E>(M: Applicative2C<M, E>): <A>() => Kleisli<M, A, E, A> {
  return () => ({
    decode: M.of
  })
}

/**
 * @category combinators
 * @since 2.2.7
 */
export function map<F extends URIS2, E>(
  F: Functor2C<F, E>
): <A, B>(f: (a: A) => B) => <I>(ia: Kleisli<F, I, E, A>) => Kleisli<F, I, E, B> {
  return (f) => (ia) => ({
    decode: (i) => F.map(ia.decode(i), f)
  })
}

/**
 * @category combinators
 * @since 2.2.7
 */
export function alt<F extends URIS2, E>(
  A: Alt2C<F, E>
): <I, A>(that: Lazy<Kleisli<F, I, E, A>>) => (me: Kleisli<F, I, E, A>) => Kleisli<F, I, E, A> {
  return (that) => (me) => ({
    decode: (i) => A.alt(me.decode(i), () => that().decode(i))
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

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.7
 */
export type TypeOf<M extends URIS2, KD> = KD extends Kleisli<M, any, any, infer A> ? A : never

/**
 * @since 2.2.7
 */
export type InputOf<M extends URIS2, KD> = KD extends Kleisli<M, infer I, any, any> ? I : never
