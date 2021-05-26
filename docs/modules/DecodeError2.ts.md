---
title: DecodeError2.ts
nav_order: 3
parent: Modules
---

## DecodeError2 overview

**This module is experimental**

Experimental features are published in order to get early feedback from the community, see these tracking
[issues](https://github.com/gcanti/io-ts/issues?q=label%3Av2.2+) for further discussions and enhancements.

A feature tagged as _Experimental_ is in a high state of flux, you're at risk of it changing without notice.

Added in v2.2.17

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [arrayE](#arraye)
  - [booleanLE](#booleanle)
  - [compositionE](#compositione)
  - [compoundE](#compounde)
  - [infinityLE](#infinityle)
  - [intersectionE](#intersectione)
  - [lazyE](#lazye)
  - [leafE](#leafe)
  - [literalLE](#literalle)
  - [memberE](#membere)
  - [messageE](#messagee)
  - [messageLE](#messagele)
  - [missingIndexesE](#missingindexese)
  - [missingKeysE](#missingkeyse)
  - [naNLE](#nanle)
  - [nextE](#nexte)
  - [nullableE](#nullablee)
  - [numberLE](#numberle)
  - [optionalIndexE](#optionalindexe)
  - [optionalKeyE](#optionalkeye)
  - [partialE](#partiale)
  - [prevE](#preve)
  - [recordE](#recorde)
  - [requiredIndexE](#requiredindexe)
  - [requiredKeyE](#requiredkeye)
  - [stringLE](#stringle)
  - [structE](#structe)
  - [sumE](#sume)
  - [tagLE](#tagle)
  - [tupleE](#tuplee)
  - [unexpectedIndexesE](#unexpectedindexese)
  - [unexpectedKeysE](#unexpectedkeyse)
  - [unionE](#unione)
  - [unknownArrayLE](#unknownarrayle)
  - [unknownRecordLE](#unknownrecordle)
- [model](#model)
  - [BooleanE (interface)](#booleane-interface)
  - [BooleanLE (interface)](#booleanle-interface)
  - [BuiltinE (type alias)](#builtine-type-alias)
  - [CompoundE (interface)](#compounde-interface)
  - [CompoundRE (interface)](#compoundre-interface)
  - [DecodeError (type alias)](#decodeerror-type-alias)
  - [InfinityE (interface)](#infinitye-interface)
  - [InfinityLE (interface)](#infinityle-interface)
  - [LazyE (interface)](#lazye-interface)
  - [LazyRE (interface)](#lazyre-interface)
  - [LeafE (interface)](#leafe-interface)
  - [Literal (type alias)](#literal-type-alias)
  - [LiteralE (interface)](#literale-interface)
  - [LiteralLE (interface)](#literalle-interface)
  - [MemberE (interface)](#membere-interface)
  - [MemberRE (interface)](#memberre-interface)
  - [MessageE (interface)](#messagee-interface)
  - [MessageLE (interface)](#messagele-interface)
  - [MissingIndexesE (interface)](#missingindexese-interface)
  - [MissingKeysE (interface)](#missingkeyse-interface)
  - [NaNE (interface)](#nane-interface)
  - [NaNLE (interface)](#nanle-interface)
  - [NextE (interface)](#nexte-interface)
  - [NextRE (interface)](#nextre-interface)
  - [NullableE (interface)](#nullablee-interface)
  - [NullableRE (interface)](#nullablere-interface)
  - [NumberE (interface)](#numbere-interface)
  - [NumberLE (interface)](#numberle-interface)
  - [OptionalIndexE (interface)](#optionalindexe-interface)
  - [OptionalIndexRE (interface)](#optionalindexre-interface)
  - [OptionalKeyE (interface)](#optionalkeye-interface)
  - [OptionalKeyRE (interface)](#optionalkeyre-interface)
  - [PrevE (interface)](#preve-interface)
  - [PrevRE (interface)](#prevre-interface)
  - [RequiredIndexE (interface)](#requiredindexe-interface)
  - [RequiredIndexRE (interface)](#requiredindexre-interface)
  - [RequiredKeyE (interface)](#requiredkeye-interface)
  - [RequiredKeyRE (interface)](#requiredkeyre-interface)
  - [StringE (interface)](#stringe-interface)
  - [StringLE (interface)](#stringle-interface)
  - [SumE (interface)](#sume-interface)
  - [SumRE (interface)](#sumre-interface)
  - [TagE (interface)](#tage-interface)
  - [TagLE (interface)](#tagle-interface)
  - [UnexpectedIndexesE (interface)](#unexpectedindexese-interface)
  - [UnexpectedKeysE (interface)](#unexpectedkeyse-interface)
  - [UnknownArrayE (interface)](#unknownarraye-interface)
  - [UnknownArrayLE (interface)](#unknownarrayle-interface)
  - [UnknownRecordE (interface)](#unknownrecorde-interface)
  - [UnknownRecordLE (interface)](#unknownrecordle-interface)

---

# constructors

## arrayE

**Signature**

```ts
export declare const arrayE: <E>(errors: ReadonlyNonEmptyArray<E>) => CompoundE<E>
```

Added in v2.2.17

## booleanLE

**Signature**

```ts
export declare const booleanLE: (actual: unknown) => BooleanLE
```

Added in v2.2.17

## compositionE

**Signature**

```ts
export declare const compositionE: <E>(errors: ReadonlyNonEmptyArray<E>) => CompoundE<E>
```

Added in v2.2.17

## compoundE

**Signature**

```ts
export declare const compoundE: (name: string) => <E>(errors: ReadonlyNonEmptyArray<E>) => CompoundE<E>
```

Added in v2.2.17

## infinityLE

**Signature**

```ts
export declare const infinityLE: InfinityLE
```

Added in v2.2.17

## intersectionE

**Signature**

```ts
export declare const intersectionE: <E>(errors: ReadonlyNonEmptyArray<E>) => CompoundE<E>
```

Added in v2.2.17

## lazyE

**Signature**

```ts
export declare const lazyE: <E>(id: string, error: E) => LazyE<E>
```

Added in v2.2.17

## leafE

**Signature**

```ts
export declare const leafE: <E>(error: E) => LeafE<E>
```

Added in v2.2.17

## literalLE

**Signature**

```ts
export declare const literalLE: <A extends Literal>(actual: unknown, literals: ReadonlyNonEmptyArray<A>) => LiteralLE<A>
```

Added in v2.2.17

## memberE

**Signature**

```ts
export declare const memberE: <M, E>(member: M, error: E) => MemberE<M, E>
```

Added in v2.2.17

## messageE

**Signature**

```ts
export declare const messageE: (message: string) => MessageE
```

Added in v2.2.17

## messageLE

**Signature**

```ts
export declare const messageLE: (message: string) => MessageLE
```

Added in v2.2.17

## missingIndexesE

**Signature**

```ts
export declare const missingIndexesE: (indexes: ReadonlyNonEmptyArray<number>) => MissingIndexesE
```

Added in v2.2.17

## missingKeysE

**Signature**

```ts
export declare const missingKeysE: (keys: ReadonlyNonEmptyArray<string>) => MissingKeysE
```

Added in v2.2.17

## naNLE

**Signature**

```ts
export declare const naNLE: NaNLE
```

Added in v2.2.17

## nextE

**Signature**

```ts
export declare const nextE: <E>(error: E) => NextE<E>
```

Added in v2.2.17

## nullableE

**Signature**

```ts
export declare const nullableE: <E>(error: E) => NullableE<E>
```

Added in v2.2.17

## numberLE

**Signature**

```ts
export declare const numberLE: (actual: unknown) => NumberLE
```

Added in v2.2.17

## optionalIndexE

**Signature**

```ts
export declare const optionalIndexE: <I, E>(index: I, error: E) => OptionalIndexE<I, E>
```

Added in v2.2.17

## optionalKeyE

**Signature**

```ts
export declare const optionalKeyE: <K, E>(key: K, error: E) => OptionalKeyE<K, E>
```

Added in v2.2.17

## partialE

**Signature**

```ts
export declare const partialE: <E>(errors: ReadonlyNonEmptyArray<E>) => CompoundE<E>
```

Added in v2.2.17

## prevE

**Signature**

```ts
export declare const prevE: <E>(error: E) => PrevE<E>
```

Added in v2.2.17

## recordE

**Signature**

```ts
export declare const recordE: <E>(errors: ReadonlyNonEmptyArray<E>) => CompoundE<E>
```

Added in v2.2.17

## requiredIndexE

**Signature**

```ts
export declare const requiredIndexE: <I, E>(index: I, error: E) => RequiredIndexE<I, E>
```

Added in v2.2.17

## requiredKeyE

**Signature**

```ts
export declare const requiredKeyE: <K, E>(key: K, error: E) => RequiredKeyE<K, E>
```

Added in v2.2.17

## stringLE

**Signature**

```ts
export declare const stringLE: (actual: unknown) => StringLE
```

Added in v2.2.17

## structE

**Signature**

```ts
export declare const structE: <E>(errors: ReadonlyNonEmptyArray<E>) => CompoundE<E>
```

Added in v2.2.17

## sumE

**Signature**

```ts
export declare const sumE: <E>(error: E) => SumE<E>
```

Added in v2.2.17

## tagLE

**Signature**

```ts
export declare const tagLE: (tag: string, literals: ReadonlyArray<string>) => TagLE
```

Added in v2.2.17

## tupleE

**Signature**

```ts
export declare const tupleE: <E>(errors: ReadonlyNonEmptyArray<E>) => CompoundE<E>
```

Added in v2.2.17

## unexpectedIndexesE

**Signature**

```ts
export declare const unexpectedIndexesE: (indexes: ReadonlyNonEmptyArray<number>) => UnexpectedIndexesE
```

Added in v2.2.17

## unexpectedKeysE

**Signature**

```ts
export declare const unexpectedKeysE: (keys: ReadonlyNonEmptyArray<string>) => UnexpectedKeysE
```

Added in v2.2.17

## unionE

**Signature**

```ts
export declare const unionE: <E>(errors: ReadonlyNonEmptyArray<E>) => CompoundE<E>
```

Added in v2.2.17

## unknownArrayLE

**Signature**

```ts
export declare const unknownArrayLE: (actual: unknown) => UnknownArrayLE
```

Added in v2.2.17

## unknownRecordLE

**Signature**

```ts
export declare const unknownRecordLE: (actual: unknown) => UnknownRecordLE
```

Added in v2.2.17

# model

## BooleanE (interface)

**Signature**

```ts
export interface BooleanE {
  readonly _tag: 'BooleanE'
  readonly actual: unknown
}
```

Added in v2.2.17

## BooleanLE (interface)

**Signature**

```ts
export interface BooleanLE extends LeafE<BooleanE> {}
```

Added in v2.2.17

## BuiltinE (type alias)

**Signature**

```ts
export type BuiltinE =
  | StringE
  | NumberE
  | BooleanE
  | UnknownRecordE
  | UnknownArrayE
  | LiteralE<Literal>
  | MessageE
  | NaNE
  | InfinityE
  | TagE
```

Added in v2.2.17

## CompoundE (interface)

**Signature**

```ts
export interface CompoundE<E> {
  readonly _tag: 'CompoundE'
  readonly name: string
  readonly errors: ReadonlyNonEmptyArray<E>
}
```

Added in v2.2.17

## CompoundRE (interface)

**Signature**

```ts
export interface CompoundRE<E> extends CompoundE<DecodeError<E>> {}
```

Added in v2.2.17

## DecodeError (type alias)

**Signature**

```ts
export type DecodeError<E> =
  | UnexpectedKeysE
  | MissingKeysE
  | UnexpectedIndexesE
  | MissingIndexesE
  | LeafE<E>
  | NullableRE<E>
  | PrevRE<E>
  | NextRE<E>
  | RequiredKeyRE<E>
  | OptionalKeyRE<E>
  | RequiredIndexRE<E>
  | OptionalIndexRE<E>
  | MemberRE<E>
  | LazyRE<E>
  | SumRE<E>
  | CompoundRE<E>
```

Added in v2.2.17

## InfinityE (interface)

**Signature**

```ts
export interface InfinityE {
  readonly _tag: 'InfinityE'
}
```

Added in v2.2.17

## InfinityLE (interface)

**Signature**

```ts
export interface InfinityLE extends LeafE<InfinityE> {}
```

Added in v2.2.17

## LazyE (interface)

**Signature**

```ts
export interface LazyE<E> {
  readonly _tag: 'LazyE'
  readonly id: string
  readonly error: E
}
```

Added in v2.2.17

## LazyRE (interface)

**Signature**

```ts
export interface LazyRE<E> extends LazyE<DecodeError<E>> {}
```

Added in v2.2.17

## LeafE (interface)

**Signature**

```ts
export interface LeafE<E> {
  readonly _tag: 'LeafE'
  readonly error: E
}
```

Added in v2.2.17

## Literal (type alias)

**Signature**

```ts
export type Literal = string | number | boolean | null | undefined | symbol
```

Added in v2.2.17

## LiteralE (interface)

**Signature**

```ts
export interface LiteralE<A extends Literal> {
  readonly _tag: 'LiteralE'
  readonly literals: ReadonlyNonEmptyArray<A>
  readonly actual: unknown
}
```

Added in v2.2.17

## LiteralLE (interface)

**Signature**

```ts
export interface LiteralLE<A extends Literal> extends LeafE<LiteralE<A>> {}
```

Added in v2.2.17

## MemberE (interface)

**Signature**

```ts
export interface MemberE<M, E> {
  readonly _tag: 'MemberE'
  readonly member: M
  readonly error: E
}
```

Added in v2.2.17

## MemberRE (interface)

**Signature**

```ts
export interface MemberRE<E> extends MemberE<string | number, DecodeError<E>> {}
```

Added in v2.2.17

## MessageE (interface)

**Signature**

```ts
export interface MessageE {
  readonly _tag: 'MessageE'
  readonly message: string
}
```

Added in v2.2.17

## MessageLE (interface)

**Signature**

```ts
export interface MessageLE extends LeafE<MessageE> {}
```

Added in v2.2.17

## MissingIndexesE (interface)

**Signature**

```ts
export interface MissingIndexesE {
  readonly _tag: 'MissingIndexesE'
  readonly indexes: ReadonlyNonEmptyArray<number>
}
```

Added in v2.2.17

## MissingKeysE (interface)

**Signature**

```ts
export interface MissingKeysE {
  readonly _tag: 'MissingKeysE'
  readonly keys: ReadonlyNonEmptyArray<string>
}
```

Added in v2.2.17

## NaNE (interface)

**Signature**

```ts
export interface NaNE {
  readonly _tag: 'NaNE'
}
```

Added in v2.2.17

## NaNLE (interface)

**Signature**

```ts
export interface NaNLE extends LeafE<NaNE> {}
```

Added in v2.2.17

## NextE (interface)

**Signature**

```ts
export interface NextE<E> {
  readonly _tag: 'NextE'
  readonly error: E
}
```

Added in v2.2.17

## NextRE (interface)

**Signature**

```ts
export interface NextRE<E> extends NextE<DecodeError<E>> {}
```

Added in v2.2.17

## NullableE (interface)

**Signature**

```ts
export interface NullableE<E> {
  readonly _tag: 'NullableE'
  readonly error: E
}
```

Added in v2.2.17

## NullableRE (interface)

**Signature**

```ts
export interface NullableRE<E> extends NullableE<DecodeError<E>> {}
```

Added in v2.2.17

## NumberE (interface)

**Signature**

```ts
export interface NumberE {
  readonly _tag: 'NumberE'
  readonly actual: unknown
}
```

Added in v2.2.17

## NumberLE (interface)

**Signature**

```ts
export interface NumberLE extends LeafE<NumberE> {}
```

Added in v2.2.17

## OptionalIndexE (interface)

**Signature**

```ts
export interface OptionalIndexE<I, E> {
  readonly _tag: 'OptionalIndexE'
  readonly index: I
  readonly error: E
}
```

Added in v2.2.17

## OptionalIndexRE (interface)

**Signature**

```ts
export interface OptionalIndexRE<E> extends OptionalIndexE<number, DecodeError<E>> {}
```

Added in v2.2.17

## OptionalKeyE (interface)

**Signature**

```ts
export interface OptionalKeyE<K, E> {
  readonly _tag: 'OptionalKeyE'
  readonly key: K
  readonly error: E
}
```

Added in v2.2.17

## OptionalKeyRE (interface)

**Signature**

```ts
export interface OptionalKeyRE<E> extends OptionalKeyE<string, DecodeError<E>> {}
```

Added in v2.2.17

## PrevE (interface)

**Signature**

```ts
export interface PrevE<E> {
  readonly _tag: 'PrevE'
  readonly error: E
}
```

Added in v2.2.17

## PrevRE (interface)

**Signature**

```ts
export interface PrevRE<E> extends PrevE<DecodeError<E>> {}
```

Added in v2.2.17

## RequiredIndexE (interface)

**Signature**

```ts
export interface RequiredIndexE<I, E> {
  readonly _tag: 'RequiredIndexE'
  readonly index: I
  readonly error: E
}
```

Added in v2.2.17

## RequiredIndexRE (interface)

**Signature**

```ts
export interface RequiredIndexRE<E> extends RequiredIndexE<string | number, DecodeError<E>> {}
```

Added in v2.2.17

## RequiredKeyE (interface)

**Signature**

```ts
export interface RequiredKeyE<K, E> {
  readonly _tag: 'RequiredKeyE'
  readonly key: K
  readonly error: E
}
```

Added in v2.2.17

## RequiredKeyRE (interface)

**Signature**

```ts
export interface RequiredKeyRE<E> extends RequiredKeyE<string, DecodeError<E>> {}
```

Added in v2.2.17

## StringE (interface)

**Signature**

```ts
export interface StringE {
  readonly _tag: 'StringE'
  readonly actual: unknown
}
```

Added in v2.2.17

## StringLE (interface)

**Signature**

```ts
export interface StringLE extends LeafE<StringE> {}
```

Added in v2.2.17

## SumE (interface)

**Signature**

```ts
export interface SumE<E> {
  readonly _tag: 'SumE'
  readonly error: E
}
```

Added in v2.2.17

## SumRE (interface)

**Signature**

```ts
export interface SumRE<E> extends SumE<DecodeError<E>> {}
```

Added in v2.2.17

## TagE (interface)

**Signature**

```ts
export interface TagE {
  readonly _tag: 'TagE'
  readonly tag: string
  readonly literals: ReadonlyArray<string>
}
```

Added in v2.2.17

## TagLE (interface)

**Signature**

```ts
export interface TagLE extends LeafE<TagE> {}
```

Added in v2.2.17

## UnexpectedIndexesE (interface)

**Signature**

```ts
export interface UnexpectedIndexesE {
  readonly _tag: 'UnexpectedIndexesE'
  readonly indexes: ReadonlyNonEmptyArray<number>
}
```

Added in v2.2.17

## UnexpectedKeysE (interface)

**Signature**

```ts
export interface UnexpectedKeysE {
  readonly _tag: 'UnexpectedKeysE'
  readonly keys: ReadonlyNonEmptyArray<string>
}
```

Added in v2.2.17

## UnknownArrayE (interface)

**Signature**

```ts
export interface UnknownArrayE {
  readonly _tag: 'UnknownArrayE'
  readonly actual: unknown
}
```

Added in v2.2.17

## UnknownArrayLE (interface)

**Signature**

```ts
export interface UnknownArrayLE extends LeafE<UnknownArrayE> {}
```

Added in v2.2.17

## UnknownRecordE (interface)

**Signature**

```ts
export interface UnknownRecordE {
  readonly _tag: 'UnknownRecordE'
  readonly actual: unknown
}
```

Added in v2.2.17

## UnknownRecordLE (interface)

**Signature**

```ts
export interface UnknownRecordLE extends LeafE<UnknownRecordE> {}
```

Added in v2.2.17
