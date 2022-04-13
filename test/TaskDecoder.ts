import * as assert from 'assert'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import { flow } from 'fp-ts/lib/function'
import * as T from 'fp-ts/lib/Task'
import * as TH from 'fp-ts/lib/These'
import * as TT from 'fp-ts/lib/TaskThese'
import * as util from 'util'
import { ordString } from 'fp-ts/lib/Ord'
import * as DE from '../src/DecodeError'
import * as D from '../src/Decoder'
import * as _ from '../src/TaskDecoder'
import { draw } from '../src/TreeReporter'
import * as U from './util'

const printValue = (a: unknown): string => 'Value:\n' + util.format(a)
const printErrors = (s: string): string => 'Errors:\n' + s
const printWarnings = (s: string): string => 'Warnings:\n' + s

export const printAll = TH.fold(printErrors, printValue, (e, a) => printValue(a) + '\n' + printWarnings(e))

export const print = flow(TH.mapLeft(draw), printAll)

interface UndefinedE {
  _tag: 'UndefinedE'
  actual: unknown
}
interface UndefinedLE extends DE.LeafE<UndefinedE> {}
const undef: _.TaskDecoder<unknown, UndefinedLE, undefined> = _.fromDecoder({
  decode: (i) => (typeof i === 'undefined' ? D.success(i) : D.failure(DE.leafE({ _tag: 'UndefinedE', actual: i })))
})

interface NumberFromStringE {
  _tag: 'NumberFromStringE'
  actual: unknown
}
interface NumberFromStringLE extends DE.LeafE<NumberFromStringE> {}
const NumberFromString: _.TaskDecoder<unknown, D.ParseError<DE.StringLE, NumberFromStringLE>, number> = pipe(
  _.string,
  _.parse((s) => {
    const n = parseFloat(s)
    return isNaN(n) ? _.failure(DE.leafE({ _tag: 'NumberFromStringE', actual: s })) : _.success(n)
  })
)

interface PositiveBrand {
  readonly Positive: unique symbol
}
type Positive = number & PositiveBrand
const Positive: _.TaskDecoder<
  unknown,
  D.RefinementError<DE.NumberLE | DE.NaNLE | DE.InfinityLE, number, Positive>,
  Positive
> = pipe(
  _.number,
  _.refine((n): n is Positive => n > 0)
)

interface IntBrand {
  readonly Int: unique symbol
}
type Int = number & IntBrand
const Int: _.TaskDecoder<unknown, D.RefinementError<DE.NumberLE | DE.NaNLE | DE.InfinityLE, number, Int>, Int> = pipe(
  _.number,
  _.refine((n): n is Int => Number.isInteger(n))
)

describe('UnknownTaskDecoder', () => {
  // -------------------------------------------------------------------------------------
  // instances
  // -------------------------------------------------------------------------------------

  it('Functor', async () => {
    const decoder = _.Functor.map(_.string, (s) => s + '!')
    assert.deepStrictEqual(await decoder.decode('a')(), D.success('a!'))
  })

  // -------------------------------------------------------------------------------------
  // primitives
  // -------------------------------------------------------------------------------------

  it('string', async () => {
    assert.deepStrictEqual(await _.string.decode('a')(), D.success('a'))
    assert.deepStrictEqual(await _.string.decode(null)(), D.failure('string'))
  })

  it('number', async () => {
    assert.deepStrictEqual(await _.number.decode(1)(), D.success(1))
    assert.deepStrictEqual(await _.number.decode(null)(), D.failure('number'))
  })

  it('boolean', async () => {
    assert.deepStrictEqual(await _.boolean.decode(true)(), D.success(true))
    assert.deepStrictEqual(await _.boolean.decode(null)(), D.failure('boolean'))
  })

  it('UnknownArray', async () => {
    assert.deepStrictEqual(await _.UnknownArray.decode([1, 'a'])(), D.success([1, 'a']))
    assert.deepStrictEqual(await _.UnknownArray.decode(null)(), D.failure('Array<unknown>'))
  })

  it('UnknownRecord', async () => {
    assert.deepStrictEqual(await _.UnknownRecord.decode({ a: 1, b: 'b' })(), D.success({ a: 1, b: 'b' }))
    assert.deepStrictEqual(await _.UnknownRecord.decode(null)(), D.failure('Record<string, unknown>'))
  })

  // -------------------------------------------------------------------------------------
  // constructors
  // -------------------------------------------------------------------------------------

  describe('literal', () => {
    it('should decode a valid input', async () => {
      const decoder = _.literal('a', null, 'b', 1, true)
      assert.deepStrictEqual(await decoder.decode('a')(), D.success('a'))
      assert.deepStrictEqual(await decoder.decode(null)(), D.success(null))
    })

    it('should reject an invalid input', async () => {
      const decoder = _.literal('a', null)
      assert.deepStrictEqual(await decoder.decode('b')(), D.failure('"a" | null'))
    })
  })

  // -------------------------------------------------------------------------------------
  // combinators
  // -------------------------------------------------------------------------------------

  it('mapLeft', async () => {
    const decoder = pipe(
      _.number,
      _.mapLeft((u) => DE.leafE(u))
    )
    assert.deepStrictEqual(await decoder.decode('a')(), D.failure('not a number'))
  })

  it('compose', async () => {
    it('should accumulate warnings', async () => {
      const decoder = pipe(_.number, _.compose(_.number))
      U.deepStrictEqual(
        pipe(await decoder.decode(NaN)(), print),
        `Value:
NaN
Warnings:
2 error(s) found while decoding (composition)
├─ value is NaN
└─ value is NaN`
      )
    })

    it('should accumulate warnings and errors', async () => {
      const decoder = pipe(_.number, _.compose(_.string))
      U.deepStrictEqual(
        pipe(await decoder.decode(NaN)(), print),
        `Errors:
2 error(s) found while decoding (composition)
├─ value is NaN
└─ cannot decode NaN, expected a string`
      )
    })
  })

  describe('nullable', () => {
    it('should decode a valid input', async () => {
      const decoder = _.nullable(NumberFromString)
      assert.deepStrictEqual(await decoder.decode(null)(), D.success(null))
      assert.deepStrictEqual(await decoder.decode('1')(), D.success(1))
    })

    it('should reject an invalid input', async () => {
      const decoder = _.nullable(NumberFromString)
      expect(await decoder.decode(undefined)()).toMatchSnapshot()
      expect(await decoder.decode('a')()).toMatchSnapshot()
    })
  })

  describe('struct', () => {
    it('should decode a valid input', async () => {
      const decoder = _.struct(ordString)(T.ApplicativePar)({
        a: _.string
      })
      assert.deepStrictEqual(await decoder.decode({ a: 'a' })(), D.success({ a: 'a' }))
    })

    it('should strip additional fields', async () => {
      const decoder = _.struct(ordString)(T.ApplicativePar)({
        a: _.string
      })
      assert.deepStrictEqual(await decoder.decode({ a: 'a', b: 1 })(), D.success({ a: 'a' }))
    })

    it('should not strip fields corresponding to undefined values', async () => {
      const decoder = _.struct(ordString)(T.ApplicativePar)({
        a: undef
      })
      assert.deepStrictEqual(await decoder.decode({})(), D.success({ a: undefined }))
    })

    it('should reject an invalid input', async () => {
      const decoder = _.struct(ordString)(T.ApplicativePar)({
        a: _.string
      })
      assert.deepStrictEqual(await decoder.decode(undefined)(), D.failure('Record<string, unknown>'))
      expect(await decoder.decode({ a: 1 })()).toMatchSnapshot()
    })

    it('should collect all errors', async () => {
      const decoder = _.struct(ordString)(T.ApplicativePar)({
        a: _.string,
        b: _.number
      })
      expect(await decoder.decode({})()).toMatchSnapshot()
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
      const decoder = _.struct(ordString)(T.ApplicativePar)({ a: _.string, b: _.string })
      assert.deepStrictEqual(await decoder.decode(new A())(), D.success({ a: 'a', b: 'b' }))
    })
  })

  describe('partial', () => {
    it('should decode a valid input', async () => {
      const decoder = _.partial(ordString)(T.ApplicativePar)({ a: _.string })
      assert.deepStrictEqual(await decoder.decode({ a: 'a' })(), D.success({ a: 'a' }))
      assert.deepStrictEqual(await decoder.decode({})(), D.success({}))
    })

    it('should strip additional fields', async () => {
      const decoder = _.partial(ordString)(T.ApplicativePar)({ a: _.string })
      assert.deepStrictEqual(await decoder.decode({ a: 'a', b: 1 })(), D.success({ a: 'a' }))
    })

    it('should not add missing fields', async () => {
      const decoder = _.partial(ordString)(T.ApplicativePar)({ a: _.string })
      assert.deepStrictEqual(await decoder.decode({})(), D.success({}))
    })

    it('should not strip fields corresponding to undefined values', async () => {
      const decoder = _.partial(ordString)(T.ApplicativePar)({ a: _.string })
      assert.deepStrictEqual(await decoder.decode({ a: undefined })(), D.success({ a: undefined }))
    })

    it('should reject an invalid input', async () => {
      const decoder = _.partial(ordString)(T.ApplicativePar)({ a: _.string })
      assert.deepStrictEqual(await decoder.decode(undefined)(), D.failure('Record<string, unknown>'))
      expect(await decoder.decode({ a: 1 })()).toMatchSnapshot()
    })

    it('should collect all errors', async () => {
      const decoder = _.partial(ordString)(T.ApplicativePar)({
        a: _.string,
        b: _.number
      })
      expect(await decoder.decode({ a: 1, b: 'b' })()).toMatchSnapshot()
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
      const decoder = _.partial(ordString)(T.ApplicativePar)({ a: _.string, b: _.string })
      assert.deepStrictEqual(await decoder.decode(new A())(), D.success({ a: 'a', b: 'b' }))
    })
  })

  describe('array', () => {
    it('should decode a valid input', async () => {
      const decoder = _.array(T.ApplicativePar)(_.string)
      assert.deepStrictEqual(await decoder.decode([])(), D.success([]))
      assert.deepStrictEqual(await decoder.decode(['a'])(), D.success(['a']))
    })

    it('should reject an invalid input', async () => {
      const decoder = _.array(T.ApplicativePar)(_.string)
      assert.deepStrictEqual(await decoder.decode(undefined)(), D.failure('Array<unknown>'))
      expect(await decoder.decode([1])()).toMatchSnapshot()
    })

    it('should collect all errors', async () => {
      const decoder = _.array(T.ApplicativePar)(_.string)
      expect(await decoder.decode([1, 2])()).toMatchSnapshot()
    })
  })

  describe('record', () => {
    it('should decode a valid value', async () => {
      const decoder = _.record(ordString)(T.ApplicativePar)(_.number)
      assert.deepStrictEqual(await decoder.decode({})(), D.success({}))
      assert.deepStrictEqual(await decoder.decode({ a: 1 })(), D.success({ a: 1 }))
    })

    it('should reject an invalid value', async () => {
      const decoder = _.record(ordString)(T.ApplicativePar)(_.number)
      assert.deepStrictEqual(await decoder.decode(undefined)(), D.failure('Record<string, unknown>'))
      expect(await decoder.decode({ a: 'a' })()).toMatchSnapshot()
    })

    it('should collect all errors', async () => {
      const decoder = _.record(ordString)(T.ApplicativePar)(_.number)
      expect(await decoder.decode({ a: 'a', b: 'b' })()).toMatchSnapshot()
    })
  })

  describe('tuple', () => {
    it('should decode a valid input', async () => {
      const decoder = _.tuple(T.ApplicativePar)(_.string, _.number)
      assert.deepStrictEqual(await decoder.decode(['a', 1])(), D.success(['a', 1]))
    })

    it('should handle zero components', async () => {
      assert.deepStrictEqual(await _.tuple(T.ApplicativePar)().decode([])(), D.success([]))
    })

    it('should reject an invalid input', async () => {
      const decoder = _.tuple(T.ApplicativePar)(_.string, _.number)
      assert.deepStrictEqual(await decoder.decode(undefined)(), D.failure('Array<unknown>'))
      expect(await decoder.decode(['a'])()).toMatchSnapshot()
      expect(await decoder.decode([1, 2])()).toMatchSnapshot()
    })

    it('should collect all errors', async () => {
      const decoder = _.tuple(T.ApplicativePar)(_.string, _.number)
      expect(await decoder.decode([1, 'a'])()).toMatchSnapshot()
    })

    it('should strip additional components', async () => {
      const decoder = _.tuple(T.ApplicativePar)(_.string, _.number)
      assert.deepStrictEqual(await decoder.decode(['a', 1, true])(), D.success(['a', 1]))
    })
  })

  describe('union', () => {
    it('should decode a valid input', async () => {
      assert.deepStrictEqual(await _.union(_.string).decode('a')(), D.success('a'))
      const decoder = _.union(_.string, _.number)
      assert.deepStrictEqual(await decoder.decode('a')(), D.success('a'))
      assert.deepStrictEqual(await decoder.decode(1)(), D.success(1))
    })

    it('should reject an invalid input', async () => {
      const decoder = _.union(_.string, _.number)
      expect(await decoder.decode(true)()).toMatchSnapshot()
    })
  })

  describe('refine', () => {
    it('should decode a valid input', async () => {
      const decoder = pipe(
        _.string,
        _.refine((s): s is string => s.length > 0)
      )
      assert.deepStrictEqual(await decoder.decode('a')(), D.success('a'))
    })

    it('should reject an invalid input', async () => {
      const decoder = pipe(
        _.string,
        _.refine((s): s is string => s.length > 0)
      )
      assert.deepStrictEqual(await decoder.decode(undefined)(), D.failure('string'))
      assert.deepStrictEqual(await decoder.decode('')(), D.failure(''))
    })
  })

  describe('intersect', () => {
    it('should decode a valid input', async () => {
      const decoder = pipe(
        _.struct(ordString)(T.ApplicativePar)({ a: _.string }),
        _.intersect(_.struct(ordString)(T.ApplicativePar)({ b: _.number }))
      )
      assert.deepStrictEqual(await decoder.decode({ a: 'a', b: 1 })(), D.success({ a: 'a', b: 1 }))
    })

    it('should handle primitives', async () => {
      const decoder = pipe(Int, _.intersect(Positive))
      assert.deepStrictEqual(await decoder.decode(1)(), D.success(1))
    })

    it('should accumulate all errors', async () => {
      const decoder = pipe(
        _.struct(ordString)(T.ApplicativePar)({ a: _.string }),
        _.intersect(_.struct(ordString)(T.ApplicativePar)({ b: _.number }))
      )
      expect(await decoder.decode({ a: 'a' })()).toMatchSnapshot()
      expect(await decoder.decode({ b: 1 })()).toMatchSnapshot()
      expect(await decoder.decode({})()).toMatchSnapshot()
    })
  })

  describe('sum', () => {
    const sum = _.sum('_tag')

    it('should decode a valid input', async () => {
      const A = _.struct(ordString)(T.ApplicativePar)({ _tag: _.literal('A'), a: _.string })
      const B = _.struct(ordString)(T.ApplicativePar)({ _tag: _.literal('B'), b: _.number })
      const decoder = sum({ A, B })
      assert.deepStrictEqual(await decoder.decode({ _tag: 'A', a: 'a' })(), D.success({ _tag: 'A', a: 'a' }))
      assert.deepStrictEqual(await decoder.decode({ _tag: 'B', b: 1 })(), D.success({ _tag: 'B', b: 1 }))
    })

    it('should reject an invalid input', async () => {
      const A = _.struct(ordString)(T.ApplicativePar)({ _tag: _.literal('A'), a: _.string })
      const B = _.struct(ordString)(T.ApplicativePar)({ _tag: _.literal('B'), b: _.number })
      const decoder = sum({ A, B })
      assert.deepStrictEqual(await decoder.decode(null)(), D.failure('Record<string, unknown>'))
      expect(await decoder.decode({})()).toMatchSnapshot()
      expect(await decoder.decode({ _tag: 'A', a: 1 })()).toMatchSnapshot()
    })

    it('should support empty records', async () => {
      const decoder = sum({})
      expect(await decoder.decode({})()).toMatchSnapshot()
    })
  })

  interface Category {
    name: string
    categories: ReadonlyArray<Category>
  }

  const Category: _.TaskDecoder<unknown, any, { name: string; categories: Category[] }> = _.lazy('Category', () =>
    // @ts-expect-error: desc
    _.struct(ordString)(T.ApplicativePar)({
      name: _.string,
      categories: _.array(T.ApplicativePar)(Category)
    })
  )

  describe('lazy', () => {
    it('should return a right', async () => {
      const i1 = { name: 'a', categories: [] }
      U.deepStrictEqual(await Category.decode(i1)(), TH.right(i1))
      const i2 = {
        name: 'a',
        categories: [
          { name: 'b', categories: [] },
          { name: 'c', categories: [{ name: 'd', categories: [] }] }
        ]
      }
      U.deepStrictEqual(await Category.decode(i2)(), TH.right(i2))
    })

    it('should return a left', async () => {
      U.deepStrictEqual(
        pipe(await Category.decode({ name: 'a', categories: [{}] })(), print),
        `Errors:
1 error(s) found while decoding lazy decoder Category
└─ 1 error(s) found while decoding (struct)
   └─ 1 error(s) found while decoding required key \"categories\"
      └─ 1 error(s) found while decoding (array)
         └─ 1 error(s) found while decoding optional index 0
            └─ 1 error(s) found while decoding lazy decoder Category
               └─ 2 error(s) found while checking keys
                  ├─ missing required key \"name\"
                  └─ missing required key \"categories\"`
      )
    })
  })

  // -------------------------------------------------------------------------------------
  // utils
  // -------------------------------------------------------------------------------------

  describe('draw', () => {
    it('draw', async () => {
      const decoder = _.struct(ordString)(T.ApplicativePar)({
        a: _.string,
        b: _.number,
        c: _.array(T.ApplicativePar)(_.boolean),
        d: _.nullable(_.string)
      })
      assert.deepStrictEqual(
        await pipe(decoder.decode({ c: [1] }), TT.mapLeft(draw))(),
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
  })
})
