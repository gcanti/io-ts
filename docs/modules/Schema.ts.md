---
title: Schema.ts
nav_order: 9
parent: Modules
---

# Schema overview

Added in v2.2.0

---

<h2 class="text-delta">Table of contents</h2>

- [Schema (interface)](#schema-interface)
- [TypeOf (type alias)](#typeof-type-alias)
- [make](#make)

---

# Schema (interface)

**Signature**

```ts
export interface Schema<A> {
  <S extends URIS>(S: Schemable<S>): Kind<S, A>
}
```

Added in v2.2.0

# TypeOf (type alias)

**Signature**

```ts
export type TypeOf<S> = S extends Schema<infer A> ? A : never
```

Added in v2.2.0

# make

**Signature**

```ts
export declare function make<A>(f: Schema<A>): Schema<A>
```

Added in v2.2.0
