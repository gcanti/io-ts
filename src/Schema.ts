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
import { memoize, Schemable, Schemable1, Schemable2C, Literal } from './Schemable'

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
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 2.3.0
 */
export function struct<A>(properties: { [K in keyof A]: Schema<A[K]> }): Schema<A> {
  return <S>(S: Schemable<S>) => {
    const evaluatedProperties: { [K in keyof A]: HKT<S, A[K]> } = {} as any;
    for (const key in properties) {
      evaluatedProperties[key] = properties[key](S);
    }
    return S.struct(evaluatedProperties);
  };
}

/**
 * @category combinators
 * @since 2.3.0
 */
export function literal<A extends readonly [L, ...ReadonlyArray<L>], L extends Literal = Literal>(
  ...values: A
): Schema<A[number]> {
  return (S) => S.literal(...values);
}

/**
 * @category combinators
 * @since 2.3.0
 */
export function nullable<A>(schema: Schema<A>): Schema<A | null> {
  return (S) => S.nullable(schema(S));
}

/**
 * @category combinators
 * @since 2.3.0
 */
export function partial<A>(properties: { [K in keyof A]: Schema<A[K]> }): Schema<Partial<{ [K in keyof A]: A[K] }>> {
  return <S>(S: Schemable<S>) => {
    const evaluatedProperties = {} as any;
    for (const key in properties) {
      evaluatedProperties[key] = properties[key](S);
    }
    return S.partial(evaluatedProperties);
  };
}

/**
 * @category combinators
 * @since 2.3.0
 */
export function record<A>(schema: Schema<A>): Schema<Record<string, A>> {
  return (S) => S.record(schema(S));
}

/**
 * @category combinators
 * @since 2.3.0
 */
export function array<A>(schema: Schema<A>): Schema<A[]> {
  return (S) => S.array(schema(S));
}

/**
 * @category combinators
 * @since 2.3.0
 */
export function tuple<A extends ReadonlyArray<unknown>>(...components: { [K in keyof A]: Schema<A[K]> }): Schema<A> {
  return (S) => S.tuple(...components.map((schema) => schema(S)) as any);
}

/**
 * @category combinators
 * @since 2.3.0
 */
export function intersect<B>(right: Schema<B>): <A>(left: Schema<A>) => Schema<A & B> {
  return (left) => (S) => S.intersect(right(S))(left(S));
}

/**
 * @category combinators
 * @since 2.3.0
 */
export function sum<T extends string>(tag: T): <A>(members: { [K in keyof A]: Schema<A[K] & Record<T, K>> }) => Schema<A[keyof A]> {
  return (members) => (S) => {
    const evaluatedMembers = {} as any;
    for (const key in members) {
      evaluatedMembers[key] = members[key](S);
    }
    return S.sum(tag)(evaluatedMembers);
  };
}

/**
 * @category combinators
 * @since 2.3.0
 */
export function lazy(id: string): <A>(f: () => Schema<A>) => Schema<A> {
  return (f) => (S) => S.lazy(id, () => f()(S));
}

/**
 * @category combinators
 * @since 2.3.0
 */
export function readonly<A>(schema: Schema<A>): Schema<Readonly<A>> {
  return schema;
}

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * @category primitives
 * @since 2.3.0
 */
export const number: Schema<number> = (S) => S.number;

/**
 * @category primitives
 * @since 2.3.0
 */
export const string: Schema<string> = (S) => S.string;

/**
 * @category primitives
 * @since 2.3.0
 */
export const boolean: Schema<boolean> = (S) => S.boolean;


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
export function interpreter<S extends URIS2>(S: Schemable2C<S, unknown>): <A>(schema: Schema<A>) => Kind2<S, unknown, A>
export function interpreter<S extends URIS>(S: Schemable1<S>): <A>(schema: Schema<A>) => Kind<S, A>
export function interpreter<S>(S: Schemable<S>): <A>(schema: Schema<A>) => HKT<S, A> {
  return (schema) => schema(S)
}
