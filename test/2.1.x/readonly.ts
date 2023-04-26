import * as assert from 'assert'

import * as t from '../../src/index'
import { assertFailure, assertSuccess, NumberFromString } from './helpers'

describe.concurrent('readonly', () => {
  describe.concurrent('name', () => {
    it('should assign a default name', () => {
      const T = t.readonly(t.type({ a: t.number }))
      assert.strictEqual(T.name, 'Readonly<{ a: number }>')
    })

    it('should accept a name', () => {
      const T = t.readonly(t.type({ a: t.number }), 'T2')
      assert.strictEqual(T.name, 'T2')
    })
  })

  describe.concurrent('is', () => {
    it('should check a isomorphic value', () => {
      const T = t.readonly(t.type({ a: t.number }))
      assert.strictEqual(T.is({ a: 1 }), true)
      assert.strictEqual(T.is({ a: 'foo' }), false)
      assert.strictEqual(T.is(undefined), false)
    })

    it('should check a prismatic value', () => {
      const T = t.readonly(t.type({ a: NumberFromString }))
      assert.strictEqual(T.is({ a: 1 }), true)
      assert.strictEqual(T.is({ a: '1' }), false)
      assert.strictEqual(T.is(undefined), false)
    })
  })

  describe.concurrent('decode', () => {
    it('should succeed validating a valid value', () => {
      const T = t.readonly(t.type({ a: t.number }))
      assertSuccess(T.decode({ a: 1 }))
    })

    it('should fail validating an invalid value', () => {
      const T = t.readonly(t.type({ a: t.number }))
      assertFailure(T, {}, ['Invalid value undefined supplied to : Readonly<{ a: number }>/a: number'])
    })
  })

  describe.concurrent('encode', () => {
    it('should encode a prismatic value', () => {
      const T = t.readonly(t.type({ a: NumberFromString }))
      assert.deepStrictEqual(T.encode({ a: 1 }), { a: '1' })
    })

    it('should return the same reference when serializing', () => {
      const T = t.readonly(t.type({ a: t.number }))
      assert.strictEqual(T.encode, t.identity)
    })
  })
})
