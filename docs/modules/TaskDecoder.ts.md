---
title: TaskDecoder.ts
nav_order: 18
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
  - [fromDecoder](#fromdecoder)
  - [fromGuard](#fromguard)
  - [literal](#literal)
- [instances](#instances)
  - [URI](#uri)
  - [URI (type alias)](#uri-type-alias)
  - [altTaskDecoder](#alttaskdecoder)
  - [functorTaskDecoder](#functortaskdecoder)
  - [schemableTaskDecoder](#schemabletaskdecoder)
- [model](#model)
  - [TaskDecoder (interface)](#taskdecoder-interface)
- [primitives](#primitives)
  - [UnknownArray](#unknownarray)
  - [UnknownRecord](#unknownrecord)
  - [boolean](#boolean)
  - [number](#number)
  - [string](#string)
- [utils](#utils)
  - [TypeOf (type alias)](#typeof-type-alias)
  - [draw](#draw)

---

# Alt

## alt

**Signature**

```ts
export declare const alt: <A>(that: () => TaskDecoder<A>) => (me: TaskDecoder<A>) => TaskDecoder<A>
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
export declare const error: (actual: unknown, message: string) => FreeSemigroup<DecodeError<string>>
```

Added in v2.2.7

## failure

**Signature**

```ts
export declare const failure: <A = never>(
  actual: unknown,
  message: string
) => TE.TaskEither<FreeSemigroup<DecodeError<string>>, A>
```

Added in v2.2.7

## success

**Signature**

```ts
export declare const success: <A>(a: A) => TE.TaskEither<FreeSemigroup<DecodeError<string>>, A>
```

Added in v2.2.7

# Functor

## map

**Signature**

```ts
export declare const map: <A, B>(f: (a: A) => B) => (fa: TaskDecoder<A>) => TaskDecoder<B>
```

Added in v2.2.7

# combinators

## array

**Signature**

```ts
export declare const array: <A>(items: TaskDecoder<A>) => TaskDecoder<A[]>
```

Added in v2.2.7

## compose

**Signature**

```ts
export declare const compose: <A, B>(to: KTD.KleisliTaskDecoder<A, B>) => (from: TaskDecoder<A>) => TaskDecoder<B>
```

Added in v2.2.7

## intersect

**Signature**

```ts
export declare const intersect: <B>(right: TaskDecoder<B>) => <A>(left: TaskDecoder<A>) => TaskDecoder<A & B>
```

Added in v2.2.7

## lazy

**Signature**

```ts
export declare const lazy: <A>(id: string, f: () => TaskDecoder<A>) => TaskDecoder<A>
```

Added in v2.2.7

## mapLeftWithInput

**Signature**

```ts
export declare const mapLeftWithInput: (
  f: (input: unknown, e: FreeSemigroup<DecodeError<string>>) => FreeSemigroup<DecodeError<string>>
) => <A>(decoder: TaskDecoder<A>) => TaskDecoder<A>
```

Added in v2.2.7

## nullable

**Signature**

```ts
export declare const nullable: <A>(or: TaskDecoder<A>) => TaskDecoder<A>
```

Added in v2.2.7

## parse

**Signature**

```ts
export declare const parse: <A, B>(
  parser: (a: A) => TE.TaskEither<FreeSemigroup<DecodeError<string>>, B>
) => (from: TaskDecoder<A>) => TaskDecoder<B>
```

Added in v2.2.7

## partial

**Signature**

```ts
export declare const partial: <A>(
  properties: { [K in keyof A]: TaskDecoder<A[K]> }
) => TaskDecoder<Partial<{ [K in keyof A]: A[K] }>>
```

Added in v2.2.7

## record

**Signature**

```ts
export declare const record: <A>(codomain: TaskDecoder<A>) => TaskDecoder<Record<string, A>>
```

Added in v2.2.7

## refine

**Signature**

```ts
export declare const refine: <A, B extends A>(
  refinement: (a: A) => a is B,
  id: string
) => (from: TaskDecoder<A>) => TaskDecoder<B>
```

Added in v2.2.7

## sum

**Signature**

```ts
export declare const sum: <T extends string>(
  tag: T
) => <A>(members: { [K in keyof A]: TaskDecoder<A[K]> }) => TaskDecoder<A[keyof A]>
```

Added in v2.2.7

## tuple

**Signature**

```ts
export declare const tuple: <A extends readonly unknown[]>(
  ...components: { [K in keyof A]: TaskDecoder<A[K]> }
) => TaskDecoder<A>
```

Added in v2.2.7

## type

**Signature**

```ts
export declare const type: <A>(
  properties: { [K in keyof A]: TaskDecoder<A[K]> }
) => TaskDecoder<{ [K in keyof A]: A[K] }>
```

Added in v2.2.7

## union

**Signature**

```ts
export declare const union: <A extends readonly [unknown, ...unknown[]]>(
  ...members: { [K in keyof A]: TaskDecoder<A[K]> }
) => TaskDecoder<A[number]>
```

Added in v2.2.7

# constructors

## fromDecoder

**Signature**

```ts
export declare const fromDecoder: <A>(decoder: D.Decoder<A>) => TaskDecoder<A>
```

Added in v2.2.7

## fromGuard

**Signature**

```ts
export declare const fromGuard: <A>(guard: G.Guard<A>, expected: string) => TaskDecoder<A>
```

Added in v2.2.7

## literal

**Signature**

```ts
export declare const literal: <A extends readonly [Literal, ...Literal[]]>(...values: A) => TaskDecoder<A[number]>
```

Added in v2.2.7

# instances

## URI

**Signature**

```ts
export declare const URI: 'io-ts/TaskDecoder'
```

Added in v2.2.7

## URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

Added in v2.2.7

## altTaskDecoder

**Signature**

```ts
export declare const altTaskDecoder: Alt1<'io-ts/TaskDecoder'>
```

Added in v2.2.7

## functorTaskDecoder

**Signature**

```ts
export declare const functorTaskDecoder: Functor1<'io-ts/TaskDecoder'>
```

Added in v2.2.7

## schemableTaskDecoder

**Signature**

```ts
export declare const schemableTaskDecoder: Schemable1<'io-ts/TaskDecoder'> &
  WithUnknownContainers1<'io-ts/TaskDecoder'> &
  WithUnion1<'io-ts/TaskDecoder'> &
  WithRefine1<'io-ts/TaskDecoder'>
```

Added in v2.2.7

# model

## TaskDecoder (interface)

**Signature**

```ts
export interface TaskDecoder<A> extends KTD.KleisliTaskDecoder<unknown, A> {}
```

Added in v2.2.7

# primitives

## UnknownArray

**Signature**

```ts
export declare const UnknownArray: TaskDecoder<unknown[]>
```

Added in v2.2.7

## UnknownRecord

**Signature**

```ts
export declare const UnknownRecord: TaskDecoder<Record<string, unknown>>
```

Added in v2.2.7

## boolean

**Signature**

```ts
export declare const boolean: TaskDecoder<boolean>
```

Added in v2.2.7

## number

**Signature**

```ts
export declare const number: TaskDecoder<number>
```

Added in v2.2.7

## string

**Signature**

```ts
export declare const string: TaskDecoder<string>
```

Added in v2.2.7

# utils

## TypeOf (type alias)

**Signature**

```ts
export type TypeOf<TD> = KTD.TypeOf<TD>
```

Added in v2.2.7

## draw

**Signature**

```ts
export declare const draw: (e: FreeSemigroup<DecodeError<string>>) => string
```

Added in v2.2.7
