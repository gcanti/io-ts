---
title: Guard.ts
nav_order: 5
parent: Modules
---

# Guard overview

Added in v2.2.0

---

<h2 class="text-delta">Table of contents</h2>

- [Guard (interface)](#guard-interface)
- [TypeOf (type alias)](#typeof-type-alias)
- [URI (type alias)](#uri-type-alias)
- [URI](#uri)
- [UnknownArray](#unknownarray)
- [UnknownRecord](#unknownrecord)
- [array](#array)
- [boolean](#boolean)
- [intersection](#intersection)
- [lazy](#lazy)
- [literal](#literal)
- [never](#never)
- [nullable](#nullable)
- [number](#number)
- [partial](#partial)
- [record](#record)
- [refinement](#refinement)
- [schemableGuard](#schemableguard)
- [string](#string)
- [sum](#sum)
- [tuple](#tuple)
- [type](#type)
- [union](#union)

---

# Guard (interface)

**Signature**

```ts
export interface Guard<A> {
  is: (u: unknown) => u is A
}
```

Added in v2.2.0

# TypeOf (type alias)

**Signature**

```ts
export type TypeOf<G> = G extends Guard<infer A> ? A : never
```

Added in v2.2.2

# URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

Added in v2.2.0

# URI

**Signature**

```ts
export declare const URI: 'io-ts/Guard'
```

Added in v2.2.0

# UnknownArray

**Signature**

```ts
export declare const UnknownArray: Guard<unknown[]>
```

Added in v2.2.0

# UnknownRecord

**Signature**

```ts
export declare const UnknownRecord: Guard<Record<string, unknown>>
```

Added in v2.2.0

# array

**Signature**

```ts
export declare function array<A>(items: Guard<A>): Guard<Array<A>>
```

Added in v2.2.0

# boolean

**Signature**

```ts
export declare const boolean: Guard<boolean>
```

Added in v2.2.0

# intersection

**Signature**

```ts
export declare function intersection<A, B>(left: Guard<A>, right: Guard<B>): Guard<A & B>
```

Added in v2.2.0

# lazy

**Signature**

```ts
export declare function lazy<A>(f: () => Guard<A>): Guard<A>
```

Added in v2.2.0

# literal

**Signature**

```ts
export declare function literal<A extends ReadonlyArray<Literal>>(...values: A): Guard<A[number]>
```

Added in v2.2.0

# never

**Signature**

```ts
export declare const never: Guard<never>
```

Added in v2.2.0

# nullable

**Signature**

```ts
export declare function nullable<A>(or: Guard<A>): Guard<null | A>
```

Added in v2.2.0

# number

**Signature**

```ts
export declare const number: Guard<number>
```

Added in v2.2.0

# partial

**Signature**

```ts
export declare function partial<A>(properties: { [K in keyof A]: Guard<A[K]> }): Guard<Partial<A>>
```

Added in v2.2.0

# record

**Signature**

```ts
export declare function record<A>(codomain: Guard<A>): Guard<Record<string, A>>
```

Added in v2.2.0

# refinement

**Signature**

```ts
export declare function refinement<A, B extends A>(from: Guard<A>, refinement: (a: A) => a is B): Guard<B>
```

Added in v2.2.0

# schemableGuard

**Signature**

```ts
export declare const schemableGuard: Schemable1<'io-ts/Guard'> &
  WithUnknownContainers1<'io-ts/Guard'> &
  WithUnion1<'io-ts/Guard'> &
  WithRefinement1<'io-ts/Guard'>
```

Added in v2.2.3

# string

**Signature**

```ts
export declare const string: Guard<string>
```

Added in v2.2.0

# sum

**Signature**

```ts
export declare function sum<T extends string>(
  tag: T
): <A>(members: { [K in keyof A]: Guard<A[K]> }) => Guard<A[keyof A]>
```

Added in v2.2.0

# tuple

**Signature**

```ts
export declare function tuple<A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: Guard<A[K]> }
): Guard<A>
```

Added in v2.2.0

# type

**Signature**

```ts
export declare function type<A>(properties: { [K in keyof A]: Guard<A[K]> }): Guard<A>
```

Added in v2.2.0

# union

**Signature**

```ts
export declare function union<A extends ReadonlyArray<unknown>>(
  ...members: { [K in keyof A]: Guard<A[K]> }
): Guard<A[number]>
```

Added in v2.2.0
