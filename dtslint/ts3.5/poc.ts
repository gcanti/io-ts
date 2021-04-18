import { pipe } from 'fp-ts/lib/pipeable'
import { These } from 'fp-ts/lib/These'
import * as D from '../../src/poc'

// literal
export const LDU = D.literal(1, true)
// $ExpectType unknown
export type LDUI = D.InputOf<typeof LDU>
// $ExpectType LiteralLE<true | 1>
export type LDUE = D.ErrorOf<typeof LDU>
// $ExpectType true | 1
export type LDUA = D.TypeOf<typeof LDU>

// fromStruct
export const SD = D.fromStruct({
  a: D.string,
  b: D.number
})
// $ExpectType { a: unknown; b: unknown; }
export type SDI = D.InputOf<typeof SD>
// $ExpectType StructE<RequiredKeyE<"a", StringLE> | RequiredKeyE<"b", NumberLE | NaNLE>>
export type SDE = D.ErrorOf<typeof SD>
// $ExpectType { a: string; b: number; }
export type SDA = D.TypeOf<typeof SD>

// struct
export const SUD = D.struct({
  a: D.string,
  b: D.number
})
// $ExpectType unknown
export type SUDI = D.InputOf<typeof SUD>
// $ExpectType CompositionE<PrevE<CompositionE<PrevE<CompositionE<PrevE<UnknownRecordLE> | NextE<UnexpectedKeysE>>> | NextE<MissingKeysE>>> | NextE<StructE<RequiredKeyE<"a", StringLE> | RequiredKeyE<"b", NumberLE | NaNLE>>>>
export type SUDE = D.ErrorOf<typeof SUD>
// $ExpectType { a: string; b: number; }
export type SUDA = D.TypeOf<typeof SUD>

// fromPartial
export const PSD = D.fromPartial({
  a: D.string,
  b: D.number
})
// $ExpectType Partial<{ a: unknown; b: unknown; }>
export type PSDI = D.InputOf<typeof PSD>
// $ExpectType PartialE<OptionalKeyE<"a", StringLE> | OptionalKeyE<"b", NumberLE | NaNLE>>
export type PSDE = D.ErrorOf<typeof PSD>
// $ExpectType Partial<{ a: string; b: number; }>
export type PSDA = D.TypeOf<typeof PSD>

// partial
export const PSUD = D.partial({
  a: D.string,
  b: D.number
})
// $ExpectType unknown
export type PSUDI = D.InputOf<typeof PSUD>
// $ExpectType CompositionE<PrevE<CompositionE<PrevE<UnknownRecordLE> | NextE<UnexpectedKeysE>>> | NextE<PartialE<OptionalKeyE<"a", StringLE> | OptionalKeyE<"b", NumberLE | NaNLE>>>>
export type PSUDE = D.ErrorOf<typeof PSUD>
// $ExpectType Partial<{ a: string; b: number; }>
export type PSUDA = D.TypeOf<typeof PSUD>

// fromTuple
export const TD = D.fromTuple(D.string, D.number)
// $ExpectType readonly [unknown, unknown]
export type TDI = D.InputOf<typeof TD>
// $ExpectType TupleE<RequiredIndexE<"0", StringLE> | RequiredIndexE<"1", NumberLE | NaNLE>>
export type TDE = D.ErrorOf<typeof TD>
// $ExpectType [string, number]
export type TDA = D.TypeOf<typeof TD>

// tuple
export const TUD = D.tuple(D.string, D.number)
// $ExpectType unknown
export type TUDI = D.InputOf<typeof TUD>
// $ExpectType CompositionE<PrevE<CompositionE<PrevE<CompositionE<PrevE<UnknownArrayLE> | NextE<UnexpectedIndexesE>>> | NextE<MissingIndexesE>>> | NextE<TupleE<RequiredIndexE<"0", StringLE> | RequiredIndexE<"1", NumberLE | NaNLE>>>>
export type TUDE = D.ErrorOf<typeof TUD>
// $ExpectType [string, number]
export type TUDA = D.TypeOf<typeof TUD>

// fromArray
export const AD = D.fromArray(D.string)
// $ExpectType unknown[]
export type ADI = D.InputOf<typeof AD>
// $ExpectType ArrayE<OptionalIndexE<number, StringLE>>
export type ADE = D.ErrorOf<typeof AD>
// $ExpectType string[]
export type ADA = D.TypeOf<typeof AD>

// array
export const AUD = D.array(D.string)
// $ExpectType unknown
export type AUDI = D.InputOf<typeof AUD>
// $ExpectType CompositionE<PrevE<UnknownArrayLE> | NextE<ArrayE<OptionalIndexE<number, StringLE>>>>
export type AUDE = D.ErrorOf<typeof AUD>
// $ExpectType string[]
export type AUDA = D.TypeOf<typeof AUD>

// fromRecord
export const RD = D.fromRecord(D.number)
// $ExpectType Record<string | number | symbol, unknown>
export type RDI = D.InputOf<typeof RD>
// $ExpectType RecordE<RequiredKeyE<string, NumberLE | NaNLE>>
export type RDE = D.ErrorOf<typeof RD>
// $ExpectType Record<string | number | symbol, number>
export type RDA = D.TypeOf<typeof RD>

// record
export const RUD = D.record(D.number)
// $ExpectType unknown
export type RUDI = D.InputOf<typeof RUD>
// $ExpectType CompositionE<PrevE<UnknownRecordLE> | NextE<RecordE<RequiredKeyE<string, NumberLE | NaNLE>>>>
export type RUDE = D.ErrorOf<typeof RUD>
// $ExpectType Record<string | number | symbol, number>
export type RUDA = D.TypeOf<typeof RUD>

// refine
export interface IntBrand {
  readonly Int: unique symbol
}
export type Int = number & IntBrand
export interface IntE extends D.ActualE<number> {
  readonly _tag: 'IntE'
}
export const intE = (actual: number): IntE => ({ _tag: 'IntE', actual })
export const ReD = pipe(
  D.id<number>(),
  D.fromRefinement(
    (n): n is Int => Number.isInteger(n),
    (n) => D.leafE(intE(n))
  )
)
// $ExpectType number
export type ReDI = D.InputOf<typeof ReD>
// $ExpectType CompositionE<PrevE<never> | NextE<RefinementE<LeafE<IntE>>>>
export type ReDE = D.ErrorOf<typeof ReD>
// $ExpectType Int
export type ReDA = D.TypeOf<typeof ReD>

export const ReUD = pipe(D.number, D.compose(ReD))
// $ExpectType unknown
export type ReUDI = D.InputOf<typeof ReUD>
// $ExpectType CompositionE<PrevE<NumberLE | NaNLE> | NextE<CompositionE<PrevE<never> | NextE<RefinementE<LeafE<IntE>>>>>>
export type ReUDE = D.ErrorOf<typeof ReUD>
// $ExpectType Int
export type ReUDA = D.TypeOf<typeof ReUD>

// union
export const UD = D.union(D.string, D.number)
// $ExpectType unknown
export type UDI = D.InputOf<typeof UD>
// $ExpectType UnionE<MemberE<"0", StringLE> | MemberE<"1", NumberLE | NaNLE>>
export type UDE = D.ErrorOf<typeof UD>
// $ExpectType string | number
export type UDA = D.TypeOf<typeof UD>

// nullable
export const NUD = D.nullable(D.number)
// $ExpectType unknown
export type NUDI = D.InputOf<typeof NUD>
// $ExpectType NullableE<NumberLE | NaNLE>
export type NUDE = D.ErrorOf<typeof NUD>
// $ExpectType number | null
export type NUDA = D.TypeOf<typeof NUD>

// parse
interface ParseNumberE {
  readonly _tag: 'ParseNumberE'
}
declare const parseNumber: (s: string) => These<ParseNumberE, number>
const PD = pipe(D.id<string>(), D.parse(parseNumber))
// $ExpectType string
export type PDI = D.InputOf<typeof PD>
// $ExpectType CompositionE<PrevE<never> | NextE<ParserE<ParseNumberE>>>
export type PDE = D.ErrorOf<typeof PD>
// $ExpectType number
export type PDA = D.TypeOf<typeof PD>

const PUD = pipe(D.string, D.parse(parseNumber))
// $ExpectType unknown
export type PUDI = D.InputOf<typeof PUD>
// $ExpectType CompositionE<NextE<ParserE<ParseNumberE>> | PrevE<StringLE>>
export type PUDE = D.ErrorOf<typeof PUD>
// $ExpectType number
export type PUDA = D.TypeOf<typeof PUD>

// intersect
export const ID = pipe(D.fromStruct({ a: D.string }), D.intersect(D.fromStruct({ b: D.number })))
// $ExpectType { a: unknown; } & { b: unknown; }
export type IDI = D.InputOf<typeof ID>
// $ExpectType IntersectionE<MemberE<0, StructE<RequiredKeyE<"a", StringLE>>> | MemberE<1, StructE<RequiredKeyE<"b", NumberLE | NaNLE>>>>
export type IDE = D.ErrorOf<typeof ID>
// $ExpectType { a: string; } & { b: number; }
export type IDA = D.TypeOf<typeof ID>

export const IUD = pipe(D.struct({ a: D.string }), D.intersect(D.struct({ b: D.number })))
// $ExpectType unknown
export type IUDI = D.InputOf<typeof IUD>
// $ExpectType IntersectionE<MemberE<0, CompositionE<PrevE<CompositionE<PrevE<CompositionE<PrevE<UnknownRecordLE> | NextE<UnexpectedKeysE>>> | NextE<MissingKeysE>>> | NextE<StructE<RequiredKeyE<"a", StringLE>>>>> | MemberE<1, CompositionE<PrevE<CompositionE<PrevE<CompositionE<PrevE<UnknownRecordLE> | NextE<UnexpectedKeysE>>> | NextE<MissingKeysE>>> | NextE<StructE<RequiredKeyE<"b", NumberLE | NaNLE>>>>>>
export type IUDE = D.ErrorOf<typeof IUD>
// $ExpectType { a: string; } & { b: number; }
export type IUDA = D.TypeOf<typeof IUD>

// TODO: enable with recent ts versions
// // lazy
// interface Category {
//   id: Int
//   categories: ReadonlyArray<Category>
// }
// // Note: getting the error type is quite difficult.
// // interface ReadonlyArrayCategoryE
// //   extends D.CompositionE<D.PrevE<D.UnknownArrayLE> | D.NextE<D.ArrayE<D.OptionalIndexE<number, CategoryE>>>> {}
// // type CategoryE = D.LazyE<
// //   D.CompositionE<
// //     | D.PrevE<
// //         D.CompositionE<
// //           D.PrevE<D.CompositionE<D.PrevE<D.UnknownRecordLE> | D.NextE<D.UnexpectedKeysE>>> | D.NextE<D.MissingKeysE>
// //         >
// //       >
// //     | D.NextE<
// //         D.StructE<
// //           | D.RequiredKeyE<
// //               'id',
// //               D.CompositionE<
// //                 | D.PrevE<D.NumberLE | D.NaNLE>
// //                 | D.NextE<D.CompositionE<D.PrevE<never> | D.NextE<D.RefinementE<D.LeafE<IntE>>>>>
// //               >
// //             >
// //           | D.RequiredKeyE<'categories', ReadonlyArrayCategoryE>
// //         >
// //       >
// //   >
// // >
// // A possible solution is using DecodeError<E>
// // type CategoryE = D.DecodeError<D.StringE | D.NumberE | D.NaNE | IntE | D.UnknownArrayE | D.UnknownRecordE>
// // or even
// type CategoryE = D.DecodeError<D.BuiltinE | IntE>
// export const LaUD: D.Decoder<unknown, CategoryE, Category> = D.lazy('Category', () =>
//   D.struct({
//     id: ReUD,
//     categories: D.array(LaUD)
//   })
// )
// // $ExpectType unknown
// export type LaUDI = D.InputOf<typeof LaUD>
// // $ExpectType DecodeError<IntE | StringE | NumberE | BooleanE | UnknownRecordE | UnknownArrayE | LiteralE<Literal> | MessageE<unknown> | NaNE>
// export type LaUDE = D.ErrorOf<typeof LaUD>
// // $ExpectType Category
// export type LaUDA = D.TypeOf<typeof LaUD>

// sum
export const SumD = D.fromSum('type')({
  A: D.fromStruct({ type: D.literal('A'), a: D.string }),
  B: D.fromStruct({ type: D.literal('B'), b: D.string })
})
// $ExpectType { type: unknown; a: unknown; } | { type: unknown; b: unknown; }
export type SumDI = D.InputOf<typeof SumD>
// TODO: enable with recent ts versions
// // $ExpectType TagE<"type", LiteralE<"A" | "B">> | SumE<MemberE<"A", StructE<RequiredKeyE<"a", StringLE> | RequiredKeyE<"type", LiteralLE<"A">>>> | MemberE<"B", StructE<RequiredKeyE<"b", StringLE> | RequiredKeyE<"type", LiteralLE<"B">>>>>
// export type SumDE = D.ErrorOf<typeof SumD>
// $ExpectType { type: "A"; a: string; } | { type: "B"; b: string; }
export type SumDA = D.TypeOf<typeof SumD>

export const SumUD = D.sum('type')({
  A: D.struct({ type: D.literal('A'), a: D.string }),
  B: D.struct({ type: D.literal('B'), b: D.string })
})
// $ExpectType unknown
export type SumUDI = D.InputOf<typeof SumUD>
// TODO: enable with recent ts versions
// // $ExpectType UnknownRecordLE | TagE<"type", LiteralE<"A" | "B">> | SumE<MemberE<"A", CompositionE<PrevE<CompositionE<PrevE<CompositionE<PrevE<UnknownRecordLE> | NextE<UnexpectedKeysE>>> | NextE<MissingKeysE>>> | NextE<StructE<RequiredKeyE<"a", StringLE> | RequiredKeyE<"type", LiteralLE<"A">>>>>> | MemberE<"B", CompositionE<PrevE<CompositionE<PrevE<CompositionE<PrevE<UnknownRecordLE> | NextE<UnexpectedKeysE>>> | NextE<MissingKeysE>>> | NextE<StructE<RequiredKeyE<"b", StringLE> | RequiredKeyE<"type", LiteralLE<"B">>>>>>>
// export type SumUDE = D.ErrorOf<typeof SumUD>
// $ExpectType { type: "A"; a: string; } | { type: "B"; b: string; }
export type SumUDA = D.TypeOf<typeof SumUD>

// missingKeys
const MK = D.missingKeys({ a: null, b: null })
// $ExpectType Partial<{ a: unknown; b: unknown; }>
export type MKI = D.InputOf<typeof MK>
// $ExpectType MissingKeysE
export type MKE = D.ErrorOf<typeof MK>
// $ExpectType { a: unknown; b: unknown; }
export type MKA = D.TypeOf<typeof MK>

// unexpectedKeys
const UK = D.unexpectedKeys({ a: null, b: null })
// $ExpectType Record<string | number | symbol, unknown>
export type UKI = D.InputOf<typeof UK>
// $ExpectType UnexpectedKeysE
export type UKE = D.ErrorOf<typeof UK>
// $ExpectType Partial<{ a: unknown; b: unknown; }>
export type UKA = D.TypeOf<typeof UK>

// missingIndexes
const MI = D.missingIndexes(null, null)
// $ExpectType readonly [unknown?, unknown?]
export type MII = D.InputOf<typeof MI>
// $ExpectType MissingIndexesE
export type MIE = D.ErrorOf<typeof MI>
// $ExpectType [unknown, unknown]
export type MIA = D.TypeOf<typeof MI>

// unexpectedIndexes
const UI = D.unexpectedIndexes(null, null)
// $ExpectType unknown[]
export type UII = D.InputOf<typeof UI>
// $ExpectType UnexpectedIndexesE
export type UIE = D.ErrorOf<typeof UI>
// $ExpectType [unknown?, unknown?]
export type UIA = D.TypeOf<typeof UI>
