import * as assert from 'assert'
import * as DT from '../src/DecoderT'

describe('DecoderT', () => {
  describe('intersect', () => {
    it('should concat strings', () => {
      assert.deepStrictEqual(DT.intersect('a', 'b'), 'b')
    })

    it('should concat numbers', () => {
      assert.deepStrictEqual(DT.intersect(1, 2), 2)
    })

    it('should concat booleans', () => {
      assert.deepStrictEqual(DT.intersect(true, false), false)
    })

    it('should concat nulls', () => {
      assert.deepStrictEqual(DT.intersect(null, null), null)
    })

    it('should concat undefineds', () => {
      assert.deepStrictEqual(DT.intersect(undefined, undefined), undefined)
    })

    it('should concat objects', () => {
      assert.deepStrictEqual(DT.intersect({ a: 1 }, { b: 2 }), { a: 1, b: 2 })
    })

    it('should concat a string with an object', () => {
      assert.deepStrictEqual(DT.intersect('a', { a: 1 }), { 0: 'a', a: 1 })
    })

    it('should concat a number with an object', () => {
      assert.deepStrictEqual(DT.intersect(1, { a: 1 }), { a: 1 })
    })

    it('should concat a boolean with an object', () => {
      assert.deepStrictEqual(DT.intersect(true, { a: 1 }), { a: 1 })
    })
  })
})
