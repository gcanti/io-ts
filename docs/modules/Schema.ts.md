---
title: Schema.ts
nav_order: 14
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

- [constructors](#constructors)
  - [make](#make)
- [model](#model)
  - [Schema (interface)](#schema-interface)
- [utils](#utils)
  - [TypeOf (type alias)](#typeof-type-alias)
  - [interpreter](#interpreter)

---

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
export declare const interpreter: {
  <
    S extends
      | 'io-ts/Codec'
      | 'Either'
      | 'io-ts/Decoder'
      | 'io-ts/Encoder'
      | 'io-ts/TaskDecoder'
      | 'IOEither'
      | 'TaskEither'
  >(
    S: Schemable2C<S, unknown>
  ): <A>(schema: Schema<A>) => Kind2<S, unknown, A>
  <
    S extends
      | 'Eq'
      | 'io-ts/Guard'
      | 'io-ts/JsonCodec'
      | 'io-ts/JsonEncoder'
      | 'io-ts/Type'
      | 'Ord'
      | 'Option'
      | 'ReadonlyRecord'
      | 'ReadonlyNonEmptyArray'
      | 'NonEmptyArray'
      | 'Array'
      | 'Record'
      | 'IO'
      | 'Task'
  >(
    S: Schemable1<S>
  ): <A>(schema: Schema<A>) => Kind<S, A>
}
```

Added in v2.2.3
