import * as assert from 'assert'
import { fold } from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import * as t from '../../src/index'
import { asOptional, assertFailure, assertStrictEqual, assertSuccess, NumberFromString, withDefault } from './helpers'

describe('type', () => {
  describe('name', () => {
    it('should assign a default name', () => {
      const T = t.semiPartial({ a: t.string, b: asOptional(t.string) })
      assert.strictEqual(T.name, '{ a: string, b?: string }')
    })

    it('should accept a name', () => {
      const T = t.type({ a: t.string }, 'T')
      assert.strictEqual(T.name, 'T')
    })
  })

  describe('is', () => {
    it('should return `true` on valid inputs', () => {
      const T = t.semiPartial({ a: t.string, b: asOptional(t.string) })
      assert.strictEqual(T.is({ a: 'a' }), true)
      assert.strictEqual(T.is({ a: 'a', b: 'b' }), true)
    })

    it('should return `false` on invalid inputs', () => {
      const T = t.semiPartial({ a: t.string, b: asOptional(t.string) })
      assert.strictEqual(T.is({}), false)
      assert.strictEqual(T.is({ a: 1 }), false)
      assert.strictEqual(T.is({ b: 'b' }), false)
      assert.strictEqual(T.is([]), false)
    })

    it('should return `false` on missing fields', () => {
      const T = t.semiPartial({ a: t.unknown })
      assert.strictEqual(T.is({}), false)
    })

    it('should allow additional properties', () => {
      const T = t.semiPartial({ a: t.string, b: asOptional(t.string) })
      assert.strictEqual(T.is({ a: 'a', b: 'b', c: 'c' }), true)
    })

    it('should work for classes with getters', () => {
      class A {
        get a() {
          return 'a'
        }
        get b() {
          return 'b'
        }
      }
      class B {
        get a() {
          return 'a'
        }
      }
      class C {
        get b() {
          return 'b'
        }
      }
      const T = t.semiPartial({ a: t.string, b: asOptional(t.string) })
      assert.strictEqual(T.is(new A()), true)
      assert.strictEqual(T.is(new B()), true)
      assert.strictEqual(T.is(new C()), false)
    })
  })

  describe('decode', () => {
    it('should decode a isomorphic value', () => {
      const T = t.semiPartial({ a: t.string, b: asOptional(t.string) })
      assertSuccess(T.decode({ a: 'a' }))
      assertSuccess(T.decode({ a: 'a', b: 'b' }))
    })

    it('should decode a prismatic value', () => {
      const T = t.semiPartial({ a: NumberFromString, b: asOptional(NumberFromString) })
      assertSuccess(T.decode({ a: '1' }), { a: 1 })
      assertSuccess(T.decode({ a: '1', b: '2' }), { a: 1, b: 2 })
    })

    it('should decode undefined properties as always present keys when required', () => {
      const T1 = t.semiPartial({ a: t.undefined })
      assertSuccess(T1.decode({ a: undefined }), { a: undefined })
      assertSuccess(T1.decode({}), { a: undefined })

      const T2 = t.semiPartial({ a: t.union([t.number, t.undefined]) })
      assertSuccess(T2.decode({ a: undefined }), { a: undefined })
      assertSuccess(T2.decode({ a: 1 }), { a: 1 })
      assertSuccess(T2.decode({}), { a: undefined })

      const T3 = t.semiPartial({ a: t.unknown })
      assertSuccess(T3.decode({}), { a: undefined })
    })

    it('should decode undefined properties as missing keys when optional and omitted', () => {
      const T1 = t.semiPartial({ a: { type: t.undefined, optional: true } })
      assertSuccess(T1.decode({ a: undefined }), { a: undefined })
      assertSuccess(T1.decode({}), {})

      const T2 = t.semiPartial({ a: { type: t.union([t.number, t.undefined]), optional: true } })
      assertSuccess(T2.decode({ a: undefined }), { a: undefined })
      assertSuccess(T2.decode({ a: 1 }), { a: 1 })
      assertSuccess(T2.decode({}), {})

      const T3 = t.semiPartial({ a: { type: t.unknown, optional: true } })
      assertSuccess(T3.decode({}), {})
    })

    it('should fail decoding an invalid value', () => {
      const T = t.semiPartial({ a: t.string, b: asOptional(t.string) })
      assertFailure(T, 1, ['Invalid value 1 supplied to : { a: string, b?: string }'])
      assertFailure(T, {}, ['Invalid value undefined supplied to : { a: string, b?: string }/a: string'])
      assertFailure(T, { a: 1 }, ['Invalid value 1 supplied to : { a: string, b?: string }/a: string'])
      assertFailure(T, [], ['Invalid value [] supplied to : { a: string, b?: string }'])
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
      const T = t.semiPartial({ a: t.string, b: t.string })
      assertSuccess(T.decode(new A()))
    })

    it('should support default values', () => {
      const T = t.semiPartial({
        name: withDefault(t.string, 'foo')
      })
      assertSuccess(T.decode({}), { name: 'foo' })
      assertSuccess(T.decode({ name: 'a' }), { name: 'a' })
    })
  })

  describe('encode', () => {
    it('should encode a isomorphic value', () => {
      const T = t.semiPartial({ a: t.string, b: asOptional(t.string) })
      assert.deepStrictEqual(T.encode({ a: 'a' }), { a: 'a' })
      assert.deepStrictEqual(T.encode({ a: 'a', b: 'b' }), { a: 'a', b: 'b' })
    })

    it('should encode a prismatic value', () => {
      const T = t.semiPartial({ a: NumberFromString, b: { type: NumberFromString, optional: true } })
      assert.deepStrictEqual(T.encode({ a: 1 }), { a: '1' })
      assert.deepStrictEqual(T.encode({ a: 1, b: 2 }), { a: '1', b: '2' })
    })
  })

  it('should keep unknown properties', () => {
    const T = t.semiPartial({ a: t.string })
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
    const T = t.semiPartial({ a: t.string, b: asOptional(t.string) })
    const value1 = { a: 's' }
    assertStrictEqual(T.decode(value1), value1)
    const value2 = { a: 's', b: 't' }
    assertStrictEqual(T.decode(value2), value2)
  })

  it('should return the same reference while encoding', () => {
    const T = t.semiPartial({ a: t.string, b: asOptional(t.string) })
    assert.strictEqual(T.encode, t.identity)
  })

  it('should work for empty object', () => {
    const T = t.semiPartial({})
    assert.deepStrictEqual(T.encode({}), {})
    assert.deepStrictEqual(T.decode({}), t.success({}))
    assert.strictEqual(T.is({}), true)
  })

  it('should work for an object with all required properties', () => {
    const type = t.semiPartial({
      p1: t.string,
      p2: {
        type: t.string
      },
      p3: {
        type: t.string,
        optional: false
      }
    })
    const obj = {
      p1: 'p1',
      p2: 'p2',
      p3: 'p3'
    }
    assert.deepStrictEqual(type.encode(obj), {
      p1: 'p1',
      p2: 'p2',
      p3: 'p3'
    })
    assert.deepStrictEqual(
      type.decode(obj),
      t.success({
        p1: 'p1',
        p2: 'p2',
        p3: 'p3'
      })
    )
    assert.strictEqual(type.is(obj), true)
    assert.strictEqual(type.is({}), false)
    assert.strictEqual(type.is({ p1: 'p1' }), false)
  })

  it('should work for an object with all optional properties', () => {
    const type = t.semiPartial(
      {
        p1: {
          type: t.string,
          optional: true
        },
        p2: {
          type: t.string,
          optional: true
        }
      },
      'Required'
    )
    const obj = {
      p1: 'p1',
      p2: 'p2'
    }
    assert.deepStrictEqual(type.encode(obj), {
      p1: 'p1',
      p2: 'p2'
    })
    assert.deepStrictEqual(
      type.decode(obj),
      t.success({
        p1: 'p1',
        p2: 'p2'
      })
    )
    assert.strictEqual(type.is(obj), true)
    assert.strictEqual(type.is({}), true)
    assert.strictEqual(type.is({ p1: 'p1' }), true)
  })

  it('should work for an object with a mix of optional and required props', () => {
    const type = t.semiPartial(
      {
        p1: {
          type: t.string,
          optional: false
        },
        p2: {
          type: t.string,
          optional: true
        },
        p3: {
          type: t.string,
          optional: false
        },
        p4: {
          type: t.string,
          optional: true
        }
      },
      'Required'
    )
    const obj = {
      p1: 'p1',
      p2: 'p2',
      p3: 'p3',
      p4: 'p4'
    }
    expect(type.encode(obj)).toEqual(obj)
    expect(type.decode(obj)).toEqual(t.success(obj))
    assert.strictEqual(type.is(obj), true)
    assert.strictEqual(type.is({}), false)
    assert.strictEqual(type.is({ p1: 'p1', p2: 'p2' }), false)
    assert.strictEqual(type.is({ p2: 'p2', p4: 'p4' }), false)
    assert.strictEqual(type.is({ p1: 'p1', p3: 'p3' }), true)
    assert.strictEqual(type.is({ p1: 'p1', p2: 'p2', p3: 'p3' }), true)
  })
})
