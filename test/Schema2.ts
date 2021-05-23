import * as fc from 'fast-check'
import { isLeft } from 'fp-ts/lib/These'
import { pipe } from 'fp-ts/lib/pipeable'
import * as D from '../src/Decoder2'
import * as Eq from '../src/Eq2'
import * as G from '../src/Guard2'
import { interpreter, make, Schema, toDecoder } from '../src/Schemable2'
import * as A from './Arbitrary2'
import * as DE from '../src/DecodeError2'

function check<A extends D.AnyD>(schema: Schema<A>): void {
  const arb = interpreter(A.toArbitrary)(schema)
  const decoder = interpreter(toDecoder)(schema)
  const guard = interpreter(G.toGuard)(schema)
  const eq = interpreter(Eq.toEq)(schema)
  // decoders, guards and eqs should be aligned
  fc.assert(
    fc.property(arb, (a) => {
      const th = decoder.decode(a)
      return !isLeft(th) && guard.is(a) && !(typeof a === 'number' && isNaN(a)) === eq.equals(a, a)
    })
  )
}
describe('Schema', () => {
  it('string', () => {
    check(make((S) => S.string))
  })

  it('number', () => {
    check(make((S) => S.number))
  })

  it('boolean', () => {
    check(make((S) => S.boolean))
  })

  it('literal', () => {
    check(make((S) => S.literal('a')))
    check(make((S) => S.literal('a', 1)))
    check(make((S) => S.literal('a', null)))
  })

  it('nullable', () => {
    check(make((S) => S.nullable(S.string)))
  })

  it('struct', () => {
    check(
      make((S) =>
        S.struct({
          name: S.string,
          age: S.number
        })
      )
    )
  })

  it('partial', () => {
    check(
      make((S) =>
        S.partial({
          name: S.string,
          age: S.number
        })
      )
    )
  })

  it('record', () => {
    check(make((S) => S.record(S.string)))
  })

  it('array', () => {
    check(make((S) => S.array(S.string)))
  })

  it('tuple', () => {
    check(make((S) => S.tuple()))
    check(make((S) => S.tuple(S.string)))
    check(make((S) => S.tuple(S.string, S.number)))
  })

  it('intersect', () => {
    check(make((S) => pipe(S.struct({ a: S.string }), S.intersect(S.struct({ b: S.number })))))
  })

  it('sum', () => {
    const A = make((S) => S.struct({ _tag: S.literal('A'), a: S.string }))
    const B = make((S) => S.struct({ _tag: S.literal('B'), b: S.number }))
    check(make((S) => S.sum('_tag')({ A: A(S), B: B(S) })))
  })

  it('lazy', () => {
    interface A {
      a: string
      b?: A
      c?: number
    }

    const schema: Schema<D.LazyD<
      unknown,
      DE.DecodeError<DE.UnknownRecordE | DE.StringE | DE.NumberE | DE.NaNE | DE.InfinityE>,
      A
    >> = make((S) =>
      S.lazy('A', () => pipe(S.struct({ a: S.string }), S.intersect(S.partial({ b: schema(S), c: S.number }))))
    )
    check(schema)
  })
})
