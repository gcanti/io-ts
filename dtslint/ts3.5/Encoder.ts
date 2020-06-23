import * as E from '../../src/Encoder'
import { pipe } from 'fp-ts/lib/pipeable'

const NumberToString: E.Encoder<string, number> = {
  encode: String
}

const BooleanToNumber: E.Encoder<number, boolean> = {
  encode: (b) => (b ? 1 : 0)
}

export const OfTest = E.type({ a: E.id<string>(), b: E.type({ c: NumberToString }) })

//
// TypeOf
//
export type OfTest = E.TypeOf<typeof OfTest> // $ExpectType { a: string; b: { c: number; }; }

//
// OutputOf
//
export type OfTestOutput = E.OutputOf<typeof OfTest> // $ExpectType { a: string; b: { c: string; }; }

//
// nullable
//
E.nullable(NumberToString) // $ExpectType Encoder<string | null, number | null>

//
// type
//
E.type({ a: E.type({ b: NumberToString }) }) // $ExpectType Encoder<{ a: { b: string; }; }, { a: { b: number; }; }>

//
// partial
//
E.partial({ a: E.partial({ b: NumberToString }) }) // $ExpectType Encoder<Partial<{ a: Partial<{ b: string; }>; }>, Partial<{ a: Partial<{ b: number; }>; }>>

//
// record
//
E.record(NumberToString) // $ExpectType Encoder<Record<string, string>, Record<string, number>>

//
// array
//
E.array(NumberToString) // $ExpectType Encoder<string[], number[]>

//
// tuple
//
E.tuple() // $ExpectType Encoder<[], []>
E.tuple(NumberToString) // $ExpectType Encoder<[string], [number]>
E.tuple(NumberToString, BooleanToNumber) // $ExpectType Encoder<[string, number], [number, boolean]>

//
// intersection
//
pipe(E.type({ a: NumberToString }), E.intersect(E.type({ b: BooleanToNumber }))) // $ExpectType Encoder<{ a: string; } & { b: number; }, { a: number; } & { b: boolean; }>

//
// sum
//
const S1 = E.type({ _tag: E.id<'A'>(), a: NumberToString })
const S2 = E.type({ _tag: E.id<'B'>(), b: BooleanToNumber })
const sum = E.sum('_tag')

// $ExpectType Encoder<{ _tag: "A"; a: string; } | { _tag: "B"; b: number; }, { _tag: "A"; a: number; } | { _tag: "B"; b: boolean; }>
sum({ A: S1, B: S2 })

const S3 = E.type({ _tag: E.id<'C'>(), c: E.id<string>() })

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
const A: E.Encoder<AOut, A> = E.lazy(() =>
  E.type({
    a: NumberToString,
    bs: E.array(B)
  })
)

const B: E.Encoder<BOut, B> = E.lazy(() =>
  E.type({
    b: BooleanToNumber,
    as: E.array(A)
  })
)
