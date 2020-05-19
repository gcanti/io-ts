/**
 * @since 2.2.0
 */
import { HKT, URIS, Kind } from 'fp-ts/lib/HKT'
import { memoize, Schemable, Schemable1 } from './Schemable'

/**
 * @since 2.2.0
 */
export interface Schema<A> {
  <S>(S: Schemable<S>): HKT<S, A>
}

/**
 * @since 2.2.0
 */
export type TypeOf<S> = S extends Schema<infer A> ? A : never

/**
 * @since 2.2.0
 */
export function make<A>(schema: Schema<A>): Schema<A> {
  return memoize(schema)
}

/**
 * @since 2.2.3
 */
export function interpreter<S extends URIS>(S: Schemable1<S>): <A>(schema: Schema<A>) => Kind<S, A> {
  return (schema: any) => schema(S)
}
