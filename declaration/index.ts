import * as t from '../src'

//
// interface
//

const T1 = t.type({
  a: t.string
})

const T2 = t.type({
  b: T1
})

const T3 = t.type({
  c: T2
})

const T4 = t.type({
  d: T3
})

export const T5 = t.type({
  e: T4
})

//
// refinement
//

export const R1 = t.refinement(T5, () => true)

//
// recursion
//

type R = {
  a: number
  b: R | undefined | null
}

export const Rec1: t.Type<R> = t.recursion('R1', self =>
  t.interface({
    a: t.number,
    b: t.union([self, t.undefined, t.null])
  })
)

//
// array
//

export const A1 = t.array(T5)

//
// partial
//

const P1 = t.partial({
  a: t.string
})

const P2 = t.partial({
  b: P1
})

const P3 = t.partial({
  c: P2
})

const P4 = t.partial({
  d: P3
})

export const P5 = t.partial({
  e: P4
})

//
// record
//

const D1 = t.record(t.string, t.number)

const D2 = t.record(t.string, D1)

const D3 = t.record(t.string, D2)

const D4 = t.record(t.string, D3)

export const D5 = t.record(t.string, D4)

//
// union
//

export const U1 = t.union([T5, D5])

//
// intersection
//

export const I1 = t.intersection([T5, D5])

//
// tuple
//

export const Tu1 = t.tuple([T5, D5])

//
// readonly type
//

export const RO1 = t.readonly(T5)

//
// readonly array
//

export const RA1 = t.readonlyArray(T5)

//
// strict
//

const S1 = t.strict({
  a: t.string
})

const S2 = t.strict({
  b: S1
})

const S3 = t.strict({
  c: S2
})

const S4 = t.strict({
  d: S3
})

export const S5 = t.strict({
  e: S4
})

//
// tagged union
//

const TUMA = t.type({
  type: t.literal(true),
  foo: t.string
})

const TUMB = t.type(
  {
    type: t.literal(false),
    bar: t.number
  },
  'B'
)

export const TU1 = t.taggedUnion('type', [TUMA, TUMB])

//
// exact
//

export const E1 = t.exact(T5)

//
// brand
//

export const B1 = t.type({
  name: t.string,
  age: t.Int
})
