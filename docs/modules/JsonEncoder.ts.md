---
title: JsonEncoder.ts
nav_order: 8
parent: Modules
---

# JsonEncoder overview

Added in v2.2.3

---

<h2 class="text-delta">Table of contents</h2>

- [JsonArray (interface)](#jsonarray-interface)
- [JsonEncoder (interface)](#jsonencoder-interface)
- [Json (type alias)](#json-type-alias)
- [JsonObject (type alias)](#jsonobject-type-alias)
- [TypeOf (type alias)](#typeof-type-alias)
- [URI (type alias)](#uri-type-alias)
- [URI](#uri)
- [array](#array)
- [contramap](#contramap)
- [contravariantJsonEncoder](#contravariantjsonencoder)
- [id](#id)
- [intersection](#intersection)
- [lazy](#lazy)
- [nullable](#nullable)
- [partial](#partial)
- [record](#record)
- [schemableJsonEncoder](#schemablejsonencoder)
- [sum](#sum)
- [tuple](#tuple)
- [type](#type)

---

# JsonArray (interface)

**Signature**

```ts
export interface JsonArray extends Array<Json> {}
```

Added in v2.2.3

# JsonEncoder (interface)

**Signature**

```ts
export interface JsonEncoder<A> {
  readonly encode: (a: A) => Json
}
```

Added in v2.2.3

# Json (type alias)

**Signature**

```ts
export type Json = null | string | number | boolean | JsonObject | JsonArray
```

Added in v2.2.3

# JsonObject (type alias)

**Signature**

```ts
export type JsonObject = { [key: string]: Json }
```

Added in v2.2.3

# TypeOf (type alias)

**Signature**

```ts
export type TypeOf<E> = E.TypeOf<E>
```

Added in v2.2.3

# URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

Added in v2.2.3

# URI

**Signature**

```ts
export declare const URI: 'io-ts/JsonEncoder'
```

Added in v2.2.3

# array

**Signature**

```ts
export declare const array: <A>(items: JsonEncoder<A>) => JsonEncoder<A[]>
```

Added in v2.2.3

# contramap

**Signature**

```ts
export declare const contramap: <A, B>(f: (b: B) => A) => (fa: JsonEncoder<A>) => JsonEncoder<B>
```

Added in v2.2.3

# contravariantJsonEncoder

**Signature**

```ts
export declare const contravariantJsonEncoder: Contravariant1<'io-ts/JsonEncoder'>
```

Added in v2.2.3

# id

**Signature**

```ts
export declare function id<A extends Json>(): JsonEncoder<A>
```

Added in v2.2.5

# intersection

**Signature**

```ts
export declare const intersection: <A, B>(left: JsonEncoder<A>, right: JsonEncoder<B>) => JsonEncoder<A & B>
```

Added in v2.2.3

# lazy

**Signature**

```ts
export declare const lazy: <A>(f: () => JsonEncoder<A>) => JsonEncoder<A>
```

Added in v2.2.3

# nullable

**Signature**

```ts
export declare const nullable: <A>(or: JsonEncoder<A>) => JsonEncoder<A>
```

Added in v2.2.3

# partial

**Signature**

```ts
export declare const partial: <A>(
  properties: { [K in keyof A]: JsonEncoder<A[K]> }
) => JsonEncoder<Partial<{ [K in keyof A]: A[K] }>>
```

Added in v2.2.3

# record

**Signature**

```ts
export declare const record: <A>(codomain: JsonEncoder<A>) => JsonEncoder<Record<string, A>>
```

Added in v2.2.3

# schemableJsonEncoder

**Signature**

```ts
export declare const schemableJsonEncoder: Schemable1<'io-ts/JsonEncoder'>
```

Added in v2.2.3

# sum

**Signature**

```ts
export declare const sum: <T extends string>(
  tag: T
) => <A>(members: { [K in keyof A]: JsonEncoder<A[K]> }) => JsonEncoder<A[keyof A]>
```

Added in v2.2.3

# tuple

**Signature**

```ts
export declare const tuple: <A extends readonly unknown[]>(
  ...components: { [K in keyof A]: JsonEncoder<A[K]> }
) => JsonEncoder<A>
```

Added in v2.2.3

# type

**Signature**

```ts
export declare const type: <A>(
  properties: { [K in keyof A]: JsonEncoder<A[K]> }
) => JsonEncoder<{ [K in keyof A]: A[K] }>
```

Added in v2.2.3
