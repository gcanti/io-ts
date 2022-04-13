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
import { flow, Lazy, Refinement } from 'fp-ts/lib/function'
import { pipe } from 'fp-ts/lib/pipeable'
import * as R from 'fp-ts/lib/Record'
import * as D from './Decoder'
import * as DE from './DecodeError'
import * as TH from 'fp-ts/lib/These'
import * as RNEA from 'fp-ts/lib/ReadonlyNonEmptyArray'

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
  return codec(decoder, D.id<D.TypeOf<D>>())
}

/**
 * @category constructors
 * @since 2.2.3
 */
export const literal = flow(D.literal, fromDecoder)

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 2.2.15
 */
export const fromStruct = <Properties extends Record<string, AnyC>>(
  components: Properties
): Codec<
  D.FromStructD<{ [K in keyof Properties]: Properties[K]['decoder'] }>,
  D.FromStructD<{ [K in keyof Properties]: Properties[K]['encoder'] }>
> =>
  codec(
    pipe(
      components,
      R.map((c) => c.decoder),
      D.fromStruct
    ) as D.FromStructD<{ [K in keyof Properties]: Properties[K]['decoder'] }>,
    pipe(
      components,
      R.map((c) => c.encoder),
      D.fromStruct
    ) as D.FromStructD<{ [K in keyof Properties]: Properties[K]['encoder'] }>
  )

export const unexpectedKeys = flow(D.unexpectedKeys, fromDecoder)

export const missingKeys = flow(D.missingKeys, fromDecoder)

/**
 * @category combinators
 * @since 2.2.15
 */
export const struct = <Properties extends Record<string, AnyUC>>(
  components: Properties
): Codec<
  D.StructD<{ [K in keyof Properties]: Properties[K]['decoder'] }>,
  D.StructD<{ [K in keyof Properties]: Properties[K]['encoder'] }>
> =>
  codec(
    pipe(
      components,
      R.map((c) => c.decoder),
      D.struct
    ) as D.StructD<{ [K in keyof Properties]: Properties[K]['decoder'] }>,
    pipe(
      components,
      R.map((c) => c.encoder),
      D.struct
    ) as D.StructD<{ [K in keyof Properties]: Properties[K]['encoder'] }>
  )

/**
 * @category combinators
 * @since 2.2.8
 */
export const fromPartial = <Properties extends Record<string, AnyC>>(
  components: Properties
): Codec<
  D.FromPartialD<{ [K in keyof Properties]: Properties[K]['decoder'] }>,
  D.FromPartialD<{ [K in keyof Properties]: Properties[K]['encoder'] }>
> =>
  codec(
    pipe(
      components,
      R.map((c) => c.decoder),
      D.fromPartial
    ) as D.FromPartialD<{ [K in keyof Properties]: Properties[K]['decoder'] }>,
    pipe(
      components,
      R.map((c) => c.encoder),
      D.fromPartial
    ) as D.FromPartialD<{ [K in keyof Properties]: Properties[K]['encoder'] }>
  )

/**
 * @category combinators
 * @since 2.2.3
 */
export const partial = <Properties extends Record<string, AnyUC>>(
  components: Properties
): Codec<
  D.PartialD<{ [K in keyof Properties]: Properties[K]['decoder'] }>,
  D.PartialD<{ [K in keyof Properties]: Properties[K]['encoder'] }>
> =>
  codec(
    pipe(
      components,
      R.map((c) => c.decoder),
      D.partial
    ) as D.PartialD<{ [K in keyof Properties]: Properties[K]['decoder'] }>,
    pipe(
      components,
      R.map((c) => c.encoder),
      D.partial
    ) as D.PartialD<{ [K in keyof Properties]: Properties[K]['encoder'] }>
  )

/**
 * @category combinators
 * @since 2.2.8
 */
export const fromTuple = <Components extends ReadonlyArray<AnyUC>>(
  components: Components
): Codec<
  D.FromTupleD<{ [K in keyof Components]: Components[Extract<K, number>]['decoder'] }>,
  D.FromTupleD<{ [K in keyof Components]: Components[Extract<K, number>]['encoder'] }>
> =>
  codec(
    D.fromTuple(...components.map((c) => c.decoder)) as any,
    D.fromTuple(...components.map((c) => c.encoder)) as any
  )

export const unexpectedIndexes = flow(D.unexpectedIndexes, fromDecoder)

export const missingIndexes = flow(D.missingIndexes, fromDecoder)

/**
 * @category combinators
 * @since 2.2.3
 */
export const tuple = <Components extends ReadonlyArray<AnyUC>>(
  ...components: Components
): Codec<
  D.TupleD<{ [K in keyof Components]: Components[Extract<K, number>]['decoder'] }>,
  D.TupleD<{ [K in keyof Components]: Components[Extract<K, number>]['encoder'] }>
> => codec(D.tuple(...components.map((c) => c.decoder)) as any, D.tuple(...components.map((c) => c.encoder)) as any)

/**
 * @category combinators
 * @since 2.2.3
 */
export const fromArray = <Item extends AnyUC>(
  item: Item
): Codec<D.FromArrayD<Item['decoder']>, D.FromArrayD<Item['encoder']>> =>
  codec(pipe(item.decoder, D.fromArray), pipe(item.encoder, D.fromArray))

/**
 * @category combinators
 * @since 2.2.3
 */
export const array = <Item extends AnyUC>(item: Item): Codec<D.ArrayD<Item['decoder']>, D.ArrayD<Item['encoder']>> =>
  codec(pipe(item.decoder, D.array), pipe(item.encoder, D.array))

/**
 * @category combinators
 * @since 2.2.3
 */
export const fromRecord = <Codomain extends AnyUC>(
  codomain: Codomain
): Codec<D.FromRecordD<Codomain['decoder']>, D.FromRecordD<Codomain['encoder']>> =>
  codec(pipe(codomain.decoder, D.fromRecord), pipe(codomain.encoder, D.fromRecord))

/**
 * @since 2.2.17
 */
export interface AnyUC extends Codec<D.Decoder<unknown, any, any>, D.Decoder<any, any, any>> {}

/**
 * @category combinators
 * @since 2.2.3
 */
export const record = <Codomain extends AnyUC>(
  codomain: Codomain
): Codec<D.RecordD<Codomain['decoder']>, D.RecordD<Codomain['encoder']>> =>
  codec(pipe(codomain.decoder, D.record), pipe(codomain.encoder, D.record))

export const union = <Members extends RNEA.ReadonlyNonEmptyArray<AnyC>>(
  ...members: Members
): Codec<
  { [K in keyof Members]: Members[Extract<K, number>]['decoder'] },
  { [K in keyof Members]: Members[Extract<K, number>]['encoder'] }
> => {
  const decodeMembers = pipe(
    members,
    RNEA.map((m) => m.decoder)
  )
  const encodeMembers = pipe(
    members,
    RNEA.map((m) => m.encoder)
  )
  return codec(
    D.union(decodeMembers[0], ...RNEA.tail(decodeMembers)) as any,
    D.union(encodeMembers[0], ...RNEA.tail(encodeMembers)) as any
  )
}

/**
 * @category combinators
 * @since 2.2.3
 */
export const refine = <A, B extends A, C, D extends C>(decode: Refinement<A, B>, encode: Refinement<C, D>) => <
  I,
  E,
  I1,
  E1
>(
  from: Codec<D.Decoder<I, E, A>, D.Decoder<I1, E1, C>>
): Codec<D.Decoder<I, D.RefinementError<E, A, B>, B>, D.Decoder<I1, D.RefinementError<E1, C, D>, D>> =>
  codec(pipe(from.decoder, D.refine(decode)), pipe(from.encoder, D.refine(encode)))

export const parse = <A, B, E2, C, D, E3>(decode: (a: A) => TH.These<E2, B>, encode: (a: C) => TH.These<E3, D>) => <
  I,
  E,
  I1,
  E1
>(
  from: Codec<D.Decoder<I, E, A>, D.Decoder<I1, E1, C>>
): Codec<D.Decoder<I, D.ParseError<E, E2>, B>, D.Decoder<I1, D.ParseError<E1, E3>, D>> =>
  codec(pipe(from.decoder, D.parse(decode)), pipe(from.encoder, D.parse(encode)))

/**
 * @category combinators
 * @since 2.2.3
 */
export const nullable = <C extends AnyC>(or: C): Codec<D.NullableD<C['decoder']>, D.NullableD<C['encoder']>> =>
  codec(pipe(or.decoder, D.nullable), pipe(or.encoder, D.nullable))

/**
 * @category combinators
 * @since 2.2.16
 */
export const readonly = flow(D.readonly, fromDecoder)

export type AnyC = Codec<D.Decoder<any, any, any>, D.Decoder<any, any, any>>
/**
 * @category combinators
 * @since 2.2.3
 */
export const intersect = <A extends AnyC>(right: A) => <B extends AnyC>(
  left: B
): Codec<D.IntersectD<A['decoder'], B['decoder']>, D.IntersectD<A['encoder'], B['encoder']>> =>
  codec(pipe(left.decoder, D.intersect(right.decoder)), pipe(left.encoder, D.intersect(right.encoder)))

/**
 * @category meta
 * @since 2.2.17
 */
export interface LazyC<C extends AnyC> extends Codec<C['decoder'], C['encoder']> {
  readonly _tag: 'LazyD'
  readonly id: string
  readonly f: Lazy<Codec<C['decoder'], C['encoder']>>
}

/**
 * @category combinators
 * @since 2.2.3
 */
export const lazy = <C extends AnyC>(id: string, f: Lazy<Codec<C['decoder'], C['encoder']>>): LazyC<C> => {
  const get = D.memoize<void, Codec<C['decoder'], C['encoder']>>(f)
  return {
    _tag: 'LazyD',
    id,
    f,
    decoder: {
      decode: (i) =>
        pipe(
          get().decoder.decode(i),
          TH.mapLeft((e) => DE.lazyE(id, e))
        )
    },
    encoder: {
      decode: (i) =>
        pipe(
          get().encoder.decode(i),
          TH.mapLeft((e) => DE.lazyE(id, e))
        )
    }
  }
}

/**
 * @category combinators
 * @since 2.2.8
 */
export const fromSum = <T extends string>(t: T) => <Members extends Record<string, AnyC>>(
  members: Members
): Codec<
  D.FromSumD<T, { [K in keyof Members]: Members[K]['decoder'] }>,
  D.FromSumD<T, { [K in keyof Members]: Members[K]['encoder'] }>
> => ({
  decoder: pipe(
    members,
    R.map((a) => a.decoder),
    D.fromSum(t)
  ) as D.FromSumD<T, { [K in keyof Members]: Members[K]['decoder'] }>,
  encoder: pipe(
    members,
    R.map((a) => a.encoder),
    D.fromSum(t)
  ) as D.FromSumD<T, { [K in keyof Members]: Members[K]['encoder'] }>
})

export interface AnyUCD extends Codec<D.Decoder<unknown, any, any>, D.Decoder<any, any, unknown>> {}
/**
 * @category combinators
 * @since 2.2.3
 */
export const sum = <T extends string>(t: T) => <Members extends Record<string, AnyUCD>>(
  members: Members
): Codec<
  D.SumD<T, { [K in keyof Members]: Members[K]['decoder'] }>,
  D.SumD<T, { [K in keyof Members]: Members[K]['encoder'] }>
> =>
  codec(
    pipe(
      members,
      R.map((a) => a.decoder),
      D.sum(t)
    ) as D.SumD<T, { [K in keyof Members]: Members[K]['decoder'] }>,
    pipe(
      members,
      R.map((a) => a.encoder),
      D.sum(t)
    ) as D.SumD<T, { [K in keyof Members]: Members[K]['encoder'] }>
  )

/**
 * @category combinators
 * @since 2.2.3
 */
export const map = <A, B, C, D>(f: (a: A) => B, g: (c: C) => D) => <I, E, I1, E1>(
  from: Codec<D.Decoder<I, E, A>, D.Decoder<I1, E1, C>>
): Codec<D.MapD<D.Decoder<I, E, A>, B>, D.MapD<D.Decoder<I1, E1, C>, D>> =>
  codec(pipe(from.decoder, D.map(f)), pipe(from.encoder, D.map(g)))

/**
 * @category combinators
 * @since 2.2.3
 */
export const mapLeft = <E1, E2, E3, E4>(f: (e: E1) => E2, g: (e: E3) => E4) => <I, A, I1, B>(
  from: Codec<D.Decoder<I, E1, A>, D.Decoder<I1, E3, B>>
): Codec<D.MapLeftD<D.Decoder<I, E1, A>, E2>, D.MapLeftD<D.Decoder<I1, E3, B>, E4>> =>
  codec(pipe(from.decoder, D.mapLeft(f)), pipe(from.encoder, D.mapLeft(g)))

/**
 * @category instance operations
 * @since 2.2.8
 */
export const id = <A = never>(): Codec<D.IdentityD<A>, D.IdentityD<A>> => codec(D.id<A>(), D.id<A>())

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
