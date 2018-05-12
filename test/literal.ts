import * as assert from 'assert'
import * as t from '../src/index'
import { assertSuccess, assertFailure } from './helpers'

describe('literal', () => {
  it('should succeed validating a valid value', () => {
    const T = t.literal('a')
    assertSuccess(T.decode('a'))
  })

  it('should fail validating an invalid value', () => {
    const T = t.literal('a')
    assertFailure(T.decode(1), ['Invalid value 1 supplied to : "a"'])
  })

  it('should return the same reference when serializing', () => {
    const T = t.literal('a')
    assert.strictEqual(T.encode, t.identity)
  })

  it('should type guard', () => {
    const T = t.literal('a')
    assert.strictEqual(T.is('a'), true)
    assert.strictEqual(T.is('b'), false)
    assert.strictEqual(T.is(undefined), false)
  })

  it('should assign a default name', () => {
    const T1 = t.literal('a')
    assert.strictEqual(T1.name, '"a"')
    const T2 = t.literal('a', 'T2')
    assert.strictEqual(T2.name, 'T2')
  })
})
