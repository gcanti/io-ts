import * as assert from 'assert'
import * as t from '../src/index'
import { assertSuccess, assertFailure, assertStrictEqual, IntegerFromString, NumberFromString } from './helpers'

describe('refinement', () => {
  describe('name', () => {
    it('should assign a default name', () => {
      // tslint:disable-next-line: deprecation
      const T = t.refinement(t.number, n => n >= 0)
      assert.strictEqual(T.name, '(number | <function1>)')
    })

    it('should accept a name', () => {
      // tslint:disable-next-line: deprecation
      const T = t.refinement(t.number, n => n >= 0, 'T')
      assert.strictEqual(T.name, 'T')
    })
  })

  describe('is', () => {
    it('should check a isomorphic value', () => {
      // tslint:disable-next-line: deprecation
      const T = t.Integer
      assert.strictEqual(T.is(1.2), false)
      assert.strictEqual(T.is('a'), false)
      assert.strictEqual(T.is(1), true)
    })

    it('should check a prismatic value', () => {
      // tslint:disable-next-line: deprecation
      const T = t.refinement(NumberFromString, n => n % 1 === 0)
      assert.strictEqual(T.is(1.2), false)
      assert.strictEqual(T.is('a'), false)
      assert.strictEqual(T.is(1), true)
    })
  })

  describe('decode', () => {
    it('should succeed validating a valid value', () => {
      // tslint:disable-next-line: deprecation
      const T = t.refinement(t.number, n => n >= 0)
      assertSuccess(T.decode(0))
      assertSuccess(T.decode(1))
    })

    it('should return the same reference if validation succeeded', () => {
      // tslint:disable-next-line: deprecation
      const T = t.refinement(t.Dictionary, () => true)
      const value = {}
      assertStrictEqual(T.decode(value), value)
    })

    it('should fail validating an invalid value', () => {
      // tslint:disable-next-line: deprecation
      const T = t.Integer
      assertFailure(T, 'a', ['Invalid value "a" supplied to : Integer'])
      assertFailure(T, 1.2, ['Invalid value 1.2 supplied to : Integer'])
    })

    it('should fail with the last deserialized value', () => {
      const T = IntegerFromString
      assertFailure(T, 'a', ['cannot parse to a number'])
      assertFailure(T, '1.2', ['Invalid value 1.2 supplied to : IntegerFromString'])
    })
  })

  describe('encode', () => {
    it('should encode a prismatic value', () => {
      // tslint:disable-next-line: deprecation
      const T = t.refinement(t.array(NumberFromString), () => true)
      assert.deepStrictEqual(T.encode([1]), ['1'])
    })

    it('should return the same reference while encoding', () => {
      // tslint:disable-next-line: deprecation
      const T = t.refinement(t.array(t.number), () => true)
      assert.strictEqual(T.encode, t.identity)
    })
  })
})
