import { pipe } from 'fp-ts/lib/pipeable'
import * as DE from '../../src/DecodeError'
import * as _ from '../../src/Decoder'
import * as FS from '../../src/FreeSemigroup'

declare const StringFromString: _.Decoder<string, string>
declare const NumberFromString: _.Decoder<string, number>

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

// $ExpectType Decoder<{ a: string; }, Partial<{ a: number; }>>
_.kpartial({
  a: NumberFromString
})

//
// ktuple
//

// $ExpectType Decoder<[string], [number]>
_.ktuple(NumberFromString)

//
// sum
//

// $ExpectType Decoder<unknown, { _tag: "A"; a: string; } | { _tag: "B"; b: number; }>
_.sum('_tag')({
  A: _.type({ _tag: _.literal('A'), a: _.string }),
  B: _.type({ _tag: _.literal('B'), b: _.number })
})

//
// union
//

// $ExpectType Decoder<unknown, string | number>
_.union(_.number, _.string)

// $ExpectType Decoder<string, string | number>
_.union(NumberFromString, StringFromString)

// -------------------------------------------------------------------------------------
// unknown input
// -------------------------------------------------------------------------------------

// $ExpectType Decoder<unknown, { a: string; b: { c: number; }; }>
const A = _.type({
  a: _.string,
  b: _.type({
    c: _.number
  })
})

// $ExpectType Decoder<unknown, Partial<{ a: string; b: Partial<{ c: number; }>; }>>
_.partial({
  a: _.string,
  b: _.partial({
    c: _.number
  })
})

//
// mapLeftWithInput
//

// $ExpectType Decoder<unknown, number>
pipe(
  _.number,
  _.mapLeftWithInput((u) => FS.of(DE.leaf(u, 'not a number')))
)
