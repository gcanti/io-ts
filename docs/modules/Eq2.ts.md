---
title: Eq2.ts
nav_order: 8
parent: Modules
---

## Eq2 overview

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
  - [struct](#struct)
  - [sum](#sum)
  - [tuple](#tuple)
- [instances](#instances)
  - [Schemable](#schemable)
  - [WithUnknownContainers](#withunknowncontainers)
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
export declare const array: <A>(item: E.Eq<A>) => E.Eq<A[]>
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
export declare const nullable: <A>(or: E.Eq<A>) => E.Eq<A>
```

Added in v2.2.2

## partial

**Signature**

```ts
export declare const partial: <A>(properties: { [K in keyof A]: E.Eq<A[K]> }) => E.Eq<Partial<{ [K in keyof A]: A[K] }>>
```

Added in v2.2.2

## record

**Signature**

```ts
export declare const record: <A>(codomain: E.Eq<A>) => E.Eq<Record<string, A>>
```

Added in v2.2.2

## struct

**Signature**

```ts
export declare const struct: <A>(properties: { [K in keyof A]: E.Eq<A[K]> }) => E.Eq<{ [K in keyof A]: A[K] }>
```

Added in v2.2.15

## sum

**Signature**

```ts
export declare const sum: <T extends string>(
  tag: T
) => <A>(members: { [K in keyof A]: E.Eq<A[K] & Record<T, K>> }) => E.Eq<A[keyof A]>
```

Added in v2.2.2

## tuple

**Signature**

```ts
export declare const tuple: <A extends readonly unknown[]>(...components: { [K in keyof A]: E.Eq<A[K]> }) => E.Eq<A>
```

Added in v2.2.2

# instances

## Schemable

**Signature**

```ts
export declare const Schemable: Schemable1<'io-ts/ToEq'>
```

Added in v2.2.8

## WithUnknownContainers

**Signature**

```ts
export declare const WithUnknownContainers: WithUnknownContainers1<'io-ts/ToEq'>
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
