import * as t from '../src/index'
import { assertSuccess, assertFailure, NumberFromString } from './helpers'
import * as assert from 'assert'

export function strictInterfaceWithOptionals<R extends t.Props, O extends t.Props>(
  required: R,
  optional: O,
  name?: string
): t.Type<t.TypeOfProps<R> & t.TypeOfPartialProps<O>, t.OutputOfProps<R> & t.OutputOfPartialProps<O>> {
  return t.exact(t.intersection([t.type(required), t.partial(optional)]), name)
}

describe('strictInterfaceWithOptionals', () => {
  it('should succeed validating a valid value', () => {
    const T = strictInterfaceWithOptionals({ foo: t.string }, { bar: t.string }, 'T')
    assertSuccess(T.decode({ foo: 'foo' }))
    assertSuccess(T.decode({ foo: 'foo', bar: 'a' }))
  })

  it('should fail validating an invalid value', () => {
    const T = strictInterfaceWithOptionals({ foo: t.string }, { bar: t.string }, 'T')
    assertFailure(T, { foo: 'foo', bar: 1 }, [
      'Invalid value 1 supplied to : T/1: Partial<{ bar: string }>/bar: string'
    ])
  })

  it('should strip additional properties', () => {
    const T = strictInterfaceWithOptionals({ foo: t.string }, { bar: t.string }, 'T')
    assertSuccess(T.decode({ foo: 'foo', a: 1 }), { foo: 'foo' })
  })

  it('should return the same reference when serializing', () => {
    const T = strictInterfaceWithOptionals({ foo: t.string }, { bar: t.string }, 'T')
    const x = { foo: 'foo' }
    assert.strictEqual(T.encode(x), x)
  })

  it('should return the a new reference if validation succeeded and something changed', () => {
    const T = strictInterfaceWithOptionals({ foo: NumberFromString }, { bar: t.string }, 'T')
    assertSuccess(T.decode({ foo: '1' }), { foo: 1 })
  })

  it('should serialize a deserialized', () => {
    const T = strictInterfaceWithOptionals({ foo: NumberFromString }, { bar: t.string }, 'T')
    assert.deepStrictEqual(T.encode({ foo: 1 }), { foo: '1' })
  })

  it('should type guard', () => {
    const T = strictInterfaceWithOptionals({ foo: t.string }, { bar: t.string }, 'T')
    assert.strictEqual(T.is({ foo: 'foo' }), true)
    assert.strictEqual(T.is({ foo: 'foo', bar: 'a' }), true)
    assert.strictEqual(T.is({ foo: 'foo', a: 1 }), true)
    assert.strictEqual(T.is({ foo: 'foo', bar: 1 }), false)
  })
})
