import * as _ from '../../src/Codec'

declare const NumberFromString: _.Codec<string, string, number>

//
// fromStruct
//

// $ExpectType Codec<{ a: unknown; b: { c: string; }; }, { a: string; b: { c: string; }; }, { a: string; b: { c: number; }; }>
_.fromStruct({
  a: _.string,
  b: _.fromStruct({
    c: NumberFromString
  })
})

//
// struct
//

// $ExpectType Codec<unknown, { a: string; b: { c: number; }; }, { a: string; b: { c: number; }; }>
_.struct({
  a: _.string,
  b: _.struct({
    c: _.number
  })
})

//
// fromPartial
//

// $ExpectType Codec<Partial<{ a: unknown; b: Partial<{ c: string; }>; }>, Partial<{ a: string; b: Partial<{ c: string; }>; }>, Partial<{ a: string; b: Partial<{ c: number; }>; }>>
_.fromPartial({
  a: _.string,
  b: _.fromPartial({
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
// fromArray
//

// $ExpectType Codec<string[], string[], number[]>
_.fromArray(NumberFromString)

//
// array
//

// $ExpectType Codec<unknown, string[], string[]>
_.array(_.string)

//
// fromRecord
//

// $ExpectType Codec<Record<string, string>, Record<string, string>, Record<string, number>>
_.fromRecord(NumberFromString)

//
// record
//

// $ExpectType Codec<unknown, Record<string, string>, Record<string, string>>
_.record(_.string)

//
// fromTuple
//

// $ExpectType Codec<[unknown, string, unknown], [string, string, boolean], [string, number, boolean]>
_.fromTuple(_.string, NumberFromString, _.boolean)

//
// tuple
//

// $ExpectType Codec<unknown, [string, number, boolean], [string, number, boolean]>
_.tuple(_.string, _.number, _.boolean)

//
// fromSum
//

// $ExpectType Codec<{ _tag: unknown; a: unknown; } | { _tag: unknown; b: string; }, { _tag: "A"; a: string; } | { _tag: "B"; b: string; }, { _tag: "A"; a: string; } | { _tag: "B"; b: number; }>
_.fromSum('_tag')({
  A: _.fromStruct({ _tag: _.literal('A'), a: _.string }),
  B: _.fromStruct({ _tag: _.literal('B'), b: NumberFromString })
})

//
// sum
//

const S1 = _.struct({ _tag: _.literal('A'), a: _.string })
const S2 = _.struct({ _tag: _.literal('B'), b: _.number })

// $ExpectType Codec<unknown, { _tag: "A"; a: string; } | { _tag: "B"; b: number; }, { _tag: "A"; a: string; } | { _tag: "B"; b: number; }>
_.sum('_tag')({ A: S1, B: S2 })
// // $ExpectError
// _.sum('_tag')({ A: S1, B: S1 })
