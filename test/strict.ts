import * as t from '../src/index'
import { assertSuccess, assertFailure, assertStrictEqual, NumberFromString } from './helpers'
import * as assert from 'assert'

describe('strict', () => {
  describe('name', () => {
    it('should assign a default name', () => {
      const T = t.strict({ foo: t.string })
      assert.strictEqual(T.name, '{| foo: string |}')
    })

    it('should accept a name', () => {
      const T = t.strict({ foo: t.string }, 'Foo')
      assert.strictEqual(T.name, 'Foo')
    })
  })

  describe('is', () => {
    it('should check a isomorphic value', () => {
      const T = t.strict({ a: t.number })
      assert.strictEqual(T.is({ a: 0 }), true)
      assert.strictEqual(T.is({ a: 0, b: 1 }), true)
      assert.strictEqual(T.is(undefined), false)
    })

    it('should check a prismatic value', () => {
      const T = t.strict({ a: NumberFromString })
      assert.strictEqual(T.is({ a: 1 }), true)
      assert.strictEqual(T.is({ a: 1, b: 1 }), true)
      assert.strictEqual(T.is(undefined), false)
    })

    it('should allow properties to be satisified by getters - #423', () => {
      class A {
        get a() {
          return 'a'
        }
        get b() {
          return 'b'
        }
      }
      const T = t.strict({ a: t.string, b: t.string })
      assert.strictEqual(T.is(new A()), true)
    })
  })

  describe('decode', () => {
    it('should succeed validating a valid value', () => {
      const T = t.strict({ foo: t.string })
      assertSuccess(T.decode({ foo: 'foo' }))
    })

    it('should succeed validating an undefined field', () => {
      const T = t.strict({ foo: t.string, bar: t.union([t.string, t.undefined]) })
      assertSuccess(T.decode({ foo: 'foo', bar: undefined }))
    })

    it('should return the same reference if validation succeeded', () => {
      const T = t.strict({ foo: t.string })
      const value = { foo: 'foo' }
      assertStrictEqual(T.decode(value), value)
    })

    it('should fail validating an invalid value', () => {
      const T = t.strict({ foo: t.string })
      assertFailure(T, { foo: 1 }, ['Invalid value 1 supplied to : {| foo: string |}/foo: string'])
    })

    it('should strip additional properties', () => {
      const T = t.strict({ foo: t.string })
      assertSuccess(T.decode({ foo: 'foo', bar: 1, baz: true }), { foo: 'foo' })
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
      const T = t.strict({ a: t.string, b: t.string })
      assertSuccess(T.decode(new A()))
    })
  })

  describe('encode', () => {
    it('should encode a prismatic value', () => {
      const T = t.strict({ a: NumberFromString })
      assert.deepStrictEqual(T.encode({ a: 1 }), { a: '1' })
    })

    it('should return the same reference while encoding', () => {
      const T = t.strict({ a: t.string })
      const x = { a: 'a' }
      assert.strictEqual(T.encode(x), x)
    })
  })

  it('should export a StrictType class', () => {
    // tslint:disable-next-line: deprecation
    const T = new t.StrictType<{}, {}, {}, unknown>(
      'name',
      (_): _ is {} => true,
      (u, c) => t.failure(u, c),
      t.identity,
      {}
    )
    assert.strictEqual(T.name, 'name')
  })
})
