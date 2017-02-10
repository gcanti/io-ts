import * as t from '../src/index'
import {
  assertSuccess,
  assertFailure
} from './helpers'

describe('Index', () => {

  it('should accept arrays', () => {
    assertSuccess(t.validate([], t.Index))
  })

  it('should accept objects', () => {
    assertSuccess(t.validate({}, t.Index))
  })

  it('should fail with primitives', () => {
    const T = t.Index
    assertFailure(t.validate('s', T), [
      'Invalid value "s" supplied to : Index'
    ])
    assertFailure(t.validate(1, T), [
      'Invalid value 1 supplied to : Index'
    ])
    assertFailure(t.validate(true, T), [
      'Invalid value true supplied to : Index'
    ])
  })

  it('should fail with null and undefined', () => {
    const T = t.Index
    assertFailure(t.validate(null, T), [
      'Invalid value null supplied to : Index'
    ])
    assertFailure(t.validate(undefined, T), [
      'Invalid value undefined supplied to : Index'
    ])
  })

})
