---
title: Encoder.ts
nav_order: 5
parent: Modules
---

## Encoder overview

Added in v2.2.3

---

<h2 class="text-delta">Table of contents</h2>

- [Contravariant](#contravariant)
  - [contramap](#contramap)
- [Semigroupoid](#semigroupoid)
  - [compose](#compose)
- [combinators](#combinators)
  - [array](#array)
  - [intersect](#intersect)
  - [lazy](#lazy)
  - [nullable](#nullable)
  - [partial](#partial)
  - [record](#record)
  - [sum](#sum)
  - [tuple](#tuple)
  - [type](#type)
- [constructors](#constructors)
  - [id](#id)
- [instances](#instances)
  - [URI](#uri)
  - [URI (type alias)](#uri-type-alias)
  - [categoryEncoder](#categoryencoder)
  - [contravariantEncoder](#contravariantencoder)
- [model](#model)
  - [Encoder (interface)](#encoder-interface)
- [utils](#utils)
  - [OutputOf (type alias)](#outputof-type-alias)
  - [TypeOf (type alias)](#typeof-type-alias)

---

# Contravariant

## contramap

**Signature**

```ts
export declare const contramap: <A, B>(f: (b: B) => A) => <E>(fa: Encoder<E, A>) => Encoder<E, B>
```

Added in v2.2.3

# Semigroupoid

## compose

**Signature**

```ts
export declare const compose: <E, A>(ea: Encoder<E, A>) => <B>(ab: Encoder<A, B>) => Encoder<E, B>
```

Added in v2.2.3

# combinators

## array

**Signature**

```ts
export declare function array<O, A>(items: Encoder<O, A>): Encoder<Array<O>, Array<A>>
```

Added in v2.2.3

## intersect

**Signature**

```ts
export declare const intersect: <P, B>(right: Encoder<P, B>) => <O, A>(left: Encoder<O, A>) => Encoder<O & P, A & B>
```

Added in v2.2.3

## lazy

**Signature**

```ts
export declare function lazy<O, A>(f: () => Encoder<O, A>): Encoder<O, A>
```

Added in v2.2.3

## nullable

**Signature**

```ts
export declare function nullable<O, A>(or: Encoder<O, A>): Encoder<null | O, null | A>
```

Added in v2.2.3

## partial

**Signature**

```ts
export declare function partial<P extends Record<string, Encoder<any, any>>>(
  properties: P
): Encoder<Partial<{ [K in keyof P]: OutputOf<P[K]> }>, Partial<{ [K in keyof P]: TypeOf<P[K]> }>>
```

Added in v2.2.3

## record

**Signature**

```ts
export declare function record<O, A>(codomain: Encoder<O, A>): Encoder<Record<string, O>, Record<string, A>>
```

Added in v2.2.3

## sum

**Signature**

```ts
export declare function sum<T extends string>(
  tag: T
): <M extends Record<string, Encoder<any, any>>>(members: M) => Encoder<OutputOf<M[keyof M]>, TypeOf<M[keyof M]>>
```

Added in v2.2.3

## tuple

**Signature**

```ts
export declare function tuple<C extends ReadonlyArray<Encoder<any, any>>>(
  ...components: C
): Encoder<{ [K in keyof C]: OutputOf<C[K]> }, { [K in keyof C]: TypeOf<C[K]> }>
```

Added in v2.2.3

## type

**Signature**

```ts
export declare function type<P extends Record<string, Encoder<any, any>>>(
  properties: P
): Encoder<{ [K in keyof P]: OutputOf<P[K]> }, { [K in keyof P]: TypeOf<P[K]> }>
```

Added in v2.2.3

# constructors

## id

**Signature**

```ts
export declare function id<A>(): Encoder<A, A>
```

Added in v2.2.3

# instances

## URI

**Signature**

```ts
export declare const URI: 'io-ts/Encoder'
```

Added in v2.2.3

## URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

Added in v2.2.3

## categoryEncoder

**Signature**

```ts
export declare const categoryEncoder: Category2<'io-ts/Encoder'>
```

Added in v2.2.3

## contravariantEncoder

**Signature**

```ts
export declare const contravariantEncoder: Contravariant2<'io-ts/Encoder'>
```

Added in v2.2.3

# model

## Encoder (interface)

**Signature**

```ts
export interface Encoder<O, A> {
  readonly encode: (a: A) => O
}
```

Added in v2.2.3

# utils

## OutputOf (type alias)

**Signature**

```ts
export type OutputOf<E> = E extends Encoder<infer O, any> ? O : never
```

Added in v2.2.3

## TypeOf (type alias)

**Signature**

```ts
export type TypeOf<E> = E extends Encoder<any, infer A> ? A : never
```

Added in v2.2.3
