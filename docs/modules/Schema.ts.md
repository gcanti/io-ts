---
title: Schema.ts
nav_order: 12
parent: Modules
---

## Schema overview

**This module is experimental**

Experimental features are published in order to get early feedback from the community, see these tracking
[issues](https://github.com/gcanti/io-ts/issues?q=label%3Av2.2+) for further discussions and enhancements.

A feature tagged as _Experimental_ is in a high state of flux, you're at risk of it changing without notice.

Added in v2.2.0

---

<h2 class="text-delta">Table of contents</h2>

- [combinators](#combinators)
  - [array](#array)
  - [intersect](#intersect)
  - [lazy](#lazy)
  - [literal](#literal)
  - [nullable](#nullable)
  - [partial](#partial)
  - [readonly](#readonly)
  - [record](#record)
  - [struct](#struct)
  - [sum](#sum)
  - [tuple](#tuple)
- [constructors](#constructors)
  - [make](#make)
- [model](#model)
  - [Schema (interface)](#schema-interface)
- [primitives](#primitives)
  - [boolean](#boolean)
  - [number](#number)
  - [string](#string)
- [utils](#utils)
  - [TypeOf (type alias)](#typeof-type-alias)
  - [interpreter](#interpreter)

---

# combinators

## array

**Signature**

```ts
export declare function array<A>(schema: Schema<A>): Schema<A[]>
```

Added in v2.3.0

## intersect

**Signature**

```ts
export declare function intersect<B>(right: Schema<B>): <A>(left: Schema<A>) => Schema<A & B>
```

Added in v2.3.0

## lazy

**Signature**

```ts
export declare function lazy(id: string): <A>(f: () => Schema<A>) => Schema<A>
```

Added in v2.3.0

## literal

**Signature**

```ts
export declare function literal<A extends readonly [L, ...ReadonlyArray<L>], L extends Literal = Literal>(
  ...values: A
): Schema<A[number]>
```

Added in v2.3.0

## nullable

**Signature**

```ts
export declare function nullable<A>(schema: Schema<A>): Schema<A | null>
```

Added in v2.3.0

## partial

**Signature**

```ts
export declare function partial<A>(
  properties: { [K in keyof A]: Schema<A[K]> }
): Schema<Partial<{ [K in keyof A]: A[K] }>>
```

Added in v2.3.0

## readonly

**Signature**

```ts
export declare function readonly<A>(schema: Schema<A>): Schema<Readonly<A>>
```

Added in v2.3.0

## record

**Signature**

```ts
export declare function record<A>(schema: Schema<A>): Schema<Record<string, A>>
```

Added in v2.3.0

## struct

**Signature**

```ts
export declare function struct<A>(properties: { [K in keyof A]: Schema<A[K]> }): Schema<A>
```

Added in v2.3.0

## sum

**Signature**

```ts
export declare function sum<T extends string>(
  tag: T
): <A>(members: { [K in keyof A]: Schema<A[K] & Record<T, K>> }) => Schema<A[keyof A]>
```

Added in v2.3.0

## tuple

**Signature**

```ts
export declare function tuple<A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: Schema<A[K]> }
): Schema<A>
```

Added in v2.3.0

# constructors

## make

**Signature**

```ts
export declare function make<A>(schema: Schema<A>): Schema<A>
```

Added in v2.2.0

# model

## Schema (interface)

**Signature**

```ts
export interface Schema<A> {
  <S>(S: Schemable<S>): HKT<S, A>
}
```

Added in v2.2.0

# primitives

## boolean

**Signature**

```ts
export declare const boolean: Schema<boolean>
```

Added in v2.3.0

## number

**Signature**

```ts
export declare const number: Schema<number>
```

Added in v2.3.0

## string

**Signature**

```ts
export declare const string: Schema<string>
```

Added in v2.3.0

# utils

## TypeOf (type alias)

**Signature**

```ts
export type TypeOf<S> = S extends Schema<infer A> ? A : never
```

Added in v2.2.0

## interpreter

**Signature**

```ts
export declare function interpreter<S extends URIS2>(
  S: Schemable2C<S, unknown>
): <A>(schema: Schema<A>) => Kind2<S, unknown, A>
export declare function interpreter<S extends URIS>(S: Schemable1<S>): <A>(schema: Schema<A>) => Kind<S, A>
```

Added in v2.2.3
