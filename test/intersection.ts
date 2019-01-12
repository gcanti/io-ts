import * as assert from 'assert'
import * as t from '../src/index'
import { assertSuccess, assertFailure, assertStrictEqual, assertDeepEqual, DateFromNumber } from './helpers'

describe('intersection', () => {
  it('should succeed validating a valid value', () => {
    const T = t.intersection([t.interface({ a: t.number }), t.interface({ b: t.number })])
    assertSuccess(T.decode({ a: 1, b: 2 }))
  })

  it('should handle primitive types', () => {
    const T1 = t.intersection([t.string, t.string])
    assertSuccess(T1.decode('foo'))
    const T2 = t.intersection([t.string, t.number])
    assertFailure(T2.decode('foo'), ['Invalid value "foo" supplied to : (string & number)/1: number'])
  })

  it('should keep unknown properties', () => {
    const T = t.intersection([t.interface({ a: t.number }), t.interface({ b: t.number })])
    const validation = T.decode({ a: 1, b: 1, c: true })
    if (validation.isRight()) {
      assert.deepEqual(validation.value, { a: 1, b: 1, c: true })
    } else {
      assert.ok(false)
    }
  })

  it('should return the same reference if validation succeeded and nothing changed', () => {
    const T = t.intersection([t.interface({ a: t.number }), t.interface({ b: t.number })])
    const value = { a: 1, b: 2 }
    assertStrictEqual(T.decode(value), value)
  })

  it('should return a new reference if validation succeeded and something changed', () => {
    const T = t.intersection([t.interface({ a: DateFromNumber }), t.interface({ b: t.number })])
    assertDeepEqual(T.decode({ a: 1, b: 2 }), { a: new Date(1), b: 2 })
  })

  it('should fail validating an invalid value', () => {
    const T = t.intersection([t.interface({ a: t.number }), t.interface({ b: t.number })])
    assertFailure(T.decode(null), [
      'Invalid value null supplied to : ({ a: number } & { b: number })/0: { a: number }',
      'Invalid value null supplied to : ({ a: number } & { b: number })/1: { b: number }'
    ])
    assertFailure(T.decode({ a: 1 }), [
      'Invalid value undefined supplied to : ({ a: number } & { b: number })/1: { b: number }/b: number'
    ])
  })

  it('should serialize a deserialized', () => {
    const T = t.intersection([t.interface({ a: DateFromNumber }), t.interface({ b: t.number })])
    assert.deepEqual(T.encode({ a: new Date(0), b: 1 }), { a: 0, b: 1 })
  })

  it('should return the same reference when serializing', () => {
    const T = t.intersection([t.interface({ a: t.number }), t.interface({ b: t.number })])
    assert.strictEqual(T.encode, t.identity)
  })

  it('should type guard', () => {
    const T = t.intersection([t.interface({ a: DateFromNumber }), t.interface({ b: t.number })])
    assert.strictEqual(T.is({ a: new Date(0), b: 1 }), true)
    assert.strictEqual(T.is({ a: new Date(0) }), false)
    assert.strictEqual(T.is(undefined), false)
  })
})
