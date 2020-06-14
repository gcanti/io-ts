---
title: JsonCodec.ts
nav_order: 7
parent: Modules
---

# JsonCodec overview

Added in v2.2.3

---

<h2 class="text-delta">Table of contents</h2>

- [JsonCodec (interface)](#jsoncodec-interface)
- [TypeOf (type alias)](#typeof-type-alias)
- [URI (type alias)](#uri-type-alias)
- [URI](#uri)
- [array](#array)
- [boolean](#boolean)
- [imap](#imap)
- [intersection](#intersection)
- [invariantJsonCodec](#invariantjsoncodec)
- [lazy](#lazy)
- [literal](#literal)
- [make](#make)
- [nullable](#nullable)
- [number](#number)
- [partial](#partial)
- [record](#record)
- [refinement](#refinement)
- [schemableJsonCodec](#schemablejsoncodec)
- [string](#string)
- [sum](#sum)
- [tuple](#tuple)
- [type](#type)
- [withExpected](#withexpected)

---

# JsonCodec (interface)

Laws:

1. `pipe(codec.decode(u), E.fold(() => u, codec.encode)) = u` for all `u` in `unknown`
2. `codec.decode(codec.encode(a)) = E.right(a)` for all `a` in `A`

**Signature**

```ts
export interface JsonCodec<A> extends C.Codec<JE.Json, A> {}
```

Added in v2.2.3

# TypeOf (type alias)

**Signature**

```ts
export type TypeOf<C> = JE.TypeOf<C>
```

Added in v2.2.2

# URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

Added in v2.2.3

# URI

**Signature**

```ts
export declare const URI: 'io-ts/JsonCodec'
```

Added in v2.2.3

# array

**Signature**

```ts
export declare const array: <A>(items: JsonCodec<A>) => JsonCodec<A[]>
```

Added in v2.2.3

# boolean

**Signature**

```ts
export declare const boolean: JsonCodec<boolean>
```

Added in v2.2.3

# imap

**Signature**

```ts
export declare const imap: <A, B>(f: (a: A) => B, g: (b: B) => A) => (fa: JsonCodec<A>) => JsonCodec<B>
```

Added in v2.2.3

# intersection

**Signature**

```ts
export declare const intersection: <A, B>(left: JsonCodec<A>, right: JsonCodec<B>) => JsonCodec<A & B>
```

Added in v2.2.3

# invariantJsonCodec

**Signature**

```ts
export declare const invariantJsonCodec: Invariant1<'io-ts/JsonCodec'>
```

Added in v2.2.3

# lazy

**Signature**

```ts
export declare const lazy: <A>(id: string, f: () => JsonCodec<A>) => JsonCodec<A>
```

Added in v2.2.3

# literal

**Signature**

```ts
export declare const literal: <A extends readonly (string | number | boolean)[]>(...values: A) => JsonCodec<A[number]>
```

Added in v2.2.3

# make

**Signature**

```ts
export declare const make: <A>(decoder: D.Decoder<A>, encoder: JE.JsonEncoder<A>) => JsonCodec<A>
```

Added in v2.2.3

# nullable

**Signature**

```ts
export declare const nullable: <A>(or: JsonCodec<A>) => JsonCodec<A>
```

Added in v2.2.3

# number

**Signature**

```ts
export declare const number: JsonCodec<number>
```

Added in v2.2.3

# partial

**Signature**

```ts
export declare const partial: <A>(
  properties: { [K in keyof A]: JsonCodec<A[K]> }
) => JsonCodec<Partial<{ [K in keyof A]: A[K] }>>
```

Added in v2.2.3

# record

**Signature**

```ts
export declare const record: <A>(codomain: JsonCodec<A>) => JsonCodec<Record<string, A>>
```

Added in v2.2.3

# refinement

**Signature**

```ts
export declare const refinement: <A, B extends A>(
  from: JsonCodec<A>,
  refinement: (a: A) => a is B,
  expected: string
) => JsonCodec<B>
```

Added in v2.2.3

# schemableJsonCodec

**Signature**

```ts
export declare const schemableJsonCodec: Schemable1<'io-ts/JsonCodec'> & WithRefinement1<'io-ts/JsonCodec'>
```

Added in v2.2.3

# string

**Signature**

```ts
export declare const string: JsonCodec<string>
```

Added in v2.2.3

# sum

**Signature**

```ts
export declare const sum: <T extends string>(
  tag: T
) => <A>(members: { [K in keyof A]: JsonCodec<A[K]> }) => JsonCodec<A[keyof A]>
```

Added in v2.2.3

# tuple

**Signature**

```ts
export declare const tuple: <A extends readonly unknown[]>(
  ...components: { [K in keyof A]: JsonCodec<A[K]> }
) => JsonCodec<A>
```

Added in v2.2.3

# type

**Signature**

```ts
export declare const type: <A>(properties: { [K in keyof A]: JsonCodec<A[K]> }) => JsonCodec<{ [K in keyof A]: A[K] }>
```

Added in v2.2.3

# withExpected

**Signature**

```ts
export declare const withExpected: <A>(
  codec: JsonCodec<A>,
  expected: (actual: unknown, e: D.DecodeError) => D.DecodeError
) => JsonCodec<A>
```

Added in v2.2.3
