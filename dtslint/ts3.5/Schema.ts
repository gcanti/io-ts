import { Schemable, WithUnknownContainers, memoize, WithRefine, WithUnion } from '../../src/Schemable'
import { HKT } from 'fp-ts/lib/HKT'
import { pipe } from 'fp-ts/lib/pipeable'

interface Schema<A> {
  <S>(S: Schemable<S> & WithUnknownContainers<S> & WithRefine<S> & WithUnion<S>): HKT<S, A>
}

export type TypeOf<S> = S extends Schema<infer A> ? A : never

function make<A>(f: Schema<A>): Schema<A> {
  return memoize(f)
}

//
// TypeOf
//

export const OfTest = make((S) => S.struct({ a: S.string, b: S.struct({ c: S.number }) }))
export type OfTest = TypeOf<typeof OfTest> // $ExpectType { a: string; b: { c: number; }; }

//
// literal
//

// $ExpectError
make((S) => S.literal())
make((S) => S.literal('a')) // $ExpectType Schema<"a">
make((S) => S.literal('a', 'b', null)) // $ExpectType Schema<"a" | "b" | null>
make((S) => S.literal<['a']>('a')) // $ExpectType Schema<"a">

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
// optional
//

make((S) => S.optional(S.string)) // $ExpectType Schema<string | undefined>

//
// struct
//

make((S) => S.struct({ a: S.string, b: S.struct({ c: S.number }) })) // $ExpectType Schema<{ a: string; b: { c: number; }; }>
make((S) => S.struct({ a: S.literal('a') })) // $ExpectType Schema<{ a: "a"; }>

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

make((S) => pipe(S.struct({ a: S.string }), S.intersect(S.struct({ b: S.number })))) // $ExpectType Schema<{ a: string; } & { b: number; }>

//
// sum
//

const S1 = make((S) => S.struct({ _tag: S.literal('A'), a: S.string }))
const S2 = make((S) => S.struct({ _tag: S.literal('B'), b: S.number }))

// $ExpectType Schema<{ _tag: "A"; a: string; } | { _tag: "B"; b: number; }>
make((S) => S.sum('_tag')({ A: S1(S), B: S2(S) }))
// $ExpectError
make((S) => S.sum('_tag')({ A: S1(S), B: S1(S) }))

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
    S.struct({
      a: S.string,
      bs: S.array(B(S))
    })
  )
)

const B: Schema<B> = make((S) =>
  S.lazy('B', () =>
    S.struct({
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

make((S) =>
  pipe(
    S.number,
    S.refine((n): n is Positive => n > 0, 'Positive')
  )
)

//
// union
//

// $ExpectError
make((S) => S.union())
make((S) => S.union(S.string)) // $ExpectType Schema<string>
make((S) => S.union(S.string, S.number)) // $ExpectType Schema<string | number>

//
// readonly
//

// $ExpectType Schema<Readonly<{ a: string; }>>
make((S) => S.readonly(S.struct({ a: S.string })))
