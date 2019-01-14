import * as assert from 'assert'
import * as t from '../src/index'
import { assertFailure, assertStrictEqual, assertSuccess, NumberFromString } from './helpers'

describe('union', () => {
  describe('name', () => {
    it('should assign a default name', () => {
      const T = t.union([t.string, t.number])
      assert.strictEqual(T.name, '(string | number)')
    })

    it('should accept a name', () => {
      const T = t.union([t.string, t.number], 'T')
      assert.strictEqual(T.name, 'T')
    })
  })

  describe('is', () => {
    it('should check a isomorphic value', () => {
      const T = t.union([t.string, t.number])
      assert.strictEqual(T.is(0), true)
      assert.strictEqual(T.is('foo'), true)
      assert.strictEqual(T.is(true), false)
    })

    it('should check a prismatic value', () => {
      const T = t.union([t.string, NumberFromString])
      assert.strictEqual(T.is(0), true)
      assert.strictEqual(T.is('foo'), true)
      assert.strictEqual(T.is(true), false)
    })
  })

  describe('decode', () => {
    it('should decode a isomorphic value', () => {
      const T1 = t.union([t.string] as any)
      assertSuccess(T1.decode('s'))
      const T2 = t.union([t.string, t.number])
      assertSuccess(T2.decode('s'))
      assertSuccess(T2.decode(1))
    })

    it('should fail decoding an invalid value', () => {
      const T0 = t.union([] as any)
      assertFailure(T0.decode(true), ['Invalid value true supplied to : ()'])
      const T1 = t.union([t.string] as any)
      assertFailure(T1.decode(true), ['Invalid value true supplied to : (string)/0: string'])
      const T2 = t.union([t.string, t.number])
      assertFailure(T2.decode(true), [
        'Invalid value true supplied to : (string | number)/0: string',
        'Invalid value true supplied to : (string | number)/1: number'
      ])
    })
  })

  describe('encode', () => {
    it('should encode a prismatic value', () => {
      const T1 = t.union([t.interface({ a: NumberFromString }), t.number])
      assert.deepEqual(T1.encode({ a: 1 }), { a: '1' })
      assert.strictEqual(T1.encode(1), 1)
    })
  })

  it('should encode a nullary union', () => {
    const T0 = t.union([] as any)
    assert.strictEqual(T0.encode(1 as never), 1)
  })

  it('should return the same reference if validation succeeded', () => {
    const T = t.union([t.Dictionary, t.number])
    const value = {}
    assertStrictEqual(T.decode(value), value)
  })

  it('should return the same reference while encoding', () => {
    const T = t.union([t.type({ a: t.number }), t.string])
    assert.strictEqual(T.encode, t.identity)
  })
})
