import * as _ from '../../src/JsonCodec'

// $ExpectType JsonCodec<{ a: string; b: { c: number; }; }>
_.type({
  a: _.string,
  b: _.type({
    c: _.number
  })
})

// $ExpectType JsonCodec<Partial<{ a: string; b: Partial<{ c: number; }>; }>>
_.partial({
  a: _.string,
  b: _.partial({
    c: _.number
  })
})
