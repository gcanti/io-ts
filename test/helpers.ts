import * as assert from 'assert'
import { isRight, isLeft } from 'fp-ts/lib/Either'
import * as t from '../src/index'
import { PathReporter } from '../src/PathReporter'

export function assertSuccess<T>(validation: t.Validation<T>): void {
  assert.ok(isRight(validation))
}

export function assertFailure<T>(validation: t.Validation<T>, descriptions: Array<string>): void {
  assert.ok(isLeft(validation))
  assert.deepEqual(PathReporter.report(validation), descriptions)
}

export function assertStrictEqual<T>(validation: t.Validation<T>, value: any): void {
  assert.strictEqual(validation.fold<any>(t.identity, t.identity), value)
}

export function assertDeepEqual<T>(validation: t.Validation<T>, value: any): void {
  assert.deepEqual(validation.fold<any>(t.identity, t.identity), value)
}

export const string2 = new t.Type<any, string>(
  'string2',
  (v): v is string => t.string.is(v) && v[1] === '-',
  (s, c) =>
    t.string.validate(s, c).chain(s => {
      if (s.length === 2) {
        return t.success(s[0] + '-' + s[1])
      } else {
        return t.failure(s, c)
      }
    }),
  a => a[0] + a[2]
)

export const DateFromNumber = new t.Type<any, Date>(
  'DateFromNumber',
  (v): v is Date => v instanceof Date,
  (s, c) =>
    t.number.validate(s, c).chain(n => {
      const d = new Date(n)
      return isNaN(d.getTime()) ? t.failure(n, c) : t.success(d)
    }),
  a => a.getTime()
)

export const NumberFromString = new t.Type<string, number>(
  'NumberFromString',
  t.number.is,
  (s, c) => {
    const n = parseFloat(s)
    return isNaN(n) ? t.failure(s, c) : t.success(n)
  },
  String
)

export const IntegerFromString = t.refinement(NumberFromString, t.Integer.is, 'IntegerFromString')

export function withDefault<T extends t.Any>(type: T, defaultValue: t.TypeOf<T>): t.Type<t.InputOf<T>, t.TypeOf<T>> {
  return new t.Type(
    `withDefault(${type.name}, ${JSON.stringify(defaultValue)})`,
    type.is,
    (v, c) => type.validate(v != null ? v : defaultValue, c),
    type.serialize
  )
}
