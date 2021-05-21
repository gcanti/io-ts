/**
 * **This module is experimental**
 *
 * Experimental features are published in order to get early feedback from the community, see these tracking
 * [issues](https://github.com/gcanti/io-ts/issues?q=label%3Av2.2+) for further discussions and enhancements.
 *
 * A feature tagged as _Experimental_ is in a high state of flux, you're at risk of it changing without notice.
 *
 * @since 2.2.2
 */
import * as E from 'fp-ts/lib/Eq'
import * as RA from 'fp-ts/lib/ReadonlyArray'
import * as RR from 'fp-ts/lib/ReadonlyRecord'
import * as D from './poc'
import { Schemable1 } from './Schemable2'
import Eq = E.Eq

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * @category primitives
 * @since 2.2.2
 */
export const string: Eq<string> = E.eqString

/**
 * @category primitives
 * @since 2.2.2
 */
export const number: Eq<number> = E.eqNumber

/**
 * @category primitives
 * @since 2.2.2
 */
export const boolean: Eq<boolean> = E.eqBoolean

/**
 * @category primitives
 * @since 2.2.2
 */
export const UnknownArray: Eq<Array<unknown>> = E.fromEquals((first, second) => first.length === second.length)

/**
 * @category primitives
 * @since 2.2.2
 */
export const UnknownRecord: Eq<Record<string, unknown>> = E.fromEquals((first, second) => {
  for (const k in first) {
    if (!(k in second)) {
      return false
    }
  }
  for (const k in second) {
    if (!(k in first)) {
      return false
    }
  }
  return true
})

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 2.2.2
 */
export const nullable = <A>(or: Eq<A>): Eq<null | A> => ({
  equals: (first, second) => (first === null || second === null ? first === second : or.equals(first, second))
})

/**
 * @category combinators
 * @since 2.2.2
 */
export const tuple: <A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: Eq<A[K]> }
) => Eq<A> = E.getTupleEq as any

/**
 * @category combinators
 * @since 2.2.15
 */
export const struct: <A>(eqs: { [K in keyof A]: Eq<A[K]> }) => Eq<{ [K in keyof A]: A[K] }> = E.getStructEq

/**
 * @category combinators
 * @since 2.2.2
 */
export const partial = <A>(properties: { [K in keyof A]: Eq<A[K]> }): Eq<Partial<{ [K in keyof A]: A[K] }>> =>
  E.fromEquals((first, second) => {
    for (const k in properties) {
      const xk = first[k]
      const yk = second[k]
      if (!(xk === undefined || yk === undefined ? xk === yk : properties[k].equals(xk!, yk!))) {
        return false
      }
    }
    return true
  })

/**
 * @category combinators
 * @since 2.2.2
 */
export const array: <A>(eq: Eq<A>) => Eq<Array<A>> = RA.getEq

/**
 * @category combinators
 * @since 2.2.2
 */
export const record: <A>(codomain: Eq<A>) => Eq<Record<string, A>> = RR.getEq

/**
 * @category combinators
 * @since 2.2.2
 */
export const intersect = <B>(right: Eq<B>) => <A>(left: Eq<A>): Eq<A & B> =>
  E.fromEquals((first, second) => left.equals(first, second) && right.equals(first, second))

/**
 * @category combinators
 * @since 2.2.2
 */
export function lazy<A>(f: () => Eq<A>): Eq<A> {
  const get = D.memoize<void, Eq<A>>(f)
  return {
    equals: (first, second) => get().equals(first, second)
  }
}

/**
 * @category combinators
 * @since 2.2.2
 */
export const sum = <T extends string>(
  tag: T
): (<A>(members: { [K in keyof A]: Eq<A[K] & Record<T, K>> }) => Eq<A[keyof A]>) => {
  return (members: Record<string, Eq<any>>) =>
    E.fromEquals((first: Record<string, any>, second: Record<string, any>) => {
      const ftag = first[tag]
      return ftag === second[tag] && members[ftag].equals(first, second)
    })
}

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 2.2.17
 */
export const URI = 'io-ts/toEq'

/**
 * @category instances
 * @since 2.2.17
 */
export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly [URI]: Eq<D.TypeOf<A>>
  }
}

/**
 * @category instances
 * @since 2.2.17
 */
export const toEq: Schemable1<URI> = {
  URI: 'io-ts/toEq',
  string,
  number,
  boolean,
  UnknownArray,
  UnknownRecord,
  literal: () => E.eqStrict,
  tuple: tuple as any,
  struct: struct as any,
  partial: partial as any,
  array,
  record,
  nullable,
  intersect,
  lazy: (_, f) => lazy(f),
  sum: sum as any
}
