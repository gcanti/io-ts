---
title: Encoder.ts
nav_order: 3
parent: Modules
---

# Encoder overview

Added in v2.2.0

---

<h2 class="text-delta">Table of contents</h2>

- [Encoder (interface)](#encoder-interface)
- [TypeOf (type alias)](#typeof-type-alias)
- [URI (type alias)](#uri-type-alias)
- [URI](#uri)
- [array](#array)
- [contramap](#contramap)
- [encoder](#encoder)
- [id](#id)
- [intersection](#intersection)
- [lazy](#lazy)
- [nullable](#nullable)
- [partial](#partial)
- [record](#record)
- [sum](#sum)
- [tuple](#tuple)
- [type](#type)

---

# Encoder (interface)

**Signature**

```ts
export interface Encoder<A> {
  readonly encode: (a: A) => unknown
}
```

Added in v2.2.0

# TypeOf (type alias)

**Signature**

```ts
export type TypeOf<E> = E extends Encoder<infer A> ? A : never
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
export declare const URI: 'Encoder'
```

Added in v2.2.0

# array

**Signature**

```ts
export declare function array<A>(items: Encoder<A>): Encoder<Array<A>>
```

Added in v2.2.0

# contramap

**Signature**

```ts
export declare const contramap: <A, B>(f: (b: B) => A) => (fa: Encoder<A>) => Encoder<B>
```

Added in v2.2.0

# encoder

**Signature**

```ts
export declare const encoder: Contravariant1<'Encoder'> & Schemable1<'Encoder'>
```

Added in v2.2.0

# id

**Signature**

```ts
export declare const id: Encoder<unknown>
```

Added in v2.2.0

# intersection

**Signature**

```ts
export declare function intersection<A, B>(left: Encoder<A>, right: Encoder<B>): Encoder<A & B>
```

Added in v2.2.0

# lazy

**Signature**

```ts
export declare function lazy<A>(f: () => Encoder<A>): Encoder<A>
```

Added in v2.2.0

# nullable

**Signature**

```ts
export declare function nullable<A>(or: Encoder<A>): Encoder<null | A>
```

Added in v2.2.0

# partial

**Signature**

```ts
export declare function partial<A>(properties: { [K in keyof A]: Encoder<A[K]> }): Encoder<Partial<A>>
```

Added in v2.2.0

# record

**Signature**

```ts
export declare function record<A>(codomain: Encoder<A>): Encoder<Record<string, A>>
```

Added in v2.2.0

# sum

**Signature**

```ts
export declare function sum<T extends string>(
  tag: T
): <A>(members: { [K in keyof A]: Encoder<A[K] & Record<T, K>> }) => Encoder<A[keyof A]>
```

Added in v2.2.0

# tuple

**Signature**

```ts
export declare function tuple<A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: Encoder<A[K]> }
): Encoder<A>
```

Added in v2.2.0

# type

**Signature**

```ts
export declare function type<A>(properties: { [K in keyof A]: Encoder<A[K]> }): Encoder<A>
```

Added in v2.2.0
