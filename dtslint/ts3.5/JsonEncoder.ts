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

//
// Json type
//

const number: _.Json = 1
const string: _.Json = 'a'
const boolean: _.Json = true
const nully: _.Json = null
const array: _.Json = [1, 'a', true, null]
const record: _.Json = { a: 1, b: 'b', c: true, d: null }
