import * as assert from 'assert'
import { left, right } from 'fp-ts/lib/Either'
import * as C from '../src/Codec'
import * as D from '../src/Decoder'
import * as G from '../src/Guard'
import * as E from '../src/Encoder'

const NumberFromString: C.Codec<number> = C.make(
  D.parse(D.string, (s) => {
    const n = parseFloat(s)
    return isNaN(n) ? left(`cannot decode ${JSON.stringify(s)}, should be parsable into a number`) : right(n)
  }),
  { encode: String }
)

interface PositiveBrand {
  readonly Positive: unique symbol
}
type Positive = number & PositiveBrand
const Positive: C.Codec<Positive> = C.refinement(C.number, (n): n is Positive => n > 0, 'Positive')

interface IntBrand {
  readonly Int: unique symbol
}
type Int = number & IntBrand
const Int: C.Codec<Int> = C.refinement(C.number, (n): n is Int => Number.isInteger(n), 'Int')

const undefinedGuard: G.Guard<undefined> = {
  is: (u): u is undefined => u === undefined
}
const undef: C.Codec<undefined> = C.make(D.fromGuard(undefinedGuard, 'undefined'), E.id)

describe('Codec', () => {
  describe('codec', () => {
    it('imap', () => {
      const codec = C.codec.imap(
        C.string,
        (s) => ({ value: s }),
        ({ value }) => value
      )
      assert.deepStrictEqual(codec.decode('a'), right({ value: 'a' }))
      assert.deepStrictEqual(codec.encode({ value: 'a' }), 'a')
    })
  })

  describe('withExpected', () => {
    describe('decode', () => {
      it('should, return the provided expected', () => {
        const codec = C.withExpected(C.number, () => [D.tree(`not a number`)])
        assert.deepStrictEqual(codec.decode('a'), left([D.tree('not a number')]))
      })
    })
  })

  describe('string', () => {
    describe('decode', () => {
      it('should decode a valid input', () => {
        const codec = C.string
        assert.deepStrictEqual(codec.decode('a'), right('a'))
      })

      it('should reject an invalid input', () => {
        const codec = C.string
        assert.deepStrictEqual(codec.decode(null), left([D.tree('cannot decode null, should be string')]))
      })
    })
  })

  describe('number', () => {
    describe('decode', () => {
      it('should decode a valid input', () => {
        const codec = C.number
        assert.deepStrictEqual(codec.decode(1), right(1))
      })

      it('should reject an invalid input', () => {
        const codec = C.number
        assert.deepStrictEqual(codec.decode(null), left([D.tree('cannot decode null, should be number')]))
      })
    })
  })

  describe('boolean', () => {
    describe('decode', () => {
      it('should decode a valid input', () => {
        const codec = C.boolean
        assert.deepStrictEqual(codec.decode(true), right(true))
        assert.deepStrictEqual(codec.decode(false), right(false))
      })

      it('should reject an invalid input', () => {
        const codec = C.boolean
        assert.deepStrictEqual(codec.decode(null), left([D.tree('cannot decode null, should be boolean')]))
      })
    })
  })

  describe('literal', () => {
    describe('decode', () => {
      it('should decode a valid input', () => {
        const codec = C.literal('a', null, 'b', 1, true)
        assert.deepStrictEqual(codec.decode('a'), right('a'))
        assert.deepStrictEqual(codec.decode(null), right(null))
      })

      it('should reject an invalid input', () => {
        const codec = C.literal('a', null)
        assert.deepStrictEqual(codec.decode('b'), left([D.tree('cannot decode "b", should be "a" | null')]))
      })

      it('should handle zero members', () => {
        assert.deepStrictEqual(C.literal().decode({}), left([D.tree('cannot decode {}, should be never')]))
      })
    })

    describe('encode', () => {
      it('should encode a value', () => {
        const codec = C.literal('a')
        assert.deepStrictEqual(codec.encode('a'), 'a')
      })
    })
  })

  describe('refinement', () => {
    describe('decode', () => {
      it('should decode a valid input', () => {
        const codec = C.refinement(C.string, (s): s is string => s.length > 0, 'NonEmptyString')
        assert.deepStrictEqual(codec.decode('a'), right('a'))
      })

      it('should reject an invalid input', () => {
        const codec = C.refinement(C.string, (s): s is string => s.length > 0, 'NonEmptyString')
        assert.deepStrictEqual(codec.decode(undefined), left([D.tree('cannot decode undefined, should be string')]))
        assert.deepStrictEqual(codec.decode(''), left([D.tree('cannot refine "", should be NonEmptyString')]))
      })
    })

    describe('encode', () => {
      it('should encode a value', () => {
        const codec = C.refinement(C.string, (s): s is string => s.length > 0, 'NonEmptyString')
        assert.strictEqual(codec.encode('a'), 'a')
      })
    })
  })

  describe('nullable', () => {
    describe('decode', () => {
      it('should decode a valid input', () => {
        const codec = C.nullable(NumberFromString)
        assert.deepStrictEqual(codec.decode(null), right(null))
        assert.deepStrictEqual(codec.decode('1'), right(1))
      })

      it('should reject an invalid input', () => {
        const codec = C.nullable(NumberFromString)
        assert.deepStrictEqual(
          codec.decode(undefined),
          left([
            D.tree('member 0', [D.tree('cannot decode undefined, should be null')]),
            D.tree('member 1', [D.tree('cannot decode undefined, should be string')])
          ])
        )
        assert.deepStrictEqual(
          codec.decode('a'),
          left([
            D.tree('member 0', [D.tree('cannot decode "a", should be null')]),
            D.tree('member 1', [D.tree('cannot decode "a", should be parsable into a number')])
          ])
        )
      })
    })

    describe('encode', () => {
      it('should encode a value', () => {
        const codec = C.nullable(NumberFromString)
        assert.strictEqual(codec.encode(null), null)
        assert.strictEqual(codec.encode(1), '1')
      })
    })
  })

  describe('type', () => {
    describe('decode', () => {
      it('should decode a valid input', () => {
        const codec = C.type({
          a: C.string
        })
        assert.deepStrictEqual(codec.decode({ a: 'a' }), right({ a: 'a' }))
      })

      it('should strip additional fields', () => {
        const codec = C.type({
          a: C.string
        })
        assert.deepStrictEqual(codec.decode({ a: 'a', b: 1 }), right({ a: 'a' }))
      })

      it('should not strip fields corresponding to undefined values', () => {
        const codec = C.type({
          a: undef
        })
        assert.deepStrictEqual(codec.decode({}), right({ a: undefined }))
      })

      it('should reject an invalid input', () => {
        const codec = C.type({
          a: C.string
        })
        assert.deepStrictEqual(
          codec.decode(undefined),
          left([D.tree('cannot decode undefined, should be Record<string, unknown>')])
        )
        assert.deepStrictEqual(
          codec.decode({ a: 1 }),
          left([D.tree('required property "a"', [D.tree('cannot decode 1, should be string')])])
        )
      })

      it('should collect all errors', () => {
        const codec = C.type({
          a: C.string,
          b: C.number
        })
        assert.deepStrictEqual(
          codec.decode({}),
          left([
            D.tree('required property "a"', [D.tree('cannot decode undefined, should be string')]),
            D.tree('required property "b"', [D.tree('cannot decode undefined, should be number')])
          ])
        )
      })
    })

    describe('encode', () => {
      it('should encode a value', () => {
        const codec = C.type({ a: NumberFromString })
        assert.deepStrictEqual(codec.encode({ a: 1 }), { a: '1' })
      })

      it('should strip additional fields', () => {
        const codec = C.type({ a: C.number })
        const a = { a: 1, b: true }
        assert.deepStrictEqual(codec.encode(a), { a: 1 })
      })
    })
  })

  describe('partial', () => {
    describe('decode', () => {
      it('should decode a valid input', () => {
        const codec = C.partial({ a: C.string })
        assert.deepStrictEqual(codec.decode({ a: 'a' }), right({ a: 'a' }))
        assert.deepStrictEqual(codec.decode({}), right({}))
      })

      it('should strip additional fields', () => {
        const codec = C.partial({ a: C.string })
        assert.deepStrictEqual(codec.decode({ a: 'a', b: 1 }), right({ a: 'a' }))
      })

      it('should not add missing fields', () => {
        const codec = C.partial({ a: C.string })
        assert.deepStrictEqual(codec.decode({}), right({}))
      })

      it('should not strip fields corresponding to undefined values', () => {
        const codec = C.partial({ a: C.string })
        assert.deepStrictEqual(codec.decode({ a: undefined }), right({ a: undefined }))
      })

      it('should reject an invalid input', () => {
        const codec = C.partial({ a: C.string })
        assert.deepStrictEqual(
          codec.decode(undefined),
          left([D.tree('cannot decode undefined, should be Record<string, unknown>')])
        )
        assert.deepStrictEqual(
          codec.decode({ a: 1 }),
          left([D.tree('optional property "a"', [D.tree('cannot decode 1, should be string')])])
        )
      })

      it('should collect all errors', () => {
        const codec = C.partial({
          a: C.string,
          b: C.number
        })
        assert.deepStrictEqual(
          codec.decode({ a: 1, b: 'b' }),
          left([
            D.tree('optional property "a"', [D.tree('cannot decode 1, should be string')]),
            D.tree('optional property "b"', [D.tree('cannot decode "b", should be number')])
          ])
        )
      })
    })

    describe('encode', () => {
      it('should encode a value', () => {
        const codec = C.partial({ a: NumberFromString })
        assert.deepStrictEqual(codec.encode({}), {})
        assert.deepStrictEqual(codec.encode({ a: 1 }), { a: '1' })
      })

      it('should strip additional fields', () => {
        const codec = C.partial({ a: C.string })
        const a = { a: 'a', b: true }
        assert.deepStrictEqual(codec.encode(a), { a: 'a' })
      })

      it('should not add missing fields', () => {
        const codec = C.partial({ a: C.string })
        assert.deepStrictEqual(codec.encode({}), {})
      })

      it('should not strip fields corresponding to undefined values', () => {
        const codec = C.partial({ a: C.string })
        assert.deepStrictEqual(codec.encode({ a: undefined }), { a: undefined })
      })
    })
  })

  describe('record', () => {
    describe('decode', () => {
      it('should decode a valid value', () => {
        const codec = C.record(C.number)
        assert.deepStrictEqual(codec.decode({}), right({}))
        assert.deepStrictEqual(codec.decode({ a: 1 }), right({ a: 1 }))
      })

      it('should reject an invalid value', () => {
        const codec = C.record(C.number)
        assert.deepStrictEqual(
          codec.decode(undefined),
          left([D.tree('cannot decode undefined, should be Record<string, unknown>')])
        )
        assert.deepStrictEqual(
          codec.decode({ a: 'a' }),
          left([D.tree('key "a"', [D.tree('cannot decode "a", should be number')])])
        )
      })

      it('should collect all errors', () => {
        const codec = C.record(C.number)
        assert.deepStrictEqual(
          codec.decode({ a: 'a', b: 'b' }),
          left([
            D.tree('key "a"', [D.tree('cannot decode "a", should be number')]),
            D.tree('key "b"', [D.tree('cannot decode "b", should be number')])
          ])
        )
      })
    })

    describe('encode', () => {
      it('should encode a value', () => {
        const codec = C.record(NumberFromString)
        assert.deepStrictEqual(codec.encode({ a: 1, b: 2 }), { a: '1', b: '2' })
      })
    })
  })

  describe('array', () => {
    describe('decode', () => {
      it('should decode a valid input', () => {
        const codec = C.array(C.string)
        assert.deepStrictEqual(codec.decode([]), right([]))
        assert.deepStrictEqual(codec.decode(['a']), right(['a']))
      })

      it('should reject an invalid input', () => {
        const codec = C.array(C.string)
        assert.deepStrictEqual(
          codec.decode(undefined),
          left([D.tree('cannot decode undefined, should be Array<unknown>')])
        )
        assert.deepStrictEqual(
          codec.decode([1]),
          left([D.tree('item 0', [D.tree('cannot decode 1, should be string')])])
        )
      })

      it('should collect all errors', () => {
        const codec = C.array(C.string)
        assert.deepStrictEqual(
          codec.decode([1, 2]),
          left([
            D.tree('item 0', [D.tree('cannot decode 1, should be string')]),
            D.tree('item 1', [D.tree('cannot decode 2, should be string')])
          ])
        )
      })
    })

    describe('encode', () => {
      it('should encode a value', () => {
        const codec = C.array(NumberFromString)
        assert.deepStrictEqual(codec.encode([1, 2]), ['1', '2'])
      })
    })
  })

  describe('tuple', () => {
    describe('decode', () => {
      it('should decode a valid input', () => {
        const codec = C.tuple(C.string, C.number)
        assert.deepStrictEqual(codec.decode(['a', 1]), right(['a', 1]))
      })

      it('should handle zero components', () => {
        assert.deepStrictEqual(C.tuple().decode([]), right([]))
      })

      it('should reject an invalid input', () => {
        const codec = C.tuple(C.string, C.number)
        assert.deepStrictEqual(
          codec.decode(undefined),
          left([D.tree('cannot decode undefined, should be Array<unknown>')])
        )
        assert.deepStrictEqual(
          codec.decode(['a']),
          left([D.tree('component 1', [D.tree('cannot decode undefined, should be number')])])
        )
        assert.deepStrictEqual(
          codec.decode([1, 2]),
          left([D.tree('component 0', [D.tree('cannot decode 1, should be string')])])
        )
      })

      it('should collect all errors', () => {
        const codec = C.tuple(C.string, C.number)
        assert.deepStrictEqual(
          codec.decode([1, 'a']),
          left([
            D.tree('component 0', [D.tree('cannot decode 1, should be string')]),
            D.tree('component 1', [D.tree('cannot decode "a", should be number')])
          ])
        )
      })

      it('should strip additional components', () => {
        const codec = C.tuple(C.string, C.number)
        assert.deepStrictEqual(codec.decode(['a', 1, true]), right(['a', 1]))
      })
    })

    describe('encode', () => {
      it('should encode a value', () => {
        const codec = C.tuple(NumberFromString, C.string)
        assert.deepStrictEqual(codec.encode([1, 'a']), ['1', 'a'])
      })
    })
  })

  describe('intersection', () => {
    describe('decode', () => {
      it('should decode a valid input', () => {
        const codec = C.intersection(C.type({ a: C.string }), C.type({ b: C.number }))
        assert.deepStrictEqual(codec.decode({ a: 'a', b: 1 }), right({ a: 'a', b: 1 }))
      })

      it('should handle primitives', () => {
        const codec = C.intersection(Int, Positive)
        assert.deepStrictEqual(codec.decode(1), right(1))
      })

      it('should reject an invalid input', () => {
        const codec = C.intersection(C.type({ a: C.string }), C.type({ b: C.number }))
        assert.deepStrictEqual(
          codec.decode({ a: 'a' }),
          left([D.tree('required property "b"', [D.tree('cannot decode undefined, should be number')])])
        )
        assert.deepStrictEqual(
          codec.decode({ b: 1 }),
          left([D.tree('required property "a"', [D.tree('cannot decode undefined, should be string')])])
        )
      })
    })

    describe('encode', () => {
      it('should encode a value', () => {
        const codec = C.intersection(C.type({ a: C.string }), C.type({ b: NumberFromString }))
        assert.deepStrictEqual(codec.encode({ a: 'a', b: 1 }), { a: 'a', b: '1' })
      })

      it('should handle primitives', () => {
        const codec = C.intersection(Int, Positive)
        assert.deepStrictEqual(codec.encode(1 as any), 1)
      })
    })
  })

  describe('sum', () => {
    const sum = C.sum('_tag')

    describe('decode', () => {
      it('should decode a valid input', () => {
        const A = C.type({ _tag: C.literal('A'), a: C.string })
        const B = C.type({ _tag: C.literal('B'), b: C.number })
        const codec = sum({ A, B })
        assert.deepStrictEqual(codec.decode({ _tag: 'A', a: 'a' }), right({ _tag: 'A', a: 'a' }))
        assert.deepStrictEqual(codec.decode({ _tag: 'B', b: 1 }), right({ _tag: 'B', b: 1 }))
      })

      it('should reject an invalid input', () => {
        const A = C.type({ _tag: C.literal('A'), a: C.string })
        const B = C.type({ _tag: C.literal('B'), b: C.number })
        const codec = sum({ A, B })
        assert.deepStrictEqual(
          codec.decode(null),
          left([D.tree('cannot decode null, should be Record<string, unknown>')])
        )
        assert.deepStrictEqual(
          codec.decode({}),
          left([D.tree('required property "_tag"', [D.tree('cannot decode undefined, should be "A" | "B"')])])
        )
        assert.deepStrictEqual(
          codec.decode({ _tag: 'A', a: 1 }),
          left([D.tree('required property "a"', [D.tree('cannot decode 1, should be string')])])
        )
      })

      it('should handle zero members', () => {
        assert.deepStrictEqual(C.sum('_tag')({}).decode({}), left([D.tree('cannot decode {}, should be never')]))
      })

      it('should support empty records', () => {
        const decoder = sum({})
        assert.deepStrictEqual(decoder.decode({}), left([D.tree('cannot decode {}, should be never')]))
      })
    })

    describe('encode', () => {
      it('should encode a value', () => {
        const A = C.type({ _tag: C.literal('A'), a: C.string })
        const B = C.type({ _tag: C.literal('B'), b: NumberFromString })
        const codec = sum({ A, B })
        assert.deepStrictEqual(codec.encode({ _tag: 'A', a: 'a' }), { _tag: 'A', a: 'a' })
        assert.deepStrictEqual(codec.encode({ _tag: 'B', b: 1 }), { _tag: 'B', b: '1' })
      })
    })
  })

  describe('lazy', () => {
    interface A {
      a: number
      b?: A
    }

    const codec: C.Codec<A> = C.lazy('A', () =>
      C.intersection(C.type({ a: NumberFromString }), C.partial({ b: codec }))
    )

    describe('decode', () => {
      it('should decode a valid input', () => {
        assert.deepStrictEqual(codec.decode({ a: '1' }), right({ a: 1 }))
        assert.deepStrictEqual(codec.decode({ a: '1', b: { a: '2' } }), right({ a: 1, b: { a: 2 } }))
      })

      it('should reject an invalid input', () => {
        assert.deepStrictEqual(
          codec.decode({ a: 1 }),
          left([D.tree('A', [D.tree('required property "a"', [D.tree('cannot decode 1, should be string')])])])
        )
        assert.deepStrictEqual(
          codec.decode({ a: 'a' }),
          left([
            D.tree('A', [
              D.tree('required property "a"', [D.tree('cannot decode "a", should be parsable into a number')])
            ])
          ])
        )
        assert.deepStrictEqual(
          codec.decode({ a: '1', b: {} }),
          left([
            D.tree('A', [
              D.tree('optional property "b"', [
                D.tree('A', [D.tree('required property "a"', [D.tree('cannot decode undefined, should be string')])])
              ])
            ])
          ])
        )
      })
    })

    describe('encode', () => {
      it('should encode a value', () => {
        assert.deepStrictEqual(codec.encode({ a: 1 }), { a: '1' })
        assert.deepStrictEqual(codec.encode({ a: 1, b: { a: 2 } }), { a: '1', b: { a: '2' } })
      })
    })
  })
})
