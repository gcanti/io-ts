import * as C from 'fp-ts/lib/Const'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

export interface NullableD<R> {
  readonly _tag: 'NullableD'
  readonly or: R
}

export interface NullableRD<R> extends NullableD<DSL<R>> {}

export type DSL<R> = R | NullableRD<R>

export interface Schema<R, I, A> {
  readonly schema: (r: R) => C.Const<DSL<R>, [I, A]>
}

export interface AnyS extends Schema<any, any, any> {}

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

export type Resource<D, I, E> = C.Const<D, [I, E]>

export interface StringE {
  readonly _tag: 'StringE'
  readonly actual: unknown
}
export interface StringD {
  readonly _tag: 'StringD'
}
export type StringR = Resource<StringD, unknown, StringE>
export const string: Schema<StringR, unknown, string> = {
  schema: (r) => C.make(r)
}

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

export const nullable = <R, I, A>(or: Schema<R, I, A>): Schema<R, I | null, A | null> => ({
  schema: (r) =>
    C.make({
      _tag: 'NullableD',
      or: or.schema(r)
    })
})

// -------------------------------------------------------------------------------------
// toDecoder
// -------------------------------------------------------------------------------------

import * as poc from './poc'

export declare const drawBy: <R>(f: (r: R) => Tree<string>) => (dsl: DSL<R>) => Tree<string>

// export declare const toDecoder: <R>(
//   r: { [K in keyof R]: R[K] extends DSL<infer D, infer I, infer E, infer A> ? (dsl: D) => poc.Decoder<I, E, A> : never }
// ) => <D, I, E, A>(schema: Schema<R, D, A>) => poc.Decoder<I, E, A>
