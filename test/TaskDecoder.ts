import * as assert from 'assert'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import * as TE from 'fp-ts/lib/TaskEither'
import * as DE from '../src/DecodeError'
import * as FS from '../src/FreeSemigroup'
import * as G from '../src/Guard'
import * as D from '../src/TaskDecoder'

const undefinedGuard: G.Guard<undefined> = {
  is: (u): u is undefined => u === undefined
}
const undef: D.TaskDecoder<undefined> = D.fromGuard(undefinedGuard, 'undefined')

const NumberFromString: D.TaskDecoder<number> = D.parse(D.string, (s) => {
  const n = parseFloat(s)
  return isNaN(n) ? D.failure(s, 'parsable to a number') : D.success(n)
})

interface PositiveBrand {
  readonly Positive: unique symbol
}
type Positive = number & PositiveBrand
const Positive: D.TaskDecoder<Positive> = D.refinement(D.number, (n): n is Positive => n > 0, 'Positive')

interface IntBrand {
  readonly Int: unique symbol
}
type Int = number & IntBrand
const Int: D.TaskDecoder<Int> = D.refinement(D.number, (n): n is Int => Number.isInteger(n), 'Int')

describe('TaskDecoder', () => {
  // -------------------------------------------------------------------------------------
  // primitives
  // -------------------------------------------------------------------------------------

  it('string', async () => {
    assert.deepStrictEqual(await D.string.decode('a')(), E.right('a'))
    assert.deepStrictEqual(await D.string.decode(null)(), E.left(FS.of(DE.leaf(null, 'string'))))
  })

  it('number', async () => {
    assert.deepStrictEqual(await D.number.decode(1)(), E.right(1))
    assert.deepStrictEqual(await D.number.decode(null)(), E.left(FS.of(DE.leaf(null, 'number'))))
  })

  it('boolean', async () => {
    assert.deepStrictEqual(await D.boolean.decode(true)(), E.right(true))
    assert.deepStrictEqual(await D.boolean.decode(null)(), E.left(FS.of(DE.leaf(null, 'boolean'))))
  })

  it('UnknownArray', async () => {
    assert.deepStrictEqual(await D.UnknownArray.decode([1, 'a'])(), E.right([1, 'a']))
    assert.deepStrictEqual(await D.UnknownArray.decode(null)(), E.left(FS.of(DE.leaf(null, 'Array<unknown>'))))
  })

  it('UnknownRecord', async () => {
    assert.deepStrictEqual(await D.UnknownRecord.decode({ a: 1, b: 'b' })(), E.right({ a: 1, b: 'b' }))
    assert.deepStrictEqual(
      await D.UnknownRecord.decode(null)(),
      E.left(FS.of(DE.leaf(null, 'Record<string, unknown>')))
    )
  })

  // -------------------------------------------------------------------------------------
  // constructors
  // -------------------------------------------------------------------------------------

  describe('literal', () => {
    it('should decode a valid input', async () => {
      const codec = D.literal('a', null, 'b', 1, true)
      assert.deepStrictEqual(await codec.decode('a')(), E.right('a'))
      assert.deepStrictEqual(await codec.decode(null)(), E.right(null))
    })

    it('should reject an invalid input', async () => {
      const codec = D.literal('a', null)
      assert.deepStrictEqual(await codec.decode('b')(), E.left(FS.of(DE.leaf('b', '"a" | null'))))
    })
  })

  // -------------------------------------------------------------------------------------
  // combinators
  // -------------------------------------------------------------------------------------

  it('withExpected', async () => {
    const decoder = D.withExpected(D.number, (u) => FS.of(DE.leaf(u, 'not a number')))
    assert.deepStrictEqual(await decoder.decode('a')(), E.left(FS.of(DE.leaf('a', 'not a number'))))
  })

  describe('nullable', () => {
    it('should decode a valid input', async () => {
      const codec = D.nullable(NumberFromString)
      assert.deepStrictEqual(await codec.decode(null)(), E.right(null))
      assert.deepStrictEqual(await codec.decode('1')(), E.right(1))
    })

    it('should reject an invalid input', async () => {
      const codec = D.nullable(NumberFromString)
      assert.deepStrictEqual(
        await codec.decode(undefined)(),
        E.left(
          FS.concat(
            FS.of(DE.member(0, FS.of(DE.leaf(undefined, 'null')))),
            FS.of(DE.member(1, FS.of(DE.leaf(undefined, 'string'))))
          )
        )
      )
      assert.deepStrictEqual(
        await codec.decode('a')(),
        E.left(
          FS.concat(
            FS.of(DE.member(0, FS.of(DE.leaf('a', 'null')))),
            FS.of(DE.member(1, FS.of(DE.leaf('a', 'parsable to a number'))))
          )
        )
      )
    })
  })

  describe('type', () => {
    it('should decode a valid input', async () => {
      const codec = D.type({
        a: D.string
      })
      assert.deepStrictEqual(await codec.decode({ a: 'a' })(), E.right({ a: 'a' }))
    })

    it('should strip additional fields', async () => {
      const codec = D.type({
        a: D.string
      })
      assert.deepStrictEqual(await codec.decode({ a: 'a', b: 1 })(), E.right({ a: 'a' }))
    })

    it('should not strip fields corresponding to undefined values', async () => {
      const codec = D.type({
        a: undef
      })
      assert.deepStrictEqual(await codec.decode({})(), E.right({ a: undefined }))
    })

    it('should reject an invalid input', async () => {
      const codec = D.type({
        a: D.string
      })
      assert.deepStrictEqual(
        await codec.decode(undefined)(),
        E.left(FS.of(DE.leaf(undefined, 'Record<string, unknown>')))
      )
      assert.deepStrictEqual(
        await codec.decode({ a: 1 })(),
        E.left(FS.of(DE.key('a', DE.required, FS.of(DE.leaf(1, 'string')))))
      )
    })

    it('should collect all errors', async () => {
      const codec = D.type({
        a: D.string,
        b: D.number
      })
      assert.deepStrictEqual(
        await codec.decode({})(),
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
      assert.deepStrictEqual(await codec.decode(new A())(), E.right({ a: 'a', b: 'b' }))
    })
  })

  describe('partial', () => {
    it('should decode a valid input', async () => {
      const codec = D.partial({ a: D.string })
      assert.deepStrictEqual(await codec.decode({ a: 'a' })(), E.right({ a: 'a' }))
      assert.deepStrictEqual(await codec.decode({})(), E.right({}))
    })

    it('should strip additional fields', async () => {
      const codec = D.partial({ a: D.string })
      assert.deepStrictEqual(await codec.decode({ a: 'a', b: 1 })(), E.right({ a: 'a' }))
    })

    it('should not add missing fields', async () => {
      const codec = D.partial({ a: D.string })
      assert.deepStrictEqual(await codec.decode({})(), E.right({}))
    })

    it('should not strip fields corresponding to undefined values', async () => {
      const codec = D.partial({ a: D.string })
      assert.deepStrictEqual(await codec.decode({ a: undefined })(), E.right({ a: undefined }))
    })

    it('should reject an invalid input', async () => {
      const codec = D.partial({ a: D.string })
      assert.deepStrictEqual(
        await codec.decode(undefined)(),
        E.left(FS.of(DE.leaf(undefined, 'Record<string, unknown>')))
      )
      assert.deepStrictEqual(
        await codec.decode({ a: 1 })(),
        E.left(FS.of(DE.key('a', DE.optional, FS.of(DE.leaf(1, 'string')))))
      )
    })

    it('should collect all errors', async () => {
      const codec = D.partial({
        a: D.string,
        b: D.number
      })
      assert.deepStrictEqual(
        await codec.decode({ a: 1, b: 'b' })(),
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
      assert.deepStrictEqual(await codec.decode(new A())(), E.right({ a: 'a', b: 'b' }))
    })
  })

  describe('array', () => {
    it('should decode a valid input', async () => {
      const codec = D.array(D.string)
      assert.deepStrictEqual(await codec.decode([])(), E.right([]))
      assert.deepStrictEqual(await codec.decode(['a'])(), E.right(['a']))
    })

    it('should reject an invalid input', async () => {
      const codec = D.array(D.string)
      assert.deepStrictEqual(await codec.decode(undefined)(), E.left(FS.of(DE.leaf(undefined, 'Array<unknown>'))))
      assert.deepStrictEqual(
        await codec.decode([1])(),
        E.left(FS.of(DE.index(0, DE.optional, FS.of(DE.leaf(1, 'string')))))
      )
    })

    it('should collect all errors', async () => {
      const codec = D.array(D.string)
      assert.deepStrictEqual(
        await codec.decode([1, 2])(),
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
      assert.deepStrictEqual(await codec.decode({})(), E.right({}))
      assert.deepStrictEqual(await codec.decode({ a: 1 })(), E.right({ a: 1 }))
    })

    it('should reject an invalid value', async () => {
      const codec = D.record(D.number)
      assert.deepStrictEqual(
        await codec.decode(undefined)(),
        E.left(FS.of(DE.leaf(undefined, 'Record<string, unknown>')))
      )
      assert.deepStrictEqual(
        await codec.decode({ a: 'a' })(),
        E.left(FS.of(DE.key('a', DE.optional, FS.of(DE.leaf('a', 'number')))))
      )
    })

    it('should collect all errors', async () => {
      const codec = D.record(D.number)
      assert.deepStrictEqual(
        await codec.decode({ a: 'a', b: 'b' })(),
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
      assert.deepStrictEqual(await codec.decode(['a', 1])(), E.right(['a', 1]))
    })

    it('should handle zero components', async () => {
      assert.deepStrictEqual(await D.tuple().decode([])(), E.right([]))
    })

    it('should reject an invalid input', async () => {
      const codec = D.tuple(D.string, D.number)
      assert.deepStrictEqual(await codec.decode(undefined)(), E.left(FS.of(DE.leaf(undefined, 'Array<unknown>'))))
      assert.deepStrictEqual(
        await codec.decode(['a'])(),
        E.left(FS.of(DE.index(1, DE.required, FS.of(DE.leaf(undefined, 'number')))))
      )
      assert.deepStrictEqual(
        await codec.decode([1, 2])(),
        E.left(FS.of(DE.index(0, DE.required, FS.of(DE.leaf(1, 'string')))))
      )
    })

    it('should collect all errors', async () => {
      const codec = D.tuple(D.string, D.number)
      assert.deepStrictEqual(
        await codec.decode([1, 'a'])(),
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
      assert.deepStrictEqual(await codec.decode(['a', 1, true])(), E.right(['a', 1]))
    })
  })

  describe('union', () => {
    it('should decode a valid input', async () => {
      assert.deepStrictEqual(await D.union(D.string).decode('a')(), E.right('a'))
      const decoder = D.union(D.string, D.number)
      assert.deepStrictEqual(await decoder.decode('a')(), E.right('a'))
      assert.deepStrictEqual(await decoder.decode(1)(), E.right(1))
    })

    it('should reject an invalid input', async () => {
      const decoder = D.union(D.string, D.number)
      assert.deepStrictEqual(
        await decoder.decode(true)(),
        E.left(
          FS.concat(
            FS.of(DE.member(0, FS.of(DE.leaf(true, 'string')))),
            FS.of(DE.member(1, FS.of(DE.leaf(true, 'number'))))
          )
        )
      )
    })
  })

  describe('refinement', () => {
    it('should decode a valid input', async () => {
      const codec = D.refinement(D.string, (s): s is string => s.length > 0, 'NonEmptyString')
      assert.deepStrictEqual(await codec.decode('a')(), E.right('a'))
    })

    it('should reject an invalid input', async () => {
      const codec = D.refinement(D.string, (s): s is string => s.length > 0, 'NonEmptyString')
      assert.deepStrictEqual(await codec.decode(undefined)(), E.left(FS.of(DE.leaf(undefined, 'string'))))
      assert.deepStrictEqual(await codec.decode('')(), E.left(FS.of(DE.leaf('', 'NonEmptyString'))))
    })
  })

  describe('intersection', () => {
    it('should decode a valid input', async () => {
      const codec = D.intersection(D.type({ a: D.string }), D.type({ b: D.number }))
      assert.deepStrictEqual(await codec.decode({ a: 'a', b: 1 })(), E.right({ a: 'a', b: 1 }))
    })

    it('should handle primitives', async () => {
      const codec = D.intersection(Int, Positive)
      assert.deepStrictEqual(await codec.decode(1)(), E.right(1))
    })

    it('should accumulate all errors', async () => {
      const decoder = D.intersection(D.type({ a: D.string }), D.type({ b: D.number }))
      assert.deepStrictEqual(
        await decoder.decode({ a: 'a' })(),
        E.left(FS.of(DE.key('b', DE.required, FS.of(DE.leaf(undefined, 'number')))))
      )
      assert.deepStrictEqual(
        await decoder.decode({ b: 1 })(),
        E.left(FS.of(DE.key('a', DE.required, FS.of(DE.leaf(undefined, 'string')))))
      )
      assert.deepStrictEqual(
        await decoder.decode({})(),
        E.left(
          FS.concat(
            FS.of(DE.key('a', DE.required, FS.of(DE.leaf(undefined, 'string')))),
            FS.of(DE.key('b', DE.required, FS.of(DE.leaf(undefined, 'number'))))
          )
        )
      )
    })
  })

  describe('sum', () => {
    const sum = D.sum('_tag')

    it('should decode a valid input', async () => {
      const A = D.type({ _tag: D.literal('A'), a: D.string })
      const B = D.type({ _tag: D.literal('B'), b: D.number })
      const codec = sum({ A, B })
      assert.deepStrictEqual(await codec.decode({ _tag: 'A', a: 'a' })(), E.right({ _tag: 'A', a: 'a' }))
      assert.deepStrictEqual(await codec.decode({ _tag: 'B', b: 1 })(), E.right({ _tag: 'B', b: 1 }))
    })

    it('should reject an invalid input', async () => {
      const A = D.type({ _tag: D.literal('A'), a: D.string })
      const B = D.type({ _tag: D.literal('B'), b: D.number })
      const codec = sum({ A, B })
      assert.deepStrictEqual(await codec.decode(null)(), E.left(FS.of(DE.leaf(null, 'Record<string, unknown>'))))
      assert.deepStrictEqual(
        await codec.decode({})(),
        E.left(FS.of(DE.key('_tag', DE.required, FS.of(DE.leaf(undefined, '"A" | "B"')))))
      )
      assert.deepStrictEqual(
        await codec.decode({ _tag: 'A', a: 1 })(),
        E.left(FS.of(DE.key('a', DE.required, FS.of(DE.leaf(1, 'string')))))
      )
    })

    it('should support empty records', async () => {
      const decoder = sum({})
      assert.deepStrictEqual(
        await decoder.decode({})(),
        E.left(FS.of(DE.key('_tag', DE.required, FS.of(DE.leaf(undefined, 'never')))))
      )
    })
  })

  interface A {
    a: number
    b?: A
  }

  const lazyDecoder: D.TaskDecoder<A> = D.lazy('A', () =>
    D.intersection(D.type({ a: NumberFromString }), D.partial({ b: lazyDecoder }))
  )

  describe('lazy', () => {
    it('should decode a valid input', async () => {
      assert.deepStrictEqual(await lazyDecoder.decode({ a: '1' })(), E.right({ a: 1 }))
      assert.deepStrictEqual(await lazyDecoder.decode({ a: '1', b: { a: '2' } })(), E.right({ a: 1, b: { a: 2 } }))
    })

    it('should reject an invalid input', async () => {
      assert.deepStrictEqual(
        await lazyDecoder.decode({ a: 1 })(),
        E.left(FS.of(DE.lazy('A', FS.of(DE.key('a', DE.required, FS.of(DE.leaf(1, 'string')))))))
      )
      assert.deepStrictEqual(
        await lazyDecoder.decode({ a: 'a' })(),
        E.left(FS.of(DE.lazy('A', FS.of(DE.key('a', DE.required, FS.of(DE.leaf('a', 'parsable to a number')))))))
      )
      assert.deepStrictEqual(
        await lazyDecoder.decode({ a: '1', b: {} })(),
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

  // -------------------------------------------------------------------------------------
  // utils
  // -------------------------------------------------------------------------------------

  describe('draw', () => {
    it('draw', async () => {
      const decoder = D.type({
        a: D.string,
        b: D.number,
        c: D.array(D.boolean),
        d: D.nullable(D.string)
      })
      assert.deepStrictEqual(
        await pipe(decoder.decode({ c: [1] }), TE.mapLeft(D.draw))(),
        E.left(`required property "a"
└─ cannot decode undefined, should be string
required property "b"
└─ cannot decode undefined, should be number
required property "c"
└─ optional index 0
   └─ cannot decode 1, should be boolean
required property "d"
├─ member 0
│  └─ cannot decode undefined, should be null
└─ member 1
   └─ cannot decode undefined, should be string`)
      )
    })

    it('should support lazy combinators', async () => {
      assert.deepStrictEqual(
        await pipe(lazyDecoder.decode({ a: '1', b: {} }), TE.mapLeft(D.draw))(),
        E.left(`lazy type A
└─ optional property \"b\"
   └─ lazy type A
      └─ required property \"a\"
         └─ cannot decode undefined, should be string`)
      )
    })
  })
})
