import * as assert from 'assert'
import { fold } from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import * as t from '../../src/index'
import { assertFailure, assertStrictEqual, assertSuccess, NumberFromString } from './helpers'

describe('type', () => {
  describe('name', () => {
    it('should assign a default name', () => {
      const T = t.type({ a: t.string })
      assert.strictEqual(T.name, '{ a: string }')
    })

    it('should accept a name', () => {
      const T = t.type({ a: t.string }, 'T')
      assert.strictEqual(T.name, 'T')
    })
  })

  describe('is', () => {
    it('should return `true` on valid inputs', () => {
      const T = t.type({ a: t.string })
      assert.strictEqual(T.is({ a: 'a' }), true)
    })

    it('should return `false` on invalid inputs', () => {
      const T = t.type({ a: t.string })
      assert.strictEqual(T.is({}), false)
      assert.strictEqual(T.is({ a: 1 }), false)
      // #407
      assert.strictEqual(T.is([]), false)
    })

    // #434
    it('should return `false` on missing fields', () => {
      const T = t.type({ a: t.unknown })
      assert.strictEqual(T.is({}), false)
    })

    it('should allow additional properties', () => {
      const T = t.type({ a: t.string })
      assert.strictEqual(T.is({ a: 'a', b: 1 }), true)
    })

    it('#423', () => {
      class A {
        get a() {
          return 'a'
        }
        get b() {
          return 'b'
        }
      }
      const T = t.type({ a: t.string, b: t.string })
      assert.strictEqual(T.is(new A()), true)
    })
  })

  describe('decode', () => {
    it('should decode a isomorphic value', () => {
      const T = t.type({ a: t.string })
      assertSuccess(T.decode({ a: 'a' }))
    })

    it('should decode a prismatic value', () => {
      const T = t.type({ a: NumberFromString })
      assertSuccess(T.decode({ a: '1' }), { a: 1 })
    })

    it('should decode undefined properties as always present keys', () => {
      const T1 = t.type({ a: t.undefined })
      assertSuccess(T1.decode({ a: undefined }), { a: undefined })
      assertSuccess(T1.decode({}), { a: undefined })

      const T2 = t.type({ a: t.union([t.number, t.undefined]) })
      assertSuccess(T2.decode({ a: undefined }), { a: undefined })
      assertSuccess(T2.decode({ a: 1 }), { a: 1 })
      assertSuccess(T2.decode({}), { a: undefined })

      const T3 = t.type({ a: t.unknown })
      assertSuccess(T3.decode({}), { a: undefined })
    })

    it('should fail decoding an invalid value', () => {
      const T = t.type({ a: t.string })
      assertFailure(T, 1, ['Invalid value 1 supplied to : { a: string }'])
      assertFailure(T, {}, ['Invalid value undefined supplied to : { a: string }/a: string'])
      assertFailure(T, { a: 1 }, ['Invalid value 1 supplied to : { a: string }/a: string'])
      // #407
      assertFailure(T, [], ['Invalid value [] supplied to : { a: string }'])
    })

    it('should support the alias `interface`', () => {
      const T = t.interface({ a: t.string })
      assertSuccess(T.decode({ a: 'a' }))
    })

    it('#423', () => {
      class A {
        get a() {
          return 'a'
        }
        get b() {
          return 'b'
        }
      }
      const T = t.type({ a: t.string, b: t.string })
      assertSuccess(T.decode(new A()))
    })
  })

  describe('encode', () => {
    it('should encode a isomorphic value', () => {
      const T = t.type({ a: t.string })
      assert.deepStrictEqual(T.encode({ a: 'a' }), { a: 'a' })
    })

    it('should encode a prismatic value', () => {
      const T = t.type({ a: NumberFromString })
      assert.deepStrictEqual(T.encode({ a: 1 }), { a: '1' })
    })
  })

  it('should keep unknown properties', () => {
    const T = t.type({ a: t.string })
    const validation = T.decode({ a: 's', b: 1 })
    pipe(
      validation,
      fold(
        () => {
          assert.ok(false)
        },
        (a) => {
          assert.deepStrictEqual(a, { a: 's', b: 1 })
        }
      )
    )
  })

  it('should return the same reference if validation succeeded and nothing changed', () => {
    const T = t.type({ a: t.string })
    const value = { a: 's' }
    assertStrictEqual(T.decode(value), value)
  })

  it('should return the same reference while encoding', () => {
    const T = t.type({ a: t.number })
    assert.strictEqual(T.encode, t.identity)
  })
})
