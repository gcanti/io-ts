import * as E from 'fp-ts/lib/Eq'
import Eq = E.Eq
import * as RA from 'fp-ts/lib/ReadonlyArray'
import * as RR from 'fp-ts/lib/ReadonlyRecord'
import { memoize } from './poc'

export const string: Eq<string> = E.eqString

export const number: Eq<number> = E.eqNumber

export const boolean: Eq<boolean> = E.eqBoolean

export const UnknownArray: Eq<Array<unknown>> = E.fromEquals((x, y) => x.length === y.length)

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

export const nullable = <A>(or: Eq<A>): Eq<null | A> =>
  E.fromEquals((x, y) => (x === null || y === null ? x === y : or.equals(x, y)))

export const tuple: <A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: Eq<A[K]> }
) => Eq<A> = E.getTupleEq as any

export const struct: <A>(eqs: { [K in keyof A]: Eq<A[K]> }) => Eq<{ [K in keyof A]: A[K] }> = E.getStructEq

export const partial = <A>(properties: { [K in keyof A]: Eq<A[K]> }): Eq<Partial<{ [K in keyof A]: A[K] }>> =>
  E.fromEquals((x, y) => {
    for (const k in properties) {
      const xk = x[k]
      const yk = y[k]
      if (!(xk === undefined || yk === undefined ? xk === yk : properties[k].equals(xk!, yk!))) {
        return false
      }
    }
    return true
  })

export const array: <A>(eq: Eq<A>) => Eq<Array<A>> = RA.getEq

export const record: <A>(codomain: Eq<A>) => Eq<Record<string, A>> = RR.getEq

export const intersect = <B>(right: Eq<B>) => <A>(left: Eq<A>): Eq<A & B> =>
  E.fromEquals((x, y) => left.equals(x, y) && right.equals(x, y))

export function lazy<A>(f: () => Eq<A>): Eq<A> {
  const get = memoize<void, Eq<A>>(f)
  return {
    equals: (x, y) => get().equals(x, y)
  }
}

export const sum = <T extends string>(
  tag: T
): (<A>(members: { [K in keyof A]: Eq<A[K] & Record<T, K>> }) => Eq<A[keyof A]>) => {
  return (members: Record<string, Eq<any>>) =>
    E.fromEquals((x: Record<string, any>, y: Record<string, any>) => {
      const vx = x[tag]
      const vy = y[tag]
      if (vx !== vy) {
        return false
      }
      return members[vx].equals(x, y)
    })
}
