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
  - [alt](#alt)
  - [array](#array)
  - [compose](#compose)
  - [id](#id)
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
  - [zero](#zero)
- [constructors](#constructors)
  - [literal](#literal)
- [instances](#instances)
  - [Schemable](#schemable)
  - [URI](#uri)
  - [URI (type alias)](#uri-type-alias)
  - [WithRefine](#withrefine)
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
- [utils](#utils)
  - [InputOf (type alias)](#inputof-type-alias)
  - [TypeOf (type alias)](#typeof-type-alias)

---

# combinators

## alt

**Signature**

```ts
export declare const alt: <I, A extends I>(that: () => Guard<I, A>) => (me: Guard<I, A>) => Guard<I, A>
```

Added in v2.2.8

## array

**Signature**

```ts
export declare const array: <A>(item: Guard<unknown, A>) => Guard<unknown, A[]>
```

Added in v2.2.0

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

## intersect

**Signature**

```ts
export declare const intersect: <B>(right: Guard<unknown, B>) => <A>(left: Guard<unknown, A>) => Guard<unknown, A & B>
```

Added in v2.2.0

## lazy

**Signature**

```ts
export declare const lazy: <A>(f: () => Guard<unknown, A>) => Guard<unknown, A>
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

## refine

**Signature**

```ts
export declare const refine: <I, A extends I, B extends A>(
  refinement: (a: A) => a is B
) => (from: Guard<I, A>) => Guard<I, B>
```

Added in v2.2.0

## sum

**Signature**

```ts
export declare const sum: <T extends string>(
  tag: T
) => <A>(members: { [K in keyof A]: Guard<unknown, A[K]> }) => Guard<unknown, A[keyof A]>
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

## type

**Signature**

```ts
export declare const type: <A>(
  properties: { [K in keyof A]: Guard<unknown, A[K]> }
) => Guard<unknown, { [K in keyof A]: A[K] }>
```

Added in v2.2.0

## union

**Signature**

```ts
export declare const union: <A extends readonly [unknown, ...unknown[]]>(
  ...members: { [K in keyof A]: Guard<unknown, A[K]> }
) => Guard<unknown, A[number]>
```

Added in v2.2.0

## zero

**Signature**

```ts
export declare const zero: <I, A extends I>() => Guard<I, A>
```

Added in v2.2.8

# constructors

## literal

**Signature**

```ts
export declare const literal: <A extends readonly [Literal, ...Literal[]]>(...values: A) => Guard<unknown, A[number]>
```

Added in v2.2.0

# instances

## Schemable

**Signature**

```ts
export declare const Schemable: Schemable1<'io-ts/Guard'>
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

## WithRefine

**Signature**

```ts
export declare const WithRefine: WithRefine1<'io-ts/Guard'>
```

Added in v2.2.8

## WithUnion

**Signature**

```ts
export declare const WithUnion: WithUnion1<'io-ts/Guard'>
```

Added in v2.2.8

## WithUnknownContainers

**Signature**

```ts
export declare const WithUnknownContainers: WithUnknownContainers1<'io-ts/Guard'>
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

Note: `NaN` is excluded.

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

# utils

## InputOf (type alias)

**Signature**

```ts
export type InputOf<G> = G extends Guard<infer I, any> ? I : never
```

Added in v2.2.8

## TypeOf (type alias)

**Signature**

```ts
export type TypeOf<G> = G extends Guard<any, infer A> ? A : never
```

Added in v2.2.2
