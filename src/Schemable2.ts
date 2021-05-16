import { HKT, Kind, URIS } from 'fp-ts/lib/HKT'
import * as D from './poc'
import * as G from './Guard'
import * as E from './Eq'
import { Eq } from 'fp-ts/lib/Eq'

export function memoize<A, B>(f: (a: A) => B): (a: A) => B {
  const cache = new Map()
  return (a) => {
    if (!cache.has(a)) {
      const b = f(a)
      cache.set(a, b)
      return b
    }
    return cache.get(a)
  }
}

// -------------------------------------------------------------------------------------
// use case: Schemable
// -------------------------------------------------------------------------------------

export interface Schemable<S> {
  readonly URI: S
  readonly string: HKT<S, D.stringUD>
  readonly number: HKT<S, D.numberUD>
  readonly nullable: <A extends D.AnyD>(or: HKT<S, A>) => HKT<S, D.NullableD<A>>
  readonly tuple: <A extends ReadonlyArray<D.AnyUD>>(
    ...components: { [K in keyof A]: HKT<S, A[K]> }
  ) => HKT<S, D.TupleD<A>>
}

export interface Schemable1<S extends URIS> {
  readonly URI: S
  readonly string: Kind<S, D.stringUD>
  readonly number: Kind<S, D.numberUD>
  readonly nullable: <A extends D.AnyD>(or: Kind<S, A>) => Kind<S, D.NullableD<A>>
  readonly tuple: <A extends ReadonlyArray<D.AnyUD>>(
    ...components: { [K in keyof A]: Kind<S, A[K]> }
  ) => Kind<S, D.TupleD<A>>
}

export interface Schema<A> {
  <S>(S: Schemable<S>): HKT<S, A>
}

export function make<A>(schema: Schema<A>): Schema<A> {
  return memoize(schema)
}

export function compile<S extends URIS>(S: Schemable1<S>): <A>(schema: Schema<A>) => Kind<S, A>
export function compile<S>(S: Schemable<S>): <A>(schema: Schema<A>) => HKT<S, A> {
  return (schema) => schema(S)
}

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly 'io-ts/toDecoder': A
  }
}

export const toDecoder: Schemable1<'io-ts/toDecoder'> = {
  URI: 'io-ts/toDecoder',
  string: D.string,
  number: D.number,
  nullable: D.nullable,
  tuple: D.tuple
}

// helper to please ts@3.5
type ToGuard<I, A> = A extends I ? G.Guard<I, A> : never

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly 'io-ts/toGuard': ToGuard<D.InputOf<A>, D.TypeOf<A>>
  }
}

export const toGuard: Schemable1<'io-ts/toGuard'> = {
  URI: 'io-ts/toGuard',
  string: G.string,
  number: G.number,
  nullable: G.nullable as any,
  tuple: G.tuple as any
}

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly 'io-ts/toEq': Eq<D.TypeOf<A>>
  }
}

export const toEq: Schemable1<'io-ts/toEq'> = {
  URI: 'io-ts/toEq',
  string: E.string,
  number: E.number,
  nullable: E.nullable,
  tuple: E.tuple
}

// -------------------------------------------------------------------------------------
// example
// -------------------------------------------------------------------------------------

import * as assert from 'assert'
import { pipe } from 'fp-ts/lib/pipeable'

const schema = make((S) => S.tuple(S.nullable(S.string)))

export const decoder = compile(toDecoder)(schema)
assert.deepStrictEqual(decoder.decode([null]), D.success([null]))
assert.deepStrictEqual(decoder.decode(['a']), D.success(['a']))
assert.deepStrictEqual(
  pipe(decoder.decode([1]), D.draw, D.print),
  `Errors:
1 error(s) found while decoding (tuple)
└─ 1 error(s) found while decoding required component 0
   └─ 1 error(s) found while decoding a nullable
      └─ cannot decode 1, expected a string`
)

export const guard = compile(toGuard)(schema)
assert.deepStrictEqual(guard.is([null]), true)
assert.deepStrictEqual(guard.is(['a']), true)
assert.deepStrictEqual(guard.is([1]), false)

export const eq = compile(toEq)(schema)
assert.deepStrictEqual(eq.equals([null], [null]), true)
assert.deepStrictEqual(eq.equals(['a'], ['a']), true)
assert.deepStrictEqual(eq.equals(['a'], ['b']), false)
