---
title: index.ts
nav_order: 1
---

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Any](#any)
- [~~AnyC~~](#anyc)
- [AnyProps](#anyprops)
- [ArrayC](#arrayc)
- [BooleanC](#booleanc)
- [Brand](#brand)
- [BrandC](#brandc)
- [Context](#context)
- [ContextEntry](#contextentry)
- [Decoder](#decoder)
- [Encoder](#encoder)
- [Errors](#errors)
- [ExactC](#exactc)
- [FunctionC](#functionc)
- [HasPropsIntersection](#haspropsintersection)
- [HasPropsReadonly](#haspropsreadonly)
- [HasPropsRefinement](#haspropsrefinement)
- [IntBrand](#intbrand)
- [IntersectionC](#intersectionc)
- [KeyofC](#keyofc)
- [LiteralC](#literalc)
- [Mixed](#mixed)
- [~~NeverC~~](#neverc)
- [NullC](#nullc)
- [NumberC](#numberc)
- [~~ObjectC~~](#objectc)
- [PartialC](#partialc)
- [Props](#props)
- [ReadonlyArrayC](#readonlyarrayc)
- [ReadonlyC](#readonlyc)
- [RecordC](#recordc)
- [~~RefinementC~~](#refinementc)
- [~~StrictC~~](#strictc)
- [StringC](#stringc)
- [~~TaggedExact~~](#taggedexact)
- [~~TaggedIntersection~~](#taggedintersection)
- [~~TaggedRefinement~~](#taggedrefinement)
- [~~TaggedUnion~~](#taggedunion)
- [TaggedUnionC](#taggedunionc)
- [TupleC](#tuplec)
- [TypeC](#typec)
- [UndefinedC](#undefinedc)
- [UnionC](#unionc)
- [UnknownArrayC](#unknownarrayc)
- [UnknownC](#unknownc)
- [UnknownRecordC](#unknownrecordc)
- [ValidationError](#validationerror)
- [VoidC](#voidc)
- [Branded](#branded)
- [~~Compact~~](#compact)
- [Decode](#decode)
- [Encode](#encode)
- [~~Exact~~](#exact)
- [HasProps](#hasprops)
- [InputOf](#inputof)
- [Int](#int)
- [Is](#is)
- [OutputOf](#outputof)
- [OutputOfDictionary](#outputofdictionary)
- [OutputOfPartialProps](#outputofpartialprops)
- [OutputOfProps](#outputofprops)
- [~~PropsOf~~](#propsof)
- [~~Tagged~~](#tagged)
- [~~TaggedIntersectionArgument~~](#taggedintersectionargument)
- [~~TaggedProps~~](#taggedprops)
- [TypeOf](#typeof)
- [TypeOfDictionary](#typeofdictionary)
- [TypeOfPartialProps](#typeofpartialprops)
- [TypeOfProps](#typeofprops)
- [Validate](#validate)
- [Validation](#validation)
- [~~mixed~~](#mixed)
- [AnyArrayType](#anyarraytype)
- [AnyDictionaryType](#anydictionarytype)
- [~~AnyType~~](#anytype)
- [ArrayType](#arraytype)
- [BooleanType](#booleantype)
- [DictionaryType](#dictionarytype)
- [ExactType](#exacttype)
- [FunctionType](#functiontype)
- [InterfaceType](#interfacetype)
- [IntersectionType](#intersectiontype)
- [KeyofType](#keyoftype)
- [LiteralType](#literaltype)
- [~~NeverType~~](#nevertype)
- [NullType](#nulltype)
- [NumberType](#numbertype)
- [~~ObjectType~~](#objecttype)
- [PartialType](#partialtype)
- [ReadonlyArrayType](#readonlyarraytype)
- [ReadonlyType](#readonlytype)
- [RecursiveType](#recursivetype)
- [RefinementType](#refinementtype)
- [~~StrictType~~](#stricttype)
- [StringType](#stringtype)
- [TaggedUnionType](#taggeduniontype)
- [TupleType](#tupletype)
- [Type](#type)
  - [pipe](#pipe)
  - [asDecoder](#asdecoder)
  - [asEncoder](#asencoder)
  - [decode](#decode)
- [UndefinedType](#undefinedtype)
- [UnionType](#uniontype)
- [UnknownType](#unknowntype)
- [VoidType](#voidtype)
- [~~Dictionary~~](#dictionary)
- [Function](#function)
- [Int](#int-1)
- [~~Integer~~](#integer)
- [UnknownArray](#unknownarray)
- [UnknownRecord](#unknownrecord)
- [~~any~~](#any)
- [boolean](#boolean)
- [~~dictionary~~](#dictionary)
- [~~never~~](#never)
- [nullType](#nulltype)
- [number](#number)
- [~~object~~](#object)
- [string](#string)
- [unknown](#unknown)
- [voidType](#voidtype)
- [~~alias~~](#alias)
- [appendContext](#appendcontext)
- [array](#array)
- [brand](#brand)
- [~~clean~~](#clean)
- [exact](#exact)
- [failure](#failure)
- [failures](#failures)
- [getContextEntry](#getcontextentry)
- [~~getDefaultContext~~](#getdefaultcontext)
- [getFunctionName](#getfunctionname)
- [~~getValidationError~~](#getvalidationerror)
- [identity](#identity)
- [intersection](#intersection)
- [keyof](#keyof)
- [literal](#literal)
- [partial](#partial)
- [readonly](#readonly)
- [readonlyArray](#readonlyarray)
- [record](#record)
- [recursion](#recursion)
- [~~refinement~~](#refinement)
- [strict](#strict)
- [success](#success)
- [taggedUnion](#taggedunion)
- [tuple](#tuple)
- [type](#type)
- [union](#union)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Any

**Signature** (interface)

```ts
export interface Any extends Type<any, any, any> {}
```

Added in v1.0.0

# ~~AnyC~~

**Signature** (interface)

```ts
export interface AnyC extends AnyType {}
```

Added in v1.5.3

# AnyProps

**Signature** (interface)

```ts
export interface AnyProps {
  [key: string]: Any
}
```

Added in v1.0.0

# ArrayC

**Signature** (interface)

```ts
export interface ArrayC<C extends Mixed> extends ArrayType<C, Array<TypeOf<C>>, Array<OutputOf<C>>, unknown> {}
```

Added in v1.5.3

# BooleanC

**Signature** (interface)

```ts
export interface BooleanC extends BooleanType {}
```

Added in v1.5.3

# Brand

**Signature** (interface)

```ts
export interface Brand<B> {
  readonly [_brand]: B
}
```

Added in v1.8.1

# BrandC

**Signature** (interface)

```ts
export interface BrandC<C extends Any, B> extends RefinementType<C, Branded<TypeOf<C>, B>, OutputOf<C>, InputOf<C>> {}
```

Added in v1.8.1

# Context

**Signature** (interface)

```ts
export interface Context extends ReadonlyArray<ContextEntry> {}
```

Added in v1.0.0

# ContextEntry

**Signature** (interface)

```ts
export interface ContextEntry {
  readonly key: string
  readonly type: Decoder<any, any>
  /** the input data */
  readonly actual?: unknown
}
```

Added in v1.0.0

# Decoder

**Signature** (interface)

```ts
export interface Decoder<I, A> {
  readonly name: string
  readonly validate: Validate<I, A>
  readonly decode: Decode<I, A>
}
```

Added in v1.0.0

# Encoder

**Signature** (interface)

```ts
export interface Encoder<A, O> {
  readonly encode: Encode<A, O>
}
```

Added in v1.0.0

# Errors

**Signature** (interface)

```ts
export interface Errors extends Array<ValidationError> {}
```

Added in v1.0.0

# ExactC

**Signature** (interface)

```ts
export interface ExactC<C extends HasProps> extends ExactType<C, TypeOf<C>, OutputOf<C>, InputOf<C>> {}
```

Added in v1.5.3

# FunctionC

**Signature** (interface)

```ts
export interface FunctionC extends FunctionType {}
```

Added in v1.5.3

# HasPropsIntersection

**Signature** (interface)

```ts
export interface HasPropsIntersection extends IntersectionType<Array<HasProps>, any, any, any> {}
```

Added in v1.1.0

# HasPropsReadonly

**Signature** (interface)

```ts
export interface HasPropsReadonly extends ReadonlyType<HasProps, any, any, any> {}
```

Added in v1.1.0

# HasPropsRefinement

**Signature** (interface)

```ts
export interface HasPropsRefinement extends RefinementType<HasProps, any, any, any> {}
```

Added in v1.1.0

# IntBrand

**Signature** (interface)

```ts
export interface IntBrand {
  readonly Int: unique symbol
}
```

Added in v1.8.1

# IntersectionC

**Signature** (interface)

```ts
export interface IntersectionC<CS extends [Mixed, Mixed, ...Array<Mixed>]>
  extends IntersectionType<
    CS,
    CS extends [Mixed, Mixed]
      ? TypeOf<CS['0']> & TypeOf<CS['1']>
      : CS extends [Mixed, Mixed, Mixed]
      ? TypeOf<CS['0']> & TypeOf<CS['1']> & TypeOf<CS['2']>
      : CS extends [Mixed, Mixed, Mixed, Mixed]
      ? TypeOf<CS['0']> & TypeOf<CS['1']> & TypeOf<CS['2']> & TypeOf<CS['3']>
      : CS extends [Mixed, Mixed, Mixed, Mixed, Mixed]
      ? TypeOf<CS['0']> & TypeOf<CS['1']> & TypeOf<CS['2']> & TypeOf<CS['3']> & TypeOf<CS['4']>
      : unknown,
    CS extends [Mixed, Mixed]
      ? OutputOf<CS['0']> & OutputOf<CS['1']>
      : CS extends [Mixed, Mixed, Mixed]
      ? OutputOf<CS['0']> & OutputOf<CS['1']> & OutputOf<CS['2']>
      : CS extends [Mixed, Mixed, Mixed, Mixed]
      ? OutputOf<CS['0']> & OutputOf<CS['1']> & OutputOf<CS['2']> & OutputOf<CS['3']>
      : CS extends [Mixed, Mixed, Mixed, Mixed, Mixed]
      ? OutputOf<CS['0']> & OutputOf<CS['1']> & OutputOf<CS['2']> & OutputOf<CS['3']> & OutputOf<CS['4']>
      : unknown,
    unknown
  > {}
```

Added in v1.5.3

# KeyofC

**Signature** (interface)

```ts
export interface KeyofC<D extends { [key: string]: unknown }> extends KeyofType<D> {}
```

Added in v1.5.3

# LiteralC

**Signature** (interface)

```ts
export interface LiteralC<V extends LiteralValue> extends LiteralType<V> {}
```

Added in v1.5.3

# Mixed

**Signature** (interface)

```ts
export interface Mixed extends Type<any, any, unknown> {}
```

Added in v1.0.0

# ~~NeverC~~

**Signature** (interface)

```ts
export interface NeverC extends NeverType {}
```

Added in v1.5.3

# NullC

**Signature** (interface)

```ts
export interface NullC extends NullType {}
```

Added in v1.5.3

# NumberC

**Signature** (interface)

```ts
export interface NumberC extends NumberType {}
```

Added in v1.5.3

# ~~ObjectC~~

**Signature** (interface)

```ts
export interface ObjectC extends ObjectType {}
```

Added in v1.5.3

# PartialC

**Signature** (interface)

```ts
export interface PartialC<P extends Props>
  extends PartialType<P, { [K in keyof P]?: TypeOf<P[K]> }, { [K in keyof P]?: OutputOf<P[K]> }, unknown> {}
```

Added in v1.5.3

# Props

**Signature** (interface)

```ts
export interface Props {
  [key: string]: Mixed
}
```

Added in v1.0.0

# ReadonlyArrayC

**Signature** (interface)

```ts
export interface ReadonlyArrayC<C extends Mixed>
  extends ReadonlyArrayType<C, ReadonlyArray<TypeOf<C>>, ReadonlyArray<OutputOf<C>>, unknown> {}
```

Added in v1.5.3

# ReadonlyC

**Signature** (interface)

```ts
export interface ReadonlyC<C extends Mixed>
  extends ReadonlyType<
    C,
    { readonly [K in keyof TypeOf<C>]: TypeOf<C>[K] },
    { readonly [K in keyof OutputOf<C>]: OutputOf<C>[K] },
    unknown
  > {}
```

Added in v1.5.3

# RecordC

**Signature** (interface)

```ts
export interface RecordC<D extends Mixed, C extends Mixed>
  extends DictionaryType<D, C, { [K in TypeOf<D>]: TypeOf<C> }, { [K in OutputOf<D>]: OutputOf<C> }, unknown> {}
```

Added in v1.5.3

# ~~RefinementC~~

Use `BrandC` instead

**Signature** (interface)

```ts
export interface RefinementC<C extends Any> extends RefinementType<C, TypeOf<C>, OutputOf<C>, InputOf<C>> {}
```

Added in v1.5.3

# ~~StrictC~~

**Signature** (interface)

```ts
export interface StrictC<P extends Props>
  extends StrictType<P, { [K in keyof P]: TypeOf<P[K]> }, { [K in keyof P]: OutputOf<P[K]> }, unknown> {}
```

Added in v1.5.3

# StringC

**Signature** (interface)

```ts
export interface StringC extends StringType {}
```

Added in v1.5.3

# ~~TaggedExact~~

**Signature** (interface)

```ts
export interface TaggedExact<Tag extends string, A, O = A> extends ExactType<Tagged<Tag>, A, O> {}
```

Added in v1.3.0

# ~~TaggedIntersection~~

**Signature** (interface)

```ts
export interface TaggedIntersection<Tag extends string, A, O = A>
  extends IntersectionType<TaggedIntersectionArgument<Tag>, A, O> {}
```

Added in v1.3.0

# ~~TaggedRefinement~~

**Signature** (interface)

```ts
export interface TaggedRefinement<Tag extends string, A, O = A> extends RefinementType<Tagged<Tag>, A, O> {}
```

Added in v1.3.0

# ~~TaggedUnion~~

**Signature** (interface)

```ts
export interface TaggedUnion<Tag extends string, A, O = A> extends UnionType<Array<Tagged<Tag>>, A, O> {}
```

Added in v1.3.0

# TaggedUnionC

**Signature** (interface)

```ts
export interface TaggedUnionC<Tag extends string, CS extends [Mixed, Mixed, ...Array<Mixed>]>
  extends TaggedUnionType<Tag, CS, TypeOf<CS[number]>, OutputOf<CS[number]>, unknown> {}
```

Added in v1.5.3

# TupleC

**Signature** (interface)

```ts
export interface TupleC<CS extends [Mixed, ...Array<Mixed>]>
  extends TupleType<
    CS,
    CS extends [Mixed]
      ? [TypeOf<CS['0']>]
      : CS extends [Mixed, Mixed]
      ? [TypeOf<CS['0']>, TypeOf<CS['1']>]
      : CS extends [Mixed, Mixed, Mixed]
      ? [TypeOf<CS['0']>, TypeOf<CS['1']>, TypeOf<CS['2']>]
      : CS extends [Mixed, Mixed, Mixed, Mixed]
      ? [TypeOf<CS['0']>, TypeOf<CS['1']>, TypeOf<CS['2']>, TypeOf<CS['3']>]
      : CS extends [Mixed, Mixed, Mixed, Mixed, Mixed]
      ? [TypeOf<CS['0']>, TypeOf<CS['1']>, TypeOf<CS['2']>, TypeOf<CS['3']>, TypeOf<CS['4']>]
      : unknown,
    CS extends [Mixed]
      ? [OutputOf<CS['0']>]
      : CS extends [Mixed, Mixed]
      ? [OutputOf<CS['0']>, OutputOf<CS['1']>]
      : CS extends [Mixed, Mixed, Mixed]
      ? [OutputOf<CS['0']>, OutputOf<CS['1']>, OutputOf<CS['2']>]
      : CS extends [Mixed, Mixed, Mixed, Mixed]
      ? [OutputOf<CS['0']>, OutputOf<CS['1']>, OutputOf<CS['2']>, OutputOf<CS['3']>]
      : CS extends [Mixed, Mixed, Mixed, Mixed, Mixed]
      ? [OutputOf<CS['0']>, OutputOf<CS['1']>, OutputOf<CS['2']>, OutputOf<CS['3']>, OutputOf<CS['4']>]
      : unknown,
    unknown
  > {}
```

Added in v1.5.3

# TypeC

**Signature** (interface)

```ts
export interface TypeC<P extends Props>
  extends InterfaceType<P, { [K in keyof P]: TypeOf<P[K]> }, { [K in keyof P]: OutputOf<P[K]> }, unknown> {}
```

Added in v1.5.3

# UndefinedC

**Signature** (interface)

```ts
export interface UndefinedC extends UndefinedType {}
```

Added in v1.5.3

# UnionC

**Signature** (interface)

```ts
export interface UnionC<CS extends [Mixed, Mixed, ...Array<Mixed>]>
  extends UnionType<CS, TypeOf<CS[number]>, OutputOf<CS[number]>, unknown> {}
```

Added in v1.5.3

# UnknownArrayC

**Signature** (interface)

```ts
export interface UnknownArrayC extends AnyArrayType {}
```

Added in v1.5.3

# UnknownC

**Signature** (interface)

```ts
export interface UnknownC extends UnknownType {}
```

Added in v1.5.3

# UnknownRecordC

**Signature** (interface)

```ts
export interface UnknownRecordC extends AnyDictionaryType {}
```

Added in v1.5.3

# ValidationError

**Signature** (interface)

```ts
export interface ValidationError {
  /** the offending (sub)value */
  readonly value: unknown
  /** where the error originated */
  readonly context: Context
  /** optional custom error message */
  readonly message?: string
}
```

Added in v1.0.0

# VoidC

**Signature** (interface)

```ts
export interface VoidC extends VoidType {}
```

Added in v1.5.3

# Branded

**Signature** (type alias)

```ts
export type Branded<A, B> = A & Brand<B>
```

Added in v1.8.1

# ~~Compact~~

used in `intersection` as a workaround for #234

**Signature** (type alias)

```ts
export type Compact<A> = { [K in keyof A]: A[K] }
```

Added in v1.4.2

# Decode

**Signature** (type alias)

```ts
export type Decode<I, A> = (i: I) => Validation<A>
```

Added in v1.0.0

# Encode

**Signature** (type alias)

```ts
export type Encode<A, O> = (a: A) => O
```

Added in v1.0.0

# ~~Exact~~

**Signature** (type alias)

```ts
export type Exact<T, X extends T> = T &
  { [K in ({ [K in keyof X]: K } & { [K in keyof T]: never } & { [key: string]: never })[keyof X]]?: never }
```

Added in v1.1.0

# HasProps

**Signature** (type alias)

```ts
export type HasProps =
  | HasPropsRefinement
  | HasPropsReadonly
  | HasPropsIntersection
  | InterfaceType<any, any, any, any>
  | StrictType<any, any, any, any>
  | PartialType<any, any, any, any>
```

Added in v1.1.0

# InputOf

**Signature** (type alias)

```ts
export type InputOf<C extends Any> = C['_I']
```

Added in v1.0.0

# Int

**Signature** (type alias)

```ts
export type Int = Branded<number, IntBrand>
```

Added in v1.8.1

# Is

**Signature** (type alias)

```ts
export type Is<A> = (u: unknown) => u is A
```

Added in v1.0.0

# OutputOf

**Signature** (type alias)

```ts
export type OutputOf<C extends Any> = C['_O']
```

Added in v1.0.0

# OutputOfDictionary

**Signature** (type alias)

```ts
export type OutputOfDictionary<D extends Any, C extends Any> = { [K in OutputOf<D>]: OutputOf<C> }
```

Added in v1.0.0

# OutputOfPartialProps

**Signature** (type alias)

```ts
export type OutputOfPartialProps<P extends AnyProps> = { [K in keyof P]?: OutputOf<P[K]> }
```

Added in v1.0.0

# OutputOfProps

**Signature** (type alias)

```ts
export type OutputOfProps<P extends AnyProps> = { [K in keyof P]: OutputOf<P[K]> }
```

Added in v1.0.0

# ~~PropsOf~~

**Signature** (type alias)

```ts
export type PropsOf<T extends { props: any }> = T['props']
```

Added in v1.0.0

# ~~Tagged~~

**Signature** (type alias)

```ts
export type Tagged<Tag extends string, A = any, O = A> =
  | InterfaceType<TaggedProps<Tag>, A, O>
  | StrictType<TaggedProps<Tag>, A, O>
  | TaggedRefinement<Tag, A, O>
  | TaggedUnion<Tag, A, O>
  | TaggedIntersection<Tag, A, O>
  | TaggedExact<Tag, A, O>
  | RecursiveType<any, A, O>
```

Added in v1.3.0

# ~~TaggedIntersectionArgument~~

**Signature** (type alias)

```ts
export type TaggedIntersectionArgument<Tag extends string> =
  | [Tagged<Tag>]
  | [Tagged<Tag>, Mixed]
  | [Mixed, Tagged<Tag>]
  | [Tagged<Tag>, Mixed, Mixed]
  | [Mixed, Tagged<Tag>, Mixed]
  | [Mixed, Mixed, Tagged<Tag>]
  | [Tagged<Tag>, Mixed, Mixed, Mixed]
  | [Mixed, Tagged<Tag>, Mixed, Mixed]
  | [Mixed, Mixed, Tagged<Tag>, Mixed]
  | [Mixed, Mixed, Mixed, Tagged<Tag>]
  | [Tagged<Tag>, Mixed, Mixed, Mixed, Mixed]
  | [Mixed, Tagged<Tag>, Mixed, Mixed, Mixed]
  | [Mixed, Mixed, Tagged<Tag>, Mixed, Mixed]
  | [Mixed, Mixed, Mixed, Tagged<Tag>, Mixed]
  | [Mixed, Mixed, Mixed, Mixed, Tagged<Tag>]
```

Added in v1.3.0

# ~~TaggedProps~~

**Signature** (type alias)

```ts
export type TaggedProps<Tag extends string> = { [K in Tag]: LiteralType<any> }
```

Added in v1.3.0

# TypeOf

**Signature** (type alias)

```ts
export type TypeOf<C extends Any> = C['_A']
```

Added in v1.0.0

# TypeOfDictionary

**Signature** (type alias)

```ts
export type TypeOfDictionary<D extends Any, C extends Any> = { [K in TypeOf<D>]: TypeOf<C> }
```

Added in v1.0.0

# TypeOfPartialProps

**Signature** (type alias)

```ts
export type TypeOfPartialProps<P extends AnyProps> = { [K in keyof P]?: TypeOf<P[K]> }
```

Added in v1.0.0

# TypeOfProps

**Signature** (type alias)

```ts
export type TypeOfProps<P extends AnyProps> = { [K in keyof P]: TypeOf<P[K]> }
```

Added in v1.0.0

# Validate

**Signature** (type alias)

```ts
export type Validate<I, A> = (i: I, context: Context) => Validation<A>
```

Added in v1.0.0

# Validation

**Signature** (type alias)

```ts
export type Validation<A> = Either<Errors, A>
```

Added in v1.0.0

# ~~mixed~~

Use `unknown` instead

**Signature** (type alias)

```ts
export type mixed = unknown
```

Added in v1.0.0

# AnyArrayType

**Signature** (class)

```ts
export class AnyArrayType {
  constructor() { ... }
  ...
}
```

Added in v1.0.0

# AnyDictionaryType

**Signature** (class)

```ts
export class AnyDictionaryType {
  constructor() { ... }
  ...
}
```

Added in v1.0.0

# ~~AnyType~~

**Signature** (class)

```ts
export class AnyType {
  constructor() { ... }
  ...
}
```

Added in v1.0.0

# ArrayType

**Signature** (class)

```ts
export class ArrayType<C, A, O, I> {
  constructor(
    name: string,
    is: ArrayType<C, A, O, I>['is'],
    validate: ArrayType<C, A, O, I>['validate'],
    encode: ArrayType<C, A, O, I>['encode'],
    readonly type: C
  ) { ... }
  ...
}
```

Added in v1.0.0

# BooleanType

**Signature** (class)

```ts
export class BooleanType {
  constructor() { ... }
  ...
}
```

Added in v1.0.0

# DictionaryType

**Signature** (class)

```ts
export class DictionaryType<D, C, A, O, I> {
  constructor(
    name: string,
    is: DictionaryType<D, C, A, O, I>['is'],
    validate: DictionaryType<D, C, A, O, I>['validate'],
    encode: DictionaryType<D, C, A, O, I>['encode'],
    readonly domain: D,
    readonly codomain: C
  ) { ... }
  ...
}
```

Added in v1.0.0

# ExactType

**Signature** (class)

```ts
export class ExactType<C, A, O, I> {
  constructor(
    name: string,
    is: ExactType<C, A, O, I>['is'],
    validate: ExactType<C, A, O, I>['validate'],
    encode: ExactType<C, A, O, I>['encode'],
    readonly type: C
  ) { ... }
  ...
}
```

Added in v1.1.0

# FunctionType

**Signature** (class)

```ts
export class FunctionType {
  constructor() { ... }
  ...
}
```

Added in v1.0.0

# InterfaceType

**Signature** (class)

```ts
export class InterfaceType<P, A, O, I> {
  constructor(
    name: string,
    is: InterfaceType<P, A, O, I>['is'],
    validate: InterfaceType<P, A, O, I>['validate'],
    encode: InterfaceType<P, A, O, I>['encode'],
    readonly props: P
  ) { ... }
  ...
}
```

Added in v1.0.0

# IntersectionType

**Signature** (class)

```ts
export class IntersectionType<CS, A, O, I> {
  constructor(
    name: string,
    is: IntersectionType<CS, A, O, I>['is'],
    validate: IntersectionType<CS, A, O, I>['validate'],
    encode: IntersectionType<CS, A, O, I>['encode'],
    readonly types: CS
  ) { ... }
  ...
}
```

Added in v1.0.0

# KeyofType

**Signature** (class)

```ts
export class KeyofType<D> {
  constructor(
    name: string,
    is: KeyofType<D>['is'],
    validate: KeyofType<D>['validate'],
    encode: KeyofType<D>['encode'],
    readonly keys: D
  ) { ... }
  ...
}
```

Added in v1.0.0

# LiteralType

**Signature** (class)

```ts
export class LiteralType<V> {
  constructor(
    name: string,
    is: LiteralType<V>['is'],
    validate: LiteralType<V>['validate'],
    encode: LiteralType<V>['encode'],
    readonly value: V
  ) { ... }
  ...
}
```

Added in v1.0.0

# ~~NeverType~~

**Signature** (class)

```ts
export class NeverType {
  constructor() { ... }
  ...
}
```

Added in v1.0.0

# NullType

**Signature** (class)

```ts
export class NullType {
  constructor() { ... }
  ...
}
```

Added in v1.0.0

# NumberType

**Signature** (class)

```ts
export class NumberType {
  constructor() { ... }
  ...
}
```

Added in v1.0.0

# ~~ObjectType~~

**Signature** (class)

```ts
export class ObjectType {
  constructor() { ... }
  ...
}
```

Added in v1.0.0

# PartialType

**Signature** (class)

```ts
export class PartialType<P, A, O, I> {
  constructor(
    name: string,
    is: PartialType<P, A, O, I>['is'],
    validate: PartialType<P, A, O, I>['validate'],
    encode: PartialType<P, A, O, I>['encode'],
    readonly props: P
  ) { ... }
  ...
}
```

Added in v1.0.0

# ReadonlyArrayType

**Signature** (class)

```ts
export class ReadonlyArrayType<C, A, O, I> {
  constructor(
    name: string,
    is: ReadonlyArrayType<C, A, O, I>['is'],
    validate: ReadonlyArrayType<C, A, O, I>['validate'],
    encode: ReadonlyArrayType<C, A, O, I>['encode'],
    readonly type: C
  ) { ... }
  ...
}
```

Added in v1.0.0

# ReadonlyType

**Signature** (class)

```ts
export class ReadonlyType<C, A, O, I> {
  constructor(
    name: string,
    is: ReadonlyType<C, A, O, I>['is'],
    validate: ReadonlyType<C, A, O, I>['validate'],
    encode: ReadonlyType<C, A, O, I>['encode'],
    readonly type: C
  ) { ... }
  ...
}
```

Added in v1.0.0

# RecursiveType

**Signature** (class)

```ts
export class RecursiveType<C, A, O, I> {
  constructor(
    name: string,
    is: RecursiveType<C, A, O, I>['is'],
    validate: RecursiveType<C, A, O, I>['validate'],
    encode: RecursiveType<C, A, O, I>['encode'],
    private runDefinition: () => C
  ) { ... }
  ...
}
```

Added in v1.0.0

# RefinementType

**Signature** (class)

```ts
export class RefinementType<C, A, O, I> {
  constructor(
    name: string,
    is: RefinementType<C, A, O, I>['is'],
    validate: RefinementType<C, A, O, I>['validate'],
    encode: RefinementType<C, A, O, I>['encode'],
    readonly type: C,
    readonly predicate: Predicate<A>
  ) { ... }
  ...
}
```

Added in v1.0.0

# ~~StrictType~~

**Signature** (class)

```ts
export class StrictType<P, A, O, I> {
  constructor(
    name: string,
    is: StrictType<P, A, O, I>['is'],
    validate: StrictType<P, A, O, I>['validate'],
    encode: StrictType<P, A, O, I>['encode'],
    readonly props: P
  ) { ... }
  ...
}
```

Added in v1.0.0

# StringType

**Signature** (class)

```ts
export class StringType {
  constructor() { ... }
  ...
}
```

Added in v1.0.0

# TaggedUnionType

**Signature** (class)

```ts
export class TaggedUnionType<Tag, CS, A, O, I> {
  constructor(
    name: string,
    is: TaggedUnionType<Tag, CS, A, O, I>['is'],
    validate: TaggedUnionType<Tag, CS, A, O, I>['validate'],
    encode: TaggedUnionType<Tag, CS, A, O, I>['encode'],
    codecs: CS,
    readonly tag: Tag
  ) { ... }
  ...
}
```

Added in v1.3.0

# TupleType

**Signature** (class)

```ts
export class TupleType<CS, A, O, I> {
  constructor(
    name: string,
    is: TupleType<CS, A, O, I>['is'],
    validate: TupleType<CS, A, O, I>['validate'],
    encode: TupleType<CS, A, O, I>['encode'],
    readonly types: CS
  ) { ... }
  ...
}
```

Added in v1.0.0

# Type

**Signature** (class)

```ts
export class Type<A, O, I> {
  constructor(
    /** a unique name for this codec */
    readonly name: string,
    /** a custom type guard */
    readonly is: Is<A>,
    /** succeeds if a value of type I can be decoded to a value of type A */
    readonly validate: Validate<I, A>,
    /** converts a value of type A to a value of type O */
    readonly encode: Encode<A, O>
  ) { ... }
  ...
}
```

Added in v1.0.0

## pipe

**Signature** (method)

```ts
pipe<B, IB, A extends IB, OB extends A>(
    this: Type<A, O, I>,
    ab: Type<B, OB, IB>,
    name: string = `pipe($ { ... }
```

## asDecoder

**Signature** (method)

```ts
asDecoder(): Decoder<I, A> { ... }
```

## asEncoder

**Signature** (method)

```ts
asEncoder(): Encoder<A, O> { ... }
```

## decode

a version of `validate` with a default context

**Signature** (method)

```ts
decode(i: I): Validation<A> { ... }
```

# UndefinedType

**Signature** (class)

```ts
export class UndefinedType {
  constructor() { ... }
  ...
}
```

Added in v1.0.0

# UnionType

**Signature** (class)

```ts
export class UnionType<CS, A, O, I> {
  constructor(
    name: string,
    is: UnionType<CS, A, O, I>['is'],
    validate: UnionType<CS, A, O, I>['validate'],
    encode: UnionType<CS, A, O, I>['encode'],
    readonly types: CS
  ) { ... }
  ...
}
```

Added in v1.0.0

# UnknownType

**Signature** (class)

```ts
export class UnknownType {
  constructor() { ... }
  ...
}
```

Added in v1.5.0

# VoidType

**Signature** (class)

```ts
export class VoidType {
  constructor() { ... }
  ...
}
```

Added in v1.2.0

# ~~Dictionary~~

Use `UnknownRecord` instead

**Signature** (constant)

```ts
export const Dictionary: UnknownRecordC = ...
```

Added in v1.0.0

# Function

**Signature** (constant)

```ts
export const Function: FunctionC = ...
```

Added in v1.0.0

# Int

A branded codec representing an integer

**Signature** (constant)

```ts
export const Int = ...
```

Added in v1.8.1

# ~~Integer~~

Use `Int` instead

**Signature** (constant)

```ts
export const Integer = ...
```

Added in v1.0.0

# UnknownArray

**Signature** (constant)

```ts
export const UnknownArray: UnknownArrayC = ...
```

Added in v1.7.1

# UnknownRecord

**Signature** (constant)

```ts
export const UnknownRecord: UnknownRecordC = ...
```

Added in v1.7.1

# ~~any~~

Use `unknown` instead

**Signature** (constant)

```ts
export const any: AnyC = ...
```

Added in v1.0.0

# boolean

**Signature** (constant)

```ts
export const boolean: BooleanC = ...
```

Added in v1.0.0

# ~~dictionary~~

Use `record` instead

**Signature** (constant)

```ts
export const dictionary: typeof record = ...
```

Added in v1.0.0

# ~~never~~

**Signature** (constant)

```ts
export const never: NeverC = ...
```

Added in v1.0.0

# nullType

**Signature** (constant)

```ts
export const nullType: NullC = ...
```

# number

**Signature** (constant)

```ts
export const number: NumberC = ...
```

Added in v1.0.0

# ~~object~~

Use `UnknownRecord` instead

**Signature** (constant)

```ts
export const object: ObjectC = ...
```

Added in v1.0.0

# string

**Signature** (constant)

```ts
export const string: StringC = ...
```

Added in v1.0.0

# unknown

**Signature** (constant)

```ts
export const unknown: UnknownC = ...
```

Added in v1.5.0

# voidType

**Signature** (constant)

```ts
export const voidType: VoidC = ...
```

# ~~alias~~

Keeps the codec "kind"

**Signature** (function)

```ts
export function alias<A, O, P, I>(
  codec: PartialType<P, A, O, I>
): <
  AA extends Exact<A, AA>,
  OO extends Exact<O, OO> = O,
  PP extends Exact<P, PP> = P,
  II extends I = I
>() => PartialType<PP, AA, OO, II>
export function alias<A, O, P, I>(
  codec: StrictType<P, A, O, I>
): <
  AA extends Exact<A, AA>,
  OO extends Exact<O, OO> = O,
  PP extends Exact<P, PP> = P,
  II extends I = I
>() => StrictType<PP, AA, OO, II>
export function alias<A, O, P, I>(
  codec: InterfaceType<P, A, O, I>
): <
  AA extends Exact<A, AA>,
  OO extends Exact<O, OO> = O,
  PP extends Exact<P, PP> = P,
  II extends I = I
>() => InterfaceType<PP, AA, OO, II>
export function alias<A, O, I>(
  codec: Type<A, O, I>
): <AA extends Exact<A, AA>, OO extends Exact<O, OO> = O>() => Type<AA, OO, I> { ... }
```

Added in v1.1.0

# appendContext

**Signature** (function)

```ts
export const appendContext = (c: Context, key: string, decoder: Decoder<any, any>, actual?: unknown): Context => ...
```

Added in v1.0.0

# array

**Signature** (function)

```ts
export const array = <C extends Mixed>(codec: C, name: string = `Array<${codec.name}>`): ArrayC<C> =>
  new ArrayType(
    name,
    (u): u is Array<TypeOf<C>> => UnknownArray.is(u) && u.every(codec.is),
    (u, c) => ...
```

Added in v1.0.0

# brand

**Signature** (function)

```ts
export const brand = <C extends Any, N extends string, B extends { readonly [K in N]: symbol }>(
  codec: C,
  predicate: Refinement<TypeOf<C>, Branded<TypeOf<C>, B>>,
  name: N
): BrandC<C, B> => ...
```

Added in v1.8.1

# ~~clean~~

Drops the codec "kind"

**Signature** (function)

```ts
export function clean<A, O = A, I = unknown>(codec: Type<A, O, I>): Type<A, O, I> { ... }
```

Added in v1.1.0

# exact

Strips additional properties

**Signature** (function)

```ts
export const exact = <C extends HasProps>(codec: C, name: string = getExactTypeName(codec)): ExactC<C> => ...
```

Added in v1.1.0

# failure

**Signature** (function)

```ts
export const failure = <T>(value: unknown, context: Context, message?: string): Validation<T> => ...
```

Added in v1.0.0

# failures

**Signature** (function)

```ts
export const failures = <T>(errors: Errors): Validation<T> => ...
```

Added in v1.0.0

# getContextEntry

**Signature** (function)

```ts
export const getContextEntry = (key: string, decoder: Decoder<any, any>): ContextEntry => ...
```

Added in v1.0.0

# ~~getDefaultContext~~

**Signature** (function)

```ts
export const getDefaultContext /* istanbul ignore next */ = (decoder: Decoder<any, any>): Context => ...
```

Added in v1.0.0

# getFunctionName

**Signature** (function)

```ts
export const getFunctionName = (f: Function): string => ...
```

Added in v1.0.0

# ~~getValidationError~~

**Signature** (function)

```ts
export const getValidationError /* istanbul ignore next */ = (value: unknown, context: Context): ValidationError => ...
```

Added in v1.0.0

# identity

**Signature** (function)

```ts
export const identity = <A>(a: A): A => ...
```

Added in v1.0.0

# intersection

**Signature** (function)

```ts
export function intersection<A extends Mixed, B extends Mixed, C extends Mixed, D extends Mixed, E extends Mixed>(
  codecs: [A, B, C, D, E],
  name?: string
): IntersectionC<[A, B, C, D, E]>
export function intersection<A extends Mixed, B extends Mixed, C extends Mixed, D extends Mixed>(
  codecs: [A, B, C, D],
  name?: string
): IntersectionC<[A, B, C, D]>
export function intersection<A extends Mixed, B extends Mixed, C extends Mixed>(
  codecs: [A, B, C],
  name?: string
): IntersectionC<[A, B, C]>
export function intersection<A extends Mixed, B extends Mixed>(codecs: [A, B], name?: string): IntersectionC<[A, B]>
export function intersection<CS extends [Mixed, Mixed, ...Array<Mixed>]>(
  codecs: CS,
  name: string = `($ { ... }
```

Added in v1.0.0

# keyof

**Signature** (function)

```ts
export const keyof = <D extends { [key: string]: unknown }>(
  keys: D,
  name: string = Object.keys(keys)
    .map(k => JSON.stringify(k))
    .join(' | ')
): KeyofC<D> => ...
```

Added in v1.0.0

# literal

**Signature** (function)

```ts
export const literal = <V extends LiteralValue>(value: V, name: string = JSON.stringify(value)): LiteralC<V> => ...
```

Added in v1.0.0

# partial

**Signature** (function)

```ts
export const partial = <P extends Props>(
  props: P,
  name: string = getPartialTypeName(getInterfaceTypeName(props))
): PartialC<P> => ...
```

Added in v1.0.0

# readonly

**Signature** (function)

```ts
export const readonly = <C extends Mixed>(codec: C, name: string = `Readonly<${codec.name}>`): ReadonlyC<C> =>
  new ReadonlyType(
    name,
    codec.is,
    (u, c) =>
      codec.validate(u, c).map(x => ...
```

Added in v1.0.0

# readonlyArray

**Signature** (function)

```ts
export const readonlyArray = <C extends Mixed>(
  codec: C,
  name: string = `ReadonlyArray<${codec.name}>`
): ReadonlyArrayC<C> => ...
```

Added in v1.0.0

# record

**Signature** (function)

```ts
export const record = <D extends Mixed, C extends Mixed>(
  domain: D,
  codomain: C,
  name: string = `{ [K in ${domain.name}]: ${codomain.name} }`
): RecordC<D, C> => ...
```

Added in v1.7.1

# recursion

**Signature** (function)

```ts
export const recursion = <A, O = A, I = unknown, C extends Type<A, O, I> = Type<A, O, I>>(
  name: string,
  definition: (self: C) => C
): RecursiveType<C, A, O, I> => ...
```

Added in v1.0.0

# ~~refinement~~

Use `brand` instead

**Signature** (function)

```ts
export function refinement<C extends Any>(
  codec: C,
  predicate: Predicate<TypeOf<C>>,
  name: string = `($ { ... }
```

Added in v1.0.0

# strict

Strips additional properties

**Signature** (function)

```ts
export const strict = <P extends Props>(props: P, name?: string): ExactC<TypeC<P>> => ...
```

Added in v1.0.0

# success

**Signature** (function)

```ts
export const success = <T>(value: T): Validation<T> => ...
```

Added in v1.0.0

# taggedUnion

**Signature** (function)

```ts
export const taggedUnion = <Tag extends string, CS extends [Mixed, Mixed, ...Array<Mixed>]>(
  tag: Tag,
  codecs: CS,
  name: string = getUnionName(codecs)
): TaggedUnionC<Tag, CS> => ...
```

Added in v1.3.0

# tuple

**Signature** (function)

```ts
export function tuple<A extends Mixed, B extends Mixed, C extends Mixed, D extends Mixed, E extends Mixed>(
  codecs: [A, B, C, D, E],
  name?: string
): TupleC<[A, B, C, D, E]>
export function tuple<A extends Mixed, B extends Mixed, C extends Mixed, D extends Mixed>(
  codecs: [A, B, C, D],
  name?: string
): TupleC<[A, B, C, D]>
export function tuple<A extends Mixed, B extends Mixed, C extends Mixed>(
  codecs: [A, B, C],
  name?: string
): TupleC<[A, B, C]>
export function tuple<A extends Mixed, B extends Mixed>(codecs: [A, B], name?: string): TupleC<[A, B]>
export function tuple<A extends Mixed>(codecs: [A], name?: string): TupleC<[A]>
export function tuple<CS extends [Mixed, ...Array<Mixed>]>(
  codecs: CS,
  name: string = `[$ { ... }
```

Added in v1.0.0

# type

**Signature** (function)

```ts
export const type = <P extends Props>(props: P, name: string = getInterfaceTypeName(props)): TypeC<P> => ...
```

# union

**Signature** (function)

```ts
export const union = <CS extends [Mixed, Mixed, ...Array<Mixed>]>(
  codecs: CS,
  name: string = getUnionName(codecs)
): UnionC<CS> => ...
```

Added in v1.0.0
