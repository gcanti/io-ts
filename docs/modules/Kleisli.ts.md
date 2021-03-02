---
title: Kleisli.ts
nav_order: 9
parent: Modules
---

## Kleisli overview

Added in v3.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [combinators](#combinators)
  - [alt](#alt)
  - [compose](#compose)
  - [fromArray](#fromarray)
  - [fromPartial](#frompartial)
  - [fromRecord](#fromrecord)
  - [fromStruct](#fromstruct)
  - [fromSum](#fromsum)
  - [fromTuple](#fromtuple)
  - [id](#id)
  - [intersect](#intersect)
  - [lazy](#lazy)
  - [map](#map)
  - [mapLeftWithInput](#mapleftwithinput)
  - [nullable](#nullable)
  - [parse](#parse)
  - [refine](#refine)
  - [union](#union)
- [constructors](#constructors)
  - [fromRefinement](#fromrefinement)
  - [literal](#literal)
- [model](#model)
  - [Kleisli (interface)](#kleisli-interface)
- [utils](#utils)
  - [InputOf (type alias)](#inputof-type-alias)
  - [TypeOf (type alias)](#typeof-type-alias)

---

# combinators

## alt

**Signature**

```ts
export declare function alt<F extends URIS2, E>(
  A: Alt2C<F, E>
): <I, A>(that: Lazy<Kleisli<F, I, E, A>>) => (me: Kleisli<F, I, E, A>) => Kleisli<F, I, E, A>
```

Added in v3.0.0

## compose

**Signature**

```ts
export declare function compose<M extends URIS2, E>(
  M: Monad2C<M, E>
): <A, B>(ab: Kleisli<M, A, E, B>) => <I>(ia: Kleisli<M, I, E, A>) => Kleisli<M, I, E, B>
```

Added in v3.0.0

## fromArray

**Signature**

```ts
export declare function fromArray<M extends URIS2, E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
  // tslint:disable-next-line: readonly-array
): (onItemError: (index: number, e: E) => E) => <I, A>(item: Kleisli<M, I, E, A>) => Kleisli<M, Array<I>, E, Array<A>>
```

Added in v3.0.0

## fromPartial

**Signature**

```ts
export declare function fromPartial<M extends URIS2, E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
): (
  onPropertyError: (key: string, e: E) => E
) => <P extends Record<string, Kleisli<M, any, E, any>>>(
  properties: P
) => Kleisli<M, Partial<{ [K in keyof P]: InputOf<M, P[K]> }>, E, Partial<{ [K in keyof P]: TypeOf<M, P[K]> }>>
```

Added in v3.0.0

## fromRecord

**Signature**

```ts
export declare function fromRecord<M extends URIS2, E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
): (
  onKeyError: (key: string, e: E) => E
) => <I, A>(codomain: Kleisli<M, I, E, A>) => Kleisli<M, Record<string, I>, E, Record<string, A>>
```

Added in v3.0.0

## fromStruct

**Signature**

```ts
export declare function fromStruct<M extends URIS2, E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
): (
  onPropertyError: (key: string, e: E) => E
) => <P extends Record<string, Kleisli<M, any, E, any>>>(
  properties: P
) => Kleisli<M, { [K in keyof P]: InputOf<M, P[K]> }, E, { [K in keyof P]: TypeOf<M, P[K]> }>
```

Added in v3.0.0

## fromSum

**Signature**

```ts
export declare function fromSum<M extends URIS2, E>(
  M: FromEither2C<M, E>
): (
  onTagError: (tag: string, actual: unknown, tags: ReadonlyArray<string>) => E
) => <T extends string>(
  tag: T
) => <MS extends Record<string, Kleisli<M, any, E, any>>>(
  members: MS
) => Kleisli<M, InputOf<M, MS[keyof MS]>, E, TypeOf<M, MS[keyof MS]>>
```

Added in v3.0.0

## fromTuple

**Signature**

```ts
export declare function fromTuple<M extends URIS2, E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
): (
  onIndexError: (index: number, e: E) => E
) => <C extends ReadonlyArray<Kleisli<M, any, E, any>>>(
  ...components: C
) => Kleisli<M, { [K in keyof C]: InputOf<M, C[K]> }, E, { [K in keyof C]: TypeOf<M, C[K]> }>
```

Added in v3.0.0

## id

**Signature**

```ts
export declare function id<M extends URIS2, E>(M: Applicative2C<M, E>): <A>() => Kleisli<M, A, E, A>
```

Added in v3.0.0

## intersect

**Signature**

```ts
export declare function intersect<M extends URIS2, E>(
  M: Apply2C<M, E>
): <IB, B>(right: Kleisli<M, IB, E, B>) => <IA, A>(left: Kleisli<M, IA, E, A>) => Kleisli<M, IA & IB, E, A & B>
```

Added in v3.0.0

## lazy

**Signature**

```ts
export declare function lazy<M extends URIS2>(
  M: Bifunctor2<M>
): <E>(onError: (id: string, e: E) => E) => <I, A>(id: string, f: () => Kleisli<M, I, E, A>) => Kleisli<M, I, E, A>
```

Added in v3.0.0

## map

**Signature**

```ts
export declare function map<F extends URIS2, E>(
  F: Functor2C<F, E>
): <A, B>(f: (a: A) => B) => <I>(ia: Kleisli<F, I, E, A>) => Kleisli<F, I, E, B>
```

Added in v3.0.0

## mapLeftWithInput

**Signature**

```ts
export declare function mapLeftWithInput<M extends URIS2>(
  M: Bifunctor2<M>
): <I, E>(f: (i: I, e: E) => E) => <A>(decoder: Kleisli<M, I, E, A>) => Kleisli<M, I, E, A>
```

Added in v3.0.0

## nullable

**Signature**

```ts
export declare function nullable<M extends URIS2, E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
): <I>(onError: (i: I, e: E) => E) => <A>(or: Kleisli<M, I, E, A>) => Kleisli<M, null | I, E, null | A>
```

Added in v3.0.0

## parse

**Signature**

```ts
export declare function parse<M extends URIS2, E>(
  M: Monad2C<M, E>
): <A, B>(decode: (a: A) => Kind2<M, E, B>) => <I>(from: Kleisli<M, I, E, A>) => Kleisli<M, I, E, B>
```

Added in v3.0.0

## refine

**Signature**

```ts
export declare function refine<M extends URIS2, E>(
  M: Monad2C<M, E> & FromEither2C<M, E> & Bifunctor2<M>
): <A, B extends A>(
  refinement: Refinement<A, B>,
  onError: (a: A) => E
) => <I>(from: Kleisli<M, I, E, A>) => Kleisli<M, I, E, B>
```

Added in v3.0.0

## union

**Signature**

```ts
export declare function union<M extends URIS2, E>(
  M: Alt2C<M, E> & Bifunctor2<M>
): (
  onMemberError: (index: number, e: E) => E
) => <MS extends readonly [Kleisli<M, any, E, any>, ...ReadonlyArray<Kleisli<M, any, E, any>>]>(
  ...members: MS
) => Kleisli<M, InputOf<M, MS[keyof MS]>, E, TypeOf<M, MS[keyof MS]>>
```

Added in v3.0.0

# constructors

## fromRefinement

**Signature**

```ts
export declare function fromRefinement<M extends URIS2, E>(
  M: FromEither2C<M, E>
): <I, A extends I>(refinement: Refinement<I, A>, onError: (i: I) => E) => Kleisli<M, I, E, A>
```

Added in v3.0.0

## literal

**Signature**

```ts
export declare function literal<M extends URIS2, E>(
  M: FromEither2C<M, E>
): <I>(
  onError: (i: I, values: readonly [Literal, ...ReadonlyArray<Literal>]) => E
) => <A extends readonly [Literal, ...ReadonlyArray<Literal>]>(...values: A) => Kleisli<M, I, E, A[number]>
```

Added in v3.0.0

# model

## Kleisli (interface)

**Signature**

```ts
export interface Kleisli<M extends URIS2, I, E, A> {
  readonly decode: (i: I) => Kind2<M, E, A>
}
```

Added in v3.0.0

# utils

## InputOf (type alias)

**Signature**

```ts
export type InputOf<M extends URIS2, KD> = KD extends Kleisli<M, infer I, any, any> ? I : never
```

Added in v3.0.0

## TypeOf (type alias)

**Signature**

```ts
export type TypeOf<M extends URIS2, KD> = KD extends Kleisli<M, any, any, infer A> ? A : never
```

Added in v3.0.0
