import { HKT, Kind, URIS } from 'fp-ts/lib/HKT'
import * as D from './poc'
import * as G from './Guard2'
import * as E from './Eq2'
import { Eq, eqStrict } from 'fp-ts/lib/Eq'
import { ReadonlyNonEmptyArray } from 'fp-ts/lib/ReadonlyNonEmptyArray'

// -------------------------------------------------------------------------------------
// use case: Schemable
// -------------------------------------------------------------------------------------

export function memoize<A, B>(f: (a: A) => B): (a: A) => B {
  const cache = new Map()
  return (a) => {
    if (!cache.has(a)) {
      const b = f(a)
      cache.set(a, b)
      return b
    }
    return cache.get(a)
  }
}

export interface Schemable<S> {
  readonly URI: S
  readonly string: HKT<S, D.stringUD>
  readonly number: HKT<S, D.numberUD>
  readonly boolean: HKT<S, D.booleanUD>
  readonly UnknownArray: HKT<S, D.UnknownArrayUD>
  readonly UnknownRecord: HKT<S, D.UnknownRecordUD>
  readonly literal: <A extends ReadonlyNonEmptyArray<D.Literal>>(...values: A) => HKT<S, D.LiteralD<A>>
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
  readonly intersect: <B extends D.Decoder<any, D.DecodeError<any>, any>>(
    b: HKT<S, B>
  ) => <A extends D.Decoder<any, D.DecodeError<any>, any>>(a: HKT<S, A>) => HKT<S, D.IntersectD<A, B>>
  readonly lazy: <I, E, A>(id: string, f: () => HKT<S, D.Decoder<I, E, A>>) => HKT<S, D.LazyD<I, E, A>>
  readonly sum: <T extends string>(
    tag: T
  ) => <A extends Record<string, D.AnyUD>>(members: { [K in keyof A]: HKT<S, A[K]> }) => HKT<S, D.SumD<T, A>>
  readonly fromStruct: <A extends Record<PropertyKey, D.AnyD>>(
    properties: { [K in keyof A]: HKT<S, A[K]> }
  ) => HKT<S, D.FromStructD<A>>
}

export interface WithMap<S> {
  readonly map: <A extends D.AnyD, B>(f: (a: D.TypeOf<A>) => B) => (sa: HKT<S, A>) => HKT<S, D.MapD<A, B>>
}

export interface WithMapLeft<S> {
  readonly mapLeft: <A extends D.AnyD, E>(
    f: (e: D.ErrorOf<A>, i: D.InputOf<A>) => E
  ) => (sa: HKT<S, A>) => HKT<S, D.MapLeftD<A, E>>
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
  readonly string: Kind<S, D.stringUD>
  readonly number: Kind<S, D.numberUD>
  readonly boolean: Kind<S, D.booleanUD>
  readonly UnknownArray: Kind<S, D.UnknownArrayUD>
  readonly UnknownRecord: Kind<S, D.UnknownRecordUD>
  readonly literal: <A extends ReadonlyNonEmptyArray<D.Literal>>(...values: A) => Kind<S, D.LiteralD<A>>
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
  readonly intersect: <B extends D.Decoder<any, D.DecodeError<any>, any>>(
    b: Kind<S, B>
  ) => <A extends D.Decoder<any, D.DecodeError<any>, any>>(a: Kind<S, A>) => Kind<S, D.IntersectD<A, B>>
  readonly lazy: <I, E, A>(id: string, f: () => Kind<S, D.Decoder<I, E, A>>) => Kind<S, D.LazyD<I, E, A>>
  readonly sum: <T extends string>(
    tag: T
  ) => <A extends Record<string, D.AnyUD>>(members: { [K in keyof A]: Kind<S, A[K]> }) => Kind<S, D.SumD<T, A>>
  readonly fromStruct: <A extends Record<PropertyKey, D.AnyD>>(
    properties: { [K in keyof A]: Kind<S, A[K]> }
  ) => Kind<S, D.FromStructD<A>>
}

export interface WithMap1<S extends URIS> {
  readonly map: <A extends D.AnyD, B>(f: (a: D.TypeOf<A>) => B) => (sa: Kind<S, A>) => Kind<S, D.MapD<A, B>>
}

export interface WithMapLeft1<S extends URIS> {
  readonly mapLeft: <A extends D.AnyD, E>(
    f: (e: D.ErrorOf<A>, i: D.InputOf<A>) => E
  ) => (sa: Kind<S, A>) => Kind<S, D.MapLeftD<A, E>>
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
  return memoize(schema)
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

export const toDecoder: Schemable1<URI> & WithMap1<URI> & WithMapLeft1<URI> & WithCompose1<URI> & WithUnion1<URI> = {
  URI: 'io-ts/toDecoder',
  string: D.string,
  number: D.number,
  boolean: D.boolean,
  UnknownArray: D.UnknownArray,
  UnknownRecord: D.UnknownRecord,
  literal: D.literal,
  tuple: D.tuple,
  struct: D.struct,
  partial: D.partial,
  array: D.array,
  record: D.record,
  nullable: D.nullable,
  intersect: D.intersect,
  lazy: D.lazy,
  sum: D.sum,
  fromStruct: D.fromStruct,

  map: D.map,
  mapLeft: D.mapLeft,
  compose: D.compose,
  union: D.union
}

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly 'io-ts/toGuard': G.Guard<D.InputOf<A>, D.InputOf<A> & D.TypeOf<A>>
  }
}

export const toGuard: Schemable1<'io-ts/toGuard'> & WithCompose1<URI> & WithUnion1<'io-ts/toGuard'> = {
  URI: 'io-ts/toGuard',
  string: G.string,
  number: G.number,
  boolean: G.boolean,
  UnknownArray: G.UnknownArray,
  UnknownRecord: G.UnknownRecord,
  literal: G.literal,
  tuple: G.tuple as any,
  struct: G.struct as any,
  partial: G.partial as any,
  array: G.array as any,
  record: G.record as any,
  nullable: G.nullable,
  intersect: G.intersect as any,
  lazy: G.lazy as any,
  sum: G.sum as any,
  fromStruct: G.struct as any,

  union: G.union as any,
  compose: G.compose as any
}

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly 'io-ts/toEq': Eq<D.TypeOf<A>>
  }
}

export const toEq: Schemable1<'io-ts/toEq'> = {
  URI: 'io-ts/toEq',
  string: E.string,
  number: E.number,
  boolean: E.boolean,
  UnknownArray: E.UnknownArray,
  UnknownRecord: E.UnknownRecord,
  literal: () => eqStrict,
  tuple: E.tuple,
  struct: E.struct as any,
  partial: E.partial as any,
  array: E.array,
  record: E.record,
  nullable: E.nullable,
  intersect: E.intersect,
  lazy: E.lazy as any,
  sum: E.sum as any,
  fromStruct: E.struct as any
}

// -------------------------------------------------------------------------------------
// example
// -------------------------------------------------------------------------------------

import * as assert from 'assert'
import { pipe } from 'fp-ts/lib/pipeable'

const schema = make((S) => S.tuple(S.nullable(S.string)))

export const decoder = compile(toDecoder)(schema)
assert.deepStrictEqual(decoder.decode([null]), D.success([null]))
assert.deepStrictEqual(decoder.decode(['a']), D.success(['a']))
assert.deepStrictEqual(
  pipe(decoder.decode([1]), D.draw, D.print),
  `Errors:
1 error(s) found while decoding (tuple)
└─ 1 error(s) found while decoding required component 0
   └─ 1 error(s) found while decoding a nullable
      └─ cannot decode 1, expected a string`
)

export const guard = compile(toGuard)(schema)
assert.deepStrictEqual(guard.is([null]), true)
assert.deepStrictEqual(guard.is(['a']), true)
assert.deepStrictEqual(guard.is([1]), false)

export const eq = compile(toEq)(schema)
assert.deepStrictEqual(eq.equals([null], [null]), true)
assert.deepStrictEqual(eq.equals(['a'], ['a']), true)
assert.deepStrictEqual(eq.equals(['a'], ['b']), false)
