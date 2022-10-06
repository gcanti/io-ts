import * as assert from 'assert'
import * as t from '../../src/index'
import { assertSuccess, assertFailure } from './helpers'

describe('UnknownRecord', () => {
  describe('is', () => {
    it('should return `true` for valid objects', () => {
      const T = t.UnknownRecord
      assert.strictEqual(T.is({}), true)
      assert.strictEqual(T.is({ a: 1 }), true)
      assert.strictEqual(T.is(new Number()), true)
    })

    it('should return `false` for invalid objects', () => {
      const T = t.UnknownRecord
      assert.strictEqual(T.is(undefined), false)
      // #407
      assert.strictEqual(T.is([]), false)
    })
  })

  describe('decode', () => {
    it('should succeed validating a valid value', () => {
      const T = t.UnknownRecord
      assertSuccess(T.decode({}))
      assertSuccess(T.decode({ a: 1 }))
      assertSuccess(T.decode(new Number()))
    })

    it('should fail validating an invalid value', () => {
      const T = t.UnknownRecord
      assertFailure(T, 's', ['Invalid value "s" supplied to : UnknownRecord'])
      assertFailure(T, 1, ['Invalid value 1 supplied to : UnknownRecord'])
      assertFailure(T, true, ['Invalid value true supplied to : UnknownRecord'])
      assertFailure(T, null, ['Invalid value null supplied to : UnknownRecord'])
      assertFailure(T, undefined, ['Invalid value undefined supplied to : UnknownRecord'])
      // #407
      assertFailure(T, [], ['Invalid value [] supplied to : UnknownRecord'])
    })
  })
})

describe('UnknownArray', () => {
  it('should succeed decoding a valid value', () => {
    const T = t.UnknownArray
    assertSuccess(T.decode([]))
    assertSuccess(T.decode([1]))
  })

  it('should fail decoding an invalid value', () => {
    const T = t.UnknownArray
    assertFailure(T, 's', ['Invalid value "s" supplied to : UnknownArray'])
    assertFailure(T, 1, ['Invalid value 1 supplied to : UnknownArray'])
    assertFailure(T, true, ['Invalid value true supplied to : UnknownArray'])
    assertFailure(T, null, ['Invalid value null supplied to : UnknownArray'])
    assertFailure(T, undefined, ['Invalid value undefined supplied to : UnknownArray'])
  })
})

describe('null', () => {
  it('should succeed decoding a valid value', () => {
    assertSuccess(t.null.decode(null))
  })
  it('should fail decoding an invalid value', () => {
    const T = t.null
    assertFailure(T, 1, ['Invalid value 1 supplied to : null'])
  })
})

describe('undefined', () => {
  it('should succeed decoding a valid value', () => {
    assertSuccess(t.undefined.decode(undefined))
  })
  it('should fail decoding an invalid value', () => {
    const T = t.undefined
    assertFailure(T, 1, ['Invalid value 1 supplied to : undefined'])
  })
})

describe('unknown', () => {
  it('should decode any value', () => {
    assertSuccess(t.unknown.decode(null))
    assertSuccess(t.unknown.decode(undefined))
    assertSuccess(t.unknown.decode('foo'))
    assertSuccess(t.unknown.decode(1))
    assertSuccess(t.unknown.decode(true))
    assertSuccess(t.unknown.decode({}))
    assertSuccess(t.unknown.decode([]))
    assertSuccess(t.unknown.decode(/a/))
  })

  it('should accept any value', () => {
    assert.ok(t.unknown.is(null))
    assert.ok(t.unknown.is(undefined))
    assert.ok(t.unknown.is('foo'))
    assert.ok(t.unknown.is(1))
    assert.ok(t.unknown.is(true))
    assert.ok(t.unknown.is({}))
    assert.ok(t.unknown.is([]))
    assert.ok(t.unknown.is(/a/))
  })
})

describe('boolean', () => {
  it('should decode boolean values', () => {
    const T = t.boolean
    assertSuccess(T.decode(true))
    assertSuccess(T.decode(false))
  })

  it('should not decode non-boolean values', () => {
    const T = t.boolean
    assertFailure(T, 1, ['Invalid value 1 supplied to : boolean'])
  })
})

describe('bigint', () => {
  const T = t.bigint
  it('should decode bigint values', () => {
    assertSuccess(T.decode(BigInt(0)))
    assertSuccess(T.decode(BigInt(15)))
    const decodedBigNumber = T.decode(BigInt(Number.MAX_SAFE_INTEGER) + BigInt(4))
    assertSuccess(decodedBigNumber)
    if (decodedBigNumber._tag === 'Right') {
      assert.equal(decodedBigNumber.right.toString(), '9007199254740995')
    }
  })

  it('should not decode non-bigint values', () => {
    assertFailure(T, true, ['Invalid value true supplied to : bigint'])
    assertFailure(T, 'test', ['Invalid value "test" supplied to : bigint'])
    assertFailure(T, 123, ['Invalid value 123 supplied to : bigint'])
    assertFailure(T, {}, ['Invalid value {} supplied to : bigint'])
    assertFailure(T, [], ['Invalid value [] supplied to : bigint'])
    assertFailure(T, null, ['Invalid value null supplied to : bigint'])
    assertFailure(T, undefined, ['Invalid value undefined supplied to : bigint'])
  })
})

describe('Integer', () => {
  it('should validate integers', () => {
    // tslint:disable-next-line: deprecation
    const T = t.Integer
    assertSuccess(T.decode(1))
    assertFailure(T, 0.5, ['Invalid value 0.5 supplied to : Integer'])
    assertFailure(T, 'foo', ['Invalid value "foo" supplied to : Integer'])
    assertFailure(T, Infinity, ['Invalid value Infinity supplied to : Integer'])
    assertFailure(T, -Infinity, ['Invalid value -Infinity supplied to : Integer'])
  })
})

describe('void', () => {
  it('should support the alias `voidType`', () => {
    const T = t.void
    assertSuccess(t.voidType.decode(undefined))
    assertFailure(T, 1, ['Invalid value 1 supplied to : void'])
  })
})

describe('object', () => {
  it('should decode arrays', () => {
    // tslint:disable-next-line: deprecation
    assertSuccess(t.object.decode([]))
  })

  it('should decode objects', () => {
    // tslint:disable-next-line: deprecation
    assertSuccess(t.object.decode({}))
  })

  it('should fail with primitives', () => {
    // tslint:disable-next-line: deprecation
    const T = t.object
    assertFailure(T, 's', ['Invalid value "s" supplied to : object'])
    assertFailure(T, 1, ['Invalid value 1 supplied to : object'])
    assertFailure(T, true, ['Invalid value true supplied to : object'])
  })

  it('should fail with null and undefined', () => {
    // tslint:disable-next-line: deprecation
    const T = t.object
    assertFailure(T, null, ['Invalid value null supplied to : object'])
    assertFailure(T, undefined, ['Invalid value undefined supplied to : object'])
  })
})

describe('Function', () => {
  it('should decode functions', () => {
    // tslint:disable-next-line: deprecation
    assertSuccess(t.Function.decode(t.identity))
  })

  it('should not decode non-functions', () => {
    // tslint:disable-next-line: deprecation
    const T = t.Function
    assertFailure(T, 1, ['Invalid value 1 supplied to : Function'])
  })
})

describe('any', () => {
  it('should decode any value', () => {
    // tslint:disable-next-line: deprecation
    assertSuccess(t.any.decode(null))
    // tslint:disable-next-line: deprecation
    assertSuccess(t.any.decode(undefined))
    // tslint:disable-next-line: deprecation
    assertSuccess(t.any.decode('foo'))
    // tslint:disable-next-line: deprecation
    assertSuccess(t.any.decode(1))
    // tslint:disable-next-line: deprecation
    assertSuccess(t.any.decode(true))
    // tslint:disable-next-line: deprecation
    assertSuccess(t.any.decode(t.identity))
    // tslint:disable-next-line: deprecation
    assertSuccess(t.any.decode({}))
    // tslint:disable-next-line: deprecation
    assertSuccess(t.any.decode([]))
    // tslint:disable-next-line: deprecation
    assertSuccess(t.any.decode(/a/))
  })

  it('should accept any value', () => {
    // tslint:disable-next-line: deprecation
    assert.ok(t.any.is(null))
    // tslint:disable-next-line: deprecation
    assert.ok(t.any.is(undefined))
    // tslint:disable-next-line: deprecation
    assert.ok(t.any.is('foo'))
    // tslint:disable-next-line: deprecation
    assert.ok(t.any.is(1))
    // tslint:disable-next-line: deprecation
    assert.ok(t.any.is(true))
    // tslint:disable-next-line: deprecation
    assert.ok(t.any.is(t.identity))
    // tslint:disable-next-line: deprecation
    assert.ok(t.any.is({}))
    // tslint:disable-next-line: deprecation
    assert.ok(t.any.is([]))
    // tslint:disable-next-line: deprecation
    assert.ok(t.any.is(/a/))
  })
})

describe('never', () => {
  it('should not decode any value', () => {
    // tslint:disable-next-line: deprecation
    const T = (t.never as any) as t.Any
    assertFailure(T, null, ['Invalid value null supplied to : never'])
    assertFailure(T, undefined, ['Invalid value undefined supplied to : never'])
    assertFailure(T, 'foo', ['Invalid value "foo" supplied to : never'])
    assertFailure(T, 1, ['Invalid value 1 supplied to : never'])
    assertFailure(T, true, ['Invalid value true supplied to : never'])
    assertFailure(T, t.identity, ['Invalid value identity supplied to : never'])
    assertFailure(T, {}, ['Invalid value {} supplied to : never'])
    assertFailure(T, [], ['Invalid value [] supplied to : never'])
    assertFailure(T, /a/, ['Invalid value {} supplied to : never'])
  })

  it('should not accept any value', () => {
    // tslint:disable-next-line: deprecation
    assert.ok(!t.never.is(null))
    // tslint:disable-next-line: deprecation
    assert.ok(!t.never.is(undefined))
    // tslint:disable-next-line: deprecation
    assert.ok(!t.never.is('foo'))
    // tslint:disable-next-line: deprecation
    assert.ok(!t.never.is(1))
    // tslint:disable-next-line: deprecation
    assert.ok(!t.never.is(true))
    // tslint:disable-next-line: deprecation
    assert.ok(!t.never.is(t.identity))
    // tslint:disable-next-line: deprecation
    assert.ok(!t.never.is({}))
    // tslint:disable-next-line: deprecation
    assert.ok(!t.never.is([]))
    // tslint:disable-next-line: deprecation
    assert.ok(!t.never.is(/a/))
  })
})
