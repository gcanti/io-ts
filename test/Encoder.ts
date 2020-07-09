import * as assert from 'assert'
import * as E from '../src/Encoder'
import { pipe } from 'fp-ts/lib/pipeable'
import * as H from './helpers'

describe('Encoder', () => {
  it('contramap', () => {
    const encoder = E.contramap((s: string) => s.length)(H.encoderNumberToString)
    assert.deepStrictEqual(encoder.encode('aaa'), '3')
  })

  it('compose', () => {
    const encoder = pipe(H.encoderBooleanToNumber, E.compose(H.encoderNumberToString))
    assert.deepStrictEqual(encoder.encode(true), '1')
  })

  it('nullable', () => {
    const encoder = E.nullable(H.encoderNumberToString)
    assert.deepStrictEqual(encoder.encode(1), '1')
    assert.deepStrictEqual(encoder.encode(null), null)
  })

  it('type', () => {
    const encoder = E.type({ a: H.encoderNumberToString, b: H.encoderBooleanToNumber })
    assert.deepStrictEqual(encoder.encode({ a: 1, b: true }), { a: '1', b: 1 })
  })

  it('partial', () => {
    const encoder = E.partial({ a: H.encoderNumberToString, b: H.encoderBooleanToNumber })
    assert.deepStrictEqual(encoder.encode({ a: 1, b: true }), { a: '1', b: 1 })
    assert.deepStrictEqual(encoder.encode({ a: 1 }), { a: '1' })
    assert.deepStrictEqual(encoder.encode({ a: 1, b: undefined }), { a: '1', b: undefined })
    assert.deepStrictEqual(encoder.encode({ b: true }), { b: 1 })
    assert.deepStrictEqual(encoder.encode({}), {})
  })

  it('record', () => {
    const encoder = E.record(H.encoderNumberToString)
    assert.deepStrictEqual(encoder.encode({ a: 1, b: 2 }), { a: '1', b: '2' })
  })

  it('array', () => {
    const encoder = E.array(H.encoderNumberToString)
    assert.deepStrictEqual(encoder.encode([1, 2]), ['1', '2'])
  })

  it('tuple', () => {
    const encoder = E.tuple(H.encoderNumberToString, H.encoderBooleanToNumber)
    assert.deepStrictEqual(encoder.encode([3, true]), ['3', 1])
  })

  it('intersect', () => {
    const encoder = pipe(E.type({ a: H.encoderNumberToString }), E.intersect(E.type({ b: H.encoderBooleanToNumber })))
    assert.deepStrictEqual(encoder.encode({ a: 1, b: true }), { a: '1', b: 1 })
  })

  it('sum', () => {
    const S1 = E.type({ _tag: E.id<'A'>(), a: H.encoderNumberToString })
    const S2 = E.type({ _tag: E.id<'B'>(), b: H.encoderBooleanToNumber })
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
        a: H.encoderNumberToString,
        bs: E.array(B)
      })
    )

    const B: E.Encoder<BOut, B> = E.lazy(() =>
      E.type({
        b: H.encoderBooleanToNumber,
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
