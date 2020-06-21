---
title: FreeSemigroup.ts
nav_order: 8
parent: Modules
---

## FreeSemigroup overview

Added in v2.2.7

---

<h2 class="text-delta">Table of contents</h2>

- [consrtuctors](#consrtuctors)
  - [concat](#concat)
  - [of](#of)
- [destructors](#destructors)
  - [fold](#fold)
- [instances](#instances)
  - [getSemigroup](#getsemigroup)
- [model](#model)
  - [Concat (interface)](#concat-interface)
  - [FreeSemigroup (type alias)](#freesemigroup-type-alias)
  - [Of (interface)](#of-interface)

---

# consrtuctors

## concat

**Signature**

```ts
export declare const concat: <A>(left: FreeSemigroup<A>, right: FreeSemigroup<A>) => FreeSemigroup<A>
```

Added in v2.2.7

## of

**Signature**

```ts
export declare const of: <A>(a: A) => FreeSemigroup<A>
```

Added in v2.2.7

# destructors

## fold

**Signature**

```ts
export declare const fold: <A, R>(
  onOf: (value: A) => R,
  onConcat: (left: FreeSemigroup<A>, right: FreeSemigroup<A>) => R
) => (f: FreeSemigroup<A>) => R
```

Added in v2.2.7

# instances

## getSemigroup

**Signature**

```ts
export declare function getSemigroup<A = never>(): Semigroup<FreeSemigroup<A>>
```

Added in v2.2.7

# model

## Concat (interface)

**Signature**

```ts
export interface Concat<A> {
  readonly _tag: 'Concat'
  readonly left: FreeSemigroup<A>
  readonly right: FreeSemigroup<A>
}
```

Added in v2.2.7

## FreeSemigroup (type alias)

**Signature**

```ts
export type FreeSemigroup<A> = Of<A> | Concat<A>
```

Added in v2.2.7

## Of (interface)

**Signature**

```ts
export interface Of<A> {
  readonly _tag: 'Of'
  readonly value: A
}
```

Added in v2.2.7
