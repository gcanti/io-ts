---
title: Schemable.ts
nav_order: 11
parent: Modules
---

## Schemable overview

Added in v3.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [Literal (type alias)](#literal-type-alias)
  - [Schemable (interface)](#schemable-interface)
  - [Schemable1 (interface)](#schemable1-interface)
  - [Schemable2C (interface)](#schemable2c-interface)
  - [WithRefine (interface)](#withrefine-interface)
  - [WithRefine1 (interface)](#withrefine1-interface)
  - [WithRefine2C (interface)](#withrefine2c-interface)
  - [WithUnion (interface)](#withunion-interface)
  - [WithUnion1 (interface)](#withunion1-interface)
  - [WithUnion2C (interface)](#withunion2c-interface)
  - [WithUnknownContainers (interface)](#withunknowncontainers-interface)
  - [WithUnknownContainers1 (interface)](#withunknowncontainers1-interface)
  - [WithUnknownContainers2C (interface)](#withunknowncontainers2c-interface)
  - [memoize](#memoize)

---

# utils

## Literal (type alias)

**Signature**

```ts
export type Literal = string | number | boolean | null
```

Added in v3.0.0

## Schemable (interface)

**Signature**

```ts
export interface Schemable<S> {
  readonly URI?: S
  readonly literal: <A extends readonly [Literal, ...ReadonlyArray<Literal>]>(...values: A) => HKT<S, A[number]>
  readonly string: HKT<S, string>
  readonly number: HKT<S, number>
  readonly boolean: HKT<S, boolean>
  readonly nullable: <A>(or: HKT<S, A>) => HKT<S, null | A>
  readonly type: <A>(properties: { [K in keyof A]: HKT<S, A[K]> }) => HKT<S, { [K in keyof A]: A[K] }>
  readonly partial: <A>(properties: { [K in keyof A]: HKT<S, A[K]> }) => HKT<S, Partial<{ [K in keyof A]: A[K] }>>
  readonly record: <A>(codomain: HKT<S, A>) => HKT<S, Record<string, A>>
  // tslint:disable-next-line: readonly-array
  readonly array: <A>(item: HKT<S, A>) => HKT<S, Array<A>>
  readonly tuple: <A extends ReadonlyArray<unknown>>(...components: { [K in keyof A]: HKT<S, A[K]> }) => HKT<S, A>
  readonly intersect: <B>(right: HKT<S, B>) => <A>(left: HKT<S, A>) => HKT<S, A & B>
  readonly sum: <T extends string>(
    tag: T
  ) => <A>(members: { [K in keyof A]: HKT<S, A[K] & Record<T, K>> }) => HKT<S, A[keyof A]>
  readonly lazy: <A>(id: string, f: () => HKT<S, A>) => HKT<S, A>
}
```

Added in v3.0.0

## Schemable1 (interface)

**Signature**

```ts
export interface Schemable1<S extends URIS> {
  readonly URI?: S
  readonly literal: <A extends readonly [Literal, ...ReadonlyArray<Literal>]>(...values: A) => Kind<S, A[number]>
  readonly string: Kind<S, string>
  readonly number: Kind<S, number>
  readonly boolean: Kind<S, boolean>
  readonly nullable: <A>(or: Kind<S, A>) => Kind<S, null | A>
  readonly type: <A>(properties: { [K in keyof A]: Kind<S, A[K]> }) => Kind<S, { [K in keyof A]: A[K] }>
  readonly partial: <A>(properties: { [K in keyof A]: Kind<S, A[K]> }) => Kind<S, Partial<{ [K in keyof A]: A[K] }>>
  readonly record: <A>(codomain: Kind<S, A>) => Kind<S, Record<string, A>>
  // tslint:disable-next-line: readonly-array
  readonly array: <A>(item: Kind<S, A>) => Kind<S, Array<A>>
  readonly tuple: <A extends ReadonlyArray<unknown>>(...components: { [K in keyof A]: Kind<S, A[K]> }) => Kind<S, A>
  readonly intersect: <B>(right: Kind<S, B>) => <A>(left: Kind<S, A>) => Kind<S, A & B>
  readonly sum: <T extends string>(
    tag: T
  ) => <A>(members: { [K in keyof A]: Kind<S, A[K] & Record<T, K>> }) => Kind<S, A[keyof A]>
  readonly lazy: <A>(id: string, f: () => Kind<S, A>) => Kind<S, A>
}
```

Added in v3.0.0

## Schemable2C (interface)

**Signature**

```ts
export interface Schemable2C<S extends URIS2, E> {
  readonly URI?: S
  readonly literal: <A extends readonly [Literal, ...ReadonlyArray<Literal>]>(...values: A) => Kind2<S, E, A[number]>
  readonly string: Kind2<S, E, string>
  readonly number: Kind2<S, E, number>
  readonly boolean: Kind2<S, E, boolean>
  readonly nullable: <A>(or: Kind2<S, E, A>) => Kind2<S, E, null | A>
  readonly type: <A>(properties: { [K in keyof A]: Kind2<S, E, A[K]> }) => Kind2<S, E, { [K in keyof A]: A[K] }>
  readonly partial: <A>(
    properties: { [K in keyof A]: Kind2<S, E, A[K]> }
  ) => Kind2<S, E, Partial<{ [K in keyof A]: A[K] }>>
  readonly record: <A>(codomain: Kind2<S, E, A>) => Kind2<S, E, Record<string, A>>
  // tslint:disable-next-line: readonly-array
  readonly array: <A>(item: Kind2<S, E, A>) => Kind2<S, E, Array<A>>
  readonly tuple: <A extends ReadonlyArray<unknown>>(
    ...components: { [K in keyof A]: Kind2<S, E, A[K]> }
  ) => Kind2<S, E, A>
  readonly intersect: <B>(right: Kind2<S, E, B>) => <A>(left: Kind2<S, E, A>) => Kind2<S, E, A & B>
  readonly sum: <T extends string>(
    tag: T
  ) => <A>(members: { [K in keyof A]: Kind2<S, E, A[K] & Record<T, K>> }) => Kind2<S, E, A[keyof A]>
  readonly lazy: <A>(id: string, f: () => Kind2<S, E, A>) => Kind2<S, E, A>
}
```

Added in v3.0.0

## WithRefine (interface)

**Signature**

```ts
export interface WithRefine<S> {
  readonly refine: <A, B extends A>(refinement: Refinement<A, B>, id: string) => (from: HKT<S, A>) => HKT<S, B>
}
```

Added in v3.0.0

## WithRefine1 (interface)

**Signature**

```ts
export interface WithRefine1<S extends URIS> {
  readonly refine: <A, B extends A>(refinement: Refinement<A, B>, id: string) => (from: Kind<S, A>) => Kind<S, B>
}
```

Added in v3.0.0

## WithRefine2C (interface)

**Signature**

```ts
export interface WithRefine2C<S extends URIS2, E> {
  readonly refine: <A, B extends A>(
    refinement: Refinement<A, B>,
    id: string
  ) => (from: Kind2<S, E, A>) => Kind2<S, E, B>
}
```

Added in v3.0.0

## WithUnion (interface)

**Signature**

```ts
export interface WithUnion<S> {
  readonly union: <A extends readonly [unknown, ...ReadonlyArray<unknown>]>(
    ...members: { [K in keyof A]: HKT<S, A[K]> }
  ) => HKT<S, A[number]>
}
```

Added in v3.0.0

## WithUnion1 (interface)

**Signature**

```ts
export interface WithUnion1<S extends URIS> {
  readonly union: <A extends readonly [unknown, ...ReadonlyArray<unknown>]>(
    ...members: { [K in keyof A]: Kind<S, A[K]> }
  ) => Kind<S, A[number]>
}
```

Added in v3.0.0

## WithUnion2C (interface)

**Signature**

```ts
export interface WithUnion2C<S extends URIS2, E> {
  readonly union: <A extends readonly [unknown, ...ReadonlyArray<unknown>]>(
    ...members: { [K in keyof A]: Kind2<S, E, A[K]> }
  ) => Kind2<S, E, A[number]>
}
```

Added in v3.0.0

## WithUnknownContainers (interface)

**Signature**

```ts
export interface WithUnknownContainers<S> {
  // tslint:disable-next-line: readonly-array
  readonly UnknownArray: HKT<S, Array<unknown>>
  readonly UnknownRecord: HKT<S, Record<string, unknown>>
}
```

Added in v3.0.0

## WithUnknownContainers1 (interface)

**Signature**

```ts
export interface WithUnknownContainers1<S extends URIS> {
  // tslint:disable-next-line: readonly-array
  readonly UnknownArray: Kind<S, Array<unknown>>
  readonly UnknownRecord: Kind<S, Record<string, unknown>>
}
```

Added in v3.0.0

## WithUnknownContainers2C (interface)

**Signature**

```ts
export interface WithUnknownContainers2C<S extends URIS2, E> {
  // tslint:disable-next-line: readonly-array
  readonly UnknownArray: Kind2<S, E, Array<unknown>>
  readonly UnknownRecord: Kind2<S, E, Record<string, unknown>>
}
```

Added in v3.0.0

## memoize

**Signature**

```ts
export declare function memoize<A, B>(f: (a: A) => B): (a: A) => B
```

Added in v3.0.0
