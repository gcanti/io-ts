---
title: DecoderT.ts
nav_order: 5
parent: Modules
---

## DecoderT overview

Added in v2.2.7

---

<h2 class="text-delta">Table of contents</h2>

- [combinators](#combinators)
  - [array](#array)
  - [partial](#partial)
  - [record](#record)
  - [tuple](#tuple)
  - [type](#type)
- [constructors](#constructors)
  - [fromGuard](#fromguard)
  - [literal](#literal)
- [model](#model)
  - [DecoderT (interface)](#decodert-interface)

---

# combinators

## array

**Signature**

```ts
export declare function array<M extends URIS2, E>(
  M: Monad2C<M, E> & Bifunctor2<M>
): (
  UnknownArray: DecoderT<M, E, Array<unknown>>,
  onItemError: (i: number, e: E) => E
) => <A>(items: DecoderT<M, E, A>) => DecoderT<M, E, Array<A>>
```

Added in v2.2.7

## partial

**Signature**

```ts
export declare function partial<M extends URIS2, E>(
  M: Monad2C<M, E> & Bifunctor2<M>
): (
  UnknownRecord: DecoderT<M, E, Record<string, unknown>>,
  onKeyError: (k: string, e: E) => E
) => <A>(properties: { [K in keyof A]: DecoderT<M, E, A[K]> }) => DecoderT<M, E, Partial<{ [K in keyof A]: A[K] }>>
```

Added in v2.2.7

## record

**Signature**

```ts
export declare function record<M extends URIS2, E>(
  M: Monad2C<M, E> & Bifunctor2<M>
): (
  UnknownRecord: DecoderT<M, E, Record<string, unknown>>,
  onKeyError: (k: string, e: E) => E
) => <A>(codomain: DecoderT<M, E, A>) => DecoderT<M, E, Record<string, A>>
```

Added in v2.2.7

## tuple

**Signature**

```ts
export declare function tuple<M extends URIS2, E>(
  M: Monad2C<M, E> & Bifunctor2<M>
): (
  UnknownArray: DecoderT<M, E, Array<unknown>>,
  onIndexError: (i: number, e: E) => E
) => <A extends ReadonlyArray<unknown>>(...components: { [K in keyof A]: DecoderT<M, E, A[K]> }) => DecoderT<M, E, A>
```

Added in v2.2.7

## type

**Signature**

```ts
export declare function type<M extends URIS2, E>(
  M: Monad2C<M, E> & Bifunctor2<M>
): (
  UnknownRecord: DecoderT<M, E, Record<string, unknown>>,
  onKeyError: (k: string, e: E) => E
) => <A>(properties: { [K in keyof A]: DecoderT<M, E, A[K]> }) => DecoderT<M, E, { [K in keyof A]: A[K] }>
```

Added in v2.2.7

# constructors

## fromGuard

**Signature**

```ts
export declare const fromGuard: <M extends 'io-ts/Codec' | 'io-ts/Encoder' | 'Either' | 'IOEither' | 'TaskEither', E>(
  M: MonadThrow2C<M, E>
) => <A>(guard: G.Guard<A>, onError: (u: unknown) => E) => DecoderT<M, E, A>
```

Added in v2.2.7

## literal

**Signature**

```ts
export declare function literal<M extends URIS2, E>(
  M: MonadThrow2C<M, E>
): (
  onError: (u: unknown, values: readonly [Literal, ...Array<Literal>]) => E
) => <A extends readonly [Literal, ...Array<Literal>]>(...values: A) => DecoderT<M, E, A[number]>
```

Added in v2.2.7

# model

## DecoderT (interface)

**Signature**

```ts
export interface DecoderT<M extends URIS2, E, A> {
  readonly decode: (u: unknown) => Kind2<M, E, A>
}
```

Added in v2.2.7
