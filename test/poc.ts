import { pipe } from 'fp-ts/lib/pipeable'
import * as _ from '../src/poc'
import * as U from './util'
import * as TH from 'fp-ts/lib/These'
import { flow, tuple } from 'fp-ts/lib/function'
import * as RA from 'fp-ts/lib/ReadonlyArray'

export const print = flow(_.draw, _.print)

describe('poc', () => {
  // -------------------------------------------------------------------------------------
  // instances
  // -------------------------------------------------------------------------------------

  it('Functor', () => {
    const decoder = _.Functor.map(_.string, (s) => s + '!')
    U.deepStrictEqual(decoder.decode('a'), _.success('a!'))
  })

  it('Bifunctor', () => {
    const decoder = _.Functor.map(_.string, (s) => s + '!')
    U.deepStrictEqual(decoder.decode('a'), _.success('a!'))
  })

  it('map', () => {
    const decoder = pipe(
      _.string,
      _.map((s) => s.trim())
    )
    U.deepStrictEqual(decoder.decode('a'), _.success('a'))
    U.deepStrictEqual(decoder.decode(' a '), _.success('a'))
  })

  it('mapLeft', () => {
    const decoder = pipe(
      _.string,
      _.mapLeft(() => 'not a string')
    )
    U.deepStrictEqual(decoder.decode(null), _.failure('not a string'))
  })

  describe('compose', () => {
    it('should accumulate warnings', () => {
      const decoder = pipe(_.number, _.compose(_.number))
      U.deepStrictEqual(
        pipe(decoder.decode(NaN), print),
        `Value:
NaN
Warnings:
2 error(s) found while decoding a composition
├─ value is NaN
└─ value is NaN`
      )
    })

    it('should accumulate warnings and errors', () => {
      const decoder = pipe(_.number, _.compose(_.string))
      U.deepStrictEqual(
        pipe(decoder.decode(NaN), print),
        `Errors:
2 error(s) found while decoding a composition
├─ value is NaN
└─ cannot decode NaN, expected a string`
      )
    })
  })

  // -------------------------------------------------------------------------------------
  // primitives
  // -------------------------------------------------------------------------------------

  it('string', async () => {
    U.deepStrictEqual(_.string.decode('a'), _.success('a'))
    U.deepStrictEqual(
      pipe(_.string.decode(null), print),
      `Errors:
cannot decode null, expected a string`
    )
  })

  describe('number', () => {
    it('number', async () => {
      U.deepStrictEqual(_.number.decode(1), _.success(1))
      U.deepStrictEqual(
        pipe(_.number.decode(null), print),
        `Errors:
cannot decode null, expected a number`
      )
    })

    it('should warn NaN', () => {
      U.deepStrictEqual(_.number.decode(NaN), _.warning(_.naNLE, NaN))
    })

    it('should warn Infinity', () => {
      U.deepStrictEqual(_.number.decode(Infinity), _.warning(_.infinityLE, Infinity))
      U.deepStrictEqual(_.number.decode(-Infinity), _.warning(_.infinityLE, -Infinity))
      U.deepStrictEqual(
        pipe(_.number.decode(Infinity), print),
        `Value:
null
Warnings:
value is Infinity`
      )
    })
  })

  it('boolean', async () => {
    U.deepStrictEqual(_.boolean.decode(true), _.success(true))
    U.deepStrictEqual(
      pipe(_.boolean.decode(null), print),
      `Errors:
cannot decode null, expected a boolean`
    )
  })

  it('UnknownArray', async () => {
    U.deepStrictEqual(_.UnknownArray.decode([1, 'a']), _.success([1, 'a']))
    U.deepStrictEqual(
      pipe(_.UnknownArray.decode(null), print),
      `Errors:
cannot decode null, expected an array`
    )
  })

  it('UnknownRecord', async () => {
    U.deepStrictEqual(_.UnknownRecord.decode({ a: 1, b: 'b' }), _.success({ a: 1, b: 'b' }))
    U.deepStrictEqual(
      pipe(_.UnknownRecord.decode(null), print),
      `Errors:
cannot decode null, expected an object`
    )
  })

  // -------------------------------------------------------------------------------------
  // constructors
  // -------------------------------------------------------------------------------------

  describe('literal', () => {
    it('should decode a valid input', async () => {
      const decoder = _.literal('a', null, 'b', 1, true)
      U.deepStrictEqual(decoder.decode('a'), _.success('a' as const))
      U.deepStrictEqual(decoder.decode(null), _.success(null))
    })

    it('should reject an invalid input', async () => {
      const decoder = _.literal('a', null)
      U.deepStrictEqual(
        pipe(decoder.decode('b'), print),
        `Errors:
cannot decode \"b\", expected one of \"a\", null`
      )
    })
  })

  describe('refinement', () => {
    interface NonEmptyStringBrand {
      readonly NonEmptyString: unique symbol
    }

    type NonEmptyString = string & NonEmptyStringBrand

    const NonEmptyStringD = pipe(
      _.stringD,
      _.fromRefinement(
        (s): s is NonEmptyString => s.length > 0,
        (actual) => _.leafE(_.messageE(actual, 'expected a non empty string'))
      )
    )

    it('should decode a valid input', async () => {
      U.deepStrictEqual(NonEmptyStringD.decode('a'), _.success('a'))
    })

    it('should reject an invalid input', async () => {
      U.deepStrictEqual(
        pipe(NonEmptyStringD.decode(''), print),
        `Errors:
1 error(s) found while decoding a refinement
└─ expected a non empty string`
      )
    })
  })

  describe('parser', () => {
    const NumberFromString = pipe(
      _.stringD,
      _.parse((s) => _.number.decode(parseFloat(s)))
    )

    it('should decode a valid input', async () => {
      U.deepStrictEqual(NumberFromString.decode('1'), _.success(1))
    })

    it('should reject an invalid input', async () => {
      U.deepStrictEqual(
        pipe(NumberFromString.decode(''), print),
        `Value:
NaN
Warnings:
1 error(s) found while decoding a parser
└─ value is NaN`
      )
    })
  })

  // -------------------------------------------------------------------------------------
  // combinators
  // -------------------------------------------------------------------------------------

  describe('nullable', () => {
    it('should decode a valid input', () => {
      const decoder = _.nullable(_.string)
      U.deepStrictEqual(decoder.decode(null), _.success(null))
      U.deepStrictEqual(decoder.decode('a'), _.success('a'))
    })

    it('should reject an invalid input', () => {
      const decoder = _.nullable(_.string)
      U.deepStrictEqual(
        pipe(decoder.decode(undefined), print),
        `Errors:
1 error(s) found while decoding a nullable
└─ cannot decode undefined, expected a string`
      )
    })
  })

  describe('struct', () => {
    it('should decode a valid input', async () => {
      const decoder = _.struct({
        a: _.string
      })
      U.deepStrictEqual(decoder.decode({ a: 'a' }), _.success({ a: 'a' }))
    })

    it('should strip additional fields', async () => {
      const decoder = _.struct({
        a: _.string
      })
      U.deepStrictEqual(
        pipe(decoder.decode({ a: 'a', b: 1 }), print),
        `Value:
{
  \"a\": \"a\"
}
Warnings:
1 error(s) found while checking keys
└─ unexpected key \"b\"`
      )
    })

    it('should not strip fields corresponding to undefined values', async () => {
      const decoder = _.struct({
        a: _.literal(undefined)
      })
      U.deepStrictEqual(decoder.decode({ a: undefined }), _.success({ a: undefined }))
    })

    it('should reject an invalid input', async () => {
      const decoder = _.struct({
        a: _.string
      })
      U.deepStrictEqual(
        pipe(decoder.decode(undefined), print),
        `Errors:
cannot decode undefined, expected an object`
      )
      U.deepStrictEqual(
        pipe(decoder.decode({ a: 1 }), print),
        `Errors:
1 error(s) found while decoding a struct
└─ 1 error(s) found while decoding required key \"a\"
   └─ cannot decode 1, expected a string`
      )
    })

    it('should collect all errors', async () => {
      const decoder = _.struct({
        a: _.string,
        b: _.number
      })
      U.deepStrictEqual(
        pipe(decoder.decode({}), print),
        `Errors:
2 error(s) found while checking keys
├─ missing required key \"a\"
└─ missing required key \"b\"`
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
      const decoder = _.struct({ a: _.string, b: _.string })
      U.deepStrictEqual(decoder.decode(new A()), _.success({ a: 'a', b: 'b' }))
    })
  })

  describe('partial', () => {
    it('should decode a valid input', async () => {
      const decoder = _.partial({ a: _.string })
      U.deepStrictEqual(decoder.decode({ a: 'a' }), _.success({ a: 'a' }))
      U.deepStrictEqual(decoder.decode({}), _.success({}))
    })

    it('should strip additional fields', async () => {
      const decoder = _.partial({ a: _.string })
      U.deepStrictEqual(
        pipe(decoder.decode({ a: 'a', b: 1 }), print),
        `Value:
{
  \"a\": \"a\"
}
Warnings:
1 error(s) found while checking keys
└─ unexpected key \"b\"`
      )
    })

    it('should not add missing fields', async () => {
      const decoder = _.partial({ a: _.string })
      U.deepStrictEqual(decoder.decode({}), _.success({}))
    })

    it('should not strip fields corresponding to undefined values', async () => {
      const decoder = _.partial({ a: _.string })
      U.deepStrictEqual(decoder.decode({ a: undefined }), _.success({ a: undefined }))
    })

    it('should reject an invalid input', async () => {
      const decoder = _.partial({ a: _.string })
      U.deepStrictEqual(
        pipe(decoder.decode(undefined), print),
        `Errors:
cannot decode undefined, expected an object`
      )
      U.deepStrictEqual(
        pipe(decoder.decode({ a: 1 }), print),
        `Errors:
1 error(s) found while decoding a partial
└─ 1 error(s) found while decoding optional key \"a\"
   └─ cannot decode 1, expected a string`
      )
    })

    it('should collect all errors', async () => {
      const decoder = _.partial({
        a: _.string,
        b: _.number
      })
      U.deepStrictEqual(
        pipe(decoder.decode({ a: 1, b: 'b' }), print),
        `Errors:
2 error(s) found while decoding a partial
├─ 1 error(s) found while decoding optional key \"a\"
│  └─ cannot decode 1, expected a string
└─ 1 error(s) found while decoding optional key \"b\"
   └─ cannot decode \"b\", expected a number`
      )
    })

    it('should accumulate warnings', async () => {
      const decoder = _.partial({
        a: _.number
      })
      U.deepStrictEqual(
        pipe(decoder.decode({ a: NaN }), print),
        `Value:
{
  \"a\": null
}
Warnings:
1 error(s) found while decoding a partial
└─ 1 error(s) found while decoding optional key \"a\"
   └─ value is NaN`
      )
    })
  })

  describe('array', () => {
    it('should decode a valid input', async () => {
      const decoder = _.array(_.string)
      U.deepStrictEqual(decoder.decode([]), _.success([]))
      U.deepStrictEqual(decoder.decode(['a']), _.success(['a']))
    })

    it('should accumulate warnings', async () => {
      const decoder = _.array(_.number)
      U.deepStrictEqual(
        pipe(decoder.decode([1, NaN]), print),
        `Value:
[
  1,
  null
]
Warnings:
1 error(s) found while decoding an array
└─ 1 error(s) found while decoding optional index 1
   └─ value is NaN`
      )
    })

    it('should reject an invalid input', async () => {
      const decoder = _.array(_.string)
      U.deepStrictEqual(
        pipe(decoder.decode(undefined), print),
        `Errors:
cannot decode undefined, expected an array`
      )
      U.deepStrictEqual(
        pipe(decoder.decode([1]), print),
        `Errors:
1 error(s) found while decoding an array
└─ 1 error(s) found while decoding optional index 0
   └─ cannot decode 1, expected a string`
      )
    })

    it('should collect all errors', async () => {
      const decoder = _.array(_.string)
      U.deepStrictEqual(
        pipe(decoder.decode([1, 2]), print),
        `Errors:
2 error(s) found while decoding an array
├─ 1 error(s) found while decoding optional index 0
│  └─ cannot decode 1, expected a string
└─ 1 error(s) found while decoding optional index 1
   └─ cannot decode 2, expected a string`
      )
    })
  })

  describe('record', () => {
    it('should decode a valid value', async () => {
      const decoder = _.record(_.number)
      U.deepStrictEqual(decoder.decode({}), _.success({}))
      U.deepStrictEqual(decoder.decode({ a: 1 }), _.success({ a: 1 }))
    })

    it('should reject an invalid value', async () => {
      const decoder = _.record(_.number)
      U.deepStrictEqual(
        pipe(decoder.decode(undefined), print),
        `Errors:
cannot decode undefined, expected an object`
      )
      U.deepStrictEqual(
        pipe(decoder.decode({ a: 'a' }), print),
        `Errors:
1 error(s) found while decoding a record
└─ 1 error(s) found while decoding optional key \"a\"
   └─ cannot decode \"a\", expected a number`
      )
    })

    it('should collect all errors', async () => {
      const decoder = _.record(_.number)
      U.deepStrictEqual(
        pipe(decoder.decode({ a: 'a', b: 'b' }), print),
        `Errors:
2 error(s) found while decoding a record
├─ 1 error(s) found while decoding optional key \"a\"
│  └─ cannot decode \"a\", expected a number
└─ 1 error(s) found while decoding optional key \"b\"
   └─ cannot decode \"b\", expected a number`
      )
    })

    it('should accumulate warnings', async () => {
      const decoder = _.record(_.number)
      U.deepStrictEqual(
        pipe(decoder.decode({ a: NaN }), print),
        `Value:
{
  \"a\": null
}
Warnings:
1 error(s) found while decoding a record
└─ 1 error(s) found while decoding optional key \"a\"
   └─ value is NaN`
      )
    })
  })

  describe('fromSum', () => {
    it('should return a right', () => {
      const decoder = _.fromSum('type')({
        1: _.fromStruct({ type: _.literal(1), a: _.string }),
        2: _.fromStruct({ type: _.literal(2), b: _.number })
      })
      U.deepStrictEqual(decoder.decode({ type: 1, a: 'a' }), TH.right({ type: 1, a: 'a' } as const))
      U.deepStrictEqual(decoder.decode({ type: 2, b: 1 }), TH.right({ type: 2, b: 1 } as const))
    })

    it('should return a left', () => {
      const decoder = _.fromSum('type')({
        1: _.fromStruct({ type: _.literal(1), a: _.string }),
        2: _.fromStruct({ type: _.literal(2), b: _.number })
      })
      U.deepStrictEqual(
        pipe(decoder.decode({ type: 1, a: 1 }), print),
        `Errors:
1 error(s) found while decoding a sum
└─ 1 error(s) found while decoding member 1
   └─ 1 error(s) found while decoding a struct
      └─ 1 error(s) found while decoding required key \"a\"
         └─ cannot decode 1, expected a string`
      )
      U.deepStrictEqual(
        pipe(decoder.decode({ type: 3, a: 1 }), print),
        `Errors:
1 error(s) found while decoding sum tag \"type\", expected one of \"1\", \"2\"`
      )
    })

    it('should handle tuples', () => {
      const decoder = _.fromSum('0')({
        A: _.tuple(_.literal('A'), _.string),
        B: _.tuple(_.literal('B'), _.number)
      })
      U.deepStrictEqual(decoder.decode(['A', 'a']), TH.right(tuple('A' as const, 'a')))
    })
  })

  describe('sum', () => {
    it('should return a right', () => {
      const decoder = _.sum('type')({
        1: _.struct({ type: _.literal(1), a: _.string }),
        2: _.struct({ type: _.literal(2), b: _.number })
      })
      U.deepStrictEqual(decoder.decode({ type: 1, a: 'a' }), TH.right({ type: 1, a: 'a' } as const))
      U.deepStrictEqual(decoder.decode({ type: 2, b: 1 }), TH.right({ type: 2, b: 1 } as const))
    })

    it('should return a left', () => {
      const decoder = _.sum('type')({
        1: _.struct({ type: _.literal(1), a: _.string }),
        2: _.struct({ type: _.literal(2), b: _.number })
      })
      U.deepStrictEqual(
        pipe(decoder.decode({ type: 1, a: 1 }), print),
        `Errors:
1 error(s) found while decoding a sum
└─ 1 error(s) found while decoding member 1
   └─ 1 error(s) found while decoding a struct
      └─ 1 error(s) found while decoding required key \"a\"
         └─ cannot decode 1, expected a string`
      )
    })

    it('should handle tuples', () => {
      const decoder = _.sum('0')({
        A: _.tuple(_.literal('A'), _.string),
        B: _.tuple(_.literal('B'), _.number)
      })
      U.deepStrictEqual(decoder.decode(['A', 'a']), TH.right(tuple('A' as const, 'a')))
    })
  })

  describe('intersect', () => {
    describe('struct', () => {
      it('should not raise invalid warnings', () => {
        const I1 = _.struct({
          a: _.string
        })
        const I2 = _.struct({
          b: _.number
        })
        const I = pipe(I1, _.intersect(I2))
        U.deepStrictEqual(I.decode({ a: 'a', b: 1 }), TH.right({ a: 'a', b: 1 }))
      })

      it('should raise a warning with an additional key', () => {
        const I1 = _.struct({
          a: _.string
        })
        const I2 = _.struct({
          b: _.number
        })
        const I = pipe(I1, _.intersect(I2))
        U.deepStrictEqual(
          pipe(I.decode({ a: 'a', b: 1, c: true }), print),
          `Value:
{
  \"a\": \"a\",
  \"b\": 1
}
Warnings:
2 error(s) found while decoding an intersection
├─ 1 error(s) found while decoding member 0
│  └─ 1 error(s) found while checking keys
│     └─ unexpected key \"c\"
└─ 1 error(s) found while decoding member 1
   └─ 1 error(s) found while checking keys
      └─ unexpected key \"c\"`
        )
      })
    })

    it('should raise a warning with an additional key (nested)', () => {
      const I1 = _.struct({ a: _.struct({ b: _.string }) })
      const I2 = _.struct({ a: _.struct({ c: _.number }) })
      const I = pipe(I1, _.intersect(I2))
      U.deepStrictEqual(
        pipe(I.decode({ a: { b: 'a', c: 1, d: true } }), print),
        `Value:
{
  \"a\": {
    \"b\": \"a\",
    \"c\": 1
  }
}
Warnings:
2 error(s) found while decoding an intersection
├─ 1 error(s) found while decoding member 0
│  └─ 1 error(s) found while decoding a struct
│     └─ 1 error(s) found while decoding required key \"a\"
│        └─ 1 error(s) found while checking keys
│           └─ unexpected key \"d\"
└─ 1 error(s) found while decoding member 1
   └─ 1 error(s) found while decoding a struct
      └─ 1 error(s) found while decoding required key \"a\"
         └─ 1 error(s) found while checking keys
            └─ unexpected key \"d\"`
      )
    })

    // describe('tuple', () => {
    //   it('should not raise invalid warnings', () => {
    //     const I1 = _.tuple(_.string)
    //     const I2 = _.tuple(_.string, _.number)
    //     const I = pipe(I1, _.intersect(I2))
    //     U.deepStrictEqual(I.decode(['a', 1]), TH.right({ a: 'a', b: 1 }))
    //   })
    // })
  })

  describe('tuple', () => {
    it('should decode a valid input', async () => {
      const decoder = _.tuple(_.string, _.number)
      U.deepStrictEqual(decoder.decode(['a', 1]), _.success(['a', 1]))
    })

    it('should handle zero components', async () => {
      U.deepStrictEqual(_.tuple().decode([]), _.success([]))
    })

    it('should reject an invalid input', async () => {
      const decoder = _.tuple(_.string, _.number)
      U.deepStrictEqual(
        pipe(decoder.decode(undefined), print),
        `Errors:
cannot decode undefined, expected an array`
      )
      U.deepStrictEqual(
        pipe(decoder.decode(['a']), print),
        `Errors:
1 error(s) found while checking indexes
└─ missing required index 1`
      )
      U.deepStrictEqual(
        pipe(decoder.decode([1, 2]), print),
        `Errors:
1 error(s) found while decoding a tuple
└─ 1 error(s) found while decoding required component 0
   └─ cannot decode 1, expected a string`
      )
    })

    it('should collect all errors', async () => {
      const decoder = _.tuple(_.string, _.number)
      U.deepStrictEqual(
        pipe(decoder.decode([1, 'a']), print),
        `Errors:
2 error(s) found while decoding a tuple
├─ 1 error(s) found while decoding required component 0
│  └─ cannot decode 1, expected a string
└─ 1 error(s) found while decoding required component 1
   └─ cannot decode \"a\", expected a number`
      )
    })

    it('should strip additional components', async () => {
      const decoder = _.tuple(_.string, _.number)
      U.deepStrictEqual(
        pipe(decoder.decode(['a', 1, true]), print),
        `Value:
[
  \"a\",
  1
]
Warnings:
1 error(s) found while checking indexes
└─ unexpected index 2`
      )
    })

    it('should accumulate warnings', async () => {
      const decoder = _.tuple(_.number)
      U.deepStrictEqual(
        pipe(decoder.decode([NaN]), print),
        `Value:
[
  null
]
Warnings:
1 error(s) found while decoding a tuple
└─ 1 error(s) found while decoding required component 0
   └─ value is NaN`
      )
    })
  })

  describe('union', () => {
    it('should return a right', () => {
      const decoder = _.union(_.string, _.number)
      U.deepStrictEqual(decoder.decode('a'), TH.right('a'))
      U.deepStrictEqual(decoder.decode(1), TH.right(1))
    })

    it('should return a left with zero members', () => {
      const decoder = _.union()
      U.deepStrictEqual(decoder.decode('a'), TH.left(_.unionE(RA.empty)))
    })

    it('should return a both', () => {
      const decoder = _.union(_.string, _.number)
      U.deepStrictEqual(
        decoder.decode(NaN),
        TH.both(_.unionE([_.memberE('0' as const, _.stringLE(NaN)), _.memberE('1' as const, _.naNLE)]), NaN)
      )
    })

    it('should return a left', () => {
      const decoder = _.union(_.string, _.number)
      U.deepStrictEqual(
        pipe(decoder.decode(null), print),
        `Errors:
2 error(s) found while decoding a union
├─ 1 error(s) found while decoding member "0"
│  └─ cannot decode null, expected a string
└─ 1 error(s) found while decoding member "1"
   └─ cannot decode null, expected a number`
      )
    })

    it('should accumulate warnings', async () => {
      const decoder = _.union(_.number)
      U.deepStrictEqual(
        pipe(decoder.decode(NaN), print),
        `Value:
NaN
Warnings:
1 error(s) found while decoding a union
└─ 1 error(s) found while decoding member \"0\"
   └─ value is NaN`
      )
    })
  })

  describe('lazy', () => {
    interface Category {
      name: string
      categories: ReadonlyArray<Category>
    }
    const Category: _.Decoder<
      unknown,
      _.DecodeError<_.UnknownRecordE | _.StringE | _.UnknownArrayE>,
      Category
    > = _.lazy('Category', () =>
      _.struct({
        name: _.string,
        categories: _.array(Category)
      })
    )

    it('should return a right', () => {
      const i1 = { name: 'a', categories: [] }
      U.deepStrictEqual(Category.decode(i1), TH.right(i1))
      const i2 = {
        name: 'a',
        categories: [
          { name: 'b', categories: [] },
          { name: 'c', categories: [{ name: 'd', categories: [] }] }
        ]
      }
      U.deepStrictEqual(Category.decode(i2), TH.right(i2))
    })

    it('should return a left', () => {
      U.deepStrictEqual(
        pipe(Category.decode({ name: 'a', categories: [{}] }), print),
        `Errors:
1 error(s) found while decoding lazy decoder Category
└─ 1 error(s) found while decoding a struct
   └─ 1 error(s) found while decoding required key \"categories\"
      └─ 1 error(s) found while decoding an array
         └─ 1 error(s) found while decoding optional index 0
            └─ 1 error(s) found while decoding lazy decoder Category
               └─ 2 error(s) found while checking keys
                  ├─ missing required key \"name\"
                  └─ missing required key \"categories\"`
      )
    })
  })
})
