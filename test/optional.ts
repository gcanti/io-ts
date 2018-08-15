import * as assert from 'assert'
import * as t from '../src/index'
import { assertSuccess, assertFailure, assertStrictEqual, DateFromNumber, withDefault } from './helpers'

describe('optional', () => {
  it('should succeed validating a valid value', () => {
    const T = t.optional(t.number)
    assertSuccess(T.decode(0))
    assertSuccess(T.decode(1))
    assertSuccess(T.decode(undefined))
  })

  it('should return the same reference if validation succeeded', () => {
    const T = t.optional(t.Dictionary)
    const value = {}
    assertStrictEqual(T.decode(value), value)
  })

  it('should fail validating an invalid value', () => {
    const T = t.optional(t.Integer)
    assertFailure(T.decode('a'), ['Invalid value "a" supplied to : (Integer | undefined)'])
    assertFailure(T.decode(1.2), ['Invalid value 1.2 supplied to : (Integer | undefined)'])
  })

  it('should serialize a deserialized', () => {
    const T = t.optional(DateFromNumber)
    assert.deepEqual(T.encode(new Date(0)), 0)
    assert.deepEqual(T.encode(undefined), undefined)
  })

  it('should return the same reference when serializing', () => {
    const T = t.optional(t.array(t.number))
    assert.strictEqual(T.encode, t.identity)
  })

  it('should type guard', () => {
    const T = t.optional(t.Integer)
    assert.strictEqual(T.is(1.2), false)
    assert.strictEqual(T.is('a'), false)
    assert.strictEqual(T.is(1), true)
    assert.strictEqual(T.is(undefined), true)
  })

  it('should assign a default name', () => {
    const T1 = t.optional(t.number)
    assert.strictEqual(T1.name, '(number | undefined)')
    const T2 = t.optional(t.number, 'T2')
    assert.strictEqual(T2.name, 'T2')
  })
})
