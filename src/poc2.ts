import * as E from 'fp-ts/lib/Either'
import { Lazy, Refinement } from 'fp-ts/lib/function'
import { pipe } from 'fp-ts/lib/pipeable'
import * as RNEA from 'fp-ts/lib/ReadonlyNonEmptyArray'

import Either = E.Either
import ReadonlyNonEmptyArray = RNEA.ReadonlyNonEmptyArray

// -------------------------------------------------------------------------------------
// errors
// -------------------------------------------------------------------------------------

export interface LeafE<E> {
  readonly _tag: 'LeafE'
  readonly error: E
}
export declare const leafE: <E>(e: E) => LeafE<E>

export type Literal = string | number | boolean | null
export interface LiteralE<A extends ReadonlyNonEmptyArray<Literal>> {
  readonly _tag: 'LiteralE'
  readonly actual: unknown
  readonly literals: A
}

export interface NullableE<E> {
  readonly _tag: 'NullableE'
  readonly actual: unknown
  readonly error: E
}

export interface KeyE<E> {
  readonly actual: unknown
  readonly key: string
  readonly error: E
}

export interface StructE<E> {
  readonly _tag: 'StructE'
  readonly actual: unknown
  readonly error: ReadonlyNonEmptyArray<KeyE<E>>
}

export interface PartialE<E> {
  readonly _tag: 'PartialE'
  readonly actual: unknown
  readonly error: ReadonlyNonEmptyArray<KeyE<E>>
}

export interface IndexE<E> {
  readonly actual: unknown
  readonly index: number
  readonly error: E
}

export interface TupleE<E> {
  readonly _tag: 'TupleE'
  readonly actual: unknown
  readonly error: ReadonlyNonEmptyArray<IndexE<E>>
}

export interface ArrayE<E> {
  readonly _tag: 'ArrayE'
  readonly actual: unknown
  readonly error: ReadonlyNonEmptyArray<IndexE<E>>
}

export interface RecordE<E> {
  readonly _tag: 'RecordE'
  readonly actual: unknown
  readonly error: ReadonlyNonEmptyArray<KeyE<E>>
}

export interface UnionE<E> {
  readonly _tag: 'UnionE'
  readonly actual: unknown
  readonly error: ReadonlyNonEmptyArray<IndexE<E>>
}

export interface RefineE<E> {
  readonly _tag: 'RefineE'
  readonly actual: unknown
  readonly error: E
}

export interface ParseE<E> {
  readonly _tag: 'ParseE'
  readonly actual: unknown
  readonly error: E
}

export interface IntersectE<E> {
  readonly _tag: 'IntersectE'
  readonly actual: unknown
  readonly error: E
}

export interface LazyE<E> {
  readonly _tag: 'LazyE'
  readonly id: string
  readonly error: E
}

export interface TagE<A> {
  readonly _tag: 'TagE'
  readonly actual: unknown
  readonly literals: ReadonlyNonEmptyArray<A>
}

export interface SumE<E> {
  readonly _tag: 'SumE'
  readonly actual: unknown
  readonly error: ReadonlyNonEmptyArray<IndexE<E>>
}

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

export interface Decoder<I, E, A> {
  readonly decode: (i: I) => Either<E, A>
}

interface AnyD extends Decoder<any, any, any> {}
interface AnyUD extends Decoder<unknown, any, any> {}

export type InputOf<D> = D extends Decoder<infer I, any, any> ? I : never
export type ErrorOf<D> = D extends Decoder<any, infer E, any> ? E : never
export type TypeOf<D> = D extends Decoder<any, any, infer A> ? A : never

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

export interface StringE {
  readonly _tag: 'StringE'
  readonly actual: unknown
}
export interface stringD extends Decoder<unknown, LeafE<StringE>, string> {
  readonly _tag: 'stringD'
}
export declare const string: stringD

export interface NumberE {
  readonly _tag: 'NumberE'
  readonly actual: unknown
}
export interface numberD extends Decoder<unknown, LeafE<NumberE>, number> {
  readonly _tag: 'numberD'
}
export declare const number: numberD

export interface BooleanE {
  readonly _tag: 'BooleanE'
  readonly actual: unknown
}
export interface booleanD extends Decoder<unknown, LeafE<BooleanE>, boolean> {
  readonly _tag: 'booleanD'
}
export declare const boolean: booleanD

// -------------------------------------------------------------------------------------
// unknown containers
// -------------------------------------------------------------------------------------

export interface UnknownArrayE {
  readonly _tag: 'UnknownArrayE'
  readonly actual: unknown
}
export interface UnknownArrayD extends Decoder<unknown, LeafE<UnknownArrayE>, Array<unknown>> {
  readonly _tag: 'UnknownArrayD'
}
export declare const UnknownArray: UnknownArrayD

export interface UnknownRecordE {
  readonly _tag: 'UnknownRecordE'
  readonly actual: unknown
}
export interface UnknownRecordD extends Decoder<unknown, LeafE<UnknownRecordE>, Record<string, unknown>> {
  readonly _tag: 'UnknownRecordD'
}
export declare const UnknownRecord: UnknownRecordD

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

export interface LiteralD<A extends ReadonlyNonEmptyArray<Literal>> extends Decoder<unknown, LiteralE<A>, A[number]> {
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
    StructE<ErrorOf<Properties[keyof Properties]>>,
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
    PartialE<ErrorOf<Properties[keyof Properties]>>,
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
    TupleE<ErrorOf<Components[keyof Components]>>,
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
    UnionE<ErrorOf<Members[keyof Members]>>,
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
  readonly parser: (a: TypeOf<From>) => E.Either<E, B>
}
export declare const parse: <From extends AnyD, B, E>(
  parser: (a: TypeOf<From>) => E.Either<E, B>
) => (from: From) => ParseD<From, E, B>

export interface IntersectD<L, R>
  extends Decoder<InputOf<L> & InputOf<R>, IntersectE<ErrorOf<L> | ErrorOf<R>>, TypeOf<L> & TypeOf<R>> {
  readonly _tag: 'IntersectD'
  readonly left: L
  readonly right: R
}
export declare const intersect: <R extends AnyD>(right: R) => <L extends AnyD>(left: L) => IntersectD<L, R>

export interface LazyD<D> {
  readonly _tag: 'LazyD'
  readonly id: string
  readonly decoder: Lazy<D>
}
export declare const lazy: <I, E, A>(id: string, decoder: Lazy<Decoder<I, E, A>>) => Decoder<I, LazyE<E>, A>

export interface FromSumD<T extends string, Members>
  extends Decoder<
    InputOf<Members[keyof Members]>,
    TagE<keyof Members> | SumE<ErrorOf<Members[keyof Members]>>,
    TypeOf<Members[keyof Members]>
  > {
  readonly _tag: 'FromSumD'
  readonly tag: T
  readonly members: Members
}
export declare const fromSum: <T extends string>(
  tag: T
) => <Members extends Record<string, AnyD>>(members: Members) => FromSumD<T, Members>

export interface StructD<Properties>
  extends Decoder<
    unknown,
    LeafE<UnknownRecordE> | StructE<ErrorOf<Properties[keyof Properties]>>,
    { [K in keyof Properties]: TypeOf<Properties[K]> }
  > {
  readonly _tag: 'StructD'
  readonly properties: Properties
}
export declare const struct: <Properties extends Record<string, AnyUD>>(properties: Properties) => StructD<Properties>

export interface PartialD<Properties>
  extends Decoder<
    unknown,
    LeafE<UnknownRecordE> | PartialE<ErrorOf<Properties[keyof Properties]>>,
    Partial<{ [K in keyof Properties]: TypeOf<Properties[K]> }>
  > {
  readonly _tag: 'PartialD'
  readonly properties: Properties
}
export declare const partial: <Properties extends Record<string, AnyUD>>(properties: Properties) => PartialD<Properties>

export interface TupleD<Components>
  extends Decoder<
    unknown,
    LeafE<UnknownArrayE> | TupleE<ErrorOf<Components[keyof Components]>>,
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
    LeafE<UnknownRecordE> | TagE<keyof Members> | SumE<ErrorOf<Members[keyof Members]>>,
    TypeOf<Members[keyof Members]>
  > {
  readonly _tag: 'SumD'
  readonly tag: T
  readonly members: Members
}
export declare const sum: <T extends string>(
  tag: T
) => <Members extends Record<string, AnyUD>>(members: Members) => SumD<T, Members>

// -------------------------------------------------------------------------------------
// composition
// -------------------------------------------------------------------------------------

export interface IdentityD<A> extends Decoder<A, never, A> {
  readonly _tag: 'IdentityD'
}

declare const id: <A>() => IdentityD<A>

export interface CompositionD<F, S> extends Decoder<InputOf<F>, ErrorOf<F> | ErrorOf<S>, TypeOf<S>> {
  readonly _tag: 'CompositionD'
  readonly first: F
  readonly second: S
}

export declare function compose<S extends AnyD>(bc: S): <F extends AnyD>(ab: F) => CompositionD<F, S>

// -------------------------------------------------------------------------------------
// examples
// -------------------------------------------------------------------------------------

// literal
export const LDU = literal(1, true)
export type LDUI = InputOf<typeof LDU>
export type LDUE = ErrorOf<typeof LDU>
export type LDUA = TypeOf<typeof LDU>

// fromStruct
export const SD = fromStruct({
  a: string,
  b: number
})
export type SDI = InputOf<typeof SD>
export type SDE = ErrorOf<typeof SD>
export type SDA = TypeOf<typeof SD>

// struct
export const SUD = struct({
  a: string,
  b: number
})
export type SUDI = InputOf<typeof SUD>
export type SUDE = ErrorOf<typeof SUD>
export type SUDA = TypeOf<typeof SUD>

// fromPartial
export const PSD = fromPartial({
  a: string,
  b: number
})
export type PSDI = InputOf<typeof PSD>
export type PSDE = ErrorOf<typeof PSD>
export type PSDA = TypeOf<typeof PSD>

// partial
export const PSUD = partial({
  a: string,
  b: number
})
export type PSUDE = ErrorOf<typeof PSUD>
export type PSUDA = TypeOf<typeof PSUD>

// fromTuple
export const TD = fromTuple(string, number)
export type TDI = InputOf<typeof TD>
export type TDE = ErrorOf<typeof TD>
export type TDA = TypeOf<typeof TD>

// tuple
export const TUD = tuple(string, number)
export type TUDE = ErrorOf<typeof TUD>
export type TUDA = TypeOf<typeof TUD>

// fromArray
export const AD = fromArray(string)
export type ADI = InputOf<typeof AD>
export type ADE = ErrorOf<typeof AD>
export type ADA = TypeOf<typeof AD>

// array
export const AUD = array(string)

// fromRecord
export const RD = fromRecord(number)
export type RDI = InputOf<typeof RD>
export type RDE = ErrorOf<typeof RD>
export type RDA = TypeOf<typeof RD>

// record
export const RUD = record(number)

// refine
interface NonEmptyStringBrand {
  readonly NonEmptyString: unique symbol
}
export type NonEmptyString = string & NonEmptyStringBrand
export interface NonEmptyStringE {
  readonly _tag: 'NonEmptyStringE'
}
declare const NonEmptyStringE: NonEmptyStringE
export const NonEmptyStringD = pipe(
  id<string>(),
  refine(
    (s): s is NonEmptyString => s.length > 0,
    () => leafE(NonEmptyStringE)
  )
)
export type NonEmptyStringDI = InputOf<typeof NonEmptyStringD>
export type NonEmptyStringDE = ErrorOf<typeof NonEmptyStringD>
export type NonEmptyStringDA = TypeOf<typeof NonEmptyStringD>

const NonEmptyStringUD = pipe(string, compose(NonEmptyStringD))
export type NonEmptyStringUDE = ErrorOf<typeof NonEmptyStringUD>
export type NonEmptyStringUDA = TypeOf<typeof NonEmptyStringUD>

export interface IntBrand {
  readonly Int: unique symbol
}
export type Int = number & IntBrand
export interface IntE {
  readonly _tag: 'IntE'
}
declare const intE: IntE
export const IntD = pipe(
  id<number>(),
  refine(
    (n): n is Int => Number.isInteger(n),
    () => leafE(intE)
  )
)
const IntUD = pipe(number, compose(IntD))

// union
export const UD = union(NonEmptyStringD, IntD)
export type UDI = InputOf<typeof UD>
export type UDE = ErrorOf<typeof UD>
export type UDA = TypeOf<typeof UD>

export const UUD = union(string, number)
export type UUDE = ErrorOf<typeof UUD>
export type UUDA = TypeOf<typeof UUD>

// nullable
export const ND = nullable(NonEmptyStringD)
export type NDI = InputOf<typeof ND>
export type NDE = ErrorOf<typeof ND>
export type NDA = TypeOf<typeof ND>

export const NUD = nullable(string)
export type NUDE = ErrorOf<typeof NUD>
export type NUDA = TypeOf<typeof NUD>

// parse
interface ParseNumberE {
  readonly _tag: 'ParseNumberE'
}
declare const parseNumber: (s: string) => E.Either<ParseNumberE, number>
const PD = pipe(id<string>(), parse(parseNumber))
export type PDI = InputOf<typeof PD>
export type PDE = ErrorOf<typeof PD>
export type PDA = TypeOf<typeof PD>

const PUD = pipe(string, parse(parseNumber))
export type PUDE = ErrorOf<typeof PUD>
export type PUDA = TypeOf<typeof PUD>

// intersect
export const ID = pipe(fromStruct({ a: string }), intersect(fromStruct({ b: number })))
export type IDI = InputOf<typeof ID>
export type IDE = ErrorOf<typeof ID>
export type IDA = TypeOf<typeof ID>

export const IUD = pipe(struct({ a: string }), intersect(struct({ b: number })))
export type IUDE = ErrorOf<typeof IUD>
export type IUDA = TypeOf<typeof IUD>

// lazy
interface Category {
  name: string
  categories: ReadonlyArray<Category>
}
// Note: getting the error type is quite difficult.
interface ReadonlyArrayCategoryE extends ArrayE<CategoryE> {}
type CategoryE = LazyE<
  | LeafE<UnknownRecordE>
  | StructE<LeafE<StringE> | RefineE<LeafE<NonEmptyStringE>> | LeafE<UnknownArrayE> | ReadonlyArrayCategoryE>
>
// A possible solution is using DecodeError<E>
// type CategoryE = DecodeError<StringE | NonEmptyStringE | UnknownArrayE | UnknownRecordE>
export const LaUD: Decoder<unknown, CategoryE, Category> = lazy('Category', () =>
  struct({
    name: NonEmptyStringUD,
    categories: array(LaUD)
  })
)
export type LaUDE = ErrorOf<typeof LaUD>
export type LaUDA = TypeOf<typeof LaUD>

// sum
export const SumD = fromSum('type')({
  A: fromStruct({ type: literal('A'), a: string }),
  B: fromStruct({ type: literal('B'), b: string })
})
export type SumDI = InputOf<typeof SumD>
export type SumDE = ErrorOf<typeof SumD>
export type SumDA = TypeOf<typeof SumD>

const sumType = sum('type')
export const SumUD = sumType({
  A: struct({ type: literal('A'), a: string }),
  B: struct({ type: literal('B'), b: string })
})
export type SumUDE = ErrorOf<typeof SumUD>
export type SumUDA = TypeOf<typeof SumUD>

// all
const AllD = fromStruct({
  a: LDU,
  b: TD,
  c: AD,
  d: RD,
  e: UD,
  f: ND,
  g: NonEmptyStringD,
  h: PD,
  i: ID
})
export type AllDI = InputOf<typeof AllD>
export type AllDE = ErrorOf<typeof AllD>
export type AllDA = TypeOf<typeof AllD>

const AllUD = struct({
  a: LDU,
  b: SUD,
  c: TUD,
  d: AUD,
  e: RUD,
  f: UUD,
  g: NUD,
  h: NonEmptyStringUD,
  i: PUD,
  l: IUD
})
export type AllUDE = ErrorOf<typeof AllUD>
export type AllUDA = TypeOf<typeof AllUD>

// -------------------------------------------------------------------------------------
// mapLeft
// -------------------------------------------------------------------------------------

export const MLUD = struct({
  a: string,
  b: number
})
export type MLUDE = ErrorOf<typeof MLUD>

export const result1 = pipe(
  MLUD.decode({}),
  E.mapLeft((de) => {
    switch (de._tag) {
      case 'LeafE':
        return de.error._tag
      case 'StructE':
        const structErrors = de.error
        return structErrors
          .map((e) => {
            return `${e.key}: ${e.error}`
          })
          .join('\n')
    }
  })
)

const MLD = struct({
  a: IntUD,
  b: NonEmptyStringUD
})
export type MLDE = ErrorOf<typeof MLD>

export const result2 = pipe(
  MLD.decode({}),
  E.mapLeft((de) => {
    switch (de._tag) {
      case 'LeafE':
        return de.error._tag
      case 'StructE':
        return 'StructE'
    }
  })
)

// -------------------------------------------------------------------------------------
// draw
// -------------------------------------------------------------------------------------

export interface NullableRE<E> extends NullableE<DecodeError<E>> {}
export interface RefineRE<E> extends RefineE<DecodeError<E>> {}
export interface ParseRE<E> extends ParseE<DecodeError<E>> {}
export interface StructRE<E> extends StructE<DecodeError<E>> {}
export interface PartialRE<E> extends PartialE<DecodeError<E>> {}
export interface TupleRE<E> extends TupleE<DecodeError<E>> {}
export interface ArrayRE<E> extends ArrayE<DecodeError<E>> {}
export interface RecordRE<E> extends RecordE<DecodeError<E>> {}
export interface UnionRE<E> extends UnionE<DecodeError<E>> {}
export interface IntersectionRE<E> extends IntersectE<DecodeError<E>> {}
export interface LazyRE<E> extends LazyE<DecodeError<E>> {}
export interface SumRE<E> extends SumE<DecodeError<E>> {}
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
  | LazyRE<E>
  | SumRE<E>

export type LeafsE = StringE | NumberE | BooleanE | UnknownRecordE | UnknownArrayE

export const drawWith = <E>(f: (e: E) => string) => (de: DecodeError<E>): string => {
  switch (de._tag) {
    case 'LeafE':
      return f(de.error)
  }
  return de._tag
}

export const drawLeafs = (e: LeafsE): string => e._tag

export const draw = drawWith(drawLeafs)

const DR = struct({
  a: NonEmptyStringUD,
  b: number,
  c: boolean
})

const result3 = DR.decode({ a: null, b: null, c: null })

const myDraw = drawWith((e: { toString: () => string }) => {
  return e.toString()
})

// export const result4 = pipe(result3, E.mapLeft(draw))
// export const result4 = pipe(result3, E.mapLeft(drawWith((e: StringE | NumberE | BooleanE | UnknownRecordE) => e._tag)))
export const result4 = pipe(result3, E.mapLeft(myDraw))

// -------------------------------------------------------------------------------------
// form
// -------------------------------------------------------------------------------------

export declare const toFormErrors: <Properties>(struct: {
  readonly properties: Properties
}) => (error: StructE<ErrorOf<Properties[keyof Properties]>>) => { [K in keyof Properties]?: ErrorOf<Properties[K]> }

const MyForm = fromStruct({
  name: NonEmptyStringUD,
  age: number
})

pipe(
  MyForm.decode({ name: null, age: null }),
  E.mapLeft((e) => {
    const form = pipe(e, toFormErrors(MyForm))
    /*
    const form: {
        name?: StringE | RefineE<NonEmptyStringE> | undefined;
        age?: NumberE | undefined;
    }
    */
    console.log(form)
    return e
  })
)
