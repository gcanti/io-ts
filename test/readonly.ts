import * as assert from 'assert'
import * as t from '../src/index'
import { assertSuccess, assertFailure } from './helpers'

describe('readonly', () => {
  it('should succeed validating a valid value', () => {
    const T = t.readonly(t.interface({ a: t.number }))
    assertSuccess(t.validate({ a: 1 }, T))
  })

  it('should fail validating an invalid value', () => {
    const T = t.readonly(t.interface({ a: t.number }))
    assertFailure(t.validate({}, T), ['Invalid value undefined supplied to : Readonly<{ a: number }>/a: number'])
  })

  it('should freeze the value', () => {
    const T = t.readonly(t.interface({ a: t.number }))
    t.validate({ a: 1 }, T).map(x => assert.ok(Object.isFrozen(x)))
  })
})
