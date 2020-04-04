import * as assert from 'assert'
import * as t from '../src/index'
import {
  assertFailure,
  assertStrictEqual,
  assertStrictSuccess,
  assertSuccess,
  HyphenatedString,
  NumberFromString
} from './helpers'

describe('record', () => {
  describe('nonEnumerableRecord', () => {
    describe('name', () => {
      it('should assign a default name', () => {
        const T = t.record(t.string, t.number)
        assert.strictEqual(T.name, '{ [K in string]: number }')
      })

      it('should accept a name', () => {
        const T = t.record(t.string, t.number, 'T')
        assert.strictEqual(T.name, 'T')
      })
    })

    describe('is', () => {
      it('should return `true` on valid inputs', () => {
        const T1 = t.record(t.string, t.number)
        assert.strictEqual(T1.is({}), true)
        assert.strictEqual(T1.is({ a: 1 }), true)

        const T2 = t.record(t.string, NumberFromString)
        assert.strictEqual(T2.is({}), true)
        assert.strictEqual(T2.is({ a: 1 }), true)

        const T3 = t.record(HyphenatedString, t.number)
        assert.strictEqual(T3.is({}), true)
        assert.strictEqual(T3.is({ 'a-a': 1 }), true)
      })

      it('should return `false` on invalid inputs', () => {
        const T1 = t.record(t.string, t.number)
        assert.strictEqual(T1.is({ a: 'a' }), false)
        assert.strictEqual(T1.is(null), false)
        assert.strictEqual(T1.is(new Number()), false)
        // #407
        assert.strictEqual(T1.is([]), false)

        const T2 = t.record(t.string, NumberFromString)
        assert.strictEqual(T2.is({ a: 'a' }), false)
        assert.strictEqual(T2.is(null), false)
        // #407
        assert.strictEqual(T2.is([]), false)

        const T3 = t.record(HyphenatedString, t.number)
        assert.strictEqual(T3.is({ aa: 1 }), false)
      })

      it('should not accept an array if the codomain is `unknown`', () => {
        const T = t.record(t.string, t.unknown)
        assert.strictEqual(T.is([]), false)
      })

      it('should accept an array if the codomain is `any`', () => {
        // tslint:disable-next-line: deprecation
        const T = t.record(t.string, t.any)
        assert.strictEqual(T.is([]), true)
      })
    })

    describe('decode', () => {
      it('should decode a isomorphic value', () => {
        const T = t.record(t.string, t.number)
        assertSuccess(T.decode({}))
        assertSuccess(T.decode({ a: 1 }))
      })

      it.skip('should strip additional properties', () => {
        const T = t.record(t.string, t.number)
        assertSuccess(T.decode({ a: 1, b: 'b' }), { a: 1 })
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
        const T = t.record(HyphenatedString, t.number)
        assertSuccess(T.decode({ ab: 1 }), { 'a-b': 1 })
      })

      it('should not decode an array if the codomain is `unknown`', () => {
        const T = t.record(t.string, t.unknown)
        assertFailure(T, [1], ['Invalid value [1] supplied to : { [K in string]: unknown }'])
      })

      it('should decode an array if the codomain is `any`', () => {
        // tslint:disable-next-line: deprecation
        const T = t.record(t.string, t.any)
        assertSuccess(T.decode([1]))
      })

      it('should fail decoding an invalid value', () => {
        const T1 = t.record(t.string, t.number)
        assertFailure(T1, 1, ['Invalid value 1 supplied to : { [K in string]: number }'])
        assertFailure(T1, { aa: 's' }, ['Invalid value "s" supplied to : { [K in string]: number }/aa: number'])
        assertFailure(T1, new Number(), ['Invalid value 0 supplied to : { [K in string]: number }'])
        // #407
        assertFailure(T1, [], ['Invalid value [] supplied to : { [K in string]: number }'])
        // #407
        assertFailure(T1, [1], ['Invalid value [1] supplied to : { [K in string]: number }'])
        const T2 = t.record(HyphenatedString, t.number)
        assertFailure(T2, { a: 1 }, [
          'Invalid value "a" supplied to : { [K in HyphenatedString]: number }/a: HyphenatedString'
        ])
      })
    })

    describe('encode', () => {
      it('should encode a isomorphic value', () => {
        const T = t.record(t.string, t.number)
        assert.deepStrictEqual(T.encode({ a: 1 }), { a: 1 })
      })

      it('should return the same reference while decoding a isomorphic value', () => {
        const T = t.record(t.string, t.number)
        const a = { a: 1 }
        assert.strictEqual(T.encode(a), a)
      })

      it('should encode a prismatic value', () => {
        const T = t.record(t.string, NumberFromString)
        assert.deepStrictEqual(T.encode({ a: 1 }), { a: '1' })
      })

      it('should encode a prismatic key', () => {
        const T = t.record(HyphenatedString, t.number)
        assert.deepStrictEqual(T.encode({ 'a-b': 1 }), { ab: 1 })
      })

      it('should accept an array if the codomain is `any`', () => {
        // tslint:disable-next-line: deprecation
        const T = t.record(t.string, t.any)
        const a = [1]
        assert.strictEqual(T.encode(a), a)
      })
    })

    it('should return the same reference if validation succeeded if nothing changed', () => {
      const T1 = t.record(t.string, t.number)
      const value1 = { aa: 1 }
      assertStrictEqual(T1.decode(value1), value1)
      const T2 = t.record(
        // tslint:disable-next-line: deprecation
        t.refinement(t.string, (s) => s.length >= 2),
        t.number
      )
      const value2 = { aa: 1 }
      assertStrictEqual(T2.decode(value2), value2)
    })

    it('should return the same reference while encoding', () => {
      const T1 = t.record(t.string, t.number)
      assert.strictEqual(T1.encode, t.identity)
      const T2 = t.record(HyphenatedString, t.number)
      assert.strictEqual(T2.encode === t.identity, false)
    })
  })

  describe('enumerableRecord', () => {
    describe('getDomainKeys', () => {
      it('should handle literal', () => {
        assert.deepStrictEqual(t.getDomainKeys(t.literal('a')), { a: null })
        assert.deepStrictEqual(t.getDomainKeys(t.literal(1)), undefined)
      })

      it('should handle keyof', () => {
        assert.deepStrictEqual(t.getDomainKeys(t.keyof({ a: 1, b: 2 })), { a: 1, b: 2 })
      })

      it('should handle union', () => {
        assert.deepStrictEqual(t.getDomainKeys(t.union([t.literal('a'), t.literal('b')])), { a: null, b: null })
        assert.deepStrictEqual(t.getDomainKeys(t.union([t.literal('a'), t.string])), undefined)
      })
    })

    describe('name', () => {
      it('should assign a default name', () => {
        const T = t.record(t.literal('a'), t.number)
        assert.strictEqual(T.name, '{ [K in "a"]: number }')
      })

      it('should accept a name', () => {
        const T = t.record(t.literal('a'), t.number, 'T')
        assert.strictEqual(T.name, 'T')
      })
    })

    describe('is', () => {
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

    describe('decode', () => {
      it('should support literals as domain type', () => {
        const T = t.record(t.literal('a'), t.string)
        assertSuccess(T.decode({ a: 'a' }), { a: 'a' })
        assertSuccess(T.decode({ a: 'a', b: 1 }), { a: 'a' })
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
    })

    describe('encode', () => {
      it('should encode a isomorphic value', () => {
        const T = t.record(t.literal('a'), t.number)
        assert.deepStrictEqual(T.encode({ a: 1 }), { a: 1 })
      })

      it('should return the same reference while decoding a isomorphic value', () => {
        const T = t.record(t.literal('a'), t.number)
        const a = { a: 1 }
        assert.strictEqual(T.encode(a), a)
      })

      it('should encode a prismatic value', () => {
        const T = t.record(t.literal('a'), NumberFromString)
        assert.deepStrictEqual(T.encode({ a: 1 }), { a: '1' })
      })
    })
  })
})
