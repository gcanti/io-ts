import * as _ from '../../src/Encoder'
import { pipe } from 'fp-ts/function'

const NumberToString: _.Encoder<string, number> = {
  encode: String
}

const BooleanToNumber: _.Encoder<number, boolean> = {
  encode: (b) => (b ? 1 : 0)
}

export const OfTest = _.struct({ a: _.id<string>(), b: _.struct({ c: NumberToString }) })

//
// TypeOf
//
export type OfTest = _.TypeOf<typeof OfTest> // $ExpectType { a: string; b: { c: number; }; }

//
// OutputOf
//
export type OfTestOutput = _.OutputOf<typeof OfTest> // $ExpectType { a: string; b: { c: string; }; }

//
// nullable
//
_.nullable(NumberToString) // $ExpectType Encoder<string | null, number | null>

//
// struct
//
_.struct({ a: _.struct({ b: NumberToString }) }) // $ExpectType Encoder<{ a: { b: string; }; }, { a: { b: number; }; }>

//
// partial
//
_.partial({ a: _.partial({ b: NumberToString }) }) // $ExpectType Encoder<Partial<{ a: Partial<{ b: string; }>; }>, Partial<{ a: Partial<{ b: number; }>; }>>

//
// record
//
_.record(NumberToString) // $ExpectType Encoder<Record<string, string>, Record<string, number>>

//
// array
//
_.array(NumberToString) // $ExpectType Encoder<string[], number[]>

//
// tuple
//
_.tuple() // $ExpectType Encoder<[], []>
_.tuple(NumberToString) // $ExpectType Encoder<[string], [number]>
_.tuple(NumberToString, BooleanToNumber) // $ExpectType Encoder<[string, number], [number, boolean]>

//
// intersection
//
pipe(_.struct({ a: NumberToString }), _.intersect(_.struct({ b: BooleanToNumber }))) // $ExpectType Encoder<{ a: string; } & { b: number; }, { a: number; } & { b: boolean; }>

//
// sum
//
const S1 = _.struct({ _tag: _.id<'A'>(), a: NumberToString })
const S2 = _.struct({ _tag: _.id<'B'>(), b: BooleanToNumber })
const sum = _.sum('_tag')

// $ExpectType Encoder<{ _tag: "A"; a: string; } | { _tag: "B"; b: number; }, { _tag: "A"; a: number; } | { _tag: "B"; b: boolean; }>
sum({ A: S1, B: S2 })

const S3 = _.struct({ _tag: _.id<'C'>(), c: _.id<string>() })

//
// lazy
//
interface A {
  a: number
  bs: Array<B>
}
interface AOut {
  a: string
  bs: Array<BOut>
}
interface B {
  b: boolean
  as: Array<A>
}
interface BOut {
  b: number
  as: Array<AOut>
}
const A: _.Encoder<AOut, A> = _.lazy(() =>
  _.struct({
    a: NumberToString,
    bs: _.array(B)
  })
)

const B: _.Encoder<BOut, B> = _.lazy(() =>
  _.struct({
    b: BooleanToNumber,
    as: _.array(A)
  })
)

//
// compose
//

declare const ab: _.Encoder<number, string>
declare const bc: _.Encoder<boolean, number>

// $ExpectType Encoder<boolean, string>
pipe(ab, _.compose(bc))
