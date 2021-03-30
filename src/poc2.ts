// import { pipe } from 'fp-ts/lib/pipeable'
import * as C from 'fp-ts/lib/Const'
import { pipe } from 'fp-ts/lib/pipeable'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

export type DSL<D, I, E, A> = C.Const<D, [I, E, A]>

export const dsl = <D, I, E, A>(d: D): DSL<D, I, E, A> => C.make(d)

export interface Schema<R, D, I, E, A> {
  readonly schema: (r: R) => DSL<D, I, E, A>
}

export type getR<X> = X extends Schema<infer R, any, any, any, any> ? R : never
export type getD<X> = X extends Schema<any, infer D, any, any, any> ? D : never
export type getI<X> = X extends Schema<any, any, infer I, any, any> ? I : never
export type getE<X> = X extends Schema<any, any, any, infer E, any> ? E : never
export type getA<X> = X extends Schema<any, any, any, any, infer A> ? A : never

export interface AnyS extends Schema<any, any, any, any, any> {}

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

export interface StringE {
  readonly _tag: 'StringE'
  readonly actual: unknown
}
export interface StringD {
  readonly _tag: 'StringD'
}
export interface StringR {
  readonly StringD: DSL<StringD, unknown, StringE, string>
}
export const StringR: StringR = {
  StringD: dsl({ _tag: 'StringD' })
}
export interface stringS extends Schema<StringR, StringD, unknown, StringE, string> {}
export const string: stringS = {
  schema: (r) => r.StringD
}

export interface NumberE {
  readonly _tag: 'NumberE'
  readonly actual: unknown
}
export interface NumberD {
  readonly _tag: 'NumberD'
}
export interface NumberR {
  readonly NumberD: DSL<NumberD, unknown, NumberE, number>
}
export const NumberR: NumberR = {
  NumberD: dsl({ _tag: 'NumberD' })
}
export interface numberS extends Schema<NumberR, NumberD, unknown, NumberE, number> {}
export const number: numberS = {
  schema: (r) => r.NumberD
}

export interface BooleanE {
  readonly _tag: 'BooleanE'
  readonly actual: unknown
}
export interface BooleanD {
  readonly _tag: 'BooleanD'
}
export interface BooleanR {
  readonly BooleanD: DSL<BooleanD, unknown, BooleanE, boolean>
}
export const BooleanR: BooleanR = {
  BooleanD: dsl({ _tag: 'BooleanD' })
}
export interface booleanS extends Schema<BooleanR, BooleanD, unknown, BooleanE, boolean> {}
export const boolean: booleanS = {
  schema: (r) => r.BooleanD
}

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

export interface NullableD<D> {
  readonly _tag: 'NullableD'
  readonly or: D
}

export const nullable = <R, D, I, E, A>(or: Schema<R, D, I, E, A>): Schema<R, NullableD<D>, I | null, E, A | null> => ({
  schema: (r) =>
    dsl({
      _tag: 'NullableD',
      or: or.schema(r)
    })
})

export interface OrD<L, R> {
  readonly _tag: 'OrD'
  readonly left: L
  readonly right: R
}

export const or = <RR, DR, I, ER, AR>(right: Schema<RR, DR, I, ER, AR>) => <RL, DL, EL, AL>(
  left: Schema<RL, DL, I, EL, AL>
): Schema<RL & RR, OrD<DL, DR>, I, EL | ER, AL | AR> => ({
  schema: (r) =>
    dsl({
      _tag: 'OrD',
      left: left.schema(r),
      right: right.schema(r)
    })
})

export interface AndD<L, R> {
  readonly _tag: 'AndD'
  readonly left: L
  readonly right: R
}

export const and = <RR, DR, IR, ER, AR>(right: Schema<RR, DR, IR, ER, AR>) => <RL, DL, IL, EL, AL>(
  left: Schema<RL, DL, IL, EL, AL>
): Schema<RL & RR, AndD<DL, DR>, IL & IR, EL | ER, AL & AR> => ({
  schema: (r) =>
    dsl({
      _tag: 'AndD',
      left: left.schema(r),
      right: right.schema(r)
    })
})

/*
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

export interface UnionD<D> {
  readonly _tag: 'UnionD'
  readonly members: ReadonlyArray<D>
}

export const union = <Members extends ReadonlyArray<AnyS>>(
  ...members: Members
): Schema<
  UnionToIntersection<getR<Members[keyof Members]>>,
  UnionD<getD<Members[keyof Members]>>,
  getI<Members[keyof Members]>,
  getE<Members[keyof Members]>,
  getA<Members[keyof Members]>
> => ({
  schema: (r) =>
    dsl({
      _tag: 'UnionD',
      members: members.map((m) => m.schema(r))
    }) as any
})
*/

export interface FromArrayD<D> {
  readonly _tag: 'FromArrayD'
  readonly item: D
}

export const fromArray = <R, D, I, E, A>(
  item: Schema<R, D, I, E, A>
): Schema<R, FromArrayD<D>, Array<I>, E, Array<A>> => ({
  schema: (r) =>
    dsl({
      _tag: 'FromArrayD',
      item: item.schema(r)
    })
})

export interface ArrayD<D> {
  readonly _tag: 'ArrayD'
  readonly item: D
}

export interface UnknownArrayE {
  readonly _tag: 'UnknownArrayE'
  readonly actual: unknown
}

export const array = <R, D, E, A>(
  item: Schema<R, D, unknown, E, A>
): Schema<R, ArrayD<D>, unknown, UnknownArrayE | E, Array<A>> => ({
  schema: (r) =>
    dsl({
      _tag: 'ArrayD',
      item: item.schema(r)
    })
})

export interface FieldD<N, D> {
  readonly _tag: 'FieldD'
  readonly name: N
  readonly value: D
}

export const field = <N extends string, R, D, I, E, A>(
  name: N,
  value: Schema<R, D, I, E, A>
): Schema<R, FieldD<N, D>, { [K in N]: I }, E, { [K in N]: A }> => ({
  schema: (r) =>
    dsl({
      _tag: 'FieldD',
      name,
      value: value.schema(r)
    })
})

// export declare const lazy: <R, I, E, A>(id: string, factory: () => Factory<R, I, E, A>) => Factory<R, I, E, A>

// -------------------------------------------------------------------------------------
// examples
// -------------------------------------------------------------------------------------

// nullable
export const NullableS = nullable(string)
export const NullableDSL = NullableS.schema({
  ...StringR
})
// console.log(JSON.stringify(NullableDSL, null, 2))

// or
export const OrS = pipe(string, or(number), or(boolean))
export const OrDSL = OrS.schema({
  ...StringR,
  ...NumberR,
  ...BooleanR
})
// console.log(JSON.stringify(OrDSL, null, 2))

// and
export const AndS = pipe(field('a', string), and(field('b', number)))
export const AndDSL = AndS.schema({
  ...StringR,
  ...NumberR
})
console.log(JSON.stringify(AndDSL, null, 2))

/*
// union
export const UnionS = union(string, number)
export const UnionDSL = UnionS.schema({
  string: string.schema(StringR),
  number: number.schema(NumberR)
})
console.log(JSON.stringify(UnionDSL, null, 2))
*/

// fromArray
export const FromArrayS = fromArray(string)
export const FromArrayDSL = FromArrayS.schema({
  ...StringR
})
// console.log(JSON.stringify(FromArrayDSL, null, 2))

// array
export const ArrayS = array(string)
export const ArrayDSL = ArrayS.schema({
  ...StringR
})
// console.log(JSON.stringify(ArrayDSL, null, 2))

// // field
// export const FieldF = pipe(field('a', string), and(field('b', number)))
// export const FieldD = toDecoder(FieldF)

// // lazy
// interface CategoryInput {
//   name: unknown
//   categories: unknown
// }
// interface Category {
//   name: string
//   categories: ReadonlyArray<Category>
// }
// export const Category: Factory<stringR, CategoryInput, StringE, Category> = lazy('Category', () =>
//   pipe(field('name', string), and(field('categories', array(Category))))
// )

// -------------------------------------------------------------------------------------
// toDecoder
// -------------------------------------------------------------------------------------

import * as poc from './poc'

export declare const toDecoder: <R>(
  r: { [K in keyof R]: R[K] extends DSL<infer D, infer I, infer E, infer A> ? (dsl: D) => poc.Decoder<I, E, A> : never }
) => <D, I, E, A>(schema: Schema<R, D, I, E, A>) => poc.Decoder<I, E, A>

export const decoderInterpreter = toDecoder<StringR & NumberR & BooleanR>({
  StringD: () => poc.string,
  NumberD: () => poc.number,
  BooleanD: () => poc.boolean
})

export const decoder1 = decoderInterpreter(NullableS)
export const decoder2 = decoderInterpreter(OrS)

// -------------------------------------------------------------------------------------
// toGuard
// -------------------------------------------------------------------------------------

import * as G from './Guard'

export declare const toGuard: <R>(
  r: {
    [K in keyof R]: R[K] extends DSL<infer D, infer I, any, infer A>
      ? [A] extends [I]
        ? (dsl: D) => G.Guard<I, A>
        : never
      : never
  }
) => <D, I, E, A extends I>(schema: Schema<R, D, I, E, A>) => G.Guard<I, A>

export const guardInterpreter = toGuard<StringR & NumberR & BooleanR>({
  StringD: () => G.string,
  NumberD: () => G.number,
  BooleanD: () => G.boolean
})

export const guard1 = guardInterpreter(NullableS)
export const guard2 = guardInterpreter(OrS)
