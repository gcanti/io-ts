import * as assert from 'assert'
import * as G from '../src/Guard'

describe('Guard', () => {
  describe('refinement', () => {
    it('should accepts valid inputs', () => {
      const guard = G.refinement(G.string, (s): s is string => s.length > 0)
      assert.strictEqual(guard.is('a'), true)
    })

    it('should rejects invalid inputs', () => {
      const guard = G.refinement(G.string, (s): s is string => s.length > 0)
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
      const undef: G.Guard<undefined> = {
        is: (u): u is undefined => u === undefined
      }
      const guard = G.type({ a: undef })
      assert.strictEqual(guard.is({}), false)
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

  describe('intersection', () => {
    it('should accepts valid inputs', () => {
      const guard = G.intersection(G.type({ a: G.string }), G.type({ b: G.number }))
      assert.strictEqual(guard.is({ a: 'a', b: 1 }), true)
    })

    it('should rejects invalid inputs', () => {
      const guard = G.intersection(G.type({ a: G.string }), G.type({ b: G.number }))
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

    it('should handle zero members', () => {
      assert.deepStrictEqual(G.union().is(null), false)
      assert.deepStrictEqual(G.union().is({}), false)
    })
  })

  describe('lazy', () => {
    interface A {
      a: number
      b: Array<A>
    }

    const guard: G.Guard<A> = G.guard.lazy('A', () =>
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

    it('should handle zero members', () => {
      assert.deepStrictEqual(sum({}).is(null), false)
      assert.deepStrictEqual(sum({}).is({}), false)
    })
  })
})
