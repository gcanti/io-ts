/**
 * @since 2.2.0
 */
import { Kind, URIS } from 'fp-ts/es6/HKT';
/**
 * @since 2.2.0
 */
export declare type Literal = string | number | boolean | null;
/**
 * @since 2.2.0
 */
export interface Schemable<S extends URIS> {
    readonly URI: S;
    readonly literal: <A extends ReadonlyArray<Literal>>(...values: A) => Kind<S, A[number]>;
    readonly string: Kind<S, string>;
    readonly number: Kind<S, number>;
    readonly boolean: Kind<S, boolean>;
    readonly UnknownArray: Kind<S, Array<unknown>>;
    readonly UnknownRecord: Kind<S, Record<string, unknown>>;
    readonly nullable: <A>(or: Kind<S, A>) => Kind<S, null | A>;
    readonly type: <A>(properties: {
        [K in keyof A]: Kind<S, A[K]>;
    }) => Kind<S, A>;
    readonly partial: <A>(properties: {
        [K in keyof A]: Kind<S, A[K]>;
    }) => Kind<S, Partial<A>>;
    readonly record: <A>(codomain: Kind<S, A>) => Kind<S, Record<string, A>>;
    readonly array: <A>(items: Kind<S, A>) => Kind<S, Array<A>>;
    readonly tuple: <A extends ReadonlyArray<unknown>>(...components: {
        [K in keyof A]: Kind<S, A[K]>;
    }) => Kind<S, A>;
    readonly intersection: <A, B>(left: Kind<S, A>, right: Kind<S, B>) => Kind<S, A & B>;
    readonly sum: <T extends string>(tag: T) => <A>(members: {
        [K in keyof A]: Kind<S, A[K] & Record<T, K>>;
    }) => Kind<S, A[keyof A]>;
    readonly lazy: <A>(id: string, f: () => Kind<S, A>) => Kind<S, A>;
}
/**
 * @since 2.2.0
 */
export interface WithUnion<S extends URIS> {
    readonly union: <A extends ReadonlyArray<unknown>>(...members: {
        [K in keyof A]: Kind<S, A[K]>;
    }) => Kind<S, A[number]>;
}
/**
 * @since 2.2.0
 */
export declare function memoize<A, B>(f: (a: A) => B): (a: A) => B;
