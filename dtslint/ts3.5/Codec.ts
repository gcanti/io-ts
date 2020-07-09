import * as _ from '../../src/Codec'

// $ExpectType Codec<unknown, { a: string; b: { c: number; }; }, { a: string; b: { c: number; }; }>
_.type({
  a: _.string,
  b: _.type({
    c: _.number
  })
})

// $ExpectType Codec<unknown, Partial<{ a: string; b: Partial<{ c: number; }>; }>, Partial<{ a: string; b: Partial<{ c: number; }>; }>>
_.partial({
  a: _.string,
  b: _.partial({
    c: _.number
  })
})
