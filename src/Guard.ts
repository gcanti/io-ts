/**
 * **This module is experimental**
 *
 * Experimental features are published in order to get early feedback from the community, see these tracking
 * [issues](https://github.com/gcanti/io-ts/issues?q=label%3Av2.2+) for further discussions and enhancements.
 *
 * A feature tagged as _Experimental_ is in a high state of flux, you're at risk of it changing without notice.
 *
 * @since 2.2.0
 */
import { pipe } from 'fp-ts/lib/pipeable'
import { Literal, memoize, Schemable1, WithRefine1, WithUnion1, WithUnknownContainers1 } from './Schemable'

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
export const literal = <A extends readonly [Literal, ...Array<Literal>]>(...values: A): Guard<A[number]> => ({
  is: (u: unknown): u is A[number] => values.findIndex((a) => a === u) !== -1
})

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * @category primitives
 * @since 2.2.0
 */
export const string: Guard<string> = {
  is: (u: unknown): u is string => typeof u === 'string'
}

/**
 * Note: `NaN` is excluded.
 *
 * @category primitives
 * @since 2.2.0
 */
export const number: Guard<number> = {
  is: (u: unknown): u is number => typeof u === 'number' && !isNaN(u)
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

/**
 * @internal
 */
export const object: Guard<object> = {
  is: (u: unknown): u is object => u != null && !string.is(u) && !number.is(u) && !boolean.is(u)
}

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 2.2.0
 */
export const refine = <A, B extends A>(refinement: (a: A) => a is B) => (from: Guard<A>): Guard<B> => ({
  is: (u: unknown): u is B => from.is(u) && refinement(u)
})

/**
 * @category combinators
 * @since 2.2.0
 */
export const nullable = <A>(or: Guard<A>): Guard<null | A> => ({
  is: (u): u is null | A => u === null || or.is(u)
})

/**
 * @category combinators
 * @since 2.2.0
 */
export const type = <A>(properties: { [K in keyof A]: Guard<A[K]> }): Guard<{ [K in keyof A]: A[K] }> =>
  pipe(
    UnknownRecord,
    refine((r): r is {
      [K in keyof A]: A[K]
    } => {
      for (const k in properties) {
        if (!(k in r) || !properties[k].is(r[k])) {
          return false
        }
      }
      return true
    })
  )

/**
 * @category combinators
 * @since 2.2.0
 */
export const partial = <A>(properties: { [K in keyof A]: Guard<A[K]> }): Guard<Partial<{ [K in keyof A]: A[K] }>> =>
  pipe(
    UnknownRecord,
    refine((r): r is Partial<A> => {
      for (const k in properties) {
        const v = r[k]
        if (v !== undefined && !properties[k].is(v)) {
          return false
        }
      }
      return true
    })
  )

/**
 * @category combinators
 * @since 2.2.0
 */
export const record = <A>(codomain: Guard<A>): Guard<Record<string, A>> =>
  pipe(
    UnknownRecord,
    refine((r): r is Record<string, A> => {
      for (const k in r) {
        if (!codomain.is(r[k])) {
          return false
        }
      }
      return true
    })
  )

/**
 * @category combinators
 * @since 2.2.0
 */
export const array = <A>(items: Guard<A>): Guard<Array<A>> =>
  pipe(
    UnknownArray,
    refine((us): us is Array<A> => us.every(items.is))
  )

/**
 * @category combinators
 * @since 2.2.0
 */
export const tuple = <A extends ReadonlyArray<unknown>>(...components: { [K in keyof A]: Guard<A[K]> }): Guard<A> => ({
  is: (u): u is A => Array.isArray(u) && u.length === components.length && components.every((c, i) => c.is(u[i]))
})

/**
 * @category combinators
 * @since 2.2.0
 */
export const intersect = <B>(right: Guard<B>) => <A>(left: Guard<A>): Guard<A & B> => ({
  is: (u: unknown): u is A & B => left.is(u) && right.is(u)
})

/**
 * @category combinators
 * @since 2.2.0
 */
export const union = <A extends readonly [unknown, ...Array<unknown>]>(
  ...members: { [K in keyof A]: Guard<A[K]> }
): Guard<A[number]> => ({
  is: (u: unknown): u is A | A[number] => members.some((m) => m.is(u))
})

/**
 * @category combinators
 * @since 2.2.0
 */
export const sum = <T extends string>(tag: T) => <A>(members: { [K in keyof A]: Guard<A[K]> }): Guard<A[keyof A]> =>
  pipe(
    UnknownRecord,
    refine((r): r is any => {
      const v = r[tag] as keyof A
      if (v in members) {
        return members[v].is(r)
      }
      return false
    })
  )

/**
 * @category combinators
 * @since 2.2.0
 */
export const lazy = <A>(f: () => Guard<A>): Guard<A> => {
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
export const schemableGuard: Schemable1<URI> & WithUnknownContainers1<URI> & WithUnion1<URI> & WithRefine1<URI> = {
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
  intersect,
  sum,
  lazy: (_, f) => lazy(f),
  UnknownArray,
  UnknownRecord,
  union: union as WithUnion1<URI>['union'],
  refine: refine as WithRefine1<URI>['refine']
}
