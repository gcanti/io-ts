import * as assert from 'assert'
import * as JE from '../src/JsonEncoder'

describe('Encoder', () => {
  describe('JsonEncoder', () => {
    it('contramap', () => {
      const encoder = JE.contravariantJsonEncoder.contramap(JE.schemableJsonEncoder.number, (s: string) => s.length)
      assert.deepStrictEqual(encoder.encode('aaa'), 3)
    })
  })
})
