import * as t from '../src/index'
import {
  assertSuccess,
  assertFailure,
  assertStrictEqual
} from './helpers'

describe('union', () => {

  it('should succeed validating a valid value', () => {
    const T = t.union([t.string, t.number])
    assertSuccess(t.validate('s', T))
    assertSuccess(t.validate(1, T))
  })

  it('should return the same reference if validation succeeded', () => {
    const T = t.union([t.Pojo, t.number])
    const value = {}
    assertStrictEqual(t.validate(value, T), value)
  })

  it('should fail validating an invalid value', () => {
    const T = t.union([t.string, t.number])
    assertFailure(t.validate(true, T), [
      'Invalid value true supplied to : (string | number)'
    ])
  })

})
