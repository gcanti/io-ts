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
  - [components](#components)
  - [intersect](#intersect)
  - [items](#items)
  - [lazy](#lazy)
  - [mapLeftWithInput](#mapleftwithinput)
  - [members](#members)
  - [nullable](#nullable)
  - [parse](#parse)
  - [partial](#partial)
  - [partialProps](#partialprops)
  - [props](#props)
  - [record](#record)
  - [refine](#refine)
  - [sum](#sum)
  - [tuple](#tuple)
  - [type](#type)
  - [union](#union)
  - [values](#values)
  - [variants](#variants)
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
export declare const error: (actual: unknown, message: string) => FS.FreeSemigroup<DE.DecodeError<string>>
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

Added in v2.2.7

# combinators

## array

**Signature**

```ts
export declare const array: <A>(item: Decoder<unknown, A>) => Decoder<unknown, A[]>
```

Added in v2.2.8

## components

**Signature**

```ts
export declare const components: <I, A extends readonly unknown[]>(
  ...list: { [K in keyof A]: Decoder<I, A[K]> }
) => <H>(decoder: Decoder<H, I[]>) => Decoder<H, A>
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

## items

**Signature**

```ts
export declare const items: <I, A>(item: Decoder<I, A>) => <H>(decoder: Decoder<H, I[]>) => Decoder<H, A[]>
```

Added in v2.2.8

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
  f: (input: I, e: FS.FreeSemigroup<DE.DecodeError<string>>) => FS.FreeSemigroup<DE.DecodeError<string>>
) => <A>(decoder: Decoder<I, A>) => Decoder<I, A>
```

Added in v2.2.7

## members

**Signature**

```ts
export declare const members: <I, A extends readonly [unknown, ...unknown[]]>(
  ...list: { [K in keyof A]: Decoder<I, A[K]> }
) => <H>(decoder: Decoder<H, I>) => Decoder<H, A[number]>
```

Added in v2.2.8

## nullable

**Signature**

```ts
export declare const nullable: <I, A>(or: Decoder<I, A>) => Decoder<I, A>
```

Added in v2.2.7

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

Added in v2.2.8

## partialProps

**Signature**

```ts
export declare const partialProps: <I, A>(
  properties: { [K in keyof A]: Decoder<I, A[K]> }
) => <H>(decoder: Decoder<H, Record<string, I>>) => Decoder<H, Partial<{ [K in keyof A]: A[K] }>>
```

Added in v2.2.8

## props

**Signature**

```ts
export declare const props: <I, A>(
  properties: { [K in keyof A]: Decoder<I, A[K]> }
) => <H>(decoder: Decoder<H, Record<string, I>>) => Decoder<H, { [K in keyof A]: A[K] }>
```

Added in v2.2.8

## record

**Signature**

```ts
export declare const record: <A>(codomain: Decoder<unknown, A>) => Decoder<unknown, Record<string, A>>
```

Added in v2.2.8

## refine

**Signature**

```ts
export declare const refine: <A, B extends A>(
  refinement: (a: A) => a is B,
  id: string
) => <I>(from: Decoder<I, A>) => Decoder<I, B>
```

Added in v2.2.7

## sum

**Signature**

```ts
export declare const sum: <T extends string>(
  tag: T
) => <A>(members: { [K in keyof A]: Decoder<unknown, A[K]> }) => Decoder<unknown, A[keyof A]>
```

Added in v2.2.8

## tuple

**Signature**

```ts
export declare const tuple: <A extends readonly unknown[]>(
  ...list: { [K in keyof A]: Decoder<unknown, A[K]> }
) => Decoder<unknown, A>
```

Added in v2.2.8

## type

**Signature**

```ts
export declare const type: <A>(
  properties: { [K in keyof A]: Decoder<unknown, A[K]> }
) => Decoder<unknown, { [K in keyof A]: A[K] }>
```

Added in v2.2.8

## union

**Signature**

```ts
export declare const union: <A extends readonly [unknown, ...unknown[]]>(
  ...list: { [K in keyof A]: Decoder<unknown, A[K]> }
) => Decoder<unknown, A[number]>
```

Added in v2.2.7

## values

**Signature**

```ts
export declare const values: <I, A>(codomain: Decoder<I, A>) => Decoder<Record<string, I>, Record<string, A>>
```

Added in v2.2.7

## variants

**Signature**

```ts
export declare const variants: <T extends string>(
  tag: T
) => <I, A>(
  members: { [K in keyof A]: Decoder<I, A[K]> }
) => <H>(decoder: Decoder<H, Record<string, I>>) => Decoder<H, A[keyof A]>
```

Added in v2.2.8

# constructors

## fromGuard

**Signature**

```ts
export declare const fromGuard: <A>(guard: G.Guard<A>, expected: string) => Decoder<unknown, A>
```

Added in v2.2.7

## fromRefinement

**Signature**

```ts
export declare const fromRefinement: <I, A extends I>(refinement: Refinement<I, A>, expected: string) => Decoder<I, A>
```

Added in v2.2.7

## literal

**Signature**

```ts
export declare const literal: <A extends readonly [S.Literal, ...S.Literal[]]>(
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

Added in v2.2.7

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

Added in v2.2.7

## Schemable

**Signature**

```ts
export declare const Schemable: S.Schemable2C<'io-ts/Decoder', unknown> &
  S.WithUnknownContainers2C<'io-ts/Decoder', unknown> &
  S.WithUnion2C<'io-ts/Decoder', unknown> &
  S.WithRefine2C<'io-ts/Decoder', unknown>
```

Added in v2.2.7

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

# model

## Decoder (interface)

**Signature**

```ts
export interface Decoder<I, A> extends K.Kleisli<E.URI, I, DecodeError, A> {}
```

Added in v2.2.7

# primitives

## UnknownArray

**Signature**

```ts
export declare const UnknownArray: Decoder<unknown, unknown[]>
```

Added in v2.2.8

## UnknownRecord

**Signature**

```ts
export declare const UnknownRecord: Decoder<unknown, Record<string, unknown>>
```

Added in v2.2.8

## boolean

**Signature**

```ts
export declare const boolean: Decoder<unknown, boolean>
```

Added in v2.2.8

## number

**Signature**

```ts
export declare const number: Decoder<unknown, number>
```

Added in v2.2.8

## string

**Signature**

```ts
export declare const string: Decoder<unknown, string>
```

Added in v2.2.8

# utils

## InputOf (type alias)

**Signature**

```ts
export type InputOf<KD> = K.InputOf<E.URI, KD>
```

Added in v2.2.7

## TypeOf (type alias)

**Signature**

```ts
export type TypeOf<KD> = K.TypeOf<E.URI, KD>
```

Added in v2.2.7

## draw

**Signature**

```ts
export declare const draw: (e: FS.FreeSemigroup<DE.DecodeError<string>>) => string
```

Added in v2.2.8
