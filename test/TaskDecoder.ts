import * as assert from 'assert'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import * as TE from 'fp-ts/lib/TaskEither'
import * as DE from '../src/DecodeError'
import * as FS from '../src/FreeSemigroup'
import * as G from '../src/Guard'
import * as KD from '../src/KleisliDecoder'
import * as KTD from '../src/KleisliTaskDecoder'
import * as _ from '../src/TaskDecoder'

const undefinedGuard: G.Guard<undefined> = {
  is: (u): u is undefined => u === undefined
}
const undef: _.TaskDecoder<undefined> = _.fromGuard(undefinedGuard, 'undefined')

const NumberFromString: _.TaskDecoder<number> = pipe(
  _.string,
  _.parse((s) => {
    const n = parseFloat(s)
    return isNaN(n) ? _.failure(s, 'parsable to a number') : _.success(n)
  })
)

interface PositiveBrand {
  readonly Positive: unique symbol
}
type Positive = number & PositiveBrand
const Positive: _.TaskDecoder<Positive> = pipe(
  _.number,
  _.refine((n): n is Positive => n > 0, 'Positive')
)

interface IntBrand {
  readonly Int: unique symbol
}
type Int = number & IntBrand
const Int: _.TaskDecoder<Int> = pipe(
  _.number,
  _.refine((n): n is Int => Number.isInteger(n), 'Int')
)

describe('TaskDecoder', () => {
  // -------------------------------------------------------------------------------------
  // instances
  // -------------------------------------------------------------------------------------

  it('map', async () => {
    const decoder = _.functorTaskDecoder.map(_.string, (s) => s + '!')
    assert.deepStrictEqual(await decoder.decode('a')(), KD.success('a!'))
  })

  it('alt', async () => {
    const decoder = _.altTaskDecoder.alt<string | number>(_.string, () => _.number)
    assert.deepStrictEqual(await decoder.decode('a')(), KD.success('a'))
    assert.deepStrictEqual(await decoder.decode(1)(), KD.success(1))
  })

  // -------------------------------------------------------------------------------------
  // primitives
  // -------------------------------------------------------------------------------------

  it('string', async () => {
    assert.deepStrictEqual(await _.string.decode('a')(), KD.success('a'))
    assert.deepStrictEqual(await _.string.decode(null)(), KD.failure(null, 'string'))
  })

  it('number', async () => {
    assert.deepStrictEqual(await _.number.decode(1)(), KD.success(1))
    assert.deepStrictEqual(await _.number.decode(null)(), KD.failure(null, 'number'))
  })

  it('boolean', async () => {
    assert.deepStrictEqual(await _.boolean.decode(true)(), KD.success(true))
    assert.deepStrictEqual(await _.boolean.decode(null)(), KD.failure(null, 'boolean'))
  })

  it('UnknownArray', async () => {
    assert.deepStrictEqual(await _.UnknownArray.decode([1, 'a'])(), KD.success([1, 'a']))
    assert.deepStrictEqual(await _.UnknownArray.decode(null)(), KD.failure(null, 'Array<unknown>'))
  })

  it('UnknownRecord', async () => {
    assert.deepStrictEqual(await _.UnknownRecord.decode({ a: 1, b: 'b' })(), KD.success({ a: 1, b: 'b' }))
    assert.deepStrictEqual(await _.UnknownRecord.decode(null)(), KD.failure(null, 'Record<string, unknown>'))
  })

  // -------------------------------------------------------------------------------------
  // constructors
  // -------------------------------------------------------------------------------------

  it('fromGuard', async () => {
    const decoder = _.fromGuard(G.string, 'string')
    assert.deepStrictEqual(await decoder.decode('a')(), KD.success('a'))
    assert.deepStrictEqual(await decoder.decode(null)(), KD.failure(null, 'string'))
  })

  describe('literal', () => {
    it('should decode a valid input', async () => {
      const decoder = _.literal('a', null, 'b', 1, true)
      assert.deepStrictEqual(await decoder.decode('a')(), KD.success('a'))
      assert.deepStrictEqual(await decoder.decode(null)(), KD.success(null))
    })

    it('should reject an invalid input', async () => {
      const decoder = _.literal('a', null)
      assert.deepStrictEqual(await decoder.decode('b')(), KD.failure('b', '"a" | null'))
    })
  })

  // -------------------------------------------------------------------------------------
  // combinators
  // -------------------------------------------------------------------------------------

  it('mapLeftWithInput', async () => {
    const decoder = pipe(
      _.number,
      _.mapLeftWithInput((u) => FS.of(DE.leaf(u, 'not a number')))
    )
    assert.deepStrictEqual(await decoder.decode('a')(), KD.failure('a', 'not a number'))
  })

  it('compose', async () => {
    interface IntBrand {
      readonly Int: unique symbol
    }

    type Int = number & IntBrand

    const decoder = pipe(_.number, _.compose(KTD.fromRefinement((n): n is Int => Number.isInteger(n), 'IntFromNumber')))
    assert.deepStrictEqual(await decoder.decode(1)(), KD.success(1))
    assert.deepStrictEqual(await decoder.decode('a')(), KD.failure('a', 'number'))
    assert.deepStrictEqual(await decoder.decode(1.2)(), KD.failure(1.2, 'IntFromNumber'))
  })

  describe('nullable', () => {
    it('should decode a valid input', async () => {
      const decoder = _.nullable(NumberFromString)
      assert.deepStrictEqual(await decoder.decode(null)(), KD.success(null))
      assert.deepStrictEqual(await decoder.decode('1')(), KD.success(1))
    })

    it('should reject an invalid input', async () => {
      const decoder = _.nullable(NumberFromString)
      assert.deepStrictEqual(
        await decoder.decode(undefined)(),
        E.left(
          FS.concat(
            FS.of(DE.member(0, FS.of(DE.leaf(undefined, 'null')))),
            FS.of(DE.member(1, FS.of(DE.leaf(undefined, 'string'))))
          )
        )
      )
      assert.deepStrictEqual(
        await decoder.decode('a')(),
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
      const decoder = _.type({
        a: _.string
      })
      assert.deepStrictEqual(await decoder.decode({ a: 'a' })(), KD.success({ a: 'a' }))
    })

    it('should strip additional fields', async () => {
      const decoder = _.type({
        a: _.string
      })
      assert.deepStrictEqual(await decoder.decode({ a: 'a', b: 1 })(), KD.success({ a: 'a' }))
    })

    it('should not strip fields corresponding to undefined values', async () => {
      const decoder = _.type({
        a: undef
      })
      assert.deepStrictEqual(await decoder.decode({})(), KD.success({ a: undefined }))
    })

    it('should reject an invalid input', async () => {
      const decoder = _.type({
        a: _.string
      })
      assert.deepStrictEqual(await decoder.decode(undefined)(), KD.failure(undefined, 'Record<string, unknown>'))
      assert.deepStrictEqual(
        await decoder.decode({ a: 1 })(),
        E.left(FS.of(DE.key('a', DE.required, FS.of(DE.leaf(1, 'string')))))
      )
    })

    it('should collect all errors', async () => {
      const decoder = _.type({
        a: _.string,
        b: _.number
      })
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

    it('should support getters', async () => {
      class A {
        get a() {
          return 'a'
        }
        get b() {
          return 'b'
        }
      }
      const decoder = _.type({ a: _.string, b: _.string })
      assert.deepStrictEqual(await decoder.decode(new A())(), KD.success({ a: 'a', b: 'b' }))
    })
  })

  describe('partial', () => {
    it('should decode a valid input', async () => {
      const decoder = _.partial({ a: _.string })
      assert.deepStrictEqual(await decoder.decode({ a: 'a' })(), KD.success({ a: 'a' }))
      assert.deepStrictEqual(await decoder.decode({})(), KD.success({}))
    })

    it('should strip additional fields', async () => {
      const decoder = _.partial({ a: _.string })
      assert.deepStrictEqual(await decoder.decode({ a: 'a', b: 1 })(), KD.success({ a: 'a' }))
    })

    it('should not add missing fields', async () => {
      const decoder = _.partial({ a: _.string })
      assert.deepStrictEqual(await decoder.decode({})(), KD.success({}))
    })

    it('should not strip fields corresponding to undefined values', async () => {
      const decoder = _.partial({ a: _.string })
      assert.deepStrictEqual(await decoder.decode({ a: undefined })(), KD.success({ a: undefined }))
    })

    it('should reject an invalid input', async () => {
      const decoder = _.partial({ a: _.string })
      assert.deepStrictEqual(await decoder.decode(undefined)(), KD.failure(undefined, 'Record<string, unknown>'))
      assert.deepStrictEqual(
        await decoder.decode({ a: 1 })(),
        E.left(FS.of(DE.key('a', DE.optional, FS.of(DE.leaf(1, 'string')))))
      )
    })

    it('should collect all errors', async () => {
      const decoder = _.partial({
        a: _.string,
        b: _.number
      })
      assert.deepStrictEqual(
        await decoder.decode({ a: 1, b: 'b' })(),
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
      const decoder = _.partial({ a: _.string, b: _.string })
      assert.deepStrictEqual(await decoder.decode(new A())(), KD.success({ a: 'a', b: 'b' }))
    })
  })

  describe('array', () => {
    it('should decode a valid input', async () => {
      const decoder = _.array(_.string)
      assert.deepStrictEqual(await decoder.decode([])(), KD.success([]))
      assert.deepStrictEqual(await decoder.decode(['a'])(), KD.success(['a']))
    })

    it('should reject an invalid input', async () => {
      const decoder = _.array(_.string)
      assert.deepStrictEqual(await decoder.decode(undefined)(), KD.failure(undefined, 'Array<unknown>'))
      assert.deepStrictEqual(
        await decoder.decode([1])(),
        E.left(FS.of(DE.index(0, DE.optional, FS.of(DE.leaf(1, 'string')))))
      )
    })

    it('should collect all errors', async () => {
      const decoder = _.array(_.string)
      assert.deepStrictEqual(
        await decoder.decode([1, 2])(),
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
      const decoder = _.record(_.number)
      assert.deepStrictEqual(await decoder.decode({})(), KD.success({}))
      assert.deepStrictEqual(await decoder.decode({ a: 1 })(), KD.success({ a: 1 }))
    })

    it('should reject an invalid value', async () => {
      const decoder = _.record(_.number)
      assert.deepStrictEqual(await decoder.decode(undefined)(), KD.failure(undefined, 'Record<string, unknown>'))
      assert.deepStrictEqual(
        await decoder.decode({ a: 'a' })(),
        E.left(FS.of(DE.key('a', DE.optional, FS.of(DE.leaf('a', 'number')))))
      )
    })

    it('should collect all errors', async () => {
      const decoder = _.record(_.number)
      assert.deepStrictEqual(
        await decoder.decode({ a: 'a', b: 'b' })(),
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
      const decoder = _.tuple(_.string, _.number)
      assert.deepStrictEqual(await decoder.decode(['a', 1])(), KD.success(['a', 1]))
    })

    it('should handle zero components', async () => {
      assert.deepStrictEqual(await _.tuple().decode([])(), KD.success([]))
    })

    it('should reject an invalid input', async () => {
      const decoder = _.tuple(_.string, _.number)
      assert.deepStrictEqual(await decoder.decode(undefined)(), KD.failure(undefined, 'Array<unknown>'))
      assert.deepStrictEqual(
        await decoder.decode(['a'])(),
        E.left(FS.of(DE.index(1, DE.required, FS.of(DE.leaf(undefined, 'number')))))
      )
      assert.deepStrictEqual(
        await decoder.decode([1, 2])(),
        E.left(FS.of(DE.index(0, DE.required, FS.of(DE.leaf(1, 'string')))))
      )
    })

    it('should collect all errors', async () => {
      const decoder = _.tuple(_.string, _.number)
      assert.deepStrictEqual(
        await decoder.decode([1, 'a'])(),
        E.left(
          FS.concat(
            FS.of(DE.index(0, DE.required, FS.of(DE.leaf(1, 'string')))),
            FS.of(DE.index(1, DE.required, FS.of(DE.leaf('a', 'number'))))
          )
        )
      )
    })

    it('should strip additional components', async () => {
      const decoder = _.tuple(_.string, _.number)
      assert.deepStrictEqual(await decoder.decode(['a', 1, true])(), KD.success(['a', 1]))
    })
  })

  describe('union', () => {
    it('should decode a valid input', async () => {
      assert.deepStrictEqual(await _.union(_.string).decode('a')(), KD.success('a'))
      const decoder = _.union(_.string, _.number)
      assert.deepStrictEqual(await decoder.decode('a')(), KD.success('a'))
      assert.deepStrictEqual(await decoder.decode(1)(), KD.success(1))
    })

    it('should reject an invalid input', async () => {
      const decoder = _.union(_.string, _.number)
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

  describe('refine', () => {
    it('should decode a valid input', async () => {
      const decoder = pipe(
        _.string,
        _.refine((s): s is string => s.length > 0, 'NonEmptyString')
      )
      assert.deepStrictEqual(await decoder.decode('a')(), KD.success('a'))
    })

    it('should reject an invalid input', async () => {
      const decoder = pipe(
        _.string,
        _.refine((s): s is string => s.length > 0, 'NonEmptyString')
      )
      assert.deepStrictEqual(await decoder.decode(undefined)(), KD.failure(undefined, 'string'))
      assert.deepStrictEqual(await decoder.decode('')(), KD.failure('', 'NonEmptyString'))
    })
  })

  describe('intersect', () => {
    it('should decode a valid input', async () => {
      const decoder = pipe(_.type({ a: _.string }), _.intersect(_.type({ b: _.number })))
      assert.deepStrictEqual(await decoder.decode({ a: 'a', b: 1 })(), KD.success({ a: 'a', b: 1 }))
    })

    it('should handle primitives', async () => {
      const decoder = pipe(Int, _.intersect(Positive))
      assert.deepStrictEqual(await decoder.decode(1)(), KD.success(1))
    })

    it('should accumulate all errors', async () => {
      const decoder = pipe(_.type({ a: _.string }), _.intersect(_.type({ b: _.number })))
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
    const sum = _.sum('_tag')

    it('should decode a valid input', async () => {
      const A = _.type({ _tag: _.literal('A'), a: _.string })
      const B = _.type({ _tag: _.literal('B'), b: _.number })
      const decoder = sum({ A, B })
      assert.deepStrictEqual(await decoder.decode({ _tag: 'A', a: 'a' })(), KD.success({ _tag: 'A', a: 'a' }))
      assert.deepStrictEqual(await decoder.decode({ _tag: 'B', b: 1 })(), KD.success({ _tag: 'B', b: 1 }))
    })

    it('should reject an invalid input', async () => {
      const A = _.type({ _tag: _.literal('A'), a: _.string })
      const B = _.type({ _tag: _.literal('B'), b: _.number })
      const decoder = sum({ A, B })
      assert.deepStrictEqual(await decoder.decode(null)(), KD.failure(null, 'Record<string, unknown>'))
      assert.deepStrictEqual(
        await decoder.decode({})(),
        E.left(FS.of(DE.key('_tag', DE.required, FS.of(DE.leaf(undefined, '"A" | "B"')))))
      )
      assert.deepStrictEqual(
        await decoder.decode({ _tag: 'A', a: 1 })(),
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

  const lazyDecoder: _.TaskDecoder<A> = _.lazy('A', () =>
    pipe(_.type({ a: NumberFromString }), _.intersect(_.partial({ b: lazyDecoder })))
  )

  describe('lazy', () => {
    it('should decode a valid input', async () => {
      assert.deepStrictEqual(await lazyDecoder.decode({ a: '1' })(), KD.success({ a: 1 }))
      assert.deepStrictEqual(await lazyDecoder.decode({ a: '1', b: { a: '2' } })(), KD.success({ a: 1, b: { a: 2 } }))
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
      const decoder = _.type({
        a: _.string,
        b: _.number,
        c: _.array(_.boolean),
        d: _.nullable(_.string)
      })
      assert.deepStrictEqual(
        await pipe(decoder.decode({ c: [1] }), TE.mapLeft(_.draw))(),
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
        await pipe(lazyDecoder.decode({ a: '1', b: {} }), TE.mapLeft(_.draw))(),
        E.left(`lazy type A
└─ optional property \"b\"
   └─ lazy type A
      └─ required property \"a\"
         └─ cannot decode undefined, should be string`)
      )
    })
  })

  it('stringify', async () => {
    assert.deepStrictEqual(await _.stringify(_.string.decode('a'))(), '"a"')
    assert.deepStrictEqual(await _.stringify(_.string.decode(null))(), 'cannot decode null, should be string')
  })
})
