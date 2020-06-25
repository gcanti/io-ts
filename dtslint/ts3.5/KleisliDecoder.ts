import * as _ from '../../src/KleisliDecoder'

declare const string: _.KleisliDecoder<string, string>
declare const NumberFromString: _.KleisliDecoder<string, number>

//
// type
//

// $ExpectType KleisliDecoder<{ a: string; }, { a: number; }>
_.type({
  a: NumberFromString
})

//
// partial
//

// $ExpectType KleisliDecoder<{ a: string; }, Partial<{ a: number; }>>
_.partial({
  a: NumberFromString
})

//
// tuple
//

// $ExpectType KleisliDecoder<[string], [number]>
_.tuple(NumberFromString)

//
// sum
//

// $ExpectType KleisliDecoder<{ _tag: unknown; a: string; } | { _tag: unknown; b: string; }, { _tag: "A"; a: number; } | { _tag: "B"; b: number; }>
_.sum('_tag')({
  A: _.type({ _tag: _.literal('A'), a: NumberFromString }),
  B: _.type({ _tag: _.literal('B'), b: NumberFromString })
})

//
// union
//

// $ExpectType KleisliDecoder<string, string | number>
_.union(NumberFromString, string)
