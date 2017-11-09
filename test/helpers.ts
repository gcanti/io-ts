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

export const number2 = new t.Type<any, number>(
  'number2',
  t.number.is,
  (v, c) => t.number.validate(v, c).map(n => n * 2),
  t.identity
)

export const DateFromNumber = new t.Type<any, Date>(
  'DateFromNumber',
  (v): v is Date => v instanceof Date,
  (v, c) =>
    t.number.validate(v, c).chain(n => {
      const d = new Date(n)
      return isNaN(d.getTime()) ? t.failure(n, c) : t.success(d)
    }),
  v => v.getTime()
)
