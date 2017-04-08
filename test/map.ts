import * as assert from 'assert'
import * as t from '../src/index'
import {
  assertStrictEqual
} from './helpers'

describe('map', () => {

  it('should map with name', () => {
    const T = t.mapWithName(s => s.length, t.string, 'LengthFromString')
    assertStrictEqual(t.validate('ss', T), 2)
    assert.strictEqual(T.name, 'LengthFromString')
  })

  it('should map', () => {
    const T = t.map(s => s.length, t.string)
    assertStrictEqual(t.validate('aa', T), 2)
    assert.strictEqual(T.name, '(string => ?)')
    const TT = t.map(n => n * 2, T)
    assertStrictEqual(t.validate('aa', TT), 4)
    assert.strictEqual(TT.name, '((string => ?) => ?)')
  })

})
