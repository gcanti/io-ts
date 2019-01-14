import * as assert from 'assert'
import * as t from '../src/index'
import { assertSuccess, assertFailure, NumberFromString } from './helpers'

describe('readonlyArray', () => {
  describe('name', () => {
    it('should assign a default name', () => {
      const T = t.readonlyArray(t.number)
      assert.strictEqual(T.name, 'ReadonlyArray<number>')
    })

    it('should accept a name', () => {
      const T = t.readonlyArray(t.number, 'T2')
      assert.strictEqual(T.name, 'T2')
    })
  })

  describe('is', () => {
    it('should check a isomorphic value', () => {
      const T = t.readonlyArray(t.number)
      assert.strictEqual(T.is([]), true)
      assert.strictEqual(T.is([0]), true)
      assert.strictEqual(T.is([0, 'foo']), false)
      assert.strictEqual(T.is(undefined), false)
    })

    it('should check a prismatic value', () => {
      const T = t.readonlyArray(NumberFromString)
      assert.strictEqual(T.is([]), true)
      assert.strictEqual(T.is([1]), true)
      assert.strictEqual(T.is([1, 'foo']), false)
      assert.strictEqual(T.is(undefined), false)
    })
  })

  describe('decode', () => {
    it('should succeed validating a valid value', () => {
      const T = t.readonlyArray(t.number)
      assertSuccess(T.decode([1]))
    })

    it('should fail validating an invalid value', () => {
      const T = t.readonlyArray(t.number)
      assertFailure(T.decode(['s']), ['Invalid value "s" supplied to : ReadonlyArray<number>/0: number'])
    })

    it('should freeze the value', () => {
      const T = t.readonlyArray(t.number)
      T.decode([1]).map(x => assert.ok(Object.isFrozen(x)))
    })

    it('should not freeze in production', () => {
      const env = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      const T = t.readonlyArray(t.number)
      T.decode([1]).map(x => assert.ok(!Object.isFrozen(x)))
      process.env.NODE_ENV = env
    })
  })

  describe('encode', () => {
    it('should encode a prismatic value', () => {
      const T = t.readonlyArray(NumberFromString)
      assert.deepEqual(T.encode([0, 1]), ['0', '1'])
    })

    it('should return the same reference when serializing', () => {
      const T = t.readonlyArray(t.number)
      assert.strictEqual(T.encode, t.identity)
    })
  })
})
