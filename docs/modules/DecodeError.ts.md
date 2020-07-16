---
title: DecodeError.ts
nav_order: 2
parent: Modules
---

## DecodeError overview

**This module is experimental**

Experimental features are published in order to get early feedback from the community, see these tracking
[issues](https://github.com/gcanti/io-ts/issues?q=label%3Av2.2+) for further discussions and enhancements.

A feature tagged as _Experimental_ is in a high state of flux, you're at risk of it changing without notice.

Added in v2.2.7

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [index](#index)
  - [key](#key)
  - [lazy](#lazy)
  - [leaf](#leaf)
  - [member](#member)
  - [wrap](#wrap)
- [destructors](#destructors)
  - [fold](#fold)
- [instances](#instances)
  - [getSemigroup](#getsemigroup)
- [model](#model)
  - [DecodeError (type alias)](#decodeerror-type-alias)
  - [Index (interface)](#index-interface)
  - [Key (interface)](#key-interface)
  - [Kind (type alias)](#kind-type-alias)
  - [Lazy (interface)](#lazy-interface)
  - [Leaf (interface)](#leaf-interface)
  - [Member (interface)](#member-interface)
  - [Wrap (interface)](#wrap-interface)
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

## lazy

**Signature**

```ts
export declare const lazy: <E>(id: string, errors: FS.FreeSemigroup<DecodeError<E>>) => DecodeError<E>
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

## wrap

**Signature**

```ts
export declare const wrap: <E>(error: E, errors: FS.FreeSemigroup<DecodeError<E>>) => DecodeError<E>
```

Added in v2.2.9

# destructors

## fold

**Signature**

```ts
export declare const fold: <E, R>(patterns: {
  Leaf: (input: unknown, error: E) => R
  Key: (key: string, kind: Kind, errors: FS.FreeSemigroup<DecodeError<E>>) => R
  Index: (index: number, kind: Kind, errors: FS.FreeSemigroup<DecodeError<E>>) => R
  Member: (index: number, errors: FS.FreeSemigroup<DecodeError<E>>) => R
  Lazy: (id: string, errors: FS.FreeSemigroup<DecodeError<E>>) => R
  Wrap: (error: E, errors: FS.FreeSemigroup<DecodeError<E>>) => R
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
export type DecodeError<E> = Leaf<E> | Key<E> | Index<E> | Member<E> | Lazy<E> | Wrap<E>
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

## Lazy (interface)

**Signature**

```ts
export interface Lazy<E> {
  readonly _tag: 'Lazy'
  readonly id: string
  readonly errors: FS.FreeSemigroup<DecodeError<E>>
}
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

## Wrap (interface)

**Signature**

```ts
export interface Wrap<E> {
  readonly _tag: 'Wrap'
  readonly error: E
  readonly errors: FS.FreeSemigroup<DecodeError<E>>
}
```

Added in v2.2.9

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
