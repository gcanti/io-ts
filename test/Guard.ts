import * as assert from 'assert'
import * as G from '../src/Guard'
import { pipe } from 'fp-ts/lib/pipeable'

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
    it('should accepts valid inputs', () => {
      const guard = pipe(
        G.string,
        G.refine((s): s is string => s.length > 0)
      )
      assert.strictEqual(guard.is('a'), true)
    })

    it('should rejects invalid inputs', () => {
      const guard = pipe(
        G.string,
        G.refine((s): s is string => s.length > 0)
      )
      assert.strictEqual(guard.is(undefined), false)
      assert.strictEqual(guard.is(''), false)
    })
  })

  describe('nullable', () => {
    it('should accepts valid inputs', () => {
      const guard = G.nullable(G.string)
      assert.strictEqual(guard.is(null), true)
      assert.strictEqual(guard.is('a'), true)
    })

    it('should rejects invalid inputs', () => {
      const guard = G.nullable(G.string)
      assert.strictEqual(guard.is(1), false)
    })
  })

  describe('type', () => {
    it('should accepts valid inputs', () => {
      const guard = G.type({ a: G.string, b: G.number })
      assert.strictEqual(guard.is({ a: 'a', b: 1 }), true)
    })

    it('should accepts additional fields', () => {
      const guard = G.type({ a: G.string, b: G.number })
      assert.strictEqual(guard.is({ a: 'a', b: 1, c: true }), true)
    })

    it('should rejects invalid inputs', () => {
      const guard = G.type({ a: G.string, b: G.number })
      assert.strictEqual(guard.is(undefined), false)
      assert.strictEqual(guard.is({ a: 'a' }), false)
    })

    it('should check missing fields', () => {
      const undef: G.Guard<unknown, undefined> = {
        is: (u): u is undefined => u === undefined
      }
      const guard = G.type({ a: undef })
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
      const guard = G.type({ a: G.string, b: G.string })
      assert.deepStrictEqual(guard.is(new A()), true)
    })
  })

  describe('partial', () => {
    it('should accepts valid inputs', () => {
      const guard = G.partial({ a: G.string, b: G.number })
      assert.strictEqual(guard.is({ a: 'a', b: 1 }), true)
      assert.strictEqual(guard.is({ a: 'a' }), true)
      assert.strictEqual(guard.is({ b: 1 }), true)
      assert.strictEqual(guard.is({}), true)
    })

    it('should accepts additional fields', () => {
      const guard = G.partial({ a: G.string, b: G.number })
      assert.strictEqual(guard.is({ a: 'a', b: 1, c: true }), true)
    })

    it('should rejects invalid inputs', () => {
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
    it('should accepts valid inputs', () => {
      const guard = G.record(G.string)
      assert.strictEqual(guard.is({}), true)
      assert.strictEqual(guard.is({ a: 'a', b: 'b' }), true)
    })

    it('should rejects invalid inputs', () => {
      const guard = G.record(G.string)
      assert.strictEqual(guard.is(undefined), false)
      assert.strictEqual(guard.is({ a: 'a', b: 1 }), false)
    })
  })

  describe('array', () => {
    it('should accepts valid inputs', () => {
      const guard = G.array(G.number)
      assert.strictEqual(guard.is([]), true)
      assert.strictEqual(guard.is([1, 2, 3]), true)
    })

    it('should rejects invalid inputs', () => {
      const guard = G.array(G.number)
      assert.strictEqual(guard.is(undefined), false)
      assert.strictEqual(guard.is(['a']), false)
    })
  })

  describe('tuple', () => {
    it('should accepts valid inputs', () => {
      const guard = G.tuple(G.string, G.number)
      assert.strictEqual(guard.is(['a', 1]), true)
    })

    it('should rejects invalid inputs', () => {
      const guard = G.tuple(G.string, G.number)
      assert.strictEqual(guard.is([1, 2]), false)
    })

    it('should rejects additional fields', () => {
      const guard = G.tuple(G.string, G.number)
      assert.strictEqual(guard.is(['a', 1, true]), false)
    })

    it('should rejects missing fields', () => {
      const guard = G.tuple(G.string, G.number)
      assert.strictEqual(guard.is(['a']), false)
    })
  })

  describe('intersect', () => {
    it('should accepts valid inputs', () => {
      const guard = pipe(G.type({ a: G.string }), G.intersect(G.type({ b: G.number })))
      assert.strictEqual(guard.is({ a: 'a', b: 1 }), true)
    })

    it('should rejects invalid inputs', () => {
      const guard = pipe(G.type({ a: G.string }), G.intersect(G.type({ b: G.number })))
      assert.strictEqual(guard.is({ a: 'a' }), false)
    })
  })

  describe('union', () => {
    it('should accepts valid inputs', () => {
      const guard = G.union(G.string, G.number)
      assert.strictEqual(guard.is('a'), true)
      assert.strictEqual(guard.is(1), true)
    })

    it('should rejects invalid inputs', () => {
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
      G.type({
        a: G.number,
        b: G.array(guard)
      })
    )

    it('should accepts valid inputs', () => {
      assert.strictEqual(guard.is({ a: 1, b: [] }), true)
      assert.strictEqual(guard.is({ a: 1, b: [{ a: 2, b: [] }] }), true)
    })

    it('should rejects invalid inputs', () => {
      const guard = G.union(G.string, G.number)
      assert.strictEqual(guard.is(undefined), false)
    })
  })

  describe('sum', () => {
    const sum = G.sum('_tag')

    it('should accepts valid inputs', () => {
      const guard = sum({
        A: G.type({ _tag: G.literal('A'), a: G.string }),
        B: G.type({ _tag: G.literal('B'), b: G.number })
      })
      assert.deepStrictEqual(guard.is({ _tag: 'A', a: 'a' }), true)
      assert.deepStrictEqual(guard.is({ _tag: 'B', b: 1 }), true)
    })

    it('should rejects invalid inputs', () => {
      const guard = sum({
        A: G.type({ _tag: G.literal('A'), a: G.string }),
        B: G.type({ _tag: G.literal('B'), b: G.number })
      })
      assert.strictEqual(guard.is(undefined), false)
      assert.strictEqual(guard.is({}), false)
    })

    it('should support non-`string` tag values', () => {
      const guard = G.sum('_tag')({
        true: G.type({ _tag: G.literal(true), a: G.string }),
        false: G.type({ _tag: G.literal(false), b: G.number })
      })
      assert.deepStrictEqual(guard.is({ _tag: true, a: 'a' }), true)
      assert.deepStrictEqual(guard.is({ _tag: false, b: 1 }), true)
      assert.deepStrictEqual(guard.is({ _tag: false, b: 'a' }), false)
    })
  })
})
