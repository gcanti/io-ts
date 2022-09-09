/**
 * **This module is experimental**
 *
 * Experimental features are published in order to get early feedback from the community, see these tracking
 * [issues](https://github.com/gcanti/io-ts/issues?q=label%3Av2.2+) for further discussions and enhancements.
 *
 * A feature tagged as _Experimental_ is in a high state of flux, you're at risk of it changing without notice.
 *
 * @since 2.2.3
 */
import * as E from 'fp-ts/lib/Either'
import { identity, Refinement } from 'fp-ts/lib/function'
import { pipe } from 'fp-ts/lib/pipeable'
import * as t from './index'
import * as S from './Schemable'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 2.2.3
 */
export interface Type<A> extends t.Type<A, unknown, unknown> {}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 2.2.3
 */
export const literal = <A extends readonly [L, ...ReadonlyArray<L>], L extends S.Literal = S.Literal>(
  ...values: A
): Type<A[number]> => t.union(values.map((v) => t.literal(v as any)) as any)

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * @category primitives
 * @since 2.2.3
 */
export const string: Type<string> = t.string

/**
 * @category primitives
 * @since 2.2.3
 */
export const number: Type<number> = new t.Type(
  t.number.name,
  t.number.is,
  (u, c) =>
    pipe(
      t.number.decode(u),
      E.chain((n) => (isNaN(n) ? t.failure(u, c) : t.success(n)))
    ),
  t.number.encode
)

/**
 * @category primitives
 * @since 2.2.3
 */
export const boolean: Type<boolean> = t.boolean

/**
 * @category primitives
 * @since 2.2.3
 */
export const UnknownArray: Type<Array<unknown>> = t.UnknownArray

/**
 * @category primitives
 * @since 2.2.3
 */
export const UnknownRecord: Type<Record<string, unknown>> = t.UnknownRecord

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 2.2.3
 */
export const refine = <A, B extends A>(refinement: Refinement<A, B>, id: string) => (from: Type<A>): Type<B> =>
  // tslint:disable-next-line: deprecation
  t.refinement(from, refinement, id) as any

/**
 * @category combinators
 * @since 2.2.3
 */
export const nullable = <A>(or: Type<A>): Type<null | A> => t.union([t.null, or])

/**
 * @category combinators
 * @since 2.2.15
 */
export const struct = <A>(properties: { [K in keyof A]: Type<A[K]> }): Type<{ [K in keyof A]: A[K] }> =>
  t.type(properties) as any

/**
 * Use `struct` instead.
 *
 * @category combinators
 * @since 2.2.3
 * @deprecated
 */
export const type = struct

/**
 * @category combinators
 * @since 2.2.3
 */
export const partial = <A>(properties: { [K in keyof A]: Type<A[K]> }): Type<Partial<{ [K in keyof A]: A[K] }>> =>
  t.partial(properties)

/**
 * @category combinators
 * @since 2.2.3
 */
export const record = <A>(codomain: Type<A>): Type<Record<string, A>> => t.record(t.string, codomain)

/**
 * @category combinators
 * @since 2.2.3
 */
export const array = <A>(item: Type<A>): Type<Array<A>> => t.array(item)

/**
 * @category combinators
 * @since 2.2.3
 */
export const tuple = <A extends ReadonlyArray<unknown>>(...components: { [K in keyof A]: Type<A[K]> }): Type<A> =>
  t.tuple(components as any) as any

/**
 * @category combinators
 * @since 2.2.3
 */
export const intersect = <B>(right: Type<B>) => <A>(left: Type<A>): Type<A & B> => t.intersection([left, right])

/**
 * @category combinators
 * @since 2.2.3
 */
export const lazy = <A>(id: string, f: () => Type<A>): Type<A> => t.recursion(id, f)

/**
 * @category combinators
 * @since 2.2.15
 */
export const readonly: <A>(type: Type<A>) => Type<Readonly<A>> = identity

/**
 * @category combinators
 * @since 2.2.3
 */
export const sum = <T extends string>(_tag: T) => <A>(
  members: { [K in keyof A]: Type<A[K] & Record<T, K>> }
): Type<A[keyof A]> => t.union(Object.values(members) as any)

/**
 * @category combinators
 * @since 2.2.3
 */
export const union = <A extends readonly [unknown, ...Array<unknown>]>(
  ...members: { [K in keyof A]: Type<A[K]> }
): Type<A[number]> => t.union(members as any)

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 2.2.3
 */
export const URI = 'io-ts/Type'

/**
 * @category instances
 * @since 2.2.3
 */
export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly [URI]: Type<A>
  }
}

/**
 * @category instances
 * @since 2.2.8
 */
export const Schemable: S.Schemable1<URI> = {
  URI,
  literal,
  string,
  number,
  boolean,
  nullable,
  type,
  struct,
  partial,
  record,
  array,
  tuple: tuple as S.Schemable1<URI>['tuple'],
  intersect,
  sum,
  lazy,
  readonly
}

/**
 * @category instances
 * @since 2.2.8
 */
export const WithUnknownContainers: S.WithUnknownContainers1<URI> = {
  UnknownArray,
  UnknownRecord
}

/**
 * @category instances
 * @since 2.2.8
 */
export const WithUnion: S.WithUnion1<URI> = {
  union: union as S.WithUnion1<URI>['union']
}

/**
 * @category instances
 * @since 2.2.8
 */
export const WithRefine: S.WithRefine1<URI> = {
  refine: refine as S.WithRefine1<URI>['refine']
}
