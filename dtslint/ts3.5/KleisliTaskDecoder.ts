import * as _ from '../../src/KleisliTaskDecoder'

declare const string: _.KleisliTaskDecoder<string, string>
declare const NumberFromString: _.KleisliTaskDecoder<string, number>

//
// type
//

// $ExpectType KleisliTaskDecoder<{ a: string; }, { a: number; }>
_.type({
  a: NumberFromString
})

//
// partial
//

// $ExpectType KleisliTaskDecoder<{ a: string; }, Partial<{ a: number; }>>
_.partial({
  a: NumberFromString
})

//
// tuple
//

// $ExpectType KleisliTaskDecoder<[string], [number]>
_.tuple(NumberFromString)

//
// sum
//

// $ExpectType KleisliTaskDecoder<{ _tag: unknown; a: string; } | { _tag: unknown; b: string; }, { _tag: "A"; a: number; } | { _tag: "B"; b: number; }>
_.sum('_tag')({
  A: _.type({ _tag: _.literal('A'), a: NumberFromString }),
  B: _.type({ _tag: _.literal('B'), b: NumberFromString })
})

//
// union
//

// $ExpectType KleisliTaskDecoder<string, string | number>
_.union(NumberFromString, string)
