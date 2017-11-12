import * as assert from 'assert'
import * as t from '../src/index'
import { assertSuccess, assertFailure } from './helpers'

describe('literal', () => {
  it('should succeed validating a valid value', () => {
    const T = t.literal('a')
    assertSuccess(t.validate('a', T))
  })

  it('should fail validating an invalid value', () => {
    const T = t.literal('a')
    assertFailure(t.validate(1, T), ['Invalid value 1 supplied to : "a"'])
  })

  it('should return the same reference when serializing', () => {
    const T = t.literal('a')
    assert.strictEqual(T.serialize, t.identity)
  })

  it('should type guard', () => {
    const T = t.literal('a')
    assert.strictEqual(T.is('a'), true)
    assert.strictEqual(T.is('b'), false)
    assert.strictEqual(T.is(undefined), false)
  })
})
