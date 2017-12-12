import * as assert from 'assert'
import * as t from '../src/index'
import { assertSuccess, assertFailure, assertStrictEqual, DateFromNumber } from './helpers'

describe('union', () => {
  it('should succeed validating a valid value', () => {
    const T = t.union([t.string, t.number])
    assertSuccess(t.validate('s', T))
    assertSuccess(t.validate(1, T))
  })

  it('should return the same reference if validation succeeded', () => {
    const T = t.union([t.Dictionary, t.number])
    const value = {}
    assertStrictEqual(t.validate(value, T), value)
  })

  it('should fail validating an invalid value', () => {
    const T = t.union([t.string, t.number])
    assertFailure(t.validate(true, T), [
      'Invalid value true supplied to : (string | number)/0: string',
      'Invalid value true supplied to : (string | number)/1: number'
    ])
  })

  it('should serialize a deserialized', () => {
    const T1 = t.union([t.interface({ a: DateFromNumber }), t.number])
    assert.deepEqual(T1.serialize({ a: new Date(0) }), { a: 0 })
    assert.deepEqual(T1.serialize(1), 1)
    const T2 = t.union([t.number, DateFromNumber])
    assert.deepEqual(T2.serialize(new Date(0)), 0)
  })

  it('should return the same reference when serializing', () => {
    const T = t.union([t.type({ a: t.number }), t.string])
    assert.strictEqual(T.serialize, t.identity)
  })

  it('should type guard', () => {
    const T1 = t.union([t.string, t.number])
    assert.strictEqual(T1.is(0), true)
    assert.strictEqual(T1.is('foo'), true)
    assert.strictEqual(T1.is(true), false)
    const T2 = t.union([t.string, DateFromNumber])
    assert.strictEqual(T2.is(new Date(0)), true)
    assert.strictEqual(T2.is('foo'), true)
    assert.strictEqual(T2.is(true), false)
  })
})
