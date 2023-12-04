import * as assert from 'assert'

import * as t from '../../src/index'
import {
  assertFailure,
  assertStrictEqual,
  assertStrictSuccess,
  assertSuccess,
  HyphenatedString,
  HyphenatedStringFromNonHyphenated,
  NumberFromString
} from './helpers'

describe.concurrent('record', () => {
  describe.concurrent('enumerateStringMembers', () => {
    it('should handle literal', () => {
      assert.deepStrictEqual(t.enumerate(t.literal('a')), { literals: new Set('a') })
      const literal1 = t.literal(1)
      assert.deepStrictEqual(t.enumerate(literal1), { nonEnumerable: literal1 })
    })

    it('should handle keyof', () => {
      assert.deepStrictEqual(t.enumerate(t.keyof({ a: 1, b: 2 })), { literals: new Set(['a', 'b']) })
    })

    it('should handle union', () => {
      assert.deepStrictEqual(t.enumerate(t.union([t.literal('a'), t.literal('b')])), {
        literals: new Set(['a', 'b'])
      })
      assert.deepStrictEqual(t.enumerate(t.union([t.literal('a'), HyphenatedString])), {
        literals: new Set(['a']),
        nonEnumerable: HyphenatedString
      })
      assert.deepStrictEqual(t.enumerate(t.union([t.literal('a'), t.string])), { nonEnumerable: t.string })
      assert.deepStrictEqual(t.enumerate(t.union([t.literal('a-a'), HyphenatedString])), {
        nonEnumerable: HyphenatedString
      })
      const union = t.union([HyphenatedString, t.string])
      const enumerated = t.enumerate(union)
      assert.deepStrictEqual(enumerated.nonEnumerable?.name, union.name)
      assert.deepStrictEqual(enumerated.literals, undefined)
    })

    it('should handle intersection', () => {
      assert.deepStrictEqual(t.enumerate(t.intersection([t.literal('a'), t.literal('b')]) as any), {
        nonEnumerable: t.never
      })
      assert.deepStrictEqual(t.enumerate(t.intersection([t.literal('a'), t.string])), {
        literals: new Set(['a'])
      })
      assert.deepStrictEqual(t.enumerate(t.intersection([t.literal('a-a'), HyphenatedString])), {
        literals: new Set(['a-a'])
      })
      assert.deepStrictEqual(t.enumerate(t.intersection([t.literal('a'), t.number]) as any), {
        nonEnumerable: t.never
      })
      const res = t.enumerate(t.intersection([HyphenatedString, t.string]))
      assert.deepStrictEqual(res.nonEnumerable?.name, t.intersection([HyphenatedString, t.string]).name)
      assert.deepStrictEqual(res.literals, undefined)
      const res2 = t.enumerate(t.intersection([t.number, t.string]) as any)
      assert.deepStrictEqual(res2.nonEnumerable?.name, t.intersection([t.number, t.string]).name)
      assert.deepStrictEqual(res2.literals, undefined)
    })

    it('should handle combinations of union and intersection', () => {
      assert.deepStrictEqual(t.enumerate(t.intersection([t.union([t.literal('a'), t.literal('b')]), t.string])), {
        literals: new Set(['a', 'b'])
      })
      assert.deepStrictEqual(
        t.enumerate(t.intersection([t.union([t.literal('a'), t.literal('b')]), t.string, HyphenatedString]) as any),
        {
          nonEnumerable: t.never
        }
      )
      const codec1 = t.intersection([t.string, HyphenatedString])
      assert.deepStrictEqual(t.enumerate(t.union([codec1, t.literal('a')])), {
        literals: new Set(['a']),
        nonEnumerable: codec1
      })
      const codec2 = t.intersection([t.string, HyphenatedString])
      assert.deepStrictEqual(t.enumerate(t.union([codec2, t.literal('a-a')])), {
        nonEnumerable: codec2
      })
      assert.deepStrictEqual(
        t.enumerate(
          t.intersection([t.union([t.literal('a'), t.literal('b')]), t.union([t.literal('b'), t.literal('c')])])
        ),
        {
          literals: new Set(['b'])
        }
      )
      assert.deepStrictEqual(
        t.enumerate(
          t.intersection([t.union([t.literal('a'), t.literal('b')]), t.union([t.literal('c'), t.literal('d')])]) as any
        ),
        {
          nonEnumerable: t.never
        }
      )
      assert.deepStrictEqual(
        t.enumerate(
          t.intersection([
            t.union([t.literal('a'), t.literal('a'), t.literal('b')]),
            t.union([t.literal('c'), t.string])
          ])
        ),
        {
          literals: new Set(['a', 'b'])
        }
      )
      assert.deepStrictEqual(
        t.enumerate(
          t.union([
            t.intersection([t.literal('a'), HyphenatedString]) as any,
            t.intersection([t.literal('c'), t.string])
          ])
        ),
        {
          literals: new Set(['c'])
        }
      )
      assert.deepStrictEqual(
        t.enumerate(
          t.union([t.intersection([t.literal('a-a'), HyphenatedString]), t.intersection([t.literal('c'), t.string])])
        ),
        {
          literals: new Set(['a-a', 'c'])
        }
      )
      assert.deepStrictEqual(
        t.enumerate(
          t.union([
            t.intersection([t.literal('a'), HyphenatedString]) as any,
            t.intersection([t.literal('c'), t.literal('b')]) as any
          ])
        ),
        {
          nonEnumerable: t.never
        }
      )
      assert.deepStrictEqual(t.enumerate(t.union([t.intersection([t.literal('a-a'), HyphenatedString]), t.string])), {
        nonEnumerable: t.string
      })
    })
  })

  describe.concurrent('nonEnumerableRecord', () => {
    describe.concurrent('name', () => {
      it('should assign a default name', () => {
        const T = t.record(t.string, t.number)
        assert.strictEqual(T.name, '{ [K in string]: number }')
      })

      it('should accept a name', () => {
        const T = t.record(t.string, t.number, 'T')
        assert.strictEqual(T.name, 'T')
      })
    })

    describe.concurrent('is', () => {
      it('should return `true` on valid inputs', () => {
        const T1 = t.record(t.string, t.number)
        assert.strictEqual(T1.is({}), true)
        assert.strictEqual(T1.is({ a: 1 }), true)
        assert.strictEqual(T1.is(new Number()), true)

        const T2 = t.record(t.string, NumberFromString)
        assert.strictEqual(T2.is({}), true)
        assert.strictEqual(T2.is({ a: 1 }), true)

        const T3 = t.record(HyphenatedString, t.number)
        assert.strictEqual(T3.is({}), true)
        assert.strictEqual(T3.is({ 'a-a': 1 }), true)
        assert.strictEqual(T3.is({ 'a-a': 1, extra: null }), true)
      })

      it('should return `false` on invalid inputs', () => {
        const T1 = t.record(t.string, t.number)
        assert.strictEqual(T1.is({ a: 'a' }), false)
        assert.strictEqual(T1.is(null), false)
        // #407
        assert.strictEqual(T1.is([]), false)

        const T2 = t.record(t.string, NumberFromString)
        assert.strictEqual(T2.is({ a: 'a' }), false)
        assert.strictEqual(T2.is(null), false)
        // #407
        assert.strictEqual(T2.is([]), false)

        const T3 = t.record(HyphenatedString, t.number)
        assert.strictEqual(T3.is({ 'a-a': '1' }), false)
      })

      it('should not accept an array if the codomain is `unknown`', () => {
        const T = t.record(t.string, t.unknown)
        assert.strictEqual(T.is([]), false)
      })

      it('should accept an array if the codomain is `any`', () => {
        const T = t.record(t.string, t.any)
        assert.strictEqual(T.is([]), true)
      })
    })

    describe.concurrent('decode', () => {
      it('should decode an isomorphic value', () => {
        const T = t.record(t.string, t.number)
        assertSuccess(T.decode({}))
        assertSuccess(T.decode({ a: 1 }))
        assertSuccess(T.decode(new Number()))
      })

      it('should return the same reference while decoding isomorphic values', () => {
        const T = t.record(t.string, t.number)
        const value1 = { a: 1 }
        assertStrictSuccess(T.decode(value1), value1)
      })

      it('should decode a prismatic value', () => {
        const T = t.record(t.string, NumberFromString)
        assertSuccess(T.decode({ a: '1' }), { a: 1 })
      })

      it('should decode a prismatic key', () => {
        const T = t.record(HyphenatedStringFromNonHyphenated, t.number)
        assertSuccess(T.decode({ ab: 1 }), { 'a-b': 1 })
      })

      it('should strip keys outside the domain', () => {
        const T1 = t.record(HyphenatedString, t.number)
        assertSuccess(T1.decode({ 'a-b': 1, extra: null }), { 'a-b': 1 })
        const T2 = t.record(HyphenatedStringFromNonHyphenated, t.number)
        assertSuccess(T2.decode({ ab: 1, extra: null }), { 'a-b': 1 })
      })

      it('should not decode an array if the codomain is `unknown`', () => {
        const T = t.record(t.string, t.unknown)
        assertFailure(T, [1], ['Invalid value [1] supplied to : { [K in string]: unknown }'])
      })

      it('should decode an array if the codomain is `any`', () => {
        const T = t.record(t.string, t.any)
        assertSuccess(T.decode([1]))
      })

      it('should fail decoding an invalid value', () => {
        const T1 = t.record(t.string, t.number)
        assertFailure(T1, 1, ['Invalid value 1 supplied to : { [K in string]: number }'])
        assertFailure(T1, { aa: 's' }, ['Invalid value "s" supplied to : { [K in string]: number }/aa: number'])
        // #407
        assertFailure(T1, [], ['Invalid value [] supplied to : { [K in string]: number }'])
        // #407
        assertFailure(T1, [1], ['Invalid value [1] supplied to : { [K in string]: number }'])
        const T2 = t.record(HyphenatedString, t.number)
        assertFailure(T2, { a: 1, 'a-a': '2' }, [
          'Invalid value "2" supplied to : { [K in `${string}-${string}`]: number }/a-a: number'
        ])
      })
    })

    describe.concurrent('encode', () => {
      it('should encode an isomorphic value', () => {
        const T = t.record(t.string, t.number)
        assert.deepStrictEqual(T.encode({ a: 1 }), { a: 1 })
      })

      it('should return the same reference while decoding an isomorphic value', () => {
        const T = t.record(t.string, t.number)
        const a = { a: 1 }
        assert.strictEqual(T.encode(a), a)
      })

      it('should encode a prismatic value', () => {
        const T = t.record(t.string, NumberFromString)
        assert.deepStrictEqual(T.encode({ a: 1 }), { a: '1' })
      })

      it('should encode a prismatic key', () => {
        const T = t.record(HyphenatedStringFromNonHyphenated, t.number)
        assert.deepStrictEqual(T.encode({ 'a-b': 1 }), { ab: 1 })
      })

      it('should strip keys outside the domain', () => {
        const T1 = t.record(HyphenatedString, t.number)
        const withExtra1 = { 'a-b': 1, extra: null }
        assert.deepStrictEqual(T1.encode(withExtra1), { 'a-b': 1 })
        const T2 = t.record(HyphenatedStringFromNonHyphenated, t.number)
        const withExtra2 = { 'a-b': 1, extra: null }
        assert.deepStrictEqual(T2.encode(withExtra2), { ab: 1 })
      })

      it('should accept an array if the codomain is `any`', () => {
        const T = t.record(t.string, t.any)
        const a = [1]
        assert.strictEqual(T.encode(a), a)
      })
    })

    it('should return the same reference if validation succeeded if nothing changed', () => {
      const T1 = t.record(t.string, t.number)
      const value1 = { aa: 1 }
      assertStrictEqual(T1.decode(value1), value1)
      const T2 = t.record(HyphenatedString, t.number)
      const value2 = { 'a-a': 1 }
      assertStrictEqual(T2.decode(value2), value2)
    })

    it('should return the same reference while encoding', () => {
      const T = t.record(t.string, t.number)
      const value = { a: 1 }
      assert.strictEqual(T.encode(value), value)
    })
  })

  describe.concurrent('enumerableRecord', () => {
    describe.concurrent('name', () => {
      it('should assign a default name', () => {
        const T = t.record(t.literal('a'), t.number)
        assert.strictEqual(T.name, '{ [K in "a"]: number }')
      })

      it('should accept a name', () => {
        const T = t.record(t.literal('a'), t.number, 'T')
        assert.strictEqual(T.name, 'T')
      })
    })

    describe.concurrent('is', () => {
      it('should return `true` on valid inputs', () => {
        const T = t.record(t.literal('a'), t.string)
        assert.strictEqual(T.is({ a: 'a' }), true)
        assert.strictEqual(T.is({ a: 'a', b: 1 }), true)
      })

      it('should return `false` on invalid inputs', () => {
        const T = t.record(t.literal('a'), t.string)
        assert.strictEqual(T.is({}), false)
      })
    })

    describe.concurrent('decode', () => {
      it('should support literals as domain type', () => {
        const T = t.record(t.literal('a'), t.string)
        assertSuccess(T.decode({ a: 'a' }), { a: 'a' })
        assertSuccess(T.decode({ a: 'a', b: 1 }), { a: 'a' })
        assertFailure(T, null, ['Invalid value null supplied to : { [K in "a"]: string }'])
        assertFailure(T, {}, ['Invalid value undefined supplied to : { [K in "a"]: string }/a: string'])
        assertFailure(T, { a: 1 }, ['Invalid value 1 supplied to : { [K in "a"]: string }/a: string'])
      })

      it('should return the same reference while decoding isomorphic values', () => {
        const T = t.record(t.literal('a'), t.string)
        const value1 = { a: 'a' }
        assertStrictSuccess(T.decode(value1), value1)
      })

      it('should support keyof as domain type', () => {
        const T = t.record(t.keyof({ a: null, b: null }), t.string)
        assertSuccess(T.decode({ a: 'a', b: 'b' }), { a: 'a', b: 'b' })
        assertSuccess(T.decode({ a: 'a', b: 'b', c: 1 }), { a: 'a', b: 'b' })
        assertFailure(T, {}, [
          'Invalid value undefined supplied to : { [K in "a" | "b"]: string }/a: string',
          'Invalid value undefined supplied to : { [K in "a" | "b"]: string }/b: string'
        ])
        assertFailure(T, { a: 'a' }, ['Invalid value undefined supplied to : { [K in "a" | "b"]: string }/b: string'])
        assertFailure(T, { b: 'b' }, ['Invalid value undefined supplied to : { [K in "a" | "b"]: string }/a: string'])
      })

      it('#391', () => {
        const T = t.intersection([t.record(t.literal('a'), t.string), t.record(t.string, t.unknown)])
        assertSuccess(T.decode({ a: 'a', b: 'b' }), { a: 'a', b: 'b' })
        assertFailure(T, { b: 'b' }, [
          'Invalid value undefined supplied to : ({ [K in "a"]: string } & { [K in string]: unknown })/0: { [K in "a"]: string }/a: string'
        ])
      })

      it('should decode a prismatic value', () => {
        const T = t.record(t.literal('a'), NumberFromString)
        assertSuccess(T.decode({ a: '1' }), { a: 1 })
      })
    })

    describe.concurrent('encode', () => {
      it('should encode an isomorphic value', () => {
        const T = t.record(t.literal('a'), t.number)
        assert.deepStrictEqual(T.encode({ a: 1 }), { a: 1 })
      })

      it('should return the same reference while decoding an isomorphic value', () => {
        const T = t.record(t.literal('a'), t.number)
        const a = { a: 1 }
        assert.strictEqual(T.encode(a), a)
      })

      it('should encode a prismatic value', () => {
        const T = t.record(t.literal('a'), NumberFromString)
        assert.deepStrictEqual(T.encode({ a: 1 }), { a: '1' })
      })

      it('should strip keys outside the domain', () => {
        const T = t.record(t.literal('a'), t.number)
        const withExtra = { a: 1, extra: null }
        assert.deepEqual(T.encode(withExtra), { a: 1 })
      })
    })
  })

  describe.concurrent('partiallyEnumerableRecord', () => {
    describe.concurrent('is', () => {
      it('should return `true` on valid inputs', () => {
        const T = t.record(t.union([t.literal('a'), HyphenatedString]), t.string)
        assert.strictEqual(T.is({ a: 'a' }), true)
        assert.strictEqual(T.is({ a: 'a', 'a-b': 'a' }), true)
        assert.strictEqual(T.is({ a: 'a', 'a-b': 'a-b', b: 1 }), true)
      })

      it('should return `false` on invalid inputs', () => {
        const T = t.record(t.union([t.literal('a'), HyphenatedString]), t.string)
        assert.strictEqual(T.is({ 'a-b': 'a-b' }), false)
        assert.strictEqual(T.is({ a: 'a', 'a-b': 1 }), false)
      })
    })

    describe.concurrent('decode', () => {
      it('should support literals as domain type', () => {
        const T = t.record(t.union([t.literal('a'), HyphenatedString]), t.string)
        assertSuccess(T.decode({ a: 'a' }), { a: 'a' })
        assertSuccess(T.decode({ a: 'a', 'a-b': 'a' }), { a: 'a', 'a-b': 'a' })
        assertSuccess(T.decode({ a: 'a', 'a-b': 'a-b', b: 1 }), { a: 'a', 'a-b': 'a-b' })
        assertFailure(T, null, [
          'Invalid value null supplied to : { [K in ("a" | `${string}-${string}`)]: string }/0: { [K in `${string}-${string}`]: string }',
          'Invalid value null supplied to : { [K in ("a" | `${string}-${string}`)]: string }/1: { [K in "a"]: string }'
        ])
        assertFailure(T, {}, [
          'Invalid value undefined supplied to : { [K in ("a" | `${string}-${string}`)]: string }/1: { [K in "a"]: string }/a: string'
        ])
        assertFailure(T, { a: 1 }, [
          'Invalid value 1 supplied to : { [K in ("a" | `${string}-${string}`)]: string }/1: { [K in "a"]: string }/a: string'
        ])
        assertFailure(T, { 'a-b': 1 }, [
          'Invalid value 1 supplied to : { [K in ("a" | `${string}-${string}`)]: string }/0: { [K in `${string}-${string}`]: string }/a-b: string',
          'Invalid value undefined supplied to : { [K in ("a" | `${string}-${string}`)]: string }/1: { [K in "a"]: string }/a: string'
        ])

        const T2 = t.record(t.union([t.literal('a'), HyphenatedString, t.string]), t.string)
        assertFailure(T2, { c: 1 }, [
          'Invalid value 1 supplied to : { [K in ("a" | `${string}-${string}` | string)]: string }/c: string'
        ])

        const T3 = t.record(t.intersection([t.literal('a'), t.string]), t.string)
        assertFailure(T3, { c: 1 }, [
          'Invalid value undefined supplied to : { [K in ("a" & string)]: string }/a: string'
        ])
      })

      it('should return the same reference while decoding isomorphic values if entirely enumerable or nonEnumerable', () => {
        const T1 = t.record(t.union([t.literal('a'), t.string]), t.string)
        const value1 = { a: 'a' }
        assertStrictSuccess(T1.decode(value1), value1)

        const T2 = t.record(t.intersection([t.literal('a'), t.string]), t.string)
        const value2 = { a: 'a' }
        assertStrictSuccess(T2.decode(value2), value2)
      })

      it('should decode a prismatic value', () => {
        const T = t.record(t.union([t.literal('a'), HyphenatedStringFromNonHyphenated]), t.string)
        assertSuccess(T.decode({ a: 'a', bb: 'b-b' }), { a: 'a', 'b-b': 'b-b' })
      })
    })
  })
})
