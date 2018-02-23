import * as t from '../src/index'
import { assertSuccess, assertFailure, assertDeepEqual, DateFromNumber } from './helpers'
import * as assert from 'assert'

export function strictInterfaceWithOptionals<R extends t.Props, O extends t.Props>(
  required: R,
  optional: O,
  name?: string
): t.Type<
  { [K in keyof R]: t.TypeOf<R[K]> } & { [K in keyof O]?: t.TypeOf<O[K]> },
  { [K in keyof R]: t.OutputOf<R[K]> } & { [K in keyof O]?: t.OutputOf<O[K]> }
> {
  const loose = t.intersection([t.interface(required), t.partial(optional)])
  const props = Object.assign({}, required, optional)
  return new t.Type(
    name || `StrictInterfaceWithOptionals(${loose.name})`,
    (m): m is t.TypeOfProps<R> & t.TypeOfPartialProps<O> =>
      loose.is(m) && Object.getOwnPropertyNames(m).every(k => props.hasOwnProperty(k)),
    (m, c) =>
      loose.validate(m, c).chain(o => {
        const errors: t.Errors = Object.getOwnPropertyNames(o)
          .map(
            key =>
              !props.hasOwnProperty(key) ? t.getValidationError(o[key], t.appendContext(c, key, t.never)) : undefined
          )
          .filter((e): e is t.ValidationError => e !== undefined)
        return errors.length ? t.failures(errors) : t.success(o)
      }),
    loose.encode
  )
}

describe('strictInterfaceWithOptionals', () => {
  it('should succeed validating a valid value', () => {
    const T = strictInterfaceWithOptionals({ foo: t.string }, { bar: t.string }, 'T')
    assertSuccess(T.decode({ foo: 'foo' }))
    assertSuccess(T.decode({ foo: 'foo', bar: 'a' }))
  })

  it('should fail validating an invalid value', () => {
    const T = strictInterfaceWithOptionals({ foo: t.string }, { bar: t.string }, 'T')
    assertFailure(T.decode({ foo: 'foo', a: 1 }), ['Invalid value 1 supplied to : T/a: never'])
    assertFailure(T.decode({ foo: 'foo', a: 1, b: 2 }), [
      'Invalid value 1 supplied to : T/a: never',
      'Invalid value 2 supplied to : T/b: never'
    ])
    assertFailure(T.decode({ foo: 'foo', bar: 1 }), [
      'Invalid value 1 supplied to : T/bar: (string | undefined)/0: string',
      'Invalid value 1 supplied to : T/bar: (string | undefined)/1: undefined'
    ])
  })

  it('should return the same reference when serializing', () => {
    const T = strictInterfaceWithOptionals({ foo: t.string }, { bar: t.string }, 'T')
    assert.strictEqual(T.encode, t.identity)
  })

  it('should return the a new reference if validation succeeded and something changed', () => {
    const T = strictInterfaceWithOptionals({ foo: DateFromNumber }, { bar: t.string }, 'T')
    assertDeepEqual(T.decode({ foo: 1 }), { foo: new Date(1) })
  })

  it('should serialize a deserialized', () => {
    const T = strictInterfaceWithOptionals({ foo: DateFromNumber }, { bar: t.string }, 'T')
    assert.deepEqual(T.encode({ foo: new Date(0) }), { foo: 0 })
  })

  it('should type guard', () => {
    const T = strictInterfaceWithOptionals({ foo: t.string }, { bar: t.string }, 'T')
    assert.strictEqual(T.is({ foo: 'foo' }), true)
    assert.strictEqual(T.is({ foo: 'foo', bar: 'a' }), true)
    assert.strictEqual(T.is({ foo: 'foo', a: 1 }), false)
  })
})
