import { pipe } from 'fp-ts/lib/pipeable'
import * as _ from '../src/poc'
import * as U from './util'
import * as TH from 'fp-ts/lib/These'
import { flow } from 'fp-ts/lib/function'
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
