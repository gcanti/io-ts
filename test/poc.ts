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
├─ 1 error(s) found while decoding the member 0
│  └─ 1 error(s) found while checking keys
│     └─ unexpected key \"c\"
└─ 1 error(s) found while decoding the member 1
   └─ 1 error(s) found while checking keys
      └─ unexpected key \"c\"`
        )
      })
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
})
