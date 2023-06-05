import * as _ from '../src/Eq'

// $ExpectType Eq<{ a: string; b: { c: number; }; }>
_.struct({
  a: _.string,
  b: _.struct({
    c: _.number
  })
})

// $ExpectType Eq<Partial<{ a: string; b: Partial<{ c: number; }>; }>>
_.partial({
  a: _.string,
  b: _.partial({
    c: _.number
  })
})

//
// sum
//

const S1 = _.struct({ _tag: _.Schemable.literal('A'), a: _.string })
const S2 = _.struct({ _tag: _.Schemable.literal('B'), b: _.number })

// $ExpectType Eq<{ _tag: "A"; a: string; } | { _tag: "B"; b: number; }>
_.sum('_tag')({ A: S1, B: S2 })
// // @ts-expect-error
// _.sum('_tag')({ A: S1, B: S1 })

//
// readonly
//

// $ExpectType Eq<Readonly<{ a: string; }>>
_.readonly(
  _.struct({
    a: _.string
  })
)
