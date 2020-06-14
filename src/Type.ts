/**
 * @since 2.2.3
 */
import * as t from './index'
import { Literal, Schemable1, WithUnion1, WithRefinement1, WithUnknownContainers1 } from './Schemable'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.3
 */
export interface Type<A> extends t.Type<A, unknown, unknown> {}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.3
 */
export function literal<A extends ReadonlyArray<Literal>>(...values: A): Type<A[number]> {
  return t.union(values.map((v) => t.literal(v as any)) as any)
}

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.3
 */
export const string: Type<string> = t.string

/**
 * @since 2.2.3
 */
export const number: Type<number> = t.number

/**
 * @since 2.2.3
 */
export const boolean: Type<boolean> = t.boolean

/**
 * @since 2.2.3
 */
export const UnknownArray: Type<Array<unknown>> = t.UnknownArray

/**
 * @since 2.2.3
 */
export const UnknownRecord: Type<Record<string, unknown>> = t.UnknownRecord

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.3
 */
export function refinement<A, B extends A>(from: Type<A>, refinement: (a: A) => a is B, expected: string): Type<B> {
  // tslint:disable-next-line: deprecation
  return t.refinement(from, refinement, expected) as any
}

/**
 * @since 2.2.3
 */
export function nullable<A>(or: Type<A>): Type<null | A> {
  return t.union([t.null, or])
}

/**
 * @since 2.2.3
 */
export function type<A>(properties: { [K in keyof A]: Type<A[K]> }): Type<{ [K in keyof A]: A[K] }> {
  return t.type(properties) as any
}

/**
 * @since 2.2.3
 */
export function partial<A>(properties: { [K in keyof A]: Type<A[K]> }): Type<Partial<{ [K in keyof A]: A[K] }>> {
  return t.partial(properties)
}

/**
 * @since 2.2.3
 */
export function record<A>(codomain: Type<A>): Type<Record<string, A>> {
  return t.record(t.string, codomain)
}

/**
 * @since 2.2.3
 */
export function array<A>(items: Type<A>): Type<Array<A>> {
  return t.array(items)
}

/**
 * @since 2.2.3
 */
export function tuple<A extends ReadonlyArray<unknown>>(...components: { [K in keyof A]: Type<A[K]> }): Type<A> {
  return t.tuple(components as any) as any
}

/**
 * @since 2.2.3
 */
export function intersection<A, B>(left: Type<A>, right: Type<B>): Type<A & B> {
  return t.intersection([left, right])
}

/**
 * @since 2.2.3
 */
export function lazy<A>(id: string, f: () => Type<A>): Type<A> {
  return t.recursion(id, f)
}

/**
 * @since 2.2.3
 */
export function sum<T extends string>(_tag: T): <A>(members: { [K in keyof A]: Type<A[K]> }) => Type<A[keyof A]> {
  return (members) => t.union(Object.values(members) as any)
}

/**
 * @since 2.2.3
 */
export function union<A extends ReadonlyArray<unknown>>(...members: { [K in keyof A]: Type<A[K]> }): Type<A[number]> {
  return t.union(members as any)
}

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.3
 */
export const URI = 'io-ts/Type'

/**
 * @since 2.2.3
 */
export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly [URI]: Type<A>
  }
}

/**
 * @since 2.2.3
 */
export const schemableType: Schemable1<URI> & WithUnknownContainers1<URI> & WithUnion1<URI> & WithRefinement1<URI> = {
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
  lazy,
  UnknownArray,
  UnknownRecord,
  union,
  refinement: refinement as WithRefinement1<URI>['refinement']
}
