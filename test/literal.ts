import * as assert from 'assert'
import * as t from '../src/index'
import { assertSuccess, assertFailure } from './helpers'

describe('literal', () => {
  describe('name', () => {
    it('should assign a default name', () => {
      const T = t.literal('a')
      assert.strictEqual(T.name, '"a"')
    })

    it('should accept a name', () => {
      const T = t.literal('a', 'T')
      assert.strictEqual(T.name, 'T')
    })
  })

  describe('is', () => {
    it('should check a isomorphic value', () => {
      const T = t.literal('a')
      assert.strictEqual(T.is('a'), true)
      assert.strictEqual(T.is('b'), false)
    })
  })

  describe('decode', () => {
    it('should decode a isomorphic value', () => {
      const T = t.literal('a')
      assertSuccess(T.decode('a'))
    })

    it('should fail validating an invalid value', () => {
      const T = t.literal('a')
      assertFailure(T.decode(1), ['Invalid value 1 supplied to : "a"'])
    })
  })

  describe('encode', () => {
    it('should encode a isomorphic value', () => {
      const T = t.literal('a')
      assert.strictEqual(T.encode('a'), 'a')
    })
  })

  it('should return the same reference while encoding', () => {
    const T = t.literal('a')
    assert.strictEqual(T.encode, t.identity)
  })
})
