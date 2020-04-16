/**
 * @since 2.2.0
 */
import { Schemable, memoize, WithUnion, Literal } from './Schemable'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.0
 */
export interface Guard<A> {
  is: (u: unknown) => u is A
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.0
 */
export function literal<A extends ReadonlyArray<Literal>>(...values: A): Guard<A[number]> {
  return {
    is: (u: unknown): u is A[number] => values.findIndex((a) => a === u) !== -1
  }
}

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.0
 */
export const never: Guard<never> = {
  is: (_u): _u is never => false
}

/**
 * @since 2.2.0
 */
export const string: Guard<string> = {
  is: (u: unknown): u is string => typeof u === 'string'
}

/**
 * @since 2.2.0
 */
export const number: Guard<number> = {
  is: (u: unknown): u is number => typeof u === 'number'
}

/**
 * @since 2.2.0
 */
export const boolean: Guard<boolean> = {
  is: (u: unknown): u is boolean => typeof u === 'boolean'
}

/**
 * @since 2.2.0
 */
export const UnknownArray: Guard<Array<unknown>> = {
  is: Array.isArray
}

/**
 * @since 2.2.0
 */
export const UnknownRecord: Guard<Record<string, unknown>> = {
  is: (u: unknown): u is Record<string, unknown> => Object.prototype.toString.call(u) === '[object Object]'
}

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.0
 */
export function refinement<A, B extends A>(from: Guard<A>, refinement: (a: A) => a is B): Guard<B> {
  return {
    is: (u: unknown): u is B => from.is(u) && refinement(u)
  }
}

/**
 * @since 2.2.0
 */
export function nullable<A>(or: Guard<A>): Guard<null | A> {
  return {
    is: (u): u is null | A => u === null || or.is(u)
  }
}

/**
 * @since 2.2.0
 */
export function type<A>(properties: { [K in keyof A]: Guard<A[K]> }): Guard<A> {
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
 * @since 2.2.0
 */
export function partial<A>(properties: { [K in keyof A]: Guard<A[K]> }): Guard<Partial<A>> {
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
 * @since 2.2.0
 */
export function array<A>(items: Guard<A>): Guard<Array<A>> {
  return refinement(UnknownArray, (us): us is Array<A> => us.every(items.is))
}

/**
 * @since 2.2.0
 */
export function tuple<A extends ReadonlyArray<unknown>>(...components: { [K in keyof A]: Guard<A[K]> }): Guard<A> {
  return {
    is: (u): u is A => Array.isArray(u) && u.length === components.length && components.every((c, i) => c.is(u[i]))
  }
}

/**
 * @since 2.2.0
 */
export function intersection<A, B>(left: Guard<A>, right: Guard<B>): Guard<A & B> {
  return {
    is: (u: unknown): u is A & B => left.is(u) && right.is(u)
  }
}

/**
 * @since 2.2.0
 */
export function union<A extends ReadonlyArray<unknown>>(...members: { [K in keyof A]: Guard<A[K]> }): Guard<A[number]> {
  return {
    is: (u: unknown): u is A | A[number] => members.some((m) => m.is(u))
  }
}

/**
 * @since 2.2.0
 */
export function sum<T extends string>(
  tag: T
): <A>(members: { [K in keyof A]: Guard<A[K] & Record<T, K>> }) => Guard<A[keyof A]> {
  return <A>(members: { [K in keyof A]: Guard<A[K] & Record<T, K>> }) =>
    refinement(UnknownRecord, (r): r is { [K in keyof A]: A[K] & Record<T, K> }[keyof A] => {
      const v = r[tag]
      if (string.is(v) && v in members) {
        return (members as any)[v].is(r)
      }
      return false
    })
}

/**
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
 * @since 2.2.0
 */
export const URI = 'Guard'

/**
 * @since 2.2.0
 */
export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly Guard: Guard<A>
  }
}

/**
 * @since 2.2.0
 */
export const guard: Schemable<URI> & WithUnion<URI> = {
  URI,
  literal,
  string,
  number,
  boolean,
  UnknownArray,
  UnknownRecord,
  nullable,
  type,
  partial,
  record,
  array,
  tuple: tuple as Schemable<URI>['tuple'],
  intersection,
  sum,
  lazy: (_, f) => lazy(f),
  union
}
