import * as S from '../src/Schemable'
import { deepStrictEqual } from './util'

describe('DecoderT', () => {
  describe('intersect', () => {
    it('should concat strings', () => {
      deepStrictEqual(S.intersect_('a', 'b'), 'b')
    })

    it('should concat numbers', () => {
      deepStrictEqual(S.intersect_(1, 2), 2)
    })

    it('should concat booleans', () => {
      deepStrictEqual(S.intersect_(true, false), false)
    })

    it('should concat nulls', () => {
      deepStrictEqual(S.intersect_(null, null), null)
    })

    it('should concat undefineds', () => {
      deepStrictEqual(S.intersect_(undefined, undefined), undefined)
    })

    it('should concat objects', () => {
      deepStrictEqual(S.intersect_({ a: 1 }, { b: 2 }), { a: 1, b: 2 })
    })

    it('should concat a string with an object', () => {
      deepStrictEqual(S.intersect_('a', { a: 1 }), { 0: 'a', a: 1 } as any)
    })

    it('should concat a number with an object', () => {
      deepStrictEqual(S.intersect_(1, { a: 1 }), { a: 1 } as any)
    })

    it('should concat a boolean with an object', () => {
      deepStrictEqual(S.intersect_(true, { a: 1 }), { a: 1 } as any)
    })
  })
})
