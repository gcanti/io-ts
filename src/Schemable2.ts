import { HKT, Kind, URIS } from 'fp-ts/lib/HKT'
import * as I from 'fp-ts/lib/Identity'
import * as D from './poc'
import { memoize } from './Schemable'
import * as G from './Guard'

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
  readonly fromTuple: <A extends ReadonlyArray<D.AnyD>>(
    ...components: { [K in keyof A]: HKT<S, A[K]> }
  ) => HKT<S, D.FromTupleD<A>>
}

export interface Schemable1<S extends URIS> {
  readonly URI: S
  readonly string: Kind<S, D.stringUD>
  readonly number: Kind<S, D.numberUD>
  readonly nullable: <A extends D.AnyD>(or: Kind<S, A>) => Kind<S, D.NullableD<A>>
  readonly tuple: <A extends ReadonlyArray<D.AnyUD>>(
    ...components: { [K in keyof A]: Kind<S, A[K]> }
  ) => Kind<S, D.TupleD<A>>
  readonly fromTuple: <A extends ReadonlyArray<D.AnyD>>(
    ...components: { [K in keyof A]: Kind<S, A[K]> }
  ) => Kind<S, D.FromTupleD<A>>
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

export const toDecoder: Schemable1<I.URI> = {
  URI: I.URI,
  string: D.string,
  number: D.number,
  nullable: D.nullable,
  tuple: D.tuple,
  fromTuple: D.fromTuple
}

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly 'io-ts/ToGuard': G.Guard<D.InputOf<A>, D.TypeOf<A> extends D.InputOf<A> ? D.TypeOf<A> : never>
  }
}

export const toGuard: Schemable1<'io-ts/ToGuard'> = {
  URI: 'io-ts/ToGuard',
  string: G.string,
  number: G.number,
  nullable: G.nullable as any,
  tuple: G.tuple as any,
  fromTuple: G.fromTuple as any
}

// -------------------------------------------------------------------------------------
// example
// -------------------------------------------------------------------------------------

const schema = make((S) => S.fromTuple(S.nullable(S.string)))

export const decoder = compile(toDecoder)(schema)
console.log(decoder.decode([null]))
console.log(decoder.decode(['a']))
console.log(decoder.decode([1]))

export const guard = compile(toGuard)(schema)
console.log(guard.is([null]))
console.log(guard.is(['a']))
console.log(guard.is([1]))

console.log(JSON.stringify(decoder, null, 2))
