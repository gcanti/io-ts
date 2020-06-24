---
title: Kleisli.ts
nav_order: 11
parent: Modules
---

## Kleisli overview

Added in v2.2.7

---

<h2 class="text-delta">Table of contents</h2>

- [combinators](#combinators)
  - [array](#array)
  - [intersect](#intersect)
  - [lazy](#lazy)
  - [nullable](#nullable)
  - [parse](#parse)
  - [partial](#partial)
  - [record](#record)
  - [refine](#refine)
  - [sum](#sum)
  - [tuple](#tuple)
  - [type](#type)
  - [union](#union)
  - [withExpected](#withexpected)
- [constructors](#constructors)
  - [fromGuard](#fromguard)
  - [literal](#literal)
- [model](#model)
  - [Kleisli (interface)](#kleisli-interface)
- [utils](#utils)
  - [pipe](#pipe)

---

# combinators

## array

**Signature**

```ts
export declare function array<M extends URIS2, E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
): (onItemError: (index: number, e: E) => E) => <I, A>(items: Kleisli<M, I, E, A>) => Kleisli<M, Array<I>, E, Array<A>>
```

Added in v2.2.7

## intersect

**Signature**

```ts
export declare const intersect: <M extends 'io-ts/Codec' | 'io-ts/Encoder' | 'Either' | 'IOEither' | 'TaskEither', E>(
  M: Apply2C<M, E>
) => <IB, B>(right: Kleisli<M, IB, E, B>) => <IA, A>(left: Kleisli<M, IA, E, A>) => Kleisli<M, IA & IB, E, A & B>
```

Added in v2.2.7

## lazy

**Signature**

```ts
export declare const lazy: <M extends 'io-ts/Codec' | 'io-ts/Encoder' | 'Either' | 'IOEither' | 'TaskEither'>(
  M: Bifunctor2<M>
) => <E>(onError: (id: string, e: E) => E) => <I, A>(id: string, f: () => Kleisli<M, I, E, A>) => Kleisli<M, I, E, A>
```

Added in v2.2.7

## nullable

**Signature**

```ts
export declare const nullable: <M extends 'io-ts/Codec' | 'io-ts/Encoder' | 'Either' | 'IOEither' | 'TaskEither', E>(
  M: Applicative2C<M, E> & Bifunctor2<M>
) => <I>(onError: (i: I, e: E) => E) => <A>(or: Kleisli<M, I, E, A>) => Kleisli<M, I, E, A>
```

Added in v2.2.7

## parse

**Signature**

```ts
export declare const parse: <M extends 'io-ts/Codec' | 'io-ts/Encoder' | 'Either' | 'IOEither' | 'TaskEither', E>(
  M: Monad2C<M, E>
) => <A, B>(parser: (a: A) => Kind2<M, E, B>) => <I>(from: Kleisli<M, I, E, A>) => Kleisli<M, I, E, B>
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
  properties: { [K in keyof A]: Kleisli<M, I, E, A[K]> }
) => Kleisli<M, Record<string, I>, E, Partial<{ [K in keyof A]: A[K] }>>
```

Added in v2.2.7

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
export declare const refine: <M extends 'io-ts/Codec' | 'io-ts/Encoder' | 'Either' | 'IOEither' | 'TaskEither', E>(
  M: MonadThrow2C<M, E> & Bifunctor2<M>
) => <A, B extends A, I>(
  refinement: (a: A) => a is B,
  onError: (a: A) => E
) => (from: Kleisli<M, I, E, A>) => Kleisli<M, I, E, B>
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
  members: { [K in keyof A]: Kleisli<M, I, E, A[K]> }
) => Kleisli<M, I, E, A[keyof A]>
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
  ...components: { [K in keyof A]: Kleisli<M, I, E, A[K]> }
) => Kleisli<M, Array<I>, E, A>
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
  properties: { [K in keyof A]: Kleisli<M, I, E, A[K]> }
) => Kleisli<M, Record<string, I>, E, { [K in keyof A]: A[K] }>
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
  ...members: { [K in keyof A]: Kleisli<M, I, E, A[K]> }
) => Kleisli<M, I, E, A[number]>
```

Added in v2.2.7

## withExpected

**Signature**

```ts
export declare const withExpected: <M extends 'io-ts/Codec' | 'io-ts/Encoder' | 'Either' | 'IOEither' | 'TaskEither'>(
  M: Bifunctor2<M>
) => <I, E, A>(decoder: Kleisli<M, I, E, A>, expected: (i: I, e: E) => E) => Kleisli<M, I, E, A>
```

Added in v2.2.7

# constructors

## fromGuard

**Signature**

```ts
export declare const fromGuard: <M extends 'io-ts/Codec' | 'io-ts/Encoder' | 'Either' | 'IOEither' | 'TaskEither', E>(
  M: MonadThrow2C<M, E>
) => <A, I>(guard: G.Guard<A>, onError: (i: I) => E) => Kleisli<M, I, E, A>
```

Added in v2.2.7

## literal

**Signature**

```ts
export declare const literal: <M extends 'io-ts/Codec' | 'io-ts/Encoder' | 'Either' | 'IOEither' | 'TaskEither', E>(
  M: MonadThrow2C<M, E>
) => <I>(
  onError: (i: I, values: readonly [Literal, ...Literal[]]) => E
) => <A extends readonly [Literal, ...Literal[]]>(...values: A) => Kleisli<M, I, E, A[number]>
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

## pipe

**Signature**

```ts
export declare const pipe: <M extends 'io-ts/Codec' | 'io-ts/Encoder' | 'Either' | 'IOEither' | 'TaskEither', E>(
  M: Monad2C<M, E>
) => <I, A, B>(ia: Kleisli<M, I, E, A>, ab: Kleisli<M, A, E, B>) => Kleisli<M, I, E, B>
```

Added in v2.2.7
