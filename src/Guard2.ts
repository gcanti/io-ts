import { Refinement } from 'fp-ts/lib/function'
import { pipe } from 'fp-ts/lib/pipeable'
import { ReadonlyNonEmptyArray } from 'fp-ts/lib/ReadonlyNonEmptyArray'
import { Literal, memoize } from './poc'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

export interface Guard<I, A extends I> {
  is: (i: I) => i is A
}

export type TypeOf<G> = G extends Guard<any, infer A> ? A : never

export const string: Guard<unknown, string> = {
  is: (u: unknown): u is string => typeof u === 'string'
}

export const number: Guard<unknown, number> = {
  is: (u: unknown): u is number => typeof u === 'number' && !isNaN(u)
}

export const boolean: Guard<unknown, boolean> = {
  is: (u: unknown): u is boolean => typeof u === 'boolean'
}

export const UnknownArray: Guard<unknown, Array<unknown>> = {
  is: Array.isArray
}

export const UnknownRecord: Guard<unknown, Record<string, unknown>> = {
  is: (u: unknown): u is Record<string, unknown> => u !== null && typeof u === 'object' && !Array.isArray(u)
}

export const nullable = <I, A extends I>(or: Guard<I, A>): Guard<null | I, null | A> => ({
  is: (i): i is null | A => i === null || or.is(i)
})

export const literal = <A extends ReadonlyNonEmptyArray<Literal>>(...values: A): Guard<unknown, A[number]> => ({
  is: (u: unknown): u is A[number] => values.findIndex((a) => a === u) !== -1
})

export const tuple = <A extends ReadonlyArray<Guard<unknown, any>>>(
  ...components: A
): Guard<unknown, { [K in keyof A]: TypeOf<A[K]> }> => ({
  is: (u): u is { [K in keyof A]: TypeOf<A[K]> } =>
    Array.isArray(u) && u.length === components.length && components.every((c, i) => c.is(u[i]))
})

const refine = <I, A extends I, B extends A>(refinement: Refinement<A, B>) => (from: Guard<I, A>): Guard<I, B> => ({
  is: (i: I): i is B => from.is(i) && refinement(i)
})

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

export const array = <A>(item: Guard<unknown, A>): Guard<unknown, Array<A>> =>
  pipe(
    UnknownArray,
    refine((us): us is Array<A> => us.every(item.is))
  )

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

export const union = <A extends readonly [unknown, ...Array<unknown>]>(
  ...members: { [K in keyof A]: Guard<unknown, A[K]> }
): Guard<unknown, A[number]> => ({
  is: (u: unknown): u is A | A[number] => members.some((m) => m.is(u))
})

export const intersect = <B>(right: Guard<unknown, B>) => <A>(left: Guard<unknown, A>): Guard<unknown, A & B> => ({
  is: (u: unknown): u is A & B => left.is(u) && right.is(u)
})

export const lazy = <A>(f: () => Guard<unknown, A>): Guard<unknown, A> => {
  const get = memoize<void, Guard<unknown, A>>(f)
  return {
    is: (u: unknown): u is A => get().is(u)
  }
}

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

export const compose = <I, A extends I, B extends A>(to: Guard<A, B>) => (from: Guard<I, A>): Guard<I, B> => ({
  is: (i): i is B => from.is(i) && to.is(i)
})
