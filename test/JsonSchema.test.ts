import * as assert from 'assert'
import Ajv from 'ajv'
import * as J from './JsonSchema'
import * as C from 'fp-ts/lib/Const'
import { pipe } from 'fp-ts/lib/pipeable'

const ajv = new Ajv()

describe('JsonSchema', () => {
  it('literal', () => {
    const validate = ajv.compile(J.literal('a').compile())
    assert.strictEqual(validate('a'), true)
    assert.strictEqual(validate(1), false)
  })

  it('string', () => {
    const validate = ajv.compile(J.string.compile())
    assert.strictEqual(validate('a'), true)
    assert.strictEqual(validate(1), false)
  })

  it('boolean', () => {
    const validate = ajv.compile(J.boolean.compile())
    assert.strictEqual(validate(true), true)
    assert.strictEqual(validate(1), false)
  })

  it('UnknownArray', () => {
    const validate = ajv.compile(J.UnknownArray.compile())
    assert.strictEqual(validate([]), true)
    assert.strictEqual(validate([1, 2, 3]), true)
    assert.strictEqual(validate(1), false)
    assert.strictEqual(validate([1, undefined, 3]), true)
  })

  it('UnknownRecord', () => {
    const validate = ajv.compile(J.UnknownRecord.compile())
    assert.strictEqual(validate({}), true)
    assert.strictEqual(validate({ a: 'a', b: 1 }), true)
    assert.strictEqual(validate(1), false)
    assert.strictEqual(validate({ a: 'a', b: 1, c: undefined }), true)
  })

  it('struct', () => {
    const schema = J.struct({ a: J.string, b: J.number }).compile()
    const validate = ajv.compile(schema)
    assert.strictEqual(validate({ a: 'a', b: 1 }), true)
    assert.strictEqual(validate({ a: 'a' }), false)
    assert.strictEqual(validate({ a: 'a', b: 'b' }), false)
  })

  it('partial', () => {
    const validate = ajv.compile(J.partial({ a: J.string, b: J.number }).compile())
    assert.strictEqual(validate({ a: 'a', b: 1 }), true)
    assert.strictEqual(validate({ a: 'a' }), true)
    assert.strictEqual(validate({ a: 'a', b: undefined }), true)
    assert.strictEqual(validate({ a: 'a', b: 'b' }), false)
  })

  it('record', () => {
    const validate = ajv.compile(J.record(J.string).compile())
    assert.strictEqual(validate({ a: 'a', b: 'b' }), true)
    assert.strictEqual(validate({ a: 'a', b: 1 }), false)
  })

  it('array', () => {
    const validate = ajv.compile(J.array(J.number).compile())
    assert.strictEqual(validate([]), true)
    assert.strictEqual(validate([1, 2, 3]), true)
    assert.strictEqual(validate([1, 'a', 3]), false)
  })

  it('tuple', () => {
    const validate = ajv.compile(J.tuple(J.string, J.number).compile())
    assert.strictEqual(validate(['a', 1]), true)
    assert.strictEqual(validate(['a', 1, true]), false)
    assert.strictEqual(validate(['a']), false)
  })

  describe('intersection', () => {
    it('should handle non primitive values', () => {
      const validate = ajv.compile(pipe(J.struct({ a: J.string }), J.intersect(J.struct({ b: J.number }))).compile())
      assert.strictEqual(validate({ a: 'a', b: 1 }), true)
      assert.strictEqual(validate({ a: 'a' }), false)
    })

    interface IntBrand {
      readonly Int: unique symbol
    }
    type Int = number & IntBrand

    const Int: J.JsonSchema<Int> = {
      compile: () =>
        C.make({
          type: 'integer'
        })
    }
    const Positive: J.JsonSchema<number> = {
      compile: () =>
        C.make({
          type: 'number',
          minimum: 0
        })
    }

    it('should handle primitives', () => {
      const validate = ajv.compile(pipe(Int, J.intersect(Positive)).compile())
      assert.strictEqual(validate(1), true)
      assert.strictEqual(validate(-1), false)
    })
  })

  it('sum', () => {
    const sum = J.sum('_tag')

    const A = J.struct({ _tag: J.literal('A'), a: J.string })
    const B = J.struct({ _tag: J.literal('B'), b: J.number })
    const validate = ajv.compile(sum({ A, B }).compile())
    assert.strictEqual(validate({ _tag: 'A', a: 'a' }), true)
    assert.strictEqual(validate({ _tag: 'B', b: 1 }), true)
    assert.strictEqual(validate(undefined), false)
    assert.strictEqual(validate({}), false)
  })

  it('union', () => {
    const validate = ajv.compile(J.union(J.string, J.number).compile())
    assert.strictEqual(validate('a'), true)
    assert.strictEqual(validate(1), true)
    assert.strictEqual(validate(true), false)
  })

  describe('lazy', () => {
    it('should support recursive json schemas', () => {
      interface A {
        readonly a: number
        readonly b?: A
      }

      const schema: J.JsonSchema<A> = J.lazy('A', () =>
        pipe(J.struct({ a: J.number }), J.intersect(J.partial({ b: schema })))
      )

      const jsonSchema = schema.compile()
      const validate = ajv.compile(jsonSchema)
      assert.strictEqual(validate({}), false)
      assert.strictEqual(validate({ a: 1 }), true)
      assert.strictEqual(validate({ a: 1, b: null }), false)
      assert.strictEqual(validate({ a: 1, b: { a: 2 } }), true)
    })

    it('should support mutually recursive json schemas', () => {
      interface A {
        readonly b?: B
      }
      interface B {
        readonly a?: A
      }
      const A: J.JsonSchema<A> = J.lazy('A', () => J.partial({ b: B }))
      const B: J.JsonSchema<B> = J.lazy('B', () => J.partial({ a: A }))
      const jsonSchema = A.compile()
      const validateA = ajv.compile(jsonSchema)
      assert.strictEqual(validateA({}), true)
      assert.strictEqual(validateA({ b: {} }), true)
      assert.strictEqual(validateA({ b: { a: {} } }), true)

      const validateB = ajv.compile(B.compile())
      assert.strictEqual(validateB({}), true)
      assert.strictEqual(validateB({ a: {} }), true)
      assert.strictEqual(validateB({ a: { b: {} } }), true)
    })
  })
})
