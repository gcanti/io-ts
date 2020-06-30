---
title: UnknownDecoder.ts
nav_order: 18
parent: Modules
---

## UnknownDecoder overview

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
  - [fromGuard](#fromguard)
  - [literal](#literal)
- [instances](#instances)
  - [Alt](#alt-1)
  - [Functor](#functor-1)
  - [Schemable](#schemable)
  - [URI](#uri)
  - [URI (type alias)](#uri-type-alias)
- [model](#model)
  - [UnknownDecoder (interface)](#unknowndecoder-interface)
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
export declare const alt: <A>(that: () => UnknownDecoder<A>) => (me: UnknownDecoder<A>) => UnknownDecoder<A>
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
export declare const map: <A, B>(f: (a: A) => B) => (fa: UnknownDecoder<A>) => UnknownDecoder<B>
```

Added in v2.2.7

# combinators

## array

**Signature**

```ts
export declare const array: <A>(items: UnknownDecoder<A>) => UnknownDecoder<A[]>
```

Added in v2.2.7

## compose

**Signature**

```ts
export declare const compose: <A, B>(to: D.Decoder<A, B>) => (from: UnknownDecoder<A>) => UnknownDecoder<B>
```

Added in v2.2.7

## intersect

**Signature**

```ts
export declare const intersect: <B>(right: UnknownDecoder<B>) => <A>(left: UnknownDecoder<A>) => UnknownDecoder<A & B>
```

Added in v2.2.7

## lazy

**Signature**

```ts
export declare const lazy: <A>(id: string, f: () => UnknownDecoder<A>) => UnknownDecoder<A>
```

Added in v2.2.7

## mapLeftWithInput

**Signature**

```ts
export declare const mapLeftWithInput: (
  f: (input: unknown, e: FS.FreeSemigroup<DE.DecodeError<string>>) => FS.FreeSemigroup<DE.DecodeError<string>>
) => <A>(decoder: UnknownDecoder<A>) => UnknownDecoder<A>
```

Added in v2.2.7

## nullable

**Signature**

```ts
export declare const nullable: <A>(or: UnknownDecoder<A>) => UnknownDecoder<A>
```

Added in v2.2.7

## parse

**Signature**

```ts
export declare const parse: <A, B>(
  parser: (a: A) => E.Either<FS.FreeSemigroup<DE.DecodeError<string>>, B>
) => (from: UnknownDecoder<A>) => UnknownDecoder<B>
```

Added in v2.2.7

## partial

**Signature**

```ts
export declare const partial: <A>(
  properties: { [K in keyof A]: UnknownDecoder<A[K]> }
) => UnknownDecoder<Partial<{ [K in keyof A]: A[K] }>>
```

Added in v2.2.7

## record

**Signature**

```ts
export declare const record: <A>(codomain: UnknownDecoder<A>) => UnknownDecoder<Record<string, A>>
```

Added in v2.2.7

## refine

**Signature**

```ts
export declare const refine: <A, B extends A>(
  refinement: (a: A) => a is B,
  id: string
) => (from: UnknownDecoder<A>) => UnknownDecoder<B>
```

Added in v2.2.7

## sum

**Signature**

```ts
export declare const sum: <T extends string>(
  tag: T
) => <A>(members: { [K in keyof A]: UnknownDecoder<A[K]> }) => UnknownDecoder<A[keyof A]>
```

Added in v2.2.7

## tuple

**Signature**

```ts
export declare const tuple: <A extends readonly unknown[]>(
  ...components: { [K in keyof A]: UnknownDecoder<A[K]> }
) => UnknownDecoder<A>
```

Added in v2.2.7

## type

**Signature**

```ts
export declare const type: <A>(
  properties: { [K in keyof A]: UnknownDecoder<A[K]> }
) => UnknownDecoder<{ [K in keyof A]: A[K] }>
```

Added in v2.2.7

## union

**Signature**

```ts
export declare const union: <A extends readonly [unknown, ...unknown[]]>(
  ...members: { [K in keyof A]: UnknownDecoder<A[K]> }
) => UnknownDecoder<A[number]>
```

Added in v2.2.7

# constructors

## fromGuard

**Signature**

```ts
export declare const fromGuard: <A>(guard: G.Guard<A>, expected: string) => UnknownDecoder<A>
```

Added in v2.2.7

## literal

**Signature**

```ts
export declare const literal: <A extends readonly [Literal, ...Literal[]]>(...values: A) => UnknownDecoder<A[number]>
```

Added in v2.2.7

# instances

## Alt

**Signature**

```ts
export declare const Alt: Alt1<'io-ts/UnknownDecoder'>
```

Added in v2.2.7

## Functor

**Signature**

```ts
export declare const Functor: Functor1<'io-ts/UnknownDecoder'>
```

Added in v2.2.7

## Schemable

**Signature**

```ts
export declare const Schemable: Schemable1<'io-ts/UnknownDecoder'> &
  WithUnknownContainers1<'io-ts/UnknownDecoder'> &
  WithUnion1<'io-ts/UnknownDecoder'> &
  WithRefine1<'io-ts/UnknownDecoder'>
```

Added in v2.2.7

## URI

**Signature**

```ts
export declare const URI: 'io-ts/UnknownDecoder'
```

Added in v2.2.7

## URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

Added in v2.2.7

# model

## UnknownDecoder (interface)

**Signature**

```ts
export interface UnknownDecoder<A> extends D.Decoder<unknown, A> {}
```

Added in v2.2.7

# primitives

## UnknownArray

**Signature**

```ts
export declare const UnknownArray: UnknownDecoder<unknown[]>
```

Added in v2.2.7

## UnknownRecord

**Signature**

```ts
export declare const UnknownRecord: UnknownDecoder<Record<string, unknown>>
```

Added in v2.2.7

## boolean

**Signature**

```ts
export declare const boolean: UnknownDecoder<boolean>
```

Added in v2.2.7

## number

**Signature**

```ts
export declare const number: UnknownDecoder<number>
```

Added in v2.2.7

## string

**Signature**

```ts
export declare const string: UnknownDecoder<string>
```

Added in v2.2.7

# utils

## TypeOf (type alias)

**Signature**

```ts
export type TypeOf<D> = D.TypeOf<D>
```

Added in v2.2.7

## draw

**Signature**

```ts
export declare const draw: (e: FS.FreeSemigroup<DE.DecodeError<string>>) => string
```

Added in v2.2.7
