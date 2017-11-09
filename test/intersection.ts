import { isRight } from 'fp-ts/lib/Either'
import * as assert from 'assert'
import * as t from '../src/index'
import { assertSuccess, assertFailure, assertStrictEqual, assertDeepEqual, number2, DateFromNumber } from './helpers'

describe('intersection', () => {
  it('should succeed validating a valid value', () => {
    const T = t.intersection([t.interface({ a: t.number }), t.interface({ b: t.number })])
    assertSuccess(t.validate({ a: 1, b: 2 }, T))
  })

  it('should keep unknown properties', () => {
    const T = t.intersection([t.interface({ a: t.number }), t.interface({ b: t.number })])
    const validation = t.validate({ a: 1, b: 1, c: true }, T)
    if (isRight(validation)) {
      assert.deepEqual(validation.value, { a: 1, b: 1, c: true })
    } else {
      assert.ok(false)
    }
  })

  it('should return the same reference if validation succeeded and nothing changed', () => {
    const T = t.intersection([t.interface({ a: t.number }), t.interface({ b: t.number })])
    const value = { a: 1, b: 2 }
    assertStrictEqual(t.validate(value, T), value)
  })

  it('should return a new reference if validation succeeded and something changed', () => {
    const T = t.intersection([t.interface({ a: number2 }), t.interface({ b: t.number })])
    const value = { a: 1, b: 2 }
    assertDeepEqual(t.validate(value, T), { a: 2, b: 2 })
  })

  it('should fail validating an invalid value', () => {
    const T = t.intersection([t.interface({ a: t.number }), t.interface({ b: t.number })])
    assertFailure(t.validate({ a: 1 }, T), [
      'Invalid value undefined supplied to : ({ a: number } & { b: number })/b: number'
    ])
  })

  it('should serialize a deserialized', () => {
    const T = t.intersection([t.interface({ a: DateFromNumber }), t.interface({ b: t.number })])
    assert.deepEqual(T.serialize({ a: new Date(0), b: 1 }), { a: 0, b: 1 })
  })

  it('should return the same reference when serializing', () => {
    const T = t.intersection([t.interface({ a: t.number }), t.interface({ b: t.number })])
    assert.strictEqual(T.serialize, t.identity)
  })

  it('should type guard', () => {
    const T = t.intersection([t.interface({ a: DateFromNumber }), t.interface({ b: t.number })])
    assert.strictEqual(T.is({ a: new Date(0), b: 1 }), true)
    assert.strictEqual(T.is({ a: new Date(0) }), false)
    assert.strictEqual(T.is(undefined), false)
  })
})
