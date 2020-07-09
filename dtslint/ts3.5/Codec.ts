import * as _ from '../../src/Codec'

declare const NumberFromString: _.Codec<string, string, number>

//
// ktype
//

// $ExpectType Codec<{ a: unknown; b: { c: string; }; }, { a: string; b: { c: string; }; }, { a: string; b: { c: number; }; }>
_.ktype({
  a: _.string,
  b: _.ktype({
    c: NumberFromString
  })
})

//
// type
//

// $ExpectType Codec<unknown, { a: string; b: { c: number; }; }, { a: string; b: { c: number; }; }>
_.type({
  a: _.string,
  b: _.type({
    c: _.number
  })
})

//
// kpartial
//

// $ExpectType Codec<Partial<{ a: unknown; b: Partial<{ c: string; }>; }>, Partial<{ a: string; b: Partial<{ c: string; }>; }>, Partial<{ a: string; b: Partial<{ c: number; }>; }>>
_.kpartial({
  a: _.string,
  b: _.kpartial({
    c: NumberFromString
  })
})

//
// partial
//

// $ExpectType Codec<unknown, Partial<{ a: string; b: Partial<{ c: number; }>; }>, Partial<{ a: string; b: Partial<{ c: number; }>; }>>
_.partial({
  a: _.string,
  b: _.partial({
    c: _.number
  })
})

//
// karray
//

// $ExpectType Codec<string[], string[], number[]>
_.karray(NumberFromString)

//
// array
//

// $ExpectType Codec<unknown, string[], string[]>
_.array(_.string)

//
// krecord
//

// $ExpectType Codec<Record<string, string>, Record<string, string>, Record<string, number>>
_.krecord(NumberFromString)

//
// record
//

// $ExpectType Codec<unknown, Record<string, string>, Record<string, string>>
_.record(_.string)

//
// ktuple
//

// $ExpectType Codec<[unknown, string, unknown], [string, string, boolean], [string, number, boolean]>
_.ktuple(_.string, NumberFromString, _.boolean)

//
// tuple
//

// $ExpectType Codec<unknown, [string, number, boolean], [string, number, boolean]>
_.tuple(_.string, _.number, _.boolean)

const f: (s: string) => void = (s) => s.length

//
// ksum
//

// $ExpectType Codec<{ _tag: unknown; a: unknown; } | { _tag: unknown; b: string; }, { _tag: "A"; a: string; } | { _tag: "B"; b: string; }, { _tag: "A"; a: string; } | { _tag: "B"; b: number; }>
_.ksum('_tag')({
  A: _.ktype({ _tag: _.literal('A'), a: _.string }),
  B: _.ktype({ _tag: _.literal('B'), b: NumberFromString })
})

//
// sum
//

// $ExpectType Codec<unknown, { _tag: "A"; a: string; } | { _tag: "B"; b: number; }, { _tag: "A"; a: string; } | { _tag: "B"; b: number; }>
_.sum('_tag')({
  A: _.type({ _tag: _.literal('A'), a: _.string }),
  B: _.type({ _tag: _.literal('B'), b: _.number })
})
