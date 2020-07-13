import * as assert from 'assert'
import * as C from '../src/Codec'
import * as D from '../src/Decoder'
import * as G from '../src/Guard'
import { pipe } from 'fp-ts/lib/pipeable'
import * as DE from '../src/DecodeError'
import * as FS from '../src/FreeSemigroup'
import * as E from 'fp-ts/lib/Either'

const NumberFromString: C.Codec<string, number> = C.make(
  pipe(
    D.string,
    D.parse((s) => {
      const n = parseFloat(s)
      return isNaN(n) ? D.failure(s, 'parsable to a number') : D.success(n)
    })
  ),
  { encode: String }
)

interface PositiveBrand {
  readonly Positive: unique symbol
}
type Positive = number & PositiveBrand
const Positive: C.Codec<number, Positive> = pipe(
  C.number,
  C.refine((n): n is Positive => n > 0, 'Positive')
)

interface IntBrand {
  readonly Int: unique symbol
}
type Int = number & IntBrand
const Int: C.Codec<number, Int> = pipe(
  C.number,
  C.refine((n): n is Int => Number.isInteger(n), 'Int')
)

const undefinedGuard: G.Guard<undefined> = {
  is: (u): u is undefined => u === undefined
}
const undef: C.Codec<undefined, undefined> = C.fromDecoder(D.fromGuard(undefinedGuard, 'undefined'))

describe('Codec', () => {
  describe('Invariant', () => {
    it('imap', () => {
      const codec = C.Invariant.imap(
        C.string,
        (s) => ({ value: s }),
        ({ value }) => value
      )
      assert.deepStrictEqual(codec.decode('a'), D.success({ value: 'a' }))
      assert.deepStrictEqual(codec.encode({ value: 'a' }), 'a')
    })
  })

  it('imap', () => {
    const codec = pipe(
      C.string,
      C.imap(
        (s) => ({ value: s }),
        ({ value }) => value
      )
    )
    assert.deepStrictEqual(codec.decode('a'), D.success({ value: 'a' }))
    assert.deepStrictEqual(codec.encode({ value: 'a' }), 'a')
  })

  describe('mapLeftWithInput', () => {
    describe('decode', () => {
      it('should, return the provided expected', () => {
        const decoder = pipe(
          C.number,
          C.mapLeftWithInput((u) => FS.of(DE.leaf(u, 'not a number')))
        )
        assert.deepStrictEqual(decoder.decode('a'), D.failure('a', 'not a number'))
      })
    })
  })

  describe('string', () => {
    describe('decode', () => {
      it('should decode a valid input', () => {
        const codec = C.string
        assert.deepStrictEqual(codec.decode('a'), D.success('a'))
      })

      it('should reject an invalid input', () => {
        const codec = C.string
        assert.deepStrictEqual(codec.decode(null), D.failure(null, 'string'))
      })
    })
  })

  describe('number', () => {
    describe('decode', () => {
      it('should decode a valid input', () => {
        const codec = C.number
        assert.deepStrictEqual(codec.decode(1), D.success(1))
      })

      it('should reject an invalid input', () => {
        const codec = C.number
        assert.deepStrictEqual(codec.decode(null), D.failure(null, 'number'))
      })
    })
  })

  describe('boolean', () => {
    describe('decode', () => {
      it('should decode a valid input', () => {
        const codec = C.boolean
        assert.deepStrictEqual(codec.decode(true), D.success(true))
        assert.deepStrictEqual(codec.decode(false), D.success(false))
      })

      it('should reject an invalid input', () => {
        const codec = C.boolean
        assert.deepStrictEqual(codec.decode(null), D.failure(null, 'boolean'))
      })
    })
  })

  describe('literal', () => {
    describe('decode', () => {
      it('should decode a valid input', () => {
        const codec = C.literal('a', null, 'b', 1, true)
        assert.deepStrictEqual(codec.decode('a'), D.success('a'))
        assert.deepStrictEqual(codec.decode(null), D.success(null))
      })

      it('should reject an invalid input', () => {
        const codec = C.literal('a', null)
        assert.deepStrictEqual(codec.decode('b'), D.failure('b', '"a" | null'))
      })
    })

    describe('encode', () => {
      it('should encode a value', () => {
        const codec = C.literal('a')
        assert.deepStrictEqual(codec.encode('a'), 'a')
      })
    })
  })

  describe('refine', () => {
    describe('decode', () => {
      it('should decode a valid input', () => {
        const codec = pipe(
          C.string,
          C.refine((s): s is string => s.length > 0, 'NonEmptyString')
        )
        assert.deepStrictEqual(codec.decode('a'), D.success('a'))
      })

      it('should reject an invalid input', () => {
        const codec = pipe(
          C.string,
          C.refine((s): s is string => s.length > 0, 'NonEmptyString')
        )
        assert.deepStrictEqual(codec.decode(undefined), D.failure(undefined, 'string'))
        assert.deepStrictEqual(codec.decode(''), D.failure('', 'NonEmptyString'))
      })
    })

    describe('encode', () => {
      it('should encode a value', () => {
        const codec = pipe(
          C.string,
          C.refine((s): s is string => s.length > 0, 'NonEmptyString')
        )
        assert.strictEqual(codec.encode('a'), 'a')
      })
    })
  })

  describe('nullable', () => {
    describe('decode', () => {
      it('should decode a valid input', () => {
        const codec = C.nullable(NumberFromString)
        assert.deepStrictEqual(codec.decode(null), D.success(null))
        assert.deepStrictEqual(codec.decode('1'), D.success(1))
      })

      it('should reject an invalid input', () => {
        const codec = C.nullable(NumberFromString)
        assert.deepStrictEqual(
          codec.decode(undefined),
          E.left(
            FS.concat(
              FS.of(DE.member(0, FS.of(DE.leaf(undefined, 'null')))),
              FS.of(DE.member(1, FS.of(DE.leaf(undefined, 'string'))))
            )
          )
        )
        assert.deepStrictEqual(
          codec.decode('a'),
          E.left(
            FS.concat(
              FS.of(DE.member(0, FS.of(DE.leaf('a', 'null')))),
              FS.of(DE.member(1, FS.of(DE.leaf('a', 'parsable to a number'))))
            )
          )
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
        assert.deepStrictEqual(codec.decode({ a: 'a' }), D.success({ a: 'a' }))
      })

      it('should strip additional fields', () => {
        const codec = C.type({
          a: C.string
        })
        assert.deepStrictEqual(codec.decode({ a: 'a', b: 1 }), D.success({ a: 'a' }))
      })

      it('should not strip fields corresponding to undefined values', () => {
        const codec = C.type({
          a: undef
        })
        assert.deepStrictEqual(codec.decode({}), D.success({ a: undefined }))
      })

      it('should reject an invalid input', () => {
        const codec = C.type({
          a: C.string
        })
        assert.deepStrictEqual(codec.decode(undefined), D.failure(undefined, 'Record<string, unknown>'))
        assert.deepStrictEqual(
          codec.decode({ a: 1 }),
          E.left(FS.of(DE.key('a', DE.required, FS.of(DE.leaf(1, 'string')))))
        )
      })

      it('should collect all errors', () => {
        const codec = C.type({
          a: C.string,
          b: C.number
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

      it('should support getters', () => {
        class A {
          get a() {
            return 'a'
          }
          get b() {
            return 'b'
          }
        }
        const codec = C.type({ a: C.string, b: C.string })
        assert.deepStrictEqual(codec.decode(new A()), D.success({ a: 'a', b: 'b' }))
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
        assert.deepStrictEqual(codec.decode({ a: 'a' }), D.success({ a: 'a' }))
        assert.deepStrictEqual(codec.decode({}), D.success({}))
      })

      it('should strip additional fields', () => {
        const codec = C.partial({ a: C.string })
        assert.deepStrictEqual(codec.decode({ a: 'a', b: 1 }), D.success({ a: 'a' }))
      })

      it('should not add missing fields', () => {
        const codec = C.partial({ a: C.string })
        assert.deepStrictEqual(codec.decode({}), D.success({}))
      })

      it('should not strip fields corresponding to undefined values', () => {
        const codec = C.partial({ a: C.string })
        assert.deepStrictEqual(codec.decode({ a: undefined }), D.success({ a: undefined }))
      })

      it('should reject an invalid input', () => {
        const codec = C.partial({ a: C.string })
        assert.deepStrictEqual(codec.decode(undefined), D.failure(undefined, 'object'))
        assert.deepStrictEqual(
          codec.decode({ a: 1 }),
          E.left(FS.of(DE.key('a', DE.optional, FS.of(DE.leaf(1, 'string')))))
        )
      })

      it('should collect all errors', () => {
        const codec = C.partial({
          a: C.string,
          b: C.number
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

      it('should support getters', () => {
        class A {
          get a() {
            return 'a'
          }
          get b() {
            return 'b'
          }
        }
        const codec = C.partial({ a: C.string, b: C.string })
        assert.deepStrictEqual(codec.decode(new A()), D.success({ a: 'a', b: 'b' }))
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
        assert.deepStrictEqual(codec.decode({}), D.success({}))
        assert.deepStrictEqual(codec.decode({ a: 1 }), D.success({ a: 1 }))
      })

      it('should reject an invalid value', () => {
        const codec = C.record(C.number)
        assert.deepStrictEqual(codec.decode(undefined), D.failure(undefined, 'Record<string, unknown>'))
        assert.deepStrictEqual(
          codec.decode({ a: 'a' }),
          E.left(FS.of(DE.key('a', DE.optional, FS.of(DE.leaf('a', 'number')))))
        )
      })

      it('should collect all errors', () => {
        const codec = C.record(C.number)
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
        assert.deepStrictEqual(codec.decode([]), D.success([]))
        assert.deepStrictEqual(codec.decode(['a']), D.success(['a']))
      })

      it('should reject an invalid input', () => {
        const codec = C.array(C.string)
        assert.deepStrictEqual(codec.decode(undefined), D.failure(undefined, 'Array<unknown>'))
        assert.deepStrictEqual(codec.decode([1]), E.left(FS.of(DE.index(0, DE.optional, FS.of(DE.leaf(1, 'string'))))))
      })

      it('should collect all errors', () => {
        const codec = C.array(C.string)
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
        assert.deepStrictEqual(codec.decode(['a', 1]), D.success(['a', 1]))
      })

      it('should handle zero components', () => {
        assert.deepStrictEqual(C.tuple().decode([]), D.success([]))
      })

      it('should reject an invalid input', () => {
        const codec = C.tuple(C.string, C.number)
        assert.deepStrictEqual(codec.decode(undefined), D.failure(undefined, 'Array<unknown>'))
        assert.deepStrictEqual(
          codec.decode(['a']),
          E.left(FS.of(DE.index(1, DE.required, FS.of(DE.leaf(undefined, 'number')))))
        )
        assert.deepStrictEqual(
          codec.decode([1, 2]),
          E.left(FS.of(DE.index(0, DE.required, FS.of(DE.leaf(1, 'string')))))
        )
      })

      it('should collect all errors', () => {
        const codec = C.tuple(C.string, C.number)
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

      it('should strip additional components', () => {
        const codec = C.tuple(C.string, C.number)
        assert.deepStrictEqual(codec.decode(['a', 1, true]), D.success(['a', 1]))
      })
    })

    describe('encode', () => {
      it('should encode a value', () => {
        const codec = C.tuple(NumberFromString, C.string)
        assert.deepStrictEqual(codec.encode([1, 'a']), ['1', 'a'])
      })
    })
  })

  describe('intersect', () => {
    describe('decode', () => {
      it('should decode a valid input', () => {
        const codec = pipe(C.type({ a: C.string }), C.intersect(C.type({ b: C.number })))
        assert.deepStrictEqual(codec.decode({ a: 'a', b: 1 }), D.success({ a: 'a', b: 1 }))
      })

      it('should handle primitives', () => {
        const codec = pipe(Int, C.intersect(Positive))
        assert.deepStrictEqual(codec.decode(1), D.success(1))
      })
    })

    describe('encode', () => {
      it('should encode a value', () => {
        const codec = pipe(C.type({ a: C.string }), C.intersect(C.type({ b: NumberFromString })))
        assert.deepStrictEqual(codec.encode({ a: 'a', b: 1 }), { a: 'a', b: '1' })
      })

      it('should handle primitives', () => {
        const codec = pipe(Int, C.intersect(Positive))
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
        assert.deepStrictEqual(codec.decode({ _tag: 'A', a: 'a' }), D.success({ _tag: 'A', a: 'a' }))
        assert.deepStrictEqual(codec.decode({ _tag: 'B', b: 1 }), D.success({ _tag: 'B', b: 1 }))
      })

      it('should reject an invalid input', () => {
        const A = C.type({ _tag: C.literal('A'), a: C.string })
        const B = C.type({ _tag: C.literal('B'), b: C.number })
        const codec = sum({ A, B })
        assert.deepStrictEqual(codec.decode(null), D.failure(null, 'object'))
        assert.deepStrictEqual(
          codec.decode({}),
          E.left(FS.of(DE.key('_tag', DE.required, FS.of(DE.leaf(undefined, '"A" | "B"')))))
        )
        assert.deepStrictEqual(
          codec.decode({ _tag: 'A', a: 1 }),
          E.left(FS.of(DE.key('a', DE.required, FS.of(DE.leaf(1, 'string')))))
        )
      })

      it('should support empty records', () => {
        const decoder = sum({})
        assert.deepStrictEqual(
          decoder.decode({}),
          E.left(FS.of(DE.key('_tag', DE.required, FS.of(DE.leaf(undefined, 'never')))))
        )
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
    interface AOut {
      a: string
      b?: AOut
    }

    const lazyCodec: C.Codec<AOut, A> = C.lazy('A', () =>
      pipe(C.type({ a: NumberFromString }), C.intersect(C.partial({ b: lazyCodec })))
    )

    describe('decode', () => {
      it('should decode a valid input', () => {
        assert.deepStrictEqual(lazyCodec.decode({ a: '1' }), D.success({ a: 1 }))
        assert.deepStrictEqual(lazyCodec.decode({ a: '1', b: { a: '2' } }), D.success({ a: 1, b: { a: 2 } }))
      })

      it('should reject an invalid input', () => {
        assert.deepStrictEqual(
          lazyCodec.decode({ a: 1 }),
          E.left(FS.of(DE.lazy('A', FS.of(DE.key('a', DE.required, FS.of(DE.leaf(1, 'string')))))))
        )
        assert.deepStrictEqual(
          lazyCodec.decode({ a: 'a' }),
          E.left(FS.of(DE.lazy('A', FS.of(DE.key('a', DE.required, FS.of(DE.leaf('a', 'parsable to a number')))))))
        )
        assert.deepStrictEqual(
          lazyCodec.decode({ a: '1', b: {} }),
          E.left(
            FS.of(
              DE.lazy(
                'A',
                FS.of(
                  DE.key(
                    'b',
                    DE.optional,
                    FS.of(DE.lazy('A', FS.of(DE.key('a', DE.required, FS.of(DE.leaf(undefined, 'string'))))))
                  )
                )
              )
            )
          )
        )
      })
    })

    describe('encode', () => {
      it('should encode a value', () => {
        assert.deepStrictEqual(lazyCodec.encode({ a: 1 }), { a: '1' })
        assert.deepStrictEqual(lazyCodec.encode({ a: 1, b: { a: 2 } }), { a: '1', b: { a: '2' } })
      })
    })
  })
})
