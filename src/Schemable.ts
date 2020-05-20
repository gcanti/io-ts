/**
 * @since 2.2.0
 */
import { Kind, URIS, HKT } from 'fp-ts/lib/HKT'

/**
 * @since 2.2.0
 */
export type Literal = string | number | boolean | null

/**
 * @since 2.2.3
 */
export interface Schemable<S> {
  readonly URI: S
  readonly literal: <A extends ReadonlyArray<Literal>>(...values: A) => HKT<S, A[number]>
  readonly string: HKT<S, string>
  readonly number: HKT<S, number>
  readonly boolean: HKT<S, boolean>
  readonly nullable: <A>(or: HKT<S, A>) => HKT<S, null | A>
  readonly type: <A>(properties: { [K in keyof A]: HKT<S, A[K]> }) => HKT<S, A>
  readonly partial: <A>(properties: { [K in keyof A]: HKT<S, A[K]> }) => HKT<S, Partial<A>>
  readonly record: <A>(codomain: HKT<S, A>) => HKT<S, Record<string, A>>
  readonly array: <A>(items: HKT<S, A>) => HKT<S, Array<A>>
  readonly tuple: <A extends ReadonlyArray<unknown>>(...components: { [K in keyof A]: HKT<S, A[K]> }) => HKT<S, A>
  readonly intersection: <A, B>(left: HKT<S, A>, right: HKT<S, B>) => HKT<S, A & B>
  readonly sum: <T extends string>(tag: T) => <A>(members: { [K in keyof A]: HKT<S, A[K]> }) => HKT<S, A[keyof A]>
  readonly lazy: <A>(id: string, f: () => HKT<S, A>) => HKT<S, A>
}

/**
 * @since 2.2.3
 */
export interface Schemable1<S extends URIS> {
  readonly URI: S
  readonly literal: <A extends ReadonlyArray<Literal>>(...values: A) => Kind<S, A[number]>
  readonly string: Kind<S, string>
  readonly number: Kind<S, number>
  readonly boolean: Kind<S, boolean>
  readonly nullable: <A>(or: Kind<S, A>) => Kind<S, null | A>
  readonly type: <A>(properties: { [K in keyof A]: Kind<S, A[K]> }) => Kind<S, A>
  readonly partial: <A>(properties: { [K in keyof A]: Kind<S, A[K]> }) => Kind<S, Partial<A>>
  readonly record: <A>(codomain: Kind<S, A>) => Kind<S, Record<string, A>>
  readonly array: <A>(items: Kind<S, A>) => Kind<S, Array<A>>
  readonly tuple: <A extends ReadonlyArray<unknown>>(...components: { [K in keyof A]: Kind<S, A[K]> }) => Kind<S, A>
  readonly intersection: <A, B>(left: Kind<S, A>, right: Kind<S, B>) => Kind<S, A & B>
  readonly sum: <T extends string>(tag: T) => <A>(members: { [K in keyof A]: Kind<S, A[K]> }) => Kind<S, A[keyof A]>
  readonly lazy: <A>(id: string, f: () => Kind<S, A>) => Kind<S, A>
}

/**
 * @since 2.2.3
 */
export interface WithUnknownContainers<S> {
  readonly UnknownArray: HKT<S, Array<unknown>>
  readonly UnknownRecord: HKT<S, Record<string, unknown>>
}

/**
 * @since 2.2.3
 */
export interface WithUnknownContainers1<S extends URIS> {
  readonly UnknownArray: Kind<S, Array<unknown>>
  readonly UnknownRecord: Kind<S, Record<string, unknown>>
}

/**
 * @since 2.2.3
 */
export interface WithUnion<S> {
  readonly union: <A extends ReadonlyArray<unknown>>(...members: { [K in keyof A]: HKT<S, A[K]> }) => HKT<S, A[number]>
}

/**
 * @since 2.2.3
 */
export interface WithUnion1<S extends URIS> {
  readonly union: <A extends ReadonlyArray<unknown>>(
    ...members: { [K in keyof A]: Kind<S, A[K]> }
  ) => Kind<S, A[number]>
}

/**
 * @since 2.2.3
 */
export interface WithRefinement<S> {
  readonly refinement: <A, B extends A>(from: HKT<S, A>, refinement: (a: A) => a is B, expected: string) => HKT<S, B>
}

/**
 * @since 2.2.3
 */
export interface WithRefinement1<S extends URIS> {
  readonly refinement: <A, B extends A>(from: Kind<S, A>, refinement: (a: A) => a is B, expected: string) => Kind<S, B>
}

/**
 * @since 2.2.0
 */
export function memoize<A, B>(f: (a: A) => B): (a: A) => B {
  let cache = new Map()
  return (a) => {
    if (!cache.has(a)) {
      const b = f(a)
      cache.set(a, b)
      return b
    }
    return cache.get(a)
  }
}
