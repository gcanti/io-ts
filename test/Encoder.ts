import { pipe } from 'fp-ts/function'
import * as E from '../src/Encoder'
import * as H from './helpers'
import { deepStrictEqual } from './util'

describe('Encoder', () => {
  // -------------------------------------------------------------------------------------
  // type class members
  // -------------------------------------------------------------------------------------

  it('contramap', () => {
    const encoder = E.contramap((s: string) => s.length)(H.encoderNumberToString)
    deepStrictEqual(encoder.encode('aaa'), '3')
  })

  // -------------------------------------------------------------------------------------
  // utils
  // -------------------------------------------------------------------------------------

  it('compose', () => {
    const encoder = pipe(H.encoderBooleanToNumber, E.compose(H.encoderNumberToString))
    deepStrictEqual(encoder.encode(true), '1')
  })

  // -------------------------------------------------------------------------------------
  // instances
  // -------------------------------------------------------------------------------------

  it('Category', () => {
    const encoder = pipe(H.encoderNumberToString, E.Category.compose(H.encoderBooleanToNumber))
    deepStrictEqual(encoder.encode(true), '1')
  })

  // -------------------------------------------------------------------------------------
  // combinators
  // -------------------------------------------------------------------------------------

  it('nullable', () => {
    const encoder = E.nullable(H.encoderNumberToString)
    deepStrictEqual(encoder.encode(1), '1')
    deepStrictEqual(encoder.encode(null), null)
  })

  it('struct', () => {
    const encoder = E.struct({ a: H.encoderNumberToString, b: H.encoderBooleanToNumber })
    deepStrictEqual(encoder.encode({ a: 1, b: true }), { a: '1', b: 1 })
  })

  it('partial', () => {
    const encoder = E.partial({ a: H.encoderNumberToString, b: H.encoderBooleanToNumber })
    deepStrictEqual(encoder.encode({ a: 1, b: true }), { a: '1', b: 1 })
    deepStrictEqual(encoder.encode({ a: 1 }), { a: '1' })
    deepStrictEqual(encoder.encode({ a: 1, b: undefined }), { a: '1', b: undefined })
    deepStrictEqual(encoder.encode({ b: true }), { b: 1 })
    deepStrictEqual(encoder.encode({}), {})
  })

  it('record', () => {
    const encoder = E.record(H.encoderNumberToString)
    deepStrictEqual(encoder.encode({ a: 1, b: 2 }), { a: '1', b: '2' })
  })

  it('array', () => {
    const encoder = E.array(H.encoderNumberToString)
    deepStrictEqual(encoder.encode([1, 2]), ['1', '2'])
  })

  it('tuple', () => {
    const encoder = E.tuple(H.encoderNumberToString, H.encoderBooleanToNumber)
    deepStrictEqual(encoder.encode([3, true]), ['3', 1])
  })

  it('intersect', () => {
    const encoder = pipe(
      E.struct({ a: H.encoderNumberToString }),
      E.intersect(E.struct({ b: H.encoderBooleanToNumber }))
    )
    deepStrictEqual(encoder.encode({ a: 1, b: true }), { a: '1', b: 1 })
  })

  it('sum', () => {
    const S1 = E.struct({ _tag: E.id<'A'>(), a: H.encoderNumberToString })
    const S2 = E.struct({ _tag: E.id<'B'>(), b: H.encoderBooleanToNumber })
    const sum = E.sum('_tag')
    const encoder = sum({ A: S1, B: S2 })
    deepStrictEqual(encoder.encode({ _tag: 'A', a: 1 }), { _tag: 'A', a: '1' })
    deepStrictEqual(encoder.encode({ _tag: 'B', b: true }), { _tag: 'B', b: 1 })
  })

  it('lazy', () => {
    interface A {
      readonly a: number
      // tslint:disable-next-line: readonly-array
      readonly bs: Array<B>
    }
    interface AOut {
      readonly a: string
      // tslint:disable-next-line: readonly-array
      readonly bs: Array<BOut>
    }
    interface B {
      readonly b: boolean
      // tslint:disable-next-line: readonly-array
      readonly as: Array<A>
    }
    interface BOut {
      readonly b: number
      // tslint:disable-next-line: readonly-array
      readonly as: Array<AOut>
    }
    const A: E.Encoder<AOut, A> = E.lazy(() =>
      E.struct({
        a: H.encoderNumberToString,
        bs: E.array(B)
      })
    )

    const B: E.Encoder<BOut, B> = E.lazy(() =>
      E.struct({
        b: H.encoderBooleanToNumber,
        as: E.array(A)
      })
    )
    deepStrictEqual(A.encode({ a: 1, bs: [] }), { a: '1', bs: [] })
    deepStrictEqual(A.encode({ a: 1, bs: [{ b: true, as: [] }] }), { a: '1', bs: [{ b: 1, as: [] }] })
    deepStrictEqual(A.encode({ a: 1, bs: [{ b: true, as: [{ a: 2, bs: [] }] }] }), {
      a: '1',
      bs: [{ b: 1, as: [{ a: '2', bs: [] }] }]
    })
  })
})
