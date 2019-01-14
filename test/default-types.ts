import * as assert from 'assert'
import * as t from '../src/index'
import { assertSuccess, assertFailure } from './helpers'

describe('Dictionary', () => {
  it('should succeed validating a valid value', () => {
    const T = t.Dictionary
    assertSuccess(T.decode({}))
    assertSuccess(T.decode([]))
    assertSuccess(T.decode([1]))
    assertSuccess(T.decode(new Number()))
    assertSuccess(T.decode(new Date()))
  })

  it('should fail validating an invalid value', () => {
    const T = t.Dictionary
    assertFailure(T.decode('s'), ['Invalid value "s" supplied to : Dictionary'])
    assertFailure(T.decode(1), ['Invalid value 1 supplied to : Dictionary'])
    assertFailure(T.decode(true), ['Invalid value true supplied to : Dictionary'])
    assertFailure(T.decode(null), ['Invalid value null supplied to : Dictionary'])
    assertFailure(T.decode(undefined), ['Invalid value undefined supplied to : Dictionary'])
  })
})

describe('Array', () => {
  it('should succeed decoding a valid value', () => {
    const T = t.Array
    assertSuccess(T.decode([]))
    assertSuccess(T.decode([1]))
  })

  it('should fail decoding an invalid value', () => {
    const T = t.Array
    assertFailure(T.decode('s'), ['Invalid value "s" supplied to : Array'])
    assertFailure(T.decode(1), ['Invalid value 1 supplied to : Array'])
    assertFailure(T.decode(true), ['Invalid value true supplied to : Array'])
    assertFailure(T.decode(null), ['Invalid value null supplied to : Array'])
    assertFailure(T.decode(undefined), ['Invalid value undefined supplied to : Array'])
  })
})

describe('null', () => {
  it('should succeed decoding a valid value', () => {
    assertSuccess(t.null.decode(null))
  })
  it('should fail decoding an invalid value', () => {
    assertFailure(t.null.decode(1), ['Invalid value 1 supplied to : null'])
  })
})

describe('undefined', () => {
  it('should succeed decoding a valid value', () => {
    assertSuccess(t.undefined.decode(undefined))
  })
  it('should fail decoding an invalid value', () => {
    assertFailure(t.undefined.decode(1), ['Invalid value 1 supplied to : undefined'])
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
    assertSuccess(t.boolean.decode(true))
    assertSuccess(t.boolean.decode(false))
  })

  it('should not decode non-boolean values', () => {
    assertFailure(t.boolean.decode(1), ['Invalid value 1 supplied to : boolean'])
  })
})

describe('Integer', () => {
  it('should validate integers', () => {
    assertSuccess(t.Integer.decode(1))
    assertFailure(t.Integer.decode(0.5), ['Invalid value 0.5 supplied to : Integer'])
    assertFailure(t.Integer.decode('foo'), ['Invalid value "foo" supplied to : Integer'])
  })
})

describe('void', () => {
  it('should support the alias `voidType`', () => {
    assertSuccess(t.voidType.decode(undefined))
    assertFailure(t.voidType.decode(1), ['Invalid value 1 supplied to : void'])
  })
})

describe('object', () => {
  it('should decode arrays', () => {
    assertSuccess(t.object.decode([]))
  })

  it('should decode objects', () => {
    assertSuccess(t.object.decode({}))
  })

  it('should fail with primitives', () => {
    const T = t.object
    assertFailure(T.decode('s'), ['Invalid value "s" supplied to : object'])
    assertFailure(T.decode(1), ['Invalid value 1 supplied to : object'])
    assertFailure(T.decode(true), ['Invalid value true supplied to : object'])
  })

  it('should fail with null and undefined', () => {
    const T = t.object
    assertFailure(T.decode(null), ['Invalid value null supplied to : object'])
    assertFailure(T.decode(undefined), ['Invalid value undefined supplied to : object'])
  })
})

describe('Function', () => {
  it('should decode functions', () => {
    assertSuccess(t.Function.decode(t.identity))
  })

  it('should not decode non-functions', () => {
    assertFailure(t.Function.decode(1), ['Invalid value 1 supplied to : Function'])
  })
})

describe('any', () => {
  it('should decode any value', () => {
    assertSuccess(t.any.decode(null))
    assertSuccess(t.any.decode(undefined))
    assertSuccess(t.any.decode('foo'))
    assertSuccess(t.any.decode(1))
    assertSuccess(t.any.decode(true))
    assertSuccess(t.any.decode(t.identity))
    assertSuccess(t.any.decode({}))
    assertSuccess(t.any.decode([]))
    assertSuccess(t.any.decode(/a/))
  })

  it('should accept any value', () => {
    assert.ok(t.any.is(null))
    assert.ok(t.any.is(undefined))
    assert.ok(t.any.is('foo'))
    assert.ok(t.any.is(1))
    assert.ok(t.any.is(true))
    assert.ok(t.any.is(t.identity))
    assert.ok(t.any.is({}))
    assert.ok(t.any.is([]))
    assert.ok(t.any.is(/a/))
  })
})

describe('never', () => {
  it('should not decode any value', () => {
    assertFailure(t.never.decode(null), ['Invalid value null supplied to : never'])
    assertFailure(t.never.decode(undefined), ['Invalid value undefined supplied to : never'])
    assertFailure(t.never.decode('foo'), ['Invalid value "foo" supplied to : never'])
    assertFailure(t.never.decode(1), ['Invalid value 1 supplied to : never'])
    assertFailure(t.never.decode(true), ['Invalid value true supplied to : never'])
    assertFailure(t.never.decode(t.identity), ['Invalid value <function1> supplied to : never'])
    assertFailure(t.never.decode({}), ['Invalid value {} supplied to : never'])
    assertFailure(t.never.decode([]), ['Invalid value [] supplied to : never'])
    assertFailure(t.never.decode(/a/), ['Invalid value {} supplied to : never'])
  })

  it('should not accept any value', () => {
    assert.ok(!t.never.is(null))
    assert.ok(!t.never.is(undefined))
    assert.ok(!t.never.is('foo'))
    assert.ok(!t.never.is(1))
    assert.ok(!t.never.is(true))
    assert.ok(!t.never.is(t.identity))
    assert.ok(!t.never.is({}))
    assert.ok(!t.never.is([]))
    assert.ok(!t.never.is(/a/))
  })
})
