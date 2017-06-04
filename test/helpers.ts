import * as assert from 'assert'
import { isRight, isLeft } from 'fp-ts/lib/Either'
import { Validation, Type } from '../src/index'
import * as t from '../src/index'
import { PathReporter } from '../src/reporters/default'

export function identity<A>(a: A): A {
  return a
}

export function assertSuccess<T>(validation: Validation<T>): void {
  assert.ok(isRight(validation))
}

export function assertFailure<T>(validation: Validation<T>, descriptions: Array<string>): void {
  assert.ok(isLeft(validation))
  assert.deepEqual(PathReporter.report(validation), descriptions)
}

export function assertStrictEqual<T>(validation: Validation<T>, value: any): void {
  assert.strictEqual(validation.fold<any>(identity, identity), value)
}

export function assertDeepEqual<T>(validation: Validation<T>, value: any): void {
  assert.deepEqual(validation.fold<any>(identity, identity), value)
}

export const number2 = new Type<number>('number2', (v, c) => t.number.validate(v, c).map(n => n * 2))
