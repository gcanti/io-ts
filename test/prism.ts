import * as assert from 'assert'
import * as t from '../src/index'
import {
  assertStrictEqual
} from './helpers'
import { Option, none, some } from 'fp-ts/lib/Option'

describe('prism', () => {

  it('should chain validations', () => {
    const parseNumber = (s: string): Option<number> => {
      const n = parseFloat(s)
      return isNaN(n) ? none : some(n)
    }
    const NumberFromString = t.prism(t.string, parseNumber)
    assertStrictEqual(t.validate('2', NumberFromString), 2)
    assert.strictEqual(NumberFromString.name, 'Prism<string, ?>')
  })

})
