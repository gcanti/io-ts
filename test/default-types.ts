import * as t from '../src/index'
import { assertSuccess, assertFailure } from './helpers'

describe('Dictionary', () => {
  it('should accept arrays', () => {
    assertSuccess(t.validate([], t.Dictionary))
  })

  it('should accept objects', () => {
    assertSuccess(t.validate({}, t.Dictionary))
  })

  it('should fail with primitives', () => {
    const T = t.Dictionary
    assertFailure(t.validate('s', T), ['Invalid value "s" supplied to : Dictionary'])
    assertFailure(t.validate(1, T), ['Invalid value 1 supplied to : Dictionary'])
    assertFailure(t.validate(true, T), ['Invalid value true supplied to : Dictionary'])
  })

  it('should fail with null and undefined', () => {
    const T = t.Dictionary
    assertFailure(t.validate(null, T), ['Invalid value null supplied to : Dictionary'])
    assertFailure(t.validate(undefined, T), ['Invalid value undefined supplied to : Dictionary'])
  })
})

describe('Integer', () => {
  it('should validate integers', () => {
    assertSuccess(t.validate(1, t.Integer))
    assertFailure(t.validate(0.5, t.Integer), ['Invalid value 0.5 supplied to : Integer'])
    assertFailure(t.validate('foo', t.Integer), ['Invalid value "foo" supplied to : Integer'])
  })
})

describe('null', () => {
  it('should support the alias `nullType`', () => {
    assertSuccess(t.validate(null, t.null))
    assertFailure(t.validate(1, t.null), ['Invalid value 1 supplied to : null'])
  })
})

describe('object', () => {
  it('should accept arrays', () => {
    assertSuccess(t.validate([], t.object))
  })

  it('should accept objects', () => {
    assertSuccess(t.validate({}, t.object))
  })

  it('should fail with primitives', () => {
    const T = t.object
    assertFailure(t.validate('s', T), ['Invalid value "s" supplied to : object'])
    assertFailure(t.validate(1, T), ['Invalid value 1 supplied to : object'])
    assertFailure(t.validate(true, T), ['Invalid value true supplied to : object'])
  })

  it('should fail with null and undefined', () => {
    const T = t.object
    assertFailure(t.validate(null, T), ['Invalid value null supplied to : object'])
    assertFailure(t.validate(undefined, T), ['Invalid value undefined supplied to : object'])
  })
})

describe('Function', () => {
  it('should accept functions', () => {
    assertSuccess(t.validate(t.identity, t.Function))
  })
})
