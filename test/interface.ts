import { isRight } from 'fp-ts/lib/Either'
import * as assert from 'assert'
import * as t from '../src/index'
import { assertSuccess, assertFailure, assertStrictEqual, assertDeepEqual, DateFromNumber } from './helpers'

describe('interface', () => {
  it('should succeed validating a valid value', () => {
    const T = t.interface({ a: t.string })
    assertSuccess(t.validate({ a: 's' }, T))
  })

  it('should succeed validating a valid value with implicit context', () => {
    const T = t.interface({ a: t.string })
    assertSuccess(T.validate({ a: 's' }))
  })

  it('should succeed validating with implicit context without binding', () => {
    const T = t.interface({ a: t.string })
    const validation = [{ a: 's' }].map(T.validate)[0] // no need for T.validate.bind(T)
    assertSuccess(validation)
  })

  it('should keep unknown properties', () => {
    const T = t.interface({ a: t.string })
    const validation = t.validate({ a: 's', b: 1 }, T)
    if (isRight(validation)) {
      assert.deepEqual(validation.value, { a: 's', b: 1 })
    } else {
      assert.ok(false)
    }
  })

  it('should return the same reference if validation succeeded and nothing changed', () => {
    const T = t.interface({ a: t.string })
    const value = { a: 's' }
    assertStrictEqual(t.validate(value, T), value)
  })

  it('should return the a new reference if validation succeeded and something changed', () => {
    const T = t.interface({ a: DateFromNumber, b: t.number })
    assertDeepEqual(t.validate({ a: 1, b: 2 }, T), { a: new Date(1), b: 2 })
  })

  it('should fail validating an invalid value', () => {
    const T = t.interface({ a: t.string })
    assertFailure(t.validate(1, T), ['Invalid value 1 supplied to : { a: string }'])
    assertFailure(t.validate({}, T), ['Invalid value undefined supplied to : { a: string }/a: string'])
    assertFailure(t.validate({ a: 1 }, T), ['Invalid value 1 supplied to : { a: string }/a: string'])
  })

  it('should fail validating an invalid value with implicit context', () => {
    const T = t.interface({ a: t.string })
    // "as any" is required here because T.validate with one argument validates the input type
    assertFailure(T.validate(1), ['Invalid value 1 supplied to : { a: string }'])
    assertFailure(T.validate({}), ['Invalid value undefined supplied to : { a: string }/a: string'])
    assertFailure(T.validate({ a: 1 }), ['Invalid value 1 supplied to : { a: string }/a: string'])
  })

  it('should support the alias `type`', () => {
    const T = t.type({ a: t.string })
    assertSuccess(t.validate({ a: 's' }, T))
  })

  it('should serialize a deserialized', () => {
    const T = t.type({ a: DateFromNumber })
    assert.deepEqual(T.serialize({ a: new Date(0) }), { a: 0 })
  })

  it('should return the same reference when serializing', () => {
    const T = t.type({ a: t.number })
    assert.strictEqual(T.serialize, t.identity)
  })

  it('should type guard', () => {
    const T1 = t.type({ a: t.number })
    assert.strictEqual(T1.is({ a: 0 }), true)
    assert.strictEqual(T1.is(undefined), false)
    const T2 = t.type({ a: DateFromNumber })
    assert.strictEqual(T2.is({ a: new Date(0) }), true)
    assert.strictEqual(T2.is({ a: 0 }), false)
    assert.strictEqual(T2.is(undefined), false)
  })
})
