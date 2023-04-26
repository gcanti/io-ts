import * as assert from 'assert'

import * as t from '../../src/index'
import { assertFailure, assertSuccess } from './helpers'

describe.concurrent('keyof', () => {
  describe.concurrent('name', () => {
    it('should assign a default name', () => {
      const T = t.keyof({ a: 1, b: 2 })
      assert.strictEqual(T.name, '"a" | "b"')
    })

    it('should accept a name', () => {
      const T = t.keyof({ a: 1, b: 2 }, 'T')
      assert.strictEqual(T.name, 'T')
    })
  })

  describe.concurrent('is', () => {
    it('should check a isomorphic value', () => {
      const T = t.keyof({ a: 1, b: 2 })
      assert.strictEqual(T.is(null), false)
      assert.strictEqual(T.is('a'), true)
      assert.strictEqual(T.is('b'), true)
      assert.strictEqual(T.is('c'), false)
    })
  })

  describe.concurrent('decode', () => {
    it('should decode a isomorphic value', () => {
      const T = t.keyof({ a: 1, b: 2 })
      assertSuccess(T.decode('a'))
      assertSuccess(T.decode('b'))
    })

    it('should fail decoding an invalid value', () => {
      const T = t.keyof({ a: 1, b: 2 })
      assertFailure(T, 'c', ['Invalid value "c" supplied to : "a" | "b"'])
      // check for hasOwnProperty oddity: { a: 1 }.hasOwnProperty(['a'] as any) === true
      assertFailure(T, ['a'], ['Invalid value ["a"] supplied to : "a" | "b"'])
    })
  })

  it('should return the same reference while encoding', () => {
    const T = t.keyof({ a: 1, b: 2 })
    assert.strictEqual(T.encode, t.identity)
  })
})
