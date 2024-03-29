import * as assert from 'assert'

import * as t from '../../src/index'
import { assertFailure, assertStrictEqual, assertSuccess, NumberFromString } from './helpers'

describe.concurrent('intersection', () => {
  it('mergeAll', () => {
    assert.deepStrictEqual(t.mergeAll(undefined, [{ prop1: 'b', prop2: 2 }, { prop1: 'a' }, { prop2: 1 }]), {
      prop1: 'a',
      prop2: 1
    })
  })

  describe.concurrent('name', () => {
    it('should assign a default name', () => {
      const T = t.intersection([t.type({ a: t.string }), t.type({ b: t.number })])
      assert.strictEqual(T.name, '({ a: string } & { b: number })')
    })

    it('should accept a name', () => {
      const T = t.intersection([t.type({ a: t.string }), t.type({ b: t.number })], 'T')
      assert.strictEqual(T.name, 'T')
    })
  })

  describe.concurrent('is', () => {
    it('should check a isomorphic value', () => {
      const T = t.intersection([t.type({ a: t.string }), t.type({ b: t.number })])
      assert.strictEqual(T.is({}), false)
      assert.strictEqual(T.is({ a: 'a' }), false)
      assert.strictEqual(T.is({ b: 1 }), false)
      assert.strictEqual(T.is({ a: 'a', b: 1 }), true)
    })

    it('should check a prismatic value', () => {
      const T = t.intersection([t.type({ a: t.string }), t.type({ b: NumberFromString })])
      assert.strictEqual(T.is({}), false)
      assert.strictEqual(T.is({ a: 'a' }), false)
      assert.strictEqual(T.is({ b: 1 }), false)
      assert.strictEqual(T.is({ a: 'a', b: 1 }), true)
    })

    it('should succeed when exact codecs are involved', () => {
      const A = t.exact(t.type({ a: t.string }))
      const B = t.exact(t.type({ b: t.number }))
      const T = t.intersection([A, B])
      assert.strictEqual(T.is({ a: 'a', b: 1 }), true)
    })
  })

  describe.concurrent('decode', () => {
    it('should decode a isomorphic value', () => {
      const T = t.intersection([t.type({ a: t.string }), t.type({ b: t.number })])
      assertSuccess(T.decode({ a: 'a', b: 1 }))
    })

    it('should decode a prismatic value', () => {
      const T1 = t.intersection([t.type({ a: t.string }), t.type({ b: NumberFromString })])
      assertSuccess(T1.decode({ a: 'a', b: '1' }), { a: 'a', b: 1 })
      const T2 = t.intersection([t.type({ b: NumberFromString }), t.type({ a: t.string })])
      assertSuccess(T2.decode({ a: 'a', b: '1' }), { a: 'a', b: 1 })
      const T3 = t.intersection([t.type({ b: NumberFromString }), t.type({ a: t.string }), t.type({ c: t.string })])
      assertSuccess(T3.decode({ a: 'a', b: '1', c: 'c' }), { a: 'a', b: 1, c: 'c' })
      const T4 = t.intersection([
        t.type({ b: NumberFromString }),
        t.type({ a: t.string }),
        t.type({ c: NumberFromString })
      ])
      assertSuccess(T4.decode({ a: 'a', b: '1', c: '2' }), { a: 'a', b: 1, c: 2 })
      const T5 = t.intersection([t.type({ b: NumberFromString }), t.type({})])
      assertSuccess(T5.decode({ b: '1' }), { b: 1 })
    })

    it('should fail decoding an invalid value', () => {
      const T = t.intersection([t.type({ a: t.string }), t.type({ b: t.number })])
      assertFailure(T, null, [
        'Invalid value null supplied to : ({ a: string } & { b: number })/0: { a: string }',
        'Invalid value null supplied to : ({ a: string } & { b: number })/1: { b: number }'
      ])
      assertFailure(T, { a: 1 }, [
        'Invalid value 1 supplied to : ({ a: string } & { b: number })/0: { a: string }/a: string',
        'Invalid value undefined supplied to : ({ a: string } & { b: number })/1: { b: number }/b: number'
      ])
    })

    it('should keep unknown properties', () => {
      const T = t.intersection([t.type({ a: t.number }), t.type({ b: t.number })])
      const x = { a: 1, b: 1, c: true }
      assertSuccess(T.decode({ a: 1, b: 1, c: true }), x)
    })

    it('should return the same reference while decoding', () => {
      const T = t.intersection([t.type({ a: t.number }), t.type({ b: t.number })])
      const value = { a: 1, b: 2 }
      assertStrictEqual(T.decode(value), value)
    })

    it('should play well with exact', () => {
      const T1 = t.intersection([t.exact(t.type({ a: t.string })), t.exact(t.type({ b: t.number }))])
      assertSuccess(T1.decode({ a: 'a', b: 1 }), { a: 'a', b: 1 })
      assertSuccess(T1.decode({ a: 'a', b: 1, c: true }), { a: 'a', b: 1 })
      assertFailure(T1, { a: 'a' }, [
        'Invalid value undefined supplied to : ({| a: string |} & {| b: number |})/1: {| b: number |}/b: number'
      ])

      const T2 = t.intersection([t.exact(t.type({})), t.partial({ a: t.number })])
      assertSuccess(T2.decode({}), {})
      assertSuccess(T2.decode({ a: 1 }), { a: 1 })
      assertSuccess(T2.decode({ a: undefined }), { a: undefined })
      assertSuccess(T2.decode({ a: 1, b: true }), { a: 1, b: true } as any)

      // #397
      const T3 = t.intersection([t.exact(t.type({})), t.exact(t.partial({ a: t.number }))])
      assertSuccess(T3.decode({}), {})
      assertSuccess(T3.decode({ a: 1 }), { a: 1 })
      assertSuccess(T3.decode({ a: undefined }), { a: undefined })
      assertSuccess(T3.decode({ a: 1, b: true }), { a: 1 })

      const T4 = t.intersection([t.type({ b: t.string }), t.exact(t.partial({ a: t.number }))])
      assertSuccess(T4.decode({ b: 'b' }), { b: 'b' })
      assertSuccess(T4.decode({ b: 'b', a: 1 }), { b: 'b', a: 1 })
      assertSuccess(T4.decode({ b: 'b', a: undefined }), { b: 'b', a: undefined })
      assertSuccess(T4.decode({ b: 'b', a: 1, c: 2 }), { b: 'b', a: 1, c: 2 } as any)
    })
  })

  describe.concurrent('encode', () => {
    it('should encode a isomorphic value', () => {
      const T = t.intersection([t.type({ a: t.string }), t.type({ b: t.number })])
      assert.deepStrictEqual(T.encode({ a: 'a', b: 1 }), { a: 'a', b: 1 })
    })

    it('should encode a prismatic value', () => {
      const T1 = t.intersection([t.type({ a: t.string }), t.type({ b: NumberFromString })])
      assert.deepStrictEqual(T1.encode({ a: 'a', b: 1 }), { a: 'a', b: '1' })
      const T2 = t.intersection([t.type({ b: NumberFromString }), t.type({ a: t.string })])
      assert.deepStrictEqual(T2.encode({ a: 'a', b: 1 }), { a: 'a', b: '1' })
      const T3 = t.intersection([t.type({ b: NumberFromString }), t.type({ a: t.string }), t.type({ c: t.string })])
      assert.deepStrictEqual(T3.encode({ a: 'a', b: 1, c: 'c' }), { a: 'a', b: '1', c: 'c' })
      const T4 = t.intersection([
        t.type({ b: NumberFromString }),
        t.type({ a: t.string }),
        t.type({ c: NumberFromString })
      ])
      assert.deepStrictEqual(T4.encode({ a: 'a', b: 1, c: 2 }), { a: 'a', b: '1', c: '2' })
      const T5 = t.intersection([t.type({ b: NumberFromString }), t.type({})])
      assert.deepStrictEqual(T5.encode({ b: 1 }), { b: '1' })
    })

    it('should return the same reference while encoding', () => {
      const T = t.intersection([t.type({ a: t.number }), t.type({ b: t.number })])
      const x = { a: 1, b: 2 }
      assert.strictEqual(T.encode(x), x)
    })

    it('should play well with stripping combinators', () => {
      const A = t.exact(t.type({ a: t.string }))
      const B = t.exact(t.type({ b: t.number }))
      const T = t.intersection([A, B])
      assert.deepStrictEqual(T.encode({ a: 'a', b: 1 }), { a: 'a', b: 1 })
      const x = { a: 'a', b: 1, c: true }
      assert.deepStrictEqual(T.encode(x), { a: 'a', b: 1 })
    })
  })

  it('should handle zero types', () => {
    const T = t.intersection([] as any)
    assert.strictEqual(T.is(1), true)
    assertSuccess(T.decode(1), 1)
    assert.strictEqual(T.encode('a'), 'a')
  })

  it('should handle one type', () => {
    const T = t.intersection([t.string] as any)
    assert.strictEqual(T.is('a'), true)
    assert.strictEqual(T.is(1), false)
    assertSuccess(T.decode('a'), 'a')
    assertFailure(T, 1, ['Invalid value 1 supplied to : (string)/0: string'])
    assert.strictEqual(T.encode('a'), 'a')
  })

  it('should handle primitives', () => {
    const T1 = t.intersection([t.string, t.string])
    assert.strictEqual(T1.is('a'), true)
    assert.strictEqual(T1.is(1), false)
    assertSuccess(T1.decode('a'), 'a')
    assertFailure(T1, 1, [
      'Invalid value 1 supplied to : (string & string)/0: string',
      'Invalid value 1 supplied to : (string & string)/1: string'
    ])
    assert.strictEqual(T1.encode('a'), 'a')
    const T2 = t.intersection([NumberFromString, NumberFromString])
    assertSuccess(T2.decode('1'), 1)
    assert.strictEqual(T2.encode(1), '1')
  })
})
