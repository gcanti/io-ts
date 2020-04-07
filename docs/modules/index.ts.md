---
title: index.ts
nav_order: 5
parent: Modules
---

# index overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Any (interface)](#any-interface)
- [~~AnyC~~ (interface)](#anyc-interface)
- [AnyProps (interface)](#anyprops-interface)
- [ArrayC (interface)](#arrayc-interface)
- [BigIntC (interface)](#bigintc-interface)
- [BooleanC (interface)](#booleanc-interface)
- [Brand (interface)](#brand-interface)
- [BrandC (interface)](#brandc-interface)
- [Context (interface)](#context-interface)
- [ContextEntry (interface)](#contextentry-interface)
- [Decoder (interface)](#decoder-interface)
- [Encoder (interface)](#encoder-interface)
- [Errors (interface)](#errors-interface)
- [ExactC (interface)](#exactc-interface)
- [~~FunctionC~~ (interface)](#functionc-interface)
- [HasPropsIntersection (interface)](#haspropsintersection-interface)
- [HasPropsReadonly (interface)](#haspropsreadonly-interface)
- [HasPropsRefinement (interface)](#haspropsrefinement-interface)
- [IntBrand (interface)](#intbrand-interface)
- [IntersectionC (interface)](#intersectionc-interface)
- [KeyofC (interface)](#keyofc-interface)
- [LiteralC (interface)](#literalc-interface)
- [Mixed (interface)](#mixed-interface)
- [~~NeverC~~ (interface)](#neverc-interface)
- [NullC (interface)](#nullc-interface)
- [NumberC (interface)](#numberc-interface)
- [~~ObjectC~~ (interface)](#objectc-interface)
- [PartialC (interface)](#partialc-interface)
- [Props (interface)](#props-interface)
- [ReadonlyArrayC (interface)](#readonlyarrayc-interface)
- [ReadonlyC (interface)](#readonlyc-interface)
- [RecordC (interface)](#recordc-interface)
- [~~RefinementC~~ (interface)](#refinementc-interface)
- [~~StrictC~~ (interface)](#strictc-interface)
- [StringC (interface)](#stringc-interface)
- [~~TaggedExact~~ (interface)](#taggedexact-interface)
- [~~TaggedIntersection~~ (interface)](#taggedintersection-interface)
- [~~TaggedRefinement~~ (interface)](#taggedrefinement-interface)
- [~~TaggedUnion~~ (interface)](#taggedunion-interface)
- [~~TaggedUnionC~~ (interface)](#taggedunionc-interface)
- [TupleC (interface)](#tuplec-interface)
- [TypeC (interface)](#typec-interface)
- [UndefinedC (interface)](#undefinedc-interface)
- [UnionC (interface)](#unionc-interface)
- [UnknownArrayC (interface)](#unknownarrayc-interface)
- [UnknownC (interface)](#unknownc-interface)
- [UnknownRecordC (interface)](#unknownrecordc-interface)
- [ValidationError (interface)](#validationerror-interface)
- [VoidC (interface)](#voidc-interface)
- [Branded (type alias)](#branded-type-alias)
- [~~Compact~~ (type alias)](#compact-type-alias)
- [Decode (type alias)](#decode-type-alias)
- [Encode (type alias)](#encode-type-alias)
- [~~Exact~~ (type alias)](#exact-type-alias)
- [HasProps (type alias)](#hasprops-type-alias)
- [InputOf (type alias)](#inputof-type-alias)
- [Int (type alias)](#int-type-alias)
- [Is (type alias)](#is-type-alias)
- [OutputOf (type alias)](#outputof-type-alias)
- [OutputOfDictionary (type alias)](#outputofdictionary-type-alias)
- [OutputOfPartialProps (type alias)](#outputofpartialprops-type-alias)
- [OutputOfProps (type alias)](#outputofprops-type-alias)
- [~~PropsOf~~ (type alias)](#propsof-type-alias)
- [~~Tagged~~ (type alias)](#tagged-type-alias)
- [~~TaggedIntersectionArgument~~ (type alias)](#taggedintersectionargument-type-alias)
- [~~TaggedProps~~ (type alias)](#taggedprops-type-alias)
- [TypeOf (type alias)](#typeof-type-alias)
- [TypeOfDictionary (type alias)](#typeofdictionary-type-alias)
- [TypeOfPartialProps (type alias)](#typeofpartialprops-type-alias)
- [TypeOfProps (type alias)](#typeofprops-type-alias)
- [Validate (type alias)](#validate-type-alias)
- [Validation (type alias)](#validation-type-alias)
- [~~mixed~~ (type alias)](#mixed-type-alias)
- [AnyArrayType (class)](#anyarraytype-class)
  - [\_tag (property)](#_tag-property)
- [AnyDictionaryType (class)](#anydictionarytype-class)
  - [\_tag (property)](#_tag-property-1)
- [~~AnyType~~ (class)](#anytype-class)
  - [\_tag (property)](#_tag-property-2)
- [ArrayType (class)](#arraytype-class)
  - [\_tag (property)](#_tag-property-3)
- [BigIntType (class)](#biginttype-class)
  - [\_tag (property)](#_tag-property-4)
- [BooleanType (class)](#booleantype-class)
  - [\_tag (property)](#_tag-property-5)
- [DictionaryType (class)](#dictionarytype-class)
  - [\_tag (property)](#_tag-property-6)
- [ExactType (class)](#exacttype-class)
  - [\_tag (property)](#_tag-property-7)
- [~~FunctionType~~ (class)](#functiontype-class)
  - [\_tag (property)](#_tag-property-8)
- [InterfaceType (class)](#interfacetype-class)
  - [\_tag (property)](#_tag-property-9)
- [IntersectionType (class)](#intersectiontype-class)
  - [\_tag (property)](#_tag-property-10)
- [KeyofType (class)](#keyoftype-class)
  - [\_tag (property)](#_tag-property-11)
- [LiteralType (class)](#literaltype-class)
  - [\_tag (property)](#_tag-property-12)
- [~~NeverType~~ (class)](#nevertype-class)
  - [\_tag (property)](#_tag-property-13)
- [NullType (class)](#nulltype-class)
  - [\_tag (property)](#_tag-property-14)
- [NumberType (class)](#numbertype-class)
  - [\_tag (property)](#_tag-property-15)
- [~~ObjectType~~ (class)](#objecttype-class)
  - [\_tag (property)](#_tag-property-16)
- [PartialType (class)](#partialtype-class)
  - [\_tag (property)](#_tag-property-17)
- [ReadonlyArrayType (class)](#readonlyarraytype-class)
  - [\_tag (property)](#_tag-property-18)
- [ReadonlyType (class)](#readonlytype-class)
  - [\_tag (property)](#_tag-property-19)
- [RecursiveType (class)](#recursivetype-class)
  - [\_tag (property)](#_tag-property-20)
  - [type (property)](#type-property)
- [RefinementType (class)](#refinementtype-class)
  - [\_tag (property)](#_tag-property-21)
- [~~StrictType~~ (class)](#stricttype-class)
  - [\_tag (property)](#_tag-property-22)
- [StringType (class)](#stringtype-class)
  - [\_tag (property)](#_tag-property-23)
- [~~TaggedUnionType~~ (class)](#taggeduniontype-class)
- [TupleType (class)](#tupletype-class)
  - [\_tag (property)](#_tag-property-24)
- [Type (class)](#type-class)
  - [pipe (method)](#pipe-method)
  - [asDecoder (method)](#asdecoder-method)
  - [asEncoder (method)](#asencoder-method)
  - [decode (method)](#decode-method)
  - [\_A (property)](#_a-property)
  - [\_O (property)](#_o-property)
  - [\_I (property)](#_i-property)
- [UndefinedType (class)](#undefinedtype-class)
  - [\_tag (property)](#_tag-property-25)
- [UnionType (class)](#uniontype-class)
  - [\_tag (property)](#_tag-property-26)
- [UnknownType (class)](#unknowntype-class)
  - [\_tag (property)](#_tag-property-27)
- [VoidType (class)](#voidtype-class)
  - [\_tag (property)](#_tag-property-28)
- [Int](#int)
- [UnknownArray](#unknownarray)
- [UnknownRecord](#unknownrecord)
- [appendContext](#appendcontext)
- [array](#array)
- [bigint](#bigint)
- [boolean](#boolean)
- [brand](#brand)
- [exact](#exact)
- [failure](#failure)
- [failures](#failures)
- [getContextEntry](#getcontextentry)
- [getFunctionName](#getfunctionname)
- [identity](#identity)
- [intersection](#intersection)
- [keyof](#keyof)
- [literal](#literal)
- [null](#null)
- [nullType](#nulltype)
- [number](#number)
- [partial](#partial)
- [readonly](#readonly)
- [readonlyArray](#readonlyarray)
- [record](#record)
- [recursion](#recursion)
- [strict](#strict)
- [string](#string)
- [success](#success)
- [tuple](#tuple)
- [type](#type)
- [undefined](#undefined)
- [union](#union)
- [unknown](#unknown)
- [void](#void)
- [voidType](#voidtype)
- [~~Array~~](#array)
- [~~Dictionary~~](#dictionary)
- [~~Function~~](#function)
- [~~Integer~~](#integer)
- [~~alias~~](#alias)
- [~~any~~](#any)
- [~~clean~~](#clean)
- [~~dictionary~~](#dictionary)
- [~~getDefaultContext~~](#getdefaultcontext)
- [~~getValidationError~~](#getvalidationerror)
- [~~interface~~](#interface)
- [~~never~~](#never)
- [~~object~~](#object)
- [~~refinement~~](#refinement)
- [~~taggedUnion~~](#taggedunion)

---

# Any (interface)

**Signature**

```ts
export interface Any extends Type<any, any, any> {}
```

Added in v1.0.0

# ~~AnyC~~ (interface)

**Signature**

```ts
export interface AnyC extends AnyType {}
```

Added in v1.5.3

# AnyProps (interface)

**Signature**

```ts
export interface AnyProps {
  [key: string]: Any
}
```

Added in v1.0.0

# ArrayC (interface)

**Signature**

```ts
export interface ArrayC<C extends Mixed> extends ArrayType<C, Array<TypeOf<C>>, Array<OutputOf<C>>, unknown> {}
```

Added in v1.5.3

# BigIntC (interface)

**Signature**

```ts
export interface BigIntC extends BigIntType {}
```

Added in v2.1.0

# BooleanC (interface)

**Signature**

```ts
export interface BooleanC extends BooleanType {}
```

Added in v1.5.3

# Brand (interface)

**Signature**

```ts
export interface Brand<B> {
  readonly [_brand]: B
}
```

Added in v1.8.1

# BrandC (interface)

**Signature**

```ts
export interface BrandC<C extends Any, B> extends RefinementType<C, Branded<TypeOf<C>, B>, OutputOf<C>, InputOf<C>> {}
```

Added in v1.8.1

# Context (interface)

**Signature**

```ts
export interface Context extends ReadonlyArray<ContextEntry> {}
```

Added in v1.0.0

# ContextEntry (interface)

**Signature**

```ts
export interface ContextEntry {
  readonly key: string
  readonly type: Decoder<any, any>
  /** the input data */
  readonly actual?: unknown
}
```

Added in v1.0.0

# Decoder (interface)

**Signature**

```ts
export interface Decoder<I, A> {
  readonly name: string
  readonly validate: Validate<I, A>
  readonly decode: Decode<I, A>
}
```

Added in v1.0.0

# Encoder (interface)

**Signature**

```ts
export interface Encoder<A, O> {
  readonly encode: Encode<A, O>
}
```

Added in v1.0.0

# Errors (interface)

**Signature**

```ts
export interface Errors extends Array<ValidationError> {}
```

Added in v1.0.0

# ExactC (interface)

**Signature**

```ts
export interface ExactC<C extends HasProps> extends ExactType<C, TypeOf<C>, OutputOf<C>, InputOf<C>> {}
```

Added in v1.5.3

# ~~FunctionC~~ (interface)

**Signature**

```ts
export interface FunctionC extends FunctionType {}
```

Added in v1.5.3

# HasPropsIntersection (interface)

**Signature**

```ts
export interface HasPropsIntersection extends IntersectionType<Array<HasProps>, any, any, any> {}
```

Added in v1.1.0

# HasPropsReadonly (interface)

**Signature**

```ts
export interface HasPropsReadonly extends ReadonlyType<HasProps, any, any, any> {}
```

Added in v1.1.0

# HasPropsRefinement (interface)

**Signature**

```ts
export interface HasPropsRefinement extends RefinementType<HasProps, any, any, any> {}
```

Added in v1.1.0

# IntBrand (interface)

**Signature**

```ts
export interface IntBrand {
  readonly Int: unique symbol
}
```

Added in v1.8.1

# IntersectionC (interface)

**Signature**

```ts
export interface IntersectionC<CS extends [Mixed, Mixed, ...Array<Mixed>]>
  extends IntersectionType<
    CS,
    CS extends { length: 2 }
      ? TypeOf<CS[0]> & TypeOf<CS[1]>
      : CS extends { length: 3 }
      ? TypeOf<CS[0]> & TypeOf<CS[1]> & TypeOf<CS[2]>
      : CS extends { length: 4 }
      ? TypeOf<CS[0]> & TypeOf<CS[1]> & TypeOf<CS[2]> & TypeOf<CS[3]>
      : CS extends { length: 5 }
      ? TypeOf<CS[0]> & TypeOf<CS[1]> & TypeOf<CS[2]> & TypeOf<CS[3]> & TypeOf<CS[4]>
      : unknown,
    CS extends { length: 2 }
      ? OutputOf<CS[0]> & OutputOf<CS[1]>
      : CS extends { length: 3 }
      ? OutputOf<CS[0]> & OutputOf<CS[1]> & OutputOf<CS[2]>
      : CS extends { length: 4 }
      ? OutputOf<CS[0]> & OutputOf<CS[1]> & OutputOf<CS[2]> & OutputOf<CS[3]>
      : CS extends { length: 5 }
      ? OutputOf<CS[0]> & OutputOf<CS[1]> & OutputOf<CS[2]> & OutputOf<CS[3]> & OutputOf<CS[4]>
      : unknown,
    unknown
  > {}
```

Added in v1.5.3

# KeyofC (interface)

**Signature**

```ts
export interface KeyofC<D extends { [key: string]: unknown }> extends KeyofType<D> {}
```

Added in v1.5.3

# LiteralC (interface)

**Signature**

```ts
export interface LiteralC<V extends LiteralValue> extends LiteralType<V> {}
```

Added in v1.5.3

# Mixed (interface)

**Signature**

```ts
export interface Mixed extends Type<any, any, unknown> {}
```

Added in v1.0.0

# ~~NeverC~~ (interface)

**Signature**

```ts
export interface NeverC extends NeverType {}
```

Added in v1.5.3

# NullC (interface)

**Signature**

```ts
export interface NullC extends NullType {}
```

Added in v1.5.3

# NumberC (interface)

**Signature**

```ts
export interface NumberC extends NumberType {}
```

Added in v1.5.3

# ~~ObjectC~~ (interface)

**Signature**

```ts
export interface ObjectC extends ObjectType {}
```

Added in v1.5.3

# PartialC (interface)

**Signature**

```ts
export interface PartialC<P extends Props>
  extends PartialType<P, { [K in keyof P]?: TypeOf<P[K]> }, { [K in keyof P]?: OutputOf<P[K]> }, unknown> {}
```

Added in v1.5.3

# Props (interface)

**Signature**

```ts
export interface Props {
  [key: string]: Mixed
}
```

Added in v1.0.0

# ReadonlyArrayC (interface)

**Signature**

```ts
export interface ReadonlyArrayC<C extends Mixed>
  extends ReadonlyArrayType<C, ReadonlyArray<TypeOf<C>>, ReadonlyArray<OutputOf<C>>, unknown> {}
```

Added in v1.5.3

# ReadonlyC (interface)

**Signature**

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

# RecordC (interface)

**Signature**

```ts
export interface RecordC<D extends Mixed, C extends Mixed>
  extends DictionaryType<D, C, { [K in TypeOf<D>]: TypeOf<C> }, { [K in OutputOf<D>]: OutputOf<C> }, unknown> {}
```

Added in v1.5.3

# ~~RefinementC~~ (interface)

Use `BrandC` instead

**Signature**

```ts
export interface RefinementC<C extends Any> extends RefinementType<C, TypeOf<C>, OutputOf<C>, InputOf<C>> {}
```

Added in v1.5.3

# ~~StrictC~~ (interface)

**Signature**

```ts
export interface StrictC<P extends Props>  // tslint:disable-next-line: deprecation
  extends StrictType<P, { [K in keyof P]: TypeOf<P[K]> }, { [K in keyof P]: OutputOf<P[K]> }, unknown> {}
```

Added in v1.5.3

# StringC (interface)

**Signature**

```ts
export interface StringC extends StringType {}
```

Added in v1.5.3

# ~~TaggedExact~~ (interface)

**Signature**

```ts
export interface TaggedExact<Tag extends string, A, O = A> extends ExactType<Tagged<Tag>, A, O> {}
```

Added in v1.3.0

# ~~TaggedIntersection~~ (interface)

**Signature**

```ts
export interface TaggedIntersection<Tag extends string, A, O = A>  // tslint:disable-next-line: deprecation
  extends IntersectionType<TaggedIntersectionArgument<Tag>, A, O> {}
```

Added in v1.3.0

# ~~TaggedRefinement~~ (interface)

**Signature**

```ts
export interface TaggedRefinement<Tag extends string, A, O = A> extends RefinementType<Tagged<Tag>, A, O> {}
```

Added in v1.3.0

# ~~TaggedUnion~~ (interface)

**Signature**

```ts
export interface TaggedUnion<Tag extends string, A, O = A> extends UnionType<Array<Tagged<Tag>>, A, O> {}
```

Added in v1.3.0

# ~~TaggedUnionC~~ (interface)

**Signature**

```ts
export interface TaggedUnionC<Tag extends string, CS extends [Mixed, Mixed, ...Array<Mixed>]>  // tslint:disable-next-line: deprecation
  extends TaggedUnionType<Tag, CS, TypeOf<CS[number]>, OutputOf<CS[number]>, unknown> {}
```

Added in v1.5.3

# TupleC (interface)

**Signature**

```ts
export interface TupleC<CS extends [Mixed, ...Array<Mixed>]>
  extends TupleType<
    CS,
    CS extends { length: 1 }
      ? [TypeOf<CS[0]>]
      : CS extends { length: 2 }
      ? [TypeOf<CS[0]>, TypeOf<CS[1]>]
      : CS extends { length: 3 }
      ? [TypeOf<CS[0]>, TypeOf<CS[1]>, TypeOf<CS[2]>]
      : CS extends { length: 4 }
      ? [TypeOf<CS[0]>, TypeOf<CS[1]>, TypeOf<CS[2]>, TypeOf<CS[3]>]
      : CS extends { length: 5 }
      ? [TypeOf<CS[0]>, TypeOf<CS[1]>, TypeOf<CS[2]>, TypeOf<CS[3]>, TypeOf<CS[4]>]
      : unknown,
    CS extends { length: 1 }
      ? [OutputOf<CS[0]>]
      : CS extends { length: 2 }
      ? [OutputOf<CS[0]>, OutputOf<CS[1]>]
      : CS extends { length: 3 }
      ? [OutputOf<CS[0]>, OutputOf<CS[1]>, OutputOf<CS[2]>]
      : CS extends { length: 4 }
      ? [OutputOf<CS[0]>, OutputOf<CS[1]>, OutputOf<CS[2]>, OutputOf<CS[3]>]
      : CS extends { length: 5 }
      ? [OutputOf<CS[0]>, OutputOf<CS[1]>, OutputOf<CS[2]>, OutputOf<CS[3]>, OutputOf<CS[4]>]
      : unknown,
    unknown
  > {}
```

Added in v1.5.3

# TypeC (interface)

**Signature**

```ts
export interface TypeC<P extends Props>
  extends InterfaceType<P, { [K in keyof P]: TypeOf<P[K]> }, { [K in keyof P]: OutputOf<P[K]> }, unknown> {}
```

Added in v1.5.3

# UndefinedC (interface)

**Signature**

```ts
export interface UndefinedC extends UndefinedType {}
```

Added in v1.5.3

# UnionC (interface)

**Signature**

```ts
export interface UnionC<CS extends [Mixed, Mixed, ...Array<Mixed>]>
  extends UnionType<CS, TypeOf<CS[number]>, OutputOf<CS[number]>, unknown> {}
```

Added in v1.5.3

# UnknownArrayC (interface)

**Signature**

```ts
export interface UnknownArrayC extends AnyArrayType {}
```

Added in v1.5.3

# UnknownC (interface)

**Signature**

```ts
export interface UnknownC extends UnknownType {}
```

Added in v1.5.3

# UnknownRecordC (interface)

**Signature**

```ts
export interface UnknownRecordC extends AnyDictionaryType {}
```

Added in v1.5.3

# ValidationError (interface)

**Signature**

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

# VoidC (interface)

**Signature**

```ts
export interface VoidC extends VoidType {}
```

Added in v1.5.3

# Branded (type alias)

**Signature**

```ts
export type Branded<A, B> = A & Brand<B>
```

Added in v1.8.1

# ~~Compact~~ (type alias)

used in `intersection` as a workaround for #234

**Signature**

```ts
export type Compact<A> = { [K in keyof A]: A[K] }
```

Added in v1.4.2

# Decode (type alias)

**Signature**

```ts
export type Decode<I, A> = (i: I) => Validation<A>
```

Added in v1.0.0

# Encode (type alias)

**Signature**

```ts
export type Encode<A, O> = (a: A) => O
```

Added in v1.0.0

# ~~Exact~~ (type alias)

**Signature**

```ts
export type Exact<T, X extends T> = T &
  { [K in ({ [K in keyof X]: K } & { [K in keyof T]: never } & { [key: string]: never })[keyof X]]?: never }
```

Added in v1.1.0

# HasProps (type alias)

**Signature**

```ts
export type HasProps =
  | HasPropsRefinement
  | HasPropsReadonly
  | HasPropsIntersection
  | InterfaceType<any, any, any, any>
  // tslint:disable-next-line: deprecation
  | StrictType<any, any, any, any>
  | PartialType<any, any, any, any>
```

Added in v1.1.0

# InputOf (type alias)

**Signature**

```ts
export type InputOf<C extends Any> = C['_I']
```

Added in v1.0.0

# Int (type alias)

**Signature**

```ts
export type Int = Branded<number, IntBrand>
```

Added in v1.8.1

# Is (type alias)

**Signature**

```ts
export type Is<A> = (u: unknown) => u is A
```

Added in v1.0.0

# OutputOf (type alias)

**Signature**

```ts
export type OutputOf<C extends Any> = C['_O']
```

Added in v1.0.0

# OutputOfDictionary (type alias)

**Signature**

```ts
export type OutputOfDictionary<D extends Any, C extends Any> = { [K in OutputOf<D>]: OutputOf<C> }
```

Added in v1.0.0

# OutputOfPartialProps (type alias)

**Signature**

```ts
export type OutputOfPartialProps<P extends AnyProps> = { [K in keyof P]?: OutputOf<P[K]> }
```

Added in v1.0.0

# OutputOfProps (type alias)

**Signature**

```ts
export type OutputOfProps<P extends AnyProps> = { [K in keyof P]: OutputOf<P[K]> }
```

Added in v1.0.0

# ~~PropsOf~~ (type alias)

**Signature**

```ts
export type PropsOf<T extends { props: any }> = T['props']
```

Added in v1.0.0

# ~~Tagged~~ (type alias)

**Signature**

```ts
export type Tagged<Tag extends string, A = any, O = A> =
  // tslint:disable-next-line: deprecation
  | InterfaceType<TaggedProps<Tag>, A, O>
  // tslint:disable-next-line: deprecation
  | StrictType<TaggedProps<Tag>, A, O>
  // tslint:disable-next-line: deprecation
  | TaggedRefinement<Tag, A, O>
  // tslint:disable-next-line: deprecation
  | TaggedUnion<Tag, A, O>
  // tslint:disable-next-line: deprecation
  | TaggedIntersection<Tag, A, O>
  // tslint:disable-next-line: deprecation
  | TaggedExact<Tag, A, O>
  | RecursiveType<any, A, O>
```

Added in v1.3.0

# ~~TaggedIntersectionArgument~~ (type alias)

**Signature**

```ts
export type TaggedIntersectionArgument<Tag extends string> =
  // tslint:disable-next-line: deprecation
  | [Tagged<Tag>]
  // tslint:disable-next-line: deprecation
  | [Tagged<Tag>, Mixed]
  // tslint:disable-next-line: deprecation
  | [Mixed, Tagged<Tag>]
  // tslint:disable-next-line: deprecation
  | [Tagged<Tag>, Mixed, Mixed]
  // tslint:disable-next-line: deprecation
  | [Mixed, Tagged<Tag>, Mixed]
  // tslint:disable-next-line: deprecation
  | [Mixed, Mixed, Tagged<Tag>]
  // tslint:disable-next-line: deprecation
  | [Tagged<Tag>, Mixed, Mixed, Mixed]
  // tslint:disable-next-line: deprecation
  | [Mixed, Tagged<Tag>, Mixed, Mixed]
  // tslint:disable-next-line: deprecation
  | [Mixed, Mixed, Tagged<Tag>, Mixed]
  // tslint:disable-next-line: deprecation
  | [Mixed, Mixed, Mixed, Tagged<Tag>]
  // tslint:disable-next-line: deprecation
  | [Tagged<Tag>, Mixed, Mixed, Mixed, Mixed]
  // tslint:disable-next-line: deprecation
  | [Mixed, Tagged<Tag>, Mixed, Mixed, Mixed]
  // tslint:disable-next-line: deprecation
  | [Mixed, Mixed, Tagged<Tag>, Mixed, Mixed]
  // tslint:disable-next-line: deprecation
  | [Mixed, Mixed, Mixed, Tagged<Tag>, Mixed]
  // tslint:disable-next-line: deprecation
  | [Mixed, Mixed, Mixed, Mixed, Tagged<Tag>]
```

Added in v1.3.0

# ~~TaggedProps~~ (type alias)

**Signature**

```ts
export type TaggedProps<Tag extends string> = { [K in Tag]: LiteralType<any> }
```

Added in v1.3.0

# TypeOf (type alias)

**Signature**

```ts
export type TypeOf<C extends Any> = C['_A']
```

Added in v1.0.0

# TypeOfDictionary (type alias)

**Signature**

```ts
export type TypeOfDictionary<D extends Any, C extends Any> = { [K in TypeOf<D>]: TypeOf<C> }
```

Added in v1.0.0

# TypeOfPartialProps (type alias)

**Signature**

```ts
export type TypeOfPartialProps<P extends AnyProps> = { [K in keyof P]?: TypeOf<P[K]> }
```

Added in v1.0.0

# TypeOfProps (type alias)

**Signature**

```ts
export type TypeOfProps<P extends AnyProps> = { [K in keyof P]: TypeOf<P[K]> }
```

Added in v1.0.0

# Validate (type alias)

**Signature**

```ts
export type Validate<I, A> = (i: I, context: Context) => Validation<A>
```

Added in v1.0.0

# Validation (type alias)

**Signature**

```ts
export type Validation<A> = Either<Errors, A>
```

Added in v1.0.0

# ~~mixed~~ (type alias)

Use `unknown` instead

**Signature**

```ts
export type mixed = unknown
```

Added in v1.0.0

# AnyArrayType (class)

**Signature**

```ts
export declare class AnyArrayType {
  constructor()
}
```

Added in v1.0.0

## \_tag (property)

**Signature**

```ts
readonly _tag: "AnyArrayType"
```

Added in v1.0.0

# AnyDictionaryType (class)

**Signature**

```ts
export declare class AnyDictionaryType {
  constructor()
}
```

Added in v1.0.0

## \_tag (property)

**Signature**

```ts
readonly _tag: "AnyDictionaryType"
```

Added in v1.0.0

# ~~AnyType~~ (class)

**Signature**

```ts
export declare class AnyType {
  constructor()
}
```

Added in v1.0.0

## \_tag (property)

**Signature**

```ts
readonly _tag: "AnyType"
```

Added in v1.0.0

# ArrayType (class)

**Signature**

```ts
export declare class ArrayType<C, A, O, I> {
  constructor(
    name: string,
    is: ArrayType<C, A, O, I>['is'],
    validate: ArrayType<C, A, O, I>['validate'],
    encode: ArrayType<C, A, O, I>['encode'],
    readonly type: C
  )
}
```

Added in v1.0.0

## \_tag (property)

**Signature**

```ts
readonly _tag: "ArrayType"
```

Added in v1.0.0

# BigIntType (class)

**Signature**

```ts
export declare class BigIntType {
  constructor()
}
```

Added in v2.1.0

## \_tag (property)

**Signature**

```ts
readonly _tag: "BigIntType"
```

Added in v1.0.0

# BooleanType (class)

**Signature**

```ts
export declare class BooleanType {
  constructor()
}
```

Added in v1.0.0

## \_tag (property)

**Signature**

```ts
readonly _tag: "BooleanType"
```

Added in v1.0.0

# DictionaryType (class)

**Signature**

```ts
export declare class DictionaryType<D, C, A, O, I> {
  constructor(
    name: string,
    is: DictionaryType<D, C, A, O, I>['is'],
    validate: DictionaryType<D, C, A, O, I>['validate'],
    encode: DictionaryType<D, C, A, O, I>['encode'],
    readonly domain: D,
    readonly codomain: C
  )
}
```

Added in v1.0.0

## \_tag (property)

**Signature**

```ts
readonly _tag: "DictionaryType"
```

Added in v1.0.0

# ExactType (class)

**Signature**

```ts
export declare class ExactType<C, A, O, I> {
  constructor(
    name: string,
    is: ExactType<C, A, O, I>['is'],
    validate: ExactType<C, A, O, I>['validate'],
    encode: ExactType<C, A, O, I>['encode'],
    readonly type: C
  )
}
```

Added in v1.1.0

## \_tag (property)

**Signature**

```ts
readonly _tag: "ExactType"
```

Added in v1.0.0

# ~~FunctionType~~ (class)

**Signature**

```ts
export declare class FunctionType {
  constructor()
}
```

Added in v1.0.0

## \_tag (property)

**Signature**

```ts
readonly _tag: "FunctionType"
```

Added in v1.0.0

# InterfaceType (class)

**Signature**

```ts
export declare class InterfaceType<P, A, O, I> {
  constructor(
    name: string,
    is: InterfaceType<P, A, O, I>['is'],
    validate: InterfaceType<P, A, O, I>['validate'],
    encode: InterfaceType<P, A, O, I>['encode'],
    readonly props: P
  )
}
```

Added in v1.0.0

## \_tag (property)

**Signature**

```ts
readonly _tag: "InterfaceType"
```

Added in v1.0.0

# IntersectionType (class)

**Signature**

```ts
export declare class IntersectionType<CS, A, O, I> {
  constructor(
    name: string,
    is: IntersectionType<CS, A, O, I>['is'],
    validate: IntersectionType<CS, A, O, I>['validate'],
    encode: IntersectionType<CS, A, O, I>['encode'],
    readonly types: CS
  )
}
```

Added in v1.0.0

## \_tag (property)

**Signature**

```ts
readonly _tag: "IntersectionType"
```

Added in v1.0.0

# KeyofType (class)

**Signature**

```ts
export declare class KeyofType<D> {
  constructor(
    name: string,
    is: KeyofType<D>['is'],
    validate: KeyofType<D>['validate'],
    encode: KeyofType<D>['encode'],
    readonly keys: D
  )
}
```

Added in v1.0.0

## \_tag (property)

**Signature**

```ts
readonly _tag: "KeyofType"
```

Added in v1.0.0

# LiteralType (class)

**Signature**

```ts
export declare class LiteralType<V> {
  constructor(
    name: string,
    is: LiteralType<V>['is'],
    validate: LiteralType<V>['validate'],
    encode: LiteralType<V>['encode'],
    readonly value: V
  )
}
```

Added in v1.0.0

## \_tag (property)

**Signature**

```ts
readonly _tag: "LiteralType"
```

Added in v1.0.0

# ~~NeverType~~ (class)

**Signature**

```ts
export declare class NeverType {
  constructor()
}
```

Added in v1.0.0

## \_tag (property)

**Signature**

```ts
readonly _tag: "NeverType"
```

Added in v1.0.0

# NullType (class)

**Signature**

```ts
export declare class NullType {
  constructor()
}
```

Added in v1.0.0

## \_tag (property)

**Signature**

```ts
readonly _tag: "NullType"
```

Added in v1.0.0

# NumberType (class)

**Signature**

```ts
export declare class NumberType {
  constructor()
}
```

Added in v1.0.0

## \_tag (property)

**Signature**

```ts
readonly _tag: "NumberType"
```

Added in v1.0.0

# ~~ObjectType~~ (class)

**Signature**

```ts
export declare class ObjectType {
  constructor()
}
```

Added in v1.0.0

## \_tag (property)

**Signature**

```ts
readonly _tag: "ObjectType"
```

Added in v1.0.0

# PartialType (class)

**Signature**

```ts
export declare class PartialType<P, A, O, I> {
  constructor(
    name: string,
    is: PartialType<P, A, O, I>['is'],
    validate: PartialType<P, A, O, I>['validate'],
    encode: PartialType<P, A, O, I>['encode'],
    readonly props: P
  )
}
```

Added in v1.0.0

## \_tag (property)

**Signature**

```ts
readonly _tag: "PartialType"
```

Added in v1.0.0

# ReadonlyArrayType (class)

**Signature**

```ts
export declare class ReadonlyArrayType<C, A, O, I> {
  constructor(
    name: string,
    is: ReadonlyArrayType<C, A, O, I>['is'],
    validate: ReadonlyArrayType<C, A, O, I>['validate'],
    encode: ReadonlyArrayType<C, A, O, I>['encode'],
    readonly type: C
  )
}
```

Added in v1.0.0

## \_tag (property)

**Signature**

```ts
readonly _tag: "ReadonlyArrayType"
```

Added in v1.0.0

# ReadonlyType (class)

**Signature**

```ts
export declare class ReadonlyType<C, A, O, I> {
  constructor(
    name: string,
    is: ReadonlyType<C, A, O, I>['is'],
    validate: ReadonlyType<C, A, O, I>['validate'],
    encode: ReadonlyType<C, A, O, I>['encode'],
    readonly type: C
  )
}
```

Added in v1.0.0

## \_tag (property)

**Signature**

```ts
readonly _tag: "ReadonlyType"
```

Added in v1.0.0

# RecursiveType (class)

**Signature**

```ts
export declare class RecursiveType<C, A, O, I> {
  constructor(
    name: string,
    is: RecursiveType<C, A, O, I>['is'],
    validate: RecursiveType<C, A, O, I>['validate'],
    encode: RecursiveType<C, A, O, I>['encode'],
    public runDefinition: () => C
  )
}
```

Added in v1.0.0

## \_tag (property)

**Signature**

```ts
readonly _tag: "RecursiveType"
```

Added in v1.0.0

## type (property)

**Signature**

```ts
readonly type: C
```

Added in v1.0.0

# RefinementType (class)

**Signature**

```ts
export declare class RefinementType<C, A, O, I> {
  constructor(
    name: string,
    is: RefinementType<C, A, O, I>['is'],
    validate: RefinementType<C, A, O, I>['validate'],
    encode: RefinementType<C, A, O, I>['encode'],
    readonly type: C,
    readonly predicate: Predicate<A>
  )
}
```

Added in v1.0.0

## \_tag (property)

**Signature**

```ts
readonly _tag: "RefinementType"
```

Added in v1.0.0

# ~~StrictType~~ (class)

**Signature**

```ts
export declare class StrictType<P, A, O, I> {
  constructor(
    name: string,
    // tslint:disable-next-line: deprecation
    is: StrictType<P, A, O, I>['is'],
    // tslint:disable-next-line: deprecation
    validate: StrictType<P, A, O, I>['validate'],
    // tslint:disable-next-line: deprecation
    encode: StrictType<P, A, O, I>['encode'],
    readonly props: P
  )
}
```

Added in v1.0.0

## \_tag (property)

**Signature**

```ts
readonly _tag: "StrictType"
```

Added in v1.0.0

# StringType (class)

**Signature**

```ts
export declare class StringType {
  constructor()
}
```

Added in v1.0.0

## \_tag (property)

**Signature**

```ts
readonly _tag: "StringType"
```

Added in v1.0.0

# ~~TaggedUnionType~~ (class)

**Signature**

```ts
export declare class TaggedUnionType<Tag, CS, A, O, I> {
  constructor(
    name: string,
    // tslint:disable-next-line: deprecation
    is: TaggedUnionType<Tag, CS, A, O, I>['is'],
    // tslint:disable-next-line: deprecation
    validate: TaggedUnionType<Tag, CS, A, O, I>['validate'],
    // tslint:disable-next-line: deprecation
    encode: TaggedUnionType<Tag, CS, A, O, I>['encode'],
    codecs: CS,
    readonly tag: Tag
  )
}
```

Added in v1.3.0

# TupleType (class)

**Signature**

```ts
export declare class TupleType<CS, A, O, I> {
  constructor(
    name: string,
    is: TupleType<CS, A, O, I>['is'],
    validate: TupleType<CS, A, O, I>['validate'],
    encode: TupleType<CS, A, O, I>['encode'],
    readonly types: CS
  )
}
```

Added in v1.0.0

## \_tag (property)

**Signature**

```ts
readonly _tag: "TupleType"
```

Added in v1.0.0

# Type (class)

**Signature**

```ts
export declare class Type<A, O, I> {
  constructor(
    /** a unique name for this codec */
    readonly name: string,
    /** a custom type guard */
    readonly is: Is<A>,
    /** succeeds if a value of type I can be decoded to a value of type A */
    readonly validate: Validate<I, A>,
    /** converts a value of type A to a value of type O */
    readonly encode: Encode<A, O>
  )
}
```

Added in v1.0.0

## pipe (method)

**Signature**

```ts
pipe<B, IB, A extends IB, OB extends A>(
    this: Type<A, O, I>,
    ab: Type<B, OB, IB>,
    name: string = `pipe(${this.name}, ${ab.name})`
  ): Type<B, O, I>
```

Added in v1.0.0

## asDecoder (method)

**Signature**

```ts
asDecoder(): Decoder<I, A>
```

Added in v1.0.0

## asEncoder (method)

**Signature**

```ts
asEncoder(): Encoder<A, O>
```

Added in v1.0.0

## decode (method)

a version of `validate` with a default context

**Signature**

```ts
decode(i: I): Validation<A>
```

Added in v1.0.0

## \_A (property)

**Signature**

```ts
readonly _A: A
```

Added in v1.0.0

## \_O (property)

**Signature**

```ts
readonly _O: O
```

Added in v1.0.0

## \_I (property)

**Signature**

```ts
readonly _I: I
```

Added in v1.0.0

# UndefinedType (class)

**Signature**

```ts
export declare class UndefinedType {
  constructor()
}
```

Added in v1.0.0

## \_tag (property)

**Signature**

```ts
readonly _tag: "UndefinedType"
```

Added in v1.0.0

# UnionType (class)

**Signature**

```ts
export declare class UnionType<CS, A, O, I> {
  constructor(
    name: string,
    is: UnionType<CS, A, O, I>['is'],
    validate: UnionType<CS, A, O, I>['validate'],
    encode: UnionType<CS, A, O, I>['encode'],
    readonly types: CS
  )
}
```

Added in v1.0.0

## \_tag (property)

**Signature**

```ts
readonly _tag: "UnionType"
```

Added in v1.0.0

# UnknownType (class)

**Signature**

```ts
export declare class UnknownType {
  constructor()
}
```

Added in v1.5.0

## \_tag (property)

**Signature**

```ts
readonly _tag: "UnknownType"
```

Added in v1.0.0

# VoidType (class)

**Signature**

```ts
export declare class VoidType {
  constructor()
}
```

Added in v1.2.0

## \_tag (property)

**Signature**

```ts
readonly _tag: "VoidType"
```

Added in v1.0.0

# Int

A branded codec representing an integer

**Signature**

```ts
export declare const Int: BrandC<NumberC, IntBrand>
```

Added in v1.8.1

# UnknownArray

**Signature**

```ts
export declare const UnknownArray: UnknownArrayC
```

Added in v1.7.1

# UnknownRecord

**Signature**

```ts
export declare const UnknownRecord: UnknownRecordC
```

Added in v1.7.1

# appendContext

**Signature**

```ts
export declare const appendContext: (c: Context, key: string, decoder: Decoder<any, any>, actual?: unknown) => Context
```

Added in v1.0.0

# array

**Signature**

```ts
export declare const array: <C extends Mixed>(codec: C, name?: string) => ArrayC<C>
```

Added in v1.0.0

# bigint

**Signature**

```ts
export declare const bigint: BigIntC
```

Added in v2.1.0

# boolean

**Signature**

```ts
export declare const boolean: BooleanC
```

Added in v1.0.0

# brand

**Signature**

```ts
export declare const brand: <C extends Any, N extends string, B extends { readonly [K in N]: symbol }>(
  codec: C,
  predicate: Refinement<C['_A'], Branded<C['_A'], B>>,
  name: N
) => BrandC<C, B>
```

Added in v1.8.1

# exact

Strips additional properties

**Signature**

```ts
export declare const exact: <C extends HasProps>(codec: C, name?: string) => ExactC<C>
```

Added in v1.1.0

# failure

**Signature**

```ts
export declare const failure: <T>(value: unknown, context: Context, message?: string) => Either<Errors, T>
```

Added in v1.0.0

# failures

**Signature**

```ts
export declare const failures: <T>(errors: Errors) => Either<Errors, T>
```

Added in v1.0.0

# getContextEntry

**Signature**

```ts
export declare const getContextEntry: (key: string, decoder: Decoder<any, any>) => ContextEntry
```

Added in v1.0.0

# getFunctionName

**Signature**

```ts
export declare const getFunctionName: (f: Function) => string
```

Added in v1.0.0

# identity

**Signature**

```ts
export declare const identity: <A>(a: A) => A
```

Added in v1.0.0

# intersection

**Signature**

```ts
export declare function intersection<
  A extends Mixed,
  B extends Mixed,
  C extends Mixed,
  D extends Mixed,
  E extends Mixed
>(codecs: [A, B, C, D, E], name?: string): IntersectionC<[A, B, C, D, E]>
export declare function intersection<A extends Mixed, B extends Mixed, C extends Mixed, D extends Mixed>(
  codecs: [A, B, C, D],
  name?: string
): IntersectionC<[A, B, C, D]>
export declare function intersection<A extends Mixed, B extends Mixed, C extends Mixed>(
  codecs: [A, B, C],
  name?: string
): IntersectionC<[A, B, C]>
export declare function intersection<A extends Mixed, B extends Mixed>(
  codecs: [A, B],
  name?: string
): IntersectionC<[A, B]>
```

Added in v1.0.0

# keyof

**Signature**

```ts
export declare const keyof: <D extends { [key: string]: unknown }>(keys: D, name?: string) => KeyofC<D>
```

Added in v1.0.0

# literal

**Signature**

```ts
export declare const literal: <V extends LiteralValue>(value: V, name?: string) => LiteralC<V>
```

Added in v1.0.0

# null

**Signature**

```ts
export declare const null: NullC
```

Added in v1.0.0

# nullType

**Signature**

```ts
export declare const nullType: NullC
```

Added in v1.0.0

# number

**Signature**

```ts
export declare const number: NumberC
```

Added in v1.0.0

# partial

**Signature**

```ts
export declare const partial: <P extends Props>(props: P, name?: string) => PartialC<P>
```

Added in v1.0.0

# readonly

**Signature**

```ts
export declare const readonly: <C extends Mixed>(codec: C, name?: string) => ReadonlyC<C>
```

Added in v1.0.0

# readonlyArray

**Signature**

```ts
export declare const readonlyArray: <C extends Mixed>(codec: C, name?: string) => ReadonlyArrayC<C>
```

Added in v1.0.0

# record

**Signature**

```ts
export declare function record<D extends Mixed, C extends Mixed>(domain: D, codomain: C, name?: string): RecordC<D, C>
```

Added in v1.7.1

# recursion

**Signature**

```ts
export declare const recursion: <A, O = A, I = unknown, C extends Type<A, O, I> = Type<A, O, I>>(
  name: string,
  definition: (self: C) => C
) => RecursiveType<C, A, O, I>
```

Added in v1.0.0

# strict

Strips additional properties

**Signature**

```ts
export declare const strict: <P extends Props>(props: P, name?: string) => ExactC<TypeC<P>>
```

Added in v1.0.0

# string

**Signature**

```ts
export declare const string: StringC
```

Added in v1.0.0

# success

**Signature**

```ts
export declare const success: <T>(value: T) => Either<Errors, T>
```

Added in v1.0.0

# tuple

**Signature**

```ts
export declare function tuple<A extends Mixed, B extends Mixed, C extends Mixed, D extends Mixed, E extends Mixed>(
  codecs: [A, B, C, D, E],
  name?: string
): TupleC<[A, B, C, D, E]>
export declare function tuple<A extends Mixed, B extends Mixed, C extends Mixed, D extends Mixed>(
  codecs: [A, B, C, D],
  name?: string
): TupleC<[A, B, C, D]>
export declare function tuple<A extends Mixed, B extends Mixed, C extends Mixed>(
  codecs: [A, B, C],
  name?: string
): TupleC<[A, B, C]>
export declare function tuple<A extends Mixed, B extends Mixed>(codecs: [A, B], name?: string): TupleC<[A, B]>
export declare function tuple<A extends Mixed>(codecs: [A], name?: string): TupleC<[A]>
```

Added in v1.0.0

# type

**Signature**

```ts
export declare const type: <P extends Props>(props: P, name?: string) => TypeC<P>
```

Added in v1.0.0

# undefined

**Signature**

```ts
export declare const undefined: UndefinedC
```

Added in v1.0.0

# union

**Signature**

```ts
export declare const union: <CS extends [Mixed, Mixed, ...Mixed[]]>(codecs: CS, name?: string) => UnionC<CS>
```

Added in v1.0.0

# unknown

**Signature**

```ts
export declare const unknown: UnknownC
```

Added in v1.5.0

# void

**Signature**

```ts
export declare const void: VoidC
```

Added in v1.0.0

# voidType

**Signature**

```ts
export declare const voidType: VoidC
```

Added in v1.2.0

# ~~Array~~

Use `UnknownArray` instead

**Signature**

```ts
export declare const Array: UnknownArrayC
```

Added in v1.0.0

# ~~Dictionary~~

Use `UnknownRecord` instead

**Signature**

```ts
export declare const Dictionary: UnknownRecordC
```

Added in v1.0.0

# ~~Function~~

**Signature**

```ts
export declare const Function: FunctionC
```

Added in v1.0.0

# ~~Integer~~

Use `Int` instead

**Signature**

```ts
export declare const Integer: RefinementC<NumberC>
```

Added in v1.0.0

# ~~alias~~

Keeps the codec "kind"

**Signature**

```ts
export declare function alias<A, O, P, I>(
  codec: PartialType<P, A, O, I>
): <
  // tslint:disable-next-line: deprecation
  AA extends Exact<A, AA>,
  // tslint:disable-next-line: deprecation
  OO extends Exact<O, OO> = O,
  // tslint:disable-next-line: deprecation
  PP extends Exact<P, PP> = P,
  II extends I = I
>() => PartialType<PP, AA, OO, II>
export declare function alias<A, O, P, I>(
  // tslint:disable-next-line: deprecation
  codec: StrictType<P, A, O, I>
): <
  // tslint:disable-next-line: deprecation
  AA extends Exact<A, AA>,
  // tslint:disable-next-line: deprecation
  OO extends Exact<O, OO> = O,
  // tslint:disable-next-line: deprecation
  PP extends Exact<P, PP> = P,
  II extends I = I
>() => // tslint:disable-next-line: deprecation
StrictType<PP, AA, OO, II>
export declare function alias<A, O, P, I>(
  codec: InterfaceType<P, A, O, I>
): <
  // tslint:disable-next-line: deprecation
  AA extends Exact<A, AA>,
  // tslint:disable-next-line: deprecation
  OO extends Exact<O, OO> = O,
  // tslint:disable-next-line: deprecation
  PP extends Exact<P, PP> = P,
  II extends I = I
>() => InterfaceType<PP, AA, OO, II>
```

Added in v1.1.0

# ~~any~~

Use `unknown` instead

**Signature**

```ts
export declare const any: AnyC
```

Added in v1.0.0

# ~~clean~~

Drops the codec "kind"

**Signature**

```ts
export declare function clean<A, O = A, I = unknown>(codec: Type<A, O, I>): Type<A, O, I>
```

Added in v1.1.0

# ~~dictionary~~

Use `record` instead

**Signature**

```ts
export declare const dictionary: typeof record
```

Added in v1.0.0

# ~~getDefaultContext~~

**Signature**

```ts
export declare const getDefaultContext: (decoder: Decoder<any, any>) => Context
```

Added in v1.0.0

# ~~getValidationError~~

**Signature**

```ts
export declare const getValidationError: (value: unknown, context: Context) => ValidationError
```

Added in v1.0.0

# ~~interface~~

Use `type` instead

**Signature**

```ts
export declare const interface: <P extends Props>(props: P, name?: string) => TypeC<P>
```

Added in v1.0.0

# ~~never~~

**Signature**

```ts
export declare const never: NeverC
```

Added in v1.0.0

# ~~object~~

Use `UnknownRecord` instead

**Signature**

```ts
export declare const object: ObjectC
```

Added in v1.0.0

# ~~refinement~~

Use `brand` instead

**Signature**

```ts
export declare function refinement<C extends Any>(
  codec: C,
  predicate: Predicate<TypeOf<C>>,
  name: string = `(${codec.name} | ${getFunctionName(predicate)})`
): // tslint:disable-next-line: deprecation
RefinementC<C>
```

Added in v1.0.0

# ~~taggedUnion~~

Use `union` instead

**Signature**

```ts
export declare const taggedUnion: <Tag extends string, CS extends [Mixed, Mixed, ...Mixed[]]>(
  tag: Tag,
  codecs: CS,
  name?: string
) => TaggedUnionC<Tag, CS>
```

Added in v1.3.0
