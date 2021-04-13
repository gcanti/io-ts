import * as TH from 'fp-ts/lib/These'
import { flow, Lazy, Refinement } from 'fp-ts/lib/function'
import { pipe } from 'fp-ts/lib/pipeable'
import * as RA from 'fp-ts/lib/ReadonlyArray'
import * as RNEA from 'fp-ts/lib/ReadonlyNonEmptyArray'

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

export type Result<E, A> = TH.These<E, A>

export interface Decoder<I, E, A> {
  readonly decode: (i: I) => Result<E, A>
}

interface AnyD extends Decoder<any, any, any> {}
interface AnyUD extends Decoder<unknown, any, any> {}

export type InputOf<D> = D extends Decoder<infer I, any, any> ? I : never
export type ErrorOf<D> = D extends Decoder<any, infer E, any> ? E : never
export type TypeOf<D> = D extends Decoder<any, any, infer A> ? A : never

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

export interface CompositionD<F, S> extends Decoder<InputOf<F>, CompositionE<ErrorOf<F> | ErrorOf<S>>, TypeOf<S>> {
  readonly _tag: 'CompositionD'
  readonly first: F
  readonly second: S
}

export function compose<F extends AnyD, S extends Decoder<TypeOf<F>, any, any>>(
  second: S
): (first: F) => CompositionD<F, S>
export function compose<A, E2, B>(
  second: Decoder<A, E2, B>
): <I, E1>(first: Decoder<I, E1, A>) => CompositionD<typeof first, typeof second> {
  return (first) => ({
    _tag: 'CompositionD',
    first,
    second,
    decode: flow(
      first.decode,
      TH.fold(
        (e1) => TH.left(compositionE([e1])),
        (a) =>
          pipe(
            second.decode(a),
            TH.mapLeft((e) => compositionE([e]))
          ),
        (w1, a) =>
          pipe(
            second.decode(a),
            TH.fold(
              (e2) => TH.left(compositionE([e2])),
              (b) => TH.both(compositionE([w1]), b),
              (w2, b) => TH.both(compositionE([w1, w2]), b)
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

export interface CompoundE<E> {
  readonly errors: ReadonlyNonEmptyArray<E>
}

// Single error

export interface LeafE<E> extends SingleE<E> {
  readonly _tag: 'LeafE'
}
export const leafE = <E>(error: E): LeafE<E> => ({ _tag: 'LeafE', error })

export interface NullableE<E> extends SingleE<E> {
  readonly _tag: 'NullableE'
}

export interface KeyE<K, E> extends SingleE<E> {
  readonly _tag: 'KeyE'
  readonly key: K
  readonly required: boolean
}
export const keyE = <K, E>(key: K, required: boolean, error: E): KeyE<K, E> => ({ _tag: 'KeyE', key, required, error })

export interface ComponentE<I, E> extends SingleE<E> {
  readonly _tag: 'ComponentE'
  readonly index: I
}
export const componentE = <I, E>(index: I, error: E): ComponentE<I, E> => ({
  _tag: 'ComponentE',
  index,
  error
})

export interface IndexE<I, E> extends SingleE<E> {
  readonly _tag: 'IndexE'
  readonly index: I
}
export const indexE = <I, E>(index: I, error: E): IndexE<I, E> => ({
  _tag: 'IndexE',
  index,
  error
})

export interface RefinementE<E> extends SingleE<E> {
  readonly _tag: 'RefinementE'
}
export const refinementE = <E>(error: E): RefinementE<E> => ({ _tag: 'RefinementE', error })

export interface ParserE<E> extends SingleE<E> {
  readonly _tag: 'ParserE'
}
export const parserE = <E>(error: E): ParserE<E> => ({ _tag: 'ParserE', error })

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

// Compound errors

export interface StructE<E> extends CompoundE<E> {
  readonly _tag: 'StructE'
}
export const structE = <E>(errors: ReadonlyNonEmptyArray<E>): StructE<E> => ({ _tag: 'StructE', errors })

export interface PartialE<E> extends CompoundE<E> {
  readonly _tag: 'PartialE'
}

export interface RecordE<E> extends CompoundE<E> {
  readonly _tag: 'RecordE'
}

export interface StripComponentsE<E> extends CompoundE<E> {
  readonly _tag: 'StripComponentsE'
}
export const stripComponentsE = <E>(errors: ReadonlyNonEmptyArray<E>): StripComponentsE<E> => ({
  _tag: 'StripComponentsE',
  errors
})

export interface UnexpectedComponentE {
  readonly _tag: 'UnexpectedComponentE'
  readonly component: number
}
export interface UnexpectedComponentLE extends LeafE<UnexpectedComponentE> {}
export const unexpectedComponentE = (component: number): UnexpectedComponentE => ({
  _tag: 'UnexpectedComponentE',
  component
})
export const unexpectedComponent: (component: number) => UnexpectedComponentLE = flow(unexpectedComponentE, leafE)

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

export interface StripKeysE<E> extends CompoundE<E> {
  readonly _tag: 'StripKeysE'
}
export const stripKeysE = <E>(errors: ReadonlyNonEmptyArray<E>): StripKeysE<E> => ({
  _tag: 'StripKeysE',
  errors
})

export interface UnexpectedKeyE {
  readonly _tag: 'UnexpectedKeyE'
  readonly key: string
}
export interface UnexpectedKeyLE extends LeafE<UnexpectedKeyE> {}
export const unexpectedKeyE = (key: string): UnexpectedKeyE => ({ _tag: 'UnexpectedKeyE', key })
export const unexpectedKey: (key: string) => UnexpectedKeyLE = flow(unexpectedKeyE, leafE)

// recursive helpers to please ts@3.5
export interface NullableRE<E> extends NullableE<DecodeError<E>> {}
export interface RefinementRE<E> extends RefinementE<DecodeError<E>> {}
export interface ParserRE<E> extends ParserE<DecodeError<E>> {}
export interface CompositionRE<E> extends CompositionE<DecodeError<E>> {}
export interface StripKeysRE<E> extends StripKeysE<DecodeError<E>> {}
export interface StructRE<E> extends StructE<DecodeError<E>> {}
export interface KeyRE<E> extends KeyE<string, DecodeError<E>> {}
export interface PartialRE<E> extends PartialE<DecodeError<E>> {}
export interface StripComponentsRE<E> extends StripComponentsE<DecodeError<E>> {}
export interface TupleRE<E> extends TupleE<DecodeError<E>> {}
export interface ComponentRE<E> extends ComponentE<string, DecodeError<E>> {}
export interface IndexRE<E> extends IndexE<number, DecodeError<E>> {}
export interface ArrayRE<E> extends ArrayE<DecodeError<E>> {}
export interface RecordRE<E> extends RecordE<DecodeError<E>> {}
export interface UnionRE<E> extends UnionE<DecodeError<E>> {}
export interface MemberRE<E> extends MemberE<string | number, DecodeError<E>> {}
export interface IntersectionRE<E> extends IntersectionE<DecodeError<E>> {}
export interface TagRE<E> extends TagE<string, DecodeError<E>> {}
export interface SumRE<E> extends SumE<DecodeError<E>> {}
export interface LazyRE<E> extends LazyE<DecodeError<E>> {}

export type DecodeError<E> =
  // single
  | LeafE<E>
  | NullableRE<E>
  | KeyRE<E>
  | RefinementRE<E>
  | ParserRE<E>
  | ComponentRE<E>
  | IndexRE<E>
  | MemberRE<E>
  | TagRE<E>
  | LazyRE<E>
  // compound
  | StripKeysRE<E>
  | StripComponentsRE<E>
  | StructRE<E>
  | PartialRE<E>
  | TupleRE<E>
  | ArrayRE<E>
  | RecordRE<E>
  | UnionRE<E>
  | IntersectionRE<E>
  | SumRE<E>
  // alone
  | CompositionRE<E>

export type BuiltinE =
  | StringE
  | NumberE
  | BooleanE
  | UnknownRecordE
  | UnknownArrayE
  | LiteralE<Literal>
  | MessageE<unknown>
  | UnexpectedKeyE
  | UnexpectedComponentE
  | NaNE

// -------------------------------------------------------------------------------------
// primitives
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
  decode: (u) => (typeof u === 'string' ? TH.right(u) : TH.left(leafE({ _tag: 'StringE', actual: u })))
}

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
    typeof u === 'number'
      ? isNaN(u)
        ? TH.both(naNLE, u)
        : TH.right(u)
      : TH.left(leafE({ _tag: 'NumberE', actual: u }))
}

export interface BooleanE extends ActualE<unknown> {
  readonly _tag: 'BooleanE'
}
export interface BooleanLE extends LeafE<BooleanE> {}
export interface booleanUD extends Decoder<unknown, BooleanLE, boolean> {
  readonly _tag: 'booleanUD'
}
export declare const boolean: booleanUD

// -------------------------------------------------------------------------------------
// unknown containers
// -------------------------------------------------------------------------------------

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
  decode: (u) => (Array.isArray(u) ? TH.right(u) : TH.left(unknownArrayE(u)))
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
export interface UnknownRecordUD extends Decoder<unknown, UnknownRecordLE, Record<string, unknown>> {
  readonly _tag: 'UnknownRecordUD'
}
const isUnknownRecord = (u: unknown): u is Record<string, unknown> =>
  u !== null && typeof u === 'object' && !Array.isArray(u)
export const UnknownRecord: UnknownRecordUD = {
  _tag: 'UnknownRecordUD',
  decode: (u) => (isUnknownRecord(u) ? TH.right(u) : TH.left(unknownRecordE(u)))
}

// -------------------------------------------------------------------------------------
// constructors
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
  readonly parser: (a: A) => Result<E, B>
}

export const refinement = <A, E, B extends A>(parser: (a: A) => Result<E, B>): RefinementD<A, E, B> => ({
  _tag: 'RefinementD',
  parser,
  decode: flow(parser, TH.mapLeft(refinementE))
})

export const fromRefinement = <From extends AnyD, B extends TypeOf<From>, E>(
  refinement: Refinement<TypeOf<From>, B>,
  error: (from: TypeOf<From>) => E
): ((from: From) => RefineD<From, E, B>) => refine((a) => (refinement(a) ? TH.right(a) : TH.left(error(a))))

export interface ParserD<A, E, B> extends Decoder<A, ParserE<E>, B> {
  readonly _tag: 'ParserD'
  readonly parser: (a: A) => Result<E, B>
}

export const parser = <A, E, B>(parser: (a: A) => Result<E, B>): ParserD<A, E, B> => ({
  _tag: 'ParserD',
  parser,
  decode: flow(parser, TH.mapLeft(parserE))
})

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

export interface FromStructD<Properties>
  extends Decoder<
    { [K in keyof Properties]: InputOf<Properties[K]> },
    StructE<{ readonly [K in keyof Properties]: KeyE<K, ErrorOf<Properties[K]>> }[keyof Properties]>,
    { [K in keyof Properties]: TypeOf<Properties[K]> }
  > {
  readonly _tag: 'FromStructD'
  readonly properties: Properties
}
export const fromStruct = <Properties extends Record<string, AnyD>>(
  properties: Properties
): FromStructD<Properties> => ({
  _tag: 'FromStructD',
  properties,
  decode: (ur) => {
    const es: Array<KeyE<string, ErrorOf<Properties[keyof Properties]>>> = []
    const ar: any = {}
    let isBoth = true
    for (const k in properties) {
      const de = properties[k].decode(ur[k])
      if (TH.isLeft(de)) {
        isBoth = false
        es.push(keyE(k, true, de.left))
      } else if (TH.isRight(de)) {
        ar[k] = de.right
      } else {
        es.push(keyE(k, true, de.left))
        ar[k] = de.right
      }
    }
    if (RA.isNonEmpty(es)) {
      return isBoth ? TH.both(structE(es), ar) : TH.left(structE(es))
    }
    return TH.right(ar)
  }
})

export interface StripKeysD<P>
  extends Decoder<Record<string, unknown>, StripKeysE<UnexpectedKeyLE>, { [K in keyof P]: unknown }> {
  readonly _tag: 'StripKeysD'
  readonly properties: P
}
export const stripKeys = <Properties extends Record<string, unknown>>(
  properties: Properties
): StripKeysD<Properties> => {
  return {
    _tag: 'StripKeysD',
    properties,
    decode: (ur) => {
      const es: Array<UnexpectedKeyLE> = []
      for (const k in ur) {
        if (!properties.hasOwnProperty(k)) {
          es.push(unexpectedKey(k))
        }
      }
      const out: { [K in keyof Properties]: unknown } = ur as any
      return RA.isNonEmpty(es) ? TH.both(stripKeysE(es), out) : TH.right(out)
    }
  }
}

export interface StructD<Properties>
  extends CompositionD<CompositionD<UnknownRecordUD, StripKeysD<Properties>>, FromStructD<Properties>> {}

export function struct<Properties extends Record<string, AnyUD>>(properties: Properties): StructD<Properties>
export function struct(properties: Record<string, AnyUD>): StructD<typeof properties> {
  return pipe(UnknownRecord, compose(stripKeys(properties)), compose(fromStruct(properties)))
}

export interface FromPartialD<Properties>
  extends Decoder<
    Partial<{ [K in keyof Properties]: InputOf<Properties[K]> }>,
    PartialE<{ readonly [K in keyof Properties]: KeyE<K, ErrorOf<Properties[K]>> }[keyof Properties]>,
    Partial<{ [K in keyof Properties]: TypeOf<Properties[K]> }>
  > {
  readonly _tag: 'FromPartialD'
  readonly properties: Properties
}
export declare const fromPartial: <Properties extends Record<string, AnyD>>(
  properties: Properties
) => FromPartialD<Properties>

export interface FromArrayD<Item>
  extends Decoder<Array<InputOf<Item>>, ArrayE<IndexE<number, ErrorOf<Item>>>, Array<TypeOf<Item>>> {
  readonly _tag: 'FromArrayD'
  readonly item: Item
}

export function fromArray<Item extends AnyD>(item: Item): FromArrayD<Item>
export function fromArray<I, E, A>(item: Decoder<I, E, A>): FromArrayD<typeof item> {
  return {
    _tag: 'FromArrayD',
    item,
    decode: (us) => {
      const es: Array<IndexE<number, ErrorOf<typeof item>>> = []
      const as: Array<A> = []
      let isBoth = true
      for (let index = 0; index < us.length; index++) {
        const de = item.decode(us[index])
        if (TH.isLeft(de)) {
          isBoth = false
          es.push(indexE(index, de.left))
        } else if (TH.isRight(de)) {
          as[index] = de.right
        } else {
          es.push(indexE(index, de.left))
          as[index] = de.right
        }
      }
      if (RA.isNonEmpty(es)) {
        return isBoth ? TH.both(arrayE(es), as) : TH.left(arrayE(es))
      }
      return TH.right(as)
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
    Record<string, InputOf<Codomain>>,
    RecordE<KeyE<string, ErrorOf<Codomain>>>,
    Record<string, TypeOf<Codomain>>
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
  parser: (a: TypeOf<From>) => Result<E, B>
): (from: From) => RefineD<From, E, B>
export function refine<A, E2, B extends A>(
  parser: (a: A) => Result<E2, B>
): <I, E1>(from: Decoder<I, E1, A>) => RefineD<typeof from, E2, B> {
  return compose(refinement(parser))
}

export interface ParseD<From, E, B> extends CompositionD<From, ParserD<TypeOf<From>, E, B>> {}

export function parse<From extends AnyD, E, B>(
  parser: (a: TypeOf<From>) => Result<E, B>
): (from: From) => ParseD<From, E, B>
export function parse<A, E, B>(
  p: (a: A) => Result<E, B>
): <I, E1>(from: Decoder<I, E1, A>) => ParseD<typeof from, E, B> {
  return compose(parser(p))
}

export interface FromTupleD<Components extends ReadonlyArray<AnyD>>
  extends Decoder<
    { -readonly [K in keyof Components]: InputOf<Components[K]> },
    TupleE<{ [K in keyof Components]: ComponentE<K, ErrorOf<Components[K]>> }[number]>,
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
    const es: Array<ComponentE<number, ErrorOf<Components[number]>>> = []
    const as: any = []
    let isBoth = true
    for (let index = 0; index < components.length; index++) {
      const de = components[index].decode(us[index])
      if (TH.isLeft(de)) {
        isBoth = false
        es.push(componentE(index, de.left))
      } else if (TH.isRight(de)) {
        as[index] = de.right
      } else {
        es.push(componentE(index, de.left))
        as[index] = de.right
      }
    }
    if (RA.isNonEmpty(es)) {
      return isBoth ? TH.both(tupleE(es), as) : TH.left(tupleE(es))
    }
    return TH.right(as)
  }
})

export interface StripComponentsD<I>
  extends Decoder<Array<unknown>, StripComponentsE<UnexpectedComponentLE>, { [K in keyof I]: unknown }> {
  readonly _tag: 'StripComponentsD'
  readonly components: I
}
export const stripComponents = <Components extends ReadonlyArray<unknown>>(
  ...components: Components
): StripComponentsD<Components> => {
  return {
    _tag: 'StripComponentsD',
    components,
    decode: (us) => {
      const es: Array<UnexpectedComponentLE> = []
      for (let index = components.length; index < us.length; index++) {
        es.push(unexpectedComponent(index))
      }
      const out: { [K in keyof Components]: unknown } = us as any
      return RA.isNonEmpty(es) ? TH.both(stripComponentsE(es), out) : TH.right(out)
    }
  }
}

export interface TupleD<Components extends ReadonlyArray<AnyUD>>
  extends CompositionD<CompositionD<UnknownArrayUD, StripComponentsD<Components>>, FromTupleD<Components>> {}

export function tuple<Components extends ReadonlyArray<AnyUD>>(...components: Components): TupleD<Components>
export function tuple(...components: ReadonlyArray<AnyUD>): TupleD<typeof components> {
  return pipe(UnknownArray, compose(stripComponents(...components)), compose(fromTuple(...components)))
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
) => <Members extends Record<string, AnyD>>(members: Members) => FromSumD<T, Members>

export interface PartialD<Properties>
  extends Decoder<
    unknown,
    UnknownRecordLE | PartialE<{ readonly [K in keyof Properties]: KeyE<K, ErrorOf<Properties[K]>> }[keyof Properties]>,
    Partial<{ [K in keyof Properties]: TypeOf<Properties[K]> }>
  > {
  readonly _tag: 'PartialD'
  readonly properties: Properties
}
export declare const partial: <Properties extends Record<string, AnyUD>>(properties: Properties) => PartialD<Properties>

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
) => <Members extends Record<string, AnyUD>>(members: Members) => SumD<T, Members>

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
// use case: mapLeft decode error
// -------------------------------------------------------------------------------------

export const MapLeftExample = tuple(string, number)

// the decode error is fully typed...
// type MapLeftExampleE = CompositionE<CompositionE<UnknownArrayLE, StripComponentsE<UnexpectedComponentLE>>, TupleE<ComponentE<"0", StringLE> | ComponentE<...>>>
export type MapLeftExampleE = ErrorOf<typeof MapLeftExample>

// ...this means that you can pattern match on the error
export const result1 = pipe(
  MapLeftExample,
  mapLeft((de) =>
    de.errors.map((e) => {
      switch (e._tag) {
        case 'CompositionE':
          return e.errors.map((e) => {
            switch (e._tag) {
              case 'LeafE':
                return 'UnknownArrayLE'
              case 'StripComponentsE':
                return e._tag
            }
          })
        case 'TupleE':
          return e.errors.map((e) => {
            switch (e.index) {
              case '0':
                return 'StringE'
              case '1': {
                const e1 = e.error.error
                switch (e1._tag) {
                  case 'NaNE':
                    return 'NaNE'
                  case 'NumberE':
                    return 'NumberE'
                }
              }
            }
          })
      }
    })
  )
)

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
      case 'LeafE':
        return toTree(de.error)
      case 'ComponentE':
        return tree(`required component ${de.index}`, [go(de.error)])
      case 'IndexE':
        return tree(`optional index ${de.index}`, [go(de.error)])
      case 'KeyE':
        return tree(`${de.required ? 'required' : 'optional'} key ${JSON.stringify(de.key)}`, [go(de.error)])
      case 'ArrayE':
        return tree(`${de.errors.length} error(s) found while decoding an array`, de.errors.map(go))
      case 'RecordE':
        return tree(`${de.errors.length} error(s) found while decoding a record`, de.errors.map(go))
      case 'TupleE':
        return tree(`${de.errors.length} error(s) found while decoding a tuple`, de.errors.map(go))
      case 'StructE':
        return tree(`${de.errors.length} error(s) found while decoding a struct`, de.errors.map(go))
      case 'RefinementE':
        return tree(`error found while decoding a refinement`, [go(de.error)])
      case 'CompositionE':
        return de.errors.length === 1
          ? go(de.errors[0]) // less noise in the output if there's only one error
          : tree(`${de.errors.length} error(s) found while decoding a composition`, de.errors.map(go))
      case 'StripComponentsE':
        return tree(`${de.errors.length} error(s) found while stripping components`, de.errors.map(go))
      case 'StripKeysE':
        return tree(`${de.errors.length} error(s) found while stripping keys`, de.errors.map(go))
      default:
        // etc...
        return tree(`TODO ${de._tag}`)
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
    case 'UnexpectedKeyE':
      return tree(`unexpected key ${JSON.stringify(de.key)}`)
    case 'UnexpectedComponentE':
      return tree(`unexpected component ${JSON.stringify(de.component)}`)
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

const printValue = <A>(a: A): string => 'Value:\n' + JSON.stringify(a, null, 2)
const printErrors = (s: string): string => (s === '' ? s : 'Errors:\n' + s)
const printWarnings = (s: string): string => (s === '' ? s : 'Warnings:\n' + s)

export const print: <A>(ma: TH.These<string, A>) => string = TH.fold(
  printErrors,
  printValue,
  (e, a) => printValue(a) + '\n' + printWarnings(e)
)

// example 1
const DR1 = tuple(string, number)

export const treeLeft1 = pipe(DR1, mapLeft(toTree))

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

const DR2 = tuple(string, IntUD)

// TODO: the error message is cryptic
// export const treeOutput2 = pipe(DR2, mapLeft(draw)) // <= type error because `IntE` is not handled

// I can define my own `toTree`
const myToTree = (e: BuiltinE | IntE) => {
  switch (e._tag) {
    case 'IntE':
      return tree(`cannot decode ${e.actual}, should be an integer`)
    default:
      return toTreeBuiltin(e)
  }
}

export const treeLeft2 = pipe(DR2, mapLeft(toTreeWith(myToTree))) // <= ok

// -------------------------------------------------------------------------------------
// use case: old decoder, custom error message
// -------------------------------------------------------------------------------------

export const customStringUD = pipe(
  string,
  mapLeft((s) => message(s, `please insert a string`))
)

// pipe(customStringD.decode(null), draw, print, console.log)

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

// pipe(Positive.decode(NaN), draw, print, console.log)

// -------------------------------------------------------------------------------------
// use case: condemn
// -------------------------------------------------------------------------------------

export const condemn = <D extends AnyD>(decoder: D): D => {
  return {
    ...decoder,
    decode: (i) => {
      const de = decoder.decode(i)
      return TH.isBoth(de) ? TH.left(de.left) : de
    }
  }
}

export function strict<Properties extends Record<string, AnyUD>>(properties: Properties): StructD<Properties>
export function strict(properties: Record<string, AnyUD>): StructD<typeof properties> {
  return pipe(UnknownRecord, compose(condemn(stripKeys(properties))), compose(fromStruct(properties)))
}

// pipe(struct({ a: string }).decode({ a: 'a', b: 1 }), draw, print, console.log)
/*
Value:
{
  "a": "a"
}
Warnings:
1 error(s) found while stripping keys
└─ unexpected key "b"
*/
// pipe(strict({ a: string }).decode({ a: 'a', b: 1 }), draw, print, console.log)
/*
Errors:
1 error(s) found while stripping keys
└─ unexpected key "b"
*/

// TODO
// export const condemnWith = (
//   tags: ReadonlyNonEmptyArray<string>
// ): ((de: DecodeError<Record<string, unknown>>) => boolean) => {
//   const go = (de: DecodeError<Record<string, unknown>>): boolean => {
//     switch (de._tag) {
//       case 'StructE':
//         return de.errors.some(go)
//       case 'RefinementE':
//       case 'KeyE':
//         return go(de.error)
//       case 'LeafE':
//         const _tag = de.error['_tag']
//         return typeof _tag === 'string' && tags.includes(_tag)
//       case 'CompositionE':
//         return pipe(
//           de.error,
//           TH.fold(go, go, (e, a) => go(e) || go(a))
//         )
//     }
//     return false
//   }
//   return go
// }

// export const condemn = <D extends AnyD>(decoder: D, tags: ReadonlyNonEmptyArray<string>): D => {
//   const predicate = condemnWith(tags)
//   return {
//     ...decoder,
//     decode: (i) => {
//       const de = decoder.decode(i)
//       if (TH.isBoth(de)) {
//         const e = de.left
//         if (predicate(e)) {
//           return TH.left(e)
//         }
//       }
//       return de
//     }
//   }
// }

// pipe(
//   condemn(struct({ a: Positive }), ['NaNE']).decode({
//     a: NaN
//   }),
//   draw,
//   print,
//   console.log
// )

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
      ? TH.left(message(s, 'too short'))
      : s.length > 4
      ? TH.left(message(s, 'too long'))
      : USERNAME_REGEX.test(s)
      ? TH.left(message(s, 'bad characters'))
      : TH.right(s as Username)
  )
)

// pipe(
//   fromTuple(Username, Username, Username, Username, Username).decode([null, 'a', 'bbbbb', 'abd', 'ok']),
//   draw,
//   print,
//   console.log
// )

// -------------------------------------------------------------------------------------
// tests
// -------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------
// use case: rename a prop #369
// -------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------
// use case: fail on additional props #322
// -------------------------------------------------------------------------------------

export const warningsTuple = tuple(struct({ a: string }))

// pipe(warningsTuple.decode([{ a: 'a', b: 2 }, 1, true]), draw, print, console.log)
/*
Value:
[
  {
    "a": "a"
  }
]
Warnings:
2 error(s) found while decoding a composition
├─ 2 error(s) found while stripping components
│  ├─ unexpected component 1
│  └─ unexpected component 2
└─ 1 error(s) found while decoding a tuple
   └─ required component 0
      └─ 1 error(s) found while stripping keys
         └─ unexpected key "b"
*/

export const warningsStruct = struct({
  a: string,
  b: struct({
    c: number
  })
})

// pipe(warningsStruct.decode({ a: 'a', b: { c: 1, e: 2, f: { h: 3 } }, d: 1 }), draw, print, console.log)
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
├─ 1 error(s) found while stripping keys
│  └─ unexpected key "d"
└─ 1 error(s) found while decoding a struct
   └─ required key "b"
      └─ 2 error(s) found while stripping keys
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

// export declare const getMatch: <T extends string, Members extends Record<string, AnyD>>(decoder: {
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
// use case: form
// -------------------------------------------------------------------------------------

// const MyForm = fromStruct({
//   name: NonEmptyStringD,
//   age: number
// })

// pipe(
//   MyForm,
//   mapLeft((e) => {
//     // const errors: RNEA.ReadonlyNonEmptyArray<KeyE<"name", RefineE<LeafE<NonEmptyStringE>>> | KeyE<"age", NumberLE>>
//     const errors = e.errors
//     console.log(errors)
//     return e
//   })
// )

// const d = fromSum('_tag')({
//   A: fromStruct({
//     _tag: literal('A'),
//     a: string
//   }),
//   B: fromStruct({
//     _tag: literal('B'),
//     b: number
//   })
// })

// pipe(
//   d,
//   mapLeft((de) => {
//     switch (de._tag) {
//       case 'TagNotFoundE': {
//         return de.tag
//       }
//       case 'SumE': {
//         pipe(
//           de.errors,
//           RNEA.map((e) => {
//             switch (e.member) {
//               case 'A':
//                 return pipe(
//                   e.error.errors,
//                   RNEA.map((x) => x)
//                 )
//               case 'B':
//                 return pipe(
//                   e.error.errors,
//                   RNEA.map((x) => x)
//                 )
//             }
//           })
//         )
//       }
//     }
//   })
// )

// -------------------------------------------------------------------------------------
// examples
// -------------------------------------------------------------------------------------

// // literal
// export const LDU = literal(1, true)
// export type LDUI = InputOf<typeof LDU>
// export type LDUE = ErrorOf<typeof LDU>
// export type LDUA = TypeOf<typeof LDU>

// // fromStruct
// export const SD = fromStruct({
//   a: string,
//   b: number
// })
// export type SDI = InputOf<typeof SD>
// export type SDE = ErrorOf<typeof SD>
// export type SDA = TypeOf<typeof SD>

// // struct
export const SUD = struct({
  a: string,
  b: number
})
export type SUDI = InputOf<typeof SUD>
export type SUDE = ErrorOf<typeof SUD>
export type SUDA = TypeOf<typeof SUD>

// // fromPartial
// export const PSD = fromPartial({
//   a: string,
//   b: number
// })
// export type PSDI = InputOf<typeof PSD>
// export type PSDE = ErrorOf<typeof PSD>
// export type PSDA = TypeOf<typeof PSD>

// // partial
// export const PSUD = partial({
//   a: string,
//   b: number
// })
// export type PSUDE = ErrorOf<typeof PSUD>
// export type PSUDA = TypeOf<typeof PSUD>

// // fromTuple
// export const TD = fromTuple(string, number)
// export type TDI = InputOf<typeof TD>
// export type TDE = ErrorOf<typeof TD>
// export type TDA = TypeOf<typeof TD>

// // tuple
// export const TUD = tuple(string, number)
// export type TUDE = ErrorOf<typeof TUD>
// export type TUDA = TypeOf<typeof TUD>

// // fromArray
// export const AD = fromArray(string)
// export type ADI = InputOf<typeof AD>
// export type ADE = ErrorOf<typeof AD>
// export type ADA = TypeOf<typeof AD>

// // array
// export const AUD = array(string)

// // fromRecord
// export const RD = fromRecord(number)
// export type RDI = InputOf<typeof RD>
// export type RDE = ErrorOf<typeof RD>
// export type RDA = TypeOf<typeof RD>

// // record
// export const RUD = record(number)

// // refine
// export type IntDI = InputOf<typeof IntD>
// export type IntDE = ErrorOf<typeof IntD>
// export type IntDA = TypeOf<typeof IntD>

// export const IntUD = pipe(number, compose(IntD))
// export type IntUDE = ErrorOf<typeof IntUD>
// export type IntUDA = TypeOf<typeof IntUD>

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
// declare const parseNumber: (s: string) => Result<ParseNumberE, number>
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
