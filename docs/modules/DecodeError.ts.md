---
title: DecodeError.ts
nav_order: 2
parent: Modules
---

## DecodeError overview

Added in v2.2.7

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [leaf](#leaf)
  - [required](#required)
- [destructors](#destructors)
  - [fold](#fold)
- [instances](#instances)
  - [getSemigroup](#getsemigroup)
- [model](#model)
  - [DecodeError (type alias)](#decodeerror-type-alias)
  - [Leaf (interface)](#leaf-interface)
  - [Required (interface)](#required-interface)

---

# constructors

## leaf

**Signature**

```ts
export declare const leaf: <E>(input: unknown, error: E) => DecodeError<E>
```

Added in v2.2.7

## required

**Signature**

```ts
export declare const required: <E>(key: string, errors: FS.FreeSemigroup<DecodeError<E>>) => DecodeError<E>
```

Added in v2.2.7

# destructors

## fold

**Signature**

```ts
export declare const fold: <E, R>(patterns: {
  Leaf: (input: unknown, error: E) => R
  Required: (k: string, errors: FS.FreeSemigroup<DecodeError<E>>) => R
}) => (e: DecodeError<E>) => R
```

Added in v2.2.7

# instances

## getSemigroup

**Signature**

```ts
export declare function getSemigroup<E = never>(): Semigroup<FS.FreeSemigroup<DecodeError<E>>>
```

Added in v2.2.7

# model

## DecodeError (type alias)

**Signature**

```ts
export type DecodeError<E> = Leaf<E> | Required<E>
```

Added in v2.2.7

## Leaf (interface)

**Signature**

```ts
export interface Leaf<E> {
  readonly _tag: 'Leaf'
  readonly input: unknown
  readonly error: E
}
```

Added in v2.2.7

## Required (interface)

**Signature**

```ts
export interface Required<E> {
  readonly _tag: 'Required'
  readonly key: string
  readonly errors: FS.FreeSemigroup<DecodeError<E>>
}
```

Added in v2.2.7
