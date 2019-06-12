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
      assertFailure(OptionNumber, null, ['Invalid value null supplied to : OptionNumber'])
      assertFailure(OptionNumber, {}, ['Invalid value {} supplied to : OptionNumber'])
      assertFailure(OptionNumber, { type: 'A' }, ['Invalid value {"type":"A"} supplied to : OptionNumber'])
      assertFailure(OptionNumber, { type: 'Some' }, [
        'Invalid value undefined supplied to : OptionNumber/1: Some/value: number'
      ])
    })

    it('should handle intersections', () => {
      const A = t.intersection([t.type({ type: t.literal('A') }), t.partial({ a: t.string })], 'A')
      const B = t.type({ type: t.literal('B'), b: t.number }, 'B')
      const T = t.taggedUnion('type', [A, B], 'T')
      assertSuccess(T.decode({ type: 'A' }))
      assertSuccess(T.decode({ type: 'B', b: 1 }))
      assertFailure(T, { type: 'B' }, ['Invalid value undefined supplied to : T/1: B/b: number'])
    })

    it('should handle recursive codecs', () => {
      const A = t.type({ type: t.literal('A') }, 'A')
      interface B {
        type: 'B'
        forest: Array<B>
      }
      const B = t.recursion<B>('B', Self =>
        t.type({
          type: t.literal('B'),
          forest: t.array(Self)
        })
      )
      const T = t.taggedUnion('type', [A, B], 'T')
      assertSuccess(T.decode({ type: 'A' }))
      assertSuccess(T.decode({ type: 'B', forest: [] }))
      assertSuccess(T.decode({ type: 'B', forest: [{ type: 'B', forest: [] }] }))
      assertFailure(T, { type: 'B', forest: [{ type: 'B' }] }, [
        'Invalid value undefined supplied to : T/1: B/forest: Array<B>/0: B/forest: Array<B>'
      ])
    })

    it('should handle sub unions', () => {
      const A = t.type({ type: t.literal('A') }, 'A')
      const B = t.type({ type: t.literal('B'), b: t.string }, 'B')
      const C = t.type({ type: t.literal('C') }, 'C')
      const SubUnion = t.union([A, B], 'Subunion')
      const T = t.taggedUnion('type', [SubUnion, C], 'T')
      assertSuccess(T.decode({ type: 'A' }))
      assertSuccess(T.decode({ type: 'B', b: 'b' }))
      assertSuccess(T.decode({ type: 'C' }))
      assertFailure(T, { type: 'B' }, ['Invalid value undefined supplied to : T/0: Subunion/1: B/b: string'])
    })

    it('should handle sub tagged unions', () => {
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

    it('should support numeric tags', () => {
      const T = t.taggedUnion('type', [
        t.type({ type: t.literal(1), a: t.string }),
        t.type({ type: t.literal(2), b: t.number })
      ])
      assertSuccess(T.decode({ type: 1, a: 'a' }))
      assertFailure(T, { type: 1, a: 1 }, [
        'Invalid value 1 supplied to : ({ type: 1, a: string } | { type: 2, b: number })/0: { type: 1, a: string }/a: string'
      ])
      assertFailure(T, { type: 2 }, [
        'Invalid value undefined supplied to : ({ type: 1, a: string } | { type: 2, b: number })/1: { type: 2, b: number }/b: number'
      ])
    })

    it('should support boolean tags', () => {
      const T = t.taggedUnion('type', [
        t.type({ type: t.literal(true), a: t.string }),
        t.type({ type: t.literal(false), b: t.number })
      ])
      assertSuccess(T.decode({ type: true, a: 'a' }))
      assertFailure(T, { type: true, a: 1 }, [
        'Invalid value 1 supplied to : ({ type: true, a: string } | { type: false, b: number })/0: { type: true, a: string }/a: string'
      ])
      assertFailure(T, { type: false }, [
        'Invalid value undefined supplied to : ({ type: true, a: string } | { type: false, b: number })/1: { type: false, b: number }/b: number'
      ])
    })

    it('should support mixed string, numeric and boolean tags', () => {
      const T = t.taggedUnion(
        'type',
        [
          t.type({ type: t.literal('a'), a: t.string }),
          t.type({ type: t.literal(1), b: t.number }),
          t.type({ type: t.literal(true), c: t.boolean })
        ],
        'T'
      )
      assertSuccess(T.decode({ type: 'a', a: 'a' }))
      assertFailure(T, { type: 'a', a: 1 }, ['Invalid value 1 supplied to : T/0: { type: "a", a: string }/a: string'])
      assertSuccess(T.decode({ type: 1, b: 1 }))
      assertFailure(T, { type: 1 }, ['Invalid value undefined supplied to : T/1: { type: 1, b: number }/b: number'])
      assertSuccess(T.decode({ type: true, c: false }))
      assertFailure(T, { type: true }, [
        'Invalid value undefined supplied to : T/2: { type: true, c: boolean }/c: boolean'
      ])
    })
  })

  describe('encode', () => {
    it('should encode a isomorphic value', () => {
      assert.deepStrictEqual(OptionNumber.encode({ type: 'Some', value: 1 }), { type: 'Some', value: 1 })
    })

    it('should encode a prismatic value', () => {
      assert.deepStrictEqual(OptionNumberFromString.encode({ type: 'Some', value: 1 }), { type: 'Some', value: '1' })
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

  it('should handle one codec', () => {
    const T = t.taggedUnion('type', [t.type({ type: t.literal('A') })] as any)
    assertSuccess(T.decode({ type: 'A' }))
    assertFailure(T, null, ['Invalid value null supplied to : ({ type: "A" })'])
  })

  it('should warn for un-optimized unions', () => {
    const log: Array<string> = []
    const original = console.warn
    console.warn = (message: string) => log.push(message)
    t.taggedUnion('type', [t.type({ type: t.literal('a') }), t.type({ bad: t.literal('b') })])
    console.warn = original
    assert.deepStrictEqual(log, [
      '[io-ts] Cannot build a tagged union for ({ type: "a" } | { bad: "b" }), returning a de-optimized union'
    ])
  })
})
