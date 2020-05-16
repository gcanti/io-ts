---
title: Codec.ts
nav_order: 1
parent: Modules
---

# Codec overview

Added in v2.2.0

---

<h2 class="text-delta">Table of contents</h2>

- [Codec (interface)](#codec-interface)
- [TypeOf (type alias)](#typeof-type-alias)
- [URI (type alias)](#uri-type-alias)
- [URI](#uri)
- [UnknownArray](#unknownarray)
- [UnknownRecord](#unknownrecord)
- [array](#array)
- [boolean](#boolean)
- [codec](#codec)
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
export interface Codec<A> extends D.Decoder<A>, E.Encoder<A> {}
```

Added in v2.2.0

# TypeOf (type alias)

**Signature**

```ts
export type TypeOf<C> = C extends Codec<infer A> ? A : never
```

Added in v2.2.2

# URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

Added in v2.2.0

# URI

**Signature**

```ts
export declare const URI: 'Codec'
```

Added in v2.2.0

# UnknownArray

**Signature**

```ts
export declare const UnknownArray: Codec<unknown[]>
```

Added in v2.2.0

# UnknownRecord

**Signature**

```ts
export declare const UnknownRecord: Codec<Record<string, unknown>>
```

Added in v2.2.0

# array

**Signature**

```ts
export declare function array<A>(items: Codec<A>): Codec<Array<A>>
```

Added in v2.2.0

# boolean

**Signature**

```ts
export declare const boolean: Codec<boolean>
```

Added in v2.2.0

# codec

**Signature**

```ts
export declare const codec: Invariant1<'Codec'> & Schemable1<'Codec'>
```

Added in v2.2.0

# intersection

**Signature**

```ts
export declare function intersection<A, B>(left: Codec<A>, right: Codec<B>): Codec<A & B>
```

Added in v2.2.0

# lazy

**Signature**

```ts
export declare function lazy<A>(id: string, f: () => Codec<A>): Codec<A>
```

Added in v2.2.0

# literal

**Signature**

```ts
export declare function literal<A extends ReadonlyArray<Literal>>(...values: A): Codec<A[number]>
```

Added in v2.2.0

# make

**Signature**

```ts
export declare function make<A>(decoder: D.Decoder<A>, encoder: E.Encoder<A>): Codec<A>
```

Added in v2.2.0

# nullable

**Signature**

```ts
export declare function nullable<A>(or: Codec<A>): Codec<null | A>
```

Added in v2.2.0

# number

**Signature**

```ts
export declare const number: Codec<number>
```

Added in v2.2.0

# partial

**Signature**

```ts
export declare function partial<A>(properties: { [K in keyof A]: Codec<A[K]> }): Codec<Partial<A>>
```

Added in v2.2.0

# record

**Signature**

```ts
export declare function record<A>(codomain: Codec<A>): Codec<Record<string, A>>
```

Added in v2.2.0

# refinement

**Signature**

```ts
export declare function refinement<A, B extends A>(
  from: Codec<A>,
  refinement: (a: A) => a is B,
  expected: string
): Codec<B>
```

Added in v2.2.0

# string

**Signature**

```ts
export declare const string: Codec<string>
```

Added in v2.2.0

# sum

**Signature**

```ts
export declare function sum<T extends string>(
  tag: T
): <A>(members: { [K in keyof A]: Codec<A[K] & Record<T, K>> }) => Codec<A[keyof A]>
```

Added in v2.2.0

# tuple

**Signature**

```ts
export declare function tuple<A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: Codec<A[K]> }
): Codec<A>
```

Added in v2.2.0

# type

**Signature**

```ts
export declare function type<A>(properties: { [K in keyof A]: Codec<A[K]> }): Codec<A>
```

Added in v2.2.0

# withExpected

**Signature**

```ts
export declare function withExpected<A>(
  codec: Codec<A>,
  expected: (actual: unknown, e: D.DecodeError) => D.DecodeError
): Codec<A>
```

Added in v2.2.0
