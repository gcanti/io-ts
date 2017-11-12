import * as assert from 'assert'
import * as t from '../src/index'
import { assertSuccess, assertFailure, DateFromNumber } from './helpers'

describe('readonlyArray', () => {
  it('should succeed validating a valid value', () => {
    const T = t.readonlyArray(t.number)
    assertSuccess(t.validate([1], T))
  })

  it('should fail validating an invalid value', () => {
    const T = t.readonlyArray(t.number)
    assertFailure(t.validate(['s'], T), ['Invalid value "s" supplied to : ReadonlyArray<number>/0: number'])
  })

  it('should freeze the value', () => {
    const T = t.readonlyArray(t.number)
    t.validate([1], T).map(x => assert.ok(Object.isFrozen(x)))
  })

  it('should serialize a deserialized', () => {
    const T = t.readonlyArray(DateFromNumber)
    assert.deepEqual(T.serialize([new Date(0), new Date(1)]), [0, 1])
  })

  it('should return the same reference when serializing', () => {
    const T = t.readonlyArray(t.number)
    assert.strictEqual(T.serialize, t.identity)
  })

  it('should type guard', () => {
    const T1 = t.readonlyArray(t.number)
    assert.strictEqual(T1.is([]), true)
    assert.strictEqual(T1.is([0]), true)
    assert.strictEqual(T1.is([0, 'foo']), false)
    assert.strictEqual(T1.is(undefined), false)
    const T2 = t.readonlyArray(DateFromNumber)
    assert.strictEqual(T2.is([]), true)
    assert.strictEqual(T2.is([new Date(0)]), true)
    assert.strictEqual(T2.is([new Date(0), 'foo']), false)
    assert.strictEqual(T2.is(undefined), false)
  })
})
