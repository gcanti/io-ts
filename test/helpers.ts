import * as assert from 'assert'
import { right } from 'fp-ts/lib/Either'
import * as t from '../src/index'
import { PathReporter } from '../src/PathReporter'

export function assertStrictEqual<T>(result: t.Validation<T>, expected: any): void {
  if (result.isRight()) {
    assert.deepStrictEqual(result.value, expected)
  } else {
    throw new Error(`${result} is not a right`)
  }
}

export function assertSuccess<T>(result: t.Validation<T>, expected?: T): void {
  if (result.isRight()) {
    if (expected !== undefined) {
      assert.deepStrictEqual(result.value, expected)
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

export function assertFailure(codec: t.Any, value: unknown, errors: Array<string>): void {
  const result = codec.decode(value)
  if (result.isLeft()) {
    assert.deepStrictEqual(PathReporter.report(result), errors)
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

// tslint:disable-next-line: deprecation
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
