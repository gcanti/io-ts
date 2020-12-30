/**
 * @since 3.0.0
 */
import { pipe } from 'fp-ts/function'
import { Literal, memoize, Schemable1, WithRefine1, WithUnion1, WithUnknownContainers1 } from './Schemable'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 3.0.0
 */
export interface Guard<I, A extends I> {
  readonly is: (i: I) => i is A
}

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export type TypeOf<G> = G extends Guard<any, infer A> ? A : never

/**
 * @since 3.0.0
 */
export type InputOf<G> = G extends Guard<infer I, any> ? I : never

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 3.0.0
 */
export const literal = <A extends readonly [Literal, ...ReadonlyArray<Literal>]>(
  ...values: A
): Guard<unknown, A[number]> => ({
  is: (u: unknown): u is A[number] => values.findIndex((a) => a === u) !== -1
})

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * @category primitives
 * @since 3.0.0
 */
export const string: Guard<unknown, string> = {
  is: (u: unknown): u is string => typeof u === 'string'
}

/**
 * Note: `NaN` is excluded.
 *
 * @category primitives
 * @since 3.0.0
 */
export const number: Guard<unknown, number> = {
  is: (u: unknown): u is number => typeof u === 'number' && !isNaN(u)
}

/**
 * @category primitives
 * @since 3.0.0
 */
export const boolean: Guard<unknown, boolean> = {
  is: (u: unknown): u is boolean => typeof u === 'boolean'
}

/**
 * @category primitives
 * @since 3.0.0
 */
// tslint:disable-next-line: readonly-array
export const UnknownArray: Guard<unknown, Array<unknown>> = {
  is: Array.isArray
}

/**
 * @category primitives
 * @since 3.0.0
 */
export const UnknownRecord: Guard<unknown, Record<string, unknown>> = {
  is: (u: unknown): u is Record<string, unknown> => Object.prototype.toString.call(u) === '[object Object]'
}

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 3.0.0
 */
export const refine = <I, A extends I, B extends A>(refinement: (a: A) => a is B) => (
  from: Guard<I, A>
): Guard<I, B> => ({
  is: (i: I): i is B => from.is(i) && refinement(i)
})

/**
 * @category combinators
 * @since 3.0.0
 */
export const nullable = <I, A extends I>(or: Guard<I, A>): Guard<null | I, null | A> => ({
  is: (i): i is null | A => i === null || or.is(i)
})

/**
 * @category combinators
 * @since 3.0.0
 */
export const type = <A>(
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
 * @since 3.0.0
 */
export const partial = <A>(
  properties: { [K in keyof A]: Guard<unknown, A[K]> }
): Guard<unknown, Partial<{ [K in keyof A]: A[K] }>> =>
  pipe(
    UnknownRecord,
    refine((r): r is Partial<A> => {
      for (const k in properties) {
        /* istanbul ignore next */
        if (properties.hasOwnProperty(k)) {
          const v = r[k]
          if (v !== undefined && !properties[k].is(v)) {
            return false
          }
        }
      }
      return true
    })
  )

/**
 * @category combinators
 * @since 3.0.0
 */
// tslint:disable-next-line: readonly-array
export const array = <A>(item: Guard<unknown, A>): Guard<unknown, Array<A>> =>
  pipe(
    UnknownArray,
    // tslint:disable-next-line: readonly-array
    refine((us): us is Array<A> => us.every(item.is))
  )

/**
 * @category combinators
 * @since 3.0.0
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
 * @since 3.0.0
 */
export const tuple = <A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: Guard<unknown, A[K]> }
): Guard<unknown, A> => ({
  is: (u): u is A => Array.isArray(u) && u.length === components.length && components.every((c, i) => c.is(u[i]))
})

/**
 * @category combinators
 * @since 3.0.0
 */
export const intersect = <B>(right: Guard<unknown, B>) => <A>(left: Guard<unknown, A>): Guard<unknown, A & B> => ({
  is: (u: unknown): u is A & B => left.is(u) && right.is(u)
})

/**
 * @category combinators
 * @since 3.0.0
 */
export const union = <A extends readonly [unknown, ...ReadonlyArray<unknown>]>(
  ...members: { [K in keyof A]: Guard<unknown, A[K]> }
): Guard<unknown, A[number]> => ({
  is: (u: unknown): u is A | A[number] => members.some((m) => m.is(u))
})

/**
 * @category combinators
 * @since 3.0.0
 */
export const sum = <T extends string>(tag: T) => <A>(
  members: { [K in keyof A]: Guard<unknown, A[K] & Record<T, K>> }
): Guard<unknown, A[keyof A]> =>
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
 * @since 3.0.0
 */
export const lazy = <A>(f: () => Guard<unknown, A>): Guard<unknown, A> => {
  const get = memoize<void, Guard<unknown, A>>(f)
  return {
    is: (u: unknown): u is A => get().is(u)
  }
}

/**
 * @category combinators
 * @since 3.0.0
 */
export const alt = <I, A extends I>(that: () => Guard<I, A>) => (me: Guard<I, A>): Guard<I, A> => ({
  is: (i): i is A => me.is(i) || that().is(i)
})

/**
 * @category combinators
 * @since 3.0.0
 */
export const zero = <I, A extends I>(): Guard<I, A> => ({
  is: (_): _ is A => false
})

/**
 * @category combinators
 * @since 3.0.0
 */
export const compose = <I, A extends I, B extends A>(to: Guard<A, B>) => (from: Guard<I, A>): Guard<I, B> => ({
  is: (i): i is B => from.is(i) && to.is(i)
})

/**
 * @category combinators
 * @since 3.0.0
 */
export const id = <A>(): Guard<A, A> => ({
  is: (_): _ is A => true
})

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 3.0.0
 */
export const URI = 'io-ts/Guard'

/**
 * @category instances
 * @since 3.0.0
 */
export type URI = typeof URI

declare module 'fp-ts/HKT' {
  interface URItoKind<A> {
    readonly [URI]: Guard<unknown, A>
  }
}

/**
 * @category instances
 * @since 3.0.0
 */
export const Schemable: Schemable1<URI> = {
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
  lazy: (_, f) => lazy(f)
}

/**
 * @category instances
 * @since 3.0.0
 */
export const WithUnknownContainers: WithUnknownContainers1<URI> = {
  UnknownArray,
  UnknownRecord
}

/**
 * @category instances
 * @since 3.0.0
 */
export const WithUnion: WithUnion1<URI> = {
  union: union as WithUnion1<URI>['union']
}

/**
 * @category instances
 * @since 3.0.0
 */
export const WithRefine: WithRefine1<URI> = {
  refine: refine as WithRefine1<URI>['refine']
}
