import * as assert from 'assert'
import * as E from '../src/Encoder'

describe('Encoder', () => {
  describe('encoder', () => {
    it('contramap', () => {
      const encoder = E.encoder.contramap(E.encoder.number, (s: string) => s.length)
      assert.deepStrictEqual(encoder.encode('aaa'), 3)
    })
  })
})
