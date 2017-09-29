import * as t from '../src/index'
import { assertSuccess, assertFailure, assertStrictEqual, assertDeepEqual, number2 } from './helpers'

describe('dictionary', () => {
  it('should succeed validating a valid value', () => {
    const T = t.dictionary(t.refinement(t.string, s => s.length >= 2), t.number)
    assertSuccess(t.validate({}, T))
    assertSuccess(t.validate({ aa: 1 }, T))
  })

  it('should return the same reference if validation succeeded if nothing changed', () => {
    const T = t.dictionary(t.refinement(t.string, s => s.length >= 2), t.number)
    const value = { aa: 1 }
    assertStrictEqual(t.validate(value, T), value)
  })

  it('should return a new reference if validation succeeded and something changed', () => {
    const T = t.dictionary(t.refinement(t.string, s => s.length >= 2), number2)
    const value = { aa: 1 }
    assertDeepEqual(t.validate(value, T), { aa: 2 })
  })

  it('should fail validating an invalid value', () => {
    const T = t.dictionary(t.refinement(t.string, s => s.length >= 2), t.number)
    assertFailure(t.validate({ a: 1 }, T), [
      'Invalid value "a" supplied to : { [key: (string | <function1>)]: number }/a: (string | <function1>)'
    ])
    assertFailure(t.validate({ aa: 's' }, T), [
      'Invalid value "s" supplied to : { [key: (string | <function1>)]: number }/aa: number'
    ])
  })

  it('should support literals as domain type', () => {
    const D = t.dictionary(t.literal('foo'), t.string)
    assertSuccess(t.validate({ foo: 'bar' }, D))
    assertFailure(t.validate({ foo: 'bar', baz: 'bob' }, D), [
      'Invalid value "baz" supplied to : { [key: "foo"]: string }/baz: "foo"'
    ])
  })
})
