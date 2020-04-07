/**
 * @since 2.2.0
 */
import { Invariant1 } from 'fp-ts/lib/Invariant';
import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray';
import { Tree } from 'fp-ts/lib/Tree';
import * as D from './Decoder';
import * as E from './Encoder';
import { Schemable, Literal } from './Schemable';
/**
 * Laws:
 *
 * 1. `pipe(codec.decode(u), E.fold(() => u, codec.encode) = u` for all `u` in `unknown`
 * 2. `codec.decode(codec.encode(a)) = E.right(a)` for all `a` in `A`
 *
 * @since 2.2.0
 */
export interface Codec<A> extends D.Decoder<A>, E.Encoder<A> {
}
/**
 * @since 2.2.0
 */
export declare function make<A>(decoder: D.Decoder<A>, encoder: E.Encoder<A>): Codec<A>;
/**
 * @since 2.2.0
 */
export declare function literal<A extends ReadonlyArray<Literal>>(...values: A): Codec<A[number]>;
/**
 * @since 2.2.0
 */
export declare const string: Codec<string>;
/**
 * @since 2.2.0
 */
export declare const number: Codec<number>;
/**
 * @since 2.2.0
 */
export declare const boolean: Codec<boolean>;
/**
 * @since 2.2.0
 */
export declare const UnknownArray: Codec<Array<unknown>>;
/**
 * @since 2.2.0
 */
export declare const UnknownRecord: Codec<Record<string, unknown>>;
/**
 * @since 2.2.0
 */
export declare function withExpected<A>(codec: Codec<A>, expected: (actual: unknown, nea: NonEmptyArray<Tree<string>>) => NonEmptyArray<Tree<string>>): Codec<A>;
/**
 * @since 2.2.0
 */
export declare function refinement<A, B extends A>(from: Codec<A>, refinement: (a: A) => a is B, expected: string): Codec<B>;
/**
 * @since 2.2.0
 */
export declare function nullable<A>(or: Codec<A>): Codec<null | A>;
/**
 * @since 2.2.0
 */
export declare function type<A>(properties: {
    [K in keyof A]: Codec<A[K]>;
}): Codec<A>;
/**
 * @since 2.2.0
 */
export declare function partial<A>(properties: {
    [K in keyof A]: Codec<A[K]>;
}): Codec<Partial<A>>;
/**
 * @since 2.2.0
 */
export declare function record<A>(codomain: Codec<A>): Codec<Record<string, A>>;
/**
 * @since 2.2.0
 */
export declare function array<A>(items: Codec<A>): Codec<Array<A>>;
/**
 * @since 2.2.0
 */
export declare function tuple<A extends ReadonlyArray<unknown>>(...components: {
    [K in keyof A]: Codec<A[K]>;
}): Codec<A>;
/**
 * @since 2.2.0
 */
export declare function intersection<A, B>(left: Codec<A>, right: Codec<B>): Codec<A & B>;
/**
 * @since 2.2.0
 */
export declare function sum<T extends string>(tag: T): <A>(members: {
    [K in keyof A]: Codec<A[K] & Record<T, K>>;
}) => Codec<A[keyof A]>;
/**
 * @since 2.2.0
 */
export declare function lazy<A>(id: string, f: () => Codec<A>): Codec<A>;
/**
 * @since 2.2.0
 */
export declare const URI = "Codec";
/**
 * @since 2.2.0
 */
export declare type URI = typeof URI;
declare module 'fp-ts/lib/HKT' {
    interface URItoKind<A> {
        readonly Codec: Codec<A>;
    }
}
/**
 * @since 2.2.0
 */
export declare const codec: Invariant1<URI> & Schemable<URI>;
