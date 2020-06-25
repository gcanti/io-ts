---
title: Kleisli2.ts
nav_order: 11
parent: Modules
---

## Kleisli2 overview

Added in v2.2.7

---

<h2 class="text-delta">Table of contents</h2>

- [combinators](#combinators)
  - [alt](#alt)
  - [array](#array)
  - [intersect](#intersect)
  - [lazy](#lazy)
  - [map](#map)
  - [mapLeftWithInput](#mapleftwithinput)
  - [nullable](#nullable)
  - [parse](#parse)
  - [partial](#partial)
  - [pipe](#pipe)
  - [record](#record)
  - [refine](#refine)
  - [sum](#sum)
  - [tuple](#tuple)
  - [type](#type)
  - [union](#union)
- [constructors](#constructors)
  - [fromGuard](#fromguard)
  - [literal](#literal)
- [model](#model)
  - [Kleisli2 (interface)](#kleisli2-interface)

---

# combinators

## alt

**Signature**

```ts
export declare const alt: <F extends 'io-ts/Codec' | 'io-ts/Encoder' | 'Either' | 'IOEither' | 'TaskEither', E>(
  A: Alt2C<F, E>
) => <I, A>(that: Lazy<Kleisli2<F, I, E, A>>) => (me: Kleisli2<F, I, E, A>) => Kleisli2<F, I, E, A>
```

Added in v2.2.7

## array

**Signature**

```ts
export declare function array<M extends URIS2, E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
): (
  onItemError: (index: number, e: E) => E
) => <I, A>(items: Kleisli2<M, I, E, A>) => Kleisli2<M, Array<I>, E, Array<A>>
```

Added in v2.2.7

## intersect

**Signature**

```ts
export declare const intersect: <M extends 'io-ts/Codec' | 'io-ts/Encoder' | 'Either' | 'IOEither' | 'TaskEither', E>(
  M: Apply2C<M, E>
) => <IB, B>(right: Kleisli2<M, IB, E, B>) => <IA, A>(left: Kleisli2<M, IA, E, A>) => Kleisli2<M, IA & IB, E, A & B>
```

Added in v2.2.7

## lazy

**Signature**

```ts
export declare const lazy: <M extends 'io-ts/Codec' | 'io-ts/Encoder' | 'Either' | 'IOEither' | 'TaskEither'>(
  M: Bifunctor2<M>
) => <E>(onError: (id: string, e: E) => E) => <I, A>(id: string, f: () => Kleisli2<M, I, E, A>) => Kleisli2<M, I, E, A>
```

Added in v2.2.7

## map

**Signature**

```ts
export declare const map: <F extends 'io-ts/Codec' | 'io-ts/Encoder' | 'Either' | 'IOEither' | 'TaskEither', E>(
  F: Functor2C<F, E>
) => <A, B>(f: (a: A) => B) => <I>(ia: Kleisli2<F, I, E, A>) => Kleisli2<F, I, E, B>
```

Added in v2.2.7

## mapLeftWithInput

**Signature**

```ts
export declare const mapLeftWithInput: <M extends
  | 'io-ts/Codec'
  | 'io-ts/Encoder'
  | 'Either'
  | 'IOEither'
  | 'TaskEither'>(
  M: Bifunctor2<M>
) => <I, E>(f: (i: I, e: E) => E) => <A>(decoder: Kleisli2<M, I, E, A>) => Kleisli2<M, I, E, A>
```

Added in v2.2.7

## nullable

**Signature**

```ts
export declare const nullable: <M extends 'io-ts/Codec' | 'io-ts/Encoder' | 'Either' | 'IOEither' | 'TaskEither', E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
) => <I>(onError: (i: I, e: E) => E) => <A>(or: Kleisli2<M, I, E, A>) => Kleisli2<M, I, E, A>
```

Added in v2.2.7

## parse

**Signature**

```ts
export declare const parse: <M extends 'io-ts/Codec' | 'io-ts/Encoder' | 'Either' | 'IOEither' | 'TaskEither', E>(
  M: Monad2C<M, E>
) => <A, B>(parser: (a: A) => Kind2<M, E, B>) => <I>(from: Kleisli2<M, I, E, A>) => Kleisli2<M, I, E, B>
```

Added in v2.2.7

## partial

**Signature**

```ts
export declare function partial<M extends URIS2, E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
): (
  onKeyError: (key: string, e: E) => E
) => <I, A>(
  properties: { [K in keyof A]: Kleisli2<M, I, E, A[K]> }
) => Kleisli2<M, Record<string, I>, E, Partial<{ [K in keyof A]: A[K] }>>
```

Added in v2.2.7

## pipe

**Signature**

```ts
export declare const pipe: <M extends 'io-ts/Codec' | 'io-ts/Encoder' | 'Either' | 'IOEither' | 'TaskEither', E>(
  M: Monad2C<M, E>
) => <I, A, B>(ia: Kleisli2<M, I, E, A>, ab: Kleisli2<M, A, E, B>) => Kleisli2<M, I, E, B>
```

Added in v2.2.7

## record

**Signature**

```ts
export declare function record<M extends URIS2, E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
): (
  onKeyError: (key: string, e: E) => E
) => <I, A>(codomain: Kleisli2<M, I, E, A>) => Kleisli2<M, Record<string, I>, E, Record<string, A>>
```

Added in v2.2.7

## refine

**Signature**

```ts
export declare const refine: <M extends 'io-ts/Codec' | 'io-ts/Encoder' | 'Either' | 'IOEither' | 'TaskEither', E>(
  M: MonadThrow2C<M, E> & Bifunctor2<M>
) => <A, B extends A>(
  refinement: (a: A) => a is B,
  onError: (a: A) => E
) => <I>(from: Kleisli2<M, I, E, A>) => Kleisli2<M, I, E, B>
```

Added in v2.2.7

## sum

**Signature**

```ts
export declare const sum: <M extends 'io-ts/Codec' | 'io-ts/Encoder' | 'Either' | 'IOEither' | 'TaskEither', E>(
  M: MonadThrow2C<M, E>
) => (
  onTagError: (tag: string, value: unknown, tags: readonly string[]) => E
) => <T extends string>(
  tag: T
) => <I extends Record<string, unknown>, A>(
  members: { [K in keyof A]: Kleisli2<M, I, E, A[K]> }
) => Kleisli2<M, I, E, A[keyof A]>
```

Added in v2.2.7

## tuple

**Signature**

```ts
export declare function tuple<M extends URIS2, E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
): (
  onIndexError: (index: number, e: E) => E
) => <I, A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: Kleisli2<M, I, E, A[K]> }
) => Kleisli2<M, Array<I>, E, A>
```

Added in v2.2.7

## type

**Signature**

```ts
export declare function type<M extends URIS2, E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
): (
  onKeyError: (key: string, e: E) => E
) => <I, A>(
  properties: { [K in keyof A]: Kleisli2<M, I, E, A[K]> }
) => Kleisli2<M, Record<string, I>, E, { [K in keyof A]: A[K] }>
```

Added in v2.2.7

## union

**Signature**

```ts
export declare const union: <M extends 'io-ts/Codec' | 'io-ts/Encoder' | 'Either' | 'IOEither' | 'TaskEither', E>(
  M: Alt2C<M, E> & Bifunctor2<M>
) => (
  onMemberError: (index: number, e: E) => E
) => <I, A extends readonly [unknown, ...unknown[]]>(
  ...members: { [K in keyof A]: Kleisli2<M, I, E, A[K]> }
) => Kleisli2<M, I, E, A[number]>
```

Added in v2.2.7

# constructors

## fromGuard

**Signature**

```ts
export declare const fromGuard: <M extends 'io-ts/Codec' | 'io-ts/Encoder' | 'Either' | 'IOEither' | 'TaskEither', E>(
  M: MonadThrow2C<M, E>
) => <A, I>(guard: G.Guard<A>, onError: (i: I) => E) => Kleisli2<M, I, E, A>
```

Added in v2.2.7

## literal

**Signature**

```ts
export declare const literal: <M extends 'io-ts/Codec' | 'io-ts/Encoder' | 'Either' | 'IOEither' | 'TaskEither', E>(
  M: MonadThrow2C<M, E>
) => <I>(
  onError: (i: I, values: readonly [Literal, ...Literal[]]) => E
) => <A extends readonly [Literal, ...Literal[]]>(...values: A) => Kleisli2<M, I, E, A[number]>
```

Added in v2.2.7

# model

## Kleisli2 (interface)

**Signature**

```ts
export interface Kleisli2<M extends URIS2, I, E, A> {
  readonly decode: (i: I) => Kind2<M, E, A>
}
```

Added in v2.2.7
