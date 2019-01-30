import * as assert from 'assert'
import { right } from 'fp-ts/lib/Either'
import * as t from '../src/index'
import { PathReporter } from '../src/PathReporter'

export function assertStrictEqual<T>(validation: t.Validation<T>, value: any): void {
  assert.strictEqual(validation.fold<any>(t.identity, t.identity), value)
}

export function assertDeepEqual<T>(validation: t.Validation<T>, value: any): void {
  assert.deepEqual(validation.fold<any>(t.identity, t.identity), value)
}

export function assertSuccess<T>(result: t.Validation<T>, expected?: T): void {
  if (result.isRight()) {
    if (expected !== undefined) {
      assert.deepEqual(result.value, expected)
    }
  } else {
    throw new Error(`${result} is not a right`)
  }
}

export function assertStrictSuccess<T>(result: t.Validation<T>, expected: T): void {
  if (result.isRight()) {
    if (expected !== undefined) {
      assert.strictEqual(result.value, expected)
    }
  } else {
    throw new Error(`${result} is not a right`)
  }
}

export function assertFailure<T>(result: t.Validation<T>, errors: Array<string>): void {
  if (result.isLeft()) {
    assert.deepEqual(PathReporter.report(result), errors)
  } else {
    throw new Error(`${result} is not a left`)
  }
}

export const NumberFromString = new t.Type<number, string, unknown>(
  'NumberFromString',
  t.number.is,
  (u, c) =>
    t.string.validate(u, c).chain(s => {
      const n = +s
      return isNaN(n) ? t.failure(u, c, 'cannot parse to a number') : t.success(n)
    }),
  String
)

export const HyphenatedString = new t.Type<string, string, unknown>(
  'HyphenatedString',
  (v): v is string => t.string.is(v) && v.length === 3 && v[1] === '-',
  (u, c) => {
    const stringResult = t.string.validate(u, c)
    if (stringResult.isLeft()) {
      return stringResult
    } else {
      const s = stringResult.value
      if (s.length === 2) {
        return right(s[0] + '-' + s[1])
      } else {
        return t.failure(s, c)
      }
    }
  },
  a => a[0] + a[2]
)

export const IntegerFromString = t.refinement(NumberFromString, t.Integer.is, 'IntegerFromString')

export function withDefault<T extends t.Mixed>(
  type: T,
  defaultValue: t.TypeOf<T>
): t.Type<t.TypeOf<T>, t.TypeOf<T>, unknown> {
  return new t.Type(
    `withDefault(${type.name}, ${JSON.stringify(defaultValue)})`,
    type.is,
    v => type.decode(v != null ? v : defaultValue),
    type.encode
  )
}

/*

  `strip` combinator, useful to test the new internal `intersection` algorithm

*/

interface StripC<P extends t.Props>
  extends t.InterfaceType<P, { [K in keyof P]: t.TypeOf<P[K]> }, { [K in keyof P]: t.OutputOf<P[K]> }, unknown> {}

const getNameFromProps = (props: t.Props): string =>
  `{ ${Object.keys(props)
    .map(k => `${k}: ${props[k].name}`)
    .join(', ')} }`

const pushAll = <A>(xs: Array<A>, ys: Array<A>): void => {
  const l = ys.length
  for (let i = 0; i < l; i++) {
    xs.push(ys[i])
  }
}

export const strip = <P extends t.Props>(props: P, name: string = getNameFromProps(props)): StripC<P> => {
  const keys = Object.keys(props)
  const types = keys.map(key => props[key])
  const len = keys.length
  return new t.InterfaceType(
    name,
    (u): u is { [K in keyof P]: t.TypeOf<P[K]> } => {
      if (!t.UnknownRecord.is(u)) {
        return false
      }
      for (let i = 0; i < len; i++) {
        const k = keys[i]
        if (!t.hasOwnProperty.call(u, k) || !types[i].is(u[k])) {
          return false
        }
      }
      return true
    },
    (u, c) => {
      const dictionaryValidation = t.UnknownRecord.validate(u, c)
      if (dictionaryValidation.isLeft()) {
        return dictionaryValidation
      } else {
        const o = dictionaryValidation.value
        let a: any = {}
        const errors: t.Errors = []
        for (let i = 0; i < len; i++) {
          const k = keys[i]
          const type = types[i]
          const result = type.validate(o[k], t.appendContext(c, k, type))
          if (result.isLeft()) {
            pushAll(errors, result.value)
          } else {
            a[k] = result.value
          }
        }
        return errors.length ? t.failures(errors) : t.success(a)
      }
    },
    a => {
      const s: any = {}
      for (let i = 0; i < len; i++) {
        const k = keys[i]
        s[k] = types[i].encode(a[k])
      }
      return s
    },
    props
  )
}
