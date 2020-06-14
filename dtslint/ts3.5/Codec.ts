import * as _ from '../../src/Codec'

// $ExpectType Codec<{ a: string; b: { c: number; }; }, { a: string; b: { c: number; }; }>
_.type({
  a: _.string,
  b: _.type({
    c: _.number
  })
})

// $ExpectType Codec<Partial<{ a: string; b: Partial<{ c: number; }>; }>, Partial<{ a: string; b: Partial<{ c: number; }>; }>>
_.partial({
  a: _.string,
  b: _.partial({
    c: _.number
  })
})
