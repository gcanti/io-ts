import * as _ from '../../src/TaskDecoder'

declare const string: _.TaskDecoder<string, string>
declare const NumberFromString: _.TaskDecoder<string, number>

//
// type
//

// $ExpectType TaskDecoder<{ a: string; }, { a: number; }>
_.type({
  a: NumberFromString
})

//
// partial
//

// $ExpectType TaskDecoder<{ a: string; }, Partial<{ a: number; }>>
_.partial({
  a: NumberFromString
})

//
// tuple
//

// $ExpectType TaskDecoder<[string], [number]>
_.tuple(NumberFromString)

//
// sum
//

// $ExpectType TaskDecoder<{ _tag: unknown; a: string; } | { _tag: unknown; b: string; }, { _tag: "A"; a: number; } | { _tag: "B"; b: number; }>
_.sum('_tag')({
  A: _.type({ _tag: _.literal('A'), a: NumberFromString }),
  B: _.type({ _tag: _.literal('B'), b: NumberFromString })
})

//
// union
//

// $ExpectType TaskDecoder<string, string | number>
_.union(NumberFromString, string)
