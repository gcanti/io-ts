import * as assert from 'assert'
import * as KD from '../src/KleisliDecoder'
import * as _ from '../src/KleisliTaskDecoder'

interface IntBrand {
  readonly Int: unique symbol
}

type Int = number & IntBrand

describe('KleisliTaskDecoder', () => {
  it('fromRefinement', async () => {
    const IntFromNumber = _.fromRefinement((n: number): n is Int => Number.isInteger(n), 'IntFromNumber')
    assert.deepStrictEqual(await IntFromNumber.decode(1)(), KD.success(1))
    assert.deepStrictEqual(await IntFromNumber.decode(1.2)(), KD.failure(1.2, 'IntFromNumber'))
  })
})
