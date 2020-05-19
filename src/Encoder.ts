/**
 * @since 2.2.0
 */
import { Contravariant1 } from 'fp-ts/lib/Contravariant'
import { identity } from 'fp-ts/lib/function'
import { pipeable } from 'fp-ts/lib/pipeable'
import * as PE from './PEncoder'
import { Schemable1 } from './Schemable'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.0
 */
export interface Encoder<A> {
  readonly encode: (a: A) => unknown
}

/**
 * @since 2.2.2
 */
export type TypeOf<E> = E extends Encoder<infer A> ? A : never

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.0
 */
export const id: Encoder<unknown> = {
  encode: identity
}

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.0
 */
export const nullable: <A>(or: Encoder<A>) => Encoder<null | A> = PE.nullable

/**
 * @since 2.2.0
 */
export const type: <A>(properties: { [K in keyof A]: Encoder<A[K]> }) => Encoder<A> = PE.type as any

/**
 * @since 2.2.0
 */
export const partial: <A>(properties: { [K in keyof A]: Encoder<A[K]> }) => Encoder<Partial<A>> = PE.partial as any

/**
 * @since 2.2.0
 */
export const record: <A>(codomain: Encoder<A>) => Encoder<Record<string, A>> = PE.record

/**
 * @since 2.2.0
 */
export const array: <A>(items: Encoder<A>) => Encoder<Array<A>> = PE.array

/**
 * @since 2.2.0
 */
export const tuple: <A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: Encoder<A[K]> }
) => Encoder<A> = PE.tuple as any

/**
 * @since 2.2.0
 */
export const intersection: <A, B>(left: Encoder<A>, right: Encoder<B>) => Encoder<A & B> = PE.intersection

/**
 * @since 2.2.0
 */
export const sum: <T extends string>(
  tag: T
) => <A>(members: { [K in keyof A]: Encoder<A[K] & Record<T, K>> }) => Encoder<A[keyof A]> = PE.sum as any

/**
 * @since 2.2.0
 */
export const lazy: <A>(f: () => Encoder<A>) => Encoder<A> = PE.lazy

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.0
 */
export const URI = 'io-ts/Encoder'

/**
 * @since 2.2.0
 */
export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly [URI]: Encoder<A>
  }
}

/**
 * @since 2.2.0
 */
export const encoder: Contravariant1<URI> & Schemable1<URI> = {
  URI,
  contramap: PE.pencoder.contramap,
  literal: () => id,
  string: id,
  number: id,
  boolean: id,
  UnknownArray: id,
  UnknownRecord: id,
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

const { contramap } = pipeable(encoder)

export {
  /**
   * @since 2.2.0
   */
  contramap
}
