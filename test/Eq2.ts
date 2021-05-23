import * as assert from 'assert'
import * as E from '../src/Eq2'
import { Eq } from 'fp-ts/lib/Eq'
import { pipe } from 'fp-ts/lib/pipeable'

describe('Eq2', () => {
  it('number', () => {
    const eq = E.number
    assert.deepStrictEqual(eq.equals(1, 1), true)
    assert.deepStrictEqual(eq.equals(1, 2), false)
    assert.deepStrictEqual(eq.equals(NaN, NaN), false)
    assert.deepStrictEqual(eq.equals(Infinity, Infinity), true)
    assert.deepStrictEqual(eq.equals(-Infinity, -Infinity), true)
    assert.deepStrictEqual(eq.equals(-Infinity, Infinity), false)
  })

  it('literal', () => {
    const eq = E.toEq.literal('a', null)
    assert.deepStrictEqual(eq.equals('a', 'a'), true)
    assert.deepStrictEqual(eq.equals(null, null), true)
    assert.deepStrictEqual(eq.equals('a', null), false)
  })

  it('UnknownArray', () => {
    const eq = E.UnknownArray
    assert.deepStrictEqual(eq.equals(['a'], ['a']), true)
    assert.deepStrictEqual(eq.equals(['a'], ['b']), true)
    assert.deepStrictEqual(eq.equals(['a'], ['a', 'b']), false)
  })

  it('UnknownRecord', () => {
    const eq = E.UnknownRecord
    assert.deepStrictEqual(eq.equals({}, {}), true)
    assert.deepStrictEqual(eq.equals({ a: 1 }, { a: 1 }), true)
    assert.deepStrictEqual(eq.equals({ a: 1 }, { a: 2 }), true)
    assert.deepStrictEqual(eq.equals({ a: 1 }, { a: 1, b: true }), false)
    assert.deepStrictEqual(eq.equals({ a: 1, b: true }, { a: 1 }), false)
  })

  it('nullable', () => {
    const eq = E.nullable(E.string)
    assert.deepStrictEqual(eq.equals(null, null), true)
    assert.deepStrictEqual(eq.equals('a', 'a'), true)
    assert.deepStrictEqual(eq.equals('a', 'b'), false)
  })

  it('partial', () => {
    const eq = E.partial({ a: E.number })
    assert.deepStrictEqual(eq.equals({ a: 1 }, { a: 1 }), true)
    assert.deepStrictEqual(eq.equals({ a: undefined }, { a: undefined }), true)
    assert.deepStrictEqual(eq.equals({}, { a: undefined }), true)
    assert.deepStrictEqual(eq.equals({}, {}), true)
    assert.deepStrictEqual(eq.equals({ a: 1 }, {}), false)
  })

  it('tuple', () => {
    const eq = E.tuple(E.string, E.number)
    assert.deepStrictEqual(eq.equals(['a', 1], ['a', 1]), true)
    assert.deepStrictEqual(eq.equals(['a', 1], ['b', 1]), false)
    assert.deepStrictEqual(eq.equals(['a', 1], ['a', 2]), false)
  })

  it('intersect', () => {
    const eq = pipe(E.struct({ a: E.string }), E.intersect(E.struct({ b: E.number })))
    assert.deepStrictEqual(eq.equals({ a: 'a', b: 1 }, { a: 'a', b: 1 }), true)
    assert.deepStrictEqual(eq.equals({ a: 'a', b: 1 }, { a: 'c', b: 1 }), false)
    assert.deepStrictEqual(eq.equals({ a: 'a', b: 1 }, { a: 'a', b: 2 }), false)
  })

  it('lazy', () => {
    interface A {
      a: number
      b: Array<A>
    }

    const eq: Eq<A> = E.toEq.lazy('A', () =>
      E.struct({
        a: E.number,
        b: E.array(eq)
      })
    )
    assert.strictEqual(eq.equals({ a: 1, b: [] }, { a: 1, b: [] }), true)
    assert.strictEqual(eq.equals({ a: 1, b: [{ a: 2, b: [] }] }, { a: 1, b: [{ a: 2, b: [] }] }), true)
    assert.strictEqual(eq.equals({ a: 1, b: [] }, { a: 2, b: [] }), false)
    assert.strictEqual(eq.equals({ a: 1, b: [{ a: 2, b: [] }] }, { a: 1, b: [{ a: 3, b: [] }] }), false)
  })

  it('sum', () => {
    const sum = E.sum('_tag')
    const eq = sum({
      A: E.struct({ _tag: E.toEq.literal('A'), a: E.string }),
      B: E.struct({ _tag: E.toEq.literal('B'), b: E.number })
    })
    assert.strictEqual(eq.equals({ _tag: 'A', a: 'a' }, { _tag: 'A', a: 'a' }), true)
    assert.strictEqual(eq.equals({ _tag: 'B', b: 1 }, { _tag: 'B', b: 1 }), true)
    assert.strictEqual(eq.equals({ _tag: 'A', a: 'a' }, { _tag: 'B', b: 1 }), false)
    assert.strictEqual(eq.equals({ _tag: 'A', a: 'a' }, { _tag: 'A', a: 'b' }), false)
    assert.strictEqual(eq.equals({ _tag: 'B', b: 1 }, { _tag: 'B', b: 2 }), false)
  })
})
