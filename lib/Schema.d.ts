/**
 * @since 2.2.0
 */
import { Kind, URIS } from 'fp-ts/lib/HKT';
import { Schemable } from './Schemable';
/**
 * @since 2.2.0
 */
export interface Schema<A> {
    <S extends URIS>(S: Schemable<S>): Kind<S, A>;
}
/**
 * @since 2.2.0
 */
export declare type TypeOf<S> = S extends Schema<infer A> ? A : never;
/**
 * @since 2.2.0
 */
export declare function make<A>(f: Schema<A>): Schema<A>;
