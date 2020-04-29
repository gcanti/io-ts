import * as assert from 'assert'
import * as t from '../../src/index'
import { assertFailure, assertStrictEqual, assertStrictSuccess, assertSuccess, NumberFromString } from './helpers'

describe('array', () => {
  describe('name', () => {
    it('should assign a default name', () => {
      const T = t.array(t.number)
      assert.strictEqual(T.name, 'Array<number>')
    })

    it('should accept a name', () => {
      const T = t.array(t.number, 'T')
      assert.strictEqual(T.name, 'T')
    })
  })

  describe('is', () => {
    it('should check a isomorphic value', () => {
      const T = t.array(t.number)
      assert.strictEqual(T.is([]), true)
      assert.strictEqual(T.is([0]), true)
      assert.strictEqual(T.is([0, 'foo']), false)
    })
  })

  describe('decode', () => {
    it('should decode a isomorphic value', () => {
      const T = t.array(t.number)
      assertSuccess(T.decode([]), [])
      assertSuccess(T.decode([1, 2, 3]), [1, 2, 3])
    })

    it('should return the same reference while decoding isomorphic values', () => {
      const T = t.array(t.number)
      const value = [1, 2, 3]
      assertStrictSuccess(T.decode(value), value)
    })

    it('should decode a prismatic value', () => {
      const T = t.array(NumberFromString)
      assertSuccess(T.decode([]), [])
      assertSuccess(T.decode(['1', '2', '3']), [1, 2, 3])
    })

    it('should fail decoding an invalid value', () => {
      const T = t.array(t.number)
      assertFailure(T, 1, ['Invalid value 1 supplied to : Array<number>'])
      assertFailure(T, [1, 's', 3], ['Invalid value "s" supplied to : Array<number>/1: number'])
    })
  })

  describe('encode', () => {
    it('should encode a isomorphic value', () => {
      const T = t.array(t.number)
      assert.deepStrictEqual(T.encode([1, 2, 3]), [1, 2, 3])
    })

    it('should return the same reference while encoding isomorphic values', () => {
      const T = t.array(t.number)
      const value = [1, 2, 3]
      assert.strictEqual(T.encode(value), value)
    })

    it('should encode a prismatic value', () => {
      const T = t.array(NumberFromString)
      assert.deepStrictEqual(T.encode([1, 2, 3]), ['1', '2', '3'])
    })
  })

  it('should return the same reference if validation succeeded and nothing changed', () => {
    const T = t.array(t.number)
    const value = [1, 2, 3]
    assertStrictEqual(T.decode(value), value)
  })

  it('should return the same reference while encoding', () => {
    const T = t.array(t.number)
    assert.strictEqual(T.encode, t.identity)
  })
})
