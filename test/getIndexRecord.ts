import * as assert from 'assert'
import * as t from '../src/index'

describe('getIndexRecord', () => {
  const assertEmptyIndexRecord = (codecs: Array<t.Mixed>) => {
    assert.strictEqual(t.getIndexRecord(codecs), t.emptyIndexRecord)
  }

  interface IndexRecord extends Record<string, Array<[unknown, t.Any, t.Any]>> {}

  const assertEqualIndexRecord = (codecs: Array<t.Mixed>, expected: IndexRecord) => {
    assert.deepEqual(t.getIndexRecord(codecs), expected)
  }

  it('should handle zero types', () => {
    assertEmptyIndexRecord([])
  })

  it('should handle non indexable types', () => {
    assertEmptyIndexRecord([t.string])
    assertEmptyIndexRecord([t.type({ a: t.string })])
    assertEmptyIndexRecord([t.type({ a: t.string }), t.type({ b: t.number })])
    assertEmptyIndexRecord([t.type({ type: t.literal('A') }), t.type({ b: t.number })])
  })

  it('should handle type codecs', () => {
    const A = t.type({ type: t.literal('A') })
    assertEqualIndexRecord([A], { type: [['A', A, A]] })
    const B = t.type({ type: t.literal('B') })
    assertEqualIndexRecord([A, B], { type: [['A', A, A], ['B', B, B]] })
    const C = t.type({ kind: t.literal('A') })
    assertEmptyIndexRecord([A, C])
    const D = t.type({ type: t.literal('A') })
    assertEmptyIndexRecord([A, D])
  })

  it('should handle refinement codecs', () => {
    const A = t.refinement(t.type({ type: t.literal('A'), a: t.string }), () => true)
    assertEqualIndexRecord([A], { type: [['A', A, A]] })
    const B = t.refinement(t.type({ type: t.literal('B') }), () => true)
    assertEqualIndexRecord([A, B], { type: [['A', A, A], ['B', B, B]] })
    const C = t.refinement(t.type({ kind: t.literal('A') }), () => true)
    assertEmptyIndexRecord([A, C])
    const D = t.refinement(t.type({ type: t.literal('A') }), () => true)
    assertEmptyIndexRecord([A, D])
  })

  it('should handle strict codecs', () => {
    const A = t.strict({ type: t.literal('A') })
    assertEqualIndexRecord([A], { type: [['A', A, A]] })
    const B = t.strict({ type: t.literal('B') })
    assertEqualIndexRecord([A, B], { type: [['A', A, A], ['B', B, B]] })
    const C = t.strict({ kind: t.literal('A') })
    assertEmptyIndexRecord([A, C])
    const D = t.strict({ type: t.literal('A') })
    assertEmptyIndexRecord([A, D])
  })

  it('should handle exact codecs', () => {
    const A = t.exact(t.strict({ type: t.literal('A') }))
    assertEqualIndexRecord([A], { type: [['A', A, A]] })
    const B = t.exact(t.strict({ type: t.literal('B') }))
    assertEqualIndexRecord([A, B], { type: [['A', A, A], ['B', B, B]] })
    const C = t.exact(t.strict({ kind: t.literal('A') }))
    assertEmptyIndexRecord([A, C])
    const D = t.exact(t.strict({ type: t.literal('A') }))
    assertEmptyIndexRecord([A, D])
  })

  it('should handle unions', () => {
    const A = t.type({ type: t.literal('A') })
    const B = t.type({ type: t.literal('B') })
    const C = t.type({ type: t.literal('C') })

    const AB = t.union([A, B])
    assertEqualIndexRecord([AB], { type: [['A', AB, A], ['B', AB, B]] })
    assertEqualIndexRecord([AB, C], { type: [['A', AB, A], ['B', AB, B], ['C', C, C]] })

    const D = t.type({ kind: t.literal('C') })
    assertEmptyIndexRecord([AB, D])

    // #263
    const E = t.union([t.type({ type: t.literal('A') }), t.type({ type: t.literal('B') })])
    const F = t.type({ type: t.literal('B') })
    assertEmptyIndexRecord([E, F])
  })

  it('should handle duplicated codecs', () => {
    const A = t.type({ type: t.literal('A') })
    assertEqualIndexRecord([A, A], { type: [['A', A, A]] })
  })

  it('should handle overlapping unions', () => {
    const A = t.type({ type: t.literal('A') })
    const B = t.type({ type: t.literal('B') })
    const C = t.type({ type: t.literal('C') })

    const AB = t.union([A, B])
    const BC = t.union([B, C])
    assertEqualIndexRecord([AB, BC], { type: [['A', AB, A], ['B', AB, B], ['C', BC, C]] })
  })

  it('should handle intersections', () => {
    const A = t.intersection([t.partial({ a: t.string }), t.type({ type: t.literal('A') })])
    assertEqualIndexRecord([A], { type: [['A', A, A]] })

    const B = t.intersection([t.type({ type: t.literal('B1') }), t.type({ type: t.literal('B2') })])
    assertEqualIndexRecord([B], { type: [['B1', B, B], ['B2', B, B]] })

    const C = t.intersection([t.type({ type: t.literal('C') }), t.type({ type: t.literal('C') })])
    assertEqualIndexRecord([C], { type: [['C', C, C], ['C', C, C]] })

    const D = t.intersection([t.type({ type: t.literal('D1') }), t.type({ kind: t.literal('D2') })])
    assertEqualIndexRecord([D], { type: [['D1', D, D]], kind: [['D2', D, D]] })

    // #263
    const E = t.intersection([t.type({ type: t.literal('A') }), t.type({ type: t.literal('B') })])
    const F = t.type({ type: t.literal('B') })
    assertEmptyIndexRecord([E, F])
  })

  it('should bail out when no tags are available', () => {
    const A = t.type({ type: t.literal('A') })
    const B = t.type({ kind: t.literal('B') })
    assertEmptyIndexRecord([A, B])
  })

  it('should handle multiple tag candidates', () => {
    const C = t.type({ type: t.literal('C1'), kind: t.literal('C2') })
    const D = t.type({ type: t.literal('D1'), kind: t.literal('D2') })
    assertEqualIndexRecord([C, D], {
      type: [['C1', C, C], ['D1', D, D]],
      kind: [['C2', C, C], ['D2', D, D]]
    })
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
      assertEmptyIndexRecord([R])
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
      assertEqualIndexRecord([R], { type: [['R', R, R]] })
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
      assertEmptyIndexRecord([R])
      assertEmptyIndexRecord([A, R])
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
      assertEqualIndexRecord([R], { type: [['R', R, R]] })
      assertEqualIndexRecord([A, R], { type: [['A', A, A], ['R', R, R]] })
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
      assertEqualIndexRecord([R], { type: [['R', R, R]] })
      assertEqualIndexRecord([A, R], { type: [['A', A, A], ['R', R, R]] })
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
      assertEqualIndexRecord([A], { type: [['A', A, A]] })
      assertEqualIndexRecord([B], { type: [['B', B, B]] })
      assertEqualIndexRecord([A, B], { type: [['A', A, A], ['B', B, B]] })
    })
  })

  it('nested tagged union', () => {
    const A = t.type({
      type: t.literal('A')
    })
    type A = t.TypeOf<typeof A>
    interface R {
      type: 'R'
      ra: R | A
    }
    const R = t.recursion<R>('R', Self =>
      t.type({
        type: t.literal('R'),
        ra: t.union([Self, A])
      })
    )
    const AR = t.taggedUnion('type', [A, R])
    const B = t.type({
      type: t.literal('B')
    })
    const BAR = t.taggedUnion('type', [B, AR])
    assertEqualIndexRecord(BAR.types, { type: [['B', B, B], ['A', AR, A], ['R', AR, R]] })
  })
})
