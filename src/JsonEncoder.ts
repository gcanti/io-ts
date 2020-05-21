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
export type TypeOf<E> = E.TypeOf<E>

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
export const nullable: <A>(or: JsonEncoder<A>) => JsonEncoder<null | A> = E.nullable

/**
 * @since 2.2.3
 */
export const type: <A>(properties: { [K in keyof A]: JsonEncoder<A[K]> }) => JsonEncoder<A> = E.type as any

/**
 * @since 2.2.3
 */
export const partial: <A>(
  properties: { [K in keyof A]: JsonEncoder<A[K]> }
) => JsonEncoder<Partial<A>> = E.partial as any

/**
 * @since 2.2.3
 */
export const record: <A>(codomain: JsonEncoder<A>) => JsonEncoder<Record<string, A>> = E.record

/**
 * @since 2.2.3
 */
export const array: <A>(items: JsonEncoder<A>) => JsonEncoder<Array<A>> = E.array

/**
 * @since 2.2.3
 */
export const tuple: <A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: JsonEncoder<A[K]> }
) => JsonEncoder<A> = E.tuple as any

/**
 * @since 2.2.3
 */
export const intersection: <A, B>(left: JsonEncoder<A>, right: JsonEncoder<B>) => JsonEncoder<A & B> = E.intersection

/**
 * @since 2.2.3
 */
export const sum: <T extends string>(
  tag: T
) => <A>(members: { [K in keyof A]: JsonEncoder<A[K]> }) => JsonEncoder<A[keyof A]> = E.sum as any

/**
 * @since 2.2.3
 */
export const lazy: <A>(f: () => JsonEncoder<A>) => JsonEncoder<A> = E.lazy

// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.3
 */
export const contramap: <A, B>(f: (b: B) => A) => (fa: JsonEncoder<A>) => JsonEncoder<B> = E.contramap

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
export const contravariantJsonEncoder: Contravariant1<URI> = {
  URI,
  contramap: E.contravariantEncoder.contramap
}

/**
 * @since 2.2.3
 */
export const schemableJsonEncoder: Schemable1<URI> = {
  URI,
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
