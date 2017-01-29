import * as t from '../src/index'
import {
  assertSuccess,
  assertFailure,
  assertStrictEqual,
  assertDeepEqual,
  number2
} from './helpers'

describe('array', () => {

  it('should succeed validating a valid value', () => {
    const T = t.array(t.number)
    assertSuccess(t.validate([], T))
    assertSuccess(t.validate([1, 2, 3], T))
  })

  it('should return the same reference if validation succeeded and nothing changed', () => {
    const T = t.array(t.number)
    const value = [1, 2, 3]
    assertStrictEqual(t.validate(value, T), value)
  })

  it('should return the a new reference if validation succeeded and something changed', () => {
    const T = t.array(number2)
    const value = [1, 2, 3]
    assertDeepEqual(t.validate(value, T), [2, 4, 6])
  })

  it('should fail validating an invalid value', () => {
    const T = t.array(t.number)
    assertFailure(t.validate(1, T), [
      'Invalid value 1 supplied to : Array<number>'
    ])
    assertFailure(t.validate([1, 's', 3], T), [
      'Invalid value "s" supplied to : Array<number>/1: number'
    ])
  })

})
