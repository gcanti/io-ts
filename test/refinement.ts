import * as assert from 'assert'
import * as t from '../src/index'
import { assertSuccess, assertFailure, assertStrictEqual, DateFromNumber, IntegerFromString } from './helpers'

describe('refinement', () => {
  it('should succeed validating a valid value', () => {
    const T = t.refinement(t.number, n => n >= 0)
    assertSuccess(t.validate(0, T))
    assertSuccess(t.validate(1, T))
  })

  it('should return the same reference if validation succeeded', () => {
    const T = t.refinement(t.Dictionary, () => true)
    const value = {}
    assertStrictEqual(t.validate(value, T), value)
  })

  it('should fail validating an invalid value', () => {
    const T = t.Integer
    assertFailure(t.validate('a', T), ['Invalid value "a" supplied to : Integer'])
    assertFailure(t.validate(1.2, T), ['Invalid value 1.2 supplied to : Integer'])
  })

  it('should fail with the last deserialized value', () => {
    const T = IntegerFromString
    assertFailure(t.validate('a', T), ['Invalid value "a" supplied to : IntegerFromString'])
    assertFailure(t.validate('1.2', T), ['Invalid value 1.2 supplied to : IntegerFromString'])
  })

  it('should serialize a deserialized', () => {
    const T = t.refinement(t.array(DateFromNumber), () => true)
    assert.deepEqual(T.serialize([new Date(0)]), [0])
  })

  it('should return the same reference when serializing', () => {
    const T = t.refinement(t.array(t.number), () => true)
    assert.strictEqual(T.serialize, t.identity)
  })

  it('should type guard', () => {
    const T = t.Integer
    assert.strictEqual(T.is(1.2), false)
    assert.strictEqual(T.is('a'), false)
    assert.strictEqual(T.is(1), true)
  })
})
