import * as assert from 'assert'
import * as fc from 'fast-check'
import { isRight } from 'fp-ts/lib/Either'
import * as C from '../src/Codec'
import * as Eq from '../src/Eq'
import * as G from '../src/Guard'
import { interpreter, make, Schema } from '../src/Schema'
import * as A from './Arbitrary'

function isDeepStrictEqual(actual: unknown, expected: unknown): boolean {
  try {
    assert.deepStrictEqual(actual, expected)
    return true
  } catch {
    return false
  }
}

function check<A>(schema: Schema<A>): void {
  const arb = interpreter(A.arbitrary)(schema)
  const codec = interpreter(C.codec)(schema)
  const guard = interpreter(G.guard)(schema)
  const eq = interpreter(Eq.eq)(schema)
  // decoders, guards and eqs should be aligned
  fc.assert(fc.property(arb, (a) => isRight(codec.decode(a)) && guard.is(a) && eq.equals(a, a)))
  // laws
  fc.assert(fc.property(arb, (a) => isRight(codec.decode(codec.encode(a)))))
  fc.assert(
    fc.property(arb, (u) => {
      const a = codec.decode(u)
      if (isRight(a)) {
        const o = a.right
        return isDeepStrictEqual(codec.encode(o), u) && eq.equals(o, u)
      }
      return false
    })
  )
}
describe('Schemable', () => {
  it('string', () => {
    check(make((S) => S.string))
  })

  it('number', () => {
    check(make((S) => S.number))
  })

  it('boolean', () => {
    check(make((S) => S.boolean))
  })

  it('UnknownArray', () => {
    check(make((S) => S.UnknownArray))
  })

  it('UnknownRecord', () => {
    check(make((S) => S.UnknownRecord))
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

  it('intersection', () => {
    check(make((S) => S.intersection(S.type({ a: S.string }), S.type({ b: S.number }))))
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
      S.lazy('A', () => S.intersection(S.type({ a: S.string }), S.partial({ b: schema(S), c: S.number })))
    )
    check(schema)
  })
})
