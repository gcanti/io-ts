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
  - [index](#index)
  - [key](#key)
  - [leaf](#leaf)
  - [member](#member)
- [destructors](#destructors)
  - [fold](#fold)
- [instances](#instances)
  - [getSemigroup](#getsemigroup)
- [model](#model)
  - [DecodeError (type alias)](#decodeerror-type-alias)
  - [Index (interface)](#index-interface)
  - [Key (interface)](#key-interface)
  - [Kind (type alias)](#kind-type-alias)
  - [Leaf (interface)](#leaf-interface)
  - [Member (interface)](#member-interface)
  - [optional](#optional)
  - [required](#required)

---

# constructors

## index

**Signature**

```ts
export declare const index: <E>(index: number, kind: Kind, errors: FS.FreeSemigroup<DecodeError<E>>) => DecodeError<E>
```

Added in v2.2.7

## key

**Signature**

```ts
export declare const key: <E>(key: string, kind: Kind, errors: FS.FreeSemigroup<DecodeError<E>>) => DecodeError<E>
```

Added in v2.2.7

## leaf

**Signature**

```ts
export declare const leaf: <E>(actual: unknown, error: E) => DecodeError<E>
```

Added in v2.2.7

## member

**Signature**

```ts
export declare const member: <E>(index: number, errors: FS.FreeSemigroup<DecodeError<E>>) => DecodeError<E>
```

Added in v2.2.7

# destructors

## fold

**Signature**

```ts
export declare const fold: <E, R>(patterns: {
  Leaf: (input: unknown, error: E) => R
  Key: (key: string, kind: Kind, errors: FS.FreeSemigroup<DecodeError<E>>) => R
  Index: (index: number, kind: Kind, errors: FS.FreeSemigroup<DecodeError<E>>) => R
  Member: (index: number, errors: FS.FreeSemigroup<DecodeError<E>>) => R
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
export type DecodeError<E> = Leaf<E> | Key<E> | Index<E> | Member<E>
```

Added in v2.2.7

## Index (interface)

**Signature**

```ts
export interface Index<E> {
  readonly _tag: 'Index'
  readonly index: number
  readonly kind: Kind
  readonly errors: FS.FreeSemigroup<DecodeError<E>>
}
```

Added in v2.2.7

## Key (interface)

**Signature**

```ts
export interface Key<E> {
  readonly _tag: 'Key'
  readonly key: string
  readonly kind: Kind
  readonly errors: FS.FreeSemigroup<DecodeError<E>>
}
```

Added in v2.2.7

## Kind (type alias)

**Signature**

```ts
export type Kind = 'required' | 'optional'
```

Added in v2.2.7

## Leaf (interface)

**Signature**

```ts
export interface Leaf<E> {
  readonly _tag: 'Leaf'
  readonly actual: unknown
  readonly error: E
}
```

Added in v2.2.7

## Member (interface)

**Signature**

```ts
export interface Member<E> {
  readonly _tag: 'Member'
  readonly index: number
  readonly errors: FS.FreeSemigroup<DecodeError<E>>
}
```

Added in v2.2.7

## optional

**Signature**

```ts
export declare const optional: 'optional'
```

Added in v2.2.7

## required

**Signature**

```ts
export declare const required: 'required'
```

Added in v2.2.7
