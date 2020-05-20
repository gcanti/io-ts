/**
 * @since 2.2.2
 */
import * as A from 'fp-ts/lib/Array'
import * as E from 'fp-ts/lib/Eq'
import * as R from 'fp-ts/lib/Record'
import { memoize, Schemable1, WithRefinement1, WithUnknownContainers1 } from './Schemable'
import Eq = E.Eq

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
 * @since 2.2.2
 */
export const string: Eq<string> = E.eqString

/**
 * @since 2.2.2
 */
export const number: Eq<number> = E.eqNumber

/**
 * @since 2.2.2
 */
export const boolean: Eq<boolean> = E.eqBoolean

/**
 * @since 2.2.2
 */
export const UnknownArray: Eq<Array<unknown>> = E.fromEquals((x, y) => x.length === y.length)

/**
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
 * @since 2.2.2
 */
export function nullable<A>(or: Eq<A>): Eq<null | A> {
  return {
    equals: (x, y) => (x === null || y === null ? x === y : or.equals(x, y))
  }
}

/**
 * @since 2.2.2
 */
export const type: <A>(eqs: { [K in keyof A]: Eq<A[K]> }) => Eq<A> = E.getStructEq

/**
 * @since 2.2.2
 */
export function partial<A>(properties: { [K in keyof A]: Eq<A[K]> }): Eq<Partial<A>> {
  return {
    equals: (x, y) => {
      for (const k in properties) {
        const xk = x[k]
        const yk = y[k]
        if (!(xk === undefined || yk === undefined ? xk === yk : properties[k].equals(xk!, yk!))) {
          return false
        }
      }
      return true
    }
  }
}

/**
 * @since 2.2.2
 */
export const record: <A>(codomain: Eq<A>) => Eq<Record<string, A>> = R.getEq

/**
 * @since 2.2.2
 */
export const array: <A>(eq: Eq<A>) => Eq<Array<A>> = A.getEq

/**
 * @since 2.2.2
 */
export const tuple: <A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: Eq<A[K]> }
) => Eq<A> = E.getTupleEq as any

/**
 * @since 2.2.2
 */
export function intersection<A, B>(left: Eq<A>, right: Eq<B>): Eq<A & B> {
  return {
    equals: (x, y) => left.equals(x, y) && right.equals(x, y)
  }
}

/**
 * @since 2.2.2
 */
export function sum<T extends string>(tag: T): <A>(members: { [K in keyof A]: Eq<A[K]> }) => Eq<A[keyof A]> {
  return (members: Record<string, Eq<any>>) => {
    return {
      equals: (x: Record<string, any>, y: Record<string, any>) => {
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
 * @since 2.2.2
 */
export function lazy<A>(f: () => Eq<A>): Eq<A> {
  const get = memoize<void, Eq<A>>(f)
  return {
    equals: (x, y) => get().equals(x, y)
  }
}

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.2
 */
export const eq: typeof E.eq & Schemable1<E.URI> & WithUnknownContainers1<E.URI> & WithRefinement1<E.URI> = {
  ...E.eq,
  literal: () => E.eqStrict,
  string,
  number,
  boolean,
  nullable,
  type,
  partial,
  record,
  array,
  tuple,
  intersection,
  sum,
  lazy: (_, f) => lazy(f),
  UnknownArray,
  UnknownRecord,
  refinement: (from) => from
}
