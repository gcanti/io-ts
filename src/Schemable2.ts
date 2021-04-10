import { HKT3 } from 'fp-ts/lib/HKT'
import * as D from './poc'

// -------------------------------------------------------------------------------------
// use case: Schemable
// -------------------------------------------------------------------------------------

export interface AnyHKT3 extends HKT3<any, any, any, any> {}

export type InputOfHKT3<K3> = K3 extends HKT3<any, infer I, any, any> ? I : never
export type ErrorOfHKT3<K3> = K3 extends HKT3<any, any, infer E, any> ? E : never
export type TypeOfHKT3<K3> = K3 extends HKT3<any, any, any, infer A> ? A : never

export interface Schemable<S> {
  readonly URI: S
  readonly string: HKT3<S, unknown, D.LeafE<D.StringE>, string>
  readonly number: HKT3<S, unknown, D.LeafE<D.NumberE>, number>
  readonly nullable: <Or extends AnyHKT3>(
    or: Or
  ) => HKT3<S, null | InputOfHKT3<Or>, D.NullableE<ErrorOfHKT3<Or>>, null | TypeOfHKT3<Or>>
}

export interface Schema<I, E, A> {
  <S>(S: Schemable<S>): HKT3<S, I, E, A>
}

export interface AnyS extends Schema<any, any, any> {}

export type InputOfS<S> = S extends Schema<infer I, any, any> ? I : never
export type ErrorOfS<S> = S extends Schema<any, infer E, any> ? E : never
export type TypeOfS<S> = S extends Schema<any, any, infer A> ? A : never

export declare const make: <I, E, A>(schema: Schema<I, E, A>) => Schema<I, E, A>

export interface stringS extends Schema<unknown, D.LeafE<D.StringE>, string> {}
export const stringS: stringS = make((S) => S.string)

export interface numberS extends Schema<unknown, D.LeafE<D.NumberE>, number> {}
export const numberS: numberS = make((S) => S.number)

export interface NullableS<Or> extends Schema<null | InputOfS<Or>, D.NullableE<ErrorOfS<Or>>, null | TypeOfS<Or>> {}

export declare const nullableS: <Or extends AnyS>(or: Or) => NullableS<Or>

const schema1 = make((S) => S.nullable(S.string))
const schema2 = nullableS(stringS)

type ToDecoder<S> = S extends stringS
  ? D.stringD
  : S extends NullableS<infer Or>
  ? D.NullableD<ToDecoder<Or>>
  : D.Decoder<InputOfS<S>, ErrorOfS<S>, TypeOfS<S>>

export declare const toDecoder: <S extends AnyS>(schema: S) => ToDecoder<S>

// const decoder1: Decoder<unknown, NullableE<LeafE<StringE>>, string | null>
export const decoder1 = toDecoder(schema1)

// const decoder2: D.NullableD<D.stringD>
export const decoder2 = toDecoder(schema2)
