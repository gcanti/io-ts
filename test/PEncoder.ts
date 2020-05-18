import * as assert from 'assert'
import * as PE from '../src/PEncoder'

const NumberToString: PE.PEncoder<string, number> = {
  encode: String
}

const BooleanToNumber: PE.PEncoder<number, boolean> = {
  encode: (b) => (b ? 1 : 0)
}

describe('PEncoder', () => {
  describe('pencoder', () => {
    it('contramap', () => {
      const encoder = PE.pencoder.contramap(NumberToString, (s: string) => s.length)
      assert.deepStrictEqual(encoder.encode('aaa'), '3')
    })
  })

  it('nullable', () => {
    const encoder = PE.nullable(NumberToString)
    assert.deepStrictEqual(encoder.encode(1), '1')
    assert.deepStrictEqual(encoder.encode(null), null)
  })

  it('type', () => {
    const encoder = PE.type({ a: NumberToString, b: BooleanToNumber })
    assert.deepStrictEqual(encoder.encode({ a: 1, b: true }), { a: '1', b: 1 })
  })

  it('partial', () => {
    const encoder = PE.partial({ a: NumberToString, b: BooleanToNumber })
    assert.deepStrictEqual(encoder.encode({ a: 1, b: true }), { a: '1', b: 1 })
    assert.deepStrictEqual(encoder.encode({ a: 1 }), { a: '1' })
    assert.deepStrictEqual(encoder.encode({ a: 1, b: undefined }), { a: '1', b: undefined })
    assert.deepStrictEqual(encoder.encode({ b: true }), { b: 1 })
    assert.deepStrictEqual(encoder.encode({}), {})
  })

  it('record', () => {
    const encoder = PE.record(NumberToString)
    assert.deepStrictEqual(encoder.encode({ a: 1, b: 2 }), { a: '1', b: '2' })
  })

  it('array', () => {
    const encoder = PE.array(NumberToString)
    assert.deepStrictEqual(encoder.encode([1, 2]), ['1', '2'])
  })

  it('tuple', () => {
    const encoder = PE.tuple(NumberToString, BooleanToNumber)
    assert.deepStrictEqual(encoder.encode([3, true]), ['3', 1])
  })

  it('intersection', () => {
    const encoder = PE.intersection(PE.type({ a: NumberToString }), PE.type({ b: BooleanToNumber }))
    assert.deepStrictEqual(encoder.encode({ a: 1, b: true }), { a: '1', b: 1 })
  })

  it('sum', () => {
    const S1 = PE.type({ _tag: PE.id<'A'>(), a: NumberToString })
    const S2 = PE.type({ _tag: PE.id<'B'>(), b: BooleanToNumber })
    const sum = PE.sum('_tag')
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
    const A: PE.PEncoder<AOut, A> = PE.lazy(() =>
      PE.type({
        a: NumberToString,
        bs: PE.array(B)
      })
    )

    const B: PE.PEncoder<BOut, B> = PE.lazy(() =>
      PE.type({
        b: BooleanToNumber,
        as: PE.array(A)
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
