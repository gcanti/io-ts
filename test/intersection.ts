import * as t from '../src/index'
import {
  assertSuccess,
  assertFailure,
  assertStrictEqual,
  assertDeepEqual,
  number2
} from './helpers'

describe('intersection', () => {

  it('should succeed validating a valid value', () => {
    const T = t.intersection([t.record({ a: t.number }), t.record({ b: t.number })])
    assertSuccess(t.validate({ a: 1, b: 2 }, T))
    assertSuccess(t.validate({ a: 1, b: 2, c: 3 }, T))
  })

  it('should return the same reference if validation succeeded and nothing changed', () => {
    const T = t.intersection([t.record({ a: t.number }), t.record({ b: t.number })])
    const value = { a: 1, b: 2 }
    assertStrictEqual(t.validate(value, T), value)
  })

  it('should return a new reference if validation succeeded and something changed', () => {
    const T = t.intersection([t.record({ a: number2 }), t.record({ b: t.number })])
    const value = { a: 1, b: 2 }
    assertDeepEqual(t.validate(value, T), { a: 2, b: 2 })
  })

  it('should fail validating an invalid value', () => {
    const T = t.intersection([t.record({ a: t.number }), t.record({ b: t.number })])
    assertFailure(t.validate({ a: 1 }, T), [
      'Invalid value undefined supplied to : ({ a: number } & { b: number })/1: { b: number }/b: number'
    ])
  })

})
