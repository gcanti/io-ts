---
title: KleisliTaskDecoder.ts
nav_order: 13
parent: Modules
---

## KleisliTaskDecoder overview

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
  - [KleisliTaskDecoder (interface)](#kleislitaskdecoder-interface)
- [utils](#utils)
  - [InputOf (type alias)](#inputof-type-alias)
  - [TypeOf (type alias)](#typeof-type-alias)

---

# Alt

## alt

**Signature**

```ts
export declare const alt: <I, A>(
  that: () => KleisliTaskDecoder<I, A>
) => (me: KleisliTaskDecoder<I, A>) => KleisliTaskDecoder<I, A>
```

Added in v2.2.7

# DecodeError

## DecodeError (type alias)

**Signature**

```ts
export type DecodeError = KD.DecodeError
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
export declare const map: <A, B>(f: (a: A) => B) => <I>(fa: KleisliTaskDecoder<I, A>) => KleisliTaskDecoder<I, B>
```

Added in v2.2.7

# combinators

## array

**Signature**

```ts
export declare const array: <I, A>(items: KleisliTaskDecoder<I, A>) => KleisliTaskDecoder<I[], A[]>
```

Added in v2.2.7

## compose

**Signature**

```ts
export declare const compose: <A, B>(
  to: KleisliTaskDecoder<A, B>
) => <I>(from: KleisliTaskDecoder<I, A>) => KleisliTaskDecoder<I, B>
```

Added in v2.2.7

## intersect

**Signature**

```ts
export declare const intersect: <IB, B>(
  right: KleisliTaskDecoder<IB, B>
) => <IA, A>(left: KleisliTaskDecoder<IA, A>) => KleisliTaskDecoder<IA & IB, A & B>
```

Added in v2.2.7

## lazy

**Signature**

```ts
export declare const lazy: <I, A>(id: string, f: () => KleisliTaskDecoder<I, A>) => KleisliTaskDecoder<I, A>
```

Added in v2.2.7

## mapLeftWithInput

**Signature**

```ts
export declare const mapLeftWithInput: <I>(
  f: (input: I, e: FS.FreeSemigroup<DE.DecodeError<string>>) => FS.FreeSemigroup<DE.DecodeError<string>>
) => <A>(decoder: KleisliTaskDecoder<I, A>) => KleisliTaskDecoder<I, A>
```

Added in v2.2.7

## nullable

**Signature**

```ts
export declare const nullable: <I, A>(or: KleisliTaskDecoder<I, A>) => KleisliTaskDecoder<I, A>
```

Added in v2.2.7

## parse

**Signature**

```ts
export declare const parse: <A, B>(
  parser: (a: A) => TE.TaskEither<FS.FreeSemigroup<DE.DecodeError<string>>, B>
) => <I>(from: KleisliTaskDecoder<I, A>) => KleisliTaskDecoder<I, B>
```

Added in v2.2.7

## partial

**Signature**

```ts
export declare const partial: <P extends Record<string, KleisliTaskDecoder<any, any>>>(
  properties: P
) => KleisliTaskDecoder<
  { [K in keyof P]: K.InputOf<'TaskEither', P[K]> },
  Partial<{ [K in keyof P]: K.TypeOf<'TaskEither', P[K]> }>
>
```

Added in v2.2.7

## record

**Signature**

```ts
export declare const record: <I, A>(
  codomain: KleisliTaskDecoder<I, A>
) => KleisliTaskDecoder<Record<string, I>, Record<string, A>>
```

Added in v2.2.7

## refine

**Signature**

```ts
export declare const refine: <A, B extends A>(
  refinement: (a: A) => a is B,
  id: string
) => <I>(from: KleisliTaskDecoder<I, A>) => KleisliTaskDecoder<I, B>
```

Added in v2.2.7

## sum

**Signature**

```ts
export declare const sum: <T extends string>(
  tag: T
) => <MS extends Record<string, KleisliTaskDecoder<any, any>>>(
  members: MS
) => KleisliTaskDecoder<K.InputOf<'TaskEither', MS[keyof MS]>, K.TypeOf<'TaskEither', MS[keyof MS]>>
```

Added in v2.2.7

## tuple

**Signature**

```ts
export declare const tuple: <C extends readonly KleisliTaskDecoder<any, any>[]>(
  ...components: C
) => KleisliTaskDecoder<
  { [K in keyof C]: K.InputOf<'TaskEither', C[K]> },
  { [K in keyof C]: K.TypeOf<'TaskEither', C[K]> }
>
```

Added in v2.2.7

## type

**Signature**

```ts
export declare const type: <P extends Record<string, KleisliTaskDecoder<any, any>>>(
  properties: P
) => KleisliTaskDecoder<
  { [K in keyof P]: K.InputOf<'TaskEither', P[K]> },
  { [K in keyof P]: K.TypeOf<'TaskEither', P[K]> }
>
```

Added in v2.2.7

## union

**Signature**

```ts
export declare const union: <MS extends readonly [KleisliTaskDecoder<any, any>, ...KleisliTaskDecoder<any, any>[]]>(
  ...members: MS
) => KleisliTaskDecoder<K.InputOf<'TaskEither', MS[keyof MS]>, K.TypeOf<'TaskEither', MS[keyof MS]>>
```

Added in v2.2.7

# constructors

## fromKleisliDecoder

**Signature**

```ts
export declare const fromKleisliDecoder: <I, A>(decoder: KD.KleisliDecoder<I, A>) => KleisliTaskDecoder<I, A>
```

Added in v2.2.7

## fromRefinement

**Signature**

```ts
export declare const fromRefinement: <I, A extends I>(
  refinement: Refinement<I, A>,
  expected: string
) => KleisliTaskDecoder<I, A>
```

Added in v2.2.7

## literal

**Signature**

```ts
export declare const literal: <A extends readonly [Literal, ...Literal[]]>(
  ...values: A
) => KleisliTaskDecoder<unknown, A[number]>
```

Added in v2.2.7

# model

## KleisliTaskDecoder (interface)

**Signature**

```ts
export interface KleisliTaskDecoder<I, A> {
  readonly decode: (i: I) => TE.TaskEither<DecodeError, A>
}
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
