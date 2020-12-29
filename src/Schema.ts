/**
 * @since 3.0.0
 */
import { HKT, Kind, Kind2, URIS, URIS2 } from 'fp-ts/HKT'
import { memoize, Schemable, Schemable1, Schemable2C } from './Schemable'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 3.0.0
 */
export interface Schema<A> {
  <S>(S: Schemable<S>): HKT<S, A>
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 3.0.0
 */
export function make<A>(schema: Schema<A>): Schema<A> {
  return memoize(schema)
}

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export type TypeOf<S> = S extends Schema<infer A> ? A : never

/**
 * @since 3.0.0
 */
export function interpreter<S extends URIS2>(S: Schemable2C<S, unknown>): <A>(schema: Schema<A>) => Kind2<S, unknown, A>
export function interpreter<S extends URIS>(S: Schemable1<S>): <A>(schema: Schema<A>) => Kind<S, A>
export function interpreter<S>(S: Schemable<S>): <A>(schema: Schema<A>) => HKT<S, A> {
  return (schema) => schema(S)
}
