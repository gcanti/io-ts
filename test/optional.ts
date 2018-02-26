import * as assert from 'assert'
import * as t from '../src/index'
import { assertSuccess, assertFailure, assertStrictEqual, assertDeepEqual, DateFromNumber } from './helpers'

describe('optional', () => {
  it('should succeed validating a valid value', () => {
    const T1 = t.interface({ a: t.string, b: t.optional(t.number) })
    assertSuccess(T1.decode({ a: 's' }))
    assertSuccess(T1.decode({ a: 's', b: 1 }))
    const T2 = t.strict({ a: t.string, b: t.optional(t.number) })
    assertSuccess(T2.decode({ a: 's' }))
    assertSuccess(T1.decode({ a: 's', b: 1 }))
  })

  it('should return the same reference if validation succeeded and nothing changed', () => {
    const T = t.interface({ a: t.string, b: t.optional(t.number) })
    const value1 = { a: 's' }
    assertStrictEqual(T.decode(value1), value1)
    const value2 = { a: 's', b: 1 }
    assertStrictEqual(T.decode(value2), value2)
  })

  it('should return the a new reference if validation succeeded and something changed', () => {
    const T = t.interface({ a: t.optional(DateFromNumber) })
    assertDeepEqual(T.decode({ a: 1 }), { a: new Date(1) })
    assertDeepEqual(T.decode({}), {})
  })

  it('should fail validating an invalid value', () => {
    const T1 = t.interface({ a: t.string, b: t.optional(t.number) })
    assertFailure(T1.decode({ a: 1, b: 'a' }), [
      'Invalid value 1 supplied to : { a: string, b: number? }/a: string',
      'Invalid value "a" supplied to : { a: string, b: number? }/b: number?'
    ])
    const T2 = t.strict({ a: t.string, b: t.optional(t.number) })
    assertFailure(T2.decode({ a: 's', c: true }), [
      'Invalid value true supplied to : StrictType<{ a: string, b: number? }>/c: never'
    ])
  })

  it('should serialize a deserialized', () => {
    const T = t.type({ a: t.optional(DateFromNumber) })
    assert.deepEqual(T.encode({ a: new Date(0) }), { a: 0 })
    assert.deepEqual(T.encode({ a: undefined }), { a: undefined })
    assert.deepEqual(T.encode({}), {})
  })

  it('should return the same reference when serializing', () => {
    const T = t.type({ a: t.optional(t.number) })
    assert.strictEqual(T.encode, t.identity)
  })

  it('should type guard', () => {
    const T1 = t.type({ a: t.optional(t.number) })
    assert.strictEqual(T1.is({ a: 0 }), true)
    assert.strictEqual(T1.is({}), true)
    assert.strictEqual(T1.is(undefined), false)
    const T2 = t.type({ a: t.optional(DateFromNumber) })
    assert.strictEqual(T2.is({ a: new Date(0) }), true)
    assert.strictEqual(T2.is({}), true)
    assert.strictEqual(T2.is({ a: 0 }), false)
    assert.strictEqual(T2.is(undefined), false)
  })
})
