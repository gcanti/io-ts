import * as _ from '../../src/TaskDecoder'

//
// sum
//

const S1 = _.type({ _tag: _.literal('A'), a: _.string })
const S2 = _.type({ _tag: _.literal('B'), b: _.number })

// $ExpectType TaskDecoder<unknown, { _tag: "A"; a: string; } | { _tag: "B"; b: number; }>
_.sum('_tag')({ A: S1, B: S2 })
// $ExpectError
_.sum('_tag')({ A: S1, B: S1 })
