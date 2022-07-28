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
import { Refinement } from 'fp-ts/lib/function'
import { pipe } from 'fp-ts/lib/pipeable'
import { ReadonlyNonEmptyArray } from 'fp-ts/lib/ReadonlyNonEmptyArray'
import * as D from './poc'
import { Schemable1, WithUnion1, WithUnknownContainers1 } from './Schemable2'

// TODO: move to io-ts-contrib in v3

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 2.2.8
 */
export interface Guard<I, A extends I> {
  is: (i: I) => i is A
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 2.2.0
 */
export const literal = <A extends ReadonlyNonEmptyArray<D.Literal>>(...values: A): Guard<unknown, A[number]> => ({
  is: (u: unknown): u is A[number] => values.findIndex((a) => a === u) !== -1
})

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * @category primitives
 * @since 2.2.0
 */
export const string: Guard<unknown, string> = {
  is: (u: unknown): u is string => typeof u === 'string'
}

/**
 * @category primitives
 * @since 2.2.0
 */
export const number: Guard<unknown, number> = {
  is: (u: unknown): u is number => typeof u === 'number'
}

/**
 * @category primitives
 * @since 2.2.0
 */
export const boolean: Guard<unknown, boolean> = {
  is: (u: unknown): u is boolean => typeof u === 'boolean'
}

/**
 * @category primitives
 * @since 2.2.0
 */
export const UnknownArray: Guard<unknown, Array<unknown>> = {
  is: Array.isArray
}

/**
 * @category primitives
 * @since 2.2.0
 */
export const UnknownRecord: Guard<unknown, Record<string, unknown>> = {
  is: (u: unknown): u is Record<string, unknown> => u !== null && typeof u === 'object' && !Array.isArray(u)
}

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 2.2.0
 */
export const nullable = <I, A extends I>(or: Guard<I, A>): Guard<null | I, null | A> => ({
  is: (i): i is null | A => i === null || or.is(i)
})

/**
 * @category combinators
 * @since 2.2.0
 */
export const tuple = <A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: Guard<unknown, A[K]> }
): Guard<unknown, A> => ({
  is: (u): u is A => Array.isArray(u) && u.length === components.length && components.every((c, i) => c.is(u[i]))
})

const refine = <I, A extends I, B extends A>(refinement: Refinement<A, B>) => (from: Guard<I, A>): Guard<I, B> => ({
  is: (i: I): i is B => from.is(i) && refinement(i)
})

/**
 * @category combinators
 * @since 2.2.15
 */
export const struct = <A>(
  properties: { [K in keyof A]: Guard<unknown, A[K]> }
): Guard<unknown, { [K in keyof A]: A[K] }> =>
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
export const partial = <A>(
  properties: { [K in keyof A]: Guard<unknown, A[K]> }
): Guard<unknown, Partial<{ [K in keyof A]: A[K] }>> =>
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
export const array = <A>(item: Guard<unknown, A>): Guard<unknown, Array<A>> =>
  pipe(
    UnknownArray,
    refine((us): us is Array<A> => us.every(item.is))
  )

/**
 * @category combinators
 * @since 2.2.0
 */
export const record = <A>(codomain: Guard<unknown, A>): Guard<unknown, Record<string, A>> =>
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
export const union = <A extends ReadonlyArray<unknown>>(
  ...members: { [K in keyof A]: Guard<unknown, A[K]> }
): Guard<unknown, A[number]> => ({
  is: (u: unknown): u is A | A[number] => members.some((m) => m.is(u))
})

/**
 * @category combinators
 * @since 2.2.0
 */
export const intersect = <B>(right: Guard<unknown, B>) => <A>(left: Guard<unknown, A>): Guard<unknown, A & B> => ({
  is: (u: unknown): u is A & B => left.is(u) && right.is(u)
})

/**
 * @category combinators
 * @since 2.2.0
 */
export const lazy = <I, A extends I>(f: () => Guard<I, A>): Guard<I, A> => {
  const get = D.memoize<void, Guard<I, A>>(f)
  return {
    is: (i: I): i is A => get().is(i)
  }
}

/**
 * @category combinators
 * @since 2.2.0
 */
export const sum = <T extends string>(tag: T) => <A>(
  members: { [K in keyof A]: Guard<unknown, A[K] & Record<T, K>> }
): Guard<unknown, A[keyof A]> =>
  pipe(
    UnknownRecord,
    refine((r): r is any => {
      const v = r[tag] as keyof A
      if (Object.prototype.hasOwnProperty.call(members, v)) {
        return members[v].is(r)
      }
      return false
    })
  )

// -------------------------------------------------------------------------------------
// instance operations
// -------------------------------------------------------------------------------------

/**
 * @category instance operations
 * @since 2.2.8
 */
export const id = <A>(): Guard<A, A> => ({
  is: (_): _ is A => true
})

/**
 * @category instance operations
 * @since 2.2.8
 */
export const compose = <I, A extends I, B extends A>(to: Guard<A, B>) => (from: Guard<I, A>): Guard<I, B> => ({
  is: (i): i is B => from.is(i) && to.is(i)
})

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

// TODO: move to io-ts-contrib in v3

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly 'io-ts/ToGuard': Guard<unknown, A>
  }
}

/**
 * @category instances
 * @since 2.2.8
 */
export const Schemable: Schemable1<'io-ts/ToGuard'> = {
  URI: 'io-ts/ToGuard',
  literal,
  string,
  number,
  boolean,
  tuple: tuple as any,
  struct,
  partial,
  array,
  record,
  nullable,
  intersect,
  lazy: (_, f) => lazy(f),
  sum
}

/**
 * @category instances
 * @since 2.2.8
 */
export const WithUnknownContainers: WithUnknownContainers1<'io-ts/ToGuard'> = {
  UnknownArray,
  UnknownRecord
}

/**
 * @category instances
 * @since 2.2.8
 */
export const WithUnion: WithUnion1<'io-ts/ToGuard'> = {
  union: union as any
}
