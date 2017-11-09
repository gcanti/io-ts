import * as assert from 'assert'
import * as t from '../src/index'
import { assertSuccess, assertFailure, assertStrictEqual, DateFromNumber } from './helpers'

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
    const T = t.refinement(t.number, n => n >= 0)
    assertFailure(t.validate(-1, T), ['Invalid value -1 supplied to : (number | <function1>)'])
  })

  it('should serialize a deserialized', () => {
    const T = t.refinement(t.array(DateFromNumber), () => true)
    assert.deepEqual(T.serialize([new Date(0)]), [0])
  })

  it('should return the same reference when serializing', () => {
    const T = t.refinement(t.array(t.number), () => true)
    assert.strictEqual(T.serialize, t.identity)
  })
})
