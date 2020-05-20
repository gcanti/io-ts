import * as E from '../../src/Encoder'
import { identity } from 'fp-ts/lib/function'

const NumberToString: E.Encoder<string, number> = {
  encode: String
}

const BooleanToNumber: E.Encoder<number, boolean> = {
  encode: (b) => (b ? 1 : 0)
}

export const Person = E.type({ name: E.encoder.id<string>(), age: NumberToString })

//
// TypeOf
//
export type Person = E.TypeOf<typeof Person> // $ExpectType { name: string; age: number; }

//
// OutputOf
//
export type PersonOut = E.OutputOf<typeof Person> // $ExpectType { name: string; age: string; }

//
// nullable
//
E.nullable(NumberToString) // $ExpectType Encoder<string | null, number | null>

//
// type
//
E.type({ a: NumberToString }) // $ExpectType Encoder<{ a: string; }, { a: number; }>

//
// partial
//
E.partial({ a: NumberToString }) // $ExpectType Encoder<Partial<{ a: string; }>, Partial<{ a: number; }>>

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
E.intersection(E.type({ a: NumberToString }), E.type({ b: BooleanToNumber })) // $ExpectType Encoder<{ a: string; } & { b: number; }, { a: number; } & { b: boolean; }>

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
