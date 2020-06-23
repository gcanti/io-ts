import * as assert from 'assert'
import * as S from '../src/Schemable'

describe('DecoderT', () => {
  describe('intersect', () => {
    it('should concat strings', () => {
      assert.deepStrictEqual(S.intersect_('a', 'b'), 'b')
    })

    it('should concat numbers', () => {
      assert.deepStrictEqual(S.intersect_(1, 2), 2)
    })

    it('should concat booleans', () => {
      assert.deepStrictEqual(S.intersect_(true, false), false)
    })

    it('should concat nulls', () => {
      assert.deepStrictEqual(S.intersect_(null, null), null)
    })

    it('should concat undefineds', () => {
      assert.deepStrictEqual(S.intersect_(undefined, undefined), undefined)
    })

    it('should concat objects', () => {
      assert.deepStrictEqual(S.intersect_({ a: 1 }, { b: 2 }), { a: 1, b: 2 })
    })

    it('should concat a string with an object', () => {
      assert.deepStrictEqual(S.intersect_('a', { a: 1 }), { 0: 'a', a: 1 })
    })

    it('should concat a number with an object', () => {
      assert.deepStrictEqual(S.intersect_(1, { a: 1 }), { a: 1 })
    })

    it('should concat a boolean with an object', () => {
      assert.deepStrictEqual(S.intersect_(true, { a: 1 }), { a: 1 })
    })
  })
})
