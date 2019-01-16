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

    it('should handle intersections', () => {
      const A = t.intersection([t.type({ type: t.literal('A') }), t.partial({ a: t.string })])
      const B = t.type({ type: t.literal('B') })
      const T = t.taggedUnion('type', [A, B])
      assertSuccess(T.decode({ type: 'A' }))
      assertSuccess(T.decode({ type: 'B' }))
    })

    it('should handle recursive codecs', () => {
      const A = t.type({ type: t.literal('A') })
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
      const T = t.taggedUnion('type', [A, B])
      assertSuccess(T.decode({ type: 'A' }))
      assertSuccess(T.decode({ type: 'B', forest: [] }))
      assertSuccess(T.decode({ type: 'B', forest: [{ type: 'B', forest: [] }] }))
    })

    it('should handle sub unions', () => {
      const A = t.type({ type: t.literal('A') })
      const B = t.type({ type: t.literal('B') })
      const C = t.type({ type: t.literal('C') })
      const SubUnion = t.union([A, B])
      const T = t.taggedUnion('type', [SubUnion, C])
      assertSuccess(T.decode({ type: 'A' }))
      assertSuccess(T.decode({ type: 'B' }))
      assertSuccess(T.decode({ type: 'C' }))
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

    it('should fail validating an invalid value', () => {
      assertFailure(OptionNumber.decode(null), ['Invalid value null supplied to : OptionNumber'])
      assertFailure(OptionNumber.decode({}), [
        'Invalid value undefined supplied to : OptionNumber/type: "None" | "Some"'
      ])
      assertFailure(OptionNumber.decode({ type: 'Some' }), [
        'Invalid value undefined supplied to : OptionNumber/1: Some/value: number'
      ])
    })

    it('should handle zero codecs', () => {
      const T = t.taggedUnion('type', [] as any)
      assertFailure(T.decode(true), ['Invalid value true supplied to : ()'])
    })

    it('should handle one codec', () => {
      const T = t.taggedUnion('type', [t.type({ type: t.literal('A') })] as any)
      assertSuccess(T.decode({ type: 'A' }))
      assertFailure(T.decode(null), ['Invalid value null supplied to : ({ type: "A" })'])
    })

    it('should support numeric tags', () => {
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

    it('should support boolean tags', () => {
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

    it('should support mixed numeric and string tags', () => {
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

  it('should return a simple union if the arguments are somehow wrong', () => {
    const T = t.taggedUnion('type', [t.type({ a: t.string }), t.type({ b: t.number })] as any)
    assert.strictEqual(T instanceof t.TaggedUnionType, true)
  })
})

describe('getIndexRecord', () => {
  it('should handle zero types', () => {
    assert.deepEqual(t.getIndexRecord([]), {})
  })

  it('should handle type codecs', () => {
    const A = t.type({ type: t.literal('A'), a: t.string })
    assert.deepEqual(t.getIndexRecord([A]), { type: [['A', A]] })
    const B = t.type({ type: t.literal('B') })
    assert.deepEqual(t.getIndexRecord([A, B]), { type: [['A', A], ['B', B]] })
  })

  it('should handle refinement codecs', () => {
    const A = t.refinement(t.type({ type: t.literal('A'), a: t.string }), () => true)
    assert.deepEqual(t.getIndexRecord([A]), { type: [['A', A]] })
    const B = t.type({ type: t.literal('B') })
    assert.deepEqual(t.getIndexRecord([A, B]), { type: [['A', A], ['B', B]] })
  })

  it('should handle strict codecs', () => {
    const A = t.strict({ type: t.literal('A') })
    assert.deepEqual(t.getIndexRecord([A]), { type: [['A', A]] })
    const B = t.strict({ type: t.literal('B') })
    assert.deepEqual(t.getIndexRecord([A, B]), { type: [['A', A], ['B', B]] })
  })

  it('should handle exact codecs', () => {
    const A = t.exact(t.strict({ type: t.literal('A') }))
    assert.deepEqual(t.getIndexRecord([A]), { type: [['A', A]] })
    const B = t.exact(t.strict({ type: t.literal('B') }))
    assert.deepEqual(t.getIndexRecord([A, B]), { type: [['A', A], ['B', B]] })
  })

  it('should handle unions', () => {
    const A = t.type({ type: t.literal('A') })
    const B = t.type({ type: t.literal('B') })
    const C = t.type({ type: t.literal('C') })
    const SubUnion = t.union([A, B])
    assert.deepEqual(t.getIndexRecord([SubUnion, C]), { type: [['A', A], ['B', B], ['C', C]] })
  })

  it('should handle intersections', () => {
    const A = t.intersection([t.partial({ a: t.string }), t.type({ type: t.literal('A') })])
    assert.deepEqual(t.getIndexRecord([A]), { type: [['A', A]] })
    const B = t.intersection([t.type({ type: t.literal('_') }), t.type({ type: t.literal('B') })])
    assert.deepEqual(t.getIndexRecord([B]), { type: [['_', B], ['B', B]] })
    const C = t.intersection([t.type({ type: t.literal('C') }), t.type({ type: t.literal('C') })])
    assert.deepEqual(t.getIndexRecord([C]), { type: [['C', C], ['C', C]] })
    const D = t.intersection([t.type({ type: t.literal('D1') }), t.type({ kind: t.literal('D2') })])
    assert.deepEqual(t.getIndexRecord([D]), { type: [['D1', D]], kind: [['D2', D]] })
  })

  it('should handle duplicated tags', () => {
    const A = t.type({ type: t.literal('A') })
    assert.deepEqual(t.getIndexRecord([A, A]), { type: [['A', A]] })
    const DuplicatedA = t.type({ type: t.literal('A') })
    assert.deepEqual(t.getIndexRecord([A, DuplicatedA]), {})
  })

  it('should handle non indexable types', () => {
    assert.deepEqual(t.getIndexRecord([t.string]), {})
  })

  it('should bail out when no tags are available', () => {
    const A = t.type({ type: t.literal('A') })
    const B = t.type({ kind: t.literal('B') })
    assert.deepEqual(t.getIndexRecord([A, B]), {})
  })

  it('should handle multiple tag candidates', () => {
    const A = t.type({ type: t.literal('A'), kind: t.literal('Kind') })
    const B = t.type({ type: t.literal('B'), kind: t.literal('Kind') })
    assert.deepEqual(t.getIndexRecord([A, B]), {
      type: [['A', A], ['B', B]]
    })
    const C = t.type({ type: t.literal('C1'), kind: t.literal('C2') })
    const D = t.type({ type: t.literal('D1'), kind: t.literal('D2') })
    assert.deepEqual(t.getIndexRecord([C, D]), {
      type: [['C1', C], ['D1', D]],
      kind: [['C2', C], ['D2', D]]
    })
  })

  it('should handle wrong arguments', () => {
    const T = t.taggedUnion('type', [t.type({ a: t.string }), t.type({ b: t.number })] as any)
    assert.deepEqual(t.getIndexRecord(T.types), {})
  })

  describe('recursive codecs', () => {
    it('non tagged + union with non indexable codec', () => {
      interface R {
        ru: R | undefined
        ur: undefined | R
      }
      const R = t.recursion<R>('R', Self =>
        t.type({
          ru: t.union([Self, t.undefined]),
          ur: t.union([t.undefined, Self])
        })
      )
      assert.deepEqual(t.getIndexRecord([R]), {})
    })

    it('tagged + union with non indexable codec', () => {
      interface R {
        type: 'R'
        ru: R | undefined
        ur: undefined | R
      }
      const R = t.recursion<R>('R', Self =>
        t.type({
          type: t.literal('R'),
          ru: t.union([Self, t.undefined]),
          ur: t.union([t.undefined, Self])
        })
      )
      assert.deepEqual(t.getIndexRecord([R]), { type: [['R', R]] })
    })

    it('non tagged + union with indexable codec', () => {
      const A = t.type({
        type: t.literal('A')
      })
      type A = t.TypeOf<typeof A>
      interface R {
        ra: R | A
        ar: A | R
      }
      const R = t.recursion<R>('R', Self =>
        t.type({
          ra: t.union([Self, A]),
          ar: t.union([A, Self])
        })
      )
      assert.deepEqual(t.getIndexRecord([R]), {})
      assert.deepEqual(t.getIndexRecord([A, R]), {})
    })

    it('tagged + union with indexable codec', () => {
      const A = t.type({
        type: t.literal('A')
      })
      type A = t.TypeOf<typeof A>
      interface R {
        type: 'R'
        ra: R | A
        ar: A | R
      }
      const R = t.recursion<R>('R', Self =>
        t.type({
          type: t.literal('R'),
          ra: t.union([Self, A]),
          ar: t.union([A, Self])
        })
      )
      assert.deepEqual(t.getIndexRecord([R]), { type: [['R', R]] })
      assert.deepEqual(t.getIndexRecord([A, R]), { type: [['A', A], ['R', R]] })
    })

    it('tagged + tagged union with indexable codec', () => {
      const A = t.type({
        type: t.literal('A')
      })
      type A = t.TypeOf<typeof A>
      interface R {
        type: 'R'
        ar: A | R
        ra: R | A
      }
      const R = t.recursion<R>('R', self =>
        t.type({
          type: t.literal('R'),
          ar: t.taggedUnion('type', [A, self as any]),
          ra: t.taggedUnion('type', [self as any, A])
        })
      )
      assert.deepEqual(t.getIndexRecord([R]), { type: [['R', R]] })
      assert.deepEqual(t.getIndexRecord([A, R]), { type: [['A', A], ['R', R]] })
    })

    it('mutually recursive codecs', () => {
      interface A {
        type: 'A'
        bu: B | undefined
        ub: undefined | B
      }
      const A: t.RecursiveType<t.Type<A>, A> = t.recursion('A', () =>
        t.type({
          type: t.literal('A'),
          bu: t.union([B, t.undefined]),
          ub: t.union([t.undefined, B])
        })
      )
      interface B {
        type: 'B'
        au: A | undefined
        ua: undefined | A
      }
      const B = t.recursion<B>('B', () =>
        t.type({
          type: t.literal('B'),
          au: t.union([A, t.undefined]),
          ua: t.union([t.undefined, A])
        })
      )
      assert.deepEqual(t.getIndexRecord([A]), { type: [['A', A]] })
      assert.deepEqual(t.getIndexRecord([B]), { type: [['B', B]] })
      assert.deepEqual(t.getIndexRecord([A, B]), { type: [['A', A], ['B', B]] })
    })
  })
})
