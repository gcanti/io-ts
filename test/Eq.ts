import * as assert from 'assert'
import * as E from '../src/Eq'
import { Eq } from 'fp-ts/Eq'
import { pipe } from 'fp-ts/function'
import { deepStrictEqual } from './util'

describe('Eq', () => {
  it('literal', () => {
    const eq = E.Schemable.literal('a', null)
    deepStrictEqual(eq.equals('a')('a'), true)
    deepStrictEqual(eq.equals(null)(null), true)
    deepStrictEqual(eq.equals('a')(null), false)
  })

  it('UnknownArray', () => {
    const eq = E.UnknownArray
    deepStrictEqual(eq.equals(['a'])(['a']), true)
    deepStrictEqual(eq.equals(['a'])(['b']), true)
    deepStrictEqual(eq.equals(['a'])(['a', 'b']), false)
  })

  it('UnknownRecord', () => {
    const eq = E.UnknownRecord
    deepStrictEqual(eq.equals({})({}), true)
    deepStrictEqual(eq.equals({ a: 1 })({ a: 1 }), true)
    deepStrictEqual(eq.equals({ a: 1 })({ a: 2 }), true)
    deepStrictEqual(eq.equals({ a: 1 })({ a: 1, b: true }), false)
    deepStrictEqual(eq.equals({ a: 1, b: true })({ a: 1 }), false)
  })

  it('partial', () => {
    const eq = E.partial({ a: E.number })
    deepStrictEqual(eq.equals({ a: 1 })({ a: 1 }), true)
    deepStrictEqual(eq.equals({ a: undefined })({ a: undefined }), true)
    deepStrictEqual(eq.equals({})({ a: undefined }), true)
    deepStrictEqual(eq.equals({})({}), true)
    deepStrictEqual(eq.equals({ a: 1 })({}), false)
  })

  it('tuple', () => {
    const eq = E.tuple(E.string, E.number)
    deepStrictEqual(eq.equals(['a', 1])(['a', 1]), true)
    deepStrictEqual(eq.equals(['a', 1])(['b', 1]), false)
    deepStrictEqual(eq.equals(['a', 1])(['a', 2]), false)
  })

  it('intersect', () => {
    const eq = pipe(E.type({ a: E.string }), E.intersect(E.type({ b: E.number })))
    deepStrictEqual(eq.equals({ a: 'a', b: 1 })({ a: 'a', b: 1 }), true)
    deepStrictEqual(eq.equals({ a: 'a', b: 1 })({ a: 'c', b: 1 }), false)
    deepStrictEqual(eq.equals({ a: 'a', b: 1 })({ a: 'a', b: 2 }), false)
  })

  it('lazy', () => {
    interface A {
      readonly a: number
      // tslint:disable-next-line: readonly-array
      readonly b: Array<A>
    }

    const eq: Eq<A> = E.Schemable.lazy('A', () =>
      E.type({
        a: E.number,
        b: E.array(eq)
      })
    )
    assert.strictEqual(eq.equals({ a: 1, b: [] })({ a: 1, b: [] }), true)
    assert.strictEqual(eq.equals({ a: 1, b: [{ a: 2, b: [] }] })({ a: 1, b: [{ a: 2, b: [] }] }), true)
    assert.strictEqual(eq.equals({ a: 1, b: [] })({ a: 2, b: [] }), false)
    assert.strictEqual(eq.equals({ a: 1, b: [{ a: 2, b: [] }] })({ a: 1, b: [{ a: 3, b: [] }] }), false)
  })

  it('sum', () => {
    const sum = E.sum('_tag')
    const eq = sum({
      A: E.type({ _tag: E.Schemable.literal('A'), a: E.string }),
      B: E.type({ _tag: E.Schemable.literal('B'), b: E.number })
    })
    assert.strictEqual(eq.equals({ _tag: 'A', a: 'a' })({ _tag: 'A', a: 'a' }), true)
    assert.strictEqual(eq.equals({ _tag: 'B', b: 1 })({ _tag: 'B', b: 1 }), true)
    assert.strictEqual(eq.equals({ _tag: 'A', a: 'a' })({ _tag: 'B', b: 1 }), false)
    assert.strictEqual(eq.equals({ _tag: 'A', a: 'a' })({ _tag: 'A', a: 'b' }), false)
    assert.strictEqual(eq.equals({ _tag: 'B', b: 1 })({ _tag: 'B', b: 2 }), false)
  })

  it('refine', () => {
    interface NonEmptyStringBrand {
      readonly NonEmptyString: unique symbol
    }
    type NonEmptyString = string & NonEmptyStringBrand
    const eq = pipe(
      E.string,
      E.WithRefine.refine((s): s is NonEmptyString => s.length > 0, 'NonEmptyString')
    )
    const a: NonEmptyString = 'a' as any
    const b: NonEmptyString = 'b' as any
    deepStrictEqual(eq.equals(a)(a), true)
    deepStrictEqual(eq.equals(a)(b), false)
  })
})
