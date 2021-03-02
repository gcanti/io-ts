---
title: Encoder.ts
nav_order: 4
parent: Modules
---

## Encoder overview

Added in v3.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Category](#category)
  - [id](#id)
- [Contravariant](#contravariant)
  - [contramap](#contramap)
- [combinators](#combinators)
  - [array](#array)
  - [intersect](#intersect)
  - [lazy](#lazy)
  - [nullable](#nullable)
  - [partial](#partial)
  - [record](#record)
  - [struct](#struct)
  - [sum](#sum)
  - [tuple](#tuple)
- [instances](#instances)
  - [Category](#category-1)
  - [Contravariant](#contravariant-1)
  - [URI (type alias)](#uri-type-alias)
- [model](#model)
  - [Encoder (interface)](#encoder-interface)
- [utils](#utils)
  - [OutputOf (type alias)](#outputof-type-alias)
  - [TypeOf (type alias)](#typeof-type-alias)
  - [compose](#compose)

---

# Category

## id

**Signature**

```ts
export declare function id<A>(): Encoder<A, A>
```

Added in v3.0.0

# Contravariant

## contramap

**Signature**

```ts
export declare const contramap: <A, B>(f: (b: B) => A) => <E>(fa: Encoder<E, A>) => Encoder<E, B>
```

Added in v3.0.0

# combinators

## array

**Signature**

```ts
export declare function array<O, A>(item: Encoder<O, A>): Encoder<Array<O>, Array<A>>
```

Added in v3.0.0

## intersect

**Signature**

```ts
export declare const intersect: <P, B>(right: Encoder<P, B>) => <O, A>(left: Encoder<O, A>) => Encoder<O & P, A & B>
```

Added in v3.0.0

## lazy

**Signature**

```ts
export declare function lazy<O, A>(f: () => Encoder<O, A>): Encoder<O, A>
```

Added in v3.0.0

## nullable

**Signature**

```ts
export declare function nullable<O, A>(or: Encoder<O, A>): Encoder<null | O, null | A>
```

Added in v3.0.0

## partial

**Signature**

```ts
export declare function partial<P extends Record<string, Encoder<any, any>>>(
  properties: P
): Encoder<Partial<{ [K in keyof P]: OutputOf<P[K]> }>, Partial<{ [K in keyof P]: TypeOf<P[K]> }>>
```

Added in v3.0.0

## record

**Signature**

```ts
export declare function record<O, A>(codomain: Encoder<O, A>): Encoder<Record<string, O>, Record<string, A>>
```

Added in v3.0.0

## struct

**Signature**

```ts
export declare function struct<P extends Record<string, Encoder<any, any>>>(
  properties: P
): Encoder<{ [K in keyof P]: OutputOf<P[K]> }, { [K in keyof P]: TypeOf<P[K]> }>
```

Added in v3.0.0

## sum

**Signature**

```ts
export declare function sum<T extends string>(
  tag: T
): <MS extends Record<string, Encoder<any, any>>>(members: MS) => Encoder<OutputOf<MS[keyof MS]>, TypeOf<MS[keyof MS]>>
```

Added in v3.0.0

## tuple

**Signature**

```ts
export declare function tuple<C extends ReadonlyArray<Encoder<any, any>>>(
  ...components: C
): Encoder<{ [K in keyof C]: OutputOf<C[K]> }, { [K in keyof C]: TypeOf<C[K]> }>
```

Added in v3.0.0

# instances

## Category

**Signature**

```ts
export declare const Category: Category2<'io-ts/Encoder'>
```

Added in v3.0.0

## Contravariant

**Signature**

```ts
export declare const Contravariant: Contravariant2<'io-ts/Encoder'>
```

Added in v3.0.0

## URI (type alias)

**Signature**

```ts
export type URI = 'io-ts/Encoder'
```

Added in v3.0.0

# model

## Encoder (interface)

**Signature**

```ts
export interface Encoder<O, A> {
  readonly encode: (a: A) => O
}
```

Added in v3.0.0

# utils

## OutputOf (type alias)

**Signature**

```ts
export type OutputOf<E> = E extends Encoder<infer O, any> ? O : never
```

Added in v3.0.0

## TypeOf (type alias)

**Signature**

```ts
export type TypeOf<E> = E extends Encoder<any, infer A> ? A : never
```

Added in v3.0.0

## compose

**Signature**

```ts
export declare const compose: <E, A>(ea: Encoder<E, A>) => <B>(ab: Encoder<A, B>) => Encoder<E, B>
```

Added in v3.0.0
