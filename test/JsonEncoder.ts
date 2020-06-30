import * as assert from 'assert'
import * as JE from '../src/JsonEncoder'

describe('Encoder', () => {
  describe('Contravariant', () => {
    it('contramap', () => {
      const encoder = JE.Contravariant.contramap(JE.Schemable.number, (s: string) => s.length)
      assert.deepStrictEqual(encoder.encode('aaa'), 3)
    })
  })
})
