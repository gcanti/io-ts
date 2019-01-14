import * as assert from 'assert'
import * as t from '../src/index'
import { assertFailure, assertStrictEqual, assertSuccess, NumberFromString } from './helpers'

describe('tuple', () => {
  describe('name', () => {
    it('should assign a default name', () => {
      const T = t.tuple([t.number, t.string])
      assert.strictEqual(T.name, '[number, string]')
    })

    it('should accept a name', () => {
      const T = t.tuple([t.number, t.string], 'T')
      assert.strictEqual(T.name, 'T')
    })
  })

  describe('is', () => {
    it('should check a isomorphic value', () => {
      const T = t.tuple([t.number, t.string])
      assert.strictEqual(T.is([0, 'foo']), true)
      assert.strictEqual(T.is([0, 2]), false)
      assert.strictEqual(T.is(undefined), false)
      assert.strictEqual(T.is([0]), false)
    })

    it('should check a prismatic value', () => {
      const T = t.tuple([NumberFromString, t.string])
      assert.strictEqual(T.is([0, 'foo']), true)
      assert.strictEqual(T.is([0, 2]), false)
      assert.strictEqual(T.is(undefined), false)
      assert.strictEqual(T.is([0]), false)
    })

    it('should check for additional components', () => {
      const T = t.tuple([t.number, t.string])
      assert.strictEqual(T.is([0, 'foo', true]), false)
    })
  })

  describe('decode', () => {
    it('should decode a isomorphic value', () => {
      const T0 = t.tuple([] as any)
      assertSuccess(T0.decode([]))
      const T1 = t.tuple([t.number])
      assertSuccess(T1.decode([1]))
      const T2 = t.tuple([t.number, t.string])
      assertSuccess(T2.decode([1, 'a']))
    })

    it('should decode a prismatic value', () => {
      const T = t.tuple([NumberFromString, t.string])
      assertSuccess(T.decode(['1', 'a']), [1, 'a'])
    })

    it('should fail validating an invalid value', () => {
      const T = t.tuple([t.number, t.string])
      assertFailure(T.decode(1), ['Invalid value 1 supplied to : [number, string]'])
      assertFailure(T.decode([]), [
        'Invalid value undefined supplied to : [number, string]/0: number',
        'Invalid value undefined supplied to : [number, string]/1: string'
      ])
      assertFailure(T.decode([1]), ['Invalid value undefined supplied to : [number, string]/1: string'])
      assertFailure(T.decode([1, 1]), ['Invalid value 1 supplied to : [number, string]/1: string'])
    })

    it('should fail while validating a tuple with additional components', () => {
      const T = t.tuple([t.number, t.string])
      assertFailure(T.decode([1, 'foo', true]), ['Invalid value true supplied to : [number, string]/2: never'])
    })
  })

  describe('encode', () => {
    it('should encode a isomorphic value', () => {
      const T = t.tuple([t.number, t.string])
      assert.deepEqual(T.encode([1, 'a']), [1, 'a'])
    })

    it('should encode a prismatic value', () => {
      const T = t.tuple([NumberFromString, t.string])
      assert.deepEqual(T.encode([1, 'a']), ['1', 'a'])
    })
  })

  it('should return the same reference if validation succeeded and nothing changed', () => {
    const T = t.tuple([t.number, t.string])
    const value = [1, 'a']
    assertStrictEqual(T.decode(value), value)
  })

  it('should return the same reference while encoding', () => {
    const T = t.tuple([t.number, t.string])
    assert.strictEqual(T.encode, t.identity)
  })
})
