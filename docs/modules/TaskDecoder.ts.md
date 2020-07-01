---
title: TaskDecoder.ts
nav_order: 16
parent: Modules
---

## TaskDecoder overview

**This module is experimental**

Experimental features are published in order to get early feedback from the community, see these tracking
[issues](https://github.com/gcanti/io-ts/issues?q=label%3Av2.2+) for further discussions and enhancements.

A feature tagged as _Experimental_ is in a high state of flux, you're at risk of it changing without notice.

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
  - [fromKleisliDecoder](#fromkleislidecoder)
  - [fromRefinement](#fromrefinement)
  - [literal](#literal)
- [model](#model)
  - [TaskDecoder (interface)](#taskdecoder-interface)
- [utils](#utils)
  - [InputOf (type alias)](#inputof-type-alias)
  - [TypeOf (type alias)](#typeof-type-alias)

---

# Alt

## alt

**Signature**

```ts
export declare const alt: <I, A>(that: () => TaskDecoder<I, A>) => (me: TaskDecoder<I, A>) => TaskDecoder<I, A>
```

Added in v2.2.7

# DecodeError

## DecodeError (type alias)

**Signature**

```ts
export type DecodeError = D.DecodeError
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
) => TE.TaskEither<FS.FreeSemigroup<DE.DecodeError<string>>, A>
```

Added in v2.2.7

## success

**Signature**

```ts
export declare const success: <A>(a: A) => TE.TaskEither<FS.FreeSemigroup<DE.DecodeError<string>>, A>
```

Added in v2.2.7

# Functor

## map

**Signature**

```ts
export declare const map: <A, B>(f: (a: A) => B) => <I>(fa: TaskDecoder<I, A>) => TaskDecoder<I, B>
```

Added in v2.2.7

# combinators

## array

**Signature**

```ts
export declare const array: <I, A>(items: TaskDecoder<I, A>) => TaskDecoder<I[], A[]>
```

Added in v2.2.7

## compose

**Signature**

```ts
export declare const compose: <A, B>(to: TaskDecoder<A, B>) => <I>(from: TaskDecoder<I, A>) => TaskDecoder<I, B>
```

Added in v2.2.7

## intersect

**Signature**

```ts
export declare const intersect: <IB, B>(
  right: TaskDecoder<IB, B>
) => <IA, A>(left: TaskDecoder<IA, A>) => TaskDecoder<IA & IB, A & B>
```

Added in v2.2.7

## lazy

**Signature**

```ts
export declare const lazy: <I, A>(id: string, f: () => TaskDecoder<I, A>) => TaskDecoder<I, A>
```

Added in v2.2.7

## mapLeftWithInput

**Signature**

```ts
export declare const mapLeftWithInput: <I>(
  f: (input: I, e: FS.FreeSemigroup<DE.DecodeError<string>>) => FS.FreeSemigroup<DE.DecodeError<string>>
) => <A>(decoder: TaskDecoder<I, A>) => TaskDecoder<I, A>
```

Added in v2.2.7

## nullable

**Signature**

```ts
export declare const nullable: <I, A>(or: TaskDecoder<I, A>) => TaskDecoder<I, A>
```

Added in v2.2.7

## parse

**Signature**

```ts
export declare const parse: <A, B>(
  parser: (a: A) => TE.TaskEither<FS.FreeSemigroup<DE.DecodeError<string>>, B>
) => <I>(from: TaskDecoder<I, A>) => TaskDecoder<I, B>
```

Added in v2.2.7

## partial

**Signature**

```ts
export declare const partial: <P extends Record<string, TaskDecoder<any, any>>>(
  properties: P
) => TaskDecoder<
  { [K in keyof P]: K.InputOf<'TaskEither', P[K]> },
  Partial<{ [K in keyof P]: K.TypeOf<'TaskEither', P[K]> }>
>
```

Added in v2.2.7

## record

**Signature**

```ts
export declare const record: <I, A>(codomain: TaskDecoder<I, A>) => TaskDecoder<Record<string, I>, Record<string, A>>
```

Added in v2.2.7

## refine

**Signature**

```ts
export declare const refine: <A, B extends A>(
  refinement: (a: A) => a is B,
  id: string
) => <I>(from: TaskDecoder<I, A>) => TaskDecoder<I, B>
```

Added in v2.2.7

## sum

**Signature**

```ts
export declare const sum: <T extends string>(
  tag: T
) => <MS extends Record<string, TaskDecoder<any, any>>>(
  members: MS
) => TaskDecoder<K.InputOf<'TaskEither', MS[keyof MS]>, K.TypeOf<'TaskEither', MS[keyof MS]>>
```

Added in v2.2.7

## tuple

**Signature**

```ts
export declare const tuple: <C extends readonly TaskDecoder<any, any>[]>(
  ...components: C
) => TaskDecoder<{ [K in keyof C]: K.InputOf<'TaskEither', C[K]> }, { [K in keyof C]: K.TypeOf<'TaskEither', C[K]> }>
```

Added in v2.2.7

## type

**Signature**

```ts
export declare const type: <P extends Record<string, TaskDecoder<any, any>>>(
  properties: P
) => TaskDecoder<{ [K in keyof P]: K.InputOf<'TaskEither', P[K]> }, { [K in keyof P]: K.TypeOf<'TaskEither', P[K]> }>
```

Added in v2.2.7

## union

**Signature**

```ts
export declare const union: <MS extends readonly [TaskDecoder<any, any>, ...TaskDecoder<any, any>[]]>(
  ...members: MS
) => TaskDecoder<K.InputOf<'TaskEither', MS[keyof MS]>, K.TypeOf<'TaskEither', MS[keyof MS]>>
```

Added in v2.2.7

# constructors

## fromKleisliDecoder

**Signature**

```ts
export declare const fromKleisliDecoder: <I, A>(decoder: D.Decoder<I, A>) => TaskDecoder<I, A>
```

Added in v2.2.7

## fromRefinement

**Signature**

```ts
export declare const fromRefinement: <I, A extends I>(
  refinement: Refinement<I, A>,
  expected: string
) => TaskDecoder<I, A>
```

Added in v2.2.7

## literal

**Signature**

```ts
export declare const literal: <A extends readonly [S.Literal, ...S.Literal[]]>(
  ...values: A
) => TaskDecoder<unknown, A[number]>
```

Added in v2.2.7

# model

## TaskDecoder (interface)

**Signature**

```ts
export interface TaskDecoder<I, A> extends K.Kleisli<TE.URI, I, DecodeError, A> {}
```

Added in v2.2.7

# utils

## InputOf (type alias)

**Signature**

```ts
export type InputOf<KTD> = K.InputOf<TE.URI, KTD>
```

Added in v2.2.7

## TypeOf (type alias)

**Signature**

```ts
export type TypeOf<KTD> = K.TypeOf<TE.URI, KTD>
```

Added in v2.2.7
