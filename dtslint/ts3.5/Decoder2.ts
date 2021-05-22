import { pipe } from 'fp-ts/lib/pipeable'
import * as D from '../../src/Decoder2'

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
// $ExpectType FromStructE<{ a: stringUD; b: numberUD; }>
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
// $ExpectType CompositionE<CompositionD<CompositionD<UnknownRecordUD, UnexpectedKeysD<{ a: stringUD; b: numberUD; }>>, MissingKeysD<{ a: stringUD; b: numberUD; }>>, FromStructD<{ a: stringUD; b: numberUD; }>>
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
// $ExpectType FromPartialE<{ a: stringUD; b: numberUD; }>
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
// $ExpectType CompositionE<CompositionD<UnknownRecordUD, UnexpectedKeysD<{ a: stringUD; b: numberUD; }>>, FromPartialD<{ a: stringUD; b: numberUD; }>>
export type PSUDE = D.ErrorOf<typeof PSUD>
// $ExpectType Partial<{ a: string; b: number; }>
export type PSUDA = D.TypeOf<typeof PSUD>

// fromTuple
export const TD = D.fromTuple(D.string, D.number)
// $ExpectType readonly [unknown, unknown]
export type TDI = D.InputOf<typeof TD>
// $ExpectType FromTupleE<[stringUD, numberUD]>
export type TDE = D.ErrorOf<typeof TD>
// $ExpectType [string, number]
export type TDA = D.TypeOf<typeof TD>

// tuple
export const TUD = D.tuple(D.string, D.number)
// $ExpectType unknown
export type TUDI = D.InputOf<typeof TUD>
// $ExpectType CompositionE<CompositionD<CompositionD<UnknownArrayUD, UnexpectedIndexesD<[stringUD, numberUD]>>, MissingIndexesD<[stringUD, numberUD]>>, FromTupleD<[stringUD, numberUD]>>
export type TUDE = D.ErrorOf<typeof TUD>
// $ExpectType [string, number]
export type TUDA = D.TypeOf<typeof TUD>

// fromArray
export const AD = D.fromArray(D.string)
// $ExpectType unknown[]
export type ADI = D.InputOf<typeof AD>
// $ExpectType FromArrayE<stringUD>
export type ADE = D.ErrorOf<typeof AD>
// $ExpectType string[]
export type ADA = D.TypeOf<typeof AD>

// array
export const AUD = D.array(D.string)
// $ExpectType unknown
export type AUDI = D.InputOf<typeof AUD>
// $ExpectType CompositionE<UnknownArrayUD, FromArrayD<stringUD>>
export type AUDE = D.ErrorOf<typeof AUD>
// $ExpectType string[]
export type AUDA = D.TypeOf<typeof AUD>

// fromRecord
export const RD = D.fromRecord(D.number)
// $ExpectType Record<string | number | symbol, unknown>
export type RDI = D.InputOf<typeof RD>
// $ExpectType FromRecordE<numberUD>
export type RDE = D.ErrorOf<typeof RD>
// $ExpectType Record<string | number | symbol, number>
export type RDA = D.TypeOf<typeof RD>

// record
export const RUD = D.record(D.number)
// $ExpectType unknown
export type RUDI = D.InputOf<typeof RUD>
// $ExpectType CompositionE<UnknownRecordUD, FromRecordD<numberUD>>
export type RUDE = D.ErrorOf<typeof RUD>
// $ExpectType Record<string | number | symbol, number>
export type RUDA = D.TypeOf<typeof RUD>

// union
export const UD = D.union(D.string, D.number)
// $ExpectType unknown
export type UDI = D.InputOf<typeof UD>
// $ExpectType NoMembersLE | UnionE<[stringUD, numberUD]>
export type UDE = D.ErrorOf<typeof UD>
// $ExpectType string | number
export type UDA = D.TypeOf<typeof UD>

// nullable
export const NUD = D.nullable(D.number)
// $ExpectType unknown
export type NUDI = D.InputOf<typeof NUD>
// $ExpectType NullableE<NumberLE | NaNLE | InfinityLE>
export type NUDE = D.ErrorOf<typeof NUD>
// $ExpectType number | null
export type NUDA = D.TypeOf<typeof NUD>

// intersect
export const ID = pipe(D.fromStruct({ a: D.string }), D.intersect(D.fromStruct({ b: D.number })))
// $ExpectType { a: unknown; } & { b: unknown; }
export type IDI = D.InputOf<typeof ID>
// $ExpectType IntersectE<FromStructD<{ a: stringUD; }>, FromStructD<{ b: numberUD; }>>
export type IDE = D.ErrorOf<typeof ID>
// $ExpectType { a: string; } & { b: number; }
export type IDA = D.TypeOf<typeof ID>

export const IUD = pipe(D.struct({ a: D.string }), D.intersect(D.struct({ b: D.number })))
// $ExpectType unknown
export type IUDI = D.InputOf<typeof IUD>
// $ExpectType IntersectE<StructD<{ a: stringUD; }>, StructD<{ b: numberUD; }>>
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
// $ExpectType TagLE | FromSumE<{ A: FromStructD<{ type: LiteralD<["A"]>; a: stringUD; }>; B: FromStructD<{ type: LiteralD<["B"]>; b: stringUD; }>; }>
export type SumDE = D.ErrorOf<typeof SumD>
// $ExpectType { type: "A"; a: string; } | { type: "B"; b: string; }
export type SumDA = D.TypeOf<typeof SumD>

export const SumD2 = D.fromSum('type')({
  1: D.fromStruct({ type: D.literal(1), a: D.string }),
  2: D.fromStruct({ type: D.literal(2), b: D.string })
})
export type SumD2I = D.InputOf<typeof SumD2>
export type SumD2A = D.TypeOf<typeof SumD2>

export const SumUD = D.sum('type')({
  A: D.struct({ type: D.literal('A'), a: D.string }),
  B: D.struct({ type: D.literal('B'), b: D.string })
})
// $ExpectType unknown
export type SumUDI = D.InputOf<typeof SumUD>
// TODO: enable with recent ts versions
// $ExpectType CompositionE<UnionD<[UnknownRecordUD, UnknownArrayUD]>, FromSumD<"type", { A: StructD<{ type: LiteralD<["A"]>; a: stringUD; }>; B: StructD<{ type: LiteralD<["B"]>; b: stringUD; }>; }>>
export type SumUDE = D.ErrorOf<typeof SumUD>
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
