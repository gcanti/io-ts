import * as assert from 'assert'
import * as t from '../src/index'
import { assertFailure, assertStrictEqual, assertSuccess, NumberFromString } from './helpers'

describe('union', () => {
  describe('name', () => {
    it('should assign a default name', () => {
      const T = t.union([t.string, t.number])
      assert.strictEqual(T.name, '(string | number)')
    })

    it('should accept a name', () => {
      const T = t.union([t.string, t.number], 'T')
      assert.strictEqual(T.name, 'T')
    })
  })

  describe('is', () => {
    it('should check a isomorphic value', () => {
      const T = t.union([t.string, t.number])
      assert.strictEqual(T.is(0), true)
      assert.strictEqual(T.is('foo'), true)
      assert.strictEqual(T.is(true), false)
    })

    it('should check a prismatic value', () => {
      const T = t.union([t.string, NumberFromString])
      assert.strictEqual(T.is(0), true)
      assert.strictEqual(T.is('foo'), true)
      assert.strictEqual(T.is(true), false)
    })
  })

  describe('decode', () => {
    it('should decode a isomorphic value', () => {
      const T = t.union([t.string, t.number])
      assertSuccess(T.decode('s'))
      assertSuccess(T.decode(1))
    })

    it('should fail decoding an invalid value', () => {
      const T = t.union([t.string, t.number])
      assertFailure(T, true, [
        'Invalid value true supplied to : (string | number)/0: string',
        'Invalid value true supplied to : (string | number)/1: number'
      ])
    })

    it('should handle refinements', () => {
      const A = t.type({ type: t.literal('A'), a: t.number })
      // tslint:disable-next-line: deprecation
      const B = t.refinement(A, x => x.a > 0)
      const T = t.union([B, A])
      assertSuccess(T.decode({ type: 'A', a: -1 }))
    })

    it('should return the same reference if validation succeeded', () => {
      const T = t.union([t.UnknownRecord, t.number])
      const value = {}
      assertStrictEqual(T.decode(value), value)
    })

    describe('robustness', () => {
      it('should handle zero codecs', () => {
        const T = t.union([] as any)
        assertFailure(T, true, ['Invalid value true supplied to : ()'])
      })

      it('should handle one codec', () => {
        const T = t.union([t.string] as any)
        assertSuccess(T.decode('s'))
        assertFailure(T, true, ['Invalid value true supplied to : (string)/0: string'])
      })
    })
  })

  describe('encode', () => {
    it('should encode a prismatic value', () => {
      const T1 = t.union([t.type({ a: NumberFromString }), t.number])
      assert.deepStrictEqual(T1.encode({ a: 1 }), { a: '1' })
      assert.strictEqual(T1.encode(1), 1)
    })

    it('should encode a nullary union', () => {
      const T0 = t.union([] as any)
      assert.strictEqual(T0.encode(1 as never), 1)
    })

    it('should return the same reference while encoding', () => {
      const T = t.union([t.type({ a: t.number }), t.string])
      assert.strictEqual(T.encode, t.identity)
    })

    it('should play well with stripping combinators', () => {
      const x1 = { a: 1, c: true }
      const x2 = { b: 2, c: true }

      const T1 = t.union([t.strict({ a: t.number }), t.strict({ b: t.number })])
      assert.deepStrictEqual(T1.encode({ a: 1 }), { a: 1 })
      assert.deepStrictEqual(T1.encode({ b: 2 }), { b: 2 })
      assert.deepStrictEqual(T1.encode(x1), { a: 1 })
      assert.deepStrictEqual(T1.encode(x2), { b: 2 })

      const T2 = t.union([t.strict({ a: t.number }), t.type({ b: NumberFromString })])
      assert.deepStrictEqual(T2.encode({ a: 1 }), { a: 1 })
      assert.deepStrictEqual(T2.encode({ b: 2 }), { b: '2' })
      assert.deepStrictEqual(T2.encode(x1), { a: 1 })
      assert.deepStrictEqual(T2.encode(x2), { b: '2', c: true })

      const T3 = t.union([t.strict({ a: t.number }), t.strict({ b: NumberFromString })])
      assert.deepStrictEqual(T3.encode({ a: 1 }), { a: 1 })
      assert.deepStrictEqual(T3.encode({ b: 2 }), { b: '2' })
      assert.deepStrictEqual(T3.encode(x1), { a: 1 })
      assert.deepStrictEqual(T3.encode(x2), { b: '2' })
    })

    it('should throw if none of the codecs are applicable', () => {
      class DateT extends t.Type<Date, number> {
        public readonly _tag: 'DateT' = 'DateT'

        constructor() {
          super(
            'DateT',
            (u): u is Date => u instanceof Date,
            (u, c) => t.number.validate(u, c).map(n => new Date(n)),
            a => a.valueOf()
          )
        }
      }

      const U1 = t.union([new DateT(), t.null])
      const u1 = 'not the right thing' as any
      let failed = false

      try {
        U1.encode(u1)
      } catch (e) {
        failed = true
      }

      assert.equal(failed, true)
    })
  })

  it.skip('should optimize tagged unions', () => {
    const A = t.type({ type: t.literal('A') })
    const B = t.type({ type: t.literal('B') })
    const T = t.union([A, B])
    assert.strictEqual(T instanceof t.TaggedUnionType, true)
  })
})
