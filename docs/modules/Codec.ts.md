---
title: Codec.ts
nav_order: 1
parent: Modules
---

# Codec overview

Added in v2.2.3

---

<h2 class="text-delta">Table of contents</h2>

- [Codec (interface)](#codec-interface)
- [OutputOf (type alias)](#outputof-type-alias)
- [TypeOf (type alias)](#typeof-type-alias)
- [URI (type alias)](#uri-type-alias)
- [URI](#uri)
- [UnknownArray](#unknownarray)
- [UnknownRecord](#unknownrecord)
- [array](#array)
- [boolean](#boolean)
- [codec](#codec)
- [fromDecoder](#fromdecoder)
- [intersection](#intersection)
- [lazy](#lazy)
- [literal](#literal)
- [make](#make)
- [nullable](#nullable)
- [number](#number)
- [partial](#partial)
- [record](#record)
- [refinement](#refinement)
- [string](#string)
- [sum](#sum)
- [tuple](#tuple)
- [type](#type)
- [withExpected](#withexpected)

---

# Codec (interface)

Laws:

1. `pipe(codec.decode(u), E.fold(() => u, codec.encode)) = u` for all `u` in `unknown`
2. `codec.decode(codec.encode(a)) = E.right(a)` for all `a` in `A`

**Signature**

```ts
export interface Codec<O, A> extends D.Decoder<A>, E.Encoder<O, A> {}
```

Added in v2.2.3

# OutputOf (type alias)

**Signature**

```ts
export type OutputOf<C> = E.OutputOf<C>
```

Added in v2.2.3

# TypeOf (type alias)

**Signature**

```ts
export type TypeOf<C> = E.TypeOf<C>
```

Added in v2.2.3

# URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

Added in v2.2.3

# URI

**Signature**

```ts
export declare const URI: 'io-ts/Codec'
```

Added in v2.2.3

# UnknownArray

**Signature**

```ts
export declare const UnknownArray: Codec<unknown[], unknown[]>
```

Added in v2.2.3

# UnknownRecord

**Signature**

```ts
export declare const UnknownRecord: Codec<Record<string, unknown>, Record<string, unknown>>
```

Added in v2.2.3

# array

**Signature**

```ts
export declare function array<O, A>(items: Codec<O, A>): Codec<Array<O>, Array<A>>
```

Added in v2.2.3

# boolean

**Signature**

```ts
export declare const boolean: Codec<boolean, boolean>
```

Added in v2.2.3

# codec

**Signature**

```ts
export declare const codec: Invariant2<'io-ts/Codec'>
```

Added in v2.2.3

# fromDecoder

**Signature**

```ts
export declare function fromDecoder<A>(decoder: D.Decoder<A>): Codec<A, A>
```

Added in v2.2.3

# intersection

**Signature**

```ts
export declare function intersection<O, A, P, B>(left: Codec<O, A>, right: Codec<P, B>): Codec<O & P, A & B>
```

Added in v2.2.3

# lazy

**Signature**

```ts
export declare function lazy<O, A>(id: string, f: () => Codec<O, A>): Codec<O, A>
```

Added in v2.2.3

# literal

**Signature**

```ts
export declare function literal<A extends ReadonlyArray<Literal>>(...values: A): Codec<A[number], A[number]>
```

Added in v2.2.3

# make

**Signature**

```ts
export declare function make<O, A>(decoder: D.Decoder<A>, encoder: E.Encoder<O, A>): Codec<O, A>
```

Added in v2.2.3

# nullable

**Signature**

```ts
export declare function nullable<O, A>(or: Codec<O, A>): Codec<null | O, null | A>
```

Added in v2.2.3

# number

**Signature**

```ts
export declare const number: Codec<number, number>
```

Added in v2.2.3

# partial

**Signature**

```ts
export declare function partial<P extends Record<string, Codec<any, any>>>(
  properties: P
): Codec<Partial<{ [K in keyof P]: OutputOf<P[K]> }>, Partial<{ [K in keyof P]: TypeOf<P[K]> }>>
```

Added in v2.2.3

# record

**Signature**

```ts
export declare function record<O, A>(codomain: Codec<O, A>): Codec<Record<string, O>, Record<string, A>>
```

Added in v2.2.3

# refinement

**Signature**

```ts
export declare function refinement<O, A, B extends A>(
  from: Codec<O, A>,
  refinement: (a: A) => a is B,
  expected: string
): Codec<O, B>
```

Added in v2.2.3

# string

**Signature**

```ts
export declare const string: Codec<string, string>
```

Added in v2.2.3

# sum

**Signature**

```ts
export declare function sum<T extends string>(
  tag: T
): <M extends Record<string, Codec<any, any>>>(members: M) => Codec<OutputOf<M[keyof M]>, TypeOf<M[keyof M]>>
```

Added in v2.2.3

# tuple

**Signature**

```ts
export declare function tuple<C extends ReadonlyArray<Codec<any, any>>>(
  ...components: C
): Codec<{ [K in keyof C]: OutputOf<C[K]> }, { [K in keyof C]: TypeOf<C[K]> }>
```

Added in v2.2.3

# type

**Signature**

```ts
export declare function type<P extends Record<string, Codec<any, any>>>(
  properties: P
): Codec<{ [K in keyof P]: OutputOf<P[K]> }, { [K in keyof P]: TypeOf<P[K]> }>
```

Added in v2.2.3

# withExpected

**Signature**

```ts
export declare function withExpected<O, A>(
  codec: Codec<O, A>,
  expected: (actual: unknown, e: D.DecodeError) => D.DecodeError
): Codec<O, A>
```

Added in v2.2.3
