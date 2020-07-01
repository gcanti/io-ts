---
title: Guard.ts
nav_order: 7
parent: Modules
---

## Guard overview

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
  - [refine](#refine)
  - [sum](#sum)
  - [tuple](#tuple)
  - [type](#type)
  - [union](#union)
- [constructors](#constructors)
  - [literal](#literal)
- [instances](#instances)
  - [Schemable](#schemable)
  - [URI](#uri)
  - [URI (type alias)](#uri-type-alias)
- [model](#model)
  - [Guard (interface)](#guard-interface)
- [primitives](#primitives)
  - [UnknownArray](#unknownarray)
  - [UnknownRecord](#unknownrecord)
  - [boolean](#boolean)
  - [number](#number)
  - [string](#string)
- [utils](#utils)
  - [TypeOf (type alias)](#typeof-type-alias)

---

# combinators

## array

**Signature**

```ts
export declare const array: <A>(item: Guard<A>) => Guard<A[]>
```

Added in v2.2.0

## intersect

**Signature**

```ts
export declare const intersect: <B>(right: Guard<B>) => <A>(left: Guard<A>) => Guard<A & B>
```

Added in v2.2.0

## lazy

**Signature**

```ts
export declare const lazy: <A>(f: () => Guard<A>) => Guard<A>
```

Added in v2.2.0

## nullable

**Signature**

```ts
export declare const nullable: <A>(or: Guard<A>) => Guard<A>
```

Added in v2.2.0

## partial

**Signature**

```ts
export declare const partial: <A>(
  properties: { [K in keyof A]: Guard<A[K]> }
) => Guard<Partial<{ [K in keyof A]: A[K] }>>
```

Added in v2.2.0

## record

**Signature**

```ts
export declare const record: <A>(codomain: Guard<A>) => Guard<Record<string, A>>
```

Added in v2.2.0

## refine

**Signature**

```ts
export declare const refine: <A, B extends A>(refinement: (a: A) => a is B) => (from: Guard<A>) => Guard<B>
```

Added in v2.2.0

## sum

**Signature**

```ts
export declare const sum: <T extends string>(
  tag: T
) => <A>(members: { [K in keyof A]: Guard<A[K]> }) => Guard<A[keyof A]>
```

Added in v2.2.0

## tuple

**Signature**

```ts
export declare const tuple: <A extends readonly unknown[]>(...components: { [K in keyof A]: Guard<A[K]> }) => Guard<A>
```

Added in v2.2.0

## type

**Signature**

```ts
export declare const type: <A>(properties: { [K in keyof A]: Guard<A[K]> }) => Guard<{ [K in keyof A]: A[K] }>
```

Added in v2.2.0

## union

**Signature**

```ts
export declare const union: <A extends readonly [unknown, ...unknown[]]>(
  ...members: { [K in keyof A]: Guard<A[K]> }
) => Guard<A[number]>
```

Added in v2.2.0

# constructors

## literal

**Signature**

```ts
export declare const literal: <A extends readonly [Literal, ...Literal[]]>(...values: A) => Guard<A[number]>
```

Added in v2.2.0

# instances

## Schemable

**Signature**

```ts
export declare const Schemable: Schemable1<'io-ts/Guard'> &
  WithUnknownContainers1<'io-ts/Guard'> &
  WithUnion1<'io-ts/Guard'> &
  WithRefine1<'io-ts/Guard'>
```

Added in v2.2.8

## URI

**Signature**

```ts
export declare const URI: 'io-ts/Guard'
```

Added in v2.2.0

## URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

Added in v2.2.0

# model

## Guard (interface)

**Signature**

```ts
export interface Guard<A> {
  is: (u: unknown) => u is A
}
```

Added in v2.2.0

# primitives

## UnknownArray

**Signature**

```ts
export declare const UnknownArray: Guard<unknown[]>
```

Added in v2.2.0

## UnknownRecord

**Signature**

```ts
export declare const UnknownRecord: Guard<Record<string, unknown>>
```

Added in v2.2.0

## boolean

**Signature**

```ts
export declare const boolean: Guard<boolean>
```

Added in v2.2.0

## number

Note: `NaN` is excluded.

**Signature**

```ts
export declare const number: Guard<number>
```

Added in v2.2.0

## string

**Signature**

```ts
export declare const string: Guard<string>
```

Added in v2.2.0

# utils

## TypeOf (type alias)

**Signature**

```ts
export type TypeOf<G> = G extends Guard<infer A> ? A : never
```

Added in v2.2.2
