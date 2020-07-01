---
title: Kleisli.ts
nav_order: 11
parent: Modules
---

## Kleisli overview

**This module is experimental**

Experimental features are published in order to get early feedback from the community, see these tracking
[issues](https://github.com/gcanti/io-ts/issues?q=label%3Av2.2+) for further discussions and enhancements.

A feature tagged as _Experimental_ is in a high state of flux, you're at risk of it changing without notice.

Added in v2.2.7

---

<h2 class="text-delta">Table of contents</h2>

- [combinators](#combinators)
  - [alt](#alt)
  - [array](#array)
  - [compose](#compose)
  - [id](#id)
  - [intersect](#intersect)
  - [lazy](#lazy)
  - [map](#map)
  - [mapLeftWithInput](#mapleftwithinput)
  - [nullable](#nullable)
  - [parse](#parse)
  - [partialProps](#partialprops)
  - [props](#props)
  - [record](#record)
  - [refine](#refine)
  - [sum](#sum)
  - [tuple](#tuple)
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

Added in v2.2.7

## array

**Signature**

```ts
export declare function array<M extends URIS2, E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
): (onItemError: (index: number, e: E) => E) => <I, A>(item: Kleisli<M, I, E, A>) => Kleisli<M, Array<I>, E, Array<A>>
```

Added in v2.2.7

## compose

**Signature**

```ts
export declare function compose<M extends URIS2, E>(
  M: Monad2C<M, E>
): <A, B>(ab: Kleisli<M, A, E, B>) => <I>(ia: Kleisli<M, I, E, A>) => Kleisli<M, I, E, B>
```

Added in v2.2.7

## id

**Signature**

```ts
export declare function id<M extends URIS2, E>(M: Applicative2C<M, E>): <A>() => Kleisli<M, A, E, A>
```

Added in v2.2.8

## intersect

**Signature**

```ts
export declare function intersect<M extends URIS2, E>(
  M: Apply2C<M, E>
): <IB, B>(right: Kleisli<M, IB, E, B>) => <IA, A>(left: Kleisli<M, IA, E, A>) => Kleisli<M, IA & IB, E, A & B>
```

Added in v2.2.7

## lazy

**Signature**

```ts
export declare function lazy<M extends URIS2>(
  M: Bifunctor2<M>
): <E>(onError: (id: string, e: E) => E) => <I, A>(id: string, f: () => Kleisli<M, I, E, A>) => Kleisli<M, I, E, A>
```

Added in v2.2.7

## map

**Signature**

```ts
export declare function map<F extends URIS2, E>(
  F: Functor2C<F, E>
): <A, B>(f: (a: A) => B) => <I>(ia: Kleisli<F, I, E, A>) => Kleisli<F, I, E, B>
```

Added in v2.2.7

## mapLeftWithInput

**Signature**

```ts
export declare function mapLeftWithInput<M extends URIS2>(
  M: Bifunctor2<M>
): <I, E>(f: (i: I, e: E) => E) => <A>(decoder: Kleisli<M, I, E, A>) => Kleisli<M, I, E, A>
```

Added in v2.2.7

## nullable

**Signature**

```ts
export declare function nullable<M extends URIS2, E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
): <I>(onError: (i: I, e: E) => E) => <A>(or: Kleisli<M, I, E, A>) => Kleisli<M, null | I, E, null | A>
```

Added in v2.2.7

## parse

**Signature**

```ts
export declare function parse<M extends URIS2, E>(
  M: Monad2C<M, E>
): <A, B>(decode: (a: A) => Kind2<M, E, B>) => <I>(from: Kleisli<M, I, E, A>) => Kleisli<M, I, E, B>
```

Added in v2.2.7

## partialProps

**Signature**

```ts
export declare function partialProps<M extends URIS2, E>(
  M: Monad2C<M, E> & Bifunctor2<M>
): (
  onPropertyError: (key: string, e: E) => E
) => <I, A>(
  properties: { [K in keyof A]: Kleisli<M, I, E, A[K]> }
) => <H>(decoder: Kleisli<M, H, E, Record<string, I>>) => Kleisli<M, H, E, Partial<{ [K in keyof A]: A[K] }>>
```

Added in v2.2.8

## props

**Signature**

```ts
export declare function props<M extends URIS2, E>(
  M: Monad2C<M, E> & Bifunctor2<M>
): (
  onPropertyError: (key: string, e: E) => E
) => <I, A>(
  properties: { [K in keyof A]: Kleisli<M, I, E, A[K]> }
) => <H>(decoder: Kleisli<M, H, E, Record<string, I>>) => Kleisli<M, H, E, { [K in keyof A]: A[K] }>
```

Added in v2.2.8

## record

**Signature**

```ts
export declare function record<M extends URIS2, E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
): (
  onKeyError: (key: string, e: E) => E
) => <I, A>(codomain: Kleisli<M, I, E, A>) => Kleisli<M, Record<string, I>, E, Record<string, A>>
```

Added in v2.2.7

## refine

**Signature**

```ts
export declare function refine<M extends URIS2, E>(
  M: MonadThrow2C<M, E> & Bifunctor2<M>
): <A, B extends A>(
  refinement: (a: A) => a is B,
  onError: (a: A) => E
) => <I>(from: Kleisli<M, I, E, A>) => Kleisli<M, I, E, B>
```

Added in v2.2.7

## sum

**Signature**

```ts
export declare function sum<M extends URIS2, E>(
  M: MonadThrow2C<M, E>
): (
  onTagError: (tag: string, value: unknown, tags: ReadonlyArray<string>) => E
) => <T extends string>(
  tag: T
) => <MS extends Record<string, Kleisli<M, any, E, any>>>(
  members: MS
) => Kleisli<M, InputOf<M, MS[keyof MS]>, E, TypeOf<M, MS[keyof MS]>>
```

Added in v2.2.7

## tuple

**Signature**

```ts
export declare function tuple<M extends URIS2, E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
): (
  onIndexError: (index: number, e: E) => E
) => <C extends ReadonlyArray<Kleisli<M, any, E, any>>>(
  ...components: C
) => Kleisli<M, { [K in keyof C]: InputOf<M, C[K]> }, E, { [K in keyof C]: TypeOf<M, C[K]> }>
```

Added in v2.2.7

## union

**Signature**

```ts
export declare function union<M extends URIS2, E>(
  M: Alt2C<M, E> & Bifunctor2<M>
): (
  onMemberError: (index: number, e: E) => E
) => <MS extends readonly [Kleisli<M, any, E, any>, ...Array<Kleisli<M, any, E, any>>]>(
  ...members: MS
) => Kleisli<M, InputOf<M, MS[keyof MS]>, E, TypeOf<M, MS[keyof MS]>>
```

Added in v2.2.7

# constructors

## fromRefinement

**Signature**

```ts
export declare function fromRefinement<M extends URIS2, E>(
  M: MonadThrow2C<M, E>
): <I, A extends I>(refinement: Refinement<I, A>, onError: (i: I) => E) => Kleisli<M, I, E, A>
```

Added in v2.2.7

## literal

**Signature**

```ts
export declare function literal<M extends URIS2, E>(
  M: MonadThrow2C<M, E>
): <I>(
  onError: (i: I, values: readonly [Literal, ...Array<Literal>]) => E
) => <A extends readonly [Literal, ...Array<Literal>]>(...values: A) => Kleisli<M, I, E, A[number]>
```

Added in v2.2.7

# model

## Kleisli (interface)

**Signature**

```ts
export interface Kleisli<M extends URIS2, I, E, A> {
  readonly decode: (i: I) => Kind2<M, E, A>
}
```

Added in v2.2.7

# utils

## InputOf (type alias)

**Signature**

```ts
export type InputOf<M extends URIS2, KD> = KD extends Kleisli<M, infer I, any, any> ? I : never
```

Added in v2.2.7

## TypeOf (type alias)

**Signature**

```ts
export type TypeOf<M extends URIS2, KD> = KD extends Kleisli<M, any, any, infer A> ? A : never
```

Added in v2.2.7
