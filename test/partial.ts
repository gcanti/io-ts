import * as assert from 'assert'
import * as t from '../src/index'
import { assertSuccess, assertFailure, assertStrictEqual, withDefault, NumberFromString } from './helpers'

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
    it('should return `true` on valid inputs', () => {
      const T1 = t.partial({ a: t.number })
      assert.strictEqual(T1.is({}), true)
      assert.strictEqual(T1.is({ a: 1 }), true)

      const T2 = t.partial({ a: NumberFromString })
      assert.strictEqual(T2.is({}), true)
      assert.strictEqual(T2.is({ a: 1 }), true)
    })

    it('should return `false` on invalid inputs', () => {
      const T1 = t.partial({ a: t.number })
      assert.strictEqual(T1.is(undefined), false)
      assert.strictEqual(T1.is({ a: 'foo' }), false)
      // #407
      assert.strictEqual(T1.is([]), false)

      const T2 = t.partial({ a: NumberFromString })
      assert.strictEqual(T2.is(undefined), false)
      assert.strictEqual(T2.is({ a: 'foo' }), false)
      // #407
      assert.strictEqual(T2.is([]), false)
    })
  })

  describe('decode', () => {
    it('should succeed on valid inputs', () => {
      const T = t.partial({ a: t.number })
      assertSuccess(T.decode({}), {})
      assertSuccess(T.decode({ a: undefined }), { a: undefined })
      assertSuccess(T.decode({ a: 1 }), { a: 1 })
    })

    it('should fail on invalid inputs', () => {
      const T = t.partial({ a: t.number })
      assertFailure(T, null, ['Invalid value null supplied to : Partial<{ a: number }>'])
      assertFailure(T, { a: 's' }, ['Invalid value "s" supplied to : Partial<{ a: number }>/a: number'])
      // #407
      assertFailure(T, [], ['Invalid value [] supplied to : Partial<{ a: number }>'])
    })

    it('should not add optional keys', () => {
      const T = t.partial({ a: t.number })
      const input1 = {}
      assertStrictEqual(T.decode(input1), input1)
      const input2 = { a: undefined }
      assertStrictEqual(T.decode(input2), input2)
      assertSuccess(T.decode({ b: 1 }), { b: 1 } as any)
      const input3 = { a: undefined, b: 1 }
      assertStrictEqual(T.decode(input3), input3)
    })

    it('should return the same reference if validation succeeded', () => {
      const T = t.partial({ a: t.number })
      const value = {}
      assertStrictEqual(T.decode(value), value)
    })

    it('should support default values', () => {
      const T = t.partial({
        name: withDefault(t.string, 'foo')
      })
      assertSuccess(T.decode({}), { name: 'foo' })
      assertSuccess(T.decode({ name: 'a' }), { name: 'a' })
    })
  })

  describe('encode', () => {
    it('should encode a isomorphic value', () => {
      const T = t.partial({ a: t.number })
      assert.deepStrictEqual(T.encode({}), {})
      assert.deepStrictEqual(T.encode({ a: undefined }), { a: undefined })
      assert.deepStrictEqual(T.encode({ a: 1 }), { a: 1 })
    })

    it('should encode a prismatic value', () => {
      const T = t.partial({ a: NumberFromString })
      assert.deepStrictEqual(T.encode({}), {})
      assert.deepStrictEqual(T.encode({ a: undefined }), { a: undefined })
      assert.deepStrictEqual(T.encode({ a: 1 }), { a: '1' })
    })

    it('should return the same reference while encoding', () => {
      const T = t.partial({ a: t.number })
      assert.strictEqual(T.encode, t.identity)
    })

    it('should preserve additional properties while encoding', () => {
      const T = t.partial({ a: NumberFromString })
      const x = { a: 1, b: 'foo' }
      assert.deepStrictEqual(T.encode(x), { a: '1', b: 'foo' })
    })
  })
})
