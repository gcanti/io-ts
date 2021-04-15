import * as TH from 'fp-ts/lib/These'
import { flow, Lazy, Refinement } from 'fp-ts/lib/function'
import { pipe } from 'fp-ts/lib/pipeable'
import * as RA from 'fp-ts/lib/ReadonlyArray'
import * as RNEA from 'fp-ts/lib/ReadonlyNonEmptyArray'

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

export const mapLeft = <D extends AnyD, E>(f: (e: ErrorOf<D>, i: InputOf<D>) => E) => (decoder: D): MapLeftD<D, E> => ({
  _tag: 'MapLeftD',
  decode: (i) =>
    pipe(
      decoder.decode(i),
      TH.mapLeft((de) => f(de, i))
    ),
  decoder,
  mapLeft: f
})

export interface MapD<D, B> extends Decoder<InputOf<D>, ErrorOf<D>, B> {
  readonly _tag: 'MapD'
  readonly decoder: D
  readonly map: (a: TypeOf<D>) => B
}

export const map = <D extends AnyD, B>(f: (a: TypeOf<D>) => B) => (decoder: D): MapD<D, B> => ({
  _tag: 'MapD',
  decode: flow(decoder.decode, TH.map(f)),
  decoder,
  map: f
})

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

export interface MemberE<M, E> extends SingleE<E> {
  readonly _tag: 'MemberE'
  readonly member: M
}

export interface TagE<T, E> extends SingleE<E> {
  readonly _tag: 'TagE'
  readonly tag: T
}

// Single errors

export interface LeafE<E> extends SingleE<E> {
  readonly _tag: 'LeafE'
}
export const leafE = <E>(error: E): LeafE<E> => ({ _tag: 'LeafE', error })

export interface NullableE<E> extends SingleE<E> {
  readonly _tag: 'NullableE'
}

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

export interface IndexesE<E> extends CompoundE<E> {
  readonly _tag: 'IndexesE'
}
export const indexesE = <E>(errors: ReadonlyNonEmptyArray<E>): IndexesE<E> => ({
  _tag: 'IndexesE',
  errors
})

export interface MissingIndexE {
  readonly _tag: 'MissingIndexE'
  readonly index: number
}
export interface MissingIndexLE extends LeafE<MissingIndexE> {}
export const missingIndexE = (index: number): MissingIndexE => ({
  _tag: 'MissingIndexE',
  index
})
export const missingIndex: (index: number) => MissingIndexLE = flow(missingIndexE, leafE)

export interface UnexpectedIndexE {
  readonly _tag: 'UnexpectedIndexE'
  readonly index: number
}
export interface UnexpectedIndexLE extends LeafE<UnexpectedIndexE> {}
export const unexpectedIndexE = (index: number): UnexpectedIndexE => ({
  _tag: 'UnexpectedIndexE',
  index
})
export const unexpectedIndex: (index: number) => UnexpectedIndexLE = flow(unexpectedIndexE, leafE)

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

export interface SumE<E> extends CompoundE<E> {
  readonly _tag: 'SumE'
}

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

export interface KeysE<E> extends CompoundE<E> {
  readonly _tag: 'KeysE'
}
export const keysE = <E>(errors: ReadonlyNonEmptyArray<E>): KeysE<E> => ({
  _tag: 'KeysE',
  errors
})

export interface UnexpectedKeyE {
  readonly _tag: 'UnexpectedKeyE'
  readonly key: string
}
export interface UnexpectedKeyLE extends LeafE<UnexpectedKeyE> {}
export const unexpectedKeyE = (key: string): UnexpectedKeyE => ({ _tag: 'UnexpectedKeyE', key })
export const unexpectedKey: (key: string) => UnexpectedKeyLE = flow(unexpectedKeyE, leafE)

export interface MissingKeyE {
  readonly _tag: 'MissingKeyE'
  readonly key: PropertyKey
}
export interface MissingKeyLE extends LeafE<MissingKeyE> {}
export const missingKeyE = (key: PropertyKey): MissingKeyE => ({ _tag: 'MissingKeyE', key })
export const missingKey: (key: PropertyKey) => MissingKeyLE = flow(missingKeyE, leafE)

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
export interface RequiredIndexRE<E> extends RequiredIndexE<string, DecodeError<E>> {}
export interface OptionalIndexRE<E> extends OptionalIndexE<number, DecodeError<E>> {}
export interface MemberRE<E> extends MemberE<string | number, DecodeError<E>> {}
export interface TagRE<E> extends TagE<string, DecodeError<E>> {}
export interface LazyRE<E> extends LazyE<DecodeError<E>> {}
// compound
export interface CompositionRE<E> extends CompositionE<DecodeError<E>> {}
export interface KeysRE<E> extends KeysE<DecodeError<E>> {}
export interface IndexesRE<E> extends IndexesE<DecodeError<E>> {}
export interface StructRE<E> extends StructE<DecodeError<E>> {}
export interface PartialRE<E> extends PartialE<DecodeError<E>> {}
export interface TupleRE<E> extends TupleE<DecodeError<E>> {}
export interface ArrayRE<E> extends ArrayE<DecodeError<E>> {}
export interface RecordRE<E> extends RecordE<DecodeError<E>> {}
export interface UnionRE<E> extends UnionE<DecodeError<E>> {}
export interface IntersectionRE<E> extends IntersectionE<DecodeError<E>> {}
export interface SumRE<E> extends SumE<DecodeError<E>> {}

export type DecodeError<E> =
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
  | KeysRE<E>
  | IndexesRE<E>
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
  | MissingKeyE
  | UnexpectedKeyE
  | MissingIndexE
  | UnexpectedIndexE
  | NaNE

// -------------------------------------------------------------------------------------
// decoder primitives
// -------------------------------------------------------------------------------------

export interface StringE extends ActualE<unknown> {
  readonly _tag: 'StringE'
}
export interface StringLE extends LeafE<StringE> {}
export interface stringUD extends Decoder<unknown, StringLE, string> {
  readonly _tag: 'stringUD'
}
export const string: stringUD = {
  _tag: 'stringUD',
  decode: (u) => (typeof u === 'string' ? right(u) : left(leafE({ _tag: 'StringE', actual: u })))
}

// TODO: handle Infinity
export interface NumberE extends ActualE<unknown> {
  readonly _tag: 'NumberE'
}
export interface NumberLE extends LeafE<NumberE> {}
export interface NaNE {
  readonly _tag: 'NaNE'
}
export interface NaNLE extends LeafE<NaNE> {}
export const naNLE: NaNLE = leafE({ _tag: 'NaNE' })
export interface numberUD extends Decoder<unknown, NumberLE | NaNLE, number> {
  readonly _tag: 'numberUD'
}
export const number: numberUD = {
  _tag: 'numberUD',
  decode: (u) =>
    typeof u === 'number' ? (isNaN(u) ? both(naNLE, u) : right(u)) : left(leafE({ _tag: 'NumberE', actual: u }))
}

export interface BooleanE extends ActualE<unknown> {
  readonly _tag: 'BooleanE'
}
export interface BooleanLE extends LeafE<BooleanE> {}
export interface booleanUD extends Decoder<unknown, BooleanLE, boolean> {
  readonly _tag: 'booleanUD'
}
export declare const boolean: booleanUD

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

export declare const literal: <A extends ReadonlyNonEmptyArray<Literal>>(...values: A) => LiteralD<A>

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

export interface ExactStructD<Properties>
  extends Decoder<
    { [K in keyof Properties]: InputOf<Properties[K]> },
    StructE<{ readonly [K in keyof Properties]: RequiredKeyE<K, ErrorOf<Properties[K]>> }[keyof Properties]>,
    { [K in keyof Properties]: TypeOf<Properties[K]> }
  > {
  readonly _tag: 'ExactStructD'
  readonly properties: Properties
}
export const exactStruct = <Properties extends Record<PropertyKey, AnyD>>(
  properties: Properties
): ExactStructD<Properties> => ({
  _tag: 'ExactStructD',
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
  extends Decoder<
    { [K in keyof Properties]: InputOf<Properties[K]> },
    KeysE<UnexpectedKeyLE>,
    { [K in keyof Properties]: InputOf<Properties[K]> }
  > {
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
      const ws: Array<UnexpectedKeyLE> = []
      const out: any = {}
      for (const k in properties) {
        if (k in ur) {
          out[k] = ur[k]
        }
      }
      for (const k in ur) {
        if (!(k in out)) {
          ws.push(unexpectedKey(k))
        }
      }
      return RA.isNonEmpty(ws) ? both(keysE(ws), out) : right(ur)
    }
  }
}

export interface FromStructD<Properties> extends CompositionD<UnexpectedKeysD<Properties>, ExactStructD<Properties>> {}

export function fromStruct<Properties extends Record<PropertyKey, AnyUD>>(
  properties: Properties
): FromStructD<Properties>
export function fromStruct(properties: Record<PropertyKey, AnyUD>): FromStructD<typeof properties> {
  return pipe(
    unexpectedKeys(properties), // { a: I1, b: I2, ..., unexpected: unknown } -> { a: I1, b: I2, ... }
    compose(exactStruct(properties)) // { a: I1, b: I2, ... } -> { a: string, b: number, ... }
  )
}

export interface MissingKeysD<Properties>
  extends Decoder<Record<PropertyKey, unknown>, KeysE<MissingKeyLE>, Record<keyof Properties, unknown>> {
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
      const es: Array<MissingKeyLE> = []
      for (const k in properties) {
        if (!(k in ur)) {
          es.push(missingKey(k))
        }
      }
      return RA.isNonEmpty(es) ? left(keysE(es)) : right(ur)
    }
  }
}

export interface StructD<Properties>
  extends CompositionD<CompositionD<UnknownRecordUD, MissingKeysD<Properties>>, FromStructD<Properties>> {}

export function struct<Properties extends Record<PropertyKey, AnyUD>>(properties: Properties): StructD<Properties>
export function struct(properties: Record<PropertyKey, AnyUD>): StructD<typeof properties> {
  return pipe(
    UnknownRecord, // unknown -> Record<PropertyKey, unknown>
    compose(missingKeys(properties)), // Record<PropertyKey, unknown> -> { a: unknown, b: unknown, ..., unexpected: unknown }
    compose(fromStruct(properties)) // { a: unknown, b: unknown, ..., unexpected: unknown } -> { a: string, b: number, ... }
  )
}

export interface ExactPartialD<Properties>
  extends Decoder<
    Partial<{ [K in keyof Properties]: InputOf<Properties[K]> }>,
    PartialE<{ readonly [K in keyof Properties]: OptionalKeyE<K, ErrorOf<Properties[K]>> }[keyof Properties]>,
    Partial<{ [K in keyof Properties]: TypeOf<Properties[K]> }>
  > {
  readonly _tag: 'ExactPartialD'
  readonly properties: Properties
}
export const exactPartial = <Properties extends Record<PropertyKey, AnyD>>(
  properties: Properties
): ExactPartialD<Properties> => ({
  _tag: 'ExactPartialD',
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

export interface FromPartialD<Properties>
  extends CompositionD<UnexpectedKeysD<Properties>, ExactPartialD<Properties>> {}

export function fromPartial<Properties extends Record<PropertyKey, AnyUD>>(
  properties: Properties
): FromPartialD<Properties>
export function fromPartial(properties: Record<PropertyKey, AnyUD>): FromPartialD<typeof properties> {
  return pipe(unexpectedKeys(properties), compose(exactPartial(properties)))
}

export interface PartialD<Properties> extends CompositionD<UnknownRecordUD, FromPartialD<Properties>> {}

export function partial<Properties extends Record<PropertyKey, AnyUD>>(properties: Properties): PartialD<Properties>
export function partial(properties: Record<PropertyKey, AnyUD>): PartialD<typeof properties> {
  return pipe(UnknownRecord, compose(fromPartial(properties)))
}

export interface ExactTupleD<Components extends ReadonlyArray<AnyD>>
  extends Decoder<
    { readonly [K in keyof Components]: InputOf<Components[K]> },
    TupleE<{ [K in keyof Components]: RequiredIndexE<K, ErrorOf<Components[K]>> }[number]>,
    { [K in keyof Components]: TypeOf<Components[K]> }
  > {
  readonly _tag: 'ExactTupleD'
  readonly components: Components
}
export const exactTuple = <Components extends ReadonlyArray<AnyD>>(
  ...components: Components
): ExactTupleD<Components> => ({
  _tag: 'ExactTupleD',
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

export interface UnexpectedComponentsD<Components>
  extends Decoder<
    { readonly [K in keyof Components]: InputOf<Components[K]> },
    IndexesE<UnexpectedIndexLE>,
    { [K in keyof Components]: InputOf<Components[K]> }
  > {
  readonly _tag: 'UnexpectedComponentsD'
  readonly components: Components
}

const unexpectedComponents = <Components extends ReadonlyArray<unknown>>(
  ...components: Components
): UnexpectedComponentsD<Components> => {
  return {
    _tag: 'UnexpectedComponentsD',
    components,
    decode: (us) => {
      const ws: Array<UnexpectedIndexLE> = []
      for (let index = components.length; index < us.length; index++) {
        ws.push(unexpectedIndex(index))
      }
      return RA.isNonEmpty(ws) ? both(indexesE(ws), us.slice(0, components.length) as any) : right(us)
    }
  }
}

export interface FromTupleD<Components extends ReadonlyArray<AnyD>>
  extends CompositionD<UnexpectedComponentsD<Components>, ExactTupleD<Components>> {}

export function fromTuple<Components extends ReadonlyArray<AnyD>>(...components: Components): FromTupleD<Components>
export function fromTuple(...components: ReadonlyArray<AnyD>): FromTupleD<typeof components> {
  return pipe(
    unexpectedComponents(...components), // [I0, I1, ..., unexpected: unknown] -> [I0, I1, ...]
    compose(exactTuple(...components)) // [I0, I1, ...] -> [string, number, ...]
  )
}

export interface MissingComponentsD<Components>
  extends Decoder<Array<unknown>, IndexesE<MissingIndexLE>, { [K in keyof Components]: unknown }> {
  readonly _tag: 'MissingComponentsD'
  readonly components: Components
}
export const missingComponents = <Components extends ReadonlyArray<unknown>>(
  ...components: Components
): MissingComponentsD<Components> => {
  return {
    _tag: 'MissingComponentsD',
    components,
    decode: (us) => {
      const es: Array<MissingIndexLE> = []
      const len = us.length
      for (let index = 0; index < components.length; index++) {
        if (len < index) {
          es.push(missingIndex(index))
        }
      }
      return RA.isNonEmpty(es) ? left(indexesE(es)) : right(us as any)
    }
  }
}

export interface TupleD<Components extends ReadonlyArray<AnyUD>>
  extends CompositionD<CompositionD<UnknownArrayUD, MissingComponentsD<Components>>, FromTupleD<Components>> {}

export function tuple<Components extends ReadonlyArray<AnyUD>>(...cs: Components): TupleD<Components>
export function tuple(...cs: ReadonlyArray<AnyUD>): TupleD<typeof cs> {
  return pipe(
    UnknownArray, // unknown -> Array<unknown>
    compose(missingComponents(...cs)), // Array<unknown> -> [unknown, unknown, ..., unexpected: unknown]
    compose(fromTuple(...cs)) // [unknown, unknown, ..., unexpected: unknown] -> [string, number, ...]
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

export interface UnionD<Members extends ReadonlyArray<AnyD>>
  extends Decoder<
    InputOf<Members[keyof Members]>,
    UnionE<{ [I in keyof Members]: MemberE<I, ErrorOf<Members[I]>> }[number]>,
    TypeOf<Members[keyof Members]>
  > {
  readonly _tag: 'UnionD'
  readonly members: Members
}
export declare const union: <Members extends ReadonlyArray<AnyD>>(...members: Members) => UnionD<Members>

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
export declare const intersect: <S extends AnyD>(second: S) => <F extends AnyD>(first: F) => IntersectD<F, S>

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
export declare const sum: <T extends string>(
  tag: T
) => <Members extends Record<PropertyKey, AnyUD>>(members: Members) => SumD<T, Members>

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

export const Form = exactStruct({
  name: string,
  age: number
})

// the decode error is fully typed...
// type FormE = StructE<RequiredKeyE<"name", StringLE> | RequiredKeyE<"age", NaNLE | NumberLE>>
export type FormE = ErrorOf<typeof Form>

// ...this means that you can pattern match on the error
export const formatErroMessages = (de: FormE): string =>
  de.errors
    .map((e) => {
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
        return tree(`1 error(s) found while decoding the required component ${de.index}`, [go(de.error)])
      case 'OptionalIndexE':
        return tree(`1 error(s) found while decoding the optional index ${de.index}`, [go(de.error)])
      case 'RequiredKeyE':
        return tree(`1 error(s) found while decoding the required key ${JSON.stringify(de.key)}`, [go(de.error)])
      case 'OptionalKeyE':
        return tree(`1 error(s) found while decoding the optional key ${JSON.stringify(de.key)}`, [go(de.error)])
      case 'MemberE':
        return tree(`1 error(s) found while decoding the member ${JSON.stringify(de.member)}`, [go(de.error)])
      case 'TagE':
        return tree(`1 error(s) found while decoding the sum tag ${de.tag}`, [go(de.error)])
      case 'LazyE':
        return tree(`1 error(s) found while decoding the lazy decoder ${de.id}`, [go(de.error)])

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
      case 'IndexesE':
        return tree(`${de.errors.length} error(s) found while checking components`, de.errors.map(go))
      case 'KeysE':
        return tree(`${de.errors.length} error(s) found while checking keys`, de.errors.map(go))
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
    case 'MissingKeyE':
      return tree(`missing required key ${JSON.stringify(de.key)}`)
    case 'UnexpectedKeyE':
      return tree(`unexpected key ${JSON.stringify(de.key)}`)
    case 'MissingIndexE':
      return tree(`missing required index ${JSON.stringify(de.index)}`)
    case 'UnexpectedIndexE':
      return tree(`unexpected index ${JSON.stringify(de.index)}`)
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

const printValue = <A>(a: A): string => 'Value:\n' + JSON.stringify(a, null, 2)
const printErrors = (s: string): string => (s === '' ? s : 'Errors:\n' + s)
const printWarnings = (s: string): string => (s === '' ? s : 'Warnings:\n' + s)

export const print = TH.fold(printErrors, printValue, (e, a) => printValue(a) + '\n' + printWarnings(e))

// example 1
// pipe(Form.decode({ name: null, age: null }), draw, print, console.log)
/*
Errors:
2 error(s) found while decoding a struct
├─ 1 error(s) found while decoding the required key "name"
│  └─ cannot decode null, expected a string
└─ 1 error(s) found while decoding the required key "age"
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

export const Form2 = exactStruct({
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
├─ 1 error(s) found while decoding the required key "name"
│  └─ cannot decode null, expected a string
└─ 1 error(s) found while decoding the required key "age"
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
// use case: condemn
// -------------------------------------------------------------------------------------

export const condemn = <D extends AnyD>(decoder: D): D => {
  return {
    ...decoder,
    decode: (i) => {
      const de = decoder.decode(i)
      return TH.isBoth(de) ? left(de.left) : de
    }
  }
}

export function strict<Properties extends Record<PropertyKey, AnyUD>>(properties: Properties): StructD<Properties>
export function strict(properties: Record<PropertyKey, AnyUD>): StructD<typeof properties> {
  return pipe(
    UnknownRecord,
    compose(missingKeys(properties)),
    //             v-- here's the difference
    compose(pipe(condemn(unexpectedKeys(properties)), compose(exactStruct(properties))))
  )
}

// pipe(struct({ a: string }).decode({ a: 'a', b: 1 }), debug)
/*
Value:
{
  "a": "a"
}
Warnings:
1 error(s) found while checking keys
└─ unexpected key "b"
*/
// pipe(strict({ a: string }).decode({ a: 'a', b: 1 }), debug)
/*
Errors:
1 error(s) found while checking keys
└─ unexpected key "b"
*/

export const shouldCondemn = <E>(predicate: (e: E) => boolean): ((de: DecodeError<E>) => boolean) => {
  const go = (de: DecodeError<E>): boolean => {
    switch (de._tag) {
      case 'KeysE':
      case 'CompositionE':
      case 'StructE':
        return de.errors.some(go)
      case 'PrevE':
      case 'NextE':
      case 'RequiredKeyE':
        return go(de.error)
      case 'LeafE':
        return predicate(de.error)
    }
    return false
  }
  return go
}

export const condemnWith = <E>(predicate: (e: E) => boolean) => <D extends Decoder<any, DecodeError<E>, any>>(
  decoder: D
): D => {
  const should = shouldCondemn(predicate)
  return {
    ...decoder,
    decode: (i) => {
      const de = decoder.decode(i)
      if (TH.isBoth(de)) {
        const e = de.left
        if (should(e)) {
          return left(e)
        }
      }
      return de
    }
  }
}

export const nan = condemnWith((e: BuiltinE) => e._tag === 'NaNE')

export const condemned1 = nan(struct({ a: number }))
export const condemned2 = struct({ a: nan(number) })

// pipe(condemned1.decode({ a: NaN }), debug)
/*
Errors:
1 error(s) found while decoding a struct
└─ 1 error(s) found while decoding the required key "a"
   └─ value is NaN
*/
// pipe(condemned2.decode({ a: NaN }), debug)
/*
Errors:
1 error(s) found while decoding a struct
└─ 1 error(s) found while decoding the required key "a"
   └─ value is NaN
*/

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
// use case: rename a prop #369
// -------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------
// use case: fail on additional props #322
// -------------------------------------------------------------------------------------

export const warningsTuple = tuple(struct({ a: string }))

// pipe(warningsTuple.decode([{ a: 'a', b: 2 }, 1, true]), debug)
/*
Value:
[
  {
    "a": "a"
  }
]
Warnings:
2 error(s) found while decoding a composition
├─ 2 error(s) found while checking components
│  ├─ unexpected index 1
│  └─ unexpected index 2
└─ 1 error(s) found while decoding a tuple
   └─ 1 error(s) found while decoding the required component 0
      └─ 1 error(s) found while checking keys
         └─ unexpected key "b"
*/

export const warningsStruct = struct({
  a: string,
  b: struct({
    c: number
  })
})

// pipe(warningsStruct.decode({ a: 'a', b: { c: 1, e: 2, f: { h: 3 } }, d: 1 }), debug)
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
   └─ 1 error(s) found while decoding the required key "b"
      └─ 2 error(s) found while checking keys
         ├─ unexpected key "e"
         └─ unexpected key "f"
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
// use case: reflection, for example generating a match function from a sum
// -------------------------------------------------------------------------------------

// export declare const getMatch: <T extends string, Members extends Record<PropertyKey, AnyD>>(decoder: {
//   readonly tag: T
//   readonly members: Members
// }) => <B>(
//   patterns: { [K in keyof Members]: (member: TypeOf<Members[K]>) => B }
// ) => (a: TypeOf<Members[keyof Members]>) => B

// const matchDecoder = sum('_tag')({
//   A: struct({ _tag: literal('A'), a: string }),
//   B: struct({ _tag: literal('B'), b: number })
// })

// export const match = getMatch(matchDecoder)

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
// examples
// -------------------------------------------------------------------------------------

// // literal
// export const LDU = literal(1, true)
// export type LDUI = InputOf<typeof LDU>
// export type LDUE = ErrorOf<typeof LDU>
// export type LDUA = TypeOf<typeof LDU>

// fromStruct
export const SD = fromStruct({
  a: string,
  b: number
})
export type SDI = InputOf<typeof SD>
export type SDE = ErrorOf<typeof SD>
export type SDA = TypeOf<typeof SD>
// pipe(SD.decode({ a: 'a', b: 1, c: true } as any), debug)

// struct
export const SUD = struct({
  a: string,
  b: number
})
export type SUDI = InputOf<typeof SUD>
export type SUDE = ErrorOf<typeof SUD>
export type SUDA = TypeOf<typeof SUD>
// pipe(SUD.decode({ a: 'a', b: 1, c: true }), debug)

// fromPartial
export const PSD = exactPartial({
  a: string,
  b: number
})
export type PSDI = InputOf<typeof PSD>
export type PSDE = ErrorOf<typeof PSD>
export type PSDA = TypeOf<typeof PSD>
// pipe(PSD.decode({ a: 'a' }), debug)

// partial
export const PSUD = partial({
  a: string,
  b: number
})
export type PSUDE = ErrorOf<typeof PSUD>
export type PSUDA = TypeOf<typeof PSUD>
// pipe(PSUD.decode({ a: 'a' }), debug)

// fromTuple
export const TD = fromTuple(string, number)
export type TDI = InputOf<typeof TD>
export type TDE = ErrorOf<typeof TD>
export type TDA = TypeOf<typeof TD>
// pipe(TD.decode(['a', 1, true] as any), debug)

// tuple
export const TUD = tuple(string, number)
export type TUDE = ErrorOf<typeof TUD>
export type TUDA = TypeOf<typeof TUD>
// pipe(TUD.decode(['a', 1, true]), debug)

// fromArray
export const AD = fromArray(string)
export type ADI = InputOf<typeof AD>
export type ADE = ErrorOf<typeof AD>
export type ADA = TypeOf<typeof AD>

// array
export const AUD = array(string)

// // fromRecord
// export const RD = fromRecord(number)
// export type RDI = InputOf<typeof RD>
// export type RDE = ErrorOf<typeof RD>
// export type RDA = TypeOf<typeof RD>

// // record
// export const RUD = record(number)

// refine
export type IntDI = InputOf<typeof IntD>
export type IntDE = ErrorOf<typeof IntD>
export type IntDA = TypeOf<typeof IntD>

export type IntUDA = TypeOf<typeof IntUD>

// // union
// export const UD = union(NonEmptyStringD, IntD)
// export type UDI = InputOf<typeof UD>
// export type UDE = ErrorOf<typeof UD>
// export type UDA = TypeOf<typeof UD>

// export const UUD = union(string, number)
// export type UUDE = ErrorOf<typeof UUD>
// export type UUDA = TypeOf<typeof UUD>

// // nullable
// export const ND = nullable(NonEmptyStringD)
// export type NDI = InputOf<typeof ND>
// export type NDE = ErrorOf<typeof ND>
// export type NDA = TypeOf<typeof ND>

// export const NUD = nullable(string)
// export type NUDE = ErrorOf<typeof NUD>
// export type NUDA = TypeOf<typeof NUD>

// // parse
// interface ParseNumberE {
//   readonly _tag: 'ParseNumberE'
// }
// declare const parseNumber: (s: string) => These<ParseNumberE, number>
// const PD = pipe(id<string>(), parse(parseNumber))
// export type PDI = InputOf<typeof PD>
// export type PDE = ErrorOf<typeof PD>
// export type PDA = TypeOf<typeof PD>

// const PUD = pipe(string, parse(parseNumber))
// export type PUDE = ErrorOf<typeof PUD>
// export type PUDA = TypeOf<typeof PUD>

// // intersect
// export const ID = pipe(fromStruct({ a: string }), intersect(fromStruct({ b: number })))
// export type IDI = InputOf<typeof ID>
// export type IDE = ErrorOf<typeof ID>
// export type IDA = TypeOf<typeof ID>

// export const IUD = pipe(struct({ a: string }), intersect(struct({ b: number })))
// export type IUDE = ErrorOf<typeof IUD>
// export type IUDA = TypeOf<typeof IUD>

// // lazy
// interface Category {
//   name: string
//   categories: ReadonlyArray<Category>
// }
// // Note: getting the error type is quite difficult.
// interface ReadonlyArrayCategoryE extends ArrayE<IndexE<number, CategoryE>> {}
// type CategoryE = LazyE<
//   | UnknownRecordLE
//   | StructE<
//       | KeyE<'name', LeafE<StringE> | RefineE<LeafE<NonEmptyStringE>>>
//       | KeyE<'categories', LeafE<UnknownArrayE> | ReadonlyArrayCategoryE>
//     >
// >
// // A possible solution is using DecodeError<E>
// // type CategoryE = DecodeError<StringE | NonEmptyStringE | UnknownArrayE | UnknownRecordE>
// export const LaUD: Decoder<unknown, CategoryE, Category> = lazy('Category', () =>
//   struct({
//     name: NonEmptyStringUD,
//     categories: array(LaUD)
//   })
// )
// export type LaUDE = ErrorOf<typeof LaUD>
// export type LaUDA = TypeOf<typeof LaUD>

// // sum
// export const SumD = fromSum('type')({
//   A: fromStruct({ type: literal('A'), a: string }),
//   B: fromStruct({ type: literal('B'), b: string })
// })
// export type SumDI = InputOf<typeof SumD>
// export type SumDE = ErrorOf<typeof SumD>
// export type SumDA = TypeOf<typeof SumD>

// const sumType = sum('type')
// export const SumUD = sumType({
//   A: struct({ type: literal('A'), a: string }),
//   B: struct({ type: literal('B'), b: string })
// })
// export type SumUDE = ErrorOf<typeof SumUD>
// export type SumUDA = TypeOf<typeof SumUD>

// // keys
// const K = keys('a', 'b')
// export type KI = InputOf<typeof K>
// export type KE = ErrorOf<typeof K>
// export type KA = TypeOf<typeof K>
// pipe(K.decode({ a: 'a', b: 1, c: true }), debug)

// // components
// const SC = components(null, null)
// export type SCI = InputOf<typeof SC>
// export type SCE = ErrorOf<typeof SC>
// export type SCA = TypeOf<typeof SC>

// // all
// const AllD = fromStruct({
//   a: LDU,
//   b: TD,
//   c: AD,
//   d: RD,
//   e: UD,
//   f: ND,
//   g: NonEmptyStringD,
//   h: PD,
//   i: ID
// })
// export type AllDI = InputOf<typeof AllD>
// export type AllDE = ErrorOf<typeof AllD>
// export type AllDA = TypeOf<typeof AllD>

// const AllUD = struct({
//   a: LDU,
//   b: SUD,
//   c: TUD,
//   d: AUD,
//   e: RUD,
//   f: UUD,
//   g: NUD,
//   h: NonEmptyStringUD,
//   i: PUD,
//   l: IUD
// })
// export type AllUDE = ErrorOf<typeof AllUD>
// export type AllUDA = TypeOf<typeof AllUD>
