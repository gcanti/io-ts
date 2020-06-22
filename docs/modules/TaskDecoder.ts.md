---
title: TaskDecoder.ts
nav_order: 17
parent: Modules
---

## TaskDecoder overview

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
  - [sum](#sum)
  - [tuple](#tuple)
  - [type](#type)
  - [union](#union)
- [constructors](#constructors)
  - [fromGuard](#fromguard)
  - [literal](#literal)
- [model](#model)
  - [TaskDecoder (interface)](#taskdecoder-interface)
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
export declare function failure<A = never>(actual: unknown, message: string): TE.TaskEither<DecodeError, A>
```

Added in v2.2.7

## success

**Signature**

```ts
export declare function success<A>(a: A): TE.TaskEither<DecodeError, A>
```

Added in v2.2.7

# combinators

## array

**Signature**

```ts
export declare const array: <A>(items: TaskDecoder<A>) => TaskDecoder<A[]>
```

Added in v2.2.7

## intersection

**Signature**

```ts
export declare const intersection: <A, B>(left: TaskDecoder<A>, right: TaskDecoder<B>) => TaskDecoder<A & B>
```

Added in v2.2.7

## nullable

**Signature**

```ts
export declare const nullable: <A>(or: TaskDecoder<A>) => TaskDecoder<A>
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

## refinement

**Signature**

```ts
export declare const refinement: <A, B extends A>(
  from: TaskDecoder<A>,
  refinement: (a: A) => a is B,
  expected: string
) => TaskDecoder<B>
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

# model

## TaskDecoder (interface)

**Signature**

```ts
export interface TaskDecoder<A> {
  readonly decode: (u: unknown) => TE.TaskEither<DecodeError, A>
}
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

## never

**Signature**

```ts
export declare const never: TaskDecoder<never>
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

## draw

**Signature**

```ts
export declare const draw: (e: FS.FreeSemigroup<DE.DecodeError<string>>) => string
```

Added in v2.2.7
