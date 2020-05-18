import * as PE from '../../src/PEncoder'

const NumberToString: PE.PEncoder<string, number> = {
  encode: String
}

const BooleanToNumber: PE.PEncoder<number, boolean> = {
  encode: (b) => (b ? 1 : 0)
}

export const Person = PE.type({ name: PE.id<string>(), age: NumberToString })

//
// TypeOf
//
export type Person = PE.TypeOf<typeof Person> // $ExpectType { name: string; age: number; }

//
// OutputOf
//
export type PersonOut = PE.OutputOf<typeof Person> // $ExpectType { name: string; age: string; }

//
// nullable
//
PE.nullable(NumberToString) // $ExpectType PEncoder<string | null, number | null>

//
// type
//
PE.type({ a: NumberToString }) // $ExpectType PEncoder<{ a: string; }, { a: number; }>

//
// partial
//
PE.partial({ a: NumberToString }) // $ExpectType PEncoder<Partial<{ a: string; }>, Partial<{ a: number; }>>

//
// record
//
PE.record(NumberToString) // $ExpectType PEncoder<Record<string, string>, Record<string, number>>

//
// array
//
PE.array(NumberToString) // $ExpectType PEncoder<string[], number[]>

//
// tuple
//
PE.tuple() // $ExpectType PEncoder<[], []>
PE.tuple(NumberToString) // $ExpectType PEncoder<[string], [number]>
PE.tuple(NumberToString, BooleanToNumber) // $ExpectType PEncoder<[string, number], [number, boolean]>

//
// intersection
//
PE.intersection(PE.type({ a: NumberToString }), PE.type({ b: BooleanToNumber })) // $ExpectType PEncoder<{ a: string; } & { b: number; }, { a: number; } & { b: boolean; }>

//
// sum
//
const S1 = PE.type({ _tag: PE.id<'A'>(), a: NumberToString })
const S2 = PE.type({ _tag: PE.id<'B'>(), b: BooleanToNumber })
const sum = PE.sum('_tag')

// $ExpectType PEncoder<{ _tag: "A"; a: string; } | { _tag: "B"; b: number; }, { _tag: "A"; a: number; } | { _tag: "B"; b: boolean; }>
sum({ A: S1, B: S2 })

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
const A: PE.PEncoder<AOut, A> = PE.lazy(() =>
  PE.type({
    a: NumberToString,
    bs: PE.array(B)
  })
)

const B: PE.PEncoder<BOut, B> = PE.lazy(() =>
  PE.type({
    b: BooleanToNumber,
    as: PE.array(A)
  })
)
