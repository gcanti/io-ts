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
import * as A from 'fp-ts/lib/Array'
import * as E from 'fp-ts/lib/Eq'
import { identity } from 'fp-ts/lib/function'
import * as R from 'fp-ts/lib/Record'
import { memoize, Schemable1, WithRefine1, WithUnknownContainers1 } from './Schemable'
import Eq = E.Eq

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.3
 */
export type URI = E.URI

/**
 * @since 2.2.2
 */
export type TypeOf<E> = E extends Eq<infer A> ? A : never

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
export const UnknownArray: Eq<Array<unknown>> = E.fromEquals((x, y) => x.length === y.length)

/**
 * @category primitives
 * @since 2.2.2
 */
export const UnknownRecord: Eq<Record<string, unknown>> = E.fromEquals((x, y) => {
  for (const k in x) {
    if (!(k in y)) {
      return false
    }
  }
  for (const k in y) {
    if (!(k in x)) {
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
export function nullable<A>(or: Eq<A>): Eq<null | A> {
  return {
    equals: (x, y) => (x === null || y === null ? x === y : or.equals(x, y))
  }
}

/**
 * @category combinators
 * @since 2.2.15
 */
export const struct: <A>(eqs: { [K in keyof A]: Eq<A[K]> }) => Eq<{ [K in keyof A]: A[K] }> = E.getStructEq

/**
 * Use `struct` instead.
 *
 * @category combinators
 * @since 2.2.2
 * @deprecated
 */
export const type = struct

/**
 * @category combinators
 * @since 2.2.2
 */
export function partial<A>(properties: { [K in keyof A]: Eq<A[K]> }): Eq<Partial<{ [K in keyof A]: A[K] }>> {
  return {
    equals: (x, y) => {
      for (const k in properties) {
        const xk = x[k]
        const yk = y[k]
        if (!(xk === undefined || yk === undefined ? xk === yk : properties[k].equals(xk as any, yk as any))) {
          return false
        }
      }
      return true
    }
  }
}

/**
 * @category combinators
 * @since 2.2.2
 */
export const record: <A>(codomain: Eq<A>) => Eq<Record<string, A>> = R.getEq

/**
 * @category combinators
 * @since 2.2.2
 */
export const array: <A>(eq: Eq<A>) => Eq<Array<A>> = A.getEq

/**
 * @category combinators
 * @since 2.2.2
 */
export const tuple: <A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: Eq<A[K]> }
) => Eq<A> = E.getTupleEq as any

/**
 * @category combinators
 * @since 2.2.2
 */
export const intersect = <B>(right: Eq<B>) => <A>(left: Eq<A>): Eq<A & B> => ({
  equals: (x, y) => left.equals(x, y) && right.equals(x, y)
})

/**
 * @category combinators
 * @since 2.2.2
 */
export function sum<T extends string>(
  tag: T
): <A>(members: { [K in keyof A]: Eq<A[K] & Record<T, K>> }) => Eq<A[keyof A]> {
  return (members: Record<string, Eq<any>>) => {
    return {
      equals: (x: any, y: any) => {
        const vx = x[tag]
        const vy = y[tag]
        if (vx !== vy) {
          return false
        }
        return members[vx].equals(x, y)
      }
    }
  }
}

/**
 * @category combinators
 * @since 2.2.2
 */
export function lazy<A>(f: () => Eq<A>): Eq<A> {
  const get = memoize<void, Eq<A>>(f)
  return {
    equals: (x, y) => get().equals(x, y)
  }
}

/**
 * @category combinators
 * @since 2.2.15
 */
export const readonly: <A>(eq: Eq<A>) => Eq<Readonly<A>> = identity

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 2.2.8
 */
export const Schemable: Schemable1<E.URI> = {
  URI: E.URI,
  literal: () => E.eqStrict,
  string,
  number,
  boolean,
  nullable,
  type,
  struct,
  partial,
  record,
  array,
  tuple,
  intersect,
  sum,
  lazy: (_, f) => lazy(f),
  readonly
}

/**
 * @category instances
 * @since 2.2.8
 */
export const WithUnknownContainers: WithUnknownContainers1<E.URI> = {
  UnknownArray,
  UnknownRecord
}

/**
 * @category instances
 * @since 2.2.8
 */
export const WithRefine: WithRefine1<E.URI> = {
  refine: () => (from) => from
}
