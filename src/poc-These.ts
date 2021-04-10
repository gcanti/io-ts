import { sequenceS } from 'fp-ts/lib/Apply'
import { Lazy, Refinement } from 'fp-ts/lib/function'
import { pipe } from 'fp-ts/lib/pipeable'
import * as RNEA from 'fp-ts/lib/ReadonlyNonEmptyArray'
import * as RR from 'fp-ts/lib/ReadonlyRecord'
import { Semigroup } from 'fp-ts/lib/Semigroup'
import * as E from 'fp-ts/lib/These'

import These = E.These
import ReadonlyNonEmptyArray = RNEA.ReadonlyNonEmptyArray

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

export interface Decoder<I, E, A> {
  readonly decode: (i: I) => These<E, A>
}

interface AnyD extends Decoder<any, any, any> {}
interface AnyUD extends Decoder<unknown, any, any> {}

export type InputOf<D> = D extends Decoder<infer I, any, any> ? I : never
export type ErrorOf<D> = D extends Decoder<any, infer E, any> ? E : never
export type TypeOf<D> = D extends Decoder<any, any, infer A> ? A : never

// -------------------------------------------------------------------------------------
// error model
// -------------------------------------------------------------------------------------

export interface LeafE<E> {
  readonly _tag: 'LeafE'
  readonly error: E
}
export const leafE = <E>(error: E): LeafE<E> => ({ _tag: 'LeafE', error })

export interface NullableE<E> {
  readonly _tag: 'NullableE'
  readonly error: E
}

export interface KeyE<K, E> {
  readonly actual: unknown
  readonly key: K
  readonly error: E
}

export interface StructE<K, E> {
  readonly _tag: 'StructE'
  readonly errors: ReadonlyNonEmptyArray<KeyE<K, E>>
}

export interface PartialE<K, E> {
  readonly _tag: 'PartialE'
  readonly errors: ReadonlyNonEmptyArray<KeyE<K, E>>
}

export interface IndexE<I, E> {
  readonly actual: unknown
  readonly index: I
  readonly error: E
}

export interface TupleE<I, E> {
  readonly _tag: 'TupleE'
  readonly errors: ReadonlyNonEmptyArray<IndexE<I, E>>
}

export interface ArrayE<E> extends ActualE<ReadonlyArray<unknown>> {
  readonly _tag: 'ArrayE'
  readonly errors: ReadonlyNonEmptyArray<IndexE<number, E>>
}

export interface RecordE<E> extends ActualE<Readonly<Record<string, unknown>>> {
  readonly _tag: 'RecordE'
  readonly errors: ReadonlyNonEmptyArray<KeyE<string, E>>
}

export interface UnionE<I, E> {
  readonly _tag: 'UnionE'
  readonly errors: ReadonlyNonEmptyArray<IndexE<I, E>>
}

export interface RefineE<E> {
  readonly _tag: 'RefineE'
  readonly error: E
}

export interface ParseE<E> {
  readonly _tag: 'ParseE'
  readonly error: E
}

export interface IntersectE<E> {
  readonly _tag: 'IntersectE'
  readonly error: E
}

export interface LazyE<E> {
  readonly _tag: 'LazyE'
  readonly id: string
  readonly error: E
}

export interface SumE<K, E> {
  readonly _tag: 'SumE'
  readonly errors: ReadonlyNonEmptyArray<KeyE<K, E>>
}

export interface WarningE<E> {
  readonly _tag: 'WarningE'
  readonly warnings: ReadonlyNonEmptyArray<E>
}
export const warningE = <E>(warnings: ReadonlyNonEmptyArray<E>): WarningE<E> => ({ _tag: 'WarningE', warnings })

export interface NullableRE<E> extends NullableE<DecodeError<E>> {}
export interface RefineRE<E> extends RefineE<DecodeError<E>> {}
export interface ParseRE<E> extends ParseE<DecodeError<E>> {}
export interface StructRE<E> extends StructE<string, DecodeError<E>> {}
export interface PartialRE<E> extends PartialE<string, DecodeError<E>> {}
export interface TupleRE<E> extends TupleE<number, DecodeError<E>> {}
export interface ArrayRE<E> extends ArrayE<DecodeError<E>> {}
export interface RecordRE<E> extends RecordE<DecodeError<E>> {}
export interface UnionRE<E> extends UnionE<number, DecodeError<E>> {}
export interface IntersectionRE<E> extends IntersectE<DecodeError<E>> {}
export interface SumRE<E> extends SumE<string, DecodeError<E>> {}
export interface LazyRE<E> extends LazyE<DecodeError<E>> {}
export interface WarningRE<E> extends WarningE<DecodeError<E>> {}
export type DecodeError<E> =
  | LeafE<E>
  | NullableRE<E>
  | RefineRE<E>
  | ParseRE<E>
  | StructRE<E>
  | PartialRE<E>
  | TupleRE<E>
  | ArrayRE<E>
  | RecordRE<E>
  | UnionRE<E>
  | IntersectionRE<E>
  | SumRE<E>
  | LazyRE<E>
  | WarningRE<E>

const S: Semigroup<DecodeError<unknown>> = {
  concat: (x, y) => {
    if (x._tag === 'WarningE') {
      if (y._tag === 'WarningE') {
        return warningE([x.warnings[0], ...x.warnings.slice(1), ...y.warnings])
      }
      return y
    }
    return x
  }
}
const M = E.getMonad(S)

// -------------------------------------------------------------------------------------
// error utils
// -------------------------------------------------------------------------------------

export interface ActualE<I> {
  readonly actual: I
}

export type DefaultLeafE =
  | StringE
  | NumberE
  | BooleanE
  | UnknownRecordE
  | UnknownArrayE
  | LiteralE<ReadonlyNonEmptyArray<Literal>>
  | TagE<PropertyKey>

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

export interface StringE extends ActualE<unknown> {
  readonly _tag: 'StringE'
}
export interface stringD extends Decoder<unknown, LeafE<StringE>, string> {
  readonly _tag: 'stringD'
}
export const string: stringD = {
  _tag: 'stringD',
  decode: (u) => (typeof u === 'string' ? E.right(u) : E.left(leafE({ _tag: 'StringE', actual: u })))
}

export interface NumberE extends ActualE<unknown> {
  readonly _tag: 'NumberE'
}
export interface numberD extends Decoder<unknown, LeafE<NumberE>, number> {
  readonly _tag: 'numberD'
}
export declare const number: numberD

export interface BooleanE extends ActualE<unknown> {
  readonly _tag: 'BooleanE'
}
export interface booleanD extends Decoder<unknown, LeafE<BooleanE>, boolean> {
  readonly _tag: 'booleanD'
}
export declare const boolean: booleanD

// -------------------------------------------------------------------------------------
// unknown containers
// -------------------------------------------------------------------------------------

export interface UnknownArrayE extends ActualE<unknown> {
  readonly _tag: 'UnknownArrayE'
}
export interface UnknownArrayD extends Decoder<unknown, LeafE<UnknownArrayE>, Array<unknown>> {
  readonly _tag: 'UnknownArrayD'
}
export declare const UnknownArray: UnknownArrayD

export interface UnknownRecordE extends ActualE<unknown> {
  readonly _tag: 'UnknownRecordE'
}
export interface UnknownRecordD extends Decoder<unknown, LeafE<UnknownRecordE>, Record<string, unknown>> {
  readonly _tag: 'UnknownRecordD'
}
const isUnknownRecord = (u: unknown): u is Record<string, unknown> =>
  u !== null && typeof u === 'object' && !Array.isArray(u)
export const UnknownRecord: UnknownRecordD = {
  _tag: 'UnknownRecordD',
  decode: (u) => (isUnknownRecord(u) ? E.right(u) : E.left(leafE({ _tag: 'UnknownRecordE', actual: u })))
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

export type Literal = string | number | boolean | null

export interface LiteralE<A extends ReadonlyNonEmptyArray<Literal>> {
  readonly _tag: 'LiteralE'
  readonly literals: A
}

export interface LiteralD<A extends ReadonlyNonEmptyArray<Literal>>
  extends Decoder<unknown, LeafE<LiteralE<A>>, A[number]> {
  readonly _tag: 'LiteralD'
  readonly literals: A
}

export declare const literal: <A extends ReadonlyNonEmptyArray<Literal>>(...values: A) => LiteralD<A>

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

export interface FromStructD<Properties>
  extends Decoder<
    { [K in keyof Properties]: InputOf<Properties[K]> },
    StructE<keyof Properties, ErrorOf<Properties[keyof Properties]>>,
    { [K in keyof Properties]: TypeOf<Properties[K]> }
  > {
  readonly _tag: 'FromStructD'
  readonly properties: Properties
}
export declare const fromStruct: <Properties extends Record<string, AnyD>>(
  properties: Properties
) => FromStructD<Properties>

export interface FromPartialD<Properties>
  extends Decoder<
    Partial<{ [K in keyof Properties]: InputOf<Properties[K]> }>,
    PartialE<keyof Properties, ErrorOf<Properties[keyof Properties]>>,
    Partial<{ [K in keyof Properties]: TypeOf<Properties[K]> }>
  > {
  readonly _tag: 'FromPartialD'
  readonly properties: Properties
}
export declare const fromPartial: <Properties extends Record<string, AnyD>>(
  properties: Properties
) => FromPartialD<Properties>

export interface FromArrayD<Item> extends Decoder<Array<InputOf<Item>>, ArrayE<ErrorOf<Item>>, Array<TypeOf<Item>>> {
  readonly _tag: 'FromArrayD'
  readonly item: Item
}
export declare const fromArray: <Item extends AnyD>(item: Item) => FromArrayD<Item>

export interface FromRecordD<Codomain>
  extends Decoder<Record<string, InputOf<Codomain>>, RecordE<ErrorOf<Codomain>>, Record<string, TypeOf<Codomain>>> {
  readonly _tag: 'FromRecordD'
  readonly codomain: Codomain
}
export declare const fromRecord: <Codomain extends AnyD>(codomain: Codomain) => FromRecordD<Codomain>

export interface FromTupleD<Components>
  extends Decoder<
    { [K in keyof Components]: InputOf<Components[K]> },
    TupleE<keyof Components, ErrorOf<Components[keyof Components]>>,
    { [K in keyof Components]: TypeOf<Components[K]> }
  > {
  readonly _tag: 'FromTupleD'
  readonly components: Components
}
export declare const fromTuple: <Components extends ReadonlyArray<AnyD>>(
  ...components: Components
) => FromTupleD<Components>

export interface UnionD<Members>
  extends Decoder<
    InputOf<Members[keyof Members]>,
    UnionE<keyof Members, ErrorOf<Members[keyof Members]>>,
    TypeOf<Members[keyof Members]>
  > {
  readonly _tag: 'UnionD'
  readonly members: Members
}
export declare const union: <Members extends ReadonlyArray<AnyD>>(...members: Members) => UnionD<Members>

export interface NullableD<Or> extends Decoder<null | InputOf<Or>, NullableE<ErrorOf<Or>>, null | TypeOf<Or>> {
  readonly _tag: 'NullableD'
  readonly or: Or
}
export declare const nullable: <Or extends AnyD>(or: Or) => NullableD<Or>

export interface RefineD<From, E, B extends TypeOf<From>>
  extends Decoder<InputOf<From>, ErrorOf<From> | RefineE<E>, B> {
  readonly _tag: 'RefineD'
  readonly from: From
  readonly refinement: Refinement<TypeOf<From>, B>
  readonly error: (from: TypeOf<From>) => E
}
export declare const refine: <From extends AnyD, B extends TypeOf<From>, E>(
  refinement: Refinement<TypeOf<From>, B>,
  error: (from: TypeOf<From>) => E
) => (from: From) => RefineD<From, E, B>

export interface ParseD<From, E, B> extends Decoder<InputOf<From>, ErrorOf<From> | ParseE<E>, B> {
  readonly _tag: 'ParseD'
  readonly from: From
  readonly parser: (a: TypeOf<From>) => These<E, B>
}
export declare const parse: <From extends AnyD, B, E>(
  parser: (a: TypeOf<From>) => These<E, B>
) => (from: From) => ParseD<From, E, B>

export interface IntersectD<F, S>
  extends Decoder<InputOf<F> & InputOf<S>, IntersectE<ErrorOf<F> | ErrorOf<S>>, TypeOf<F> & TypeOf<S>> {
  readonly _tag: 'IntersectD'
  readonly first: F
  readonly second: S
}
export declare const intersect: <S extends AnyD>(second: S) => <F extends AnyD>(first: F) => IntersectD<F, S>

export interface LazyD<D> {
  readonly _tag: 'LazyD'
  readonly id: string
  readonly decoder: Lazy<D>
}
export declare const lazy: <I, E, A>(id: string, decoder: Lazy<Decoder<I, E, A>>) => Decoder<I, LazyE<E>, A>

export interface TagE<A extends PropertyKey> {
  readonly _tag: 'TagE'
  readonly tags: ReadonlyNonEmptyArray<A>
}

export interface FromSumD<T extends string, Members>
  extends Decoder<
    InputOf<Members[keyof Members]>,
    LeafE<TagE<keyof Members>> | SumE<keyof Members, ErrorOf<Members[keyof Members]>>,
    TypeOf<Members[keyof Members]>
  > {
  readonly _tag: 'FromSumD'
  readonly tag: T
  readonly members: Members
}
// TODO: every `Members` should own a tag field
export declare const fromSum: <T extends string>(
  tag: T
) => <Members extends Record<string, AnyD>>(members: Members) => FromSumD<T, Members>

export interface StructD<Properties>
  extends Decoder<
    unknown,
    LeafE<UnknownRecordE> | StructE<keyof Properties, ErrorOf<Properties[keyof Properties]>>,
    { [K in keyof Properties]: TypeOf<Properties[K]> }
  > {
  readonly _tag: 'StructD'
  readonly properties: Properties
}
export const struct = <Properties extends Record<string, AnyUD>>(properties: Properties): StructD<Properties> => ({
  _tag: 'StructD',
  properties,
  decode: (u) =>
    M.chain(UnknownRecord.decode(u), (ur) => {
      const out = sequenceS(M)(
        pipe(
          properties,
          RR.mapWithIndex((k, p) => p.decode(ur[k]))
        )
      )
      const warnings: Array<string> = []
      for (const p in ur) {
        if (!(p in properties)) {
          warnings.push(p)
        }
      }
      if (warnings.length === 0) {
        return out
      }
      return M.chain(out, (a) => E.both(warningE(warnings as any), a))
    }) as any
})

export interface PartialD<Properties>
  extends Decoder<
    unknown,
    LeafE<UnknownRecordE> | PartialE<keyof Properties, ErrorOf<Properties[keyof Properties]>>,
    Partial<{ [K in keyof Properties]: TypeOf<Properties[K]> }>
  > {
  readonly _tag: 'PartialD'
  readonly properties: Properties
}
export declare const partial: <Properties extends Record<string, AnyUD>>(properties: Properties) => PartialD<Properties>

export interface TupleD<Components>
  extends Decoder<
    unknown,
    LeafE<UnknownArrayE> | TupleE<keyof Components, ErrorOf<Components[keyof Components]>>,
    { [K in keyof Components]: TypeOf<Components[K]> }
  > {
  readonly _tag: 'TupleD'
  readonly components: Components
}

export declare const tuple: <Components extends ReadonlyArray<AnyUD>>(...components: Components) => TupleD<Components>

export interface ArrayD<Item>
  extends Decoder<unknown, LeafE<UnknownArrayE> | ArrayE<ErrorOf<Item>>, Array<TypeOf<Item>>> {
  readonly _tag: 'ArrayD'
  readonly item: Item
}
export declare const array: <Item extends AnyUD>(item: Item) => ArrayD<Item>

export interface RecordD<Codomain>
  extends Decoder<unknown, LeafE<UnknownRecordE> | RecordE<ErrorOf<Codomain>>, Record<string, TypeOf<Codomain>>> {
  readonly _tag: 'RecordD'
  readonly codomain: Codomain
}
export declare const record: <Codomain extends AnyUD>(codomain: Codomain) => RecordD<Codomain>

export interface SumD<T extends string, Members>
  extends Decoder<
    unknown,
    LeafE<UnknownRecordE> | LeafE<TagE<keyof Members>> | SumE<keyof Members, ErrorOf<Members[keyof Members]>>,
    TypeOf<Members[keyof Members]>
  > {
  readonly _tag: 'SumD'
  readonly tag: T
  readonly members: Members
}
// TODO: every `Members` should own a tag field
export declare const sum: <T extends string>(
  tag: T
) => <Members extends Record<string, AnyUD>>(members: Members) => SumD<T, Members>

// -------------------------------------------------------------------------------------
// composition
// -------------------------------------------------------------------------------------

export interface IdentityD<A> extends Decoder<A, never, A> {
  readonly _tag: 'IdentityD'
}

export declare const id: <A>() => IdentityD<A>

export interface CompositionD<F, S> extends Decoder<InputOf<F>, ErrorOf<F> | ErrorOf<S>, TypeOf<S>> {
  readonly _tag: 'CompositionD'
  readonly first: F
  readonly second: S
}

export declare function compose<S extends AnyD>(second: S): <F extends AnyD>(first: F) => CompositionD<F, S>

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

export const URI = 'io-ts/Decoder3'

export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind3<R, E, A> {
    readonly [URI]: Decoder<R, E, A>
  }
}

// -------------------------------------------------------------------------------------
// use case: additional properties
// -------------------------------------------------------------------------------------

export const A = struct({
  a: struct({
    b: string
  })
})

console.log(A.decode({ a: { c: true }, d: 1 }))
