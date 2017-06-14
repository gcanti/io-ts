import * as assert from 'assert'
import * as t from '../src/index'

describe('Type', () => {
  it('is', () => {
    const T = t.string
    assert.strictEqual(t.is('s', T), true)
    assert.strictEqual(t.is(1, T), false)
  })
})
