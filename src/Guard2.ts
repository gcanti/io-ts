import { ReadonlyNonEmptyArray } from 'fp-ts/lib/ReadonlyNonEmptyArray'
import { Literal } from './poc'

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
