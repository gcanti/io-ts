/**
 * **This module is experimental**
 *
 * Experimental features are published in order to get early feedback from the community, see these tracking
 * [issues](https://github.com/gcanti/io-ts/issues?q=label%3Av2.2+) for further discussions and enhancements.
 *
 * A feature tagged as _Experimental_ is in a high state of flux, you're at risk of it changing without notice.
 *
 * @since 2.2.3
 */
import { flow, Refinement } from 'fp-ts/lib/function'
import { pipe } from 'fp-ts/lib/pipeable'
import * as R from 'fp-ts/lib/Record'
import * as D from './Decoder'
import * as DE from './DecodeError'
import * as TH from 'fp-ts/lib/These'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

export interface Codec<D, E> {
  readonly decoder: D
  readonly encoder: E
}

export const codec = <D extends D.AnyD, E extends D.AnyD>(decoder: D, encoder: E): Codec<D, E> => ({
  decoder,
  encoder
})

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

export const string = fromDecoder(D.string)
 
/**
 * @category primitives
 * @since 2.2.3
 */
export const number = fromDecoder(D.number)

/**
 * @category primitives
 * @since 2.2.3
 */
export const boolean = fromDecoder(D.boolean)

/**
 * @category primitives
 * @since 2.2.3
 */
export const UnknownArray = fromDecoder(D.UnknownArray)

/**
 * @category primitives
 * @since 2.2.3
 */
export const UnknownRecord = fromDecoder(D.UnknownRecord)

 
 // -------------------------------------------------------------------------------------
 // constructors
 // -------------------------------------------------------------------------------------
 
 export function fromDecoder<D extends D.AnyD>(decoder: D): Codec<D, D.IdentityD<D.TypeOf<D>>> {
  return {
    decoder: decoder,
    encoder: D.id<D.TypeOf<D>>()
  }
}
/**
 * @category constructors
 * @since 2.2.3
 */
export const literal = flow(D.literal, fromDecoder);

 // -------------------------------------------------------------------------------------
 // combinators
 // -------------------------------------------------------------------------------------
  
  /**
   * @category combinators
   * @since 2.2.15
   */
  export const fromStruct: never = undefined
  
  export const unexpectedKeys = flow(D.unexpectedKeys, fromDecoder)

  export const missingKeys = flow(D.missingKeys, fromDecoder)
  
   /**
    * @category combinators
    * @since 2.2.15
    */
  export const struct: never = undefined
  
   /**
    * @category combinators
    * @since 2.2.8
    */
  export const fromPartial: never = undefined
  
   /**
    * @category combinators
    * @since 2.2.3
    */
  export const partial: never = undefined
  
   /**
    * @category combinators
    * @since 2.2.8
    */
  export const fromTuple: never = undefined

  export const unexpectedIndexes = flow(D.unexpectedIndexes, fromDecoder)

  export const missingIndexes = flow(D.missingIndexes, fromDecoder)
  
   /**
    * @category combinators
    * @since 2.2.3
    */
  export const tuple: never = undefined
  
    /**
     * @category combinators
     * @since 2.2.3
     */
  export const fromArray: never = undefined
  
  /**
   * @category combinators
   * @since 2.2.3
   */
  export const array: never = undefined
  
  /**
   * @category combinators
   * @since 2.2.3
   */
  export const fromRecord: never = undefined
  
  /**
   * @category combinators
   * @since 2.2.3
   */
  export const record: never = undefined

  export const union: never = undefined

  /**
   * @category combinators
   * @since 2.2.3
   */
  export const refine: <A, B extends A>(
    refinement: Refinement<A, B>
  ) => <I, E>(
    from: Codec<D.Decoder<I, E, A>, D.IdentityD<B>>
  ) => Codec<
    D.Decoder<I, D.RefinementError<E, A, B>, B>, 
    D.IdentityD<B>
  > = (
    refinement
  ) => (from) => pipe(from.decoder, D.refine(refinement), fromDecoder)

  export const parse: <A, B, E2>(
    parse: (a: A) => TH.These<E2, B>
  ) => <I, E>(
    from: Codec<D.Decoder<I, E, A>, D.IdentityD<B>>
  ) => Codec<D.Decoder<I, D.ParseError<E, E2>, B>, D.IdentityD<B>> = 
    (parse) => (from) => pipe(from.decoder, D.parse(parse), fromDecoder)
  
  /**
   * @category combinators
   * @since 2.2.3
   */
  export const nullable = <C extends AnyC>(or: C): Codec<D.NullableD<C['decoder']>, D.NullableD<C['encoder']>> => ({
    decoder: pipe(or.decoder, D.nullable),
    encoder: pipe(or.encoder, D.nullable),
  })
  
  /**
   * @category combinators
   * @since 2.2.16
   */
  export const readonly = flow(D.readonly, fromDecoder)
  

  export type AnyC = Codec<D.Decoder<any, DE.DecodeError<any>, any>, D.Decoder<any, DE.DecodeError<any>, any>>
  /**
   * @category combinators
   * @since 2.2.3
   */
  export const intersect = <A extends AnyC>(
    right: A
  ) => <B extends AnyC>(left: B): 
    Codec<D.IntersectD<A['decoder'], B['decoder']>, D.IntersectD<A['encoder'], B['encoder']>> => ({
      decoder: pipe(left.decoder, D.intersect(right.decoder)),
      encoder: pipe(left.encoder, D.intersect(right.encoder)),
    })

  /**
   * @category combinators
   * @since 2.2.3
   */
  export const lazy = flow(D.lazy, fromDecoder)
  
  /**
   * @category combinators
   * @since 2.2.8
   */
  export const fromSum = <T extends string>(t: T) => 
    <Members extends Record<string, AnyC>>(members: Members):
      Codec<
        D.FromSumD<T, { [K in keyof Members]: Members[K]['decoder'] }>,
        D.FromSumD<T, { [K in keyof Members]: Members[K]['encoder'] }>
      > => ({
      decoder: pipe(members, R.map(a => a.decoder), D.fromSum(t)) as 
        D.FromSumD<T, { [K in keyof Members]: Members[K]['decoder'] }>,
      encoder: pipe(members, R.map(a => a.encoder),  D.fromSum(t)) as 
        D.FromSumD<T, { [K in keyof Members]: Members[K]['encoder'] }>,
    })
  

 export interface AnyUCD extends Codec<D.Decoder<unknown, any, any>, D.Decoder<unknown, any, any>> {}
  /**
   * @category combinators
   * @since 2.2.3
   */
  export const sum =
    <T extends string>(t: T) => 
    <Members extends Record<string, AnyUCD>>(
      members: Members
    ): Codec<
      D.SumD<T, { [K in keyof Members]: Members[K]['decoder'] }>, 
      D.SumD<T, { [K in keyof Members]: Members[K]['encoder'] }>
    > => ({
      decoder: pipe(members, R.map(a => a.decoder), D.sum(t)) as 
        D.SumD<T, { [K in keyof Members]: Members[K]['decoder'] }>,
      encoder: pipe(members, R.map(a => a.encoder), D.sum(t)) as
        D.SumD<T, { [K in keyof Members]: Members[K]['encoder'] }>,
    })

/**
  * @category combinators
  * @since 2.2.3
  */
 export const map: <A, B>(f: (e: A) => B) => 
 <I, E>(codec: Codec<D.Decoder<I, E, A>, D.IdentityD<A>>) => 
 Codec<D.MapD<D.Decoder<I, E, A>, B>, D.IdentityD<B>> = 
   (f) => (codec) => pipe(codec.decoder, D.map(f), fromDecoder)

/**
 * @category combinators
 * @since 2.2.3
 */
export const mapLeft = <E1, I, E2>(f: (e: E1) => E2) =>
   <A>(codec: Codec<D.Decoder<I, E1, A>, D.IdentityD<A>>): 
   Codec<D.MapLeftD<D.Decoder<I, E1, A>, E2>, D.IdentityD<A>> => pipe(codec.decoder, D.mapLeft(f), fromDecoder)

/**
* @category instance operations
* @since 2.2.8
*/
export const id = flow(D.id, fromDecoder)

// -------------------------------------------------------------------------------------
// composition
// -------------------------------------------------------------------------------------

export const compose = <PD extends D.AnyD, ND extends D.Decoder<D.TypeOf<PD>, any, any>, NE extends D.AnyD>(
  next: Codec<ND, NE>
) => <PE extends D.Decoder<D.TypeOf<NE>, any, any>>(
  prev: Codec<PD, PE>
): Codec<D.CompositionD<PD, ND>, D.CompositionD<NE, PE>> =>
  codec(pipe(prev.decoder, D.compose(next.decoder)), pipe(next.encoder, D.compose(prev.encoder)))

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.8
 */
export type InputOf<C extends Codec<unknown, unknown>> = D.InputOf<C['decoder']>

/**
 * @since 2.2.3
 */
export type OutputOf<C extends Codec<unknown, unknown>> = D.TypeOf<C['encoder']>

/**
 * @since 2.2.3
 */
export type TypeOf<C extends Codec<unknown, unknown>> = D.TypeOf<C['decoder']>
