import * as assert from 'assert'
import { either, fold, right } from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'

import * as t from '../../src/index'
import { PathReporter } from '../../src/PathReporter'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function assertStrictEqual<T>(result: t.Validation<T>, expected: any): void {
  pipe(
    result,
    fold(
      /* istanbul ignore next */
      () => {
        throw new Error(`${result} is not a right`)
      },
      (a) => {
        assert.deepStrictEqual(a, expected)
      }
    )
  )
}

export function assertSuccess<T>(result: t.Validation<T>, expected?: T): void {
  pipe(
    result,
    fold(
      /* istanbul ignore next */
      () => {
        throw new Error(`${result} is not a right`)
      },
      (a) => {
        if (expected !== undefined) {
          assert.deepStrictEqual(a, expected)
        }
      }
    )
  )
}

export function assertStrictSuccess<T>(result: t.Validation<T>, expected: T): void {
  pipe(
    result,
    fold(
      /* istanbul ignore next */
      () => {
        throw new Error(`${result} is not a right`)
      },
      (a) => {
        /* istanbul ignore next */
        if (expected !== undefined) {
          assert.strictEqual(a, expected)
        }
      }
    )
  )
}

export function assertFailure(codec: t.Any, value: unknown, errors: Array<string>): void {
  const result = codec.decode(value)
  pipe(
    result,
    fold(
      () => {
        assert.deepStrictEqual(PathReporter.report(result), errors)
      },
      /* istanbul ignore next */
      () => {
        throw new Error(`${result} is not a left`)
      }
    )
  )
}

export const NumberFromString = new t.Type<number, string, unknown>(
  'NumberFromString',
  t.number.is,
  (u, c) =>
    either.chain(t.string.validate(u, c), (s) => {
      const n = +s
      return isNaN(n) ? t.failure(u, c, 'cannot parse to a number') : t.success(n)
    }),
  String
)

export const HyphenatedString = t.refinement(
  t.string,
  (v): v is `${string}-${string}` => v.length === 3 && v[1] === '-',
  '`${string}-${string}`'
)

export const HyphenatedStringFromNonHyphenated = new t.Type<`${string}-${string}`, string, unknown>(
  'HyphenatedStringFromNonHyphenated',
  HyphenatedString.is,
  (u, c) =>
    either.chain(t.string.validate(u, c), (s) => {
      if (s.length === 2) {
        return right(`${s[0]}-${s[1]}` as const)
      } else {
        return t.failure(s, c)
      }
    }),
  (a) => a[0] + a[2]
)

export const IntegerFromString = t.refinement(NumberFromString, t.Integer.is, 'IntegerFromString')

export function withDefault<T extends t.Mixed>(
  type: T,
  defaultValue: t.TypeOf<T>
): t.Type<t.TypeOf<T>, t.TypeOf<T>, unknown> {
  return new t.Type(
    `withDefault(${type.name}, ${JSON.stringify(defaultValue)})`,
    type.is,
    (v) => type.decode(v != null ? v : defaultValue),
    type.encode
  )
}

export function asOptional<T extends t.Mixed>(type: T): t.OptionalTypedProp<t.TypeOf<T>> {
  return {
    type,
    optional: true
  }
}
