---
title: JsonCodec.ts
nav_order: 9
parent: Modules
---

## JsonCodec overview

**This module is experimental**

Experimental features are published in order to get early feedback from the community, see these tracking
[issues](https://github.com/gcanti/io-ts/issues?q=label%3Av2.2+) for further discussions and enhancements.

A feature tagged as _Experimental_ is in a high state of flux, you're at risk of it changing without notice.

Added in v2.2.3

---

<h2 class="text-delta">Table of contents</h2>

- [Contravariant](#contravariant)
  - [imap](#imap)
- [combinators](#combinators)
  - [array](#array)
  - [intersect](#intersect)
  - [lazy](#lazy)
  - [mapLeftWithInput](#mapleftwithinput)
  - [nullable](#nullable)
  - [partial](#partial)
  - [record](#record)
  - [refine](#refine)
  - [sum](#sum)
  - [tuple](#tuple)
  - [type](#type)
- [constructors](#constructors)
  - [literal](#literal)
  - [make](#make)
- [instances](#instances)
  - [Invariant](#invariant)
  - [Schemable](#schemable)
  - [URI](#uri)
  - [URI (type alias)](#uri-type-alias)
- [model](#model)
  - [JsonCodec (interface)](#jsoncodec-interface)
- [primitives](#primitives)
  - [boolean](#boolean)
  - [number](#number)
  - [string](#string)
- [utils](#utils)
  - [TypeOf (type alias)](#typeof-type-alias)

---

# Contravariant

## imap

**Signature**

```ts
export declare const imap: <A, B>(f: (a: A) => B, g: (b: B) => A) => (fa: JsonCodec<A>) => JsonCodec<B>
```

Added in v2.2.3

# combinators

## array

**Signature**

```ts
export declare const array: <A>(item: JsonCodec<A>) => JsonCodec<A[]>
```

Added in v2.2.3

## intersect

**Signature**

```ts
export declare const intersect: <B>(right: JsonCodec<B>) => <A>(left: JsonCodec<A>) => JsonCodec<A & B>
```

Added in v2.2.3

## lazy

**Signature**

```ts
export declare const lazy: <A>(id: string, f: () => JsonCodec<A>) => JsonCodec<A>
```

Added in v2.2.3

## mapLeftWithInput

**Signature**

```ts
export declare const mapLeftWithInput: (
  f: (actual: unknown, e: FreeSemigroup<DecodeError<string>>) => FreeSemigroup<DecodeError<string>>
) => <A>(codec: JsonCodec<A>) => JsonCodec<A>
```

Added in v2.2.3

## nullable

**Signature**

```ts
export declare const nullable: <A>(or: JsonCodec<A>) => JsonCodec<A>
```

Added in v2.2.3

## partial

**Signature**

```ts
export declare const partial: <A>(
  properties: { [K in keyof A]: JsonCodec<A[K]> }
) => JsonCodec<Partial<{ [K in keyof A]: A[K] }>>
```

Added in v2.2.3

## record

**Signature**

```ts
export declare const record: <A>(codomain: JsonCodec<A>) => JsonCodec<Record<string, A>>
```

Added in v2.2.3

## refine

**Signature**

```ts
export declare const refine: <A, B extends A>(
  refinement: (a: A) => a is B,
  id: string
) => (from: JsonCodec<A>) => JsonCodec<B>
```

Added in v2.2.3

## sum

**Signature**

```ts
export declare const sum: <T extends string>(
  tag: T
) => <A>(members: { [K in keyof A]: JsonCodec<A[K]> }) => JsonCodec<A[keyof A]>
```

Added in v2.2.3

## tuple

**Signature**

```ts
export declare const tuple: <A extends readonly unknown[]>(
  ...components: { [K in keyof A]: JsonCodec<A[K]> }
) => JsonCodec<A>
```

Added in v2.2.3

## type

**Signature**

```ts
export declare const type: <A>(properties: { [K in keyof A]: JsonCodec<A[K]> }) => JsonCodec<{ [K in keyof A]: A[K] }>
```

Added in v2.2.3

# constructors

## literal

**Signature**

```ts
export declare const literal: <A extends readonly [Literal, ...Literal[]]>(...values: A) => JsonCodec<A[number]>
```

Added in v2.2.3

## make

**Signature**

```ts
export declare const make: <A>(decoder: D.Decoder<unknown, A>, encoder: JE.JsonEncoder<A>) => JsonCodec<A>
```

Added in v2.2.3

# instances

## Invariant

**Signature**

```ts
export declare const Invariant: Invariant1<'io-ts/JsonCodec'>
```

Added in v2.2.8

## Schemable

**Signature**

```ts
export declare const Schemable: Schemable1<'io-ts/JsonCodec'> & WithRefine1<'io-ts/JsonCodec'>
```

Added in v2.2.8

## URI

**Signature**

```ts
export declare const URI: 'io-ts/JsonCodec'
```

Added in v2.2.3

## URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

Added in v2.2.3

# model

## JsonCodec (interface)

Laws:

1. `pipe(codec.decode(u), E.fold(() => u, codec.encode)) = u` for all `u` in `unknown`
2. `codec.decode(codec.encode(a)) = E.right(a)` for all `a` in `A`

**Signature**

```ts
export interface JsonCodec<A> extends C.Codec<JE.Json, A> {}
```

Added in v2.2.3

# primitives

## boolean

**Signature**

```ts
export declare const boolean: JsonCodec<boolean>
```

Added in v2.2.3

## number

**Signature**

```ts
export declare const number: JsonCodec<number>
```

Added in v2.2.3

## string

**Signature**

```ts
export declare const string: JsonCodec<string>
```

Added in v2.2.3

# utils

## TypeOf (type alias)

**Signature**

```ts
export type TypeOf<C> = JE.TypeOf<C>
```

Added in v2.2.2
