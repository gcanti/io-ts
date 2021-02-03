/**
 * @since 3.0.0
 */
import * as A from 'fp-ts/ReadonlyArray'
import * as E from 'fp-ts/Eq'
import * as R from 'fp-ts/ReadonlyRecord'
import { memoize, Schemable1, WithRefine1, WithUnknownContainers1 } from './Schemable'
import Eq = E.Eq
import * as S from 'fp-ts/string'
import * as N from 'fp-ts/number'
import * as B from 'fp-ts/boolean'

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export type URI = E.URI

/**
 * @since 3.0.0
 */
export type TypeOf<E> = E extends Eq<infer A> ? A : never

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * @category primitives
 * @since 3.0.0
 */
export const string: Eq<string> = S.Eq

/**
 * @category primitives
 * @since 3.0.0
 */
export const number: Eq<number> = N.Eq

/**
 * @category primitives
 * @since 3.0.0
 */
export const boolean: Eq<boolean> = B.Eq

/**
 * @category primitives
 * @since 3.0.0
 */
// tslint:disable-next-line: readonly-array
export const UnknownArray: Eq<Array<unknown>> = E.fromEquals((second) => (first) => first.length === second.length)

/**
 * @category primitives
 * @since 3.0.0
 */
export const UnknownRecord: Eq<Record<string, unknown>> = E.fromEquals((second) => (first) => {
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
 * @since 3.0.0
 */
export function nullable<A>(or: Eq<A>): Eq<null | A> {
  return {
    equals: (second) => (first) => (first === null || second === null ? first === second : or.equals(second)(first))
  }
}

/**
 * @category combinators
 * @since 3.0.0
 */
export const type: <A>(eqs: { [K in keyof A]: Eq<A[K]> }) => Eq<{ [K in keyof A]: A[K] }> = E.getStructEq

/**
 * @category combinators
 * @since 3.0.0
 */
export function partial<A>(properties: { [K in keyof A]: Eq<A[K]> }): Eq<Partial<{ [K in keyof A]: A[K] }>> {
  return {
    equals: (second) => (first) => {
      for (const k in properties) {
        /* istanbul ignore next */
        if (properties.hasOwnProperty(k)) {
          const xk = first[k]
          const yk = second[k]
          // tslint:disable-next-line: strict-type-predicates
          if (!(xk === undefined || yk === undefined ? xk === yk : properties[k].equals(yk!)(xk!))) {
            return false
          }
        }
      }
      return true
    }
  }
}

/**
 * @category combinators
 * @since 3.0.0
 */
export const record: <A>(codomain: Eq<A>) => Eq<Record<string, A>> = R.getEq

/**
 * @category combinators
 * @since 3.0.0
 */
// tslint:disable-next-line: readonly-array
export const array: <A>(eq: Eq<A>) => Eq<Array<A>> = A.getEq

/**
 * @category combinators
 * @since 3.0.0
 */
export const tuple: <A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: Eq<A[K]> }
) => Eq<A> = E.getTupleEq as any

/**
 * @category combinators
 * @since 3.0.0
 */
export const intersect = <B>(right: Eq<B>) => <A>(left: Eq<A>): Eq<A & B> => ({
  equals: (second) => (first) => left.equals(second)(first) && right.equals(second)(first)
})

/**
 * @category combinators
 * @since 3.0.0
 */
export function sum<T extends string>(
  tag: T
): <A>(members: { [K in keyof A]: Eq<A[K] & Record<T, K>> }) => Eq<A[keyof A]> {
  return (members: Record<string, Eq<any>>) => {
    return {
      equals: (second: Record<string, any>) => (first: Record<string, any>) => {
        const vx = first[tag]
        const vy = second[tag]
        if (vx !== vy) {
          return false
        }
        return members[vx].equals(second)(first)
      }
    }
  }
}

/**
 * @category combinators
 * @since 3.0.0
 */
export function lazy<A>(f: () => Eq<A>): Eq<A> {
  const get = memoize<void, Eq<A>>(f)
  return {
    equals: (second) => (first) => get().equals(second)(first)
  }
}

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 3.0.0
 */
export const Schemable: Schemable1<E.URI> = {
  literal: () => E.EqStrict,
  string,
  number,
  boolean,
  nullable,
  type,
  partial,
  record,
  array,
  tuple,
  intersect,
  sum,
  lazy: (_, f) => lazy(f)
}

/**
 * @category instances
 * @since 3.0.0
 */
export const WithUnknownContainers: WithUnknownContainers1<E.URI> = {
  UnknownArray,
  UnknownRecord
}

/**
 * @category instances
 * @since 3.0.0
 */
export const WithRefine: WithRefine1<E.URI> = {
  refine: () => (from) => from
}
