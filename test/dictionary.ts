import * as assert from 'assert'
import * as t from '../src/index'
import { assertSuccess, assertFailure, assertStrictEqual, assertDeepEqual, string2, DateFromNumber } from './helpers'

describe('dictionary', () => {
  it('should succeed validating a valid value', () => {
    const T1 = t.dictionary(t.string, t.number)
    assertSuccess(t.validate({}, T1))
    assertSuccess(t.validate({ aa: 1 }, T1))
    const T2 = t.dictionary(t.refinement(t.string, s => s.length >= 2), t.number)
    assertSuccess(t.validate({}, T2))
    assertSuccess(t.validate({ aa: 1 }, T2))
    const T3 = t.dictionary(string2, t.number)
    assertSuccess(t.validate({}, T3))
    assertSuccess(t.validate({ aa: 1 }, T3))
  })

  it('should return the same reference if validation succeeded if nothing changed', () => {
    const T1 = t.dictionary(t.string, t.number)
    const value1 = { aa: 1 }
    assertStrictEqual(t.validate(value1, T1), value1)
    const T2 = t.dictionary(t.refinement(t.string, s => s.length >= 2), t.number)
    const value2 = { aa: 1 }
    assertStrictEqual(t.validate(value2, T2), value2)
  })

  it('should return a new reference if validation succeeded and something changed', () => {
    const T = t.dictionary(string2, t.number)
    const value = { aa: 1 }
    assertDeepEqual(t.validate(value, T), { 'a-a': 1 })
  })

  it('should fail validating an invalid value', () => {
    const T = t.dictionary(t.string, t.number)
    assertFailure(t.validate({ aa: 's' }, T), ['Invalid value "s" supplied to : { [K in string]: number }/aa: number'])
  })

  it('should support literals as domain type', () => {
    const T = t.dictionary(t.literal('foo'), t.string)
    assertSuccess(t.validate({ foo: 'bar' }, T))
    assertFailure(t.validate({ foo: 'bar', baz: 'bob' }, T), [
      'Invalid value "baz" supplied to : { [K in "foo"]: string }/baz: "foo"'
    ])
  })

  it('should support keyof as domain type', () => {
    const T = t.dictionary(t.keyof({ foo: true, bar: true }), t.string)
    assertSuccess(t.validate({ foo: 'bar' }, T))
    assertFailure(t.validate({ foo: 'bar', baz: 'bob' }, T), [
      'Invalid value "baz" supplied to : { [K in (keyof ["foo","bar"])]: string }/baz: (keyof ["foo","bar"])'
    ])
  })

  it('should serialize a deserialized', () => {
    const T1 = t.dictionary(t.string, DateFromNumber)
    assert.deepEqual(T1.serialize({ a: new Date(0), b: new Date(1) }), { a: 0, b: 1 })
    const T2 = t.dictionary(string2, t.number)
    assert.deepEqual(T2.serialize({ 'a-a': 1, 'a-b': 2 }), { aa: 1, ab: 2 })
  })

  it('should return the same reference when serializing', () => {
    const T1 = t.dictionary(t.string, t.number)
    assert.strictEqual(T1.serialize, t.identity)
    const T2 = t.dictionary(string2, t.number)
    assert.strictEqual(T2.serialize === t.identity, false)
  })

  it('should type guard', () => {
    const T1 = t.dictionary(t.string, t.number)
    assert.strictEqual(T1.is({}), true)
    assert.strictEqual(T1.is({ a: 1 }), true)
    assert.strictEqual(T1.is({ a: 'foo' }), false)
    const T2 = t.dictionary(t.string, DateFromNumber)
    assert.strictEqual(T2.is({}), true)
    assert.strictEqual(T2.is({ a: new Date(0) }), true)
    assert.strictEqual(T2.is({ a: 0 }), false)
    const T3 = t.dictionary(string2, t.number)
    assert.strictEqual(T3.is({}), true)
    assert.strictEqual(T3.is({ 'a-a': 1 }), true)
    assert.strictEqual(T3.is({ aa: 1 }), false)
  })
})
