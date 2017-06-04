import * as t from '../src/index'
import { assertSuccess, assertFailure, assertStrictEqual, assertDeepEqual, number2 } from './helpers'

describe('tuple', () => {
  it('should succeed validating a valid value', () => {
    const T = t.tuple([t.number, t.string])
    assertSuccess(t.validate([1, 'a'], T))
    assertSuccess(t.validate([1, 'a', 1], T))
  })

  it('should return the same reference if validation succeeded and nothing changed', () => {
    const T = t.tuple([t.number, t.string])
    const value = [1, 'a']
    assertStrictEqual(t.validate(value, T), value)
  })

  it('should return the a new reference if validation succeeded and something changed', () => {
    const T = t.tuple([number2, t.string])
    const value = [1, 'a']
    assertDeepEqual(t.validate(value, T), [2, 'a'])
  })

  it('should fail validating an invalid value', () => {
    const T = t.tuple([t.number, t.string])
    assertFailure(t.validate([], T), [
      'Invalid value undefined supplied to : [number, string]/0: number',
      'Invalid value undefined supplied to : [number, string]/1: string'
    ])
    assertFailure(t.validate([1], T), ['Invalid value undefined supplied to : [number, string]/1: string'])
    assertFailure(t.validate([1, 1], T), ['Invalid value 1 supplied to : [number, string]/1: string'])
  })
})
