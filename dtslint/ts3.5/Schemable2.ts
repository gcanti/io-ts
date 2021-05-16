import * as _ from '../../src/Schemable2'

const schema = _.make((S) => S.tuple(S.nullable(S.string)))

// $ExpectType TupleD<[NullableD<stringUD>]>
export const decoder = _.compile(_.toDecoder)(schema)

// $ExpectType Guard<unknown, [string | null]>
export const guard = _.compile(_.toGuard)(schema)

// $ExpectType Eq<[string | null]>
export const eq = _.compile(_.toEq)(schema)
