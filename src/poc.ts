import { flow, Lazy, Refinement } from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import * as RA from 'fp-ts/lib/ReadonlyArray'
import * as RNEA from 'fp-ts/lib/ReadonlyNonEmptyArray'
import * as TH from 'fp-ts/lib/These'

import These = TH.These
import ReadonlyNonEmptyArray = RNEA.ReadonlyNonEmptyArray

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/*

  D = "Decoder"
  UD = "Decoder with `unknown` input"
  E = "Error"
  LE = "Error wrapped in `LeafE`"

*/

export interface Decoder<I, E, A> {
  readonly decode: (i: I) => These<E, A>
}

interface AnyD extends Decoder<any, any, any> {}
interface AnyUD extends Decoder<unknown, any, any> {}

export type InputOf<D> = D extends Decoder<infer I, any, any> ? I : never
export type ErrorOf<D> = D extends Decoder<any, infer E, any> ? E : never
export type TypeOf<D> = D extends Decoder<any, any, infer A> ? A : never

// -------------------------------------------------------------------------------------
// decoding constructors
// -------------------------------------------------------------------------------------

// success
export const right = TH.right

// error
export const left = TH.left

// warning
export const both = TH.both

// -------------------------------------------------------------------------------------
// Bifunctor
// -------------------------------------------------------------------------------------

export interface MapLeftD<D, E> extends Decoder<InputOf<D>, E, TypeOf<D>> {
  readonly _tag: 'MapLeftD'
  readonly decoder: D
  readonly mapLeft: (de: ErrorOf<D>, i: InputOf<D>) => E
}

export function mapLeft<D extends AnyD, E>(f: (e: ErrorOf<D>, i: InputOf<D>) => E): (decoder: D) => MapLeftD<D, E>
export function mapLeft<E1, I, E2>(
  f: (e: E1, i: I) => E2
): <A>(decoder: Decoder<I, E1, A>) => MapLeftD<typeof decoder, E2> {
  return (decoder) => ({
    _tag: 'MapLeftD',
    decode: (i) =>
      pipe(
        decoder.decode(i),
        TH.mapLeft((de) => f(de, i))
      ),
    decoder,
    mapLeft: f
  })
}

export interface MapD<D, B> extends Decoder<InputOf<D>, ErrorOf<D>, B> {
  readonly _tag: 'MapD'
  readonly decoder: D
  readonly map: (a: TypeOf<D>) => B
}

export function map<D extends AnyD, B>(f: (a: TypeOf<D>) => B): (decoder: D) => MapD<D, B>
export function map<A, B>(f: (a: A) => B): <I, E>(decoder: Decoder<I, E, A>) => MapD<typeof decoder, B> {
  return (decoder) => ({
    _tag: 'MapD',
    decode: flow(decoder.decode, TH.map(f)),
    decoder,
    map: f
  })
}

// -------------------------------------------------------------------------------------
// orElse
// -------------------------------------------------------------------------------------

// export interface OrElseD<F, S>
//   extends Decoder<
//     InputOf<F> & InputOf<S>,
//     UnionE<MemberE<'0', ErrorOf<F>> | MemberE<'1', ErrorOf<S>>>,
//     TypeOf<F> | TypeOf<S>
//   > {
//   readonly _tag: 'OrElseD'
//   readonly first: F
//   readonly second: (e: ErrorOf<F>) => S
// }

// export function orElse<F extends AnyD, S extends AnyD>(second: (e: ErrorOf<F>) => S): (first: F) => OrElseD<F, S>
// export function orElse<E1, I2, E2, A2>(
//   second: (e1: E1) => Decoder<I2, E2, A2>
// ): <I1, A1>(first: Decoder<I1, E1, A1>) => OrElseD<Decoder<I1, E1, A1>, Decoder<I2, E2, A2>> {
//   return <I1, A1>(first: Decoder<I1, E1, A1>): OrElseD<Decoder<I1, E1, A1>, Decoder<I2, E2, A2>> => ({
//     _tag: 'OrElseD',
//     first,
//     second,
//     decode: (i) =>
//       pipe(
//         first.decode(i),
//         TH.fold<E1, A1, These<UnionE<MemberE<'0', E1> | MemberE<'1', E2>>, A1 | A2>>(
//           (e1) =>
//             pipe(
//               second(e1).decode(i),
//               TH.mapLeft((e2) => unionE([memberE('0', e1), memberE('1', e2)]))
//             ),
//           right,
//           (e1, a1) => both(unionE([memberE('0', e1)]), a1)
//         )
//       )
//   })
// }

// -------------------------------------------------------------------------------------
// Category
// -------------------------------------------------------------------------------------

export interface IdentityD<A> extends Decoder<A, never, A> {
  readonly _tag: 'IdentityD'
}

export const id = <A>(): IdentityD<A> => ({
  _tag: 'IdentityD',
  decode: TH.right
})

export interface CompositionD<P, N>
  extends Decoder<InputOf<P>, CompositionE<PrevE<ErrorOf<P>> | NextE<ErrorOf<N>>>, TypeOf<N>> {
  readonly _tag: 'CompositionD'
  readonly prev: P
  readonly next: N
}

export function compose<P extends AnyD, N extends Decoder<TypeOf<P>, any, any>>(
  next: N
): (prev: P) => CompositionD<P, N>
export function compose<A, E2, B>(
  next: Decoder<A, E2, B>
): <I, E1>(prev: Decoder<I, E1, A>) => CompositionD<typeof prev, typeof next> {
  return (prev) => ({
    _tag: 'CompositionD',
    prev,
    next,
    decode: flow(
      prev.decode,
      TH.fold(
        (e1) => left(compositionE([prevE(e1)])),
        (a) =>
          pipe(
            next.decode(a),
            TH.mapLeft((e) => compositionE([nextE(e)]))
          ),
        (w1, a) =>
          pipe(
            next.decode(a),
            TH.fold(
              (e2) => left(compositionE([nextE(e2)])),
              (b) => both(compositionE([prevE(w1)]), b),
              (w2, b) => both(compositionE([prevE(w1), nextE(w2)]), b)
            )
          )
      )
    )
  })
}

// -------------------------------------------------------------------------------------
// error model
// -------------------------------------------------------------------------------------

export interface ActualE<I> {
  readonly actual: I
}

export interface SingleE<E> {
  readonly error: E
}

export interface RequiredKeyE<K, E> extends SingleE<E> {
  readonly _tag: 'RequiredKeyE'
  readonly key: K
}
export const requiredKeyE = <K, E>(key: K, error: E): RequiredKeyE<K, E> => ({
  _tag: 'RequiredKeyE',
  key,
  error
})

export interface OptionalKeyE<K, E> extends SingleE<E> {
  readonly _tag: 'OptionalKeyE'
  readonly key: K
}
export const optionalKeyE = <K, E>(key: K, error: E): OptionalKeyE<K, E> => ({
  _tag: 'OptionalKeyE',
  key,
  error
})

export interface RequiredIndexE<I, E> extends SingleE<E> {
  readonly _tag: 'RequiredIndexE'
  readonly index: I
}
export const requiredIndexE = <I, E>(index: I, error: E): RequiredIndexE<I, E> => ({
  _tag: 'RequiredIndexE',
  index,
  error
})

export interface OptionalIndexE<I, E> extends SingleE<E> {
  readonly _tag: 'OptionalIndexE'
  readonly index: I
}
export const optionalIndexE = <I, E>(index: I, error: E): OptionalIndexE<I, E> => ({
  _tag: 'OptionalIndexE',
  index,
  error
})

export interface LazyE<E> extends SingleE<E> {
  readonly _tag: 'LazyE'
  readonly id: string
}
export const lazyE = <E>(id: string, error: E): LazyE<E> => ({ _tag: 'LazyE', id, error })

export interface MemberE<M, E> extends SingleE<E> {
  readonly _tag: 'MemberE'
  readonly member: M
}
export const memberE = <M, E>(member: M, error: E): MemberE<M, E> => ({ _tag: 'MemberE', member, error })

export interface TagE<T, E> extends SingleE<E> {
  readonly _tag: 'TagE'
  readonly tag: T
}
export const tagE = <T, E>(tag: T, error: E): TagE<T, E> => ({ _tag: 'TagE', tag, error })

// Single errors

export interface LeafE<E> extends SingleE<E> {
  readonly _tag: 'LeafE'
}
export const leafE = <E>(error: E): LeafE<E> => ({ _tag: 'LeafE', error })

export interface NullableE<E> extends SingleE<E> {
  readonly _tag: 'NullableE'
}
export const nullableE = <E>(error: E): NullableE<E> => ({ _tag: 'NullableE', error })

export interface RefinementE<E> extends SingleE<E> {
  readonly _tag: 'RefinementE'
}
export const refinementE = <E>(error: E): RefinementE<E> => ({ _tag: 'RefinementE', error })

export interface ParserE<E> extends SingleE<E> {
  readonly _tag: 'ParserE'
}
export const parserE = <E>(error: E): ParserE<E> => ({ _tag: 'ParserE', error })

export interface PrevE<E> extends SingleE<E> {
  readonly _tag: 'PrevE'
}
export const prevE = <E>(error: E): PrevE<E> => ({ _tag: 'PrevE', error })

export interface NextE<E> extends SingleE<E> {
  readonly _tag: 'NextE'
}
export const nextE = <E>(error: E): NextE<E> => ({ _tag: 'NextE', error })

// Compound errors

export interface CompoundE<E> {
  readonly errors: ReadonlyNonEmptyArray<E>
}

export interface StructE<E> extends CompoundE<E> {
  readonly _tag: 'StructE'
}
export const structE = <E>(errors: ReadonlyNonEmptyArray<E>): StructE<E> => ({ _tag: 'StructE', errors })

export interface PartialE<E> extends CompoundE<E> {
  readonly _tag: 'PartialE'
}
export const partialE = <E>(errors: ReadonlyNonEmptyArray<E>): PartialE<E> => ({ _tag: 'PartialE', errors })

export interface RecordE<E> extends CompoundE<E> {
  readonly _tag: 'RecordE'
}
export const recordE = <E>(errors: ReadonlyNonEmptyArray<E>): RecordE<E> => ({
  _tag: 'RecordE',
  errors
})

export interface MissingIndexesE {
  readonly _tag: 'MissingIndexesE'
  readonly indexes: ReadonlyNonEmptyArray<number>
}
export const missingIndexesE = (indexes: ReadonlyNonEmptyArray<number>): MissingIndexesE => ({
  _tag: 'MissingIndexesE',
  indexes
})

export interface UnexpectedIndexesE {
  readonly _tag: 'UnexpectedIndexesE'
  readonly indexes: ReadonlyNonEmptyArray<number>
}
export const unexpectedIndexesE = (indexes: ReadonlyNonEmptyArray<number>): UnexpectedIndexesE => ({
  _tag: 'UnexpectedIndexesE',
  indexes
})

export interface TupleE<E> extends CompoundE<E> {
  readonly _tag: 'TupleE'
}
export const tupleE = <E>(errors: ReadonlyNonEmptyArray<E>): TupleE<E> => ({ _tag: 'TupleE', errors })

export interface ArrayE<E> extends CompoundE<E> {
  readonly _tag: 'ArrayE'
}
export const arrayE = <E>(errors: ReadonlyNonEmptyArray<E>): ArrayE<E> => ({
  _tag: 'ArrayE',
  errors
})

export interface UnionE<E> extends CompoundE<E> {
  readonly _tag: 'UnionE'
}
export const unionE = <E>(errors: ReadonlyNonEmptyArray<E>): UnionE<E> => ({
  _tag: 'UnionE',
  errors
})

export interface CompositionE<E> extends CompoundE<E> {
  readonly _tag: 'CompositionE'
}
export const compositionE = <E>(errors: ReadonlyNonEmptyArray<E>): CompositionE<E> => ({
  _tag: 'CompositionE',
  errors
})

export interface IntersectionE<E> extends CompoundE<E> {
  readonly _tag: 'IntersectionE'
}
export const intersectionE = <E>(errors: ReadonlyNonEmptyArray<E>): IntersectionE<E> => ({
  _tag: 'IntersectionE',
  errors
})

export interface SumE<E> extends CompoundE<E> {
  readonly _tag: 'SumE'
}
export const sumE = <E>(errors: ReadonlyNonEmptyArray<E>): SumE<E> => ({
  _tag: 'SumE',
  errors
})

export interface MessageE<I> extends ActualE<I> {
  readonly _tag: 'MessageE'
  readonly message: string
}
export interface MessageLE<I> extends LeafE<MessageE<I>> {}
export const messageE = <I>(actual: I, message: string): MessageE<I> => ({
  _tag: 'MessageE',
  message,
  actual
})
export const message: <I>(actual: I, message: string) => MessageLE<I> = flow(messageE, leafE)

export interface MissingKeysE {
  readonly _tag: 'MissingKeysE'
  readonly keys: ReadonlyNonEmptyArray<string>
}
export const missingKeysE = (keys: ReadonlyNonEmptyArray<string>): MissingKeysE => ({
  _tag: 'MissingKeysE',
  keys
})
export interface UnexpectedKeysE {
  readonly _tag: 'UnexpectedKeysE'
  readonly keys: ReadonlyNonEmptyArray<string>
}
export const unexpectedKeysE = (keys: ReadonlyNonEmptyArray<string>): UnexpectedKeysE => ({
  _tag: 'UnexpectedKeysE',
  keys
})

// recursive helpers to please ts@3.5
// simple single
export interface NullableRE<E> extends NullableE<DecodeError<E>> {}
export interface RefinementRE<E> extends RefinementE<DecodeError<E>> {}
export interface ParserRE<E> extends ParserE<DecodeError<E>> {}
export interface PrevRE<E> extends PrevE<DecodeError<E>> {}
export interface NextRE<E> extends NextE<DecodeError<E>> {}
// customized single
export interface RequiredKeyRE<E> extends RequiredKeyE<string, DecodeError<E>> {}
export interface OptionalKeyRE<E> extends OptionalKeyE<string, DecodeError<E>> {}
export interface RequiredIndexRE<E> extends RequiredIndexE<number, DecodeError<E>> {}
export interface OptionalIndexRE<E> extends OptionalIndexE<number, DecodeError<E>> {}
export interface MemberRE<E> extends MemberE<string | number, DecodeError<E>> {}
export interface TagRE<E> extends TagE<string, DecodeError<E>> {}
export interface LazyRE<E> extends LazyE<DecodeError<E>> {}
// compound
export interface CompositionRE<E> extends CompositionE<DecodeError<E>> {}
export interface StructRE<E> extends StructE<DecodeError<E>> {}
export interface PartialRE<E> extends PartialE<DecodeError<E>> {}
export interface TupleRE<E> extends TupleE<DecodeError<E>> {}
export interface ArrayRE<E> extends ArrayE<DecodeError<E>> {}
export interface RecordRE<E> extends RecordE<DecodeError<E>> {}
export interface UnionRE<E> extends UnionE<DecodeError<E>> {}
export interface IntersectionRE<E> extends IntersectionE<DecodeError<E>> {}
export interface SumRE<E> extends SumE<DecodeError<E>> {}

export type DecodeError<E> =
  | UnexpectedKeysE
  | MissingKeysE
  | UnexpectedIndexesE
  | MissingIndexesE
  // simple single
  | LeafE<E>
  | NullableRE<E>
  | RefinementRE<E>
  | ParserRE<E>
  | PrevRE<E>
  | NextRE<E>
  // customized single
  | RequiredKeyRE<E>
  | OptionalKeyRE<E>
  | RequiredIndexRE<E>
  | OptionalIndexRE<E>
  | MemberRE<E>
  | TagRE<E>
  | LazyRE<E>
  // compound
  | StructRE<E>
  | PartialRE<E>
  | TupleRE<E>
  | ArrayRE<E>
  | RecordRE<E>
  | UnionRE<E>
  | IntersectionRE<E>
  | SumRE<E>
  | CompositionRE<E>

export type BuiltinE =
  | StringE
  | NumberE
  | BooleanE
  | UnknownRecordE
  | UnknownArrayE
  | LiteralE<Literal>
  | MessageE<unknown>
  | NaNE

// -------------------------------------------------------------------------------------
// decoder primitives
// -------------------------------------------------------------------------------------

export interface StringE extends ActualE<unknown> {
  readonly _tag: 'StringE'
}
export interface StringLE extends LeafE<StringE> {}
export const stringLE = (actual: unknown): StringLE => leafE({ _tag: 'StringE', actual })
export interface stringUD extends Decoder<unknown, StringLE, string> {
  readonly _tag: 'stringUD'
}
const isString = (u: unknown): u is string => typeof u === 'string'
export const string: stringUD = {
  _tag: 'stringUD',
  decode: (u) => (isString(u) ? right(u) : left(stringLE(u)))
}

// TODO: handle Infinity
export interface NumberE extends ActualE<unknown> {
  readonly _tag: 'NumberE'
}
export interface NumberLE extends LeafE<NumberE> {}
export const numberLE = (actual: unknown): NumberLE => leafE({ _tag: 'NumberE', actual })
export interface NaNE {
  readonly _tag: 'NaNE'
}
export interface NaNLE extends LeafE<NaNE> {}
export const naNLE: NaNLE = leafE({ _tag: 'NaNE' })
export interface numberUD extends Decoder<unknown, NumberLE | NaNLE, number> {
  readonly _tag: 'numberUD'
}
const isNumber = (u: unknown): u is number => typeof u === 'number'
export const number: numberUD = {
  _tag: 'numberUD',
  decode: (u) => (isNumber(u) ? (isNaN(u) ? both(naNLE, u) : right(u)) : left(numberLE(u)))
}

export interface BooleanE extends ActualE<unknown> {
  readonly _tag: 'BooleanE'
}
export interface BooleanLE extends LeafE<BooleanE> {}
export const booleanLE = (actual: unknown): BooleanLE => leafE({ _tag: 'BooleanE', actual })
export interface booleanUD extends Decoder<unknown, BooleanLE, boolean> {
  readonly _tag: 'booleanUD'
}
const isBoolean = (u: unknown): u is boolean => typeof u === 'boolean'
export const boolean: booleanUD = {
  _tag: 'booleanUD',
  decode: (u) => (isBoolean(u) ? right(u) : left(booleanLE(u)))
}

export interface UnknownArrayE extends ActualE<unknown> {
  readonly _tag: 'UnknownArrayE'
}
export interface UnknownArrayLE extends LeafE<UnknownArrayE> {}
export const unknownArrayE = (actual: unknown): UnknownArrayLE =>
  leafE({
    _tag: 'UnknownArrayE',
    actual
  })
export interface UnknownArrayUD extends Decoder<unknown, UnknownArrayLE, Array<unknown>> {
  readonly _tag: 'UnknownArrayUD'
}
export const UnknownArray: UnknownArrayUD = {
  _tag: 'UnknownArrayUD',
  decode: (u) => (Array.isArray(u) ? right(u) : left(unknownArrayE(u)))
}

export interface UnknownRecordE extends ActualE<unknown> {
  readonly _tag: 'UnknownRecordE'
}
export interface UnknownRecordLE extends LeafE<UnknownRecordE> {}
export const unknownRecordE = (actual: unknown): UnknownRecordLE =>
  leafE({
    _tag: 'UnknownRecordE',
    actual
  })
export interface UnknownRecordUD extends Decoder<unknown, UnknownRecordLE, Record<PropertyKey, unknown>> {
  readonly _tag: 'UnknownRecordUD'
}
const isUnknownRecord = (u: unknown): u is Record<PropertyKey, unknown> =>
  u !== null && typeof u === 'object' && !Array.isArray(u)
export const UnknownRecord: UnknownRecordUD = {
  _tag: 'UnknownRecordUD',
  decode: (u) => (isUnknownRecord(u) ? right(u) : left(unknownRecordE(u)))
}

// -------------------------------------------------------------------------------------
// decoder constructors
// -------------------------------------------------------------------------------------

export const fail = <E>(e: E): Decoder<any, E, any> => ({
  decode: () => left(e)
})

export type Literal = string | number | boolean | null | symbol

export interface LiteralE<A extends Literal> extends ActualE<unknown> {
  readonly _tag: 'LiteralE'
  readonly literals: ReadonlyNonEmptyArray<A>
}
export interface LiteralLE<A extends Literal> extends LeafE<LiteralE<A>> {}
export interface LiteralD<A extends ReadonlyNonEmptyArray<Literal>>
  extends Decoder<unknown, LiteralLE<A[number]>, A[number]> {
  readonly _tag: 'LiteralD'
  readonly literals: A
}

export const literal = <A extends ReadonlyNonEmptyArray<Literal>>(...literals: A): LiteralD<A> => ({
  _tag: 'LiteralD',
  literals,
  decode: (u) => right(u as any) // TODO
})

export interface RefinementD<A, E, B extends A> extends Decoder<A, RefinementE<E>, B> {
  readonly _tag: 'RefinementD'
  readonly parser: (a: A) => These<E, B>
}

export const refinement = <A, E, B extends A>(parser: (a: A) => These<E, B>): RefinementD<A, E, B> => ({
  _tag: 'RefinementD',
  parser,
  decode: flow(parser, TH.mapLeft(refinementE))
})

export const fromRefinement = <From extends AnyD, B extends TypeOf<From>, E>(
  refinement: Refinement<TypeOf<From>, B>,
  error: (from: TypeOf<From>) => E
): ((from: From) => RefineD<From, E, B>) => refine((a) => (refinement(a) ? right(a) : left(error(a))))

export interface ParserD<A, E, B> extends Decoder<A, ParserE<E>, B> {
  readonly _tag: 'ParserD'
  readonly parser: (a: A) => These<E, B>
}

export const parser = <A, E, B>(parser: (a: A) => These<E, B>): ParserD<A, E, B> => ({
  _tag: 'ParserD',
  parser,
  decode: flow(parser, TH.mapLeft(parserE))
})

// -------------------------------------------------------------------------------------
// decoder combinators
// -------------------------------------------------------------------------------------

export interface FromStructD<Properties>
  extends Decoder<
    { [K in keyof Properties]: InputOf<Properties[K]> },
    StructE<{ readonly [K in keyof Properties]: RequiredKeyE<K, ErrorOf<Properties[K]>> }[keyof Properties]>,
    { [K in keyof Properties]: TypeOf<Properties[K]> }
  > {
  readonly _tag: 'FromStructD'
  readonly properties: Properties
}
export const fromStruct = <Properties extends Record<PropertyKey, AnyD>>(
  properties: Properties
): FromStructD<Properties> => ({
  _tag: 'FromStructD',
  properties,
  decode: (ur) => {
    const es: Array<RequiredKeyE<string, ErrorOf<Properties[keyof Properties]>>> = []
    const ar: any = {}
    let isBoth = true
    for (const k in properties) {
      const de = properties[k].decode(ur[k])
      if (TH.isLeft(de)) {
        isBoth = false
        es.push(requiredKeyE(k, de.left))
      } else if (TH.isRight(de)) {
        ar[k] = de.right
      } else {
        es.push(requiredKeyE(k, de.left))
        ar[k] = de.right
      }
    }
    return RA.isNonEmpty(es) ? (isBoth ? both(structE(es), ar) : left(structE(es))) : right(ar)
  }
})

export interface UnexpectedKeysD<Properties>
  extends Decoder<Record<PropertyKey, unknown>, UnexpectedKeysE, Partial<{ [K in keyof Properties]: unknown }>> {
  readonly _tag: 'UnexpectedKeysD'
  readonly properties: Properties
}
export const unexpectedKeys = <Properties extends Record<string, unknown>>(
  properties: Properties
): UnexpectedKeysD<Properties> => {
  return {
    _tag: 'UnexpectedKeysD',
    properties,
    decode: (ur) => {
      const es: Array<string> = []
      const out: any = {}
      for (const k in properties) {
        if (k in ur) {
          out[k] = ur[k]
        }
      }
      for (const k in ur) {
        if (!(k in out)) {
          es.push(k)
        }
      }
      return RA.isNonEmpty(es) ? both(unexpectedKeysE(es), out) : right(ur)
    }
  }
}

export interface MissingKeysD<Properties>
  extends Decoder<Partial<{ [K in keyof Properties]: unknown }>, MissingKeysE, { [K in keyof Properties]: unknown }> {
  readonly _tag: 'MissingKeysD'
  readonly properties: Properties
}
export const missingKeys = <Properties extends Record<string, unknown>>(
  properties: Properties
): MissingKeysD<Properties> => {
  return {
    _tag: 'MissingKeysD',
    properties,
    decode: (ur) => {
      const es: Array<string> = []
      for (const k in properties) {
        if (!(k in ur)) {
          es.push(k)
        }
      }
      return RA.isNonEmpty(es) ? left(missingKeysE(es)) : right(ur as any)
    }
  }
}

export interface StructD<Properties>
  extends CompositionD<
    CompositionD<CompositionD<UnknownRecordUD, UnexpectedKeysD<Properties>>, MissingKeysD<Properties>>,
    FromStructD<Properties>
  > {}

export function struct<Properties extends Record<PropertyKey, AnyUD>>(properties: Properties): StructD<Properties>
export function struct(properties: Record<PropertyKey, AnyUD>): StructD<typeof properties> {
  return pipe(
    UnknownRecord, // unknown -> Record<PropertyKey, unknown>
    compose(unexpectedKeys(properties)), // Record<PropertyKey, unknown> -> { a?: unknown, b?: unknown, ... }
    compose(missingKeys(properties)), // { a?: unknown, b?: unknown, ... } -> { a: unknown, b: unknown, ..., }
    compose(fromStruct(properties)) // { a: unknown, b: unknown, ..., } -> { a: string, b: number, ... }
  )
}

export interface FromPartialD<Properties>
  extends Decoder<
    Partial<{ [K in keyof Properties]: InputOf<Properties[K]> }>,
    PartialE<{ readonly [K in keyof Properties]: OptionalKeyE<K, ErrorOf<Properties[K]>> }[keyof Properties]>,
    Partial<{ [K in keyof Properties]: TypeOf<Properties[K]> }>
  > {
  readonly _tag: 'FromPartialD'
  readonly properties: Properties
}
export const fromPartial = <Properties extends Record<PropertyKey, AnyD>>(
  properties: Properties
): FromPartialD<Properties> => ({
  _tag: 'FromPartialD',
  properties,
  decode: (ur) => {
    const es: Array<OptionalKeyE<string, ErrorOf<Properties[keyof Properties]>>> = []
    const ar: any = {}
    let isBoth = true
    for (const k in properties) {
      if (!(k in ur)) {
        continue
      }
      if (ur[k] === undefined) {
        ar[k] = undefined
        continue
      }
      const de = properties[k].decode(ur[k])
      if (TH.isLeft(de)) {
        isBoth = false
        es.push(optionalKeyE(k, de.left))
      } else if (TH.isRight(de)) {
        ar[k] = de.right
      } else {
        es.push(optionalKeyE(k, de.left))
        ar[k] = de.right
      }
    }
    return RA.isNonEmpty(es) ? (isBoth ? both(partialE(es), ar) : left(partialE(es))) : right(ar)
  }
})

export interface PartialD<Properties>
  extends CompositionD<CompositionD<UnknownRecordUD, UnexpectedKeysD<Properties>>, FromPartialD<Properties>> {}

export function partial<Properties extends Record<PropertyKey, AnyUD>>(properties: Properties): PartialD<Properties>
export function partial(properties: Record<PropertyKey, AnyUD>): PartialD<typeof properties> {
  return pipe(UnknownRecord, compose(unexpectedKeys(properties)), compose(fromPartial(properties)))
}

export interface FromTupleD<Components extends ReadonlyArray<AnyD>>
  extends Decoder<
    { readonly [K in keyof Components]: InputOf<Components[K]> },
    TupleE<{ [K in keyof Components]: RequiredIndexE<K, ErrorOf<Components[K]>> }[number]>,
    { [K in keyof Components]: TypeOf<Components[K]> }
  > {
  readonly _tag: 'FromTupleD'
  readonly components: Components
}
export const fromTuple = <Components extends ReadonlyArray<AnyD>>(
  ...components: Components
): FromTupleD<Components> => ({
  _tag: 'FromTupleD',
  components,
  decode: (us) => {
    const es: Array<RequiredIndexE<number, ErrorOf<Components[number]>>> = []
    const as: any = []
    let isBoth = true
    for (let index = 0; index < components.length; index++) {
      const de = components[index].decode(us[index])
      if (TH.isLeft(de)) {
        isBoth = false
        es.push(requiredIndexE(index, de.left))
      } else if (TH.isRight(de)) {
        as[index] = de.right
      } else {
        es.push(requiredIndexE(index, de.left))
        as[index] = de.right
      }
    }
    return RA.isNonEmpty(es) ? (isBoth ? both(tupleE(es), as) : left(tupleE(es))) : right(as)
  }
})

export interface UnexpectedIndexesD<Components>
  extends Decoder<Array<unknown>, UnexpectedIndexesE, { [K in keyof Components]?: unknown }> {
  readonly _tag: 'UnexpectedIndexesD'
  readonly components: Components
}

export const unexpectedIndexes = <Components extends ReadonlyArray<unknown>>(
  ...components: Components
): UnexpectedIndexesD<Components> => {
  return {
    _tag: 'UnexpectedIndexesD',
    components,
    decode: (us) => {
      const es: Array<number> = []
      for (let index = components.length; index < us.length; index++) {
        es.push(index)
      }
      return RA.isNonEmpty(es) ? both(unexpectedIndexesE(es), us.slice(0, components.length) as any) : right(us)
    }
  }
}

export interface MissingIndexesD<Components>
  extends Decoder<
    { readonly [K in keyof Components]?: unknown },
    MissingIndexesE,
    { [K in keyof Components]: unknown }
  > {
  readonly _tag: 'MissingIndexesD'
  readonly components: Components
}
export const missingIndexes = <Components extends ReadonlyArray<unknown>>(
  ...components: Components
): MissingIndexesD<Components> => {
  return {
    _tag: 'MissingIndexesD',
    components,
    decode: (us) => {
      const es: Array<number> = []
      const len = us.length
      for (let index = 0; index < components.length; index++) {
        if (len < index) {
          es.push(index)
        }
      }
      return RA.isNonEmpty(es) ? left(missingIndexesE(es)) : right(us as any)
    }
  }
}

export interface TupleD<Components extends ReadonlyArray<AnyUD>>
  extends CompositionD<
    CompositionD<CompositionD<UnknownArrayUD, UnexpectedIndexesD<Components>>, MissingIndexesD<Components>>,
    FromTupleD<Components>
  > {}

export function tuple<Components extends ReadonlyArray<AnyUD>>(...cs: Components): TupleD<Components>
export function tuple(...cs: ReadonlyArray<AnyUD>): TupleD<typeof cs> {
  return pipe(
    UnknownArray, // unknown -> Array<unknown>
    compose(unexpectedIndexes(...cs)), // Array<unknown> -> [unknown?, unknown?, ...]
    compose(missingIndexes(...cs)), // [unknown?, unknown?, ...] -> [unknown, unknown, ...]
    compose(fromTuple(...cs)) // [unknown, unknown, ...] -> [string, number, ...]
  )
}

export interface FromArrayD<Item>
  extends Decoder<Array<InputOf<Item>>, ArrayE<OptionalIndexE<number, ErrorOf<Item>>>, Array<TypeOf<Item>>> {
  readonly _tag: 'FromArrayD'
  readonly item: Item
}

export function fromArray<Item extends AnyD>(item: Item): FromArrayD<Item>
export function fromArray<I, E, A>(item: Decoder<I, E, A>): FromArrayD<typeof item> {
  return {
    _tag: 'FromArrayD',
    item,
    decode: (us) => {
      const es: Array<OptionalIndexE<number, ErrorOf<typeof item>>> = []
      const as: Array<A> = []
      let isBoth = true
      for (let index = 0; index < us.length; index++) {
        const de = item.decode(us[index])
        if (TH.isLeft(de)) {
          isBoth = false
          es.push(optionalIndexE(index, de.left))
        } else if (TH.isRight(de)) {
          as[index] = de.right
        } else {
          es.push(optionalIndexE(index, de.left))
          as[index] = de.right
        }
      }
      if (RA.isNonEmpty(es)) {
        return isBoth ? both(arrayE(es), as) : left(arrayE(es))
      }
      return right(as)
    }
  }
}

export interface ArrayD<Item> extends CompositionD<UnknownArrayUD, FromArrayD<Item>> {}
export function array<Item extends AnyUD>(item: Item): CompositionD<UnknownArrayUD, FromArrayD<Item>>
export function array<E, A>(item: Decoder<unknown, E, A>): ArrayD<typeof item> {
  return pipe(UnknownArray, compose(fromArray(item)))
}

export interface FromRecordD<Codomain>
  extends Decoder<
    Record<PropertyKey, InputOf<Codomain>>,
    RecordE<RequiredKeyE<string, ErrorOf<Codomain>>>,
    Record<PropertyKey, TypeOf<Codomain>>
  > {
  readonly _tag: 'FromRecordD'
  readonly codomain: Codomain
}
export declare const fromRecord: <Codomain extends AnyD>(codomain: Codomain) => FromRecordD<Codomain>

export interface RecordD<Codomain> extends CompositionD<UnknownRecordUD, FromRecordD<Codomain>> {}
export function record<Codomain extends AnyUD>(codomain: Codomain): CompositionD<UnknownRecordUD, FromRecordD<Codomain>>
export function record<E, A>(codomain: Decoder<unknown, E, A>): RecordD<typeof codomain> {
  return pipe(UnknownRecord, compose(fromRecord(codomain)))
}

export interface RefineD<From, E, B extends TypeOf<From>> extends CompositionD<From, RefinementD<TypeOf<From>, E, B>> {}

export function refine<From extends AnyD, E, B extends TypeOf<From>>(
  parser: (a: TypeOf<From>) => These<E, B>
): (from: From) => RefineD<From, E, B>
export function refine<A, E2, B extends A>(
  parser: (a: A) => These<E2, B>
): <I, E1>(from: Decoder<I, E1, A>) => RefineD<typeof from, E2, B> {
  return compose(refinement(parser))
}

export interface ParseD<From, E, B> extends CompositionD<From, ParserD<TypeOf<From>, E, B>> {}

export function parse<From extends AnyD, E, B>(
  parser: (a: TypeOf<From>) => These<E, B>
): (from: From) => ParseD<From, E, B>
export function parse<A, E, B>(
  p: (a: A) => These<E, B>
): <I, E1>(from: Decoder<I, E1, A>) => ParseD<typeof from, E, B> {
  return compose(parser(p))
}

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

const append = <A>(end: A) => (init: ReadonlyArray<A>): ReadonlyNonEmptyArray<A> =>
  RA.isNonEmpty(init) ? [init[0], ...init.slice(1), end] : [end]

export interface UnionD<Members extends ReadonlyArray<AnyD>>
  extends Decoder<
    UnionToIntersection<InputOf<Members[number]>>,
    UnionE<{ [K in keyof Members]: MemberE<K, ErrorOf<Members[K]>> }[number]>,
    TypeOf<Members[keyof Members]>
  > {
  readonly _tag: 'UnionD'
  readonly members: Members
}
export function union<Members extends ReadonlyArray<AnyD>>(...members: Members): UnionD<Members> {
  return {
    _tag: 'UnionD',
    members,
    decode: (i) => {
      const es: Array<MemberE<number, ErrorOf<Members[number]>>> = []
      for (let m = 0; m < members.length; m++) {
        const de = members[m].decode(i)
        if (TH.isLeft(de)) {
          es.push(memberE(String(m) as any, de.left))
        } else {
          return pipe(
            de,
            TH.mapLeft((e) => unionE(pipe(es, append(memberE(String(m) as any, e)))))
          )
        }
      }
      return RA.isNonEmpty(es) ? left(unionE(es)) : right(i)
    }
  }
}

export interface NullableD<D> extends Decoder<null | InputOf<D>, NullableE<ErrorOf<D>>, null | TypeOf<D>> {
  readonly _tag: 'NullableD'
  readonly decoder: D
}
export declare const nullable: <D extends AnyD>(decoder: D) => NullableD<D>

export interface IntersectD<F, S>
  extends Decoder<
    InputOf<F> & InputOf<S>,
    IntersectionE<MemberE<0, ErrorOf<F>> | MemberE<1, ErrorOf<S>>>,
    TypeOf<F> & TypeOf<S>
  > {
  readonly _tag: 'IntersectD'
  readonly first: F
  readonly second: S
}

export type Prunable = ReadonlyArray<string>

const collectPrunable = <E>(de: DecodeError<E>): Prunable => {
  const go = (de: DecodeError<E>): Prunable => {
    switch (de._tag) {
      case 'ArrayE':
      case 'CompositionE':
      case 'IntersectionE':
      case 'PartialE':
      case 'RecordE':
      case 'StructE':
      case 'SumE':
      case 'TupleE':
      case 'UnionE':
        return pipe(de.errors, RA.chain(go))
      case 'LazyE':
      case 'MemberE':
      case 'NextE':
      case 'NullableE':
      case 'ParserE':
      case 'PrevE':
      case 'RefinementE':
      case 'TagE':
        return go(de.error)
      case 'LeafE':
      case 'MissingIndexesE':
      case 'MissingKeysE':
        return RA.empty
      case 'OptionalIndexE':
        return go(de.error).map((s) => String(de.index) + '.' + s)
      case 'OptionalKeyE':
        return go(de.error).map((s) => de.key + '.' + s)
      case 'RequiredIndexE':
        return go(de.error).map((s) => String(de.index) + '.' + s)
      case 'RequiredKeyE':
        return go(de.error).map((s) => de.key + '.' + s)
      case 'UnexpectedIndexesE':
        return de.indexes.map(String)
      case 'UnexpectedKeysE':
        return de.keys
    }
  }
  return go(de)
}

const make = <E>(constructor: (errors: RNEA.ReadonlyNonEmptyArray<DecodeError<E>>) => DecodeError<E>) => (
  pdes: ReadonlyArray<DecodeError<E>>
): O.Option<DecodeError<E>> => (RA.isNonEmpty(pdes) ? O.some(constructor(pdes)) : O.none)

const prune = (prunable: Prunable, anticollision: string): (<E>(de: DecodeError<E>) => O.Option<DecodeError<E>>) => {
  const go = <E>(de: DecodeError<E>): O.Option<DecodeError<E>> => {
    switch (de._tag) {
      case 'ArrayE':
        return pipe(de.errors, RA.filterMap(prune(prunable, anticollision)), make(arrayE))
      case 'CompositionE':
        return pipe(de.errors, RA.filterMap(prune(prunable, anticollision)), make(compositionE))
      case 'IntersectionE':
        return pipe(de.errors, RA.filterMap(prune(prunable, anticollision)), make(intersectionE))
      case 'PartialE':
        return pipe(de.errors, RA.filterMap(prune(prunable, anticollision)), make(partialE))
      case 'RecordE':
        return pipe(de.errors, RA.filterMap(prune(prunable, anticollision)), make(recordE))
      case 'StructE':
        return pipe(de.errors, RA.filterMap(prune(prunable, anticollision)), make(structE))
      case 'SumE':
        return pipe(de.errors, RA.filterMap(prune(prunable, anticollision)), make(sumE))
      case 'TupleE':
        return pipe(de.errors, RA.filterMap(prune(prunable, anticollision)), make(tupleE))
      case 'UnionE':
        return pipe(de.errors, RA.filterMap(prune(prunable, anticollision)), make(unionE))
      case 'NextE':
        return pipe(de.error, prune(prunable, anticollision), O.map(nextE))
      case 'NullableE':
        return pipe(de.error, prune(prunable, anticollision), O.map(nullableE))
      case 'ParserE':
        return pipe(de.error, prune(prunable, anticollision), O.map(parserE))
      case 'PrevE':
        return pipe(de.error, prune(prunable, anticollision), O.map(prevE))
      case 'RefinementE':
        return pipe(de.error, prune(prunable, anticollision), O.map(refinementE))
      case 'LazyE':
        return pipe(
          de.error,
          prune(prunable, anticollision),
          O.map((pde) => lazyE(de.id, pde))
        )
      case 'LeafE':
      case 'MissingIndexesE':
      case 'MissingKeysE':
        return O.some(de)
      case 'MemberE':
        return pipe(
          de.error,
          prune(prunable, anticollision),
          O.map((pde) => memberE(de.member, pde))
        )
      case 'OptionalIndexE': {
        return pipe(
          de.error,
          prune(prunable, anticollision + de.index + '.'),
          O.map((pde) => optionalIndexE(de.index, pde))
        )
      }
      case 'OptionalKeyE': {
        return pipe(
          de.error,
          prune(prunable, anticollision + de.key + '.'),
          O.map((pde) => optionalKeyE(de.key, pde))
        )
      }
      case 'RequiredIndexE': {
        return pipe(
          de.error,
          prune(prunable, anticollision + de.index + '.'),
          O.map((pde) => requiredIndexE(de.index, pde))
        )
      }
      case 'RequiredKeyE': {
        return pipe(
          de.error,
          prune(prunable, anticollision + de.key + '.'),
          O.map((pde) => requiredKeyE(de.key, pde))
        )
      }
      case 'TagE': {
        return pipe(
          de.error,
          prune(prunable, anticollision),
          O.map((pde) => tagE(de.tag, pde))
        )
      }
      case 'UnexpectedIndexesE':
        const pindexes = de.indexes.filter((index) => prunable.indexOf(anticollision + String(index)) !== -1)
        return RA.isNonEmpty(pindexes) ? O.some(unexpectedIndexesE(pindexes)) : O.none
      case 'UnexpectedKeysE': {
        const pkeys = de.keys.filter((key) => prunable.indexOf(anticollision + key) !== -1)
        return RA.isNonEmpty(pkeys) ? O.some(unexpectedKeysE(pkeys)) : O.none
      }
    }
  }
  return go
}

const pruneAllUnexpected: <E>(de: DecodeError<E>) => O.Option<DecodeError<E>> = prune(RA.empty, '')

const pruneDifference = <E1, E2>(
  de1: DecodeError<E1>,
  de2: DecodeError<E2>
): O.Option<IntersectionE<MemberE<0, DecodeError<E1>> | MemberE<1, DecodeError<E2>>>> => {
  const pde1 = pipe(de1, prune(collectPrunable(de2), ''))
  const pde2 = pipe(de2, prune(collectPrunable(de1), ''))
  if (O.isSome(pde1)) {
    return O.isSome(pde2)
      ? O.some(intersectionE([memberE(0, pde1.value), memberE(1, pde2.value)]))
      : O.some(intersectionE([memberE(0, pde1.value)]))
  }
  return O.isSome(pde2) ? O.some(intersectionE([memberE(1, pde2.value)])) : O.none
}

export interface IntersecableRecord extends Record<string, Intersecable> {}
export interface IntersecableArray extends Array<Intersecable> {}
export type Intersecable = string | number | IntersecableRecord | IntersecableArray

const intersect_ = <A extends Intersecable, B extends Intersecable>(a: A, b: B): A & B => {
  if (isUnknownRecord(a) && isUnknownRecord(b)) {
    const out: any = { ...(a as any) }
    for (const k in b) {
      if (!(k in out)) {
        out[k] = b[k]
      } else {
        out[k] = intersect_(out[k], b[k] as any)
      }
    }
    return out
  } else if (Array.isArray(a) && Array.isArray(b)) {
    const out: any = a.slice()
    for (let i = 0; i < b.length; i++) {
      if (i >= a.length) {
        out[i] = b[i]
      } else {
        out[i] = intersect_(out[i], b[i])
      }
    }
    return out
  }
  return b as any
}

export function intersect<S extends Decoder<any, DecodeError<any>, Intersecable>>(
  second: S
): <F extends Decoder<any, DecodeError<any>, Intersecable>>(first: F) => IntersectD<F, S>
export function intersect<I2, E2, A2 extends Intersecable>(
  second: Decoder<I2, DecodeError<E2>, A2>
): <I1, E1, A1 extends Intersecable>(
  first: Decoder<I1, DecodeError<E1>, A1>
) => IntersectD<typeof first, typeof second> {
  return <I1, E1, A1 extends Intersecable>(
    first: Decoder<I1, DecodeError<E1>, A1>
  ): IntersectD<typeof first, typeof second> => ({
    _tag: 'IntersectD',
    first,
    second,
    decode: (i) => {
      const out: These<IntersectionE<MemberE<0, DecodeError<E1>> | MemberE<1, DecodeError<E2>>>, A1 & A2> = pipe(
        first.decode(i),
        TH.fold(
          (de1) =>
            pipe(
              second.decode(i),
              TH.fold(
                (de2) => left(intersectionE([memberE(0, de1), memberE(1, de2)])),
                () => left(intersectionE([memberE(0, de1)])),
                (de2) => {
                  const pde2 = pruneAllUnexpected(de2)
                  return O.isSome(pde2)
                    ? left(intersectionE([memberE(0, de1), memberE(1, pde2.value)]))
                    : left(intersectionE([memberE(0, de1)]))
                }
              )
            ),
          (a1) =>
            pipe(
              second.decode(i),
              TH.fold(
                (de2) => left(intersectionE([memberE(1, de2)])),
                (a2) => right(intersect_(a1, a2)),
                (de2, a2) => {
                  const pde2 = pruneAllUnexpected(de2)
                  return O.isSome(pde2)
                    ? both(intersectionE([memberE(1, pde2.value)]), intersect_(a1, a2))
                    : right(intersect_(a1, a2))
                }
              )
            ),
          (de1, a1) =>
            pipe(
              second.decode(i),
              TH.fold(
                (de2) => {
                  const pde1 = pruneAllUnexpected(de1)
                  return O.isSome(pde1)
                    ? left(intersectionE([memberE(0, pde1.value), memberE(1, de2)]))
                    : left(intersectionE([memberE(1, de2)]))
                },
                (a2) => {
                  const pde1 = pruneAllUnexpected(de1)
                  return O.isSome(pde1)
                    ? both(intersectionE([memberE(0, pde1.value)]), intersect_(a1, a2))
                    : right(intersect_(a1, a2))
                },
                (de2, a2) => {
                  const difference = pruneDifference(de1, de2)
                  return O.isSome(difference) ? both(difference.value, intersect_(a1, a2)) : right(intersect_(a1, a2))
                }
              )
            )
        )
      )
      return out
    }
  })
}

export interface LazyD<D> {
  readonly _tag: 'LazyD'
  readonly id: string
  readonly decoder: Lazy<D>
}
export declare const lazy: <I, E, A>(id: string, decoder: Lazy<Decoder<I, E, A>>) => Decoder<I, LazyE<E>, A>

export interface FromSumD<T extends string, Members>
  extends Decoder<
    InputOf<Members[keyof Members]>,
    TagE<T, LiteralE<keyof Members>> | SumE<{ [K in keyof Members]: MemberE<K, ErrorOf<Members[K]>> }[keyof Members]>,
    TypeOf<Members[keyof Members]>
  > {
  readonly _tag: 'FromSumD'
  readonly tag: T
  readonly members: Members
}
// TODO: every `Members` should own a tag field
export declare const fromSum: <T extends string>(
  tag: T
) => <Members extends Record<PropertyKey, AnyD>>(members: Members) => FromSumD<T, Members>

export interface SumD<T extends string, Members>
  extends Decoder<
    unknown,
    | UnknownRecordLE
    | TagE<T, LiteralE<keyof Members>>
    | SumE<{ [K in keyof Members]: MemberE<K, ErrorOf<Members[K]>> }[keyof Members]>,
    TypeOf<Members[keyof Members]>
  > {
  readonly _tag: 'SumD'
  readonly tag: T
  readonly members: Members
}
// TODO: every `Members` should own a tag field
export const sum = <T extends string>(tag: T) => <Members extends Record<PropertyKey, AnyUD>>(
  members: Members
): SumD<T, Members> => ({
  _tag: 'SumD',
  tag,
  members,
  decode: (u) => right(u as any) // TODO
})

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

export const URI = 'io-ts/Decoder-These'

export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind3<R, E, A> {
    readonly [URI]: Decoder<R, E, A>
  }
}

// -------------------------------------------------------------------------------------
// use case: form
// -------------------------------------------------------------------------------------

export const Form = fromStruct({
  name: string,
  age: number
})

// the decode error is fully typed...
// type FormE = StructE<RequiredKeyE<"name", StringLE> | RequiredKeyE<"age", NaNLE | NumberLE>>
export type FormE = ErrorOf<typeof Form>

// ...this means that you can pattern match on the error
export const formatFormMessages = (de: FormE): string =>
  de.errors
    .map((e): string => {
      switch (e.key) {
        case 'name':
          return 'invalid name'
        case 'age':
          return 'invalid age'
      }
    })
    .join(', ')

// pipe(Form.decode({ name: null, age: null }), TH.mapLeft(formatErroMessages), console.log)
// => left('invalid name, invalid age')

export const NestedForm = fromStruct({
  a: string,
  b: number,
  c: fromStruct({
    d: boolean
  })
})

// type NestedFormE = StructE<RequiredKeyE<"a", StringLE> | RequiredKeyE<"b", NaNLE | NumberLE> | RequiredKeyE<"c", StructE<RequiredKeyE<"d", BooleanLE>>>>
export type NestedFormE = ErrorOf<typeof NestedForm>

export const formatNestedFormMessages = (de: NestedFormE): string =>
  de.errors
    .map((e): string => {
      switch (e.key) {
        case 'a':
          return 'invalid a'
        case 'b':
          return 'invalid b'
        case 'c':
          return e.error.errors
            .map((e): string => {
              switch (e.key) {
                case 'd':
                  return 'invalid d'
              }
            })
            .join(', ')
      }
    })
    .join(', ')

// -------------------------------------------------------------------------------------
// use case: handling a generic error, for example encoding to a Tree<string>
// -------------------------------------------------------------------------------------

export type Forest<A> = ReadonlyArray<Tree<A>>

export interface Tree<A> {
  readonly value: A
  readonly forest: Forest<A>
}

const empty: ReadonlyArray<never> = []

const tree = <A>(value: A, forest: Forest<A> = empty): Tree<A> => ({
  value,
  forest
})

export const toTreeWith = <E>(toTree: (e: E) => Tree<string>): ((de: DecodeError<E>) => Tree<string>) => {
  const go = (de: DecodeError<E>): Tree<string> => {
    switch (de._tag) {
      case 'MissingIndexesE':
        return tree(
          `${de.indexes.length} error(s) found while checking indexes`,
          de.indexes.map((index) => tree(`missing required index ${JSON.stringify(index)}`))
        )
      case 'MissingKeysE':
        return tree(
          `${de.keys.length} error(s) found while checking keys`,
          de.keys.map((key) => tree(`missing required key ${JSON.stringify(key)}`))
        )
      case 'UnexpectedIndexesE':
        return tree(
          `${de.indexes.length} error(s) found while checking indexes`,
          de.indexes.map((index) => tree(`unexpected index ${JSON.stringify(index)}`))
        )
      case 'UnexpectedKeysE':
        return tree(
          `${de.keys.length} error(s) found while checking keys`,
          de.keys.map((key) => tree(`unexpected key ${JSON.stringify(key)}`))
        )

      // simple singles
      case 'LeafE':
        return toTree(de.error)
      case 'RefinementE':
        return tree(`1 error(s) found while decoding a refinement`, [go(de.error)])
      case 'ParserE':
        return tree(`1 error(s) found while decoding a parser`, [go(de.error)])
      case 'NullableE':
        return tree(`1 error(s) found while decoding a nullable`, [go(de.error)])
      case 'PrevE':
      case 'NextE':
        return go(de.error)

      // customized singles
      case 'RequiredIndexE':
        return tree(`1 error(s) found while decoding required component ${de.index}`, [go(de.error)])
      case 'OptionalIndexE':
        return tree(`1 error(s) found while decoding optional index ${de.index}`, [go(de.error)])
      case 'RequiredKeyE':
        return tree(`1 error(s) found while decoding required key ${JSON.stringify(de.key)}`, [go(de.error)])
      case 'OptionalKeyE':
        return tree(`1 error(s) found while decoding optional key ${JSON.stringify(de.key)}`, [go(de.error)])
      case 'MemberE':
        return tree(`1 error(s) found while decoding member ${JSON.stringify(de.member)}`, [go(de.error)])
      case 'TagE':
        return tree(`1 error(s) found while decoding sum tag ${de.tag}`, [go(de.error)])
      case 'LazyE':
        return tree(`1 error(s) found while decoding lazy decoder ${de.id}`, [go(de.error)])

      // compounds
      case 'ArrayE':
        return tree(`${de.errors.length} error(s) found while decoding an array`, de.errors.map(go))
      case 'RecordE':
        return tree(`${de.errors.length} error(s) found while decoding a record`, de.errors.map(go))
      case 'TupleE':
        return tree(`${de.errors.length} error(s) found while decoding a tuple`, de.errors.map(go))
      case 'StructE':
        return tree(`${de.errors.length} error(s) found while decoding a struct`, de.errors.map(go))
      case 'PartialE':
        return tree(`${de.errors.length} error(s) found while decoding a partial`, de.errors.map(go))
      case 'UnionE':
        return tree(`${de.errors.length} error(s) found while decoding a union`, de.errors.map(go))
      case 'IntersectionE':
        return tree(`${de.errors.length} error(s) found while decoding an intersection`, de.errors.map(go))
      case 'SumE':
        return tree(`${de.errors.length} error(s) found while decoding a sum`, de.errors.map(go))
      case 'CompositionE':
        return de.errors.length === 1
          ? go(de.errors[0]) // less noise in the output if there's only one error
          : tree(`${de.errors.length} error(s) found while decoding a composition`, de.errors.map(go))
    }
  }
  return go
}

export const toTreeBuiltin = (de: BuiltinE): Tree<string> => {
  switch (de._tag) {
    case 'StringE':
      return tree(`cannot decode ${JSON.stringify(de.actual)}, expected a string`)
    case 'NumberE':
      return tree(`cannot decode ${JSON.stringify(de.actual)}, expected a number`)
    case 'BooleanE':
      return tree(`cannot decode ${JSON.stringify(de.actual)}, expected a boolean`)
    case 'UnknownArrayE':
      return tree(`cannot decode ${JSON.stringify(de.actual)}, expected an array`)
    case 'UnknownRecordE':
      return tree(`cannot decode ${JSON.stringify(de.actual)}, expected an object`)
    case 'LiteralE':
      return tree(
        `cannot decode ${JSON.stringify(de.actual)}, expected one of ${de.literals
          .map((literal) => JSON.stringify(literal))
          .join(', ')}`
      )
    case 'MessageE':
      return tree(de.message)
    case 'NaNE':
      return tree('value is NaN')
  }
}

const drawTree = (tree: Tree<string>): string => tree.value + drawForest('\n', tree.forest)

const drawForest = (indentation: string, forest: ReadonlyArray<Tree<string>>): string => {
  let r = ''
  const len = forest.length
  let tree: Tree<string>
  for (let i = 0; i < len; i++) {
    tree = forest[i]
    const isLast = i === len - 1
    r += indentation + (isLast ? '└' : '├') + '─ ' + tree.value
    r += drawForest(indentation + (len > 1 && !isLast ? '│  ' : '   '), tree.forest)
  }
  return r
}

const toTree = toTreeWith(toTreeBuiltin)

export const draw = TH.mapLeft(flow(toTree, drawTree))

// -------------------------------------------------------------------------------------
// draw utils
// -------------------------------------------------------------------------------------

const printValue = <A>(a: A): string =>
  'Value:\n' + (typeof a === 'number' && isNaN(a) ? 'NaN' : JSON.stringify(a, null, 2))
const printErrors = (s: string): string => (s === '' ? s : 'Errors:\n' + s)
const printWarnings = (s: string): string => (s === '' ? s : 'Warnings:\n' + s)

export const print = TH.fold(printErrors, printValue, (e, a) => printValue(a) + '\n' + printWarnings(e))

// example 1
// pipe(Form.decode({ name: null, age: null }), draw, print, console.log)
/*
Errors:
2 error(s) found while decoding a struct
├─ 1 error(s) found while decoding required key "name"
│  └─ cannot decode null, expected a string
└─ 1 error(s) found while decoding required key "age"
   └─ cannot decode null, expected a number
*/

// what if the decoder contains a custom error?

// example 2
export interface IntBrand {
  readonly Int: unique symbol
}
export type Int = number & IntBrand
export interface IntE extends ActualE<number> {
  readonly _tag: 'IntE'
}
export const intE = (actual: number): IntE => ({ _tag: 'IntE', actual })
export const IntD = pipe(
  id<number>(),
  fromRefinement(
    (n): n is Int => Number.isInteger(n),
    (n) => leafE(intE(n))
  )
)
export const IntUD = pipe(number, compose(IntD))
export type IntUDE = ErrorOf<typeof IntUD>

export const Form2 = fromStruct({
  name: string,
  age: IntD
})

// pipe(Form2.decode({ name: null, age: 1.2 }), draw, print, console.log) // <= type error because `IntE` is not handled

// I can define my own `draw` function
export const myDraw = TH.mapLeft(
  flow(
    toTreeWith((e: BuiltinE | IntE) => {
      switch (e._tag) {
        case 'IntE':
          return tree(`cannot decode ${e.actual}, should be an integer`)
        default:
          return toTreeBuiltin(e)
      }
    }),
    drawTree
  )
)

// pipe(Form2.decode({ name: null, age: 1.2 }), myDraw, print, console.log) // <= ok
/*
Errors:
2 error(s) found while decoding a struct
├─ 1 error(s) found while decoding required key "name"
│  └─ cannot decode null, expected a string
└─ 1 error(s) found while decoding required key "age"
   └─ 1 error(s) found while decoding a refinement
      └─ cannot decode 1.2, should be an integer
*/

// -------------------------------------------------------------------------------------
// use case: old decoder, custom error message
// -------------------------------------------------------------------------------------

export const debug = flow(draw, print, console.log)

export const customStringUD = pipe(
  string,
  mapLeft((s) => message(s, `please insert a string`))
)

// pipe(customStringD.decode(null), debug)

// -------------------------------------------------------------------------------------
// use case: new decoder, custom leaf error #578
// -------------------------------------------------------------------------------------

interface NonEmptyStringBrand {
  readonly NonEmptyString: unique symbol
}

export type NonEmptyString = string & NonEmptyStringBrand

export interface NonEmptyStringE extends ActualE<string> {
  readonly _tag: 'NonEmptyStringE'
}
export interface NonEmptyStringLE extends LeafE<NonEmptyStringE> {}

export const NonEmptyStringD = pipe(
  id<string>(),
  fromRefinement(
    (s): s is NonEmptyString => s.length > 0,
    (actual): NonEmptyStringLE => leafE({ _tag: 'NonEmptyStringE', actual })
  )
)

export const NonEmptyStringUD = pipe(string, compose(NonEmptyStringD))
export type NonEmptyStringUDE = ErrorOf<typeof NonEmptyStringUD>

// -------------------------------------------------------------------------------------
// use case: new decoder, custom error message
// -------------------------------------------------------------------------------------

export interface PositiveBrand {
  readonly Positive: unique symbol
}

export type Positive = number & PositiveBrand

export const Positive = pipe(
  number,
  fromRefinement(
    (n): n is Positive => n > 0 || isNaN(n),
    (n) => message(n, `cannot decode ${n}, expected a positive number`)
  )
)
export type PositiveE = ErrorOf<typeof Positive>

// pipe(Positive.decode(NaN), debug)

// -------------------------------------------------------------------------------------
// use case: new decoder, multiple custom messages #487
// -------------------------------------------------------------------------------------

export interface UsernameBrand {
  readonly Username: unique symbol
}

export type Username = string & UsernameBrand

const USERNAME_REGEX = /(a|b)*d/

export const Username = pipe(
  customStringUD,
  refine((s) =>
    s.length < 2
      ? left(message(s, 'too short'))
      : s.length > 4
      ? left(message(s, 'too long'))
      : USERNAME_REGEX.test(s)
      ? left(message(s, 'bad characters'))
      : right(s as Username)
  )
)

// pipe(
//   fromTuple(Username, Username, Username, Username, Username).decode([null, 'a', 'bbbbb', 'abd', 'ok']),
//   draw,
//   print,
//   console.log
// )

// -------------------------------------------------------------------------------------
// use case: reflection, for example generating a match function from a sum
// -------------------------------------------------------------------------------------

export const getMatch = <T extends string, Members extends Record<PropertyKey, AnyD>>(decoder: {
  readonly tag: T
  readonly members: Members
}) => <B>(patterns: { [K in keyof Members]: (member: TypeOf<Members[K]>) => B }) => (
  a: TypeOf<Members[keyof Members]>
): B => patterns[a[decoder.tag]](a)

export const matchDecoder = sum('type')({
  A: struct({ type: literal('A'), a: string }),
  B: struct({ type: literal('B'), b: number })
})

export const mymatch = getMatch(matchDecoder)

// pipe(
//   { type: 'A', a: 'a' },
//   mymatch({
//     A: ({ a }) => `A: ${a}`,
//     B: ({ b }) => `B: ${b}`
//   }),
//   console.log
// )
// A: a

// -------------------------------------------------------------------------------------
// use case: fail on any warning
// -------------------------------------------------------------------------------------

export interface CondemnD<D> extends Decoder<InputOf<D>, ErrorOf<D>, TypeOf<D>> {
  readonly _tag: 'CondemnD'
  readonly decoder: D
}

export function condemn<D extends AnyD>(decoder: D): CondemnD<D>
export function condemn<I, E, A>(decoder: Decoder<I, E, A>): CondemnD<typeof decoder> {
  return {
    _tag: 'CondemnD',
    decoder,
    decode: (i) => {
      const de = decoder.decode(i)
      return TH.isBoth(de) ? left(de.left) : de
    }
  }
}

// pipe(number.decode(NaN), debug)
/*
Value:
NaN
Warnings:
value is NaN
*/

export const mynumber = condemn(number)
// pipe(mynumber.decode(NaN), debug)
/*
Errors:
value is NaN
*/

// -------------------------------------------------------------------------------------
// use case: fail on a specific warning, for example NaN
// -------------------------------------------------------------------------------------

const shouldCondemnWhen = <E>(
  predicate: (e: E | UnexpectedKeysE | UnexpectedIndexesE) => boolean
): ((de: DecodeError<E>) => boolean) => {
  const go = (de: DecodeError<E>): boolean => {
    switch (de._tag) {
      case 'ArrayE':
      case 'CompositionE':
      case 'PartialE':
      case 'StructE':
      case 'IntersectionE':
      case 'TupleE':
      case 'UnionE':
      case 'RecordE':
      case 'SumE':
        return de.errors.some(go)
      case 'PrevE':
      case 'NextE':
      case 'RequiredKeyE':
      case 'MemberE':
      case 'NullableE':
      case 'RefinementE':
      case 'ParserE':
      case 'OptionalKeyE':
      case 'RequiredIndexE':
      case 'OptionalIndexE':
      case 'TagE':
      case 'LazyE':
        return go(de.error)
      case 'UnexpectedIndexesE':
      case 'UnexpectedKeysE':
        return predicate(de)
      case 'LeafE':
        return predicate(de.error)
      case 'MissingKeysE':
      case 'MissingIndexesE':
        return false
    }
  }
  return go
}

export const condemnWhen = <E>(
  predicate: (e: E | UnexpectedKeysE | UnexpectedIndexesE) => boolean
): (<A>(result: These<DecodeError<E>, A>) => These<DecodeError<E>, A>) => {
  const should = shouldCondemnWhen(predicate)
  const go = <A>(result: These<DecodeError<E>, A>): These<DecodeError<E>, A> => {
    if (TH.isBoth(result)) {
      const de = result.left
      if (should(de)) {
        return left(de)
      }
    }
    return result
  }
  return go
}

export interface EndoD<D> extends Decoder<InputOf<D>, ErrorOf<D>, TypeOf<D>> {
  readonly _tag: 'EndoD'
  readonly decoder: D
  readonly endo: (result: These<ErrorOf<D>, TypeOf<D>>) => These<ErrorOf<D>, TypeOf<D>>
}

export function endo<E>(
  endo: <A>(result: These<DecodeError<E>, A>) => These<DecodeError<E>, A>
): <D extends Decoder<any, DecodeError<E>, any>>(decoder: D) => EndoD<D>
export function endo<E>(
  endo: <A>(result: These<DecodeError<E>, A>) => These<DecodeError<E>, A>
): <I, A>(decoder: Decoder<I, DecodeError<E>, A>) => EndoD<typeof decoder> {
  return (decoder) => ({
    _tag: 'EndoD',
    decoder,
    endo,
    decode: flow(decoder.decode, endo)
  })
}

export const nan = endo(condemnWhen((e: BuiltinE | UnexpectedKeysE | UnexpectedIndexesE) => e._tag === 'NaNE'))

export const condemned1 = nan(struct({ a: number }))
export const condemned2 = struct({ a: nan(number) })

// pipe(condemned1.decode({ a: NaN }), debug)
/*
Errors:
1 error(s) found while decoding a struct
└─ 1 error(s) found while decoding required key "a"
   └─ value is NaN
*/
// pipe(condemned2.decode({ a: NaN }), debug)
/*
Errors:
1 error(s) found while decoding a struct
└─ 1 error(s) found while decoding required key "a"
   └─ value is NaN
*/

// -------------------------------------------------------------------------------------
// use case: fail on additional props #322
// -------------------------------------------------------------------------------------

// by default additional props are reported as warnings
export const warnOnAdditionalProps = struct({
  a: string,
  b: struct({
    c: number
  })
})

// pipe(warnOnAdditionalProps.decode({ a: 'a', b: { c: 1, e: 2, f: { h: 3 } }, d: 1 }), debug)
/*
Value:
{
  "a": "a",
  "b": {
    "c": 1
  }
}
Warnings:
2 error(s) found while decoding a composition
├─ 1 error(s) found while checking keys
│  └─ unexpected key "d"
└─ 1 error(s) found while decoding a struct
   └─ 1 error(s) found while decoding required key "b"
      └─ 2 error(s) found while checking keys
         ├─ unexpected key "e"
         └─ unexpected key "f"
*/

export const exactD = endo(
  condemnWhen(
    (e: BuiltinE | UnexpectedKeysE | UnexpectedIndexesE) =>
      e._tag === 'UnexpectedKeysE' || e._tag === 'UnexpectedIndexesE'
  )
)

export const failOnAdditionalProps = exactD(warnOnAdditionalProps)

// pipe(failOnAdditionalProps.decode({ a: 'a', b: { c: 1, e: 2, f: { h: 3 } }, d: 1 }), debug)
/*
Errors:
2 error(s) found while decoding a composition
├─ 1 error(s) found while checking keys
│  └─ unexpected key "d"
└─ 1 error(s) found while decoding a struct
   └─ 1 error(s) found while decoding required key "b"
      └─ 2 error(s) found while checking keys
         ├─ unexpected key "e"
         └─ unexpected key "f"
*/

// -------------------------------------------------------------------------------------
// use case: exact + intersection
// -------------------------------------------------------------------------------------

// exact decoders don't play well with intersections
export const I1 = pipe(struct({ a: string }), exactD)
export const I2 = pipe(struct({ b: number }), exactD)
export const I12 = pipe(I1, intersect(I2))
// pipe(I12.decode({ a: 'a', b: 1 }), debug)
/*
2 error(s) found while decoding an intersection
├─ 1 error(s) found while decoding member 0
│  └─ 1 error(s) found while checking keys
│     └─ unexpected key "b"
└─ 1 error(s) found while decoding member 1
   └─ 1 error(s) found while checking keys
      └─ unexpected key "a"
*/

/*

solution: you write your decoders without worrying about additional props / indices,
then at the top level when you use them to decode you get a `These` result:

- if it's a Right, everything is fine and you get your expected output
- if it's a Left, there's a blocking error and you get nothing
- if it's a Both (i.e. you can get the output but there are warnings too) you can choose, by ispecting the left side,
  whether you want to "absolve" the Both to a Right or "condemn" to a Left

*/

export const exact = condemnWhen(
  (e: BuiltinE | UnexpectedKeysE | UnexpectedIndexesE) =>
    e._tag === 'UnexpectedKeysE' || e._tag === 'UnexpectedIndexesE'
)

export const I3 = struct({ a: string })
export const I4 = struct({ b: number })
export const I34 = pipe(I3, intersect(I4))
// pipe(I34.decode({ a: 'a', b: 1 }), debug)
/*
Value:
{
  "a": "a",
  "b": 1
}
*/

// pipe(I34.decode({ a: 'a', b: 1, c: true }), debug)
/*
Value:
{
  "a": "a",
  "b": 1
}
Warnings:
2 error(s) found while decoding an intersection
├─ 1 error(s) found while decoding member 0
│  └─ 1 error(s) found while checking keys
│     └─ unexpected key "c"
└─ 1 error(s) found while decoding member 1
   └─ 1 error(s) found while checking keys
      └─ unexpected key "c"
*/

// pipe(exact(I34.decode({ a: 'a', b: 1, c: true })), debug)
/*
Errors:
2 error(s) found while decoding an intersection
├─ 1 error(s) found while decoding member 0
│  └─ 1 error(s) found while checking keys
│     └─ unexpected key "c"
└─ 1 error(s) found while decoding member 1
   └─ 1 error(s) found while checking keys
      └─ unexpected key "c"
*/

// -------------------------------------------------------------------------------------
// use case: rename a prop #369
// -------------------------------------------------------------------------------------

const RenameOriginal = struct({
  a: string, // <= want to rename this to `c`
  b: number
})

export const Renamed = pipe(
  RenameOriginal,
  map(({ a, ...rest }) => ({ c: a, ...rest }))
)
/*
const Renamed: MapD<StructD<{
    a: stringUD;
    b: numberUD;
}>, {
    b: number;
    c: string;
}>
*/
// pipe(Renamed.decode({ a: 1, b: 2 }), debug)
/*
Errors:
1 error(s) found while decoding a struct
└─ 1 error(s) found while decoding required key "a"
   └─ cannot decode 1, expected a string
*/
// pipe(Renamed.decode({ a: 'a', b: 2 }), debug)
/*
Value:
{
  "c": "a",
  "b": 2
}
*/

// -------------------------------------------------------------------------------------
// use case: omit, pick #553
// -------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------
// use case: readonly by default #525
// -------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------
// use case: more user friendly optional fields #542
// -------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------
// use case: how to encode `Record<'a' | 'b', number>`
// -------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------
// use case: how to encode `Partial<Record<'a' | 'b', number>>`
// -------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------
// use case: how to encode [A, B, ...C]
// -------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------
// use case: how to encode [A, B?]
// -------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------
// use case: #585
// -------------------------------------------------------------------------------------

export const decoder585 = union(struct({ a: string }), struct({ b: number }), struct({}))
// pipe(decoder585.decode({ a: 12 }), debug)
/*
Value:
{}
Warnings:
3 error(s) found while decoding a union
├─ 1 error(s) found while decoding member "0"
│  └─ 1 error(s) found while decoding a struct
│     └─ 1 error(s) found while decoding required key "a"
│        └─ cannot decode 12, expected a string
├─ 1 error(s) found while decoding member "1"
│  └─ 1 error(s) found while checking keys
│     └─ missing required key "b"
└─ 1 error(s) found while decoding member "2"
   └─ 1 error(s) found while checking keys
      └─ unexpected key "a"
*/

// pipe(
//   decoder585.decode({ a: 12 }),
//   condemnWhen(
//     (e: BuiltinE | UnexpectedKeysE | UnexpectedIndexesE) => e._tag === 'UnexpectedKeysE' && e.keys.includes('a')
//   ),
//   debug
// )
/*
Errors:
3 error(s) found while decoding a union
├─ 1 error(s) found while decoding member "0"
│  └─ 1 error(s) found while decoding a struct
│     └─ 1 error(s) found while decoding required key "a"
│        └─ cannot decode 12, expected a string
├─ 1 error(s) found while decoding member "1"
│  └─ 1 error(s) found while checking keys
│     └─ missing required key "b"
└─ 1 error(s) found while decoding member "2"
   └─ 1 error(s) found while checking keys
      └─ unexpected key "a"
*/

export const decoder585Exact = union(struct({ a: string }), struct({ b: number }), exactD(struct({})))
// pipe(decoder585Exact.decode({ a: 12 }), debug)
/*
Errors:
3 error(s) found while decoding a union
├─ 1 error(s) found while decoding member "0"
│  └─ 1 error(s) found while decoding a struct
│     └─ 1 error(s) found while decoding required key "a"
│        └─ cannot decode 12, expected a string
├─ 1 error(s) found while decoding member "1"
│  └─ 1 error(s) found while checking keys
│     └─ missing required key "b"
└─ 1 error(s) found while decoding member "2"
   └─ 1 error(s) found while checking keys
      └─ unexpected key "a"
*/
