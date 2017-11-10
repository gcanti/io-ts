import * as assert from 'assert'
import * as t from '../src/index'
import { assertSuccess, assertFailure, assertStrictEqual, DateFromNumber } from './helpers'

describe('recursion', () => {
  it('should succeed validating a valid value', () => {
    const T = t.recursion('T', self =>
      t.interface({
        a: t.number,
        b: t.union([self, t.undefined, t.null])
      })
    )
    assertSuccess(t.validate({ a: 1, b: null }, T))
    assertSuccess(t.validate({ a: 1, b: { a: 2, b: null } }, T))
  })

  it('should return the same reference if validation succeeded', () => {
    const T = t.recursion('T', self =>
      t.interface({
        a: t.number,
        b: t.union([self, t.undefined, t.null])
      })
    )
    const value = { a: 1, b: { a: 2, b: null } }
    assertStrictEqual(t.validate(value, T), value)
  })

  it('should fail validating an invalid value', () => {
    const T = t.recursion('T', self =>
      t.interface({
        a: t.number,
        b: t.union([self, t.undefined, t.null])
      })
    )
    assertFailure(t.validate(1, T), ['Invalid value 1 supplied to : T'])
    assertFailure(t.validate({}, T), ['Invalid value undefined supplied to : T/a: number'])
    assertFailure(t.validate({ a: 1, b: {} }, T), [
      'Invalid value undefined supplied to : T/b: (T | undefined | null)/0: T/a: number',
      'Invalid value {} supplied to : T/b: (T | undefined | null)/1: undefined',
      'Invalid value {} supplied to : T/b: (T | undefined | null)/2: null'
    ])
  })

  it('should serialize a deserialized', () => {
    type T = {
      a: Date
      b: T | null
    }
    const T = t.recursion<T>('T', self =>
      t.interface({
        a: DateFromNumber,
        b: t.union([self, t.null])
      })
    )
    assert.deepEqual(T.serialize({ a: new Date(0), b: null }), { a: 0, b: null })
  })

  it('should return the same reference when serializing', () => {
    type T = {
      a: number
      b: T | null
    }
    const T = t.recursion<T>('T', self =>
      t.interface({
        a: t.number,
        b: t.union([self, t.null])
      })
    )
    assert.strictEqual(T.serialize, t.identity)
  })

  it('should type guard', () => {
    type T = {
      a: Date
      b: T | null
    }
    const T = t.recursion<T>('T', self =>
      t.interface({
        a: DateFromNumber,
        b: t.union([self, t.null])
      })
    )
    assert.strictEqual(T.is({ a: new Date(0), b: null }), true)
    assert.strictEqual(T.is({ a: 0 }), false)
  })
})
