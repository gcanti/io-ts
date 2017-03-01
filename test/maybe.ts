import * as t from '../src/index'
import {
  assertSuccess,
  assertFailure,
  assertStrictEqual
} from './helpers'

describe('maybe', () => {

  it('should succeed validating a valid value', () => {
    const T = t.maybe(t.number)
    assertSuccess(t.validate(null, T))
    assertSuccess(t.validate(1, T))
  })

  it('should return the same reference if validation succeeded', () => {
    const T = t.maybe(t.Dictionary)
    const value = {}
    assertStrictEqual(t.validate(value, T), value)
  })

  it('should fail validating an invalid value', () => {
    const T = t.maybe(t.number)
    assertFailure(t.validate(undefined, T), [
      'Invalid value undefined supplied to : (number | null)'
    ])
    assertFailure(t.validate('s', T), [
      'Invalid value "s" supplied to : (number | null)'
    ])
  })

})
