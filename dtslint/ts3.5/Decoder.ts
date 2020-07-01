import { pipe } from 'fp-ts/lib/pipeable'
import * as DE from '../../src/DecodeError'
import * as _ from '../../src/Decoder'
import * as FS from '../../src/FreeSemigroup'

declare const StringFromString: _.Decoder<string, string>
declare const NumberFromString: _.Decoder<string, number>
declare const ArrayFromString: _.Decoder<string, Array<string>>

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
// composeType
//

// $ExpectType Decoder<unknown, { a: string; b: { c: number; }; }>
pipe(
  _.UnknownRecord,
  _.composeType({
    a: _.string,
    b: _.type({
      c: _.number
    })
  })
)

//
// type
//

// $ExpectType Decoder<unknown, { a: string; b: { c: number; }; }>
_.type({
  a: _.string,
  b: _.type({
    c: _.number
  })
})

//
// composePartial
//

// $ExpectType Decoder<unknown, Partial<{ a: string; b: Partial<{ c: number; }>; }>>
pipe(
  _.UnknownRecord,
  _.composePartial({
    a: _.string,
    b: _.partial({
      c: _.number
    })
  })
)

//
// partial
//

// $ExpectType Decoder<unknown, Partial<{ a: string; b: Partial<{ c: number; }>; }>>
_.partial({
  a: _.string,
  b: _.partial({
    c: _.number
  })
})

//
// composeArray
//

// $ExpectType Decoder<unknown, string[]>
pipe(_.UnknownArray, _.composeArray(_.string))

// $ExpectType Decoder<string, number[]>
pipe(ArrayFromString, _.composeArray(NumberFromString))

//
// array
//

// $ExpectType Decoder<unknown, string[]>
_.array(_.string)

//
// composeSum
//

// $ExpectType Decoder<unknown, { _tag: "A"; a: string; } | { _tag: "B"; b: number; }>
pipe(
  _.UnknownRecord,
  _.composeSum('_tag')({
    A: _.type({ _tag: _.literal('A'), a: _.string }),
    B: _.type({ _tag: _.literal('B'), b: _.number })
  })
)

//
// sum
//

// $ExpectType Decoder<unknown, { _tag: "A"; a: string; } | { _tag: "B"; b: number; }>
_.sum('_tag')({
  A: _.type({ _tag: _.literal('A'), a: _.string }),
  B: _.type({ _tag: _.literal('B'), b: _.number })
})

//
// composeUnion
//

// $ExpectType Decoder<unknown, string | number>
pipe(_.string, _.composeUnion(NumberFromString, StringFromString))

//
// union
//

// $ExpectType Decoder<unknown, string | number>
_.union(_.number, _.string)

//
// mapLeftWithInput
//

// $ExpectType Decoder<unknown, number>
pipe(
  _.number,
  _.mapLeftWithInput((u) => FS.of(DE.leaf(u, 'not a number')))
)
