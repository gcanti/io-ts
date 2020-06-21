/**
 * @since 2.2.3
 */
import { Invariant1 } from 'fp-ts/lib/Invariant'
import * as D from './Decoder'
import * as JE from './JsonEncoder'
import * as C from './Codec'
import { Literal, Schemable1, WithRefinement1 } from './Schemable'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * Laws:
 *
 * 1. `pipe(codec.decode(u), E.fold(() => u, codec.encode)) = u` for all `u` in `unknown`
 * 2. `codec.decode(codec.encode(a)) = E.right(a)` for all `a` in `A`
 *
 * @category model
 * @since 2.2.3
 */
export interface JsonCodec<A> extends C.Codec<JE.Json, A> {}

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.2
 */
export type TypeOf<C> = JE.TypeOf<C>

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 2.2.3
 */
export const make: <A>(decoder: D.Decoder<A>, encoder: JE.JsonEncoder<A>) => JsonCodec<A> = C.make

/**
 * @category constructors
 * @since 2.2.3
 */
export const literal: <A extends readonly [Literal, ...Array<Literal>]>(...values: A) => JsonCodec<A[number]> =
  C.literal

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * @category primitives
 * @since 2.2.3
 */
export const string: JsonCodec<string> = C.string

/**
 * @category primitives
 * @since 2.2.3
 */
export const number: JsonCodec<number> = C.number

/**
 * @category primitives
 * @since 2.2.3
 */
export const boolean: JsonCodec<boolean> = C.boolean

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 2.2.3
 */
export const withExpected: <A>(
  codec: JsonCodec<A>,
  expected: (actual: unknown, e: D.DecodeError) => D.DecodeError
) => JsonCodec<A> = C.withExpected

/**
 * @category combinators
 * @since 2.2.3
 */
export const refinement: <A, B extends A>(
  from: JsonCodec<A>,
  refinement: (a: A) => a is B,
  expected: string
) => JsonCodec<B> = C.refinement

/**
 * @category combinators
 * @since 2.2.3
 */
export const nullable: <A>(or: JsonCodec<A>) => JsonCodec<null | A> = C.nullable

/**
 * @category combinators
 * @since 2.2.3
 */
export const type: <A>(
  properties: { [K in keyof A]: JsonCodec<A[K]> }
) => JsonCodec<{ [K in keyof A]: A[K] }> = C.type as any

/**
 * @category combinators
 * @since 2.2.3
 */
export const partial: <A>(
  properties: { [K in keyof A]: JsonCodec<A[K]> }
) => JsonCodec<Partial<{ [K in keyof A]: A[K] }>> = C.partial as any

/**
 * @category combinators
 * @since 2.2.3
 */
export const record: <A>(codomain: JsonCodec<A>) => JsonCodec<Record<string, A>> = C.record

/**
 * @category combinators
 * @since 2.2.3
 */
export const array: <A>(items: JsonCodec<A>) => JsonCodec<Array<A>> = C.array

/**
 * @category combinators
 * @since 2.2.3
 */
export const tuple: <A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: JsonCodec<A[K]> }
) => JsonCodec<A> = C.tuple as any

/**
 * @category combinators
 * @since 2.2.3
 */
export const intersection: <A, B>(left: JsonCodec<A>, right: JsonCodec<B>) => JsonCodec<A & B> = C.intersection

/**
 * @category combinators
 * @since 2.2.3
 */
export const sum: <T extends string>(
  tag: T
) => <A>(members: { [K in keyof A]: JsonCodec<A[K]> }) => JsonCodec<A[keyof A]> = C.sum as any

/**
 * @category combinators
 * @since 2.2.3
 */
export const lazy: <A>(id: string, f: () => JsonCodec<A>) => JsonCodec<A> = C.lazy

// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------

/**
 * @category Contravariant
 * @since 2.2.3
 */
export const imap: <A, B>(f: (a: A) => B, g: (b: B) => A) => (fa: JsonCodec<A>) => JsonCodec<B> = C.imap

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 2.2.3
 */
export const URI = 'io-ts/JsonCodec'

/**
 * @category instances
 * @since 2.2.3
 */
export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly [URI]: JsonCodec<A>
  }
}

/**
 * @category instances
 * @since 2.2.3
 */
export const invariantJsonCodec: Invariant1<URI> = {
  URI,
  imap: C.invariantCodec.imap
}

/**
 * @category instances
 * @since 2.2.3
 */
export const schemableJsonCodec: Schemable1<URI> & WithRefinement1<URI> = {
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
  refinement: refinement as WithRefinement1<URI>['refinement']
}
