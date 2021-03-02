import * as _ from '../../src/Guard'

//
// struct
//

// $ExpectType Guard<unknown, { a: string; b: { c: number; }; }>
const A = _.struct({
  a: _.string,
  b: _.struct({
    c: _.number
  })
})

//
// partial
//

// $ExpectType Guard<unknown, Partial<{ a: string; b: Partial<{ c: number; }>; }>>
_.partial({
  a: _.string,
  b: _.partial({
    c: _.number
  })
})

//
// TypeOf
//

// $ExpectType { a: string; b: { c: number; }; }
export type A = _.TypeOf<typeof A>

//
// sum
//

const S1 = _.struct({ _tag: _.literal('A'), a: _.string })
const S2 = _.struct({ _tag: _.literal('B'), b: _.number })

// $ExpectType Guard<unknown, { _tag: "A"; a: string; } | { _tag: "B"; b: number; }>
_.sum('_tag')({ A: S1, B: S2 })
// $ExpectError
_.sum('_tag')({ A: S1, B: S1 })

//
// readonly
//

// $ExpectType Guard<unknown, Readonly<{ a: string; }>>
_.readonly(
  _.struct({
    a: _.string
  })
)
