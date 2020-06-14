import { Schemable, WithUnknownContainers, memoize, WithRefinement, WithUnion } from '../../src/Schemable'
import { HKT } from 'fp-ts/lib/HKT'

interface Schema<A> {
  <S>(S: Schemable<S> & WithUnknownContainers<S> & WithRefinement<S> & WithUnion<S>): HKT<S, A>
}

export type TypeOf<S> = S extends Schema<infer A> ? A : never

function make<A>(f: Schema<A>): Schema<A> {
  return memoize(f)
}

//
// TypeOf
//
export const OfTest = make((S) => S.type({ a: S.string, b: S.type({ c: S.number }) }))
export type OfTest = TypeOf<typeof OfTest> // $ExpectType { a: string; b: { c: number; }; }

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
// nullable
//
make((S) => S.nullable(S.string)) // $ExpectType Schema<string | null>

//
// type
//
make((S) => S.type({ a: S.string, b: S.type({ c: S.number }) })) // $ExpectType Schema<{ a: string; b: { c: number; }; }>

//
// partial
//
make((S) => S.partial({ a: S.string, b: S.partial({ c: S.number }) })) // $ExpectType Schema<Partial<{ a: string; b: Partial<{ c: number; }>; }>>

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
// UnknownArray
//
make((S) => S.UnknownArray) // $ExpectType Schema<unknown[]>

//
// UnknownRecord
//
make((S) => S.UnknownRecord) // $ExpectType Schema<Record<string, unknown>>

//
// refinement
//
interface PositiveBrand {
  readonly Positive: unique symbol
}
type Positive = number & PositiveBrand
make((S) => S.refinement(S.number, (n): n is Positive => n > 0, 'Positive'))

//
// union
//
make((S) => S.union(S.string)) // $ExpectType Schema<string>
make((S) => S.union(S.string, S.number)) // $ExpectType Schema<string | number>
