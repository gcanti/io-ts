---
title: KleisliDecoder.ts
nav_order: 12
parent: Modules
---

## KleisliDecoder overview

Added in v2.2.7

---

<h2 class="text-delta">Table of contents</h2>

- [Alt](#alt)
  - [alt](#alt)
- [DecodeError](#decodeerror)
  - [DecodeError (type alias)](#decodeerror-type-alias)
  - [error](#error)
  - [failure](#failure)
  - [success](#success)
- [Functor](#functor)
  - [map](#map)
- [combinators](#combinators)
  - [array](#array)
  - [compose](#compose)
  - [intersect](#intersect)
  - [lazy](#lazy)
  - [mapLeftWithInput](#mapleftwithinput)
  - [nullable](#nullable)
  - [parse](#parse)
  - [partial](#partial)
  - [record](#record)
  - [refine](#refine)
  - [sum](#sum)
  - [tuple](#tuple)
  - [type](#type)
  - [union](#union)
- [constructors](#constructors)
  - [fromRefinement](#fromrefinement)
  - [literal](#literal)
- [model](#model)
  - [KleisliDecoder (interface)](#kleislidecoder-interface)
- [utils](#utils)
  - [InputOf (type alias)](#inputof-type-alias)
  - [TypeOf (type alias)](#typeof-type-alias)

---

# Alt

## alt

**Signature**

```ts
export declare const alt: <I, A>(that: () => KleisliDecoder<I, A>) => (me: KleisliDecoder<I, A>) => KleisliDecoder<I, A>
```

Added in v2.2.7

# DecodeError

## DecodeError (type alias)

**Signature**

```ts
export type DecodeError = FS.FreeSemigroup<DE.DecodeError<string>>
```

Added in v2.2.7

## error

**Signature**

```ts
export declare const error: (actual: unknown, message: string) => FS.FreeSemigroup<DE.DecodeError<string>>
```

Added in v2.2.7

## failure

**Signature**

```ts
export declare const failure: <A = never>(
  actual: unknown,
  message: string
) => E.Either<FS.FreeSemigroup<DE.DecodeError<string>>, A>
```

Added in v2.2.7

## success

**Signature**

```ts
export declare const success: <A>(a: A) => E.Either<FS.FreeSemigroup<DE.DecodeError<string>>, A>
```

Added in v2.2.7

# Functor

## map

**Signature**

```ts
export declare const map: <A, B>(f: (a: A) => B) => <I>(fa: KleisliDecoder<I, A>) => KleisliDecoder<I, B>
```

Added in v2.2.7

# combinators

## array

**Signature**

```ts
export declare const array: <I, A>(items: KleisliDecoder<I, A>) => KleisliDecoder<I[], A[]>
```

Added in v2.2.7

## compose

**Signature**

```ts
export declare const compose: <A, B>(
  to: KleisliDecoder<A, B>
) => <I>(from: KleisliDecoder<I, A>) => KleisliDecoder<I, B>
```

Added in v2.2.7

## intersect

**Signature**

```ts
export declare const intersect: <IB, B>(
  right: KleisliDecoder<IB, B>
) => <IA, A>(left: KleisliDecoder<IA, A>) => KleisliDecoder<IA & IB, A & B>
```

Added in v2.2.7

## lazy

**Signature**

```ts
export declare const lazy: <I, A>(id: string, f: () => KleisliDecoder<I, A>) => KleisliDecoder<I, A>
```

Added in v2.2.7

## mapLeftWithInput

**Signature**

```ts
export declare const mapLeftWithInput: <I>(
  f: (input: I, e: FS.FreeSemigroup<DE.DecodeError<string>>) => FS.FreeSemigroup<DE.DecodeError<string>>
) => <A>(decoder: KleisliDecoder<I, A>) => KleisliDecoder<I, A>
```

Added in v2.2.7

## nullable

**Signature**

```ts
export declare const nullable: <I, A>(or: KleisliDecoder<I, A>) => KleisliDecoder<I, A>
```

Added in v2.2.7

## parse

**Signature**

```ts
export declare const parse: <A, B>(
  parser: (a: A) => E.Either<FS.FreeSemigroup<DE.DecodeError<string>>, B>
) => <I>(from: KleisliDecoder<I, A>) => KleisliDecoder<I, B>
```

Added in v2.2.7

## partial

**Signature**

```ts
export declare const partial: <P extends Record<string, KleisliDecoder<any, any>>>(
  properties: P
) => KleisliDecoder<
  { [K in keyof P]: K.InputOf<'Either', P[K]> },
  Partial<{ [K in keyof P]: K.TypeOf<'Either', P[K]> }>
>
```

Added in v2.2.7

## record

**Signature**

```ts
export declare const record: <I, A>(
  codomain: KleisliDecoder<I, A>
) => KleisliDecoder<Record<string, I>, Record<string, A>>
```

Added in v2.2.7

## refine

**Signature**

```ts
export declare const refine: <A, B extends A>(
  refinement: (a: A) => a is B,
  id: string
) => <I>(from: KleisliDecoder<I, A>) => KleisliDecoder<I, B>
```

Added in v2.2.7

## sum

**Signature**

```ts
export declare const sum: <T extends string>(
  tag: T
) => <MS extends Record<string, KleisliDecoder<any, any>>>(
  members: MS
) => KleisliDecoder<K.InputOf<'Either', MS[keyof MS]>, K.TypeOf<'Either', MS[keyof MS]>>
```

Added in v2.2.7

## tuple

**Signature**

```ts
export declare const tuple: <C extends readonly KleisliDecoder<any, any>[]>(
  ...components: C
) => KleisliDecoder<{ [K in keyof C]: K.InputOf<'Either', C[K]> }, { [K in keyof C]: K.TypeOf<'Either', C[K]> }>
```

Added in v2.2.7

## type

**Signature**

```ts
export declare const type: <P extends Record<string, KleisliDecoder<any, any>>>(
  properties: P
) => KleisliDecoder<{ [K in keyof P]: K.InputOf<'Either', P[K]> }, { [K in keyof P]: K.TypeOf<'Either', P[K]> }>
```

Added in v2.2.7

## union

**Signature**

```ts
export declare const union: <MS extends readonly [KleisliDecoder<any, any>, ...KleisliDecoder<any, any>[]]>(
  ...members: MS
) => KleisliDecoder<K.InputOf<'Either', MS[keyof MS]>, K.TypeOf<'Either', MS[keyof MS]>>
```

Added in v2.2.7

# constructors

## fromRefinement

**Signature**

```ts
export declare const fromRefinement: <I, A extends I>(
  refinement: Refinement<I, A>,
  expected: string
) => KleisliDecoder<I, A>
```

Added in v2.2.7

## literal

**Signature**

```ts
export declare const literal: <A extends readonly [Literal, ...Literal[]]>(
  ...values: A
) => KleisliDecoder<unknown, A[number]>
```

Added in v2.2.7

# model

## KleisliDecoder (interface)

**Signature**

```ts
export interface KleisliDecoder<I, A> {
  readonly decode: (i: I) => E.Either<DecodeError, A>
}
```

Added in v2.2.7

# utils

## InputOf (type alias)

**Signature**

```ts
export type InputOf<KD> = K.InputOf<E.URI, KD>
```

Added in v2.2.7

## TypeOf (type alias)

**Signature**

```ts
export type TypeOf<KD> = K.TypeOf<E.URI, KD>
```

Added in v2.2.7
