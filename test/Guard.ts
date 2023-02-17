import * as assert from 'assert'
import * as G from '../src/Guard'
import { pipe } from 'fp-ts/lib/pipeable'
import { Stream } from 'stream'

interface NonEmptyStringBrand {
  readonly NonEmptyString: unique symbol
}

type NonEmptyString = string & NonEmptyStringBrand

const NonEmptyString: G.Guard<string, NonEmptyString> = {
  is: (s): s is NonEmptyString => s.length > 0
}

describe('Guard', () => {
  it('alt', () => {
    const guard = pipe(
      G.string,
      G.alt<unknown, string | number>(() => G.number)
    )
    assert.strictEqual(guard.is('a'), true)
    assert.strictEqual(guard.is(1), true)
    assert.strictEqual(guard.is(null), false)
  })

  it('zero', () => {
    const guard = G.zero()
    assert.strictEqual(guard.is('a'), false)
  })

  it('compose', () => {
    const guard = pipe(G.string, G.compose(NonEmptyString))
    assert.strictEqual(guard.is('a'), true)
    assert.strictEqual(guard.is(null), false)
    assert.strictEqual(guard.is(''), false)
  })

  it('id', () => {
    const guard = G.id<string>()
    assert.strictEqual(guard.is('a'), true)
  })

  describe('number', () => {
    it('should exclude NaN', () => {
      assert.deepStrictEqual(G.number.is(NaN), false)
    })
  })

  describe('refine', () => {
    it('should accept valid inputs', () => {
      const guard = pipe(
        G.string,
        G.refine((s): s is string => s.length > 0)
      )
      assert.strictEqual(guard.is('a'), true)
    })

    it('should reject invalid inputs', () => {
      const guard = pipe(
        G.string,
        G.refine((s): s is string => s.length > 0)
      )
      assert.strictEqual(guard.is(undefined), false)
      assert.strictEqual(guard.is(''), false)
    })
  })

  describe('nullable', () => {
    it('should accept valid inputs', () => {
      const guard = G.nullable(G.string)
      assert.strictEqual(guard.is(null), true)
      assert.strictEqual(guard.is('a'), true)
    })

    it('should reject invalid inputs', () => {
      const guard = G.nullable(G.string)
      assert.strictEqual(guard.is(1), false)
    })
  })

  describe('optional', () => {
    it('should accept valid inputs', () => {
      const guard = G.optional(G.string)
      assert.strictEqual(guard.is(undefined), true)
      assert.strictEqual(guard.is('a'), true)
    })

    it('should reject invalid inputs', () => {
      const guard = G.optional(G.string)
      assert.strictEqual(guard.is(1), false)
    })
  })

  describe('struct', () => {
    it('should accept valid inputs', () => {
      const guard = G.struct({ a: G.string, b: G.number })
      assert.strictEqual(guard.is({ a: 'a', b: 1 }), true)
    })

    it('should accept additional fields', () => {
      const guard = G.struct({ a: G.string, b: G.number })
      assert.strictEqual(guard.is({ a: 'a', b: 1, c: true }), true)
    })

    it('should reject invalid inputs', () => {
      const guard = G.struct({ a: G.string, b: G.number })
      assert.strictEqual(guard.is(undefined), false)
      assert.strictEqual(guard.is({ a: 'a' }), false)
    })

    it('should check missing fields', () => {
      const undef: G.Guard<unknown, undefined> = {
        is: (u): u is undefined => u === undefined
      }
      const guard = G.struct({ a: undef })
      assert.strictEqual(guard.is({}), false)
    })

    it('should support getters', () => {
      class A {
        get a() {
          return 'a'
        }
        get b() {
          return 'b'
        }
      }
      const guard = G.struct({ a: G.string, b: G.string })
      assert.deepStrictEqual(guard.is(new A()), true)
    })
  })

  describe('partial', () => {
    it('should accept valid inputs', () => {
      const guard = G.partial({ a: G.string, b: G.number })
      assert.strictEqual(guard.is({ a: 'a', b: 1 }), true)
      assert.strictEqual(guard.is({ a: 'a' }), true)
      assert.strictEqual(guard.is({ b: 1 }), true)
      assert.strictEqual(guard.is({}), true)
    })

    it('should accept additional fields', () => {
      const guard = G.partial({ a: G.string, b: G.number })
      assert.strictEqual(guard.is({ a: 'a', b: 1, c: true }), true)
    })

    it('should reject invalid inputs', () => {
      const guard = G.partial({ a: G.string, b: G.number })
      assert.strictEqual(guard.is(undefined), false)
      assert.strictEqual(guard.is({ a: 'a', b: 'b' }), false)
    })

    it('should support getters', () => {
      class A {
        get a() {
          return 'a'
        }
        get b() {
          return 'b'
        }
      }
      const guard = G.partial({ a: G.string, b: G.string })
      assert.deepStrictEqual(guard.is(new A()), true)
    })
  })

  describe('record', () => {
    it('should accept valid inputs', () => {
      const guard = G.record(G.string)
      assert.strictEqual(guard.is({}), true)
      assert.strictEqual(guard.is({ a: 'a', b: 'b' }), true)
    })

    it('should reject invalid inputs', () => {
      const guard = G.record(G.string)
      assert.strictEqual(guard.is(undefined), false)
      assert.strictEqual(guard.is({ a: 'a', b: 1 }), false)
    })
  })

  describe('array', () => {
    it('should accept valid inputs', () => {
      const guard = G.array(G.number)
      assert.strictEqual(guard.is([]), true)
      assert.strictEqual(guard.is([1, 2, 3]), true)
    })

    it('should reject invalid inputs', () => {
      const guard = G.array(G.number)
      assert.strictEqual(guard.is(undefined), false)
      assert.strictEqual(guard.is(['a']), false)
    })
  })

  describe('tuple', () => {
    it('should accept valid inputs', () => {
      const guard = G.tuple(G.string, G.number)
      assert.strictEqual(guard.is(['a', 1]), true)
    })

    it('should reject invalid inputs', () => {
      const guard = G.tuple(G.string, G.number)
      assert.strictEqual(guard.is([1, 2]), false)
    })

    it('should reject additional fields', () => {
      const guard = G.tuple(G.string, G.number)
      assert.strictEqual(guard.is(['a', 1, true]), false)
    })

    it('should reject missing fields', () => {
      const guard = G.tuple(G.string, G.number)
      assert.strictEqual(guard.is(['a']), false)
    })
  })

  describe('intersect', () => {
    it('should accept valid inputs', () => {
      const guard = pipe(G.struct({ a: G.string }), G.intersect(G.struct({ b: G.number })))
      assert.strictEqual(guard.is({ a: 'a', b: 1 }), true)
    })

    it('should reject invalid inputs', () => {
      const guard = pipe(G.struct({ a: G.string }), G.intersect(G.struct({ b: G.number })))
      assert.strictEqual(guard.is({ a: 'a' }), false)
    })
  })

  describe('union', () => {
    it('should accept valid inputs', () => {
      const guard = G.union(G.string, G.number)
      assert.strictEqual(guard.is('a'), true)
      assert.strictEqual(guard.is(1), true)
    })

    it('should reject invalid inputs', () => {
      const guard = G.union(G.string, G.number)
      assert.strictEqual(guard.is(undefined), false)
    })
  })

  describe('lazy', () => {
    interface A {
      a: number
      b: Array<A>
    }

    const guard: G.Guard<unknown, A> = G.Schemable.lazy('A', () =>
      G.struct({
        a: G.number,
        b: G.array(guard)
      })
    )

    it('should accept valid inputs', () => {
      assert.strictEqual(guard.is({ a: 1, b: [] }), true)
      assert.strictEqual(guard.is({ a: 1, b: [{ a: 2, b: [] }] }), true)
    })

    it('should reject invalid inputs', () => {
      const guard = G.union(G.string, G.number)
      assert.strictEqual(guard.is(undefined), false)
    })
  })

  describe('sum', () => {
    const sum = G.sum('_tag')

    it('should accept valid inputs', () => {
      const guard = sum({
        A: G.struct({ _tag: G.literal('A'), a: G.string }),
        B: G.struct({ _tag: G.literal('B'), b: G.number })
      })
      assert.deepStrictEqual(guard.is({ _tag: 'A', a: 'a' }), true)
      assert.deepStrictEqual(guard.is({ _tag: 'B', b: 1 }), true)
    })

    it('should reject invalid inputs', () => {
      const guard = sum({
        A: G.struct({ _tag: G.literal('A'), a: G.string }),
        B: G.struct({ _tag: G.literal('B'), b: G.number })
      })
      assert.strictEqual(guard.is(undefined), false)
      assert.strictEqual(guard.is({}), false)
    })

    it('should support non-`string` tag values', () => {
      const guard = G.sum('_tag')({
        [1]: G.struct({ _tag: G.literal(1), a: G.string }),
        [2]: G.struct({ _tag: G.literal(2), b: G.number })
      })
      assert.deepStrictEqual(guard.is({ _tag: 1, a: 'a' }), true)
      assert.deepStrictEqual(guard.is({ _tag: 2, b: 1 }), true)
      assert.deepStrictEqual(guard.is({ _tag: 2, b: 'a' }), false)
    })
  })

  describe('UnknownRecord', () => {
    it('should accept valid inputs', () => {
      assert.deepStrictEqual(G.UnknownRecord.is({}), true)
      assert.deepStrictEqual(G.UnknownRecord.is(new String()), true)
      assert.deepStrictEqual(G.UnknownRecord.is(new Number()), true)
      assert.deepStrictEqual(G.UnknownRecord.is(new Set()), true)
      assert.deepStrictEqual(G.UnknownRecord.is(new Map()), true)
      assert.deepStrictEqual(G.UnknownRecord.is(new Stream()), true)
    })

    it('should reject invalid inputs', () => {
      assert.deepStrictEqual(G.UnknownRecord.is(null), false)
      assert.deepStrictEqual(G.UnknownRecord.is(undefined), false)
      assert.deepStrictEqual(G.UnknownRecord.is([]), false)
    })
  })
})
