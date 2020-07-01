---
title: UnknownTaskDecoder.ts
nav_order: 19
parent: Modules
---

## UnknownTaskDecoder overview

**This module is experimental**

Experimental features are published in order to get early feedback from the community, see these tracking
[issues](https://github.com/gcanti/io-ts/issues?q=label%3Av2.2+) for further discussions and enhancements.

A feature tagged as _Experimental_ is in a high state of flux, you're at risk of it changing without notice.

Added in v2.2.7

---

<h2 class="text-delta">Table of contents</h2>

- [Alt](#alt)
  - [alt](#alt)
- [DecodeError](#decodeerror)
  - [DecodeError (type alias)](#decodeerror-type-alias)
  - [error](#error)
  - [failure](#failure)
  - [success](#success)
- [Functor](#functor)
  - [map](#map)
- [combinators](#combinators)
  - [array](#array)
  - [compose](#compose)
  - [intersect](#intersect)
  - [lazy](#lazy)
  - [mapLeftWithInput](#mapleftwithinput)
  - [nullable](#nullable)
  - [parse](#parse)
  - [partial](#partial)
  - [record](#record)
  - [refine](#refine)
  - [sum](#sum)
  - [tuple](#tuple)
  - [type](#type)
  - [union](#union)
- [constructors](#constructors)
  - [fromDecoder](#fromdecoder)
  - [fromGuard](#fromguard)
  - [literal](#literal)
- [instances](#instances)
  - [Alt](#alt-1)
  - [Functor](#functor-1)
  - [Schemable](#schemable)
  - [URI](#uri)
  - [URI (type alias)](#uri-type-alias)
- [model](#model)
  - [UnknownTaskDecoder (interface)](#unknowntaskdecoder-interface)
- [primitives](#primitives)
  - [UnknownArray](#unknownarray)
  - [UnknownRecord](#unknownrecord)
  - [boolean](#boolean)
  - [number](#number)
  - [string](#string)
- [utils](#utils)
  - [TypeOf (type alias)](#typeof-type-alias)
  - [draw](#draw)

---

# Alt

## alt

**Signature**

```ts
export declare const alt: <A>(that: () => UnknownTaskDecoder<A>) => (me: UnknownTaskDecoder<A>) => UnknownTaskDecoder<A>
```

Added in v2.2.7

# DecodeError

## DecodeError (type alias)

**Signature**

```ts
export type DecodeError = D.DecodeError
```

Added in v2.2.7

## error

**Signature**

```ts
export declare const error: (actual: unknown, message: string) => FreeSemigroup<DecodeError<string>>
```

Added in v2.2.7

## failure

**Signature**

```ts
export declare const failure: <A = never>(
  actual: unknown,
  message: string
) => TE.TaskEither<FreeSemigroup<DecodeError<string>>, A>
```

Added in v2.2.7

## success

**Signature**

```ts
export declare const success: <A>(a: A) => TE.TaskEither<FreeSemigroup<DecodeError<string>>, A>
```

Added in v2.2.7

# Functor

## map

**Signature**

```ts
export declare const map: <A, B>(f: (a: A) => B) => (fa: UnknownTaskDecoder<A>) => UnknownTaskDecoder<B>
```

Added in v2.2.7

# combinators

## array

**Signature**

```ts
export declare const array: <A>(items: UnknownTaskDecoder<A>) => UnknownTaskDecoder<A[]>
```

Added in v2.2.7

## compose

**Signature**

```ts
export declare const compose: <A, B>(
  to: KTD.TaskDecoder<A, B>
) => (from: UnknownTaskDecoder<A>) => UnknownTaskDecoder<B>
```

Added in v2.2.7

## intersect

**Signature**

```ts
export declare const intersect: <B>(
  right: UnknownTaskDecoder<B>
) => <A>(left: UnknownTaskDecoder<A>) => UnknownTaskDecoder<A & B>
```

Added in v2.2.7

## lazy

**Signature**

```ts
export declare const lazy: <A>(id: string, f: () => UnknownTaskDecoder<A>) => UnknownTaskDecoder<A>
```

Added in v2.2.7

## mapLeftWithInput

**Signature**

```ts
export declare const mapLeftWithInput: (
  f: (input: unknown, e: FreeSemigroup<DecodeError<string>>) => FreeSemigroup<DecodeError<string>>
) => <A>(decoder: UnknownTaskDecoder<A>) => UnknownTaskDecoder<A>
```

Added in v2.2.7

## nullable

**Signature**

```ts
export declare const nullable: <A>(or: UnknownTaskDecoder<A>) => UnknownTaskDecoder<A>
```

Added in v2.2.7

## parse

**Signature**

```ts
export declare const parse: <A, B>(
  parser: (a: A) => TE.TaskEither<FreeSemigroup<DecodeError<string>>, B>
) => (from: UnknownTaskDecoder<A>) => UnknownTaskDecoder<B>
```

Added in v2.2.7

## partial

**Signature**

```ts
export declare const partial: <A>(
  properties: { [K in keyof A]: UnknownTaskDecoder<A[K]> }
) => UnknownTaskDecoder<Partial<{ [K in keyof A]: A[K] }>>
```

Added in v2.2.7

## record

**Signature**

```ts
export declare const record: <A>(codomain: UnknownTaskDecoder<A>) => UnknownTaskDecoder<Record<string, A>>
```

Added in v2.2.7

## refine

**Signature**

```ts
export declare const refine: <A, B extends A>(
  refinement: (a: A) => a is B,
  id: string
) => (from: UnknownTaskDecoder<A>) => UnknownTaskDecoder<B>
```

Added in v2.2.7

## sum

**Signature**

```ts
export declare const sum: <T extends string>(
  tag: T
) => <A>(members: { [K in keyof A]: UnknownTaskDecoder<A[K]> }) => UnknownTaskDecoder<A[keyof A]>
```

Added in v2.2.7

## tuple

**Signature**

```ts
export declare const tuple: <A extends readonly unknown[]>(
  ...components: { [K in keyof A]: UnknownTaskDecoder<A[K]> }
) => UnknownTaskDecoder<A>
```

Added in v2.2.7

## type

**Signature**

```ts
export declare const type: <A>(
  properties: { [K in keyof A]: UnknownTaskDecoder<A[K]> }
) => UnknownTaskDecoder<{ [K in keyof A]: A[K] }>
```

Added in v2.2.7

## union

**Signature**

```ts
export declare const union: <A extends readonly [unknown, ...unknown[]]>(
  ...members: { [K in keyof A]: UnknownTaskDecoder<A[K]> }
) => UnknownTaskDecoder<A[number]>
```

Added in v2.2.7

# constructors

## fromDecoder

**Signature**

```ts
export declare const fromDecoder: <A>(decoder: D.Decoder<unknown, A>) => UnknownTaskDecoder<A>
```

Added in v2.2.7

## fromGuard

**Signature**

```ts
export declare const fromGuard: <A>(guard: G.Guard<A>, expected: string) => UnknownTaskDecoder<A>
```

Added in v2.2.7

## literal

**Signature**

```ts
export declare const literal: <A extends readonly [Literal, ...Literal[]]>(
  ...values: A
) => UnknownTaskDecoder<A[number]>
```

Added in v2.2.7

# instances

## Alt

**Signature**

```ts
export declare const Alt: Alt1<'io-ts/UnknownTaskDecoder'>
```

Added in v2.2.7

## Functor

**Signature**

```ts
export declare const Functor: Functor1<'io-ts/UnknownTaskDecoder'>
```

Added in v2.2.7

## Schemable

**Signature**

```ts
export declare const Schemable: Schemable1<'io-ts/UnknownTaskDecoder'> &
  WithUnknownContainers1<'io-ts/UnknownTaskDecoder'> &
  WithUnion1<'io-ts/UnknownTaskDecoder'> &
  WithRefine1<'io-ts/UnknownTaskDecoder'>
```

Added in v2.2.7

## URI

**Signature**

```ts
export declare const URI: 'io-ts/UnknownTaskDecoder'
```

Added in v2.2.7

## URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

Added in v2.2.7

# model

## UnknownTaskDecoder (interface)

**Signature**

```ts
export interface UnknownTaskDecoder<A> extends KTD.TaskDecoder<unknown, A> {}
```

Added in v2.2.7

# primitives

## UnknownArray

**Signature**

```ts
export declare const UnknownArray: UnknownTaskDecoder<unknown[]>
```

Added in v2.2.7

## UnknownRecord

**Signature**

```ts
export declare const UnknownRecord: UnknownTaskDecoder<Record<string, unknown>>
```

Added in v2.2.7

## boolean

**Signature**

```ts
export declare const boolean: UnknownTaskDecoder<boolean>
```

Added in v2.2.7

## number

**Signature**

```ts
export declare const number: UnknownTaskDecoder<number>
```

Added in v2.2.7

## string

**Signature**

```ts
export declare const string: UnknownTaskDecoder<string>
```

Added in v2.2.7

# utils

## TypeOf (type alias)

**Signature**

```ts
export type TypeOf<TD> = KTD.TypeOf<TD>
```

Added in v2.2.7

## draw

**Signature**

```ts
export declare const draw: (e: FreeSemigroup<DecodeError<string>>) => string
```

Added in v2.2.7
