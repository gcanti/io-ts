/**
 * **This module is experimental**
 *
 * Experimental features are published in order to get early feedback from the community, see these tracking
 * [issues](https://github.com/gcanti/io-ts/issues?q=label%3Av2.2+) for further discussions and enhancements.
 *
 * A feature tagged as _Experimental_ is in a high state of flux, you're at risk of it changing without notice.
 *
 * @since 2.2.0
 */
import { HKT, Kind, Kind2, URIS, URIS2 } from 'fp-ts/lib/HKT'
import { memoize, Schemable, Schemable1, Schemable2C } from './Schemable'

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
 * @category constructors
 * @since 2.2.0
 */
export function make<A>(schema: Schema<A>): Schema<A> {
  return memoize(schema)
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
export const interpreter: {
  <S extends URIS2>(S: Schemable2C<S, unknown>): <A>(schema: Schema<A>) => Kind2<S, unknown, A>
  <S extends URIS>(S: Schemable1<S>): <A>(schema: Schema<A>) => Kind<S, A>
} = (S: any) => (schema: any) => schema(S)
