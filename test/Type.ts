import * as assert from 'assert'
import * as t from '../src/index'
import { assertSuccess, assertFailure } from './helpers'

const BAA = new t.Type<number, string, string>(
  'BAA',
  t.number.is,
  (s, c) => {
    const n = parseFloat(s)
    return isNaN(n) ? t.failure(s, c) : t.success(n)
  },
  n => String(n)
)

const BAI = t.string.pipe(BAA, 'T')

describe('Type', () => {
  describe('pipe', () => {
    it('should assign a default name', () => {
      const AOI = t.string
      const T = AOI.pipe(BAA)
      assert.strictEqual(T.name, 'pipe(string, BAA)')
    })

    it('should combine two types', () => {
      assertSuccess(BAI.decode('1'))
      assertFailure(BAI.decode(1), ['Invalid value 1 supplied to : T'])
      assertFailure(BAI.decode('a'), ['Invalid value "a" supplied to : T'])
      assert.strictEqual(BAI.encode(2), '2')
    })

    it('should ude identity as decoder function', () => {
      assert.strictEqual(t.string.pipe(t.string as t.Type<string, string, string>).encode, t.identity)
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
    assert.deepEqual(t.getContextEntry('key', t.string), { key: 'key', type: t.string })
  })
})

describe('clean', () => {
  it('should return the same type', () => {
    const T = t.type({ a: t.string })
    assert.strictEqual(t.clean(T), T)
  })
})

describe('alias', () => {
  it('should return the same type', () => {
    const T = t.type({ a: t.string })
    assert.strictEqual(t.alias(T)(), T)
  })
})
