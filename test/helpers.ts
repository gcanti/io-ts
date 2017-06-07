import * as assert from 'assert'
import { isRight, isLeft } from 'fp-ts/lib/Either'
import * as t from '../src/index'
import { PathReporter } from '../src/PathReporter'

export function identity<A>(a: A): A {
  return a
}

export function assertSuccess<T>(validation: t.Validation<T>): void {
  assert.ok(isRight(validation))
}

export function assertFailure<T>(validation: t.Validation<T>, descriptions: Array<string>): void {
  assert.ok(isLeft(validation))
  assert.deepEqual(PathReporter.report(validation), descriptions)
}

export function assertStrictEqual<T>(validation: t.Validation<T>, value: any): void {
  assert.strictEqual(validation.fold<any>(identity, identity), value)
}

export function assertDeepEqual<T>(validation: t.Validation<T>, value: any): void {
  assert.deepEqual(validation.fold<any>(identity, identity), value)
}

export const number2 = t.mapWithName(n => n * 2, t.number, 'number2')
