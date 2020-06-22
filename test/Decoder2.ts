import * as assert from 'assert'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import * as DE from '../src/DecodeError'
import * as FS from '../src/FreeSemigroup'
import * as G from '../src/Guard'
import * as D from '../src/Decoder2'

const undefinedGuard: G.Guard<undefined> = {
  is: (u): u is undefined => u === undefined
}
const undef: D.Decoder<undefined> = D.fromGuard(undefinedGuard, 'undefined')

describe('Decoder', () => {
  it('string', async () => {
    assert.deepStrictEqual(D.string.decode('a'), E.right('a'))
    assert.deepStrictEqual(D.string.decode(null), E.left(FS.of(DE.leaf(null, 'string'))))
  })

  it('number', async () => {
    assert.deepStrictEqual(D.number.decode(1), E.right(1))
    assert.deepStrictEqual(D.number.decode(null), E.left(FS.of(DE.leaf(null, 'number'))))
  })

  it('boolean', async () => {
    assert.deepStrictEqual(D.boolean.decode(true), E.right(true))
    assert.deepStrictEqual(D.boolean.decode(null), E.left(FS.of(DE.leaf(null, 'boolean'))))
  })

  it('UnknownArray', async () => {
    assert.deepStrictEqual(D.UnknownArray.decode([1, 'a']), E.right([1, 'a']))
    assert.deepStrictEqual(D.UnknownArray.decode(null), E.left(FS.of(DE.leaf(null, 'Array<unknown>'))))
  })

  it('UnknownRecord', async () => {
    assert.deepStrictEqual(D.UnknownRecord.decode({ a: 1, b: 'b' }), E.right({ a: 1, b: 'b' }))
    assert.deepStrictEqual(D.UnknownRecord.decode(null), E.left(FS.of(DE.leaf(null, 'Record<string, unknown>'))))
  })

  describe('literal', () => {
    it('should decode a valid input', async () => {
      const codec = D.literal('a', null, 'b', 1, true)
      assert.deepStrictEqual(codec.decode('a'), E.right('a'))
      assert.deepStrictEqual(codec.decode(null), E.right(null))
    })

    it('should reject an invalid input', async () => {
      const codec = D.literal('a', null)
      assert.deepStrictEqual(codec.decode('b'), E.left(FS.of(DE.leaf('b', '"a" | null'))))
    })
  })

  describe('type', () => {
    it('should decode a valid input', async () => {
      const codec = D.type({
        a: D.string
      })
      assert.deepStrictEqual(codec.decode({ a: 'a' }), E.right({ a: 'a' }))
    })

    it('should strip additional fields', async () => {
      const codec = D.type({
        a: D.string
      })
      assert.deepStrictEqual(codec.decode({ a: 'a', b: 1 }), E.right({ a: 'a' }))
    })

    it('should not strip fields corresponding to undefined values', async () => {
      const codec = D.type({
        a: undef
      })
      assert.deepStrictEqual(codec.decode({}), E.right({ a: undefined }))
    })

    it('should reject an invalid input', async () => {
      const codec = D.type({
        a: D.string
      })
      assert.deepStrictEqual(codec.decode(undefined), E.left(FS.of(DE.leaf(undefined, 'Record<string, unknown>'))))
      assert.deepStrictEqual(
        codec.decode({ a: 1 }),
        E.left(FS.of(DE.key('a', DE.required, FS.of(DE.leaf(1, 'string')))))
      )
    })

    it('should collect all errors', async () => {
      const codec = D.type({
        a: D.string,
        b: D.number
      })
      assert.deepStrictEqual(
        codec.decode({}),
        E.left(
          FS.concat(
            FS.of(DE.key('a', DE.required, FS.of(DE.leaf(undefined, 'string')))),
            FS.of(DE.key('b', DE.required, FS.of(DE.leaf(undefined, 'number'))))
          )
        )
      )
    })

    it('should support getters', async () => {
      class A {
        get a() {
          return 'a'
        }
        get b() {
          return 'b'
        }
      }
      const codec = D.type({ a: D.string, b: D.string })
      assert.deepStrictEqual(codec.decode(new A()), E.right({ a: 'a', b: 'b' }))
    })
  })

  describe('partial', () => {
    it('should decode a valid input', async () => {
      const codec = D.partial({ a: D.string })
      assert.deepStrictEqual(codec.decode({ a: 'a' }), E.right({ a: 'a' }))
      assert.deepStrictEqual(codec.decode({}), E.right({}))
    })

    it('should strip additional fields', async () => {
      const codec = D.partial({ a: D.string })
      assert.deepStrictEqual(codec.decode({ a: 'a', b: 1 }), E.right({ a: 'a' }))
    })

    it('should not add missing fields', async () => {
      const codec = D.partial({ a: D.string })
      assert.deepStrictEqual(codec.decode({}), E.right({}))
    })

    it('should not strip fields corresponding to undefined values', async () => {
      const codec = D.partial({ a: D.string })
      assert.deepStrictEqual(codec.decode({ a: undefined }), E.right({ a: undefined }))
    })

    it('should reject an invalid input', async () => {
      const codec = D.partial({ a: D.string })
      assert.deepStrictEqual(codec.decode(undefined), E.left(FS.of(DE.leaf(undefined, 'Record<string, unknown>'))))
      assert.deepStrictEqual(
        codec.decode({ a: 1 }),
        E.left(FS.of(DE.key('a', DE.optional, FS.of(DE.leaf(1, 'string')))))
      )
    })

    it('should collect all errors', async () => {
      const codec = D.partial({
        a: D.string,
        b: D.number
      })
      assert.deepStrictEqual(
        codec.decode({ a: 1, b: 'b' }),
        E.left(
          FS.concat(
            FS.of(DE.key('a', DE.optional, FS.of(DE.leaf(1, 'string')))),
            FS.of(DE.key('b', DE.optional, FS.of(DE.leaf('b', 'number'))))
          )
        )
      )
    })

    it('should support getters', async () => {
      class A {
        get a() {
          return 'a'
        }
        get b() {
          return 'b'
        }
      }
      const codec = D.partial({ a: D.string, b: D.string })
      assert.deepStrictEqual(codec.decode(new A()), E.right({ a: 'a', b: 'b' }))
    })
  })

  describe('array', () => {
    it('should decode a valid input', async () => {
      const codec = D.array(D.string)
      assert.deepStrictEqual(codec.decode([]), E.right([]))
      assert.deepStrictEqual(codec.decode(['a']), E.right(['a']))
    })

    it('should reject an invalid input', async () => {
      const codec = D.array(D.string)
      assert.deepStrictEqual(codec.decode(undefined), E.left(FS.of(DE.leaf(undefined, 'Array<unknown>'))))
      assert.deepStrictEqual(codec.decode([1]), E.left(FS.of(DE.index(0, DE.optional, FS.of(DE.leaf(1, 'string'))))))
    })

    it('should collect all errors', async () => {
      const codec = D.array(D.string)
      assert.deepStrictEqual(
        codec.decode([1, 2]),
        E.left(
          FS.concat(
            FS.of(DE.index(0, DE.optional, FS.of(DE.leaf(1, 'string')))),
            FS.of(DE.index(1, DE.optional, FS.of(DE.leaf(2, 'string'))))
          )
        )
      )
    })
  })

  describe('record', () => {
    it('should decode a valid value', async () => {
      const codec = D.record(D.number)
      assert.deepStrictEqual(codec.decode({}), E.right({}))
      assert.deepStrictEqual(codec.decode({ a: 1 }), E.right({ a: 1 }))
    })

    it('should reject an invalid value', async () => {
      const codec = D.record(D.number)
      assert.deepStrictEqual(codec.decode(undefined), E.left(FS.of(DE.leaf(undefined, 'Record<string, unknown>'))))
      assert.deepStrictEqual(
        codec.decode({ a: 'a' }),
        E.left(FS.of(DE.key('a', DE.optional, FS.of(DE.leaf('a', 'number')))))
      )
    })

    it('should collect all errors', async () => {
      const codec = D.record(D.number)
      assert.deepStrictEqual(
        codec.decode({ a: 'a', b: 'b' }),
        E.left(
          FS.concat(
            FS.of(DE.key('a', DE.optional, FS.of(DE.leaf('a', 'number')))),
            FS.of(DE.key('b', DE.optional, FS.of(DE.leaf('b', 'number'))))
          )
        )
      )
    })
  })

  describe('tuple', () => {
    it('should decode a valid input', async () => {
      const codec = D.tuple(D.string, D.number)
      assert.deepStrictEqual(codec.decode(['a', 1]), E.right(['a', 1]))
    })

    it('should handle zero components', async () => {
      assert.deepStrictEqual(D.tuple().decode([]), E.right([]))
    })

    it('should reject an invalid input', async () => {
      const codec = D.tuple(D.string, D.number)
      assert.deepStrictEqual(codec.decode(undefined), E.left(FS.of(DE.leaf(undefined, 'Array<unknown>'))))
      assert.deepStrictEqual(
        codec.decode(['a']),
        E.left(FS.of(DE.index(1, DE.required, FS.of(DE.leaf(undefined, 'number')))))
      )
      assert.deepStrictEqual(codec.decode([1, 2]), E.left(FS.of(DE.index(0, DE.required, FS.of(DE.leaf(1, 'string'))))))
    })

    it('should collect all errors', async () => {
      const codec = D.tuple(D.string, D.number)
      assert.deepStrictEqual(
        codec.decode([1, 'a']),
        E.left(
          FS.concat(
            FS.of(DE.index(0, DE.required, FS.of(DE.leaf(1, 'string')))),
            FS.of(DE.index(1, DE.required, FS.of(DE.leaf('a', 'number'))))
          )
        )
      )
    })

    it('should strip additional components', async () => {
      const codec = D.tuple(D.string, D.number)
      assert.deepStrictEqual(codec.decode(['a', 1, true]), E.right(['a', 1]))
    })
  })

  it('draw', async () => {
    const decoder = D.type({
      a: D.string,
      b: D.number,
      c: D.array(D.boolean)
    })
    assert.deepStrictEqual(
      pipe(decoder.decode({ c: [1] }), E.mapLeft(D.draw)),
      E.left(`required property "a"
└─ cannot decode undefined, should be string
required property "b"
└─ cannot decode undefined, should be number
required property "c"
└─ optional index 0
   └─ cannot decode 1, should be boolean`)
    )
  })
})
