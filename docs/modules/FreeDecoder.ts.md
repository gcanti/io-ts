---
title: FreeDecoder.ts
nav_order: 7
parent: Modules
---

## FreeDecoder overview

Added in v2.2.7

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [FreeDecoder (interface)](#freedecoder-interface)
  - [UnknownRecord](#unknownrecord)
  - [number](#number)
  - [string](#string)
  - [toForest](#toforest)
  - [type](#type)

---

# utils

## FreeDecoder (interface)

**Signature**

```ts
export interface FreeDecoder<E, A> extends DT.DecoderT<E.URI, FS.FreeSemigroup<DE.DecodeError<E>>, A> {}
```

Added in v2.2.7

## UnknownRecord

**Signature**

```ts
export declare const UnknownRecord: <E>(e: E) => FreeDecoder<E, Record<string, unknown>>
```

Added in v2.2.7

## number

**Signature**

```ts
export declare const number: <E>(e: E) => FreeDecoder<E, number>
```

Added in v2.2.7

## string

**Signature**

```ts
export declare const string: <E>(e: E) => FreeDecoder<E, string>
```

Added in v2.2.7

## toForest

**Signature**

```ts
export declare function toForest<E>(s: FS.FreeSemigroup<DE.DecodeError<E>>): NEA.NonEmptyArray<T.Tree<string>>
```

Added in v2.2.7

## type

**Signature**

```ts
export declare const type: <E>(
  UnknownRecord: FreeDecoder<E, Record<string, unknown>>
) => <A>(properties: { [K in keyof A]: FreeDecoder<E, A[K]> }) => FreeDecoder<E, { [K in keyof A]: A[K] }>
```

Added in v2.2.7
