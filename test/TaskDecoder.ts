import * as assert from 'assert'
import * as D from '../src/Decoder'
import * as _ from '../src/TaskDecoder'

interface IntBrand {
  readonly Int: unique symbol
}

type Int = number & IntBrand

describe('TaskDecoder', () => {
  it('fromRefinement', async () => {
    const IntFromNumber = _.fromRefinement((n: number): n is Int => Number.isInteger(n), 'IntFromNumber')
    assert.deepStrictEqual(await IntFromNumber.decode(1)(), D.success(1))
    assert.deepStrictEqual(await IntFromNumber.decode(1.2)(), D.failure(1.2, 'IntFromNumber'))
  })
})
