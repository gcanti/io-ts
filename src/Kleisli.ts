/**
 * @since 3.0.0
 */
import { Alt2C } from 'fp-ts/Alt'
import { Applicative2C } from 'fp-ts/Applicative'
import { Apply2C } from 'fp-ts/Apply'
import { Bifunctor2 } from 'fp-ts/Bifunctor'
import * as E from 'fp-ts/Either'
import { FromEither2C } from 'fp-ts/FromEither'
import { flow, Lazy, pipe, Refinement } from 'fp-ts/function'
import { Functor2C } from 'fp-ts/Functor'
import { Kind2, URIS2 } from 'fp-ts/HKT'
import { Monad2C } from 'fp-ts/Monad'
import * as O from 'fp-ts/Option'
import * as A from 'fp-ts/ReadonlyArray'
import * as R from 'fp-ts/ReadonlyRecord'
import * as G from './Guard'
import { intersect_, Literal, memoize } from './Schemable'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 3.0.0
 */
export interface Kleisli<M extends URIS2, I, E, A> {
  readonly decode: (i: I) => Kind2<M, E, A>
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 3.0.0
 */
export function fromRefinement<M extends URIS2, E>(
  M: FromEither2C<M, E>
): <I, A extends I>(refinement: Refinement<I, A>, onError: (i: I) => E) => Kleisli<M, I, E, A> {
  return (refinement, onError) => ({
    decode: (i) => M.fromEither(refinement(i) ? E.right(i) : E.left(onError(i)))
  })
}

/**
 * @category constructors
 * @since 3.0.0
 */
export function literal<M extends URIS2, E>(
  M: FromEither2C<M, E>
): <I>(
  onError: (i: I, values: readonly [Literal, ...Array<Literal>]) => E
) => <A extends readonly [Literal, ...Array<Literal>]>(...values: A) => Kleisli<M, I, E, A[number]> {
  return (onError) => <A extends readonly [Literal, ...Array<Literal>]>(...values: A) => ({
    decode: (i) => M.fromEither(G.literal(...values).is(i) ? E.right(i) : E.left(onError(i, values)))
  })
}

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 3.0.0
 */
export function mapLeftWithInput<M extends URIS2>(
  M: Bifunctor2<M>
): <I, E>(f: (i: I, e: E) => E) => <A>(decoder: Kleisli<M, I, E, A>) => Kleisli<M, I, E, A> {
  return (f) => (decoder) => ({
    decode: (i) =>
      pipe(
        decoder.decode(i),
        M.mapLeft((e) => f(i, e))
      )
  })
}

/**
 * @category combinators
 * @since 3.0.0
 */
export function refine<M extends URIS2, E>(
  M: Monad2C<M, E> & FromEither2C<M, E> & Bifunctor2<M>
): <A, B extends A>(
  refinement: (a: A) => a is B,
  onError: (a: A) => E
) => <I>(from: Kleisli<M, I, E, A>) => Kleisli<M, I, E, B> {
  return (refinement, onError) => (from) => compose(M)(fromRefinement(M)(refinement, onError))(from)
}

/**
 * @category combinators
 * @since 3.0.0
 */
export function parse<M extends URIS2, E>(
  M: Monad2C<M, E>
): <A, B>(decode: (a: A) => Kind2<M, E, B>) => <I>(from: Kleisli<M, I, E, A>) => Kleisli<M, I, E, B> {
  return (decode) => (from) => compose(M)({ decode })(from)
}

/**
 * @category combinators
 * @since 3.0.0
 */
export function nullable<M extends URIS2, E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
): <I>(onError: (i: I, e: E) => E) => <A>(or: Kleisli<M, I, E, A>) => Kleisli<M, null | I, E, null | A> {
  return <I>(onError: (i: I, e: E) => E) => <A>(or: Kleisli<M, I, E, A>): Kleisli<M, null | I, E, null | A> => ({
    decode: (i) =>
      i === null
        ? M.of<null | A>(null)
        : pipe(
            or.decode(i),
            M.bimap(
              (e) => onError(i, e),
              (a): A | null => a
            )
          )
  })
}

/**
 * @category combinators
 * @since 3.0.0
 */
export function fromType<M extends URIS2, E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
): (
  onPropertyError: (key: string, e: E) => E
) => <P extends Record<string, Kleisli<M, any, E, any>>>(
  properties: P
) => Kleisli<M, { [K in keyof P]: InputOf<M, P[K]> }, E, { [K in keyof P]: TypeOf<M, P[K]> }> {
  const traverse = R.traverseWithIndex(M)
  return (onPropertyError) => (properties) => ({
    decode: (i) =>
      pipe(
        properties as Record<string, Kleisli<M, unknown, E, unknown>>,
        traverse((key, decoder) =>
          pipe(
            decoder.decode(i[key]),
            M.mapLeft((e) => onPropertyError(key, e))
          )
        )
      ) as any
  })
}

/**
 * @category combinators
 * @since 3.0.0
 */
export function fromPartial<M extends URIS2, E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
): (
  onPropertyError: (key: string, e: E) => E
) => <P extends Record<string, Kleisli<M, any, E, any>>>(
  properties: P
) => Kleisli<M, Partial<{ [K in keyof P]: InputOf<M, P[K]> }>, E, Partial<{ [K in keyof P]: TypeOf<M, P[K]> }>> {
  const traverse = R.traverseWithIndex(M)
  const undefinedProperty = M.of<E.Either<void, unknown>>(E.right(undefined))
  const skipProperty = M.of<E.Either<void, unknown>>(E.left(undefined))
  return (onPropertyError) => (properties) => ({
    decode: (i) =>
      pipe(
        properties as Record<string, Kleisli<M, unknown, E, unknown>>,
        traverse((key, decoder) => {
          const ikey = i[key]
          if (ikey === undefined) {
            return key in i
              ? // don't strip undefined properties
                undefinedProperty
              : // don't add missing properties
                skipProperty
          }
          return pipe(
            decoder.decode(ikey),
            M.bimap(
              (e) => onPropertyError(key, e),
              (a) => E.right<unknown, void>(a)
            )
          )
        }),
        M.map(flow(R.map(O.fromEither), R.compact))
      ) as any
  })
}

/**
 * @category combinators
 * @since 3.0.0
 */
export function fromArray<M extends URIS2, E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
): (onItemError: (index: number, e: E) => E) => <I, A>(item: Kleisli<M, I, E, A>) => Kleisli<M, Array<I>, E, Array<A>> {
  const traverse = A.traverseWithIndex(M)
  return (onItemError) => (item) => ({
    decode: (is) =>
      pipe(
        is,
        traverse((index, i) =>
          pipe(
            item.decode(i),
            M.mapLeft((e) => onItemError(index, e))
          )
        )
      ) as any
  })
}

/**
 * @category combinators
 * @since 3.0.0
 */
export function fromRecord<M extends URIS2, E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
): (
  onKeyError: (key: string, e: E) => E
) => <I, A>(codomain: Kleisli<M, I, E, A>) => Kleisli<M, Record<string, I>, E, Record<string, A>> {
  const traverse = R.traverseWithIndex(M)
  return (onKeyError) => (codomain) => ({
    decode: (ir) =>
      pipe(
        ir,
        traverse((key, i) =>
          pipe(
            codomain.decode(i),
            M.mapLeft((e) => onKeyError(key, e))
          )
        )
      )
  })
}

/**
 * @category combinators
 * @since 3.0.0
 */
export function fromTuple<M extends URIS2, E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
): (
  onIndexError: (index: number, e: E) => E
) => <C extends ReadonlyArray<Kleisli<M, any, E, any>>>(
  ...components: C
) => Kleisli<M, { [K in keyof C]: InputOf<M, C[K]> }, E, { [K in keyof C]: TypeOf<M, C[K]> }> {
  const traverse = A.traverseWithIndex(M)
  return (onIndexError) => (...components) => ({
    decode: (is) =>
      pipe(
        (components as unknown) as Array<Kleisli<M, unknown, E, unknown>>,
        traverse((index, decoder) =>
          pipe(
            decoder.decode(is[index]),
            M.mapLeft((e) => onIndexError(index, e))
          )
        )
      ) as any
  })
}

/**
 * @category combinators
 * @since 3.0.0
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
      let out: Kind2<M, E, TypeOf<M, MS[keyof MS]>> = pipe(
        members[0].decode(i),
        M.mapLeft((e) => onMemberError(0, e))
      )
      for (let index = 1; index < members.length; index++) {
        out = pipe(
          out,
          M.alt(() =>
            pipe(
              members[index].decode(i),
              M.mapLeft((e) => onMemberError(index, e))
            )
          )
        )
      }
      return out
    }
  })
}

/**
 * @category combinators
 * @since 3.0.0
 */
export function intersect<M extends URIS2, E>(
  M: Apply2C<M, E>
): <IB, B>(right: Kleisli<M, IB, E, B>) => <IA, A>(left: Kleisli<M, IA, E, A>) => Kleisli<M, IA & IB, E, A & B> {
  return <IB, B>(right: Kleisli<M, IB, E, B>) => <IA, A>(
    left: Kleisli<M, IA, E, A>
  ): Kleisli<M, IA & IB, E, A & B> => ({
    decode: (i) =>
      pipe(
        left.decode(i),
        M.map((a: A) => (b: B) => intersect_(a, b)),
        M.ap(right.decode(i))
      )
  })
}

/**
 * @category combinators
 * @since 3.0.0
 */
export function fromSum<M extends URIS2, E>(
  M: FromEither2C<M, E>
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
        const v: any = ir[tag]
        if (v in members) {
          return (members as any)[v].decode(ir)
        }
        return M.fromEither(E.left(onTagError(tag, v, keys)))
      }
    }
  }
}

/**
 * @category combinators
 * @since 3.0.0
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
      decode: (u) =>
        pipe(
          get().decode(u),
          M.mapLeft((e) => onError(id, e))
        )
    }
  }
}

/**
 * @category combinators
 * @since 3.0.0
 */
export function compose<M extends URIS2, E>(
  M: Monad2C<M, E>
): <A, B>(ab: Kleisli<M, A, E, B>) => <I>(ia: Kleisli<M, I, E, A>) => Kleisli<M, I, E, B> {
  return (ab) => (ia) => ({
    decode: flow(ia.decode, M.chain(ab.decode))
  })
}

/**
 * @category combinators
 * @since 3.0.0
 */
export function id<M extends URIS2, E>(M: Applicative2C<M, E>): <A>() => Kleisli<M, A, E, A> {
  return () => ({
    decode: M.of
  })
}

/**
 * @category combinators
 * @since 3.0.0
 */
export function map<F extends URIS2, E>(
  F: Functor2C<F, E>
): <A, B>(f: (a: A) => B) => <I>(ia: Kleisli<F, I, E, A>) => Kleisli<F, I, E, B> {
  return (f) => (ia) => ({
    decode: (i) => pipe(ia.decode(i), F.map(f))
  })
}

/**
 * @category combinators
 * @since 3.0.0
 */
export function alt<F extends URIS2, E>(
  A: Alt2C<F, E>
): <I, A>(that: Lazy<Kleisli<F, I, E, A>>) => (me: Kleisli<F, I, E, A>) => Kleisli<F, I, E, A> {
  return (that) => (me) => ({
    decode: (i) =>
      pipe(
        me.decode(i),
        A.alt(() => that().decode(i))
      )
  })
}

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export type TypeOf<M extends URIS2, KD> = KD extends Kleisli<M, any, any, infer A> ? A : never

/**
 * @since 3.0.0
 */
export type InputOf<M extends URIS2, KD> = KD extends Kleisli<M, infer I, any, any> ? I : never
