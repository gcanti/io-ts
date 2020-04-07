import * as assert from 'assert'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import * as D from '../src/Decoder'

describe('Decoder', () => {
  describe('decoder', () => {
    it('map', () => {
      const decoder = pipe(
        D.string,
        D.map((s) => s.length)
      )
      assert.deepStrictEqual(decoder.decode('aaa'), E.right(3))
    })

    it('of', () => {
      const decoder = D.decoder.of(1)
      assert.deepStrictEqual(decoder.decode(1), E.right(1))
      assert.deepStrictEqual(decoder.decode('a'), E.right(1))
    })

    it('ap', () => {
      const fab = D.decoder.of((s: string): number => s.length)
      const fa = D.string
      assert.deepStrictEqual(pipe(fab, D.ap(fa)).decode('aaa'), E.right(3))
    })

    it('alt', () => {
      const decoder = pipe(
        D.string,
        D.alt(() => pipe(D.number, D.map(String)))
      )
      assert.deepStrictEqual(decoder.decode('a'), E.right('a'))
      assert.deepStrictEqual(decoder.decode(1), E.right('1'))
    })

    it('zero', () => {
      const decoder = D.decoder.zero()
      assert.deepStrictEqual(decoder.decode(null), E.left([D.tree('cannot decode null, should be never')]))
    })
  })

  describe('union', () => {
    it('should decode a valid input', () => {
      assert.deepStrictEqual(D.union(D.string).decode('a'), E.right('a'))
      const decoder = D.union(D.string, D.number)
      assert.deepStrictEqual(decoder.decode('a'), E.right('a'))
      assert.deepStrictEqual(decoder.decode(1), E.right(1))
    })

    it('should reject an invalid input', () => {
      const decoder = D.union(D.string, D.number)
      assert.deepStrictEqual(
        decoder.decode(true),
        E.left([
          D.tree('member 0', [D.tree('cannot decode true, should be string')]),
          D.tree('member 1', [D.tree('cannot decode true, should be number')])
        ])
      )
    })

    it('should handle zero members', () => {
      assert.deepStrictEqual(D.union().decode({}), E.left([D.tree('cannot decode {}, should be never')]))
    })
  })

  describe('intersect', () => {
    it('should concat strings', () => {
      assert.deepStrictEqual(D.intersect('a', 'b'), 'b')
    })

    it('should concat numbers', () => {
      assert.deepStrictEqual(D.intersect(1, 2), 2)
    })

    it('should concat booleans', () => {
      assert.deepStrictEqual(D.intersect(true, false), false)
    })

    it('should concat nulls', () => {
      assert.deepStrictEqual(D.intersect(null, null), null)
    })

    it('should concat undefineds', () => {
      assert.deepStrictEqual(D.intersect(undefined, undefined), undefined)
    })

    it('should concat objects', () => {
      assert.deepStrictEqual(D.intersect({ a: 1 }, { b: 2 }), { a: 1, b: 2 })
    })

    it('should concat a string with an object', () => {
      assert.deepStrictEqual(D.intersect('a', { a: 1 }), { 0: 'a', a: 1 })
    })

    it('should concat a number with an object', () => {
      assert.deepStrictEqual(D.intersect(1, { a: 1 }), { a: 1 })
    })

    it('should concat a boolean with an object', () => {
      assert.deepStrictEqual(D.intersect(true, { a: 1 }), { a: 1 })
    })
  })
})
