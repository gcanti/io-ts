---
title: Decoder.ts
nav_order: 3
parent: Modules
---

## Decoder overview

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
  - [URI](#uri)
  - [URI (type alias)](#uri-type-alias)
  - [altDecoder](#altdecoder)
  - [functorDecoder](#functordecoder)
  - [schemableDecoder](#schemabledecoder)
- [model](#model)
  - [Decoder (interface)](#decoder-interface)
- [primitives](#primitives)
  - [UnknownArray](#unknownarray)
  - [UnknownRecord](#unknownrecord)
  - [boolean](#boolean)
  - [number](#number)
  - [string](#string)
- [utils](#utils)
  - [draw](#draw)

---

# Alt

## alt

**Signature**

```ts
export declare const alt: <A>(that: () => Decoder<A>) => (me: Decoder<A>) => Decoder<A>
```

Added in v2.2.7

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
export declare const map: <A, B>(f: (a: A) => B) => (fa: Decoder<A>) => Decoder<B>
```

Added in v2.2.7

# combinators

## array

**Signature**

```ts
export declare const array: <A>(items: Decoder<A>) => Decoder<A[]>
```

Added in v2.2.7

## intersect

**Signature**

```ts
export declare const intersect: <B>(right: Decoder<B>) => <A>(left: Decoder<A>) => Decoder<A & B>
```

Added in v2.2.7

## lazy

**Signature**

```ts
export declare const lazy: <A>(id: string, f: () => Decoder<A>) => Decoder<A>
```

Added in v2.2.7

## mapLeftWithInput

**Signature**

```ts
export declare const mapLeftWithInput: (
  f: (actual: unknown, e: FS.FreeSemigroup<DE.DecodeError<string>>) => FS.FreeSemigroup<DE.DecodeError<string>>
) => <A>(decoder: Decoder<A>) => Decoder<A>
```

Added in v2.2.7

## nullable

**Signature**

```ts
export declare const nullable: <A>(or: Decoder<A>) => Decoder<A>
```

Added in v2.2.7

## parse

**Signature**

```ts
export declare const parse: <A, B>(
  parser: (a: A) => E.Either<FS.FreeSemigroup<DE.DecodeError<string>>, B>
) => (from: Decoder<A>) => Decoder<B>
```

Added in v2.2.7

## partial

**Signature**

```ts
export declare const partial: <A>(
  properties: { [K in keyof A]: Decoder<A[K]> }
) => Decoder<Partial<{ [K in keyof A]: A[K] }>>
```

Added in v2.2.7

## record

**Signature**

```ts
export declare const record: <A>(codomain: Decoder<A>) => Decoder<Record<string, A>>
```

Added in v2.2.7

## refine

**Signature**

```ts
export declare const refine: <A, B extends A>(
  refinement: (a: A) => a is B,
  id: string
) => (from: Decoder<A>) => Decoder<B>
```

Added in v2.2.7

## sum

**Signature**

```ts
export declare const sum: <T extends string>(
  tag: T
) => <A>(members: { [K in keyof A]: Decoder<A[K]> }) => Decoder<A[keyof A]>
```

Added in v2.2.7

## tuple

**Signature**

```ts
export declare const tuple: <A extends readonly unknown[]>(
  ...components: { [K in keyof A]: Decoder<A[K]> }
) => Decoder<A>
```

Added in v2.2.7

## type

**Signature**

```ts
export declare const type: <A>(properties: { [K in keyof A]: Decoder<A[K]> }) => Decoder<{ [K in keyof A]: A[K] }>
```

Added in v2.2.7

## union

**Signature**

```ts
export declare const union: <A extends readonly [unknown, ...unknown[]]>(
  ...members: { [K in keyof A]: Decoder<A[K]> }
) => Decoder<A[number]>
```

Added in v2.2.7

# constructors

## fromGuard

**Signature**

```ts
export declare const fromGuard: <A>(guard: G.Guard<A>, expected: string) => Decoder<A>
```

Added in v2.2.7

## literal

**Signature**

```ts
export declare const literal: <A extends readonly [Literal, ...Literal[]]>(...values: A) => Decoder<A[number]>
```

Added in v2.2.7

# instances

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

## altDecoder

**Signature**

```ts
export declare const altDecoder: Alt1<'io-ts/Decoder'>
```

Added in v2.2.7

## functorDecoder

**Signature**

```ts
export declare const functorDecoder: Functor1<'io-ts/Decoder'>
```

Added in v2.2.7

## schemableDecoder

**Signature**

```ts
export declare const schemableDecoder: Schemable1<'io-ts/Decoder'> &
  WithUnknownContainers1<'io-ts/Decoder'> &
  WithUnion1<'io-ts/Decoder'> &
  WithRefine1<'io-ts/Decoder'>
```

Added in v2.2.7

# model

## Decoder (interface)

**Signature**

```ts
export interface Decoder<A> {
  readonly decode: (u: unknown) => E.Either<DecodeError, A>
}
```

Added in v2.2.7

# primitives

## UnknownArray

**Signature**

```ts
export declare const UnknownArray: Decoder<unknown[]>
```

Added in v2.2.7

## UnknownRecord

**Signature**

```ts
export declare const UnknownRecord: Decoder<Record<string, unknown>>
```

Added in v2.2.7

## boolean

**Signature**

```ts
export declare const boolean: Decoder<boolean>
```

Added in v2.2.7

## number

**Signature**

```ts
export declare const number: Decoder<number>
```

Added in v2.2.7

## string

**Signature**

```ts
export declare const string: Decoder<string>
```

Added in v2.2.7

# utils

## draw

**Signature**

```ts
export declare const draw: (e: FS.FreeSemigroup<DE.DecodeError<string>>) => string
```

Added in v2.2.7
