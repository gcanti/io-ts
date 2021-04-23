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
  readonly nullable: <A>(or: HKT<S, A>) => HKT<S, D.NullableD<A>>
}

export interface Schemable1<S extends URIS> {
  readonly URI: S
  readonly string: Kind<S, D.stringUD>
  readonly number: Kind<S, D.numberUD>
  readonly nullable: <A extends D.AnyD>(or: Kind<S, A>) => Kind<S, D.NullableD<A>>
}

export interface Schema<A> {
  <S>(S: Schemable<S>): HKT<S, A>
}

export function make<A>(schema: Schema<A>): Schema<A> {
  return memoize(schema)
}

export const schemableIdentity: Schemable1<I.URI> = {
  URI: I.URI,
  string: D.string,
  number: D.number,
  nullable: D.nullable
}

export function to<S extends URIS>(S: Schemable1<S>): <A>(schema: Schema<A>) => Kind<S, A>
export function to<S>(S: Schemable<S>): <A>(schema: Schema<A>) => HKT<S, A> {
  return (schema) => schema(S)
}

const schema = make((S) => S.nullable(S.string))

export const decoder = to(schemableIdentity)(schema)
console.log(decoder.decode(null))
console.log(decoder.decode('a'))
console.log(decoder.decode(1))

export const URI = 'io-ts/GuardWrapper'

export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly [URI]: G.Guard<unknown, D.TypeOf<A>>
  }
}

export const schemableGuard: Schemable1<URI> = {
  URI: URI,
  string: G.string,
  number: G.number,
  nullable: G.nullable
}

export const guard = to(schemableGuard)(schema)
console.log(guard.is(null))
console.log(guard.is('a'))
console.log(guard.is(1))
