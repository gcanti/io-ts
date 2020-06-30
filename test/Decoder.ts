import * as assert from 'assert'
import * as _ from '../src/Decoder'

interface IntBrand {
  readonly Int: unique symbol
}

type Int = number & IntBrand

describe('Decoder', () => {
  it('fromRefinement', () => {
    const IntFromNumber = _.fromRefinement((n: number): n is Int => Number.isInteger(n), 'IntFromNumber')
    assert.deepStrictEqual(IntFromNumber.decode(1), _.success(1))
    assert.deepStrictEqual(IntFromNumber.decode(1.2), _.failure(1.2, 'IntFromNumber'))
  })
})
