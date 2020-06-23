import * as assert from 'assert'
import * as E from '../src/Encoder'
import { pipe } from 'fp-ts/lib/pipeable'

const NumberToString: E.Encoder<string, number> = {
  encode: String
}

const BooleanToNumber: E.Encoder<number, boolean> = {
  encode: (b) => (b ? 1 : 0)
}

describe('Encoder', () => {
  it('contramap', () => {
    const encoder = E.contramap((s: string) => s.length)(NumberToString)
    assert.deepStrictEqual(encoder.encode('aaa'), '3')
  })

  it('compose', () => {
    const encoder = pipe(BooleanToNumber, E.compose(NumberToString))
    assert.deepStrictEqual(encoder.encode(true), '1')
  })

  it('nullable', () => {
    const encoder = E.nullable(NumberToString)
    assert.deepStrictEqual(encoder.encode(1), '1')
    assert.deepStrictEqual(encoder.encode(null), null)
  })

  it('type', () => {
    const encoder = E.type({ a: NumberToString, b: BooleanToNumber })
    assert.deepStrictEqual(encoder.encode({ a: 1, b: true }), { a: '1', b: 1 })
  })

  it('partial', () => {
    const encoder = E.partial({ a: NumberToString, b: BooleanToNumber })
    assert.deepStrictEqual(encoder.encode({ a: 1, b: true }), { a: '1', b: 1 })
    assert.deepStrictEqual(encoder.encode({ a: 1 }), { a: '1' })
    assert.deepStrictEqual(encoder.encode({ a: 1, b: undefined }), { a: '1', b: undefined })
    assert.deepStrictEqual(encoder.encode({ b: true }), { b: 1 })
    assert.deepStrictEqual(encoder.encode({}), {})
  })

  it('record', () => {
    const encoder = E.record(NumberToString)
    assert.deepStrictEqual(encoder.encode({ a: 1, b: 2 }), { a: '1', b: '2' })
  })

  it('array', () => {
    const encoder = E.array(NumberToString)
    assert.deepStrictEqual(encoder.encode([1, 2]), ['1', '2'])
  })

  it('tuple', () => {
    const encoder = E.tuple(NumberToString, BooleanToNumber)
    assert.deepStrictEqual(encoder.encode([3, true]), ['3', 1])
  })

  it('intersect', () => {
    const encoder = pipe(E.type({ a: NumberToString }), E.intersect(E.type({ b: BooleanToNumber })))
    assert.deepStrictEqual(encoder.encode({ a: 1, b: true }), { a: '1', b: 1 })
  })

  it('sum', () => {
    const S1 = E.type({ _tag: E.id<'A'>(), a: NumberToString })
    const S2 = E.type({ _tag: E.id<'B'>(), b: BooleanToNumber })
    const sum = E.sum('_tag')
    const encoder = sum({ A: S1, B: S2 })
    assert.deepStrictEqual(encoder.encode({ _tag: 'A', a: 1 }), { _tag: 'A', a: '1' })
    assert.deepStrictEqual(encoder.encode({ _tag: 'B', b: true }), { _tag: 'B', b: 1 })
  })

  it('lazy', () => {
    interface A {
      a: number
      bs: Array<B>
    }
    interface AOut {
      a: string
      bs: Array<BOut>
    }
    interface B {
      b: boolean
      as: Array<A>
    }
    interface BOut {
      b: number
      as: Array<AOut>
    }
    const A: E.Encoder<AOut, A> = E.lazy(() =>
      E.type({
        a: NumberToString,
        bs: E.array(B)
      })
    )

    const B: E.Encoder<BOut, B> = E.lazy(() =>
      E.type({
        b: BooleanToNumber,
        as: E.array(A)
      })
    )
    assert.deepStrictEqual(A.encode({ a: 1, bs: [] }), { a: '1', bs: [] })
    assert.deepStrictEqual(A.encode({ a: 1, bs: [{ b: true, as: [] }] }), { a: '1', bs: [{ b: 1, as: [] }] })
    assert.deepStrictEqual(A.encode({ a: 1, bs: [{ b: true, as: [{ a: 2, bs: [] }] }] }), {
      a: '1',
      bs: [{ b: 1, as: [{ a: '2', bs: [] }] }]
    })
  })
})
