/**
 * @since 2.2.3
 */
import { Contravariant1 } from 'fp-ts/lib/Contravariant'
import { identity } from 'fp-ts/lib/function'
import * as E from './Encoder'
import { Schemable1 } from './Schemable'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 2.2.3
 */
export interface JsonArray extends ReadonlyArray<Json> {}

/**
 * @category model
 * @since 2.2.3
 */
export interface JsonRecord {
  [key: string]: Json
}

/**
 * @category model
 * @since 2.2.3
 */
export type Json = null | string | number | boolean | JsonRecord | JsonArray

/**
 * @category model
 * @since 2.2.3
 */
export interface JsonEncoder<A> {
  readonly encode: (a: A) => Json
}

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.3
 */
export type TypeOf<E> = E.TypeOf<E>

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * @category primitives
 * @since 2.2.5
 */
export function id<A extends Json>(): JsonEncoder<A> {
  return {
    encode: identity
  }
}

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 2.2.3
 */
export const nullable: <A>(or: JsonEncoder<A>) => JsonEncoder<null | A> = E.nullable

/**
 * @category combinators
 * @since 2.2.3
 */
export const type: <A>(
  properties: { [K in keyof A]: JsonEncoder<A[K]> }
) => JsonEncoder<{ [K in keyof A]: A[K] }> = E.type as any

/**
 * @category combinators
 * @since 2.2.3
 */
export const partial: <A>(
  properties: { [K in keyof A]: JsonEncoder<A[K]> }
) => JsonEncoder<Partial<{ [K in keyof A]: A[K] }>> = E.partial as any

/**
 * @category combinators
 * @since 2.2.3
 */
export const record: <A>(codomain: JsonEncoder<A>) => JsonEncoder<Record<string, A>> = E.record

/**
 * @category combinators
 * @since 2.2.3
 */
export const array: <A>(items: JsonEncoder<A>) => JsonEncoder<Array<A>> = E.array

/**
 * @category combinators
 * @since 2.2.3
 */
export const tuple: <A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: JsonEncoder<A[K]> }
) => JsonEncoder<A> = E.tuple as any

/**
 * @category combinators
 * @since 2.2.3
 */
export const intersect: <B>(right: JsonEncoder<B>) => <A>(left: JsonEncoder<A>) => JsonEncoder<A & B> = E.intersect

/**
 * @category combinators
 * @since 2.2.3
 */
export const sum: <T extends string>(
  tag: T
) => <A>(members: { [K in keyof A]: JsonEncoder<A[K]> }) => JsonEncoder<A[keyof A]> = E.sum as any

/**
 * @category combinators
 * @since 2.2.3
 */
export const lazy: <A>(f: () => JsonEncoder<A>) => JsonEncoder<A> = E.lazy

// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------

/**
 * @category Contravariant
 * @since 2.2.3
 */
export const contramap: <A, B>(f: (b: B) => A) => (fa: JsonEncoder<A>) => JsonEncoder<B> = E.contramap

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 2.2.3
 */
export const URI = 'io-ts/JsonEncoder'

/**
 * @category instances
 * @since 2.2.3
 */
export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly [URI]: JsonEncoder<A>
  }
}

/**
 * @category instances
 * @since 2.2.3
 */
export const contravariantJsonEncoder: Contravariant1<URI> = {
  URI,
  contramap: E.contravariantEncoder.contramap
}

/**
 * @category instances
 * @since 2.2.3
 */
export const schemableJsonEncoder: Schemable1<URI> = {
  URI,
  literal: () => id(),
  string: id(),
  number: id(),
  boolean: id(),
  nullable,
  type,
  partial,
  record,
  array,
  tuple,
  intersect,
  sum,
  lazy: (_, f) => lazy(f)
}
