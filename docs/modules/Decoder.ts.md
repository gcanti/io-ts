---
title: Decoder.ts
nav_order: 3
parent: Modules
---

## Decoder overview

**This module is experimental**

Experimental features are published in order to get early feedback from the community, see these tracking
[issues](https://github.com/gcanti/io-ts/issues?q=label%3Av2.2+) for further discussions and enhancements.

A feature tagged as _Experimental_ is in a high state of flux, you're at risk of it changing without notice.

Added in v2.2.7

---

<h2 class="text-delta">Table of contents</h2>

- [Alt](#alt)
  - [alt](#alt)
- [Category](#category)
  - [id](#id)
- [DecodeError](#decodeerror)
  - [DecodeError (type alias)](#decodeerror-type-alias)
  - [error](#error)
  - [failure](#failure)
  - [success](#success)
- [Functor](#functor)
  - [map](#map)
- [Semigroupoid](#semigroupoid)
  - [compose](#compose)
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
  - [mapLeftWithInput](#mapleftwithinput)
  - [nullable](#nullable)
  - [optional](#optional)
  - [parse](#parse)
  - [partial](#partial)
  - [readonly](#readonly)
  - [record](#record)
  - [refine](#refine)
  - [struct](#struct)
  - [sum](#sum)
  - [tuple](#tuple)
  - [union](#union)
  - [withMessage](#withmessage)
  - [~~fromType~~](#fromtype)
  - [~~type~~](#type)
- [constructors](#constructors)
  - [fromGuard](#fromguard)
  - [fromRefinement](#fromrefinement)
  - [literal](#literal)
- [instances](#instances)
  - [Alt](#alt-1)
  - [Category](#category-1)
  - [Functor](#functor-1)
  - [Schemable](#schemable)
  - [URI](#uri)
  - [URI (type alias)](#uri-type-alias)
  - [WithRefine](#withrefine)
  - [WithUnion](#withunion)
  - [WithUnknownContainers](#withunknowncontainers)
- [model](#model)
  - [Decoder (interface)](#decoder-interface)
- [primitives](#primitives)
  - [UnknownArray](#unknownarray)
  - [UnknownRecord](#unknownrecord)
  - [boolean](#boolean)
  - [number](#number)
  - [string](#string)
- [utils](#utils)
  - [InputOf (type alias)](#inputof-type-alias)
  - [TypeOf (type alias)](#typeof-type-alias)
  - [draw](#draw)

---

# Alt

## alt

**Signature**

```ts
export declare const alt: <I, A>(that: () => Decoder<I, A>) => (me: Decoder<I, A>) => Decoder<I, A>
```

Added in v2.2.7

# Category

## id

**Signature**

```ts
export declare const id: <A>() => Decoder<A, A>
```

Added in v2.2.8

# DecodeError

## DecodeError (type alias)

**Signature**

```ts
export type DecodeError = FS.FreeSemigroup<DE.DecodeError<string>>
```

Added in v2.2.7

## error

**Signature**

```ts
export declare const error: (actual: unknown, message: string) => DecodeError
```

Added in v2.2.7

## failure

**Signature**

```ts
export declare const failure: <A = never>(
  actual: unknown,
  message: string
) => E.Either<FS.FreeSemigroup<DE.DecodeError<string>>, A>
```

Added in v2.2.7

## success

**Signature**

```ts
export declare const success: <A>(a: A) => E.Either<FS.FreeSemigroup<DE.DecodeError<string>>, A>
```

Added in v2.2.7

# Functor

## map

**Signature**

```ts
export declare const map: <A, B>(f: (a: A) => B) => <I>(fa: Decoder<I, A>) => Decoder<I, B>
```

Added in v2.2.7

# Semigroupoid

## compose

**Signature**

```ts
export declare const compose: <A, B>(to: Decoder<A, B>) => <I>(from: Decoder<I, A>) => Decoder<I, B>
```

Added in v2.2.8

# combinators

## array

**Signature**

```ts
export declare const array: <A>(item: Decoder<unknown, A>) => Decoder<unknown, A[]>
```

Added in v2.2.7

## fromArray

**Signature**

```ts
export declare const fromArray: <I, A>(item: Decoder<I, A>) => Decoder<I[], A[]>
```

Added in v2.2.8

## fromPartial

**Signature**

```ts
export declare const fromPartial: <P extends Record<string, Decoder<any, any>>>(
  properties: P
) => Decoder<
  Partial<{ [K in keyof P]: K.InputOf<'Either', P[K]> }>,
  Partial<{ [K in keyof P]: K.TypeOf<'Either', P[K]> }>
>
```

Added in v2.2.8

## fromRecord

**Signature**

```ts
export declare const fromRecord: <I, A>(codomain: Decoder<I, A>) => Decoder<Record<string, I>, Record<string, A>>
```

Added in v2.2.8

## fromStruct

**Signature**

```ts
export declare const fromStruct: <P extends Record<string, Decoder<any, any>>>(
  properties: P
) => Decoder<{ [K in keyof P]: K.InputOf<'Either', P[K]> }, { [K in keyof P]: K.TypeOf<'Either', P[K]> }>
```

Added in v2.2.15

## fromSum

**Signature**

```ts
export declare const fromSum: <T extends string>(
  tag: T
) => <MS extends Record<string, Decoder<any, any>>>(
  members: MS
) => Decoder<K.InputOf<'Either', MS[keyof MS]>, K.TypeOf<'Either', MS[keyof MS]>>
```

Added in v2.2.8

## fromTuple

**Signature**

```ts
export declare const fromTuple: <C extends readonly Decoder<any, any>[]>(
  ...components: C
) => Decoder<{ [K in keyof C]: K.InputOf<'Either', C[K]> }, { [K in keyof C]: K.TypeOf<'Either', C[K]> }>
```

Added in v2.2.8

## intersect

**Signature**

```ts
export declare const intersect: <IB, B>(
  right: Decoder<IB, B>
) => <IA, A>(left: Decoder<IA, A>) => Decoder<IA & IB, A & B>
```

Added in v2.2.7

## lazy

**Signature**

```ts
export declare const lazy: <I, A>(id: string, f: () => Decoder<I, A>) => Decoder<I, A>
```

Added in v2.2.7

## mapLeftWithInput

**Signature**

```ts
export declare const mapLeftWithInput: <I>(
  f: (input: I, e: DecodeError) => DecodeError
) => <A>(decoder: Decoder<I, A>) => Decoder<I, A>
```

Added in v2.2.7

## nullable

**Signature**

```ts
export declare const nullable: <I, A>(or: Decoder<I, A>) => Decoder<I, A>
```

Added in v2.2.7

## optional

**Signature**

```ts
export declare const optional: <I, A>(or: Decoder<I, A>) => Decoder<I, A>
```

Added in v2.3.0

## parse

**Signature**

```ts
export declare const parse: <A, B>(
  parser: (a: A) => E.Either<FS.FreeSemigroup<DE.DecodeError<string>>, B>
) => <I>(from: Decoder<I, A>) => Decoder<I, B>
```

Added in v2.2.7

## partial

**Signature**

```ts
export declare const partial: <A>(
  properties: { [K in keyof A]: Decoder<unknown, A[K]> }
) => Decoder<unknown, Partial<{ [K in keyof A]: A[K] }>>
```

Added in v2.2.7

## readonly

**Signature**

```ts
export declare const readonly: <I, A>(decoder: Decoder<I, A>) => Decoder<I, Readonly<A>>
```

Added in v2.2.15

## record

**Signature**

```ts
export declare const record: <A>(codomain: Decoder<unknown, A>) => Decoder<unknown, Record<string, A>>
```

Added in v2.2.7

## refine

**Signature**

```ts
export declare const refine: <A, B extends A>(
  refinement: Refinement<A, B>,
  id: string
) => <I>(from: Decoder<I, A>) => Decoder<I, B>
```

Added in v2.2.7

## struct

**Signature**

```ts
export declare const struct: <A>(
  properties: { [K in keyof A]: Decoder<unknown, A[K]> }
) => Decoder<unknown, { [K in keyof A]: A[K] }>
```

Added in v2.2.15

## sum

**Signature**

```ts
export declare const sum: <T extends string>(
  tag: T
) => <A>(members: { [K in keyof A]: Decoder<unknown, A[K] & Record<T, K>> }) => Decoder<unknown, A[keyof A]>
```

Added in v2.2.7

## tuple

**Signature**

```ts
export declare const tuple: <A extends readonly unknown[]>(
  ...components: { [K in keyof A]: Decoder<unknown, A[K]> }
) => Decoder<unknown, A>
```

Added in v2.2.7

## union

**Signature**

```ts
export declare const union: <MS extends readonly [Decoder<any, any>, ...Decoder<any, any>[]]>(
  ...members: MS
) => Decoder<K.InputOf<'Either', MS[keyof MS]>, K.TypeOf<'Either', MS[keyof MS]>>
```

Added in v2.2.7

## withMessage

**Signature**

```ts
export declare const withMessage: <I>(
  message: (input: I, e: DecodeError) => string
) => <A>(decoder: Decoder<I, A>) => Decoder<I, A>
```

Added in v2.2.9

## ~~fromType~~

Use `fromStruct` instead.

**Signature**

```ts
export declare const fromType: <P extends Record<string, Decoder<any, any>>>(
  properties: P
) => Decoder<{ [K in keyof P]: K.InputOf<'Either', P[K]> }, { [K in keyof P]: K.TypeOf<'Either', P[K]> }>
```

Added in v2.2.8

## ~~type~~

Use `struct` instead.

**Signature**

```ts
export declare const type: <A>(
  properties: { [K in keyof A]: Decoder<unknown, A[K]> }
) => Decoder<unknown, { [K in keyof A]: A[K] }>
```

Added in v2.2.7

# constructors

## fromGuard

**Signature**

```ts
export declare const fromGuard: <I, A extends I>(guard: G.Guard<I, A>, expected: string) => Decoder<I, A>
```

Added in v2.2.8

## fromRefinement

**Signature**

```ts
export declare const fromRefinement: <I, A extends I>(refinement: Refinement<I, A>, expected: string) => Decoder<I, A>
```

Added in v2.2.8

## literal

**Signature**

```ts
export declare const literal: <A extends readonly [L, ...L[]], L extends S.Literal = S.Literal>(
  ...values: A
) => Decoder<unknown, A[number]>
```

Added in v2.2.7

# instances

## Alt

**Signature**

```ts
export declare const Alt: Alt2<'io-ts/Decoder'>
```

Added in v2.2.8

## Category

**Signature**

```ts
export declare const Category: Category2<'io-ts/Decoder'>
```

Added in v2.2.8

## Functor

**Signature**

```ts
export declare const Functor: Functor2<'io-ts/Decoder'>
```

Added in v2.2.8

## Schemable

**Signature**

```ts
export declare const Schemable: S.Schemable2C<'io-ts/Decoder', unknown>
```

Added in v2.2.8

## URI

**Signature**

```ts
export declare const URI: 'io-ts/Decoder'
```

Added in v2.2.7

## URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

Added in v2.2.7

## WithRefine

**Signature**

```ts
export declare const WithRefine: S.WithRefine2C<'io-ts/Decoder', unknown>
```

Added in v2.2.8

## WithUnion

**Signature**

```ts
export declare const WithUnion: S.WithUnion2C<'io-ts/Decoder', unknown>
```

Added in v2.2.8

## WithUnknownContainers

**Signature**

```ts
export declare const WithUnknownContainers: S.WithUnknownContainers2C<'io-ts/Decoder', unknown>
```

Added in v2.2.8

# model

## Decoder (interface)

**Signature**

```ts
export interface Decoder<I, A> extends K.Kleisli<E.URI, I, DecodeError, A> {}
```

Added in v2.2.8

# primitives

## UnknownArray

**Signature**

```ts
export declare const UnknownArray: Decoder<unknown, unknown[]>
```

Added in v2.2.7

## UnknownRecord

**Signature**

```ts
export declare const UnknownRecord: Decoder<unknown, Record<string, unknown>>
```

Added in v2.2.7

## boolean

**Signature**

```ts
export declare const boolean: Decoder<unknown, boolean>
```

Added in v2.2.7

## number

**Signature**

```ts
export declare const number: Decoder<unknown, number>
```

Added in v2.2.7

## string

**Signature**

```ts
export declare const string: Decoder<unknown, string>
```

Added in v2.2.7

# utils

## InputOf (type alias)

**Signature**

```ts
export type InputOf<D> = K.InputOf<E.URI, D>
```

Added in v2.2.8

## TypeOf (type alias)

**Signature**

```ts
export type TypeOf<D> = K.TypeOf<E.URI, D>
```

Added in v2.2.7

## draw

**Signature**

```ts
export declare const draw: (e: DecodeError) => string
```

Added in v2.2.7
