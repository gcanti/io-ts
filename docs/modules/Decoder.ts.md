---
title: Decoder.ts
nav_order: 3
parent: Modules
---

## Decoder overview

Added in v2.2.0

---

<h2 class="text-delta">Table of contents</h2>

- [Alt](#alt)
  - [alt](#alt)
- [DecodeError](#decodeerror)
  - [DecodeError (interface)](#decodeerror-interface)
  - [failure](#failure)
  - [isNotEmpty](#isnotempty)
  - [success](#success)
  - [tree](#tree)
- [Functor](#functor)
  - [map](#map)
- [combinators](#combinators)
  - [array](#array)
  - [intersection](#intersection)
  - [lazy](#lazy)
  - [nullable](#nullable)
  - [parse](#parse)
  - [partial](#partial)
  - [record](#record)
  - [refinement](#refinement)
  - [sum](#sum)
  - [tuple](#tuple)
  - [type](#type)
  - [union](#union)
  - [withExpected](#withexpected)
- [constructors](#constructors)
  - [fromGuard](#fromguard)
  - [literal](#literal)
  - [of](#of)
- [instances](#instances)
  - [URI](#uri)
  - [URI (type alias)](#uri-type-alias)
  - [altDecoder](#altdecoder)
  - [functorDecoder](#functordecoder)
  - [schemableDecoder](#schemabledecoder)
- [model](#model)
  - [Decoder (interface)](#decoder-interface)
- [primitives](#primitives)
  - [UnknownArray](#unknownarray)
  - [UnknownRecord](#unknownrecord)
  - [boolean](#boolean)
  - [never](#never)
  - [number](#number)
  - [string](#string)
- [utils](#utils)
  - [TypeOf (type alias)](#typeof-type-alias)
  - [draw](#draw)
  - [toForest](#toforest)

---

# Alt

## alt

**Signature**

```ts
export declare const alt: <A>(that: () => Decoder<A>) => (fa: Decoder<A>) => Decoder<A>
```

Added in v2.2.0

# DecodeError

## DecodeError (interface)

**Signature**

```ts
export interface DecodeError extends NonEmptyArray<Tree<string>> {}
```

Added in v2.2.2

## failure

**Signature**

```ts
export declare function failure<A = never>(message: string): Either<DecodeError, A>
```

Added in v2.2.0

## isNotEmpty

**Signature**

```ts
export declare function isNotEmpty<A>(as: ReadonlyArray<A>): as is NonEmptyArray<A>
```

Added in v2.2.2

## success

**Signature**

```ts
export declare function success<A>(a: A): Either<DecodeError, A>
```

Added in v2.2.0

## tree

**Signature**

```ts
export declare function tree<A>(value: A, forest: Forest<A> = empty): Tree<A>
```

Added in v2.2.0

# Functor

## map

**Signature**

```ts
export declare const map: <A, B>(f: (a: A) => B) => (fa: Decoder<A>) => Decoder<B>
```

Added in v2.2.0

# combinators

## array

**Signature**

```ts
export declare function array<A>(items: Decoder<A>): Decoder<Array<A>>
```

Added in v2.2.0

## intersection

**Signature**

```ts
export declare function intersection<A, B>(left: Decoder<A>, right: Decoder<B>): Decoder<A & B>
```

Added in v2.2.0

## lazy

**Signature**

```ts
export declare function lazy<A>(id: string, f: () => Decoder<A>): Decoder<A>
```

Added in v2.2.0

## nullable

**Signature**

```ts
export declare function nullable<A>(or: Decoder<A>): Decoder<null | A>
```

Added in v2.2.0

## parse

**Signature**

```ts
export declare function parse<A, B>(from: Decoder<A>, parser: (a: A) => Either<string, B>): Decoder<B>
```

Added in v2.2.0

## partial

**Signature**

```ts
export declare function partial<A>(
  properties: { [K in keyof A]: Decoder<A[K]> }
): Decoder<Partial<{ [K in keyof A]: A[K] }>>
```

Added in v2.2.0

## record

**Signature**

```ts
export declare function record<A>(codomain: Decoder<A>): Decoder<Record<string, A>>
```

Added in v2.2.0

## refinement

**Signature**

```ts
export declare function refinement<A, B extends A>(
  from: Decoder<A>,
  refinement: (a: A) => a is B,
  expected: string
): Decoder<B>
```

Added in v2.2.0

## sum

**Signature**

```ts
export declare function sum<T extends string>(
  tag: T
): <A>(members: { [K in keyof A]: Decoder<A[K]> }) => Decoder<A[keyof A]>
```

Added in v2.2.0

## tuple

**Signature**

```ts
export declare function tuple<A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: Decoder<A[K]> }
): Decoder<A>
```

Added in v2.2.0

## type

**Signature**

```ts
export declare function type<A>(properties: { [K in keyof A]: Decoder<A[K]> }): Decoder<{ [K in keyof A]: A[K] }>
```

Added in v2.2.0

## union

**Signature**

```ts
export declare function union<A extends ReadonlyArray<unknown>>(
  ...members: { [K in keyof A]: Decoder<A[K]> }
): Decoder<A[number]>
```

Added in v2.2.0

## withExpected

**Signature**

```ts
export declare function withExpected<A>(
  decoder: Decoder<A>,
  expected: (actual: unknown, e: DecodeError) => DecodeError
): Decoder<A>
```

Added in v2.2.0

# constructors

## fromGuard

**Signature**

```ts
export declare function fromGuard<A>(guard: G.Guard<A>, expected: string): Decoder<A>
```

Added in v2.2.0

## literal

**Signature**

```ts
export declare const literal: <A extends readonly [Literal, ...Literal[]]>(...values: A) => Decoder<A[number]>
```

Added in v2.2.0

## of

**Signature**

```ts
export declare function of<A>(a: A): Decoder<A>
```

Added in v2.2.3

# instances

## URI

**Signature**

```ts
export declare const URI: 'io-ts/Decoder'
```

Added in v2.2.0

## URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

Added in v2.2.0

## altDecoder

**Signature**

```ts
export declare const altDecoder: Alt1<'io-ts/Decoder'>
```

Added in v2.2.3

## functorDecoder

**Signature**

```ts
export declare const functorDecoder: Functor1<'io-ts/Decoder'>
```

Added in v2.2.3

## schemableDecoder

**Signature**

```ts
export declare const schemableDecoder: Schemable1<'io-ts/Decoder'> &
  WithUnknownContainers1<'io-ts/Decoder'> &
  WithUnion1<'io-ts/Decoder'> &
  WithRefinement1<'io-ts/Decoder'>
```

Added in v2.2.3

# model

## Decoder (interface)

**Signature**

```ts
export interface Decoder<A> {
  readonly decode: (u: unknown) => Either<DecodeError, A>
}
```

Added in v2.2.0

# primitives

## UnknownArray

**Signature**

```ts
export declare const UnknownArray: Decoder<unknown[]>
```

Added in v2.2.0

## UnknownRecord

**Signature**

```ts
export declare const UnknownRecord: Decoder<Record<string, unknown>>
```

Added in v2.2.0

## boolean

**Signature**

```ts
export declare const boolean: Decoder<boolean>
```

Added in v2.2.0

## never

**Signature**

```ts
export declare const never: Decoder<never>
```

Added in v2.2.0

## number

**Signature**

```ts
export declare const number: Decoder<number>
```

Added in v2.2.0

## string

**Signature**

```ts
export declare const string: Decoder<string>
```

Added in v2.2.0

# utils

## TypeOf (type alias)

**Signature**

```ts
export type TypeOf<D> = D extends Decoder<infer A> ? A : never
```

Added in v2.2.0

## draw

**Signature**

```ts
export declare const draw: (e: DecodeError) => string
```

Added in v2.2.7

## toForest

**Signature**

```ts
export declare const toForest: (e: DecodeError) => NonEmptyArray<Tree<string>>
```

Added in v2.2.7
