import * as assert from 'assert'
import * as t from '../src/index'
import * as _ from '../src/Decoder'
import { isLeft } from 'fp-ts/lib/Either'

describe('enum', () => {
  enum A {
    Foo = 'foo',
    Bar = 'bar'
  }

  enum B {
    Foo,
    Bar
  }

  describe('name', () => {
    it('should assign a default name', () => {
      const T = t.enum(A)
      assert.strictEqual(T.name, 'enum')
    })

    it('should accept a name', () => {
      const T = t.enum(A, 'T')
      assert.strictEqual(T.name, 'T')
    })
  })

  describe('is', () => {
    it('should check an enum string value', () => {
      const T = t.enum(A)
      assert.strictEqual(T.is(A.Foo), true)
      assert.strictEqual(T.is('bar'), true)
      assert.strictEqual(T.is('invalid'), false)
      assert.strictEqual(T.is(null), false)
      assert.strictEqual(T.is(A), false)
    })

    it('should check an enum integer value', () => {
      const T = t.enum(B)
      assert.strictEqual(T.is(B.Foo), true)
      assert.strictEqual(T.is(1), true)
      assert.strictEqual(T.is('Foo'), false)
      assert.strictEqual(T.is('invalid'), false)
      assert.strictEqual(T.is(null), false)
      assert.strictEqual(T.is(B), false)
    })
  })

  describe('decode', () => {
    it('should decode an enum string value', () => {
      const T = t.enum(A)
      assert.deepStrictEqual(T.decode(A.Foo), _.success(A.Foo))
      assert.deepStrictEqual(T.decode('bar'), _.success('bar'))
    })

    it('should decode an enum integer value', () => {
      const T = t.enum(B)
      assert.deepStrictEqual(T.decode(B.Foo), _.success(B.Foo))
      assert.deepStrictEqual(T.decode(1), _.success(1))
    })

    it('should fail decoding an invalid string value', () => {
      const T = t.enum(A)
      assert.deepStrictEqual(isLeft(T.decode('invalid')), true)
    })

    it('should fail decoding an invalid integer value', () => {
      const T = t.enum(B)
      assert.deepStrictEqual(isLeft(T.decode(2)), true)
    })
  })

  describe('encode', () => {
    it('should encode an enum string value', () => {
      const T = t.enum(A)
      assert.deepStrictEqual(T.encode(A.Foo), A.Foo)
    })

    it('should encode an enum integer value', () => {
      const T = t.enum(B)
      assert.deepStrictEqual(T.encode(B.Foo), B.Foo)
    })
  })
})
