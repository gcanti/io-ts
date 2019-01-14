import * as t from '../src/index'
import { assertSuccess, assertFailure, assertStrictEqual, NumberFromString } from './helpers'
import * as assert from 'assert'

describe('strict', () => {
  describe('name', () => {
    it('should assign a default name', () => {
      const T = t.strict({ foo: t.string })
      assert.strictEqual(T.name, 'StrictType<{ foo: string }>')
    })

    it('should accept a name', () => {
      const T = t.strict({ foo: t.string }, 'Foo')
      assert.strictEqual(T.name, 'Foo')
    })
  })

  describe('is', () => {
    it('should check a isomorphic value', () => {
      const T = t.strict({ a: t.number })
      assert.strictEqual(T.is({ a: 0 }), true)
      assert.strictEqual(T.is({ a: 0, b: 1 }), false)
      assert.strictEqual(T.is(undefined), false)
    })

    it('should check a prismatic value', () => {
      const T = t.strict({ a: NumberFromString })
      assert.strictEqual(T.is({ a: 1 }), true)
      assert.strictEqual(T.is({ a: 1, b: 1 }), false)
      assert.strictEqual(T.is(undefined), false)
    })
  })

  describe('decode', () => {
    it('should succeed validating a valid value', () => {
      const T = t.strict({ foo: t.string })
      assertSuccess(T.decode({ foo: 'foo' }))
    })

    it('should succeed validating an undefined field', () => {
      const T = t.strict({ foo: t.string, bar: t.union([t.string, t.undefined]) })
      assertSuccess(T.decode({ foo: 'foo' }))
    })

    it('should return the same reference if validation succeeded', () => {
      const T = t.strict({ foo: t.string })
      const value = { foo: 'foo' }
      assertStrictEqual(T.decode(value), value)
    })

    it('should fail validating an invalid value', () => {
      const T = t.strict({ foo: t.string })
      assertFailure(T.decode({ foo: 'foo', bar: 1, baz: true }), [
        'Invalid value 1 supplied to : StrictType<{ foo: string }>/bar: never',
        'Invalid value true supplied to : StrictType<{ foo: string }>/baz: never'
      ])
    })
  })

  describe('encode', () => {
    it('should encode a prismatic value', () => {
      const T = t.strict({ a: NumberFromString })
      assert.deepEqual(T.encode({ a: 1 }), { a: '1' })
    })

    it('should return the same reference while encoding', () => {
      const T = t.strict({ a: t.number })
      assert.strictEqual(T.encode, t.identity)
    })
  })
})
