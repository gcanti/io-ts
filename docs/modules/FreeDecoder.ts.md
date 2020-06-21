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
export interface FreeDecoder<A> extends DT.DecoderT<E.URI, FS.FreeSemigroup<DE.DecodeError>, A> {}
```

Added in v2.2.7

## UnknownRecord

**Signature**

```ts
export declare const UnknownRecord: FreeDecoder<Record<string, unknown>>
```

Added in v2.2.7

## number

**Signature**

```ts
export declare const number: FreeDecoder<number>
```

Added in v2.2.7

## string

**Signature**

```ts
export declare const string: FreeDecoder<string>
```

Added in v2.2.7

## toForest

**Signature**

```ts
export declare function toForest(s: FS.FreeSemigroup<DE.DecodeError>): NEA.NonEmptyArray<T.Tree<string>>
```

Added in v2.2.7

## type

**Signature**

```ts
export declare const type: <A>(
  properties: { [K in keyof A]: FreeDecoder<A[K]> }
) => FreeDecoder<{ [K in keyof A]: A[K] }>
```

Added in v2.2.7
