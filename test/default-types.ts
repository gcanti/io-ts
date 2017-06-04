import * as t from '../src/index'
import { assertSuccess, assertFailure } from './helpers'

describe('Dictionary', () => {
  it('should accept arrays', () => {
    assertSuccess(t.validate([], t.Dictionary))
  })

  it('should accept objects', () => {
    assertSuccess(t.validate({}, t.Dictionary))
  })

  it('should fail with primitives', () => {
    const T = t.Dictionary
    assertFailure(t.validate('s', T), ['Invalid value "s" supplied to : Dictionary'])
    assertFailure(t.validate(1, T), ['Invalid value 1 supplied to : Dictionary'])
    assertFailure(t.validate(true, T), ['Invalid value true supplied to : Dictionary'])
  })

  it('should fail with null and undefined', () => {
    const T = t.Dictionary
    assertFailure(t.validate(null, T), ['Invalid value null supplied to : Dictionary'])
    assertFailure(t.validate(undefined, T), ['Invalid value undefined supplied to : Dictionary'])
  })
})

describe('Integer', () => {
  it('should validate integers', () => {
    assertSuccess(t.validate(1, t.Integer))
    assertFailure(t.validate(0.5, t.Integer), ['Invalid value 0.5 supplied to : Integer'])
    assertFailure(t.validate('foo', t.Integer), ['Invalid value "foo" supplied to : Integer'])
  })
})
