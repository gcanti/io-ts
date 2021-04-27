import { pipe } from 'fp-ts/lib/pipeable'
import * as D from '../src/poc'
import * as U from './util'
import * as TH from 'fp-ts/lib/These'
import { flow } from 'fp-ts/lib/function'
import * as RA from 'fp-ts/lib/ReadonlyArray'

export const print = flow(D.draw, D.print)

describe('poc', () => {
  describe('intersect', () => {
    describe('struct', () => {
      it('should not raise invalid warnings', () => {
        const I1 = D.struct({
          a: D.string
        })
        const I2 = D.struct({
          b: D.number
        })
        const I = pipe(I1, D.intersect(I2))
        U.deepStrictEqual(I.decode({ a: 'a', b: 1 }), TH.right({ a: 'a', b: 1 }))
      })

      it('should raise a warning with an additional key', () => {
        const I1 = D.struct({
          a: D.string
        })
        const I2 = D.struct({
          b: D.number
        })
        const I = pipe(I1, D.intersect(I2))
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
      const I1 = D.struct({ a: D.struct({ b: D.string }) })
      const I2 = D.struct({ a: D.struct({ c: D.number }) })
      const I = pipe(I1, D.intersect(I2))
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
    //     const I1 = D.tuple(D.string)
    //     const I2 = D.tuple(D.string, D.number)
    //     const I = pipe(I1, D.intersect(I2))
    //     U.deepStrictEqual(I.decode(['a', 1]), TH.right({ a: 'a', b: 1 }))
    //   })
    // })
  })

  describe('union', () => {
    it('should return a right', () => {
      const decoder = D.union(D.string, D.number)
      U.deepStrictEqual(decoder.decode('a'), TH.right('a'))
      U.deepStrictEqual(decoder.decode(1), TH.right(1))
    })

    it('should return a left with zero members', () => {
      const decoder = D.union()
      U.deepStrictEqual(decoder.decode('a'), TH.left(D.unionE(RA.empty)))
    })

    it('should return a both', () => {
      const decoder = D.union(D.string, D.number)
      U.deepStrictEqual(
        decoder.decode(NaN),
        TH.both(D.unionE([D.memberE('0' as const, D.stringLE(NaN)), D.memberE('1' as const, D.naNLE)]), NaN)
      )
    })

    it('should return a left', () => {
      const decoder = D.union(D.string, D.number)
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
    const Category: D.Decoder<
      unknown,
      D.DecodeError<D.UnknownRecordE | D.StringE | D.UnknownArrayE>,
      Category
    > = D.lazy('Category', () =>
      D.struct({
        name: D.string,
        categories: D.array(Category)
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
