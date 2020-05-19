/**
 * @since 2.2.3
 */
import { Contravariant1 } from 'fp-ts/lib/Contravariant'
import { identity } from 'fp-ts/lib/function'
import * as PE from './PEncoder'
import { Schemable1 } from './Schemable'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.3
 */
export interface JsonArray extends Array<Json> {}

/**
 * @since 2.2.3
 */
export type JsonObject = { [key: string]: Json }

/**
 * @since 2.2.3
 */
export type Json = null | string | number | boolean | JsonObject | JsonArray

/**
 * @since 2.2.3
 */
export interface JsonEncoder<A> {
  readonly encode: (a: A) => Json
}

/**
 * @since 2.2.3
 */
export type TypeOf<E> = E extends JsonEncoder<infer A> ? A : never

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.3
 */
export const id: JsonEncoder<Json> = {
  encode: identity
}

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.3
 */
export const nullable: <A>(or: JsonEncoder<A>) => JsonEncoder<null | A> = PE.nullable

/**
 * @since 2.2.3
 */
export const type: <A>(properties: { [K in keyof A]: JsonEncoder<A[K]> }) => JsonEncoder<A> = PE.type as any

/**
 * @since 2.2.3
 */
export const partial: <A>(
  properties: { [K in keyof A]: JsonEncoder<A[K]> }
) => JsonEncoder<Partial<A>> = PE.partial as any

/**
 * @since 2.2.3
 */
export const record: <A>(codomain: JsonEncoder<A>) => JsonEncoder<Record<string, A>> = PE.record

/**
 * @since 2.2.3
 */
export const array: <A>(items: JsonEncoder<A>) => JsonEncoder<Array<A>> = PE.array

/**
 * @since 2.2.3
 */
export const tuple: <A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: JsonEncoder<A[K]> }
) => JsonEncoder<A> = PE.tuple as any

/**
 * @since 2.2.3
 */
export const intersection: <A, B>(left: JsonEncoder<A>, right: JsonEncoder<B>) => JsonEncoder<A & B> = PE.intersection

/**
 * @since 2.2.3
 */
export const sum: <T extends string>(
  tag: T
) => <A>(members: { [K in keyof A]: JsonEncoder<A[K] & Record<T, K>> }) => JsonEncoder<A[keyof A]> = PE.sum as any

/**
 * @since 2.2.3
 */
export const lazy: <A>(f: () => JsonEncoder<A>) => JsonEncoder<A> = PE.lazy

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.3
 */
export const URI = 'io-ts/JsonEncoder'

/**
 * @since 2.2.3
 */
export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly [URI]: JsonEncoder<A>
  }
}

/**
 * @since 2.2.3
 */
export const jsonEncoder: Contravariant1<URI> & Schemable1<URI> = {
  URI,
  contramap: PE.pencoder.contramap,
  literal: () => id,
  string: id,
  number: id,
  boolean: id,
  nullable,
  type,
  partial,
  record,
  array,
  tuple,
  intersection,
  sum,
  lazy: (_, f) => lazy(f)
}

/**
 * @since 2.2.3
 */
export const contramap: <A, B>(f: (b: B) => A) => (fa: JsonEncoder<A>) => JsonEncoder<B> = PE.contramap
