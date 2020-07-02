import * as _ from '../../src/Guard'

//
// type
//

// $ExpectType Guard<unknown, { a: string; b: { c: number; }; }>
const A = _.type({
  a: _.string,
  b: _.type({
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
