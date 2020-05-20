---
title: Eq.ts
nav_order: 4
parent: Modules
---

# Eq overview

Added in v2.2.2

---

<h2 class="text-delta">Table of contents</h2>

- [TypeOf (type alias)](#typeof-type-alias)
- [URI (type alias)](#uri-type-alias)
- [UnknownArray](#unknownarray)
- [UnknownRecord](#unknownrecord)
- [array](#array)
- [boolean](#boolean)
- [eq](#eq)
- [intersection](#intersection)
- [lazy](#lazy)
- [nullable](#nullable)
- [number](#number)
- [partial](#partial)
- [record](#record)
- [string](#string)
- [sum](#sum)
- [tuple](#tuple)
- [type](#type)

---

# TypeOf (type alias)

**Signature**

```ts
export type TypeOf<E> = E extends Eq<infer A> ? A : never
```

Added in v2.2.2

# URI (type alias)

**Signature**

```ts
export type URI = E.URI
```

Added in v2.2.3

# UnknownArray

**Signature**

```ts
export declare const UnknownArray: E.Eq<unknown[]>
```

Added in v2.2.2

# UnknownRecord

**Signature**

```ts
export declare const UnknownRecord: E.Eq<Record<string, unknown>>
```

Added in v2.2.2

# array

**Signature**

```ts
export declare const array: <A>(eq: E.Eq<A>) => E.Eq<A[]>
```

Added in v2.2.2

# boolean

**Signature**

```ts
export declare const boolean: E.Eq<boolean>
```

Added in v2.2.2

# eq

**Signature**

```ts
export declare const eq: Contravariant1<'Eq'> & Schemable1<'Eq'> & WithUnknownContainers1<'Eq'> & WithRefinement1<'Eq'>
```

Added in v2.2.2

# intersection

**Signature**

```ts
export declare function intersection<A, B>(left: Eq<A>, right: Eq<B>): Eq<A & B>
```

Added in v2.2.2

# lazy

**Signature**

```ts
export declare function lazy<A>(f: () => Eq<A>): Eq<A>
```

Added in v2.2.2

# nullable

**Signature**

```ts
export declare function nullable<A>(or: Eq<A>): Eq<null | A>
```

Added in v2.2.2

# number

**Signature**

```ts
export declare const number: E.Eq<number>
```

Added in v2.2.2

# partial

**Signature**

```ts
export declare function partial<A>(properties: { [K in keyof A]: Eq<A[K]> }): Eq<Partial<A>>
```

Added in v2.2.2

# record

**Signature**

```ts
export declare const record: <A>(codomain: E.Eq<A>) => E.Eq<Record<string, A>>
```

Added in v2.2.2

# string

**Signature**

```ts
export declare const string: E.Eq<string>
```

Added in v2.2.2

# sum

**Signature**

```ts
export declare function sum<T extends string>(tag: T): <A>(members: { [K in keyof A]: Eq<A[K]> }) => Eq<A[keyof A]>
```

Added in v2.2.2

# tuple

**Signature**

```ts
export declare const tuple: <A extends readonly unknown[]>(...components: { [K in keyof A]: E.Eq<A[K]> }) => E.Eq<A>
```

Added in v2.2.2

# type

**Signature**

```ts
export declare const type: <A>(eqs: { [K in keyof A]: E.Eq<A[K]> }) => E.Eq<A>
```

Added in v2.2.2
