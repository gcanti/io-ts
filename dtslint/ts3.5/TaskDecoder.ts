import { pipe } from 'fp-ts/lib/pipeable'
import * as DE from '../../src/DecodeError'
import * as _ from '../../src/TaskDecoder'
import * as FS from '../../src/FreeSemigroup'

declare const StringFromString: _.TaskDecoder<string, string>
declare const NumberFromString: _.TaskDecoder<string, number>

//
// TypeOf
//

// $ExpectType number
export type TypeOfNumberFromString = _.TypeOf<typeof NumberFromString>

//
// InputOf
//

// $ExpectType string
export type InputOfNumberFromString = _.InputOf<typeof NumberFromString>

//
// kpartial
//

// $ExpectType TaskDecoder<{ a: string; }, Partial<{ a: number; }>>
_.kpartial({
  a: NumberFromString
})

//
// ktuple
//

// $ExpectType TaskDecoder<[string], [number]>
_.ktuple(NumberFromString)

//
// sum
//

// $ExpectType TaskDecoder<unknown, { _tag: "A"; a: string; } | { _tag: "B"; b: number; }>
_.sum('_tag')({
  A: _.type({ _tag: _.literal('A'), a: _.string }),
  B: _.type({ _tag: _.literal('B'), b: _.number })
})

//
// union
//

// $ExpectType TaskDecoder<unknown, string | number>
_.union(_.number, _.string)

// $ExpectType TaskDecoder<string, string | number>
_.union(NumberFromString, StringFromString)

// -------------------------------------------------------------------------------------
// unknown input
// -------------------------------------------------------------------------------------

// $ExpectType TaskDecoder<unknown, { a: string; b: { c: number; }; }>
const A = _.type({
  a: _.string,
  b: _.type({
    c: _.number
  })
})

// $ExpectType TaskDecoder<unknown, Partial<{ a: string; b: Partial<{ c: number; }>; }>>
_.partial({
  a: _.string,
  b: _.partial({
    c: _.number
  })
})

//
// mapLeftWithInput
//

// $ExpectType TaskDecoder<unknown, number>
pipe(
  _.number,
  _.mapLeftWithInput((u) => FS.of(DE.leaf(u, 'not a number')))
)
