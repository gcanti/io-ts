import { pipe } from 'fp-ts/lib/pipeable'
import * as D from '../src/poc'
import * as U from './util'
import * as TH from 'fp-ts/lib/These'
import { flow } from 'fp-ts/lib/function'

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
})
