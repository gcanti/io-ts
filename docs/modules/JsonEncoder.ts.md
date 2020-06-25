---
title: JsonEncoder.ts
nav_order: 10
parent: Modules
---

## JsonEncoder overview

Added in v2.2.3

---

<h2 class="text-delta">Table of contents</h2>

- [Contravariant](#contravariant)
  - [contramap](#contramap)
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
  - [URI](#uri)
  - [URI (type alias)](#uri-type-alias)
  - [contravariantJsonEncoder](#contravariantjsonencoder)
  - [schemableJsonEncoder](#schemablejsonencoder)
- [model](#model)
  - [Json (type alias)](#json-type-alias)
  - [JsonArray (interface)](#jsonarray-interface)
  - [JsonEncoder (interface)](#jsonencoder-interface)
  - [JsonRecord (interface)](#jsonrecord-interface)
- [primitives](#primitives)
  - [id](#id)
- [utils](#utils)
  - [TypeOf (type alias)](#typeof-type-alias)

---

# Contravariant

## contramap

**Signature**

```ts
export declare const contramap: <A, B>(f: (b: B) => A) => (fa: JsonEncoder<A>) => JsonEncoder<B>
```

Added in v2.2.3

# combinators

## array

**Signature**

```ts
export declare const array: <A>(items: JsonEncoder<A>) => JsonEncoder<A[]>
```

Added in v2.2.3

## intersect

**Signature**

```ts
export declare const intersect: <B>(right: JsonEncoder<B>) => <A>(left: JsonEncoder<A>) => JsonEncoder<A & B>
```

Added in v2.2.3

## lazy

**Signature**

```ts
export declare const lazy: <A>(f: () => JsonEncoder<A>) => JsonEncoder<A>
```

Added in v2.2.3

## nullable

**Signature**

```ts
export declare const nullable: <A>(or: JsonEncoder<A>) => JsonEncoder<A>
```

Added in v2.2.3

## partial

**Signature**

```ts
export declare const partial: <A>(
  properties: { [K in keyof A]: JsonEncoder<A[K]> }
) => JsonEncoder<Partial<{ [K in keyof A]: A[K] }>>
```

Added in v2.2.3

## record

**Signature**

```ts
export declare const record: <A>(codomain: JsonEncoder<A>) => JsonEncoder<Record<string, A>>
```

Added in v2.2.3

## sum

**Signature**

```ts
export declare const sum: <T extends string>(
  tag: T
) => <A>(members: { [K in keyof A]: JsonEncoder<A[K]> }) => JsonEncoder<A[keyof A]>
```

Added in v2.2.3

## tuple

**Signature**

```ts
export declare const tuple: <A extends readonly unknown[]>(
  ...components: { [K in keyof A]: JsonEncoder<A[K]> }
) => JsonEncoder<A>
```

Added in v2.2.3

## type

**Signature**

```ts
export declare const type: <A>(
  properties: { [K in keyof A]: JsonEncoder<A[K]> }
) => JsonEncoder<{ [K in keyof A]: A[K] }>
```

Added in v2.2.3

# instances

## URI

**Signature**

```ts
export declare const URI: 'io-ts/JsonEncoder'
```

Added in v2.2.3

## URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

Added in v2.2.3

## contravariantJsonEncoder

**Signature**

```ts
export declare const contravariantJsonEncoder: Contravariant1<'io-ts/JsonEncoder'>
```

Added in v2.2.3

## schemableJsonEncoder

**Signature**

```ts
export declare const schemableJsonEncoder: Schemable1<'io-ts/JsonEncoder'>
```

Added in v2.2.3

# model

## Json (type alias)

**Signature**

```ts
export type Json = null | string | number | boolean | JsonRecord | JsonArray
```

Added in v2.2.3

## JsonArray (interface)

**Signature**

```ts
export interface JsonArray extends ReadonlyArray<Json> {}
```

Added in v2.2.3

## JsonEncoder (interface)

**Signature**

```ts
export interface JsonEncoder<A> {
  readonly encode: (a: A) => Json
}
```

Added in v2.2.3

## JsonRecord (interface)

**Signature**

```ts
export interface JsonRecord {
  [key: string]: Json
}
```

Added in v2.2.3

# primitives

## id

**Signature**

```ts
export declare function id<A extends Json>(): JsonEncoder<A>
```

Added in v2.2.5

# utils

## TypeOf (type alias)

**Signature**

```ts
export type TypeOf<E> = E.TypeOf<E>
```

Added in v2.2.3
