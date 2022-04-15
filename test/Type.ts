import * as assert from 'assert'
import { isRight } from 'fp-ts/lib/Either'
import * as _ from '../src/Type'
import { pipe } from 'fp-ts/lib/pipeable'

describe('Type', () => {
  it('refine', () => {
    interface NonEmptyStringBrand {
      readonly NonEmptyString: unique symbol
    }
    type NonEmptyString = string & NonEmptyStringBrand
    const type = pipe(
      _.string,
      _.refine((s): s is NonEmptyString => s.length > 0, 'NonEmptyString')
    )
    assert.deepStrictEqual(isRight(type.decode('a')), true)
    assert.deepStrictEqual(isRight(type.decode('')), false)
  })
})
