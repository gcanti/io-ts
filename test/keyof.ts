import * as assert from 'assert'
import * as t from '../src/index'
import { assertSuccess, assertFailure } from './helpers'

describe('keyof', () => {
  it('should succeed validating a valid value', () => {
    const T = t.keyof({ a: 1, b: 2 })
    assertSuccess(t.validate('a', T))
    assertSuccess(t.validate('b', T))
  })

  it('should fail validating an invalid value', () => {
    const T = t.keyof({ a: 1, b: 2 })
    assertFailure(t.validate('c', T), ['Invalid value "c" supplied to : (keyof ["a","b"])'])
  })

  it('should return the same reference when serializing', () => {
    const T = t.keyof({ a: 1, b: 2 })
    assert.strictEqual(T.serialize, t.identity)
  })

  it('should type guard', () => {
    const T = t.keyof({ a: 1, b: 2 })
    assert.strictEqual(T.is('a'), true)
    assert.strictEqual(T.is('c'), false)
    assert.strictEqual(T.is(undefined), false)
  })
})
