import * as t from '../src/index'
import { assertSuccess, assertFailure, assertStrictEqual } from './helpers'

describe('strict', () => {
  it('should succeed validating a valid value', () => {
    const T = t.strict(t.interface({ foo: t.string }))
    assertSuccess(t.validate({ foo: 'foo' }, T))
  })

  it('should return the same reference if validation succeeded', () => {
    const T = t.strict(t.interface({ foo: t.string }))
    const value = { foo: 'foo' }
    assertStrictEqual(t.validate(value, T), value)
  })

  it('should fail validating an invalid value', () => {
    const T = t.strict(t.interface({ foo: t.string }))
    assertFailure(t.validate({ foo: 'foo', bar: 1, baz: true }, T), [
      'Invalid value 1 supplied to : StrictType<{ foo: string }>/bar: never',
      'Invalid value true supplied to : StrictType<{ foo: string }>/baz: never'
    ])
  })
})
