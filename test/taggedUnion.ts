import * as assert from 'assert'
import * as t from '../src/index'
import { assertFailure, assertStrictEqual, assertSuccess, NumberFromString } from './helpers'

const OptionNumber = t.taggedUnion(
  'type',
  [t.type({ type: t.literal('None') }, 'None'), t.type({ type: t.literal('Some'), value: t.number }, 'Some')],
  'OptionNumber'
)

const OptionNumberFromString = t.taggedUnion(
  'type',
  [t.type({ type: t.literal('None') }, 'None'), t.type({ type: t.literal('Some'), value: NumberFromString }, 'Some')],
  'OptionNumberFromString'
)

describe('taggedUnion', () => {
  describe('name', () => {
    it('should assign a default name', () => {
      const OptionNumber = t.taggedUnion('type', [
        t.type({ type: t.literal('None') }),
        t.type({ type: t.literal('Some'), value: t.number })
      ])
      assert.strictEqual(OptionNumber.name, '({ type: "None" } | { type: "Some", value: number })')
    })

    it('should accept a name', () => {
      const T = t.taggedUnion('type', OptionNumber.types, 'T')
      assert.strictEqual(T.name, 'T')
    })
  })

  describe('is', () => {
    it('should check a isomorphic value', () => {
      assert.strictEqual(OptionNumber.is(null), false)
      assert.strictEqual(OptionNumber.is({}), false)
      assert.strictEqual(OptionNumber.is({ type: 'None' }), true)
      assert.strictEqual(OptionNumber.is({ type: 'Some' }), false)
      assert.strictEqual(OptionNumber.is({ type: 'Some', value: 'a' }), false)
      assert.strictEqual(OptionNumber.is({ type: 'Some', value: 1 }), true)
    })
  })

  describe('decode', () => {
    it('should decode a isomorphic value', () => {
      assertSuccess(OptionNumber.decode({ type: 'None' }))
      assertSuccess(OptionNumber.decode({ type: 'Some', value: 1 }))
    })

    it('should handle multiple tag candidates', () => {
      const A = t.type({ type: t.literal('A'), kind: t.literal('Kind') })
      const B = t.type({ type: t.literal('B'), kind: t.literal('Kind') })
      const TU = t.taggedUnion('type', [A, B])
      assertSuccess(TU.decode({ type: 'A', kind: 'Kind' }))
      assertSuccess(TU.decode({ type: 'B', kind: 'Kind' }))
    })

    it('should handle intersections', () => {
      const A = t.intersection([t.type({ type: t.literal('A') }), t.partial({ a: t.string })])
      const B = t.type({ type: t.literal('B') })
      const T = t.taggedUnion('type', [A, B])
      assertSuccess(T.decode({ type: 'A' }))
      assertSuccess(T.decode({ type: 'B' }))
    })

    it.skip('should handle sub unions', () => {
      const A = t.type({ type: t.literal('A') })
      const B = t.type({ type: t.literal('B') })
      const C = t.type({ type: t.literal('C') })
      const SubUnion = t.union([A, B])
      const T = t.taggedUnion('type', [SubUnion, C])
      assertSuccess(T.decode({ type: 'A' }))
      assertSuccess(T.decode({ type: 'B' }))
      assertSuccess(T.decode({ type: 'C' }))
    })

    it.skip('should handle sub tagged unions', () => {
      const A = t.type({ type: t.literal('A') })
      const B = t.type({ type: t.literal('B') })
      const C = t.type({ type: t.literal('C') })
      const SubTaggedUnion = t.taggedUnion('type', [A, B])
      const T = t.taggedUnion('type', [SubTaggedUnion, C])
      assertSuccess(T.decode({ type: 'A' }))
      assertSuccess(T.decode({ type: 'B' }))
      assertSuccess(T.decode({ type: 'C' }))
    })

    it('should decode a prismatic value', () => {
      assertSuccess(OptionNumberFromString.decode({ type: 'None' }))
      assertSuccess(OptionNumberFromString.decode({ type: 'Some', value: '1' }), { type: 'Some', value: 1 })
    })

    it('should fail validating an invalid value', () => {
      assertFailure(OptionNumber.decode(null), ['Invalid value null supplied to : OptionNumber'])
      assertFailure(OptionNumber.decode({}), [
        'Invalid value undefined supplied to : OptionNumber/type: "None" | "Some"'
      ])
      assertFailure(OptionNumber.decode({ type: 'Some' }), [
        'Invalid value undefined supplied to : OptionNumber/1: Some/value: number'
      ])
    })

    it('should work when tag values are numbers', () => {
      const T = t.taggedUnion('type', [
        t.type({ type: t.literal(1), a: t.string }),
        t.type({ type: t.literal(2), b: t.number })
      ])
      assertSuccess(T.decode({ type: 1, a: 'a' }))
      assertFailure(T.decode({ type: 1, a: 1 }), [
        'Invalid value 1 supplied to : ({ type: 1, a: string } | { type: 2, b: number })/0: { type: 1, a: string }/a: string'
      ])
      assertFailure(T.decode({ type: 2 }), [
        'Invalid value undefined supplied to : ({ type: 1, a: string } | { type: 2, b: number })/1: { type: 2, b: number }/b: number'
      ])
    })

    it('should work when tag values are booleans', () => {
      const T = t.taggedUnion('type', [
        t.type({ type: t.literal(true), a: t.string }),
        t.type({ type: t.literal(false), b: t.number })
      ])
      assertSuccess(T.decode({ type: true, a: 'a' }))
      assertFailure(T.decode({ type: true, a: 1 }), [
        'Invalid value 1 supplied to : ({ type: true, a: string } | { type: false, b: number })/0: { type: true, a: string }/a: string'
      ])
      assertFailure(T.decode({ type: false }), [
        'Invalid value undefined supplied to : ({ type: true, a: string } | { type: false, b: number })/1: { type: false, b: number }/b: number'
      ])
    })

    it('should work when tag values are booleans', () => {
      const T = t.taggedUnion('type', [
        t.type({ type: t.literal(true), a: t.string }),
        t.type({ type: t.literal(false), b: t.number })
      ])
      assertSuccess(T.decode({ type: true, a: 'a' }))
      assertFailure(T.decode({ type: true, a: 1 }), [
        'Invalid value 1 supplied to : ({ type: true, a: string } | { type: false, b: number })/0: { type: true, a: string }/a: string'
      ])
      assertFailure(T.decode({ type: false }), [
        'Invalid value undefined supplied to : ({ type: true, a: string } | { type: false, b: number })/1: { type: false, b: number }/b: number'
      ])
    })

    it('should work when tag values are both strings and numbers with the same string representation', () => {
      const T = t.taggedUnion('type', [
        t.type({ type: t.literal(1), a: t.string }),
        t.type({ type: t.literal('1'), b: t.number })
      ])
      assertSuccess(T.decode({ type: 1, a: 'a' }))
      assertFailure(T.decode({ type: 1, a: 1 }), [
        'Invalid value 1 supplied to : ({ type: 1, a: string } | { type: "1", b: number })/0: { type: 1, a: string }/a: string'
      ])
      assertSuccess(T.decode({ type: '1', b: 1 }))
      assertFailure(T.decode({ type: '1' }), [
        'Invalid value undefined supplied to : ({ type: 1, a: string } | { type: "1", b: number })/1: { type: "1", b: number }/b: number'
      ])
    })
  })

  describe('encode', () => {
    it('should encode a isomorphic value', () => {
      assert.deepEqual(OptionNumber.encode({ type: 'Some', value: 1 }), { type: 'Some', value: 1 })
    })

    it('should encode a prismatic value', () => {
      assert.deepEqual(OptionNumberFromString.encode({ type: 'Some', value: 1 }), { type: 'Some', value: '1' })
    })
  })

  it('should return the same reference if validation succeeded', () => {
    const value = { type: 'Some', value: 1 }
    assertStrictEqual(OptionNumber.decode(value), value)
  })

  it('should return the same reference while decoding', () => {
    const T = OptionNumber
    assert.strictEqual(T.encode, t.identity)
  })
})

describe('isTagged', () => {
  const is = t.isTagged('type')
  it('should return true if the type is tagged', () => {
    const T1 = t.type({ type: t.literal('a') })
    const T2 = t.strict({ type: t.literal('b') })
    assert.ok(is(T1))
    assert.ok(is(T2))
    assert.ok(is(t.union([T1, T2])))
    assert.ok(is(t.intersection([T1, t.type({ a: t.string })])))
    assert.ok(is(t.refinement(T1, () => true)))
    assert.ok(is(t.exact(T1)))
  })

  it('should return false if the type is not tagged', () => {
    assert.ok(!is(t.string))
  })
})

describe('getTagValue', () => {
  const get = t.getTagValue('type')
  it('should return the tag value', () => {
    const T1 = t.type({ type: t.literal('a') })
    const T2 = t.strict({ type: t.literal('b') })
    assert.strictEqual(get(T1), 'a')
    assert.strictEqual(get(T2), 'b')
    assert.strictEqual(get(t.union([T1, T1])), 'a')
    assert.strictEqual(get(t.intersection([T1, t.type({ a: t.string })])), 'a')
    assert.strictEqual(get(t.intersection([t.type({ a: t.string }), T1])), 'a')
    assert.strictEqual(get(t.refinement(T1, () => true)), 'a')
    assert.strictEqual(get(t.exact(T1)), 'a')
  })
})
