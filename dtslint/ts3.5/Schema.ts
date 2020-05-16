import * as D from '../../src/Decoder'
import { make, Schema, TypeOf } from '../../src/Schema'

//
// TypeOf
//
export const Person = make((S) => S.type({ name: S.string, age: S.number }))
export type Person = TypeOf<typeof Person> // $ExpectType { name: string; age: number; }

//
// literal
//
make((S) => S.literal('a')) // $ExpectType Schema<"a">

//
// string
//
make((S) => S.string) // $ExpectType Schema<string>

//
// number
//
make((S) => S.number) // $ExpectType Schema<number>

//
// boolean
//
make((S) => S.boolean) // $ExpectType Schema<boolean>

//
// UnknownArray
//
make((S) => S.UnknownArray) // $ExpectType Schema<unknown[]>

//
// UnknownRecord
//
make((S) => S.UnknownRecord) // $ExpectType Schema<Record<string, unknown>>

//
// nullable
//
make((S) => S.nullable(S.string)) // $ExpectType Schema<string | null>

//
// type
//
make((S) => S.type({ a: S.string })) // $ExpectType Schema<{ a: string; }>

//
// partial
//
make((S) => S.partial({ a: S.string })) // $ExpectType Schema<Partial<{ a: string; }>>

//
// record
//
make((S) => S.record(S.number)) // $ExpectType Schema<Record<string, number>>

//
// array
//
make((S) => S.array(S.number)) // $ExpectType Schema<number[]>

//
// tuple
//
make((S) => S.tuple()) // $ExpectType Schema<[]>
make((S) => S.tuple(S.string)) // $ExpectType Schema<[string]>
make((S) => S.tuple(S.string, S.number)) // $ExpectType Schema<[string, number]>
make((S) => S.tuple(S.string, S.number, S.boolean)) // $ExpectType Schema<[string, number, boolean]>

//
// intersection
//
make((S) => S.intersection(S.type({ a: S.string }), S.type({ b: S.number }))) // $ExpectType Schema<{ a: string; } & { b: number; }>

//
// sum
//
const S1 = make((S) => S.type({ _tag: S.literal('A'), a: S.string }))
const S2 = make((S) => S.type({ _tag: S.literal('B'), b: S.number }))

// $ExpectType Schema<{ _tag: "A"; a: string; } | { _tag: "B"; b: number; }>
make((S) => S.sum('_tag')({ A: S1(S), B: S2(S) }))

//
// lazy
//
interface A {
  a: string
  bs: Array<B>
}
interface B {
  b: number
  as: Array<A>
}
const A: Schema<A> = make((S) =>
  S.lazy('A', () =>
    S.type({
      a: S.string,
      bs: S.array(B(S))
    })
  )
)
const B: Schema<B> = make((S) =>
  S.lazy('B', () =>
    S.type({
      b: S.number,
      as: S.array(A(S))
    })
  )
)

//
// union
//
D.union(D.string) // $ExpectType Decoder<string>
D.union(D.string, D.number) // $ExpectType Decoder<string | number>
