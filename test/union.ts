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
    const T = t.union([t.interface({ a: DateFromNumber }), t.number])
    assert.deepEqual(T.serialize({ a: new Date(0) }), { a: 0 })
    assert.deepEqual(T.serialize(1), 1)
  })

  it('should return the same reference when serializing', () => {
    const T = t.union([t.type({ a: t.number }), t.string])
    assert.strictEqual(T.serialize, t.identity)
  })
})
