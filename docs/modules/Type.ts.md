---
title: Type.ts
nav_order: 17
parent: Modules
---

## Type overview

**This module is experimental**

Experimental features are published in order to get early feedback from the community, see these tracking
[issues](https://github.com/gcanti/io-ts/issues?q=label%3Av2.2+) for further discussions and enhancements.

A feature tagged as _Experimental_ is in a high state of flux, you're at risk of it changing without notice.

Added in v2.2.3

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
  - [Type (interface)](#type-interface)
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
export declare const array: <A>(item: Type<A>) => Type<A[]>
```

Added in v2.2.3

## intersect

**Signature**

```ts
export declare const intersect: <B>(right: Type<B>) => <A>(left: Type<A>) => Type<A & B>
```

Added in v2.2.3

## lazy

**Signature**

```ts
export declare const lazy: <A>(id: string, f: () => Type<A>) => Type<A>
```

Added in v2.2.3

## nullable

**Signature**

```ts
export declare const nullable: <A>(or: Type<A>) => Type<A>
```

Added in v2.2.3

## partial

**Signature**

```ts
export declare const partial: <A>(properties: { [K in keyof A]: Type<A[K]> }) => Type<Partial<{ [K in keyof A]: A[K] }>>
```

Added in v2.2.3

## record

**Signature**

```ts
export declare const record: <A>(codomain: Type<A>) => Type<Record<string, A>>
```

Added in v2.2.3

## refine

**Signature**

```ts
export declare const refine: <A, B extends A>(refinement: (a: A) => a is B, id: string) => (from: Type<A>) => Type<B>
```

Added in v2.2.3

## sum

**Signature**

```ts
export declare const sum: <T extends string>(
  _tag: T
) => <A>(members: { [K in keyof A]: Type<A[K]> }) => Type<A[keyof A]>
```

Added in v2.2.3

## tuple

**Signature**

```ts
export declare const tuple: <A extends readonly unknown[]>(...components: { [K in keyof A]: Type<A[K]> }) => Type<A>
```

Added in v2.2.3

## type

**Signature**

```ts
export declare const type: <A>(properties: { [K in keyof A]: Type<A[K]> }) => Type<{ [K in keyof A]: A[K] }>
```

Added in v2.2.3

## union

**Signature**

```ts
export declare const union: <A extends readonly [unknown, ...unknown[]]>(
  ...members: { [K in keyof A]: Type<A[K]> }
) => Type<A[number]>
```

Added in v2.2.3

# constructors

## literal

**Signature**

```ts
export declare const literal: <A extends readonly [Literal, ...Literal[]]>(...values: A) => Type<A[number]>
```

Added in v2.2.3

# instances

## Schemable

**Signature**

```ts
export declare const Schemable: Schemable1<'io-ts/Type'> &
  WithUnknownContainers1<'io-ts/Type'> &
  WithUnion1<'io-ts/Type'> &
  WithRefine1<'io-ts/Type'>
```

Added in v2.2.8

## URI

**Signature**

```ts
export declare const URI: 'io-ts/Type'
```

Added in v2.2.3

## URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

Added in v2.2.3

# model

## Type (interface)

**Signature**

```ts
export interface Type<A> extends t.Type<A, unknown, unknown> {}
```

Added in v2.2.3

# primitives

## UnknownArray

**Signature**

```ts
export declare const UnknownArray: Type<unknown[]>
```

Added in v2.2.3

## UnknownRecord

**Signature**

```ts
export declare const UnknownRecord: Type<Record<string, unknown>>
```

Added in v2.2.3

## boolean

**Signature**

```ts
export declare const boolean: Type<boolean>
```

Added in v2.2.3

## number

**Signature**

```ts
export declare const number: Type<number>
```

Added in v2.2.3

## string

**Signature**

```ts
export declare const string: Type<string>
```

Added in v2.2.3
