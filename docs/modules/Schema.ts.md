---
title: Schema.ts
nav_order: 12
parent: Modules
---

## Schema overview

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
export declare function interpreter<S extends URIS>(S: Schemable1<S>): <A>(schema: Schema<A>) => Kind<S, A>
```

Added in v2.2.3
