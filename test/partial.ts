import * as assert from 'assert'
import * as t from '../src/index'
import {
  assertSuccess,
  assertFailure,
  assertStrictEqual,
  assertDeepEqual,
  withDefault,
  NumberFromString
} from './helpers'

describe('partial', () => {
  describe('name', () => {
    it('should assign a default name', () => {
      const T = t.partial({ a: t.number })
      assert.strictEqual(T.name, 'Partial<{ a: number }>')
    })

    it('should accept a name', () => {
      const T = t.partial({ a: t.number }, 'T')
      assert.strictEqual(T.name, 'T')
    })
  })

  describe('is', () => {
    it('should check a isomorphic value', () => {
      const T = t.partial({ a: t.number })
      assert.strictEqual(T.is({}), true)
      assert.strictEqual(T.is({ a: 1 }), true)
      assert.strictEqual(T.is(undefined), false)
      assert.strictEqual(T.is({ a: 'foo' }), false)
    })

    it('should check a prismatic value', () => {
      const T = t.partial({ a: NumberFromString })
      assert.strictEqual(T.is({}), true)
      assert.strictEqual(T.is({ a: 1 }), true)
      assert.strictEqual(T.is(undefined), false)
      assert.strictEqual(T.is({ a: 'foo' }), false)
    })
  })

  describe('decode', () => {
    it('should decode a isomorphic value', () => {
      const T = t.partial({ a: t.number })
      assertSuccess(T.decode({}), {})
      assertSuccess(T.decode({ a: undefined }), { a: undefined })
      assertSuccess(T.decode({ a: 1 }), { a: 1 })
    })

    it('should fail validating an invalid value', () => {
      const T = t.partial({ a: t.number })
      assertFailure(T, null, ['Invalid value null supplied to : Partial<{ a: number }>'])
      assertFailure(T, { a: 's' }, ['Invalid value "s" supplied to : Partial<{ a: number }>/a: number'])
    })
  })

  describe('encode', () => {
    it('should encode a isomorphic value', () => {
      const T = t.partial({ a: t.number })
      assert.deepEqual(T.encode({}), {})
      assert.deepEqual(T.encode({ a: undefined }), { a: undefined })
      assert.deepEqual(T.encode({ a: 1 }), { a: 1 })
    })

    it('should encode a prismatic value', () => {
      const T = t.partial({ a: NumberFromString })
      assert.deepEqual(T.encode({}), {})
      assert.deepEqual(T.encode({ a: undefined }), { a: undefined })
      assert.deepEqual(T.encode({ a: 1 }), { a: '1' })
    })
  })

  it('should not add optional keys', () => {
    const T = t.partial({ a: t.number })
    const input1 = {}
    assertStrictEqual(T.decode(input1), input1)
    const input2 = { a: undefined }
    assertStrictEqual(T.decode(input2), input2)
    assert.deepEqual(T.decode({ b: 1 }).value, { b: 1 })
    const input3 = { a: undefined, b: 1 }
    assertStrictEqual(T.decode(input3), input3)
  })

  it('should return the same reference if validation succeeded', () => {
    const T = t.partial({ a: t.number })
    const value = {}
    assertStrictEqual(T.decode(value), value)
  })

  it('should return the same reference while encoding', () => {
    const T = t.partial({ a: t.number })
    assert.strictEqual(T.encode, t.identity)
  })

  it('should support default values', () => {
    const T = t.partial({
      name: withDefault(t.string, 'foo')
    })
    assertDeepEqual(T.decode({}), { name: 'foo' })
  })

  it('should preserve additional properties while encoding', () => {
    const T = t.partial({ a: NumberFromString })
    const x = { a: 1, b: 'foo' }
    assert.deepEqual(T.encode(x), { a: '1', b: 'foo' })
  })
})
