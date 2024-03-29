---
title: Codec.ts
nav_order: 1
parent: Modules
---

## Codec overview

**This module is experimental**

Experimental features are published in order to get early feedback from the community, see these tracking
[issues](https://github.com/gcanti/io-ts/issues?q=label%3Av2.2+) for further discussions and enhancements.

A feature tagged as _Experimental_ is in a high state of flux, you're at risk of it changing without notice.

Added in v2.2.3

---

<h2 class="text-delta">Table of contents</h2>

- [Invariant](#invariant)
  - [imap](#imap)
- [combinators](#combinators)
  - [array](#array)
  - [compose](#compose)
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
  - [partial](#partial)
  - [readonly](#readonly)
  - [record](#record)
  - [refine](#refine)
  - [struct](#struct)
  - [sum](#sum)
  - [tuple](#tuple)
  - [~~fromType~~](#fromtype)
  - [~~type~~](#type)
- [constructors](#constructors)
  - [fromDecoder](#fromdecoder)
  - [literal](#literal)
  - [make](#make)
- [instances](#instances)
  - [Invariant](#invariant-1)
  - [URI](#uri)
  - [URI (type alias)](#uri-type-alias)
- [model](#model)
  - [Codec (interface)](#codec-interface)
- [primitives](#primitives)
  - [UnknownArray](#unknownarray)
  - [UnknownRecord](#unknownrecord)
  - [boolean](#boolean)
  - [number](#number)
  - [string](#string)
- [utils](#utils)
  - [InputOf (type alias)](#inputof-type-alias)
  - [OutputOf (type alias)](#outputof-type-alias)
  - [TypeOf (type alias)](#typeof-type-alias)

---

# Invariant

## imap

**Signature**

```ts
export declare const imap: <I, O, A, B>(f: (a: A) => B, g: (b: B) => A) => (fa: Codec<I, O, A>) => Codec<I, O, B>
```

Added in v2.2.3

# combinators

## array

**Signature**

```ts
export declare function array<O, A>(item: Codec<unknown, O, A>): Codec<unknown, Array<O>, Array<A>>
```

Added in v2.2.3

## compose

**Signature**

```ts
export declare const compose: <L, A extends L, P extends A, B>(
  to: Codec<L, P, B>
) => <I, O>(from: Codec<I, O, A>) => Codec<I, O, B>
```

Added in v2.2.8

## fromArray

**Signature**

```ts
export declare function fromArray<I, O, A>(item: Codec<I, O, A>): Codec<Array<I>, Array<O>, Array<A>>
```

Added in v2.2.3

## fromPartial

**Signature**

```ts
export declare function fromPartial<P extends Record<string, Codec<any, any, any>>>(
  properties: P
): Codec<
  Partial<{ [K in keyof P]: InputOf<P[K]> }>,
  Partial<{ [K in keyof P]: OutputOf<P[K]> }>,
  Partial<{ [K in keyof P]: TypeOf<P[K]> }>
>
```

Added in v2.2.8

## fromRecord

**Signature**

```ts
export declare function fromRecord<I, O, A>(
  codomain: Codec<I, O, A>
): Codec<Record<string, I>, Record<string, O>, Record<string, A>>
```

Added in v2.2.3

## fromStruct

**Signature**

```ts
export declare function fromStruct<P extends Record<string, Codec<any, any, any>>>(
  properties: P
): Codec<{ [K in keyof P]: InputOf<P[K]> }, { [K in keyof P]: OutputOf<P[K]> }, { [K in keyof P]: TypeOf<P[K]> }>
```

Added in v2.2.15

## fromSum

**Signature**

```ts
export declare const fromSum: <T extends string>(
  tag: T
) => <MS extends Record<string, Codec<any, any, any>>>(
  members: MS
) => Codec<InputOf<'Either', MS[keyof MS]>, E.OutputOf<MS[keyof MS]>, E.TypeOf<MS[keyof MS]>>
```

Added in v2.2.8

## fromTuple

**Signature**

```ts
export declare const fromTuple: <C extends readonly Codec<any, any, any>[]>(
  ...components: C
) => Codec<
  { [K in keyof C]: InputOf<'Either', C[K]> },
  { [K in keyof C]: E.OutputOf<C[K]> },
  { [K in keyof C]: E.TypeOf<C[K]> }
>
```

Added in v2.2.8

## intersect

**Signature**

```ts
export declare const intersect: <IB, OB, B>(
  right: Codec<IB, OB, B>
) => <IA, OA, A>(left: Codec<IA, OA, A>) => Codec<IA & IB, OA & OB, A & B>
```

Added in v2.2.3

## lazy

**Signature**

```ts
export declare function lazy<I, O, A>(id: string, f: () => Codec<I, O, A>): Codec<I, O, A>
```

Added in v2.2.3

## mapLeftWithInput

**Signature**

```ts
export declare const mapLeftWithInput: <I>(
  f: (i: I, e: D.DecodeError) => D.DecodeError
) => <O, A>(codec: Codec<I, O, A>) => Codec<I, O, A>
```

Added in v2.2.3

## nullable

**Signature**

```ts
export declare function nullable<I, O, A>(or: Codec<I, O, A>): Codec<null | I, null | O, null | A>
```

Added in v2.2.3

## partial

**Signature**

```ts
export declare function partial<P extends Record<string, Codec<unknown, any, any>>>(
  properties: P
): Codec<unknown, Partial<{ [K in keyof P]: OutputOf<P[K]> }>, Partial<{ [K in keyof P]: TypeOf<P[K]> }>>
```

Added in v2.2.3

## readonly

**Signature**

```ts
export declare const readonly: <I, O, A>(codec: Codec<I, O, A>) => Codec<I, O, Readonly<A>>
```

Added in v2.2.16

## record

**Signature**

```ts
export declare function record<O, A>(
  codomain: Codec<unknown, O, A>
): Codec<unknown, Record<string, O>, Record<string, A>>
```

Added in v2.2.3

## refine

**Signature**

```ts
export declare const refine: <A, B extends A>(
  refinement: Refinement<A, B>,
  id: string
) => <I, O>(from: Codec<I, O, A>) => Codec<I, O, B>
```

Added in v2.2.3

## struct

**Signature**

```ts
export declare function struct<P extends Record<string, Codec<unknown, any, any>>>(
  properties: P
): Codec<unknown, { [K in keyof P]: OutputOf<P[K]> }, { [K in keyof P]: TypeOf<P[K]> }>
```

Added in v2.2.15

## sum

**Signature**

```ts
export declare function sum<T extends string>(
  tag: T
): <M extends Record<string, Codec<unknown, any, any>>>(
  members: M
) => Codec<unknown, OutputOf<M[keyof M]>, TypeOf<M[keyof M]>>
```

Added in v2.2.3

## tuple

**Signature**

```ts
export declare function tuple<C extends ReadonlyArray<Codec<unknown, any, any>>>(
  ...components: C
): Codec<unknown, { [K in keyof C]: OutputOf<C[K]> }, { [K in keyof C]: TypeOf<C[K]> }>
```

Added in v2.2.3

## ~~fromType~~

Use `fromStruct` instead.

**Signature**

```ts
export declare const fromType: typeof fromStruct
```

Added in v2.2.8

## ~~type~~

Use `struct` instead.

**Signature**

```ts
export declare const type: typeof struct
```

Added in v2.2.3

# constructors

## fromDecoder

**Signature**

```ts
export declare function fromDecoder<I, A>(decoder: D.Decoder<I, A>): Codec<I, A, A>
```

Added in v2.2.3

## literal

**Signature**

```ts
export declare function literal<A extends readonly [L, ...ReadonlyArray<L>], L extends S.Literal = S.Literal>(
  ...values: A
): Codec<unknown, A[number], A[number]>
```

Added in v2.2.3

## make

**Signature**

```ts
export declare function make<I, O, A>(decoder: D.Decoder<I, A>, encoder: E.Encoder<O, A>): Codec<I, O, A>
```

Added in v2.2.3

# instances

## Invariant

**Signature**

```ts
export declare const Invariant: Invariant3<'io-ts/Codec'>
```

Added in v2.2.8

## URI

**Signature**

```ts
export declare const URI: 'io-ts/Codec'
```

Added in v2.2.3

## URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

Added in v2.2.3

# model

## Codec (interface)

Laws:

1. `pipe(codec.decode(u), E.fold(() => u, codec.encode)) = u` for all `u` in `unknown`
2. `codec.decode(codec.encode(a)) = E.right(a)` for all `a` in `A`

**Signature**

```ts
export interface Codec<I, O, A> extends D.Decoder<I, A>, E.Encoder<O, A> {}
```

Added in v2.2.3

# primitives

## UnknownArray

**Signature**

```ts
export declare const UnknownArray: Codec<unknown, unknown[], unknown[]>
```

Added in v2.2.3

## UnknownRecord

**Signature**

```ts
export declare const UnknownRecord: Codec<unknown, Record<string, unknown>, Record<string, unknown>>
```

Added in v2.2.3

## boolean

**Signature**

```ts
export declare const boolean: Codec<unknown, boolean, boolean>
```

Added in v2.2.3

## number

**Signature**

```ts
export declare const number: Codec<unknown, number, number>
```

Added in v2.2.3

## string

**Signature**

```ts
export declare const string: Codec<unknown, string, string>
```

Added in v2.2.3

# utils

## InputOf (type alias)

**Signature**

```ts
export type InputOf<C> = D.InputOf<C>
```

Added in v2.2.8

## OutputOf (type alias)

**Signature**

```ts
export type OutputOf<C> = E.OutputOf<C>
```

Added in v2.2.3

## TypeOf (type alias)

**Signature**

```ts
export type TypeOf<C> = E.TypeOf<C>
```

Added in v2.2.3
