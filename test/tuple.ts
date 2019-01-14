import * as assert from 'assert'
import * as t from '../src/index'
import { assertSuccess, assertFailure, assertStrictEqual, assertDeepEqual, DateFromNumber } from './helpers'

describe('tuple', () => {
  it('should succeed validating a valid value', () => {
    const T0 = t.tuple([] as any)
    assertSuccess(T0.decode([]))
    const T1 = t.tuple([t.number])
    assertSuccess(T1.decode([1]))
    const T2 = t.tuple([t.number, t.string])
    assertSuccess(T2.decode([1, 'a']))
  })

  it('should return the same reference if validation succeeded and nothing changed', () => {
    const T = t.tuple([t.number, t.string])
    const value = [1, 'a']
    assertStrictEqual(T.decode(value), value)
  })

  it('should return the a new reference if validation succeeded and something changed', () => {
    const T = t.tuple([DateFromNumber, t.string])
    assertDeepEqual(T.decode([1, 'a']), [new Date(1), 'a'])
  })

  it('should fail validating an invalid value', () => {
    const T0 = t.tuple([] as any)
    assertFailure(T0.decode(1), ['Invalid value 1 supplied to : []'])
    const T1 = t.tuple([t.number])
    assertFailure(T1.decode(1), ['Invalid value 1 supplied to : [number]'])
    assertFailure(T1.decode([]), ['Invalid value undefined supplied to : [number]/0: number'])
    assertFailure(T1.decode(['a']), ['Invalid value "a" supplied to : [number]/0: number'])
    const T2 = t.tuple([t.number, t.string])
    assertFailure(T2.decode(1), ['Invalid value 1 supplied to : [number, string]'])
    assertFailure(T2.decode([]), [
      'Invalid value undefined supplied to : [number, string]/0: number',
      'Invalid value undefined supplied to : [number, string]/1: string'
    ])
    assertFailure(T2.decode([1]), ['Invalid value undefined supplied to : [number, string]/1: string'])
    assertFailure(T2.decode([1, 1]), ['Invalid value 1 supplied to : [number, string]/1: string'])
    assertFailure(T2.decode([1, 'foo', true]), ['Invalid value true supplied to : [number, string]/2: never'])
  })

  it('should serialize a deserialized', () => {
    const T = t.tuple([DateFromNumber, t.string])
    assert.deepEqual(T.encode([new Date(0), 'foo']), [0, 'foo'])
  })

  it('should return the same reference when serializing', () => {
    const T = t.tuple([t.number, t.string])
    assert.strictEqual(T.encode, t.identity)
  })

  it('should type guard', () => {
    const T1 = t.tuple([t.number, t.string])
    assert.strictEqual(T1.is([0, 'foo']), true)
    assert.strictEqual(T1.is([0, 2]), false)
    assert.strictEqual(T1.is(undefined), false)
    assert.strictEqual(T1.is([0]), false)
    assert.strictEqual(T1.is([0, 'foo', true]), false)
    const T2 = t.tuple([DateFromNumber, t.string])
    assert.strictEqual(T2.is([new Date(0), 'foo']), true)
    assert.strictEqual(T2.is([new Date(0), 2]), false)
    assert.strictEqual(T2.is(undefined), false)
    assert.strictEqual(T2.is([new Date(0)]), false)
    assert.strictEqual(T2.is([new Date(0), 'foo', true]), false)
  })

  it('should assign a default name', () => {
    const T1 = t.tuple([t.number, t.string])
    assert.strictEqual(T1.name, '[number, string]')
    const T2 = t.tuple([t.number, t.string], 'T2')
    assert.strictEqual(T2.name, 'T2')
  })
})
