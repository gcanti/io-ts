import * as assert from 'assert'
import * as t from '../src/index'
import { assertFailure, assertSuccess, NumberFromString, strip } from './helpers'

// this is a modified copy of the `type` tests

describe('strip', () => {
  describe('name', () => {
    it('should assign a default name', () => {
      const T = strip({ a: t.string })
      assert.strictEqual(T.name, '{ a: string }')
    })

    it('should accept a name', () => {
      const T = strip({ a: t.string }, 'T')
      assert.strictEqual(T.name, 'T')
    })
  })

  describe('is', () => {
    it('should check a isomorphic value', () => {
      const T = strip({ a: t.string })
      assert.strictEqual(T.is({}), false)
      assert.strictEqual(T.is({ a: 1 }), false)
      assert.strictEqual(T.is({ a: 'a' }), true)
    })

    it('should allow additional properties', () => {
      const T = strip({ a: t.string })
      assert.strictEqual(T.is({ a: 'a', b: 1 }), true)
    })
  })

  describe('decode', () => {
    it('should decode a isomorphic value', () => {
      const T = strip({ a: t.string })
      assertSuccess(T.decode({ a: 'a' }))
    })

    it('should decode a prismatic value', () => {
      const T = strip({ a: NumberFromString })
      assertSuccess(T.decode({ a: '1' }), { a: 1 })
    })

    it('should decode undefined properties as always present keys', () => {
      const T1 = strip({ a: t.undefined })
      assertSuccess(T1.decode({ a: undefined }), { a: undefined })
      assertSuccess(T1.decode({}), { a: undefined })

      const T2 = strip({ a: t.union([t.number, t.undefined]) })
      assertSuccess(T2.decode({ a: undefined }), { a: undefined })
      assertSuccess(T2.decode({ a: 1 }), { a: 1 })
      assertSuccess(T2.decode({}), { a: undefined })
    })

    it('should fail decoding an invalid value', () => {
      const T = strip({ a: t.string })
      assertFailure(T, 1, ['Invalid value 1 supplied to : { a: string }'])
      assertFailure(T, {}, ['Invalid value undefined supplied to : { a: string }/a: string'])
      assertFailure(T, { a: 1 }, ['Invalid value 1 supplied to : { a: string }/a: string'])
    })

    it('should support the alias `interface`', () => {
      const T = strip({ a: t.string })
      assertSuccess(T.decode({ a: 'a' }))
    })

    it('should strip additional properties', () => {
      const T = strip({ a: t.string })
      assertSuccess(T.decode({ a: 'a', b: 1 }), { a: 'a' })
    })
  })

  describe('encode', () => {
    it('should encode a isomorphic value', () => {
      const T = strip({ a: t.string })
      assert.deepEqual(T.encode({ a: 'a' }), { a: 'a' })
    })

    it('should strip additional properties', () => {
      const T = strip({ a: t.string })
      const x = { a: 'a', b: 1 }
      assert.deepEqual(T.encode(x), { a: 'a' })
    })

    it('should encode a prismatic value', () => {
      const T = strip({ a: NumberFromString })
      assert.deepEqual(T.encode({ a: 1 }), { a: '1' })
    })
  })
})
