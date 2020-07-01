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
// ktype
//

// $ExpectType TaskDecoder<{ a: string; }, { a: number; }>
_.ktype({
  a: NumberFromString
})

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
// ksum
//

// $ExpectType TaskDecoder<{ _tag: unknown; a: string; } | { _tag: unknown; b: string; }, { _tag: "A"; a: number; } | { _tag: "B"; b: number; }>
_.ksum('_tag')({
  A: _.ktype({ _tag: _.literal('A'), a: NumberFromString }),
  B: _.ktype({ _tag: _.literal('B'), b: NumberFromString })
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
