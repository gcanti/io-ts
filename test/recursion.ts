import * as t from '../src/index'
import {
  assertSuccess,
  assertFailure,
  assertStrictEqual
} from './helpers'

describe('recursion', () => {

  it('should succeed validating a valid value', () => {
    const T = t.recursion('T', self => t.interface({
      a: t.number,
      b: t.union([self, t.undefined, t.null])
    }))
    assertSuccess(t.validate({ a: 1, b: null }, T))
    assertSuccess(t.validate({ a: 1, b: { a: 2, b: null } }, T))
  })

  it('should return the same reference if validation succeeded', () => {
    const T = t.recursion('T', self => t.interface({
      a: t.number,
      b: t.union([self, t.undefined, t.null])
    }))
    const value = { a: 1, b: { a: 2, b: null } }
    assertStrictEqual(t.validate(value, T), value)
  })

  it('should fail validating an invalid value', () => {
    const T = t.recursion('T', self => t.interface({
      a: t.number,
      b: t.union([self, t.undefined, t.null])
    }))
    assertFailure(t.validate(1, T), [
      'Invalid value 1 supplied to : T'
    ])
    assertFailure(t.validate({}, T), [
      'Invalid value undefined supplied to : T/a: number'
    ])
    assertFailure(t.validate({ a: 1, b: {} }, T), [
      'Invalid value {} supplied to : T/b: (T | undefined | null)'
    ])
  })

})
