import { HKT, Kind, Kind2, URIS, URIS2 } from 'fp-ts/lib/HKT'
import * as D from './Decoder2'
import { Schemable, Schemable1, Schemable2C } from './Schemable2'

// TODO: move to io-ts-contrib in v3

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 2.2.0
 */
export interface Schema<A> {
  <S>(S: Schemable<S>): HKT<S, A>
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 2.2.0
 */
export function make<A>(schema: Schema<A>): Schema<A> {
  return D.memoize(schema)
}

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.0
 */
export type TypeOf<S> = S extends Schema<infer A> ? A : never

/**
 * @since 2.2.3
 */
export function interpreter<S extends URIS2, E>(S: Schemable2C<S, E>): <A>(schema: Schema<A>) => Kind2<S, E, A>
export function interpreter<S extends URIS>(S: Schemable1<S>): <A>(schema: Schema<A>) => Kind<S, A>
export function interpreter<S>(S: Schemable<S>): <A>(schema: Schema<A>) => HKT<S, A> {
  return (schema) => schema(S)
}
