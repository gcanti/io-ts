import * as _ from '../../src/UnknownTaskDecoder'
import * as DE from '../../src/DecodeError'
import * as FS from '../../src/FreeSemigroup'
import { pipe } from 'fp-ts/lib/pipeable'

// $ExpectType UnknownTaskDecoder<{ a: string; b: { c: number; }; }>
const A = _.type({
  a: _.string,
  b: _.type({
    c: _.number
  })
})

// $ExpectType UnknownTaskDecoder<Partial<{ a: string; b: Partial<{ c: number; }>; }>>
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
// mapLeftWithInput
//

// $ExpectType UnknownTaskDecoder<number>
pipe(
  _.number,
  _.mapLeftWithInput((u) => FS.of(DE.leaf(u, 'not a number')))
)
