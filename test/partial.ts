import * as assert from 'assert'
import * as t from '../src/index'
import {
  assertSuccess,
  assertFailure,
  assertStrictEqual,
  identity
} from './helpers'

describe('partial', () => {

  it('should succeed validating a valid value', () => {
    const T = t.partial({ a: t.number })
    assertSuccess(t.validate({}, T))
    assertSuccess(t.validate({ a: 1 }, T))
  })

  it('should not add optional keys', () => {
    const T = t.partial({ a: t.number })
    assert.strictEqual(t.validate({}, T).fold<any>(identity, identity).hasOwnProperty('a'), false)
    assert.strictEqual(t.validate({ b: 1 }, T).fold<any>(identity, identity).hasOwnProperty('a'), false)
  })

  it('should return the same reference if validation succeeded', () => {
    const T = t.partial({ a: t.number })
    const value = {}
    assertStrictEqual(t.validate(value, T), value)
  })

  it('should fail validating an invalid value', () => {
    const T = t.partial({ a: t.number })
    assertFailure(t.validate({ a: 's' }, T), [
      'Invalid value \"s\" supplied to : { a: (number | undefined) }/a: (number | undefined)'
    ])
  })

})
