import * as t from '../src/index'
import { assertSuccess, assertFailure, assertStrictEqual, NumberFromString } from './helpers'
import * as assert from 'assert'

describe('exact', () => {
  describe('name', () => {
    it('should assign a default name', () => {
      const T = t.exact(t.type({ foo: t.string }))
      assert.strictEqual(T.name, 'ExactType<{ foo: string }>')
    })

    it('should accept a name', () => {
      const T = t.exact(t.type({ foo: t.string }), 'Foo')
      assert.strictEqual(T.name, 'Foo')
    })
  })

  describe('is', () => {
    it('should check a isomorphic value', () => {
      const T = t.exact(t.type({ a: t.number }))
      assert.strictEqual(T.is({ a: 0 }), true)
      assert.strictEqual(T.is({ a: 0, b: 1 }), false)
      assert.strictEqual(T.is(undefined), false)
    })

    it('should check a prismatic value', () => {
      const T = t.exact(t.type({ a: NumberFromString }))
      assert.strictEqual(T.is({ a: 1 }), true)
      assert.strictEqual(T.is({ a: 1, b: 1 }), false)
      assert.strictEqual(T.is(undefined), false)
    })
  })

  describe('decode', () => {
    it('should succeed validating a valid value (type)', () => {
      const T = t.exact(t.type({ foo: t.string }))
      assertSuccess(T.decode({ foo: 'foo' }))
    })

    it('should succeed validating a valid value (partial)', () => {
      const T = t.exact(t.partial({ foo: t.string }))
      assertSuccess(T.decode({ foo: 'foo' }))
      assertSuccess(T.decode({ foo: undefined }))
      assertSuccess(T.decode({}))
    })

    it('should succeed validating a valid value (intersection)', () => {
      const T = t.exact(t.intersection([t.type({ foo: t.string }), t.partial({ bar: t.number })]))
      assertSuccess(T.decode({ foo: 'foo', bar: 1 }))
      assertSuccess(T.decode({ foo: 'foo', bar: undefined }))
      assertSuccess(T.decode({ foo: 'foo' }))
    })

    it('should succeed validating a valid value (refinement)', () => {
      const T = t.exact(t.refinement(t.type({ foo: t.string }), p => p.foo.length > 2))
      assertSuccess(T.decode({ foo: 'foo' }))
    })

    it('should succeed validating a valid value (readonly)', () => {
      const T = t.exact(t.readonly(t.type({ foo: t.string })))
      assertSuccess(T.decode({ foo: 'foo' }))
    })

    it('should succeed validating an undefined field', () => {
      const T = t.exact(t.type({ foo: t.string, bar: t.union([t.string, t.undefined]) }))
      assertSuccess(T.decode({ foo: 'foo' }))
    })

    it('should return the same reference if validation succeeded', () => {
      const T = t.exact(t.type({ foo: t.string }))
      const value = { foo: 'foo' }
      assertStrictEqual(T.decode(value), value)
    })

    it('should fail validating an invalid value (type)', () => {
      const T = t.exact(t.type({ foo: t.string }))
      assertFailure(T, null, ['Invalid value null supplied to : ExactType<{ foo: string }>'])
      assertFailure(T, undefined, ['Invalid value undefined supplied to : ExactType<{ foo: string }>'])
      assertFailure(T, 1, ['Invalid value 1 supplied to : ExactType<{ foo: string }>'])
      assertFailure(T, {}, ['Invalid value undefined supplied to : ExactType<{ foo: string }>/foo: string'])
    })

    it('should strip additional properties (type)', () => {
      const T = t.exact(t.type({ foo: t.string }))
      assertSuccess(T.decode({ foo: 'foo', bar: 1, baz: true }), { foo: 'foo' })
    })

    it('should fail validating an invalid value (partial)', () => {
      const T = t.exact(t.partial({ foo: t.string }))
      assertFailure(T, null, ['Invalid value null supplied to : ExactType<Partial<{ foo: string }>>'])
    })

    it('should strip additional properties (partial)', () => {
      const T = t.exact(t.partial({ foo: t.string }))
      assertSuccess(T.decode({ bar: 1 }), {})
    })

    it('should fail validating an invalid value (intersection)', () => {
      const T = t.exact(t.intersection([t.type({ foo: t.string }), t.partial({ bar: t.number })]))
      assertFailure(T, null, [
        'Invalid value null supplied to : ExactType<({ foo: string } & Partial<{ bar: number }>)>'
      ])
    })

    it('should strip additional properties (intersection)', () => {
      const T = t.exact(t.intersection([t.type({ foo: t.string }), t.partial({ bar: t.number })]))
      assertSuccess(T.decode({ foo: 'foo', baz: true }), { foo: 'foo' })
    })

    it('should fail validating an invalid value (refinement)', () => {
      const T = t.exact(t.refinement(t.type({ foo: t.string }), p => p.foo.length > 2))
      assertFailure(T, null, ['Invalid value null supplied to : ExactType<({ foo: string } | <function1>)>'])
      assertFailure(T, { foo: 'a' }, [
        'Invalid value {"foo":"a"} supplied to : ExactType<({ foo: string } | <function1>)>'
      ])
    })

    it('should strip additional properties (refinement)', () => {
      const T = t.exact(t.refinement(t.type({ foo: t.string }), p => p.foo.length > 2))
      assertSuccess(T.decode({ foo: 'foo', bar: 1 }), { foo: 'foo' })
    })

    it('should fail validating an invalid value (readonly)', () => {
      const T = t.exact(t.readonly(t.type({ foo: t.string })))
      assertFailure(T, null, ['Invalid value null supplied to : ExactType<Readonly<{ foo: string }>>'])
    })

    it('should strip additional properties (readonly)', () => {
      const T = t.exact(t.readonly(t.type({ foo: t.string })))
      assertSuccess(T.decode({ foo: 'foo', bar: 1 }), { foo: 'foo' })
    })
  })

  describe('encode', () => {
    it('should encode a prismatic value', () => {
      const T = t.exact(t.type({ a: NumberFromString }))
      assert.deepEqual(T.encode({ a: 1 }), { a: '1' })
    })

    it('should return the same reference while encoding', () => {
      const T = t.exact(t.type({ a: t.number }))
      assert.strictEqual(T.encode, t.identity)
    })
  })
})
