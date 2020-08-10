import * as assert from 'assert'
import { Either, fold, right } from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import * as t from '../../src/index'
import { assertFailure, assertSuccess } from './helpers'

const BAA = new t.Type<number, string, string>(
  'BAA',
  t.number.is,
  (s, c) => {
    const n = parseFloat(s)
    return isNaN(n) ? t.failure(s, c) : t.success(n)
  },
  (n) => String(n)
)

const BAI = t.string.pipe(BAA, 'T')

describe('Type', () => {
  it('should auto bind decode', () => {
    function clone<C extends t.Any>(t: C): C {
      const r = Object.create(Object.getPrototypeOf(t))
      ;(Object as any).assign(r, t)
      return r
    }

    const T = t.string
    const decode = <L, A>(f: (u: unknown) => Either<L, A>, u: unknown): boolean =>
      pipe(
        f(u),
        fold(
          () => false,
          () => true
        )
      )
    assert.strictEqual(decode(T.decode, 'a'), true)
    assert.strictEqual(decode(clone(T).decode, 'a'), true)
    type A = {
      a: A | null
    }
    const A: t.Type<A> = t.recursion('A', () =>
      t.type({
        a: t.union([A, t.null])
      })
    )
    assert.strictEqual(decode(clone(A).decode, { a: { a: null } }), true)
  })

  describe('pipe', () => {
    it('should assign a default name', () => {
      const AOI = t.string
      const T = AOI.pipe(BAA)
      assert.strictEqual(T.name, 'pipe(string, BAA)')
    })

    it('should combine two types', () => {
      assertSuccess(BAI.decode('1'))
      assertFailure(BAI, 1, ['Invalid value 1 supplied to : T'])
      assertFailure(BAI, 'a', ['Invalid value "a" supplied to : T'])
      assert.strictEqual(BAI.encode(2), '2')
    })

    it('should ude identity as decoder function', () => {
      assert.strictEqual(t.string.pipe(t.string as t.Type<string, string, string>).encode, t.identity)
    })

    it('accept to pipe a type with a wider input', () => {
      const T = t.string.pipe(t.string)
      assert.deepStrictEqual(T.decode('a'), right('a'))
      assert.strictEqual(T.encode('a'), 'a')
    })

    it('accept to pipe a type with a narrower output', () => {
      const T = t.string.pipe(t.literal('foo'))
      assert.deepStrictEqual(T.decode('foo'), right('foo'))
      assert.strictEqual(T.encode('foo'), 'foo')
    })
  })

  describe('asDecoder', () => {
    it('should return a decoder', () => {
      assertSuccess(t.string.asDecoder().decode('1'))
    })
  })

  describe('asEncoder', () => {
    it('should return an encoder', () => {
      assert.strictEqual(BAI.asEncoder().encode(2), '2')
    })
  })
})

describe('getContextEntry', () => {
  it('should return a ContextEntry', () => {
    assert.deepStrictEqual(t.getContextEntry('key', t.string), {
      key: 'key',
      type: t.string
    })
  })
})

describe('clean', () => {
  it('should return the same type', () => {
    const T = t.type({ a: t.string })
    // tslint:disable-next-line: deprecation
    assert.strictEqual(t.clean(T), T)
  })
})

describe('alias', () => {
  it('should return the same type', () => {
    const T = t.type({ a: t.string })
    assert.strictEqual(t.alias(T)(), T)
  })
})
