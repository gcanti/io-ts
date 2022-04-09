/**
 * **This module is experimental**
 *
 * Experimental features are published in order to get early feedback from the community, see these tracking
 * [issues](https://github.com/gcanti/io-ts/issues?q=label%3Av2.2+) for further discussions and enhancements.
 *
 * A feature tagged as _Experimental_ is in a high state of flux, you're at risk of it changing without notice.
 *
 * @since 2.2.7
 */
import { flow, Refinement } from 'fp-ts/lib/function'
import { Functor3 } from 'fp-ts/lib/Functor'
import * as TT from 'fp-ts/lib/TaskThese'
import { pipe } from 'fp-ts/lib/pipeable'
import * as T from 'fp-ts/lib/Task'
import * as TH from 'fp-ts/lib/These'
import * as DE from './DecodeError'
import * as D from './Decoder'

import TaskThese = TT.TaskThese
import Decoder = D.Decoder
import { ReadonlyNonEmptyArray } from 'fp-ts/lib/ReadonlyNonEmptyArray'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 2.2.8
 */
export interface TaskDecoder<I, E, A> {
  readonly decode: (i: I) => TaskThese<E, A>
}

// -------------------------------------------------------------------------------------
// DecodeError
// -------------------------------------------------------------------------------------
/**
 * @category DecodeError
 * @since 2.2.7
 */
 export const success = TT.right

 /**
  * @category DecodeError
  * @since 2.2.17
  */
 export const failure = TT.left
 
 /**
  * @category DecodeError
  * @since 2.2.17
  */
 export const warning = TT.both

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------


export type FromDecoder<D extends Decoder<unknown, unknown, unknown>> = TaskDecoder<
  D.InputOf<D>,
  D.ErrorOf<D>,
  D.TypeOf<D>
>

/**
 * @category constructors
 * @since 2.2.7
 */
export const fromDecoder = <I, E, A>(
  d: Decoder<I, E, A>
): TaskDecoder<I, E, A> => ({
  decode: flow(d.decode, T.of)
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
  export const struct = flow(D.struct, fromDecoder)
  
   /**
    * @category combinators
    * @since 2.2.8
    */
  export const fromPartial: never = undefined
  
   /**
    * @category combinators
    * @since 2.2.3
    */
  export const partial = flow(D.partial, fromDecoder)
  
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
  export const tuple = flow(D.tuple, fromDecoder)
  
    /**
     * @category combinators
     * @since 2.2.3
     */
  export const fromArray: never = undefined
  
  /**
   * @category combinators
   * @since 2.2.3
   */
  export const array = flow(D.array, fromDecoder)
  
  /**
   * @category combinators
   * @since 2.2.3
   */
  export const fromRecord: never = undefined
  
  /**
   * @category combinators
   * @since 2.2.3
   */
  export const record = flow(D.record, fromDecoder)

  export const union = flow(D.union, fromDecoder)

  /**
   * @category combinators
   * @since 2.2.3
   */
  export const refine = <A, B extends A>(
    refinement: Refinement<A, B>
  ) => <I, E>(
    from: TaskDecoder<I, E, A>
  ): TaskDecoder<I, D.RefinementError<E, A, B>, B> => ({
    decode: (i) => pipe(
      from.decode(i),
      T.map(
        TH.fold<E, A, TH.These<D.RefinementError<E, A, B>, B>>(
          flow(DE.refinementE, TH.left),
          (a) => refinement(a) ? TH.right(a) : TH.left(DE.refinementLE(a as Exclude<A, B>)),
          (e, a) => refinement(a) 
            ? TH.both(DE.refinementE(e), a) 
            : TH.left(
              DE.compoundE('refinement')([
                DE.refinementE(e), 
                DE.refinementLE(a as Exclude<A, B>)
              ])
            )
        )
      ),
    )
  })

  export const parse = <A, B, E2>(
    parser: (a: A) => TH.These<E2, B>
  ) => <I, E>(
    from: TaskDecoder<I, E, A>
  ): TaskDecoder<I, D.ParseError<E, E2>, B> => ({
    decode: (i) => {
      const { chain } = TH.getMonad<D.ParseError<E, E2>>({
        concat: (x, y) => x._tag === 'CompoundE' 
          ? x
          : y._tag === 'CompoundE' 
          ? y 
          : DE.compoundE('parse')([x, y])
      })
      return pipe(
        pipe(from.decode(i), TT.mapLeft(DE.parseE)), 
        T.map(a => chain(
          a,
          flow(parser, TH.mapLeft(DE.parseE))
        ))
      );
    }
  })

  /**
   * @category meta
   * @since 2.2.17
   */
  export interface NullableTD<D> extends TaskDecoder<null | InputOf<D>, DE.NullableE<ErrorOf<D>>, null | TypeOf<D>> {
    readonly _tag: 'NullableTD'
    readonly or: D
  }
  
  /**
   * @category combinators
   * @since 2.2.3
   */
  export const nullable = <TD extends AnyTD>(or: TD): NullableTD<TD> => ({
    _tag: 'NullableTD',
    or,
    decode: (i) => (i === null ? success(null) : pipe(or.decode(i), TT.mapLeft(DE.nullableE)))
  }) 
  
  /**
   * @category combinators
   * @since 2.2.16
   */
  export const readonly = flow(D.readonly, fromDecoder)
  

  /**
   * @category combinators
   * @since 2.2.3
   */
  export const intersect = <I, E, A>(
    right: TaskDecoder<I, E, A>
  ) => <I1, E1, A1>(left: TaskDecoder<I1, E1, A1>): 
    TaskDecoder<I & I1, D.IntersectE<E, E1>, A & A1> => {
      const a = {
        decode: (input: I & I1) => {
          const b = left.decode(input)
          const j = pipe(
            b,
            T.map(th => {
              const ff = pipe(

              )
            })
          )
          return undefined;
        }
      }
      return a;
    }

/**
 * @category combinators
 * @since 2.2.3
 */
export const lazy = flow(D.lazy, fromDecoder)

export interface FromSumD<T extends string, Members>
  extends TaskDecoder<InputOf<Members[keyof Members]>, DE.TagLE | D.FromSumE<Members>, TypeOf<Members[keyof Members]>> {
  readonly _tag: 'FromSumD'
  readonly tag: T
  readonly members: Members
}

  /**
   * @category combinators
   * @since 2.2.8
   */
  export const fromSum = <T extends string>(tag: T) => 
    <Members extends Record<string, AnyTD>>(
      members: Members
    ): FromSumD<T, Members> => pipe(
      members as any,
      D.fromSum(tag), 
      (d): FromSumD<T, Members> => ({
        _tag: "FromSumD",
        tag,
        members,
        decode: flow(d.decode, T.of) as any
      })
    )



/**
 * @category meta
 * @since 2.2.17
 */
 export interface UnknownRecordUTD extends TaskDecoder<unknown, DE.UnknownRecordLE, Record<string, unknown>> {
  readonly _tag: 'UnknownRecordUD'
}

/**
 * @category meta
 * @since 2.2.17
 */
 export interface UnknownArrayUTD extends TaskDecoder<unknown, DE.UnknownArrayLE, Array<unknown>> {
  readonly _tag: 'UnknownArrayUD'
}

/**
 * @since 2.2.17
 */
  export interface UnionTE<Members extends ReadonlyNonEmptyArray<AnyTD>>
    extends DE.CompoundE<{ [K in keyof Members]: DE.MemberE<K, ErrorOf<Members[K]>> }[number]> {}

/**
 * @category meta
 * @since 2.2.17
 */
  export interface UnionTD<Members extends ReadonlyNonEmptyArray<AnyTD>>
    extends TaskDecoder<D.UnionToIntersection<InputOf<Members[number]>>, UnionTE<Members>, TypeOf<Members[keyof Members]>> {
    readonly _tag: 'UnionD'
    readonly members: Members
  }

  /**
   * @category meta
   * @since 2.2.17
   */
  export interface SumTD<T extends string, Members>
    extends CompositionTD<UnionTD<[UnknownRecordUTD, UnknownArrayUTD]>, FromSumD<T, Members>> {}
  

//                    tagged objects --v             v-- tagged tuples
const UnknownRecordArray = union(UnknownRecord, UnknownArray)

/**
 * @category combinators
 * @since 2.2.3
 */
export const sum: {
  <T extends string>(
    tag: T
  ): <Members extends Record<string, AnyUTD>>(members: Members) => SumTD<T, Members>
  <T extends string>(
    tag: T
  ): <E, A>(members: Record<string, TaskDecoder<unknown, E, A>>) => SumTD<T, typeof members>
} = <T extends string>(tag: T) => 
  <E, A>(members: Record<string, TaskDecoder<unknown, E, A>>): SumTD<T, typeof members> => {
  const fromSumTag = fromSum(tag)
  return pipe(UnknownRecordArray, compose(fromSumTag(members)))
}

/**
 * @category meta
 * @since 2.2.17
 */
 export interface MapD<D, B> extends TaskDecoder<InputOf<D>, ErrorOf<D>, B> {
  readonly _tag: 'MapD'
  readonly decoder: D
  readonly map: (a: TypeOf<D>) => B
}

/**
  * @category combinators
  * @since 2.2.3
  */
 export const map: <A, B>(f: (e: A) => B) => 
  <I, E>(codec: TaskDecoder<I, E, A>) => 
    MapD<TaskDecoder<I, E, A>, B> = 
    (f) => (decoder) => ({
      _tag: 'MapD',
      decode: flow(decoder.decode, TT.map(f)),
      decoder,
      map: f
    })


/**
 * @category meta
 * @since 2.2.17
 */
 export interface MapLeftD<D, E> extends TaskDecoder<InputOf<D>, E, TypeOf<D>> {
  readonly _tag: 'MapLeftD'
  readonly decoder: D
  readonly mapLeft: (de: ErrorOf<D>) => E
}

/**
 * @category combinators
 * @since 2.2.3
 */
export const mapLeft: <E1, I, E2>(f: (e: E1) => E2) =>
   <A>(decoder: TaskDecoder<I, E1, A>) => 
   MapLeftD<TaskDecoder<I, E1, A>, E2> = (f) => (decoder) => ({
    _tag: 'MapLeftD',
    decode: flow(decoder.decode, TT.mapLeft(f)),
    decoder,
    mapLeft: f
  })

/**
* @category instance operations
* @since 2.2.8
*/
export const id = flow(D.id, fromDecoder)

// -------------------------------------------------------------------------------------
// composition
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.17
 */
 export interface CompositionE<P, N> extends DE.CompoundE<DE.PrevE<ErrorOf<P>> | DE.NextE<ErrorOf<N>>> {}

 /**
  * @category meta
  * @since 2.2.17
  */
export interface CompositionTD<P, N> extends TaskDecoder<InputOf<P>, CompositionE<P, N>, TypeOf<N>> {
  readonly _tag: 'CompositionTD'
  readonly prev: P
  readonly next: N
}
 
 /**
  * @category instance operations
  * @since 2.2.8
  */
 export const compose: {
  <P extends AnyTD, N extends TaskDecoder<TypeOf<P>, any, any>>(
    next: N
  ): (prev: P) => CompositionTD<P, N>;
  <A, E2, B>(
    next: TaskDecoder<A, E2, B>
  ): <I, E1>(prev: TaskDecoder<I, E1, A>) => CompositionTD<typeof prev, typeof next>;
 } = <A, E2, B>(
   next: TaskDecoder<A, E2, B>
 ) => <I, E1>(prev: TaskDecoder<I, E1, A>): CompositionTD<typeof prev, typeof next> => {
   return ({
     _tag: 'CompositionTD',
     prev,
     next,
     decode: flow(
       prev.decode,
       T.chain(
        TH.fold(
          (e1) => failure(DE.compositionE([DE.prevE(e1)])),
          (a) =>
            pipe(
              next.decode(a),
              TT.mapLeft((e) => DE.compositionE([DE.nextE(e)]))
            ),
          (w1, a) =>
            pipe(
              next.decode(a),
              T.map(
                TH.fold(
                  (e2) => D.failure(DE.compositionE([DE.prevE(w1), DE.nextE(e2)])),
                  (b) => D.warning(DE.compositionE([DE.prevE(w1)]), b),
                  (w2, b) => D.warning(DE.compositionE([DE.prevE(w1), DE.nextE(w2)]), b)
                )
              )
            )
        )
       )
     )
   })
 }


// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 2.2.7
 */
export const URI = 'io-ts/TaskDecoder'

/**
 * @category instances
 * @since 2.2.7
 */
export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind3<R, E, A> {
    readonly [URI]: TaskDecoder<R, E, A>
  }
}

const map_: Functor3<URI>['map'] = (fa, f) => pipe(fa, map(f))

/**
 * @category instances
 * @since 2.2.8
 */
export const Functor: Functor3<URI> = {
  URI,
  map: map_
}


// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.17
 */
 export interface AnyTD extends TaskDecoder<any, any, any> {}

 /**
  * @since 2.2.17
  */
 export interface AnyUTD extends TaskDecoder<unknown, any, any> {}
 
 /**
  * @since 2.2.8
  */
 export type InputOf<D> = D extends TaskDecoder<infer I, any, any> ? I : never
 
 /**
  * @since 2.2.17
  */
 export type ErrorOf<D> = D extends TaskDecoder<any, infer E, any> ? E : never
 
 /**
  * @since 2.2.7
  */
 export type TypeOf<D> = D extends TaskDecoder<any, any, infer A> ? A : never
