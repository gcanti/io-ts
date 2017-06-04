import * as assert from 'assert'
import * as t from '../src/index'

describe('Type', () => {
  it('is', () => {
    const T = t.string
    assert.strictEqual(T.is('s'), true)
    assert.strictEqual(T.is(1), false)
  })
})
