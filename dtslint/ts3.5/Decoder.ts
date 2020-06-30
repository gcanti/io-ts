import * as _ from '../../src/Decoder'

declare const string: _.Decoder<string, string>
declare const NumberFromString: _.Decoder<string, number>

//
// type
//

// $ExpectType Decoder<{ a: string; }, { a: number; }>
_.type({
  a: NumberFromString
})

//
// partial
//

// $ExpectType Decoder<{ a: string; }, Partial<{ a: number; }>>
_.partial({
  a: NumberFromString
})

//
// tuple
//

// $ExpectType Decoder<[string], [number]>
_.tuple(NumberFromString)

//
// sum
//

// $ExpectType Decoder<{ _tag: unknown; a: string; } | { _tag: unknown; b: string; }, { _tag: "A"; a: number; } | { _tag: "B"; b: number; }>
_.sum('_tag')({
  A: _.type({ _tag: _.literal('A'), a: NumberFromString }),
  B: _.type({ _tag: _.literal('B'), b: NumberFromString })
})

//
// union
//

// $ExpectType Decoder<string, string | number>
_.union(NumberFromString, string)
