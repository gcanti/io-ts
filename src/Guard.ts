/**
 * @since 2.2.0
 */
import { Literal, memoize, Schemable1, WithRefinement1, WithUnion1, WithUnknownContainers1 } from './Schemable'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 2.2.0
 */
export interface Guard<A> {
  is: (u: unknown) => u is A
}

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.2
 */
export type TypeOf<G> = G extends Guard<infer A> ? A : never

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 2.2.0
 */
export function literal<A extends readonly [Literal, ...Array<Literal>]>(...values: A): Guard<A[number]> {
  return {
    is: (u: unknown): u is A[number] => values.findIndex((a) => a === u) !== -1
  }
}

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * @category primitives
 * @since 2.2.0
 */
export const never: Guard<never> = {
  is: (_u): _u is never => false
}

/**
 * @category primitives
 * @since 2.2.0
 */
export const string: Guard<string> = {
  is: (u: unknown): u is string => typeof u === 'string'
}

/**
 * @category primitives
 * @since 2.2.0
 */
export const number: Guard<number> = {
  is: (u: unknown): u is number => typeof u === 'number'
}

/**
 * @category primitives
 * @since 2.2.0
 */
export const boolean: Guard<boolean> = {
  is: (u: unknown): u is boolean => typeof u === 'boolean'
}

/**
 * @category primitives
 * @since 2.2.0
 */
export const UnknownArray: Guard<Array<unknown>> = {
  is: Array.isArray
}

/**
 * @category primitives
 * @since 2.2.0
 */
export const UnknownRecord: Guard<Record<string, unknown>> = {
  is: (u: unknown): u is Record<string, unknown> => Object.prototype.toString.call(u) === '[object Object]'
}

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 2.2.0
 */
export function refinement<A, B extends A>(from: Guard<A>, refinement: (a: A) => a is B): Guard<B> {
  return {
    is: (u: unknown): u is B => from.is(u) && refinement(u)
  }
}

/**
 * @category combinators
 * @since 2.2.0
 */
export function nullable<A>(or: Guard<A>): Guard<null | A> {
  return {
    is: (u): u is null | A => u === null || or.is(u)
  }
}

/**
 * @category combinators
 * @since 2.2.0
 */
export function type<A>(properties: { [K in keyof A]: Guard<A[K]> }): Guard<{ [K in keyof A]: A[K] }> {
  return refinement(UnknownRecord, (r): r is {
    [K in keyof A]: A[K]
  } => {
    for (const k in properties) {
      if (!(k in r) || !properties[k].is(r[k])) {
        return false
      }
    }
    return true
  })
}

/**
 * @category combinators
 * @since 2.2.0
 */
export function partial<A>(properties: { [K in keyof A]: Guard<A[K]> }): Guard<Partial<{ [K in keyof A]: A[K] }>> {
  return refinement(UnknownRecord, (r): r is Partial<A> => {
    for (const k in properties) {
      const v = r[k]
      if (v !== undefined && !properties[k].is(v)) {
        return false
      }
    }
    return true
  })
}

/**
 * @category combinators
 * @since 2.2.0
 */
export function record<A>(codomain: Guard<A>): Guard<Record<string, A>> {
  return refinement(UnknownRecord, (r): r is Record<string, A> => {
    for (const k in r) {
      if (!codomain.is(r[k])) {
        return false
      }
    }
    return true
  })
}

/**
 * @category combinators
 * @since 2.2.0
 */
export function array<A>(items: Guard<A>): Guard<Array<A>> {
  return refinement(UnknownArray, (us): us is Array<A> => us.every(items.is))
}

/**
 * @category combinators
 * @since 2.2.0
 */
export function tuple<A extends ReadonlyArray<unknown>>(...components: { [K in keyof A]: Guard<A[K]> }): Guard<A> {
  return {
    is: (u): u is A => Array.isArray(u) && u.length === components.length && components.every((c, i) => c.is(u[i]))
  }
}

/**
 * @category combinators
 * @since 2.2.0
 */
export function intersection<A, B>(left: Guard<A>, right: Guard<B>): Guard<A & B> {
  return {
    is: (u: unknown): u is A & B => left.is(u) && right.is(u)
  }
}

/**
 * @category combinators
 * @since 2.2.0
 */
export function union<A extends ReadonlyArray<unknown>>(...members: { [K in keyof A]: Guard<A[K]> }): Guard<A[number]> {
  return {
    is: (u: unknown): u is A | A[number] => members.some((m) => m.is(u))
  }
}

/**
 * @category combinators
 * @since 2.2.0
 */
export function sum<T extends string>(tag: T): <A>(members: { [K in keyof A]: Guard<A[K]> }) => Guard<A[keyof A]> {
  return <A>(members: { [K in keyof A]: Guard<A[K]> }) =>
    refinement(UnknownRecord, (r): r is any => {
      const v = r[tag] as keyof A
      if (v in members) {
        return members[v].is(r)
      }
      return false
    })
}

/**
 * @category combinators
 * @since 2.2.0
 */
export function lazy<A>(f: () => Guard<A>): Guard<A> {
  const get = memoize<void, Guard<A>>(f)
  return {
    is: (u: unknown): u is A => get().is(u)
  }
}

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 2.2.0
 */
export const URI = 'io-ts/Guard'

/**
 * @category instances
 * @since 2.2.0
 */
export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly [URI]: Guard<A>
  }
}

/**
 * @category instances
 * @since 2.2.3
 */
export const schemableGuard: Schemable1<URI> & WithUnknownContainers1<URI> & WithUnion1<URI> & WithRefinement1<URI> = {
  URI,
  literal,
  string,
  number,
  boolean,
  nullable,
  type,
  partial,
  record,
  array,
  tuple: tuple as Schemable1<URI>['tuple'],
  intersection,
  sum,
  lazy: (_, f) => lazy(f),
  UnknownArray,
  UnknownRecord,
  union,
  refinement: refinement as WithRefinement1<URI>['refinement']
}
