---
title: Decoder2.ts
nav_order: 5
parent: Modules
---

## Decoder2 overview

**This module is experimental**

Experimental features are published in order to get early feedback from the community, see these tracking
[issues](https://github.com/gcanti/io-ts/issues?q=label%3Av2.2+) for further discussions and enhancements.

A feature tagged as _Experimental_ is in a high state of flux, you're at risk of it changing without notice.

Added in v2.2.7

---

<h2 class="text-delta">Table of contents</h2>

- [DecodeError](#decodeerror)
  - [failure](#failure)
  - [success](#success)
  - [warning](#warning)
- [combinators](#combinators)
  - [array](#array)
  - [fromArray](#fromarray)
  - [fromPartial](#frompartial)
  - [fromRecord](#fromrecord)
  - [fromStruct](#fromstruct)
  - [fromSum](#fromsum)
  - [fromTuple](#fromtuple)
  - [intersect](#intersect)
  - [lazy](#lazy)
  - [missingIndexes](#missingindexes)
  - [missingKeys](#missingkeys)
  - [nullable](#nullable)
  - [partial](#partial)
  - [record](#record)
  - [struct](#struct)
  - [sum](#sum)
  - [tuple](#tuple)
  - [unexpectedIndexes](#unexpectedindexes)
  - [unexpectedKeys](#unexpectedkeys)
  - [union](#union)
- [constructors](#constructors)
  - [literal](#literal)
- [instance operations](#instance-operations)
  - [compose](#compose)
  - [id](#id)
  - [map](#map)
  - [mapLeft](#mapleft)
- [instances](#instances)
  - [Bifunctor](#bifunctor)
  - [Functor](#functor)
  - [URI](#uri)
  - [URI (type alias)](#uri-type-alias)
  - [getSchemable](#getschemable)
  - [getWithUnion](#getwithunion)
  - [getWithUnknownContainers](#getwithunknowncontainers)
- [meta](#meta)
  - [ArrayD (interface)](#arrayd-interface)
  - [CompositionD (interface)](#compositiond-interface)
  - [FromArrayD (interface)](#fromarrayd-interface)
  - [FromPartialD (interface)](#frompartiald-interface)
  - [FromRecordD (interface)](#fromrecordd-interface)
  - [FromStructD (interface)](#fromstructd-interface)
  - [FromSumD (interface)](#fromsumd-interface)
  - [FromTupleD (interface)](#fromtupled-interface)
  - [IdentityD (interface)](#identityd-interface)
  - [IntersectD (interface)](#intersectd-interface)
  - [LazyD (interface)](#lazyd-interface)
  - [LiteralD (interface)](#literald-interface)
  - [MapD (interface)](#mapd-interface)
  - [MapLeftD (interface)](#mapleftd-interface)
  - [MissingIndexesD (interface)](#missingindexesd-interface)
  - [MissingKeysD (interface)](#missingkeysd-interface)
  - [NullableD (interface)](#nullabled-interface)
  - [PartialD (interface)](#partiald-interface)
  - [RecordD (interface)](#recordd-interface)
  - [StructD (interface)](#structd-interface)
  - [SumD (interface)](#sumd-interface)
  - [TupleD (interface)](#tupled-interface)
  - [UnexpectedIndexesD (interface)](#unexpectedindexesd-interface)
  - [UnexpectedKeysD (interface)](#unexpectedkeysd-interface)
  - [UnionD (interface)](#uniond-interface)
  - [UnknownArrayUD (interface)](#unknownarrayud-interface)
  - [UnknownRecordUD (interface)](#unknownrecordud-interface)
  - [booleanUD (interface)](#booleanud-interface)
  - [numberUD (interface)](#numberud-interface)
  - [stringUD (interface)](#stringud-interface)
- [model](#model)
  - [Decoder (interface)](#decoder-interface)
- [primitives](#primitives)
  - [UnknownArray](#unknownarray)
  - [UnknownRecord](#unknownrecord)
  - [boolean](#boolean)
  - [number](#number)
  - [string](#string)
- [utils](#utils)
  - [AnyD (interface)](#anyd-interface)
  - [AnyUD (interface)](#anyud-interface)
  - [CompositionE (interface)](#compositione-interface)
  - [ErrorOf (type alias)](#errorof-type-alias)
  - [FromArrayE (interface)](#fromarraye-interface)
  - [FromPartialE (interface)](#frompartiale-interface)
  - [FromRecordE (interface)](#fromrecorde-interface)
  - [FromStructE (interface)](#fromstructe-interface)
  - [FromSumE (interface)](#fromsume-interface)
  - [FromTupleE (interface)](#fromtuplee-interface)
  - [InputOf (type alias)](#inputof-type-alias)
  - [IntersectE (interface)](#intersecte-interface)
  - [TypeOf (type alias)](#typeof-type-alias)
  - [UnionE (interface)](#unione-interface)
  - [UnionToIntersection (type alias)](#uniontointersection-type-alias)
  - [memoize](#memoize)
  - [message](#message)

---

# DecodeError

## failure

**Signature**

```ts
export declare const failure: typeof TH.left
```

Added in v2.2.17

## success

**Signature**

```ts
export declare const success: typeof TH.right
```

Added in v2.2.7

## warning

**Signature**

```ts
export declare const warning: typeof TH.both
```

Added in v2.2.17

# combinators

## array

**Signature**

```ts
export declare function array<Item extends AnyUD>(item: Item): ArrayD<Item>
```

Added in v2.2.7

## fromArray

**Signature**

```ts
export declare function fromArray<Item extends AnyD>(item: Item): FromArrayD<Item>
```

Added in v2.2.8

## fromPartial

**Signature**

```ts
export declare const fromPartial: <Properties extends Record<string, AnyD>>(
  properties: Properties
) => FromPartialD<Properties>
```

Added in v2.2.8

## fromRecord

**Signature**

```ts
export declare function fromRecord<Codomain extends AnyD>(codomain: Codomain): FromRecordD<Codomain>
```

Added in v2.2.8

## fromStruct

**Signature**

```ts
export declare const fromStruct: <Properties extends Record<string, AnyD>>(
  properties: Properties
) => FromStructD<Properties>
```

Added in v2.2.15

## fromSum

**Signature**

```ts
export declare function fromSum<T extends string>(
  tag: T
): <Members extends Record<string, AnyD>>(members: Members) => FromSumD<T, Members>
```

Added in v2.2.8

## fromTuple

**Signature**

```ts
export declare const fromTuple: <Components extends readonly AnyD[]>(
  ...components: Components
) => FromTupleD<Components>
```

Added in v2.2.8

## intersect

**Signature**

```ts
export declare function intersect<S extends Decoder<any, DE.DecodeError<any>, any>>(
  second: S
): <F extends Decoder<any, DE.DecodeError<any>, any>>(first: F) => IntersectD<F, S>
```

Added in v2.2.7

## lazy

**Signature**

```ts
export declare const lazy: <I, E, A>(id: string, f: Lazy<Decoder<I, E, A>>) => LazyD<I, E, A>
```

Added in v2.2.7

## missingIndexes

**Signature**

```ts
export declare const missingIndexes: <Components extends readonly unknown[]>(
  ...components: Components
) => MissingIndexesD<Components>
```

Added in v2.2.17

## missingKeys

**Signature**

```ts
export declare const missingKeys: <Properties extends Record<string, unknown>>(
  properties: Properties
) => MissingKeysD<Properties>
```

Added in v2.2.17

## nullable

**Signature**

```ts
export declare function nullable<D extends AnyD>(or: D): NullableD<D>
```

Added in v2.2.7

## partial

**Signature**

```ts
export declare function partial<Properties extends Record<string, AnyUD>>(properties: Properties): PartialD<Properties>
```

Added in v2.2.7

## record

**Signature**

```ts
export declare function record<Codomain extends AnyUD>(codomain: Codomain): RecordD<Codomain>
```

Added in v2.2.7

## struct

**Signature**

```ts
export declare function struct<Properties extends Record<string, AnyUD>>(properties: Properties): StructD<Properties>
```

Added in v2.2.15

## sum

**Signature**

```ts
export declare function sum<T extends string>(
  tag: T
): <Members extends Record<string, AnyUD>>(members: Members) => SumD<T, Members>
```

Added in v2.2.7

## tuple

**Signature**

```ts
export declare function tuple<Components extends ReadonlyArray<AnyUD>>(...cs: Components): TupleD<Components>
```

Added in v2.2.7

## unexpectedIndexes

**Signature**

```ts
export declare const unexpectedIndexes: <Components extends readonly unknown[]>(
  ...components: Components
) => UnexpectedIndexesD<Components>
```

Added in v2.2.17

## unexpectedKeys

**Signature**

```ts
export declare const unexpectedKeys: <Properties extends Record<string, unknown>>(
  properties: Properties
) => UnexpectedKeysD<Properties>
```

Added in v2.2.17

## union

**Signature**

```ts
export declare function union<Members extends ReadonlyNonEmptyArray<AnyD>>(...members: Members): UnionD<Members>
```

Added in v2.2.7

# constructors

## literal

**Signature**

```ts
export declare const literal: <A extends RNEA.ReadonlyNonEmptyArray<DE.Literal>>(...literals: A) => LiteralD<A>
```

Added in v2.2.7

# instance operations

## compose

**Signature**

```ts
export declare function compose<P extends AnyD, N extends Decoder<TypeOf<P>, any, any>>(
  next: N
): (prev: P) => CompositionD<P, N>
```

Added in v2.2.8

## id

**Signature**

```ts
export declare const id: <A = never>() => IdentityD<A>
```

Added in v2.2.8

## map

**Signature**

```ts
export declare function map<D extends AnyD, B>(f: (a: TypeOf<D>) => B): (decoder: D) => MapD<D, B>
```

Added in v2.2.7

## mapLeft

**Signature**

```ts
export declare function mapLeft<D extends AnyD, E>(f: (e: ErrorOf<D>) => E): (decoder: D) => MapLeftD<D, E>
```

Added in v2.2.17

# instances

## Bifunctor

**Signature**

```ts
export declare const Bifunctor: Bifunctor3<'io-ts/Decoder2'>
```

Added in v2.2.17

## Functor

**Signature**

```ts
export declare const Functor: Functor3<'io-ts/Decoder2'>
```

Added in v2.2.8

## URI

**Signature**

```ts
export declare const URI: 'io-ts/Decoder2'
```

Added in v2.2.7

## URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

Added in v2.2.7

## getSchemable

**Signature**

```ts
export declare const getSchemable: <E = never>() => Schemable2C<
  'io-ts/ToDecoder',
  DE.DecodeError<
    | DE.MessageE
    | E
    | DE.StringE
    | DE.NumberE
    | DE.BooleanE
    | DE.UnknownRecordE
    | DE.UnknownArrayE
    | DE.LiteralE<DE.Literal>
    | DE.NaNE
    | DE.InfinityE
    | DE.TagE
  >
>
```

Added in v2.2.17

## getWithUnion

**Signature**

```ts
export declare const getWithUnion: <E = never>() => WithUnion2C<
  'io-ts/ToDecoder',
  DE.DecodeError<
    | DE.MessageE
    | DE.StringE
    | DE.NumberE
    | DE.BooleanE
    | DE.UnknownRecordE
    | DE.UnknownArrayE
    | DE.LiteralE<DE.Literal>
    | DE.NaNE
    | DE.InfinityE
    | DE.TagE
    | E
  >
>
```

Added in v2.2.17

## getWithUnknownContainers

**Signature**

```ts
export declare const getWithUnknownContainers: <E = never>() => WithUnknownContainers2C<
  'io-ts/ToDecoder',
  DE.DecodeError<
    | DE.MessageE
    | DE.StringE
    | DE.NumberE
    | DE.BooleanE
    | DE.UnknownRecordE
    | DE.UnknownArrayE
    | DE.LiteralE<DE.Literal>
    | DE.NaNE
    | DE.InfinityE
    | DE.TagE
    | E
  >
>
```

Added in v2.2.17

# meta

## ArrayD (interface)

**Signature**

```ts
export interface ArrayD<Item> extends CompositionD<UnknownArrayUD, FromArrayD<Item>> {}
```

Added in v2.2.17

## CompositionD (interface)

**Signature**

```ts
export interface CompositionD<P, N> extends Decoder<InputOf<P>, CompositionE<P, N>, TypeOf<N>> {
  readonly _tag: 'CompositionD'
  readonly prev: P
  readonly next: N
}
```

Added in v2.2.17

## FromArrayD (interface)

**Signature**

```ts
export interface FromArrayD<Item> extends Decoder<Array<InputOf<Item>>, FromArrayE<Item>, Array<TypeOf<Item>>> {
  readonly _tag: 'FromArrayD'
  readonly item: Item
}
```

Added in v2.2.17

## FromPartialD (interface)

**Signature**

```ts
export interface FromPartialD<Properties>
  extends Decoder<
    Partial<{ [K in keyof Properties]: InputOf<Properties[K]> }>,
    FromPartialE<Properties>,
    Partial<{ [K in keyof Properties]: TypeOf<Properties[K]> }>
  > {
  readonly _tag: 'FromPartialD'
  readonly properties: Properties
}
```

Added in v2.2.17

## FromRecordD (interface)

**Signature**

```ts
export interface FromRecordD<Codomain>
  extends Decoder<Record<string, InputOf<Codomain>>, FromRecordE<Codomain>, Record<string, TypeOf<Codomain>>> {
  readonly _tag: 'FromRecordD'
  readonly codomain: Codomain
}
```

Added in v2.2.17

## FromStructD (interface)

**Signature**

```ts
export interface FromStructD<Properties>
  extends Decoder<
    { [K in keyof Properties]: InputOf<Properties[K]> },
    FromStructE<Properties>,
    { [K in keyof Properties]: TypeOf<Properties[K]> }
  > {
  readonly _tag: 'FromStructD'
  readonly properties: Properties
}
```

Added in v2.2.17

## FromSumD (interface)

**Signature**

```ts
export interface FromSumD<T extends string, Members>
  extends Decoder<InputOf<Members[keyof Members]>, DE.TagLE | FromSumE<Members>, TypeOf<Members[keyof Members]>> {
  readonly _tag: 'FromSumD'
  readonly tag: T
  readonly members: Members
}
```

Added in v2.2.17

## FromTupleD (interface)

**Signature**

```ts
export interface FromTupleD<Components extends ReadonlyArray<unknown>>
  extends Decoder<
    { readonly [K in keyof Components]: InputOf<Components[K]> },
    FromTupleE<Components>,
    { [K in keyof Components]: TypeOf<Components[K]> }
  > {
  readonly _tag: 'FromTupleD'
  readonly components: Components
}
```

Added in v2.2.17

## IdentityD (interface)

**Signature**

```ts
export interface IdentityD<A> extends Decoder<A, never, A> {
  readonly _tag: 'IdentityD'
}
```

Added in v2.2.17

## IntersectD (interface)

**Signature**

```ts
export interface IntersectD<F, S> extends Decoder<InputOf<F> & InputOf<S>, IntersectE<F, S>, TypeOf<F> & TypeOf<S>> {
  readonly _tag: 'IntersectD'
  readonly first: F
  readonly second: S
}
```

Added in v2.2.17

## LazyD (interface)

**Signature**

```ts
export interface LazyD<I, E, A> extends Decoder<I, DE.LazyE<E>, A> {
  readonly _tag: 'LazyD'
  readonly id: string
  readonly f: Lazy<Decoder<I, E, A>>
}
```

Added in v2.2.17

## LiteralD (interface)

**Signature**

```ts
export interface LiteralD<A extends ReadonlyNonEmptyArray<DE.Literal>>
  extends Decoder<unknown, DE.LiteralLE<A[number]>, A[number]> {
  readonly _tag: 'LiteralD'
  readonly literals: A
}
```

Added in v2.2.17

## MapD (interface)

**Signature**

```ts
export interface MapD<D, B> extends Decoder<InputOf<D>, ErrorOf<D>, B> {
  readonly _tag: 'MapD'
  readonly decoder: D
  readonly map: (a: TypeOf<D>) => B
}
```

Added in v2.2.17

## MapLeftD (interface)

**Signature**

```ts
export interface MapLeftD<D, E> extends Decoder<InputOf<D>, E, TypeOf<D>> {
  readonly _tag: 'MapLeftD'
  readonly decoder: D
  readonly mapLeft: (de: ErrorOf<D>) => E
}
```

Added in v2.2.17

## MissingIndexesD (interface)

**Signature**

```ts
export interface MissingIndexesD<Components>
  extends Decoder<
    { readonly [K in keyof Components]?: unknown },
    DE.MissingIndexesE,
    { [K in keyof Components]: unknown }
  > {
  readonly _tag: 'MissingIndexesD'
  readonly components: Components
}
```

Added in v2.2.17

## MissingKeysD (interface)

**Signature**

```ts
export interface MissingKeysD<Properties>
  extends Decoder<
    Partial<{ [K in keyof Properties]: unknown }>,
    DE.MissingKeysE,
    { [K in keyof Properties]: unknown }
  > {
  readonly _tag: 'MissingKeysD'
  readonly properties: Properties
}
```

Added in v2.2.17

## NullableD (interface)

**Signature**

```ts
export interface NullableD<D> extends Decoder<null | InputOf<D>, DE.NullableE<ErrorOf<D>>, null | TypeOf<D>> {
  readonly _tag: 'NullableD'
  readonly or: D
}
```

Added in v2.2.17

## PartialD (interface)

**Signature**

```ts
export interface PartialD<Properties>
  extends CompositionD<CompositionD<UnknownRecordUD, UnexpectedKeysD<Properties>>, FromPartialD<Properties>> {}
```

Added in v2.2.17

## RecordD (interface)

**Signature**

```ts
export interface RecordD<Codomain> extends CompositionD<UnknownRecordUD, FromRecordD<Codomain>> {}
```

Added in v2.2.17

## StructD (interface)

**Signature**

```ts
export interface StructD<Properties>
  extends CompositionD<
    CompositionD<CompositionD<UnknownRecordUD, UnexpectedKeysD<Properties>>, MissingKeysD<Properties>>,
    FromStructD<Properties>
  > {}
```

Added in v2.2.17

## SumD (interface)

**Signature**

```ts
export interface SumD<T extends string, Members>
  extends CompositionD<UnionD<[UnknownRecordUD, UnknownArrayUD]>, FromSumD<T, Members>> {}
```

Added in v2.2.17

## TupleD (interface)

**Signature**

```ts
export interface TupleD<Components extends ReadonlyArray<unknown>>
  extends CompositionD<
    CompositionD<CompositionD<UnknownArrayUD, UnexpectedIndexesD<Components>>, MissingIndexesD<Components>>,
    FromTupleD<Components>
  > {}
```

Added in v2.2.17

## UnexpectedIndexesD (interface)

**Signature**

```ts
export interface UnexpectedIndexesD<Components>
  extends Decoder<Array<unknown>, DE.UnexpectedIndexesE, { [K in keyof Components]?: unknown }> {
  readonly _tag: 'UnexpectedIndexesD'
  readonly components: Components
}
```

Added in v2.2.17

## UnexpectedKeysD (interface)

**Signature**

```ts
export interface UnexpectedKeysD<Properties>
  extends Decoder<Record<string, unknown>, DE.UnexpectedKeysE, Partial<{ [K in keyof Properties]: unknown }>> {
  readonly _tag: 'UnexpectedKeysD'
  readonly properties: Properties
}
```

Added in v2.2.17

## UnionD (interface)

**Signature**

```ts
export interface UnionD<Members extends ReadonlyNonEmptyArray<AnyD>>
  extends Decoder<UnionToIntersection<InputOf<Members[number]>>, UnionE<Members>, TypeOf<Members[keyof Members]>> {
  readonly _tag: 'UnionD'
  readonly members: Members
}
```

Added in v2.2.17

## UnknownArrayUD (interface)

**Signature**

```ts
export interface UnknownArrayUD extends Decoder<unknown, DE.UnknownArrayLE, Array<unknown>> {
  readonly _tag: 'UnknownArrayUD'
}
```

Added in v2.2.17

## UnknownRecordUD (interface)

**Signature**

```ts
export interface UnknownRecordUD extends Decoder<unknown, DE.UnknownRecordLE, Record<string, unknown>> {
  readonly _tag: 'UnknownRecordUD'
}
```

Added in v2.2.17

## booleanUD (interface)

**Signature**

```ts
export interface booleanUD extends Decoder<unknown, DE.BooleanLE, boolean> {
  readonly _tag: 'booleanUD'
}
```

Added in v2.2.17

## numberUD (interface)

**Signature**

```ts
export interface numberUD extends Decoder<unknown, DE.NumberLE | DE.NaNLE | DE.InfinityLE, number> {
  readonly _tag: 'numberUD'
}
```

Added in v2.2.17

## stringUD (interface)

**Signature**

```ts
export interface stringUD extends Decoder<unknown, DE.StringLE, string> {
  readonly _tag: 'stringUD'
}
```

Added in v2.2.17

# model

## Decoder (interface)

**Signature**

```ts
export interface Decoder<I, E, A> {
  readonly decode: (i: I) => These<E, A>
}
```

Added in v2.2.17

# primitives

## UnknownArray

**Signature**

```ts
export declare const UnknownArray: UnknownArrayUD
```

Added in v2.2.7

## UnknownRecord

**Signature**

```ts
export declare const UnknownRecord: UnknownRecordUD
```

Added in v2.2.7

## boolean

**Signature**

```ts
export declare const boolean: booleanUD
```

Added in v2.2.7

## number

**Signature**

```ts
export declare const number: numberUD
```

Added in v2.2.7

## string

**Signature**

```ts
export declare const string: stringUD
```

Added in v2.2.7

# utils

## AnyD (interface)

**Signature**

```ts
export interface AnyD extends Decoder<any, any, any> {}
```

Added in v2.2.17

## AnyUD (interface)

**Signature**

```ts
export interface AnyUD extends Decoder<unknown, any, any> {}
```

Added in v2.2.17

## CompositionE (interface)

**Signature**

```ts
export interface CompositionE<P, N> extends DE.CompoundE<DE.PrevE<ErrorOf<P>> | DE.NextE<ErrorOf<N>>> {}
```

Added in v2.2.17

## ErrorOf (type alias)

**Signature**

```ts
export type ErrorOf<D> = D extends Decoder<any, infer E, any> ? E : never
```

Added in v2.2.17

## FromArrayE (interface)

**Signature**

```ts
export interface FromArrayE<Item> extends DE.CompoundE<DE.OptionalIndexE<number, ErrorOf<Item>>> {}
```

Added in v2.2.17

## FromPartialE (interface)

**Signature**

```ts
export interface FromPartialE<Properties>
  extends DE.CompoundE<
    { readonly [K in keyof Properties]: DE.OptionalKeyE<K, ErrorOf<Properties[K]>> }[keyof Properties]
  > {}
```

Added in v2.2.17

## FromRecordE (interface)

**Signature**

```ts
export interface FromRecordE<Codomain> extends DE.CompoundE<DE.OptionalKeyE<string, ErrorOf<Codomain>>> {}
```

Added in v2.2.17

## FromStructE (interface)

**Signature**

```ts
export interface FromStructE<Properties>
  extends DE.CompoundE<
    { readonly [K in keyof Properties]: DE.RequiredKeyE<K, ErrorOf<Properties[K]>> }[keyof Properties]
  > {}
```

Added in v2.2.17

## FromSumE (interface)

**Signature**

```ts
export interface FromSumE<Members>
  extends DE.SumE<{ [K in keyof Members]: DE.MemberE<K, ErrorOf<Members[K]>> }[keyof Members]> {}
```

Added in v2.2.17

## FromTupleE (interface)

**Signature**

```ts
export interface FromTupleE<Components extends ReadonlyArray<unknown>>
  extends DE.CompoundE<{ [K in keyof Components]: DE.RequiredIndexE<K, ErrorOf<Components[K]>> }[number]> {}
```

Added in v2.2.17

## InputOf (type alias)

**Signature**

```ts
export type InputOf<D> = D extends Decoder<infer I, any, any> ? I : never
```

Added in v2.2.8

## IntersectE (interface)

**Signature**

```ts
export interface IntersectE<F, S> extends DE.CompoundE<DE.MemberE<0, ErrorOf<F>> | DE.MemberE<1, ErrorOf<S>>> {}
```

Added in v2.2.17

## TypeOf (type alias)

**Signature**

```ts
export type TypeOf<D> = D extends Decoder<any, any, infer A> ? A : never
```

Added in v2.2.7

## UnionE (interface)

**Signature**

```ts
export interface UnionE<Members extends ReadonlyNonEmptyArray<AnyD>>
  extends DE.CompoundE<{ [K in keyof Members]: DE.MemberE<K, ErrorOf<Members[K]>> }[number]> {}
```

Added in v2.2.17

## UnionToIntersection (type alias)

**Signature**

```ts
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never
```

Added in v2.2.17

## memoize

**Signature**

```ts
export declare function memoize<A, B>(f: (a: A) => B): (a: A) => B
```

Added in v2.2.17

## message

**Signature**

```ts
export declare const message: (message: string) => DE.MessageLE
```

Added in v2.2.17
