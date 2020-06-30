import * as assert from 'assert'
import * as fc from 'fast-check'
import { isRight } from 'fp-ts/lib/Either'
import * as JC from '../src/JsonCodec'
import * as Eq from '../src/Eq'
import * as G from '../src/Guard'
import { Schema, interpreter, make } from '../src/Schema'
import * as A from './Arbitrary'
import * as JE from '../src/JsonEncoder'
import { pipe } from 'fp-ts/lib/pipeable'

function isDeepStrictEqual(actual: unknown, expected: unknown): boolean {
  try {
    assert.deepStrictEqual(actual, expected)
    return true
  } catch {
    return false
  }
}

function check<A>(schema: Schema<A>): void {
  const arb = interpreter(A.Schemable)(schema)
  const codec = interpreter(JC.Schemable)(schema)
  const guard = interpreter(G.Schemable)(schema)
  const eq = interpreter(Eq.Schemable)(schema)
  const encoder = interpreter(JE.Schemable)(schema)
  // decoders, guards and eqs should be aligned
  fc.assert(fc.property(arb, (a) => isRight(codec.decode(a)) && guard.is(a) && eq.equals(a, a)))
  // laws
  // 1.
  fc.assert(fc.property(arb, (a) => isRight(codec.decode(codec.encode(a))) && isRight(codec.decode(encoder.encode(a)))))
  // 2.
  fc.assert(
    fc.property(arb, (u) => {
      const a = codec.decode(u)
      if (isRight(a)) {
        const o = a.right
        return isDeepStrictEqual(codec.encode(o), u) && isDeepStrictEqual(encoder.encode(o), u) && eq.equals(o, u)
      }
      return false
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

  it('type', () => {
    check(
      make((S) =>
        S.type({
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
    check(make((S) => pipe(S.type({ a: S.string }), S.intersect(S.type({ b: S.number })))))
  })

  it('sum', () => {
    const A = make((S) => S.type({ _tag: S.literal('A'), a: S.string }))
    const B = make((S) => S.type({ _tag: S.literal('B'), b: S.number }))
    check(make((S) => S.sum('_tag')({ A: A(S), B: B(S) })))
  })

  it('lazy', () => {
    interface A {
      a: string
      b?: A
      c?: number
    }

    const schema: Schema<A> = make((S) =>
      S.lazy('A', () => pipe(S.type({ a: S.string }), S.intersect(S.partial({ b: schema(S), c: S.number }))))
    )
    check(schema)
  })
})
