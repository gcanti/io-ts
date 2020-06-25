import * as _ from '../../src/Kleisli'
import * as E from 'fp-ts/lib/Either'
import { Bifunctor2 } from 'fp-ts/lib/Bifunctor'
import { Alt2C } from 'fp-ts/lib/Alt'
import { MonadThrow2C } from 'fp-ts/lib/MonadThrow'

declare const M: MonadThrow2C<E.URI, string> & Bifunctor2<E.URI> & Alt2C<E.URI, string>
declare const string: _.Kleisli<E.URI, string, string, string>
declare const NumberFromString: _.Kleisli<E.URI, string, string, number>

//
// type
//

const type = _.type(M)((_, e) => e)

// $ExpectType Kleisli<"Either", { a: string; }, string, { a: number; }>
type({
  a: NumberFromString
})

//
// partial
//

// $ExpectType Kleisli<"Either", { a: string; }, string, Partial<{ a: number; }>>
_.partial(M)((_, e) => e)({
  a: NumberFromString
})

//
// tuple
//

// $ExpectType Kleisli<"Either", [string], string, [number]>
_.tuple(M)((_, e) => e)(NumberFromString)

//
// sum
//

declare const literalA: _.Kleisli<E.URI, unknown, string, 'A'>
declare const literalB: _.Kleisli<E.URI, unknown, string, 'B'>

// $ExpectType Kleisli<"Either", { _tag: unknown; a: string; } | { _tag: unknown; b: string; }, string, { _tag: "A"; a: number; } | { _tag: "B"; b: number; }>
_.sum(M)(() => 'error')('_tag')({
  A: type({ _tag: literalA, a: NumberFromString }),
  B: type({ _tag: literalB, b: NumberFromString })
})

//
// union
//

// $ExpectType Kleisli<"Either", string, string, string | number>
_.union(M)((_, e) => e)(NumberFromString, string)
