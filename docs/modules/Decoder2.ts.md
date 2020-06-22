---
title: Decoder2.ts
nav_order: 4
parent: Modules
---

## Decoder2 overview

Added in v2.2.7

---

<h2 class="text-delta">Table of contents</h2>

- [DecodeError](#decodeerror)
  - [DecodeError (type alias)](#decodeerror-type-alias)
  - [failure](#failure)
  - [success](#success)
- [combinators](#combinators)
  - [array](#array)
  - [intersection](#intersection)
  - [nullable](#nullable)
  - [partial](#partial)
  - [record](#record)
  - [refinement](#refinement)
  - [tuple](#tuple)
  - [type](#type)
  - [union](#union)
- [constructors](#constructors)
  - [fromGuard](#fromguard)
  - [literal](#literal)
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
  - [draw](#draw)

---

# DecodeError

## DecodeError (type alias)

**Signature**

```ts
export type DecodeError = FS.FreeSemigroup<DE.DecodeError<string>>
```

Added in v2.2.7

## failure

**Signature**

```ts
export declare function failure<A = never>(actual: unknown, message: string): E.Either<DecodeError, A>
```

Added in v2.2.7

## success

**Signature**

```ts
export declare function success<A>(a: A): E.Either<DecodeError, A>
```

Added in v2.2.7

# combinators

## array

**Signature**

```ts
export declare const array: <A>(items: Decoder<A>) => Decoder<A[]>
```

Added in v2.2.7

## intersection

**Signature**

```ts
export declare const intersection: <A, B>(left: Decoder<A>, right: Decoder<B>) => Decoder<A & B>
```

Added in v2.2.7

## nullable

**Signature**

```ts
export declare const nullable: <A>(or: Decoder<A>) => Decoder<A>
```

Added in v2.2.7

## partial

**Signature**

```ts
export declare const partial: <A>(
  properties: { [K in keyof A]: Decoder<A[K]> }
) => Decoder<Partial<{ [K in keyof A]: A[K] }>>
```

Added in v2.2.7

## record

**Signature**

```ts
export declare const record: <A>(codomain: Decoder<A>) => Decoder<Record<string, A>>
```

Added in v2.2.7

## refinement

**Signature**

```ts
export declare const refinement: <A, B extends A>(
  from: Decoder<A>,
  refinement: (a: A) => a is B,
  expected: string
) => Decoder<B>
```

Added in v2.2.7

## tuple

**Signature**

```ts
export declare const tuple: <A extends readonly unknown[]>(
  ...components: { [K in keyof A]: Decoder<A[K]> }
) => Decoder<A>
```

Added in v2.2.7

## type

**Signature**

```ts
export declare const type: <A>(properties: { [K in keyof A]: Decoder<A[K]> }) => Decoder<{ [K in keyof A]: A[K] }>
```

Added in v2.2.7

## union

**Signature**

```ts
export declare const union: <A extends readonly [unknown, ...unknown[]]>(
  ...members: { [K in keyof A]: Decoder<A[K]> }
) => Decoder<A[number]>
```

Added in v2.2.7

# constructors

## fromGuard

**Signature**

```ts
export declare const fromGuard: <A>(guard: G.Guard<A>, expected: string) => Decoder<A>
```

Added in v2.2.7

## literal

**Signature**

```ts
export declare const literal: <A extends readonly [Literal, ...Literal[]]>(...values: A) => Decoder<A[number]>
```

Added in v2.2.7

# model

## Decoder (interface)

**Signature**

```ts
export interface Decoder<A> {
  readonly decode: (u: unknown) => E.Either<DecodeError, A>
}
```

Added in v2.2.7

# primitives

## UnknownArray

**Signature**

```ts
export declare const UnknownArray: Decoder<unknown[]>
```

Added in v2.2.7

## UnknownRecord

**Signature**

```ts
export declare const UnknownRecord: Decoder<Record<string, unknown>>
```

Added in v2.2.7

## boolean

**Signature**

```ts
export declare const boolean: Decoder<boolean>
```

Added in v2.2.7

## never

**Signature**

```ts
export declare const never: Decoder<never>
```

Added in v2.2.7

## number

**Signature**

```ts
export declare const number: Decoder<number>
```

Added in v2.2.7

## string

**Signature**

```ts
export declare const string: Decoder<string>
```

Added in v2.2.7

# utils

## draw

**Signature**

```ts
export declare const draw: (e: FS.FreeSemigroup<DE.DecodeError<string>>) => string
```

Added in v2.2.7
