import * as _ from '../../src/Type'

// $ExpectType Type<{ a: string; b: { c: number; }; }>
_.type({
  a: _.string,
  b: _.type({
    c: _.number
  })
})

// $ExpectType Type<Partial<{ a: string; b: Partial<{ c: number; }>; }>>
_.partial({
  a: _.string,
  b: _.partial({
    c: _.number
  })
})

//
// readonly
//

// $ExpectType Type<Readonly<{ a: string; }>>
_.readonly(
  _.type({
    a: _.string
  })
)
