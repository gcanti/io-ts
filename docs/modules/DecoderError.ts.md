---
title: DecoderError.ts
nav_order: 3
parent: Modules
---

## DecoderError overview

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
export declare const leaf: (input: unknown, error: string) => DecodeError
```

Added in v2.2.7

## required

**Signature**

```ts
export declare const required: (key: string, errors: FS.FreeSemigroup<DecodeError>) => DecodeError
```

Added in v2.2.7

# destructors

## fold

**Signature**

```ts
export declare const fold: <R>(patterns: {
  Leaf: (input: unknown, error: string) => R
  Required: (k: string, errors: FS.FreeSemigroup<DecodeError>) => R
}) => (e: DecodeError) => R
```

Added in v2.2.7

# instances

## getSemigroup

**Signature**

```ts
export declare function getSemigroup(): Semigroup<FS.FreeSemigroup<DecodeError>>
```

Added in v2.2.7

# model

## DecodeError (type alias)

**Signature**

```ts
export type DecodeError = Leaf | Required
```

Added in v2.2.7

## Leaf (interface)

**Signature**

```ts
export interface Leaf {
  readonly _tag: 'Leaf'
  readonly input: unknown
  readonly error: string
}
```

Added in v2.2.7

## Required (interface)

**Signature**

```ts
export interface Required {
  readonly _tag: 'Required'
  readonly key: string
  readonly errors: FS.FreeSemigroup<DecodeError>
}
```

Added in v2.2.7
