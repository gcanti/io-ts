import * as t from '../src/index'
import {
  assertSuccess,
  assertFailure,
  assertStrictEqual
} from './helpers'

describe('instanceOf', () => {

  it('should succeed validating a valid value', () => {
    class A {}
    const T = t.instanceOf(A)
    assertSuccess(t.validate(new A(), T))
  })

  it('should return the same reference if validation succeeded', () => {
    class A {}
    const T = t.instanceOf(A)
    const value = new A()
    assertStrictEqual(t.validate(value, T), value)
  })

  it('should fail validating an invalid value', () => {
    class A {}
    const T = t.instanceOf(A)
    assertFailure(t.validate(1, T), [
      'Invalid value 1 supplied to : A'
    ])
  })

})
