import * as E from 'fp-ts/lib/Either'
import { flow, Lazy, Refinement } from 'fp-ts/lib/function'
import { pipe } from 'fp-ts/lib/pipeable'
import * as RNEA from 'fp-ts/lib/ReadonlyNonEmptyArray'

import ReadonlyNonEmptyArray = RNEA.ReadonlyNonEmptyArray

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

export type Result<E, A> = E.Either<E, A>

export interface Decoder<I, E, A> {
  readonly decode: (i: I) => Result<E, A>
}

interface AnyD extends Decoder<any, any, any> {}
interface AnyUD extends Decoder<unknown, any, any> {}

export type InputOf<D> = D extends Decoder<infer I, any, any> ? I : never
export type ErrorOf<D> = D extends Decoder<any, infer E, any> ? E : never
export type TypeOf<D> = D extends Decoder<any, any, infer A> ? A : never

// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------

export interface MapLeftD<D, G> extends Decoder<InputOf<D>, G, TypeOf<D>> {
  readonly _tag: 'MapLeftD'
  readonly decoder: D
  readonly mapLeft: (e: ErrorOf<D>) => G
}

export const mapLeft = <D extends AnyD, G>(f: (e: ErrorOf<D>) => G) => (decoder: D): MapLeftD<D, G> => ({
  _tag: 'MapLeftD',
  decode: flow(decoder.decode, E.mapLeft(f)),
  decoder,
  mapLeft: f
})

// -------------------------------------------------------------------------------------
// error model
// -------------------------------------------------------------------------------------

export interface ActualE<I> {
  readonly actual: I
}

export interface SingleE<E> {
  readonly error: E
}

export interface CompoundE<E> {
  readonly errors: ReadonlyNonEmptyArray<E>
}

export interface LeafE<E> extends SingleE<E> {
  readonly _tag: 'LeafE'
}
export declare const leafE: <E>(e: E) => LeafE<E>

export interface NullableE<E> extends SingleE<E> {
  readonly _tag: 'NullableE'
}

export interface KeyE<K, E> extends SingleE<E> {
  readonly _tag: 'KeyE'
  readonly key: K
}

export interface StructE<E> extends CompoundE<E> {
  readonly _tag: 'StructE'
}

export interface PartialE<E> extends CompoundE<E> {
  readonly _tag: 'PartialE'
}

export interface IndexE<I, E> extends SingleE<E> {
  readonly _tag: 'IndexE'
  readonly index: I
}

export interface TupleE<E> extends CompoundE<E> {
  readonly _tag: 'TupleE'
}

export interface ArrayE<E> extends ActualE<ReadonlyArray<unknown>>, CompoundE<E> {
  readonly _tag: 'ArrayE'
}

export interface RecordE<E> extends ActualE<Readonly<Record<string, unknown>>>, CompoundE<E> {
  readonly _tag: 'RecordE'
}

export interface UnionE<E> extends CompoundE<E> {
  readonly _tag: 'UnionE'
}

export interface RefineE<E> extends SingleE<E> {
  readonly _tag: 'RefineE'
}

export interface ParseE<E> extends SingleE<E> {
  readonly _tag: 'ParseE'
}

export interface IntersectionE<E> extends CompoundE<E> {
  readonly _tag: 'IntersectionE'
}

export interface LazyE<E> extends SingleE<E> {
  readonly _tag: 'LazyE'
  readonly id: string
}

export interface MemberE<M, E> extends SingleE<E> {
  readonly _tag: 'MemberE'
  readonly member: M
}

export interface SumE<E> extends CompoundE<E> {
  readonly _tag: 'SumE'
}

// recursive helpers to please ts@3.5
export interface NullableRE<E> extends NullableE<DecodeError<E>> {}
export interface RefineRE<E> extends RefineE<DecodeError<E>> {}
export interface ParseRE<E> extends ParseE<DecodeError<E>> {}
export interface StructRE<E> extends StructE<DecodeError<E>> {}
export interface KeyRE<E> extends KeyE<string, DecodeError<E>> {}
export interface PartialRE<E> extends PartialE<DecodeError<E>> {}
export interface TupleRE<E> extends TupleE<DecodeError<E>> {}
export interface IndexRE<E> extends IndexE<number, DecodeError<E>> {}
export interface ArrayRE<E> extends ArrayE<DecodeError<E>> {}
export interface RecordRE<E> extends RecordE<DecodeError<E>> {}
export interface UnionRE<E> extends UnionE<DecodeError<E>> {}
export interface MemberRE<E> extends MemberE<string | number, DecodeError<E>> {}
export interface IntersectionRE<E> extends IntersectionE<DecodeError<E>> {}
export interface SumRE<E> extends SumE<DecodeError<E>> {}
export interface LazyRE<E> extends LazyE<DecodeError<E>> {}
export type DecodeError<E> =
  | LeafE<E>
  | NullableRE<E>
  | RefineRE<E>
  | ParseRE<E>
  | StructRE<E>
  | KeyRE<E>
  | PartialRE<E>
  | TupleRE<E>
  | IndexRE<E>
  | ArrayRE<E>
  | RecordRE<E>
  | UnionRE<E>
  | MemberRE<E>
  | IntersectionRE<E>
  | SumRE<E>
  | LazyRE<E>

// -------------------------------------------------------------------------------------
// error utils
// -------------------------------------------------------------------------------------

export type DefaultLeafE =
  | StringE
  | NumberE
  | BooleanE
  | UnknownRecordE
  | UnknownArrayE
  | LiteralE<Literal>
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
export declare const string: stringD

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
export declare const UnknownRecord: UnknownRecordD

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

export type Literal = string | number | boolean | null

export interface LiteralE<A extends Literal> extends ActualE<unknown> {
  readonly _tag: 'LiteralE'
  readonly literals: ReadonlyNonEmptyArray<A>
}

export interface LiteralD<A extends ReadonlyNonEmptyArray<Literal>>
  extends Decoder<unknown, LeafE<LiteralE<A[number]>>, A[number]> {
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
    StructE<{ readonly [K in keyof Properties]: KeyE<K, ErrorOf<Properties[K]>> }[keyof Properties]>,
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
    PartialE<{ readonly [K in keyof Properties]: KeyE<K, ErrorOf<Properties[K]>> }[keyof Properties]>,
    Partial<{ [K in keyof Properties]: TypeOf<Properties[K]> }>
  > {
  readonly _tag: 'FromPartialD'
  readonly properties: Properties
}
export declare const fromPartial: <Properties extends Record<string, AnyD>>(
  properties: Properties
) => FromPartialD<Properties>

export interface FromArrayD<Item>
  extends Decoder<Array<InputOf<Item>>, ArrayE<IndexE<number, ErrorOf<Item>>>, Array<TypeOf<Item>>> {
  readonly _tag: 'FromArrayD'
  readonly item: Item
}
export declare const fromArray: <Item extends AnyD>(item: Item) => FromArrayD<Item>

export interface FromRecordD<Codomain>
  extends Decoder<
    Record<string, InputOf<Codomain>>,
    RecordE<KeyE<string, ErrorOf<Codomain>>>,
    Record<string, TypeOf<Codomain>>
  > {
  readonly _tag: 'FromRecordD'
  readonly codomain: Codomain
}
export declare const fromRecord: <Codomain extends AnyD>(codomain: Codomain) => FromRecordD<Codomain>

export interface FromTupleD<Components extends ReadonlyArray<AnyD>>
  extends Decoder<
    { [K in keyof Components]: InputOf<Components[K]> },
    TupleE<{ [K in keyof Components]: IndexE<K, ErrorOf<Components[K]>> }[number]>,
    { [K in keyof Components]: TypeOf<Components[K]> }
  > {
  readonly _tag: 'FromTupleD'
  readonly components: Components
}
export declare const fromTuple: <Components extends ReadonlyArray<AnyD>>(
  ...components: Components
) => FromTupleD<Components>

export interface UnionD<Members extends ReadonlyArray<AnyD>>
  extends Decoder<
    InputOf<Members[keyof Members]>,
    UnionE<{ [I in keyof Members]: MemberE<I, ErrorOf<Members[I]>> }[number]>,
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
  readonly parser: (a: TypeOf<From>) => Result<E, B>
}
export declare const parse: <From extends AnyD, B, E>(
  parser: (a: TypeOf<From>) => Result<E, B>
) => (from: From) => ParseD<From, E, B>

export interface IntersectD<F, S>
  extends Decoder<
    InputOf<F> & InputOf<S>,
    IntersectionE<MemberE<0, ErrorOf<F>> | MemberE<1, ErrorOf<S>>>,
    TypeOf<F> & TypeOf<S>
  > {
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

export interface TagE<A extends PropertyKey> extends ActualE<unknown> {
  readonly _tag: 'TagE'
  readonly tags: ReadonlyNonEmptyArray<A>
}

export interface FromSumD<T extends string, Members>
  extends Decoder<
    InputOf<Members[keyof Members]>,
    LeafE<TagE<keyof Members>> | SumE<{ [K in keyof Members]: MemberE<K, ErrorOf<Members[K]>> }[keyof Members]>,
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
    | LeafE<UnknownRecordE>
    | StructE<{ readonly [K in keyof Properties]: KeyE<K, ErrorOf<Properties[K]>> }[keyof Properties]>,
    { [K in keyof Properties]: TypeOf<Properties[K]> }
  > {
  readonly _tag: 'StructD'
  readonly properties: Properties
}
export declare const struct: <Properties extends Record<string, AnyUD>>(properties: Properties) => StructD<Properties>

export interface PartialD<Properties>
  extends Decoder<
    unknown,
    | LeafE<UnknownRecordE>
    | PartialE<{ readonly [K in keyof Properties]: KeyE<K, ErrorOf<Properties[K]>> }[keyof Properties]>,
    Partial<{ [K in keyof Properties]: TypeOf<Properties[K]> }>
  > {
  readonly _tag: 'PartialD'
  readonly properties: Properties
}
export declare const partial: <Properties extends Record<string, AnyUD>>(properties: Properties) => PartialD<Properties>

export interface TupleD<Components extends ReadonlyArray<AnyUD>>
  extends Decoder<
    unknown,
    LeafE<UnknownArrayE> | TupleE<{ [K in keyof Components]: IndexE<K, ErrorOf<Components[K]>> }[number]>,
    { [K in keyof Components]: TypeOf<Components[K]> }
  > {
  readonly _tag: 'TupleD'
  readonly components: Components
}

export declare const tuple: <Components extends ReadonlyArray<AnyUD>>(...components: Components) => TupleD<Components>

export interface ArrayD<Item>
  extends Decoder<unknown, LeafE<UnknownArrayE> | ArrayE<IndexE<number, ErrorOf<Item>>>, Array<TypeOf<Item>>> {
  readonly _tag: 'ArrayD'
  readonly item: Item
}
export declare const array: <Item extends AnyUD>(item: Item) => ArrayD<Item>

export interface RecordD<Codomain>
  extends Decoder<
    unknown,
    LeafE<UnknownRecordE> | RecordE<RecordE<KeyE<string, ErrorOf<Codomain>>>>,
    Record<string, TypeOf<Codomain>>
  > {
  readonly _tag: 'RecordD'
  readonly codomain: Codomain
}
export declare const record: <Codomain extends AnyUD>(codomain: Codomain) => RecordD<Codomain>

export interface SumD<T extends string, Members>
  extends Decoder<
    unknown,
    | LeafE<UnknownRecordE>
    | LeafE<TagE<keyof Members>>
    | SumE<{ [K in keyof Members]: MemberE<K, ErrorOf<Members[K]>> }[keyof Members]>,
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

declare const id: <A>() => IdentityD<A>

export interface CompositionD<F, S> extends Decoder<InputOf<F>, ErrorOf<F> | ErrorOf<S>, TypeOf<S>> {
  readonly _tag: 'CompositionD'
  readonly first: F
  readonly second: S
}

export declare function compose<S extends AnyD>(second: S): <F extends AnyD>(first: F) => CompositionD<F, S>

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

export const URI = 'io-ts/Decoder'

export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind3<R, E, A> {
    readonly [URI]: Decoder<R, E, A>
  }
}

// -------------------------------------------------------------------------------------
// use case: mapLeft
// -------------------------------------------------------------------------------------

export const MapLeftExample = struct({
  a: string,
  b: number
})

// the decode error is fully typed...
// type MapLeftExampleE = LeafE<UnknownRecordE> | StructE<KeyE<"a", LeafE<StringE>> | KeyE<"b", LeafE<NumberE>>>
export type MapLeftExampleE = ErrorOf<typeof MapLeftExample>

// ...this means that you can pattern match on the error
// when you are mapping
export const result1 = pipe(
  MapLeftExample,
  mapLeft((de) => {
    switch (de._tag) {
      case 'LeafE':
        // const leafE: UnknownRecordE
        const leafE = de.error
        return `cannot decode ${leafE.actual}, should be a Record<string, unknown>`
      case 'StructE':
        // const errors: RNEA.ReadonlyNonEmptyArray<KeyE<"a", LeafE<StringE>> | KeyE<"b", LeafE<NumberE>>>
        const errors = de.errors
        return errors
          .map((e): string => {
            switch (e.key) {
              case 'a':
                return e.error.error._tag
              case 'b':
                return e.error.error._tag
            }
          })
          .join('\n')
    }
  })
)

// -------------------------------------------------------------------------------------
// use case: custom leaf error
// -------------------------------------------------------------------------------------

interface NonEmptyStringBrand {
  readonly NonEmptyString: unique symbol
}
export type NonEmptyString = string & NonEmptyStringBrand
export interface NonEmptyStringE extends ActualE<string> {
  readonly _tag: 'NonEmptyStringE'
}
declare const nonEmptyStringE: (actual: string) => NonEmptyStringE
export const NonEmptyString = pipe(
  id<string>(),
  refine(
    (s): s is NonEmptyString => s.length > 0,
    (actual) => leafE(nonEmptyStringE(actual))
  )
)

// -------------------------------------------------------------------------------------
// use case: handling a generic error, for example drawing a tree
// -------------------------------------------------------------------------------------

export interface Tree<A> {
  readonly value: A
  readonly forest: ReadonlyArray<Tree<A>>
}

const empty: Array<never> = []

const tree = <A>(value: A, forest: ReadonlyArray<Tree<A>> = empty): Tree<A> => ({
  value,
  forest
})

export const drawWith = <E>(leafEncoder: (e: E) => Tree<string>): ((de: DecodeError<E>) => Tree<string>) => {
  const go = (de: DecodeError<E>): Tree<string> => {
    switch (de._tag) {
      case 'LeafE':
        return leafEncoder(de.error)
      case 'IndexE':
        return tree(`cannot decode index ${de.index}`, [go(de.error)])
      case 'ArrayE':
        return tree(`cannot decode ${de.actual}`, de.errors.map(go))
      // etc...
      default:
        return tree('TODO')
    }
  }
  return go
}

export const defaultLeafEncoder = (e: DefaultLeafE): Tree<string> => tree(e._tag)

export const draw = drawWith(defaultLeafEncoder)

const DR1 = fromStruct({
  a: string,
  b: number,
  c: union(string, number)
})

export const treeOutput1 = pipe(DR1, mapLeft(draw))

// what if the decoder contains a custom error?

const DR2 = fromStruct({
  a: NonEmptyString,
  b: number
})

// export const treeOutput2 = pipe(DR2, mapLeft(draw)) // <= type error because `NonEmptyStringE` is not handled

// I can define my own `leafEncoder`
const myLeafEncoder = (e: DefaultLeafE | NonEmptyStringE) => {
  switch (e._tag) {
    case 'NonEmptyStringE':
      return tree(`cannot decode ${e.actual}, should be a non empty string`)
    default:
      return defaultLeafEncoder(e)
  }
}

export const treeOutput2 = pipe(DR2, mapLeft(drawWith(myLeafEncoder))) // <= ok

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
export type NonEmptyStringDI = InputOf<typeof NonEmptyString>
export type NonEmptyStringDE = ErrorOf<typeof NonEmptyString>
export type NonEmptyStringDA = TypeOf<typeof NonEmptyString>

const NonEmptyStringUD = pipe(string, compose(NonEmptyString))
export type NonEmptyStringUDE = ErrorOf<typeof NonEmptyStringUD>
export type NonEmptyStringUDA = TypeOf<typeof NonEmptyStringUD>

export interface IntBrand {
  readonly Int: unique symbol
}
export type Int = number & IntBrand
export interface IntE {
  readonly _tag: 'IntE'
}
export declare const intE: IntE
export const IntD = pipe(
  id<number>(),
  refine(
    (n): n is Int => Number.isInteger(n),
    () => leafE(intE)
  )
)
export const IntUD = pipe(number, compose(IntD))

// union
export const UD = union(NonEmptyString, IntD)
export type UDI = InputOf<typeof UD>
export type UDE = ErrorOf<typeof UD>
export type UDA = TypeOf<typeof UD>

export const UUD = union(string, number)
export type UUDE = ErrorOf<typeof UUD>
export type UUDA = TypeOf<typeof UUD>

// nullable
export const ND = nullable(NonEmptyString)
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
declare const parseNumber: (s: string) => Result<ParseNumberE, number>
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
interface ReadonlyArrayCategoryE extends ArrayE<IndexE<number, CategoryE>> {}
type CategoryE = LazyE<
  | LeafE<UnknownRecordE>
  | StructE<
      | KeyE<'name', LeafE<StringE> | RefineE<LeafE<NonEmptyStringE>>>
      | KeyE<'categories', LeafE<UnknownArrayE> | ReadonlyArrayCategoryE>
    >
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
  g: NonEmptyString,
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
// use case: form
// -------------------------------------------------------------------------------------

const MyForm = fromStruct({
  name: NonEmptyStringUD,
  age: number
})

pipe(
  MyForm,
  mapLeft((e) => {
    // const errors: RNEA.ReadonlyNonEmptyArray<KeyE<"name", LeafE<StringE> | RefineE<LeafE<NonEmptyStringE>>> | KeyE<"age", LeafE<NumberE>>>
    const errors = e.errors
    console.log(errors)
    return e
  })
)

const d = fromSum('_tag')({
  A: fromStruct({
    _tag: literal('A'),
    a: string
  }),
  B: fromStruct({
    _tag: literal('B'),
    b: number
  })
})

pipe(
  d,
  mapLeft((de) => {
    switch (de._tag) {
      case 'LeafE': {
        break
      }
      case 'SumE': {
        pipe(
          de.errors,
          RNEA.map((e) => {
            switch (e.member) {
              case 'A':
                return pipe(
                  e.error.errors,
                  RNEA.map((x) => x)
                )
              case 'B':
                return pipe(
                  e.error.errors,
                  RNEA.map((x) => x)
                )
            }
          })
        )
      }
    }
  })
)
