import * as _ from '../../src/JsonEncoder'

// $ExpectType JsonEncoder<{ a: string; b: { c: number; }; }>
_.type({
  a: _.id<string>(),
  b: _.type({
    c: _.id<number>()
  })
})

// $ExpectType JsonEncoder<Partial<{ a: string; b: Partial<{ c: number; }>; }>>
_.partial({
  a: _.id<string>(),
  b: _.partial({
    c: _.id<number>()
  })
})
