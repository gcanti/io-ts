import * as t from '../src/index'
import {
  assertSuccess,
  assertFailure,
  assertStrictEqual
} from './helpers'

describe('refinement', () => {

  it('should succeed validating a valid value', () => {
    const T = t.refinement(t.number, n => n >= 0)
    assertSuccess(t.validate(0, T))
    assertSuccess(t.validate(1, T))
  })

  it('should return the same reference if validation succeeded', () => {
    const T = t.refinement(t.Pojo, () => true)
    const value = {}
    assertStrictEqual(t.validate(value, T), value)
  })

  it('should fail validating an invalid value', () => {
    const T = t.refinement(t.number, n => n >= 0)
    assertFailure(t.validate(-1, T), [
      'Invalid value -1 supplied to : (number | <function1>)'
    ])
  })

})
