---
title: Eq.ts
nav_order: 5
parent: Modules
---

## Eq overview

**This module is experimental**

Experimental features are published in order to get early feedback from the community, see these tracking
[issues](https://github.com/gcanti/io-ts/issues?q=label%3Av2.2+) for further discussions and enhancements.

A feature tagged as _Experimental_ is in a high state of flux, you're at risk of it changing without notice.

Added in v2.2.2

---

<h2 class="text-delta">Table of contents</h2>

- [combinators](#combinators)
  - [array](#array)
  - [intersect](#intersect)
  - [lazy](#lazy)
  - [nullable](#nullable)
  - [partial](#partial)
  - [record](#record)
  - [sum](#sum)
  - [tuple](#tuple)
  - [type](#type)
- [instances](#instances)
  - [Schemable](#schemable)
  - [WithRefine](#withrefine)
  - [WithUnknownContainers](#withunknowncontainers)
- [primitives](#primitives)
  - [UnknownArray](#unknownarray)
  - [UnknownRecord](#unknownrecord)
  - [boolean](#boolean)
  - [number](#number)
  - [string](#string)
- [utils](#utils)
  - [TypeOf (type alias)](#typeof-type-alias)
  - [URI (type alias)](#uri-type-alias)

---

# combinators

## array

**Signature**

```ts
export declare const array: <A>(eq: E.Eq<A>) => E.Eq<A[]>
```

Added in v2.2.2

## intersect

**Signature**

```ts
export declare const intersect: <B>(right: E.Eq<B>) => <A>(left: E.Eq<A>) => E.Eq<A & B>
```

Added in v2.2.2

## lazy

**Signature**

```ts
export declare function lazy<A>(f: () => Eq<A>): Eq<A>
```

Added in v2.2.2

## nullable

**Signature**

```ts
export declare function nullable<A>(or: Eq<A>): Eq<null | A>
```

Added in v2.2.2

## partial

**Signature**

```ts
export declare function partial<A>(properties: { [K in keyof A]: Eq<A[K]> }): Eq<Partial<{ [K in keyof A]: A[K] }>>
```

Added in v2.2.2

## record

**Signature**

```ts
export declare const record: <A>(codomain: E.Eq<A>) => E.Eq<Record<string, A>>
```

Added in v2.2.2

## sum

**Signature**

```ts
export declare function sum<T extends string>(
  tag: T
): <A>(members: { [K in keyof A]: Eq<A[K] & Record<T, K>> }) => Eq<A[keyof A]>
```

Added in v2.2.2

## tuple

**Signature**

```ts
export declare const tuple: <A extends readonly unknown[]>(...components: { [K in keyof A]: E.Eq<A[K]> }) => E.Eq<A>
```

Added in v2.2.2

## type

**Signature**

```ts
export declare const type: <A>(eqs: { [K in keyof A]: E.Eq<A[K]> }) => E.Eq<{ [K in keyof A]: A[K] }>
```

Added in v2.2.2

# instances

## Schemable

**Signature**

```ts
export declare const Schemable: Schemable1<'Eq'>
```

Added in v2.2.8

## WithRefine

**Signature**

```ts
export declare const WithRefine: WithRefine1<'Eq'>
```

Added in v2.2.8

## WithUnknownContainers

**Signature**

```ts
export declare const WithUnknownContainers: WithUnknownContainers1<'Eq'>
```

Added in v2.2.8

# primitives

## UnknownArray

**Signature**

```ts
export declare const UnknownArray: E.Eq<unknown[]>
```

Added in v2.2.2

## UnknownRecord

**Signature**

```ts
export declare const UnknownRecord: E.Eq<Record<string, unknown>>
```

Added in v2.2.2

## boolean

**Signature**

```ts
export declare const boolean: E.Eq<boolean>
```

Added in v2.2.2

## number

**Signature**

```ts
export declare const number: E.Eq<number>
```

Added in v2.2.2

## string

**Signature**

```ts
export declare const string: E.Eq<string>
```

Added in v2.2.2

# utils

## TypeOf (type alias)

**Signature**

```ts
export type TypeOf<E> = E extends Eq<infer A> ? A : never
```

Added in v2.2.2

## URI (type alias)

**Signature**

```ts
export type URI = E.URI
```

Added in v2.2.3
