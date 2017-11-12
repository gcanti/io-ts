import * as assert from 'assert'
import * as t from '../src/index'
import { assertSuccess, assertFailure, assertStrictEqual, assertDeepEqual, number2, DateFromNumber } from './helpers'

describe('tuple', () => {
  it('should succeed validating a valid value', () => {
    const T = t.tuple([t.number, t.string])
    assertSuccess(t.validate([1, 'a'], T))
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
    assertFailure(t.validate([1, 'foo', true], T), ['Invalid value true supplied to : [number, string]/2: never'])
  })

  it('should serialize a deserialized', () => {
    const T = t.tuple([DateFromNumber, t.string])
    assert.deepEqual(T.serialize([new Date(0), 'foo']), [0, 'foo'])
  })

  it('should return the same reference when serializing', () => {
    const T = t.tuple([t.number, t.string])
    assert.strictEqual(T.serialize, t.identity)
  })

  it('should type guard', () => {
    const T1 = t.tuple([t.number, t.string])
    assert.strictEqual(T1.is([0, 'foo']), true)
    assert.strictEqual(T1.is([0, 2]), false)
    assert.strictEqual(T1.is(undefined), false)
    assert.strictEqual(T1.is([0]), false)
    assert.strictEqual(T1.is([0, 'foo', true]), false)
    const T2 = t.tuple([DateFromNumber, t.string])
    assert.strictEqual(T2.is([new Date(0), 'foo']), true)
    assert.strictEqual(T2.is([new Date(0), 2]), false)
    assert.strictEqual(T2.is(undefined), false)
    assert.strictEqual(T2.is([new Date(0)]), false)
    assert.strictEqual(T2.is([new Date(0), 'foo', true]), false)
  })
})
