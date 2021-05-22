import { HKT, Kind, URIS } from 'fp-ts/lib/HKT'
import * as D from './Decoder2'
import * as DE from './DecodeError2'
import { ReadonlyNonEmptyArray } from 'fp-ts/lib/ReadonlyNonEmptyArray'

// -------------------------------------------------------------------------------------
// use case: Schemable
// -------------------------------------------------------------------------------------

export interface Schemable<S> {
  readonly URI: S
  readonly literal: <A extends ReadonlyNonEmptyArray<DE.Literal>>(...values: A) => HKT<S, D.LiteralD<A>>
  readonly string: HKT<S, D.stringUD>
  readonly number: HKT<S, D.numberUD>
  readonly boolean: HKT<S, D.booleanUD>
  readonly UnknownArray: HKT<S, D.UnknownArrayUD>
  readonly UnknownRecord: HKT<S, D.UnknownRecordUD>
  readonly struct: <A extends Record<PropertyKey, D.AnyUD>>(
    properties: { [K in keyof A]: HKT<S, A[K]> }
  ) => HKT<S, D.StructD<A>>
  readonly partial: <A extends Record<PropertyKey, D.AnyUD>>(
    properties: { [K in keyof A]: HKT<S, A[K]> }
  ) => HKT<S, D.PartialD<A>>
  readonly tuple: <A extends ReadonlyArray<D.AnyUD>>(
    ...components: { [K in keyof A]: HKT<S, A[K]> }
  ) => HKT<S, D.TupleD<A>>
  readonly array: <A extends D.AnyUD>(item: HKT<S, A>) => HKT<S, D.ArrayD<A>>
  readonly record: <A extends D.AnyUD>(codomain: HKT<S, A>) => HKT<S, D.RecordD<A>>
  readonly nullable: <A extends D.AnyD>(or: HKT<S, A>) => HKT<S, D.NullableD<A>>
  readonly intersect: <B extends D.Decoder<any, DE.DecodeError<any>, any>>(
    b: HKT<S, B>
  ) => <A extends D.Decoder<any, DE.DecodeError<any>, any>>(a: HKT<S, A>) => HKT<S, D.IntersectD<A, B>>
  readonly lazy: <I, E, A>(id: string, f: () => HKT<S, D.Decoder<I, E, A>>) => HKT<S, D.LazyD<I, E, A>>
  readonly sum: <T extends string>(
    tag: T
  ) => <A extends Record<string, D.AnyUD>>(members: { [K in keyof A]: HKT<S, A[K]> }) => HKT<S, D.SumD<T, A>>
}

export interface WithMap<S> {
  readonly map: <A extends D.AnyD, B>(f: (a: D.TypeOf<A>) => B) => (sa: HKT<S, A>) => HKT<S, D.MapD<A, B>>
}

export interface WithMapLeft<S> {
  readonly mapLeft: <A extends D.AnyD, E>(f: (e: D.ErrorOf<A>) => E) => (sa: HKT<S, A>) => HKT<S, D.MapLeftD<A, E>>
}

export interface WithId<S> {
  readonly id: <A>() => HKT<S, D.IdentityD<A>>
}

export interface WithCompose<S> {
  readonly compose: <A extends D.AnyD, N extends HKT<S, D.Decoder<D.TypeOf<A>, any, any>>>(
    next: N
  ) => (sa: HKT<S, A>) => HKT<S, D.CompositionD<A, N>>
}

export interface WithUnion<S> {
  readonly union: <A extends ReadonlyArray<D.AnyD>>(...members: { [K in keyof A]: HKT<S, A[K]> }) => HKT<S, D.UnionD<A>>
}

export interface Schemable1<S extends URIS> {
  readonly URI: S
  readonly literal: <A extends ReadonlyNonEmptyArray<DE.Literal>>(...values: A) => Kind<S, D.LiteralD<A>>
  readonly string: Kind<S, D.stringUD>
  readonly number: Kind<S, D.numberUD>
  readonly boolean: Kind<S, D.booleanUD>
  readonly UnknownArray: Kind<S, D.UnknownArrayUD>
  readonly UnknownRecord: Kind<S, D.UnknownRecordUD>
  readonly struct: <A extends Record<PropertyKey, D.AnyUD>>(
    properties: { [K in keyof A]: Kind<S, A[K]> }
  ) => Kind<S, D.StructD<A>>
  readonly partial: <A extends Record<PropertyKey, D.AnyUD>>(
    properties: { [K in keyof A]: Kind<S, A[K]> }
  ) => Kind<S, D.PartialD<A>>
  readonly tuple: <A extends ReadonlyArray<D.AnyUD>>(
    ...components: { [K in keyof A]: Kind<S, A[K]> }
  ) => Kind<S, D.TupleD<A>>
  readonly array: <A extends D.AnyUD>(item: Kind<S, A>) => Kind<S, D.ArrayD<A>>
  readonly record: <A extends D.AnyUD>(codomain: Kind<S, A>) => Kind<S, D.RecordD<A>>
  readonly nullable: <A extends D.AnyD>(or: Kind<S, A>) => Kind<S, D.NullableD<A>>
  readonly intersect: <B extends D.Decoder<any, DE.DecodeError<any>, any>>(
    b: Kind<S, B>
  ) => <A extends D.Decoder<any, DE.DecodeError<any>, any>>(a: Kind<S, A>) => Kind<S, D.IntersectD<A, B>>
  readonly lazy: <I, E, A>(id: string, f: () => Kind<S, D.Decoder<I, E, A>>) => Kind<S, D.LazyD<I, E, A>>
  readonly sum: <T extends string>(
    tag: T
  ) => <A extends Record<string, D.AnyUD>>(members: { [K in keyof A]: Kind<S, A[K]> }) => Kind<S, D.SumD<T, A>>
}

export interface WithMap1<S extends URIS> {
  readonly map: <A extends D.AnyD, B>(f: (a: D.TypeOf<A>) => B) => (sa: Kind<S, A>) => Kind<S, D.MapD<A, B>>
}

export interface WithMapLeft1<S extends URIS> {
  readonly mapLeft: <A extends D.AnyD, E>(f: (e: D.ErrorOf<A>) => E) => (sa: Kind<S, A>) => Kind<S, D.MapLeftD<A, E>>
}

export interface WithId1<S extends URIS> {
  readonly id: <A>() => Kind<S, D.IdentityD<A>>
}

export interface WithCompose1<S extends URIS> {
  readonly compose: <A extends D.AnyD, N extends Kind<S, D.Decoder<D.TypeOf<A>, any, string>>>(
    next: N
  ) => (sa: Kind<S, A>) => Kind<S, D.CompositionD<A, N>>
}

export interface WithUnion1<S extends URIS> {
  readonly union: <A extends ReadonlyArray<D.AnyD>>(
    ...members: { [K in keyof A]: Kind<S, A[K]> }
  ) => Kind<S, D.UnionD<A>>
}

export interface Schema<A> {
  <S>(S: Schemable<S>): HKT<S, A>
}

export function make<A>(schema: Schema<A>): Schema<A> {
  return D.memoize(schema)
}

export function compile<S extends URIS>(S: Schemable1<S>): <A>(schema: Schema<A>) => Kind<S, A>
export function compile<S>(S: Schemable<S>): <A>(schema: Schema<A>) => HKT<S, A> {
  return (schema) => schema(S)
}

const URI = 'io-ts/toDecoder'

type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly [URI]: A
  }
}

export const toDecoder: Schemable1<URI> &
  WithMap1<URI> &
  WithMapLeft1<URI> &
  WithId1<URI> &
  WithCompose1<URI> &
  WithUnion1<URI> = {
  URI: 'io-ts/toDecoder',
  literal: D.literal,
  string: D.string,
  number: D.number,
  boolean: D.boolean,
  UnknownArray: D.UnknownArray,
  UnknownRecord: D.UnknownRecord,
  tuple: D.tuple,
  struct: D.struct,
  partial: D.partial,
  array: D.array,
  record: D.record,
  nullable: D.nullable,
  intersect: D.intersect,
  lazy: D.lazy,
  sum: D.sum,

  map: D.map,
  mapLeft: D.mapLeft,
  id: D.id,
  compose: D.compose,
  union: D.union
}

// -------------------------------------------------------------------------------------
// example
// -------------------------------------------------------------------------------------

import * as assert from 'assert'
import { toEq } from './Eq2'
import { toGuard } from './Guard2'

const schema = make((S) => S.tuple(S.nullable(S.string)))

export const decoder = compile(toDecoder)(schema)
assert.deepStrictEqual(decoder.decode([null]), D.success([null]))
assert.deepStrictEqual(decoder.decode(['a']), D.success(['a']))

export const guard = compile(toGuard)(schema)
assert.deepStrictEqual(guard.is([null]), true)
assert.deepStrictEqual(guard.is(['a']), true)
assert.deepStrictEqual(guard.is([1]), false)

export const eq = compile(toEq)(schema)
assert.deepStrictEqual(eq.equals([null], [null]), true)
assert.deepStrictEqual(eq.equals(['a'], ['a']), true)
assert.deepStrictEqual(eq.equals(['a'], ['b']), false)
