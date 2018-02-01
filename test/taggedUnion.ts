import * as assert from 'assert'
import * as t from '../src/index'
import { assertSuccess, assertFailure, assertStrictEqual, DateFromNumber } from './helpers'

const TUA = t.type(
  {
    type: t.literal('a'),
    foo: t.string
  },
  'TUA'
)

const TUB = t.intersection(
  [
    t.type({
      type: t.literal('b')
    }),
    t.type({
      bar: t.number
    })
  ],
  'TUB'
)

const TUC = t.type(
  {
    type: t.literal('c'),
    baz: DateFromNumber
  },
  'TUC'
)

const T = t.taggedUnion('type', [TUA, TUB, TUC])

describe('taggedUnion', () => {
  it('should succeed validating a valid value', () => {
    assertSuccess(T.decode({ type: 'a', foo: 'foo' }))
    assertSuccess(T.decode({ type: 'b', bar: 1 }))
    assertSuccess(T.decode({ type: 'c', baz: 0 }))
  })

  it('should return the same reference if validation succeeded', () => {
    const value = { type: 'a', foo: 'foo' }
    assertStrictEqual(T.decode(value), value)
  })

  it('should fail validating an invalid value', () => {
    assertFailure(T.decode(true), ['Invalid value true supplied to : (TUA | TUB | TUC)'])
    assertFailure(T.decode({ type: 'D' }), [
      'Invalid value "D" supplied to : (TUA | TUB | TUC)/type: (keyof ["a","b","c"])'
    ])
    assertFailure(T.decode({ type: 'a' }), [
      'Invalid value undefined supplied to : (TUA | TUB | TUC)/0: TUA/foo: string'
    ])
    assertFailure(T.decode({ type: 'b' }), [
      'Invalid value undefined supplied to : (TUA | TUB | TUC)/1: TUB/bar: number'
    ])
    assertFailure(T.decode({ type: 'c' }), [
      'Invalid value undefined supplied to : (TUA | TUB | TUC)/2: TUC/baz: DateFromNumber'
    ])
  })

  it('should serialize a deserialized', () => {
    assert.deepEqual(T.serialize({ type: 'a', foo: 'foo' }), { type: 'a', foo: 'foo' })
    assert.deepEqual(T.serialize({ type: 'b', bar: 1 }), { type: 'b', bar: 1 })
    assert.deepEqual(T.serialize({ type: 'c', baz: new Date(0) }), { type: 'c', baz: 0 })
  })

  it('should return the same reference when serializing', () => {
    const T = t.taggedUnion('type', [TUA, TUB])
    assert.strictEqual(T.serialize, t.identity)
  })

  it('should type guard', () => {
    assert.strictEqual(T.is({ type: 'a', foo: 'foo' }), true)
    assert.strictEqual(T.is({ type: 'b', bar: 1 }), true)
    assert.strictEqual(T.is({ type: 'c', baz: new Date(0) }), true)
    assert.strictEqual(T.is(true), false)
    assert.strictEqual(T.is({ type: 'a' }), false)
  })
})
