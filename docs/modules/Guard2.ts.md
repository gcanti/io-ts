---
title: Guard2.ts
nav_order: 11
parent: Modules
---

## Guard2 overview

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
  - [nullable](#nullable)
  - [partial](#partial)
  - [record](#record)
  - [struct](#struct)
  - [sum](#sum)
  - [tuple](#tuple)
  - [union](#union)
- [constructors](#constructors)
  - [literal](#literal)
- [instance operations](#instance-operations)
  - [compose](#compose)
  - [id](#id)
- [instances](#instances)
  - [Schemable](#schemable)
  - [WithUnion](#withunion)
  - [WithUnknownContainers](#withunknowncontainers)
- [model](#model)
  - [Guard (interface)](#guard-interface)
- [primitives](#primitives)
  - [UnknownArray](#unknownarray)
  - [UnknownRecord](#unknownrecord)
  - [boolean](#boolean)
  - [number](#number)
  - [string](#string)

---

# combinators

## array

**Signature**

```ts
export declare const array: <A>(item: Guard<unknown, A>) => Guard<unknown, A[]>
```

Added in v2.2.0

## intersect

**Signature**

```ts
export declare const intersect: <B>(right: Guard<unknown, B>) => <A>(left: Guard<unknown, A>) => Guard<unknown, A & B>
```

Added in v2.2.0

## lazy

**Signature**

```ts
export declare const lazy: <I, A extends I>(f: () => Guard<I, A>) => Guard<I, A>
```

Added in v2.2.0

## nullable

**Signature**

```ts
export declare const nullable: <I, A extends I>(or: Guard<I, A>) => Guard<I, A>
```

Added in v2.2.0

## partial

**Signature**

```ts
export declare const partial: <A>(
  properties: { [K in keyof A]: Guard<unknown, A[K]> }
) => Guard<unknown, Partial<{ [K in keyof A]: A[K] }>>
```

Added in v2.2.0

## record

**Signature**

```ts
export declare const record: <A>(codomain: Guard<unknown, A>) => Guard<unknown, Record<string, A>>
```

Added in v2.2.0

## struct

**Signature**

```ts
export declare const struct: <A>(
  properties: { [K in keyof A]: Guard<unknown, A[K]> }
) => Guard<unknown, { [K in keyof A]: A[K] }>
```

Added in v2.2.15

## sum

**Signature**

```ts
export declare const sum: <T extends string>(
  tag: T
) => <A>(members: { [K in keyof A]: Guard<unknown, A[K] & Record<T, K>> }) => Guard<unknown, A[keyof A]>
```

Added in v2.2.0

## tuple

**Signature**

```ts
export declare const tuple: <A extends readonly unknown[]>(
  ...components: { [K in keyof A]: Guard<unknown, A[K]> }
) => Guard<unknown, A>
```

Added in v2.2.0

## union

**Signature**

```ts
export declare const union: <A extends readonly unknown[]>(
  ...members: { [K in keyof A]: Guard<unknown, A[K]> }
) => Guard<unknown, A[number]>
```

Added in v2.2.0

# constructors

## literal

**Signature**

```ts
export declare const literal: <A extends ReadonlyNonEmptyArray<Literal>>(...values: A) => Guard<unknown, A[number]>
```

Added in v2.2.0

# instance operations

## compose

**Signature**

```ts
export declare const compose: <I, A extends I, B extends A>(to: Guard<A, B>) => (from: Guard<I, A>) => Guard<I, B>
```

Added in v2.2.8

## id

**Signature**

```ts
export declare const id: <A>() => Guard<A, A>
```

Added in v2.2.8

# instances

## Schemable

**Signature**

```ts
export declare const Schemable: Schemable1<'io-ts/ToGuard'>
```

Added in v2.2.8

## WithUnion

**Signature**

```ts
export declare const WithUnion: WithUnion1<'io-ts/ToGuard'>
```

Added in v2.2.8

## WithUnknownContainers

**Signature**

```ts
export declare const WithUnknownContainers: WithUnknownContainers1<'io-ts/ToGuard'>
```

Added in v2.2.8

# model

## Guard (interface)

**Signature**

```ts
export interface Guard<I, A extends I> {
  is: (i: I) => i is A
}
```

Added in v2.2.8

# primitives

## UnknownArray

**Signature**

```ts
export declare const UnknownArray: Guard<unknown, unknown[]>
```

Added in v2.2.0

## UnknownRecord

**Signature**

```ts
export declare const UnknownRecord: Guard<unknown, Record<string, unknown>>
```

Added in v2.2.0

## boolean

**Signature**

```ts
export declare const boolean: Guard<unknown, boolean>
```

Added in v2.2.0

## number

**Signature**

```ts
export declare const number: Guard<unknown, number>
```

Added in v2.2.0

## string

**Signature**

```ts
export declare const string: Guard<unknown, string>
```

Added in v2.2.0
