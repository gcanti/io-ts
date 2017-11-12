import * as assert from 'assert'
import * as t from '../src/index'
import { assertSuccess, assertFailure, assertStrictEqual, assertDeepEqual, number2, DateFromNumber } from './helpers'

describe('dictionary', () => {
  it('should succeed validating a valid value', () => {
    const T = t.dictionary(t.number)
    assertSuccess(t.validate({}, T))
    assertSuccess(t.validate({ aa: 1 }, T))
  })

  it('should return the same reference if validation succeeded if nothing changed', () => {
    const T = t.dictionary(t.number)
    const value = { aa: 1 }
    assertStrictEqual(t.validate(value, T), value)
  })

  it('should return a new reference if validation succeeded and something changed', () => {
    const T = t.dictionary(number2)
    const value = { aa: 1 }
    assertDeepEqual(t.validate(value, T), { aa: 2 })
  })

  it('should fail validating an invalid value', () => {
    const T = t.dictionary(t.number)
    assertFailure(t.validate({ aa: 's' }, T), ['Invalid value "s" supplied to : { [key: string]: number }/aa: number'])
  })

  it('should serialize a deserialized', () => {
    const T = t.dictionary(DateFromNumber)
    assert.deepEqual(T.serialize({ a: new Date(0), b: new Date(1) }), { a: 0, b: 1 })
  })

  it('should return the same reference when serializing', () => {
    const T = t.dictionary(t.number)
    assert.strictEqual(T.serialize, t.identity)
  })

  it('should type guard', () => {
    const T1 = t.dictionary(t.number)
    assert.strictEqual(T1.is({}), true)
    assert.strictEqual(T1.is({ a: 1 }), true)
    assert.strictEqual(T1.is({ a: 'foo' }), false)
    const T2 = t.dictionary(DateFromNumber)
    assert.strictEqual(T2.is({}), true)
    assert.strictEqual(T2.is({ a: new Date(0) }), true)
    assert.strictEqual(T2.is({ a: 0 }), false)
  })
})
