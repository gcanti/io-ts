import * as assert from 'assert'
import * as t from '../src/index'
import {
  assertFailure,
  assertStrictEqual,
  assertStrictSuccess,
  assertSuccess,
  HyphenatedString,
  NumberFromString
} from './helpers'

describe('dictionary', () => {
  describe('name', () => {
    it('should assign a default name', () => {
      const T = t.dictionary(t.string, t.number)
      assert.strictEqual(T.name, '{ [K in string]: number }')
    })

    it('should accept a name', () => {
      const T = t.dictionary(t.string, t.number, 'T')
      assert.strictEqual(T.name, 'T')
    })
  })

  describe('is', () => {
    it('should check a isomorphic value', () => {
      const T = t.dictionary(t.string, t.number)
      assert.strictEqual(T.is({}), true)
      assert.strictEqual(T.is({ a: 1 }), true)
      assert.strictEqual(T.is({ a: 'a' }), false)
      assert.strictEqual(T.is(null), false)
      assert.strictEqual(T.is([]), false)
    })

    it('should check a prismatic value', () => {
      const T = t.dictionary(t.string, NumberFromString)
      assert.strictEqual(T.is({}), true)
      assert.strictEqual(T.is({ a: 1 }), true)
      assert.strictEqual(T.is({ a: 'a' }), false)
      assert.strictEqual(T.is(null), false)
      assert.strictEqual(T.is([]), false)
    })

    it('should check a prismatic key', () => {
      const T = t.dictionary(HyphenatedString, t.number)
      assert.strictEqual(T.is({}), true)
      assert.strictEqual(T.is({ 'a-a': 1 }), true)
      assert.strictEqual(T.is({ aa: 1 }), false)
    })

    it('should accept an array if the codomain is `unknown`', () => {
      const T = t.dictionary(t.string, t.unknown)
      assert.strictEqual(T.is([]), true)
    })

    it('should accept an array if the codomain is `any`', () => {
      const T = t.dictionary(t.string, t.any)
      assert.strictEqual(T.is([]), true)
    })
  })

  describe('decode', () => {
    it('should decode a isomorphic value', () => {
      const T = t.dictionary(t.string, t.number)
      assertSuccess(T.decode({}))
      assertSuccess(T.decode({ a: 1 }))
    })

    it('should return the same reference while decoding isomorphic values', () => {
      const T = t.dictionary(t.string, t.number)
      const value1 = { a: 1 }
      assertStrictSuccess(T.decode(value1), value1)
    })

    it('should decode a prismatic value', () => {
      const T = t.dictionary(t.string, NumberFromString)
      assertSuccess(T.decode({ a: '1' }), { a: 1 })
    })

    it('should decode a prismatic key', () => {
      const T = t.dictionary(HyphenatedString, t.number)
      assertSuccess(T.decode({ ab: 1 }), { 'a-b': 1 })
    })

    it('should accept an array if the codomain is `unknown`', () => {
      const T = t.dictionary(t.string, t.unknown)
      assertSuccess(T.decode([1]))
    })

    it('should accept an array if the codomain is `any`', () => {
      const T = t.dictionary(t.string, t.any)
      assertSuccess(T.decode([1]))
    })

    it('should fail decoding an invalid value', () => {
      const T = t.dictionary(t.string, t.number)
      assertFailure(T.decode(1), ['Invalid value 1 supplied to : { [K in string]: number }'])
      assertFailure(T.decode({ aa: 's' }), ['Invalid value "s" supplied to : { [K in string]: number }/aa: number'])
      assertFailure(T.decode([]), ['Invalid value [] supplied to : { [K in string]: number }'])
      assertFailure(T.decode([1]), ['Invalid value [1] supplied to : { [K in string]: number }'])
      assertFailure(T.decode(new Number()), ['Invalid value 0 supplied to : { [K in string]: number }'])
    })

    it('should fail decoding an invalid value when the codec is array if the codomain is `unknown`', () => {
      const T = t.dictionary(HyphenatedString, t.unknown)
      assertFailure(T.decode([1]), [
        'Invalid value "0" supplied to : { [K in HyphenatedString]: unknown }/0: HyphenatedString'
      ])
    })

    it('should fail decoding an invalid value when the codec is array if the codomain is `any`', () => {
      const T = t.dictionary(HyphenatedString, t.any)
      assertFailure(T.decode([1]), [
        'Invalid value "0" supplied to : { [K in HyphenatedString]: any }/0: HyphenatedString'
      ])
    })

    it('should support literals as domain type', () => {
      const T = t.dictionary(t.literal('foo'), t.string)
      assertSuccess(T.decode({ foo: 'bar' }))
      assertFailure(T.decode({ foo: 'bar', baz: 'bob' }), [
        'Invalid value "baz" supplied to : { [K in "foo"]: string }/baz: "foo"'
      ])
    })

    it('should support keyof as domain type', () => {
      const T = t.dictionary(t.keyof({ foo: true, bar: true }), t.string)
      assertSuccess(T.decode({ foo: 'bar' }))
      assertFailure(T.decode({ foo: 'bar', baz: 'bob' }), [
        'Invalid value "baz" supplied to : { [K in "foo" | "bar"]: string }/baz: "foo" | "bar"'
      ])
    })
  })

  describe('encode', () => {
    it('should encode a isomorphic value', () => {
      const T = t.dictionary(t.string, t.number)
      assert.deepEqual(T.encode({ a: 1 }), { a: 1 })
    })

    it('should return the same reference while decoding a isomorphic value', () => {
      const T = t.dictionary(t.string, t.number)
      const a = { a: 1 }
      assert.strictEqual(T.encode(a), a)
    })

    it('should encode a prismatic value', () => {
      const T = t.dictionary(t.string, NumberFromString)
      assert.deepEqual(T.encode({ a: 1 }), { a: '1' })
    })

    it('should encode a prismatic key', () => {
      const T = t.dictionary(HyphenatedString, t.number)
      assert.deepEqual(T.encode({ 'a-b': 1 }), { ab: 1 })
    })

    it('should accept an array if the codomain is `unknown`', () => {
      const T = t.dictionary(t.string, t.unknown)
      const a = [1]
      assert.strictEqual(T.encode(a), a)
    })

    it('should accept an array if the codomain is `any`', () => {
      const T = t.dictionary(t.string, t.any)
      const a = [1]
      assert.strictEqual(T.encode(a), a)
    })
  })

  it('should return the same reference if validation succeeded if nothing changed', () => {
    const T1 = t.dictionary(t.string, t.number)
    const value1 = { aa: 1 }
    assertStrictEqual(T1.decode(value1), value1)
    const T2 = t.dictionary(t.refinement(t.string, s => s.length >= 2), t.number)
    const value2 = { aa: 1 }
    assertStrictEqual(T2.decode(value2), value2)
  })

  it('should return the same reference while encoding', () => {
    const T1 = t.dictionary(t.string, t.number)
    assert.strictEqual(T1.encode, t.identity)
    const T2 = t.dictionary(HyphenatedString, t.number)
    assert.strictEqual(T2.encode === t.identity, false)
  })
})
