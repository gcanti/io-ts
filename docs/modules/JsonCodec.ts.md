---
title: JsonCodec.ts
nav_order: 11
parent: Modules
---

## JsonCodec overview

Added in v2.2.3

---

<h2 class="text-delta">Table of contents</h2>

- [Contravariant](#contravariant)
  - [imap](#imap)
- [combinators](#combinators)
  - [array](#array)
  - [intersect](#intersect)
  - [lazy](#lazy)
  - [nullable](#nullable)
  - [partial](#partial)
  - [record](#record)
  - [refinement](#refinement)
  - [sum](#sum)
  - [tuple](#tuple)
  - [type](#type)
  - [withExpected](#withexpected)
- [constructors](#constructors)
  - [literal](#literal)
  - [make](#make)
- [instances](#instances)
  - [URI](#uri)
  - [URI (type alias)](#uri-type-alias)
  - [invariantJsonCodec](#invariantjsoncodec)
  - [schemableJsonCodec](#schemablejsoncodec)
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
export declare const array: <A>(items: JsonCodec<A>) => JsonCodec<A[]>
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

## refinement

**Signature**

```ts
export declare const refinement: <A, B extends A>(
  from: JsonCodec<A>,
  refinement: (a: A) => a is B,
  expected: string
) => JsonCodec<B>
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

## withExpected

**Signature**

```ts
export declare const withExpected: <A>(
  codec: JsonCodec<A>,
  expected: (actual: unknown, e: D.DecodeError) => D.DecodeError
) => JsonCodec<A>
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
export declare const make: <A>(decoder: D.Decoder<A>, encoder: JE.JsonEncoder<A>) => JsonCodec<A>
```

Added in v2.2.3

# instances

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

## invariantJsonCodec

**Signature**

```ts
export declare const invariantJsonCodec: Invariant1<'io-ts/JsonCodec'>
```

Added in v2.2.3

## schemableJsonCodec

**Signature**

```ts
export declare const schemableJsonCodec: Schemable1<'io-ts/JsonCodec'> & WithRefinement1<'io-ts/JsonCodec'>
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
