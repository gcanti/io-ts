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
import * as RNEA from 'fp-ts/lib/ReadonlyNonEmptyArray'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import * as RA from 'fp-ts/lib/ReadonlyArray'
import * as R from 'fp-ts/lib/Record'
import * as T from 'fp-ts/lib/Task'
import * as TH from 'fp-ts/lib/These'
import * as DE from './DecodeError'
import * as D from './Decoder'
import { Ord } from 'fp-ts/lib/Ord'

import TaskThese = TT.TaskThese
import Decoder = D.Decoder
import ReadonlyNonEmpty = RNEA.ReadonlyNonEmptyArray
import { Applicative1 } from 'fp-ts/lib/Applicative'


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
 * @category meta
 * @since 2.2.17
 */
 export interface UnknownRecordUTD extends TaskDecoder<unknown, DE.UnknownRecordLE, Record<string, unknown>> {
  readonly _tag: 'UnknownRecordUTD'
}

/**
 * @category meta
 * @since 2.2.17
 */
 export interface UnknownArrayUTD extends TaskDecoder<unknown, DE.UnknownArrayLE, Array<unknown>> {
  readonly _tag: 'UnknownArrayUTD'
 }

/**
 * @category primitives
 * @since 2.2.3
 */
export const UnknownArray: UnknownArrayUTD = ({
  ...fromDecoder(D.UnknownArray),
  _tag: 'UnknownArrayUTD'
})

/**
 * @category primitives
 * @since 2.2.3
 */
export const UnknownRecord: UnknownRecordUTD = ({
  ...fromDecoder(D.UnknownRecord),
  _tag: 'UnknownRecordUTD'
})

 
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
 * @since 2.2.17
 */
 export interface FromStructTE<Properties>
 extends DE.CompoundE<
   { readonly [K in keyof Properties]: DE.RequiredKeyE<K, ErrorOf<Properties[K]>> }[keyof Properties]
 > {}

/**
 * @category meta
 * @since 2.2.17
 */
 export interface FromStructTD<Properties>
 extends TaskDecoder<
   { [K in keyof Properties]: InputOf<Properties[K]> },
   FromStructTE<Properties>,
   { [K in keyof Properties]: TypeOf<Properties[K]> }
 > {
 readonly _tag: 'FromStructTD'
 readonly properties: Properties
}
  /**
   * @category combinators
   * @since 2.2.15
   */
  export const fromStruct = (Ord: Ord<string>) => (applicative: Applicative1<T.URI>) => <Properties extends Record<string, AnyTD>>(
    properties: Properties
  ): FromStructTD<Properties> => ({
    _tag: 'FromStructTD',
    properties,
    decode: (ur) => pipe(
      R.getTraversableWithIndex(Ord).traverseWithIndex(applicative)(properties, (key, decoder) => decoder.decode(ur[key])),
      T.map(r => pipe(
        R.getTraversableWithIndex(Ord).traverseWithIndex(
          TH.getApplicative<ReadonlyNonEmpty<DE.RequiredKeyE<string, ErrorOf<Properties[keyof Properties]>>>>(
            RNEA.getSemigroup()
          )
        )(r, (i, a) => pipe(
          a, 
          TH.mapLeft(e => pipe(DE.requiredKeyE(i, e), RNEA.of))
        )),
        TH.mapLeft(DE.structE),
        TH.map<Record<string, any>, { [K in keyof Properties]: TypeOf<Properties[K]>; }>(a => a as any)
      ))
    )
  })

  /**
   * @category meta
   * @since 2.2.17
   */
  export interface UnexpectedKeysTD<Properties>
    extends TaskDecoder<Record<string, unknown>, DE.UnexpectedKeysE, Partial<{ [K in keyof Properties]: unknown }>> {
    readonly _tag: 'UnexpectedKeysTD'
    readonly properties: Properties
  }
  
  export const unexpectedKeys = <Properties extends Record<string, unknown>>(
    properties: Properties
  ): UnexpectedKeysTD<Properties> => ({
    ...pipe(properties, D.unexpectedKeys, fromDecoder),
    _tag: "UnexpectedKeysTD",
    properties,
  })


  /**
   * @category meta
   * @since 2.2.17
   */
  export interface MissingKeysTD<Properties>
    extends TaskDecoder<
      Partial<{ [K in keyof Properties]: unknown }>,
      DE.MissingKeysE,
      { [K in keyof Properties]: unknown }
    > {
    readonly _tag: 'MissingKeysTD'
    readonly properties: Properties
  }
  export const missingKeys = <Properties extends Record<string, unknown>>(
    properties: Properties
  ): MissingKeysTD<Properties> => ({
    ...pipe(properties, D.missingKeys, fromDecoder),
    _tag: "MissingKeysTD",
    properties,
  })
  
  /**
   * @category meta
   * @since 2.2.17
   */
  export interface StructTD<Properties>
  extends CompositionTD<
    CompositionTD<CompositionTD<UnknownRecordUTD, UnexpectedKeysTD<Properties>>, MissingKeysTD<Properties>>,
    FromStructTD<Properties>
  > {}

   /**
    * @category combinators
    * @since 2.2.15
    */
    export function struct(Ord: Ord<string>): 
      (applicative: Applicative1<T.URI>) => 
      <Properties extends Record<string, AnyUTD>>(properties: Properties) => StructTD<Properties>
    export function struct(Ord: Ord<string>): 
      (applicative: Applicative1<T.URI>) => 
      (properties: Record<string, AnyUTD>) => StructTD<typeof properties> {
      return (applicative: Applicative1<T.URI>) => 
      (properties: Record<string, AnyUTD>): StructTD<typeof properties> => pipe(
        UnknownRecord, // unknown -> Record<string, unknown>
        compose(unexpectedKeys(properties)), // Record<string, unknown> -> { a?: unknown, b?: unknown, ... }
        compose(missingKeys(properties)), // { a?: unknown, b?: unknown, ... } -> { a: unknown, b: unknown, ..., }
        compose(fromStruct(Ord)(applicative)(properties)) // { a: unknown, b: unknown, ..., } -> { a: string, b: number, ... }
      )
    }

/**
 * @since 2.2.17
 */
 export interface FromPartialE<Properties>
 extends DE.CompoundE<
   { readonly [K in keyof Properties]: DE.OptionalKeyE<K, ErrorOf<Properties[K]>> }[keyof Properties]
 > {}

/**
* @category meta
* @since 2.2.17
*/
export interface FromPartialD<Properties>
 extends TaskDecoder<
   Partial<{ [K in keyof Properties]: InputOf<Properties[K]> }>,
   FromPartialE<Properties>,
   Partial<{ [K in keyof Properties]: TypeOf<Properties[K]> }>
 > {
 readonly _tag: 'FromPartialD'
 readonly properties: Properties
}

   /**
    * @category combinators
    * @since 2.2.8
    */
  export const fromPartial = (Ord: Ord<string>) => (applicative: Applicative1<T.URI>) => <Properties extends Record<string, AnyTD>>(
    properties: Properties
  ): FromPartialD<Properties> => ({
    _tag: 'FromPartialD',
    properties,
    decode: (ur) => pipe(
      R.getTraversableWithIndex(Ord).traverseWithIndex(applicative)(
        properties,
        (key, decoder) => pipe(
          ur[key], 
          O.fromNullable, 
          O.traverse(applicative)(x => decoder.decode(x))
        )
      ),
      T.map(R.compact),
      T.map(r => pipe(
        R.getTraversableWithIndex(Ord).traverseWithIndex(
          TH.getApplicative<ReadonlyNonEmpty<DE.OptionalKeyE<string, ErrorOf<Properties[keyof Properties]>>>>(
            RNEA.getSemigroup()
          )
        )(r, (i, a) => pipe(
          a, 
          TH.mapLeft(e => pipe(DE.optionalKeyE(i, e), RNEA.of))
        )),
        TH.mapLeft(DE.partialE),
        TH.map<Record<string, any>, { [K in keyof Properties]: TypeOf<Properties[K]>; }>(a => a as any)
      ))
    )
  })
  
  /**
   * @category meta
   * @since 2.2.17
   */
  export interface PartialTD<Properties>
  extends CompositionTD<CompositionTD<UnknownRecordUTD, UnexpectedKeysTD<Properties>>, FromPartialD<Properties>> {}

  /**
  * @category combinators
  * @since 2.2.7
  */
  export function partial(Ord: Ord<string>): 
    (applicative: Applicative1<T.URI>) => 
      <Properties extends Record<string, AnyUTD>>(properties: Properties) => 
      PartialTD<Properties>
  export function partial(Ord: Ord<string>): 
    (applicative: Applicative1<T.URI>) => 
    (properties: Record<string, AnyUTD>) => 
    PartialTD<typeof properties> {
    return (applicative: Applicative1<T.URI>) => 
    (properties: Record<string, AnyUTD>): 
      PartialTD<typeof properties> => pipe(
      UnknownRecord, 
      compose(unexpectedKeys(properties)), 
      compose(fromPartial(Ord)(applicative)(properties))
    )
  }
  
/**
 * @since 2.2.17
 */
export interface FromTupleTE<Components extends ReadonlyArray<unknown>>
extends DE.CompoundE<{ [K in keyof Components]: DE.RequiredIndexE<K, ErrorOf<Components[K]>> }[number]> {}

/**
* @category meta
* @since 2.2.17
*/
export interface FromTupleTD<Components extends ReadonlyArray<unknown>>
extends TaskDecoder<
  { readonly [K in keyof Components]: InputOf<Components[K]> },
  FromTupleTE<Components>,
  { [K in keyof Components]: TypeOf<Components[K]> }
> {
readonly _tag: 'FromTupleTD'
readonly components: Components
}
   /**
    * @category combinators
    * @since 2.2.8
    */
  export const fromTuple = (applicative: Applicative1<T.URI>) => <Components extends ReadonlyArray<AnyTD>>(
    ...components: Components
  ): FromTupleTD<Components> => ({
    _tag: 'FromTupleTD',
    components,
    decode: (ur) => {
      const a = pipe(
        components,
        RA.traverseWithIndex(applicative)((key, decoder) => decoder.decode(ur[key])),
        T.map(flow(
          RA.traverseWithIndex(
            TH.getApplicative<ReadonlyNonEmpty<DE.RequiredIndexE<number, ErrorOf<Components[number]>>>>(
              RNEA.getSemigroup()
            )
          )((i, a) => pipe(
            a, 
            TH.mapLeft(e => pipe(DE.requiredIndexE(i, e), RNEA.of))
          )),
          TH.mapLeft(DE.tupleE),
          TH.map<Record<string, any>, { [K in keyof Components]: TypeOf<Components[K]>; }>(a => a as any)
        ))
      )
      return a
    }
  })

  /**
   * @category meta
   * @since 2.2.17
   */
  export interface UnexpectedIndexesTD<Components>
    extends TaskDecoder<Array<unknown>, DE.UnexpectedIndexesE, { [K in keyof Components]?: unknown }> {
    readonly _tag: 'UnexpectedIndexesTD'
    readonly components: Components
  }

  export const unexpectedIndexes = <Components extends ReadonlyArray<unknown>>(
    ...components: Components
  ): UnexpectedIndexesTD<Components> => ({
    ...pipe(D.unexpectedIndexes(...components), fromDecoder),
    _tag: "UnexpectedIndexesTD",
    components,
  })


  /**
   * @category meta
   * @since 2.2.17
   */
  export interface MissingIndexesTD<Components>
  extends TaskDecoder<
    { readonly [K in keyof Components]?: unknown },
    DE.MissingIndexesE,
    { [K in keyof Components]: unknown }
  > {
    readonly _tag: 'MissingIndexesTD'
    readonly components: Components
  }

  export const missingIndexes = <Components extends ReadonlyArray<unknown>>(
    ...components: Components
  ): MissingIndexesTD<Components> => ({
    ...pipe(D.missingIndexes(...components), fromDecoder),
    _tag: "MissingIndexesTD",
    components,
  })
  

  /**
   * @category meta
   * @since 2.2.17
   */
  export interface TupleTD<Components extends ReadonlyArray<unknown>>
  extends CompositionTD<
    CompositionTD<CompositionTD<UnknownArrayUTD, UnexpectedIndexesTD<Components>>, MissingIndexesTD<Components>>,
    FromTupleTD<Components>
  > {}

  /**
  * @category combinators
  * @since 2.2.7
  */
  export function tuple(applicative: Applicative1<T.URI>): <Components extends ReadonlyArray<AnyUTD>>(...cs: Components) => TupleTD<Components>
  export function tuple(applicative: Applicative1<T.URI>): (...cs: ReadonlyArray<AnyUTD>) => TupleTD<typeof cs> {
    return (...cs: ReadonlyArray<AnyUTD>): TupleTD<typeof cs> => pipe(
      UnknownArray, // unknown -> Array<unknown>
      compose(unexpectedIndexes(...cs)), // Array<unknown> -> [unknown?, unknown?, ...]
      compose(missingIndexes(...cs)), // [unknown?, unknown?, ...] -> [unknown, unknown, ...]
      compose(fromTuple(applicative)(...cs)) // [unknown, unknown, ...] -> [string, number, ...]
    )
  }
  


/**
 * @since 2.2.17
 */
 export interface FromArrayTE<Item> extends DE.CompoundE<DE.OptionalIndexE<number, ErrorOf<Item>>> {}
/**
 * @category meta
 * @since 2.2.17
 */
 export interface FromArrayTD<Item> extends TaskDecoder<Array<InputOf<Item>>, FromArrayTE<Item>, Array<TypeOf<Item>>> {
  readonly _tag: 'FromArrayTD'
  readonly item: Item
}

  /**
   * @category combinators
   * @since 2.2.3
   */
  export const fromArray = (applicative: Applicative1<T.URI>) => <I, E, A>(item: TaskDecoder<I, E, A>): FromArrayTD<typeof item> => {
    return {
      _tag: 'FromArrayTD',
      item,
      decode: (us) => pipe(
        us,
        A.traverse(applicative)(item.decode),
        T.map(flow(
          A.traverseWithIndex(
            TH.getApplicative<ReadonlyNonEmpty<DE.OptionalIndexE<number, E>>>(
              RNEA.getSemigroup()
            )
          )((i, a) => pipe(
            a, 
            TH.mapLeft(e => pipe(DE.optionalIndexE(i, e), RNEA.of))
          )),
          TH.mapLeft(DE.arrayE)
        ))
      )
    }
  }
  
  /**
   * @category meta
   * @since 2.2.17
   */
  export interface ArrayTD<Item> extends CompositionTD<UnknownArrayUTD, FromArrayTD<Item>> {}

  /**
   * @category combinators
   * @since 2.2.7
   */
  export function array(applicative: Applicative1<T.URI>): <Item extends AnyUTD>(item: Item) => ArrayTD<Item>
  export function array(applicative: Applicative1<T.URI>): <E, A>(item: TaskDecoder<unknown, E, A>) => ArrayTD<typeof item> {
    return <E, A>(item: TaskDecoder<unknown, E, A>): ArrayTD<typeof item> => 
      pipe(UnknownArray, compose(fromArray(applicative)(item)))
  }
  


/**
 * @since 2.2.17
 */
 export interface FromRecordTE<Codomain> extends DE.CompoundE<DE.OptionalKeyE<string, ErrorOf<Codomain>>> {}

 /**
  * @category meta
  * @since 2.2.17
  */
 export interface FromRecordTD<Codomain>
   extends TaskDecoder<Record<string, InputOf<Codomain>>, FromRecordTE<Codomain>, Record<string, TypeOf<Codomain>>> {
   readonly _tag: 'FromRecordTD'
   readonly codomain: Codomain
 }

  /**
   * @category combinators
   * @since 2.2.3
   */
  export const fromRecord = (Ord: Ord<string>) => (applicative: Applicative1<T.URI>) => <I, E, A>(codomain: TaskDecoder<I, E, A>): FromRecordTD<typeof codomain> => {
    return {
      _tag: 'FromRecordTD',
      codomain,
      decode: (i) => pipe(
        R.getTraversableWithIndex(Ord).traverse(applicative)(i, codomain.decode),
        T.map(r => pipe(
          R.getTraversableWithIndex(Ord).traverseWithIndex(
            TH.getApplicative<ReadonlyNonEmpty<DE.OptionalKeyE<string, E>>>(
              RNEA.getSemigroup()
            )
          )(r, (i, a) => pipe(
            a, 
            TH.mapLeft(e => pipe(DE.optionalKeyE(i, e), RNEA.of))
          )),
          TH.mapLeft(DE.recordE)
        ))
      )
    }
  }

  /**
   * @category meta
   * @since 2.2.17
   */
  export interface RecordTD<Codomain> extends CompositionTD<UnknownRecordUTD, FromRecordTD<Codomain>> {}
  
  /**
   * @category combinators
   * @since 2.2.7
   */
  export function record(Ord: Ord<string>): 
    (applicative: Applicative1<T.URI>) => 
    <Codomain extends AnyUTD>(codomain: Codomain) => 
    RecordTD<Codomain>
  export function record(Ord: Ord<string>): 
    (applicative: Applicative1<T.URI>) => 
    <E, A>(codomain: TaskDecoder<unknown, E, A>) => 
    RecordTD<typeof codomain> {
    return (applicative: Applicative1<T.URI>) => 
      <E, A>(codomain: TaskDecoder<unknown, E, A>): RecordTD<typeof codomain> => 
      pipe(UnknownRecord, compose(fromRecord(Ord)(applicative)(codomain)))
  }

/**
 * @since 2.2.17
 */
 export interface UnionTE<Members extends ReadonlyNonEmpty<AnyTD>>
 extends DE.CompoundE<{ [K in keyof Members]: DE.MemberE<K, ErrorOf<Members[K]>> }[number]> {}

/**
* @category meta
* @since 2.2.17
*/
export interface UnionTD<Members extends ReadonlyNonEmpty<AnyTD>>
 extends TaskDecoder<D.UnionToIntersection<InputOf<Members[number]>>, UnionTE<Members>, TypeOf<Members[keyof Members]>> {
 readonly _tag: 'UnionD'
 readonly members: Members
}

/**
 * @since 2.2.17
 */
export interface UnionE<Members extends ReadonlyNonEmpty<AnyTD>>
  extends DE.CompoundE<{ [K in keyof Members]: DE.MemberE<K, ErrorOf<Members[K]>> }[number]> {}

  export const union = <Members extends ReadonlyNonEmpty<AnyTD>>(
    ...members: Members
  ): UnionTD<Members> => {
    return {
      _tag: 'UnionD',
      members,
      decode: (i) => {
        const a = pipe(
          members,
          RNEA.traverseWithIndex(
            TT.getApplicative<ReadonlyNonEmpty<DE.MemberE<number, ErrorOf<Members[keyof Members]>>>>(
              T.ApplicativeSeq,
              RNEA.getSemigroup()
            )
          )(
            (index, td) => pipe(
              td.decode(i),
              TT.mapLeft(de => DE.memberE(Number(index), de)),
              TT.mapLeft(RNEA.of),
            )
          ),
          TT.mapLeft(DE.unionE),
          TT.map(a => a as TypeOf<Members[keyof Members]>)
        )
        return a
      }
    }
  }

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
 * @since 2.2.17
 */
export interface IntersectTE<F, S> extends DE.CompoundE<DE.MemberE<0, ErrorOf<F>> | DE.MemberE<1, ErrorOf<S>>> {}

/**
 * @category meta
 * @since 2.2.17
 */
export interface IntersectTD<F, S> extends TaskDecoder<InputOf<F> & InputOf<S>, IntersectTE<F, S>, TypeOf<F> & TypeOf<S>> {
  readonly _tag: 'IntersectD'
  readonly first: F
  readonly second: S
}
  /**
   * @category combinators
   * @since 2.2.3
   */
  export function intersect<S extends TaskDecoder<any, DE.DecodeError<any>, any>>(
    second: S
  ): <F extends TaskDecoder<any, DE.DecodeError<any>, any>>(first: F) => IntersectTD<F, S>
  export function intersect<I2, E2, A2>(
    second: TaskDecoder<I2, DE.DecodeError<E2>, A2>
  ): <I1, E1, A1>(first: TaskDecoder<I1, DE.DecodeError<E1>, A1>) => IntersectTD<typeof first, typeof second> {
    return <I1, E1, A1>(first: TaskDecoder<I1, DE.DecodeError<E1>, A1>): IntersectTD<typeof first, typeof second> => ({
      _tag: 'IntersectD',
      first,
      second,
      decode: (i) => {
        const out: TT.TaskThese<
          DE.CompoundE<DE.MemberE<0, DE.DecodeError<E1>> | DE.MemberE<1, DE.DecodeError<E2>>>,
          A1 & A2
        > = pipe(
          first.decode(i),
          TT.fold(
            (de1) =>
              pipe(
                second.decode(i),
                TT.fold(
                  (de2) => failure(DE.intersectionE([DE.memberE(0, de1), DE.memberE(1, de2)])),
                  () => failure(DE.intersectionE([DE.memberE(0, de1)])),
                  (de2) => {
                    const pde2 = D.pruneAllUnexpected(de2)
                    return O.isSome(pde2)
                      ? failure(DE.intersectionE([DE.memberE(0, de1), DE.memberE(1, pde2.value)]))
                      : failure(DE.intersectionE([DE.memberE(0, de1)]))
                  }
                )
              ),
            (a1) =>
              pipe(
                second.decode(i),
                TT.fold(
                  (de2) => failure(DE.intersectionE([DE.memberE(1, de2)])),
                  (a2) => success(D.intersect_(a1, a2)),
                  (de2, a2) => {
                    const pde2 = D.pruneAllUnexpected(de2)
                    return O.isSome(pde2)
                      ? warning(DE.intersectionE([DE.memberE(1, pde2.value)]), D.intersect_(a1, a2))
                      : success(D.intersect_(a1, a2))
                  }
                )
              ),
            (de1, a1) =>
              pipe(
                second.decode(i),
                TT.fold(
                  (de2) => {
                    const pde1 = D.pruneAllUnexpected(de1)
                    return O.isSome(pde1)
                      ? failure(DE.intersectionE([DE.memberE(0, pde1.value), DE.memberE(1, de2)]))
                      : failure(DE.intersectionE([DE.memberE(1, de2)]))
                  },
                  (a2) => {
                    const pde1 = D.pruneAllUnexpected(de1)
                    return O.isSome(pde1)
                      ? warning(DE.intersectionE([DE.memberE(0, pde1.value)]), D.intersect_(a1, a2))
                      : success(D.intersect_(a1, a2))
                  },
                  (de2, a2) => {
                    const difference = D.pruneDifference(de1, de2)
                    return O.isSome(difference)
                      ? warning(difference.value, D.intersect_(a1, a2))
                      : success(D.intersect_(a1, a2))
                  }
                )
              )
          )
        )
        return out
      }
    })
  }

/**
 * @category combinators
 * @since 2.2.3
 */
export const lazy = flow(D.lazy, fromDecoder)
/**
 * @since 2.2.17
 */
export interface FromSumTE<Members>
  extends DE.SumE<{ [K in keyof Members]: DE.MemberE<K, ErrorOf<Members[K]>> }[keyof Members]> {}

export interface FromSumTD<T extends string, Members>
  extends TaskDecoder<InputOf<Members[keyof Members]>, DE.TagLE | D.FromSumE<Members>, TypeOf<Members[keyof Members]>> {
  readonly _tag: 'FromSumTD'
  readonly tag: T
  readonly members: Members
}

  /**
   * @category combinators
   * @since 2.2.8
   */
  export function fromSum<T extends string>(
    tag: T
  ): <Members extends Record<string, AnyTD>>(members: Members) => FromSumTD<T, Members>
  export function fromSum <T extends string>(tag: T):
    <I extends Record<T, string>, E, A>(
      members: Record<I[T], TaskDecoder<I, E, A>>
    ) => FromSumTD<T, typeof members> {
    return <I extends Record<T, string>, E, A>(
      members: Record<I[T], TaskDecoder<I, E, A>>
    ): FromSumTD<T, typeof members> => {
      const literals = Object.keys(members)
      return ({
        _tag: "FromSumTD",
        tag,
        members,
        decode: (i: I) => {
          const v = i[tag]
          const member: TaskDecoder<I, E, A> = members[v]
          if (member) {
            return pipe(
              member.decode(i),
              TT.mapLeft((e) => DE.sumE(DE.memberE(v, e)))
            ) as any
          }
          return failure(DE.tagLE(tag, literals))
        }
      })
    }
  }



/**
 * @category meta
 * @since 2.2.17
 */
export interface SumTD<T extends string, Members>
  extends CompositionTD<UnionTD<[UnknownRecordUTD, UnknownArrayUTD]>, FromSumTD<T, Members>> {}
  

//                    tagged objects --v             v-- tagged tuples
const UnknownRecordArray = union(UnknownRecord, UnknownArray)

/**
 * @category combinators
 * @since 2.2.3
 */
export function sum<T extends string>(
  tag: T
): <Members extends Record<string, AnyUTD>>(members: Members) => SumTD<T, Members>
export function sum<T extends string>(
  tag: T
): <E, A>(members: Record<string, TaskDecoder<unknown, E, A>>) => SumTD<T, typeof members> {
  const fromSumTag = fromSum(tag)
  return (members) => pipe(UnknownRecordArray, compose(fromSumTag(members)))
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
