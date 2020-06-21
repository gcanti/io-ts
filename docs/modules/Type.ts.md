---
title: Type.ts
nav_order: 16
parent: Modules
---

## Type overview

Added in v2.2.3

---

<h2 class="text-delta">Table of contents</h2>

- [combinators](#combinators)
  - [array](#array)
  - [intersection](#intersection)
  - [lazy](#lazy)
  - [nullable](#nullable)
  - [partial](#partial)
  - [record](#record)
  - [refinement](#refinement)
  - [sum](#sum)
  - [tuple](#tuple)
  - [type](#type)
  - [union](#union)
- [constructors](#constructors)
  - [literal](#literal)
- [instances](#instances)
  - [URI](#uri)
  - [URI (type alias)](#uri-type-alias)
  - [schemableType](#schemabletype)
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
export declare function array<A>(items: Type<A>): Type<Array<A>>
```

Added in v2.2.3

## intersection

**Signature**

```ts
export declare function intersection<A, B>(left: Type<A>, right: Type<B>): Type<A & B>
```

Added in v2.2.3

## lazy

**Signature**

```ts
export declare function lazy<A>(id: string, f: () => Type<A>): Type<A>
```

Added in v2.2.3

## nullable

**Signature**

```ts
export declare function nullable<A>(or: Type<A>): Type<null | A>
```

Added in v2.2.3

## partial

**Signature**

```ts
export declare function partial<A>(properties: { [K in keyof A]: Type<A[K]> }): Type<Partial<{ [K in keyof A]: A[K] }>>
```

Added in v2.2.3

## record

**Signature**

```ts
export declare function record<A>(codomain: Type<A>): Type<Record<string, A>>
```

Added in v2.2.3

## refinement

**Signature**

```ts
export declare function refinement<A, B extends A>(
  from: Type<A>,
  refinement: (a: A) => a is B,
  expected: string
): Type<B>
```

Added in v2.2.3

## sum

**Signature**

```ts
export declare function sum<T extends string>(_tag: T): <A>(members: { [K in keyof A]: Type<A[K]> }) => Type<A[keyof A]>
```

Added in v2.2.3

## tuple

**Signature**

```ts
export declare function tuple<A extends ReadonlyArray<unknown>>(...components: { [K in keyof A]: Type<A[K]> }): Type<A>
```

Added in v2.2.3

## type

**Signature**

```ts
export declare function type<A>(properties: { [K in keyof A]: Type<A[K]> }): Type<{ [K in keyof A]: A[K] }>
```

Added in v2.2.3

## union

**Signature**

```ts
export declare function union<A extends ReadonlyArray<unknown>>(
  ...members: { [K in keyof A]: Type<A[K]> }
): Type<A[number]>
```

Added in v2.2.3

# constructors

## literal

**Signature**

```ts
export declare function literal<A extends ReadonlyArray<Literal>>(...values: A): Type<A[number]>
```

Added in v2.2.3

# instances

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

## schemableType

**Signature**

```ts
export declare const schemableType: Schemable1<'io-ts/Type'> &
  WithUnknownContainers1<'io-ts/Type'> &
  WithUnion1<'io-ts/Type'> &
  WithRefinement1<'io-ts/Type'>
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
