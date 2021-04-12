import * as E from 'fp-ts/lib/Either'
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
  W = "Warning"

*/

export interface KeyW {
  readonly _tag: 'KeyW'
  readonly key: string
}
export const keyW = (key: string): KeyW => ({ _tag: 'KeyW', key })

export interface UnexpectedKeyW {
  readonly _tag: 'UnexpectedKeyW'
  readonly key: string
}
export const unexpectedKeyW = (key: string): UnexpectedKeyW => ({ _tag: 'UnexpectedKeyW', key })

export interface ComponentW {
  readonly _tag: 'ComponentW'
  readonly component: number
}
export const componentW = (component: number): ComponentW => ({ _tag: 'ComponentW', component })

export interface UnexpectedComponentW {
  readonly _tag: 'UnexpectedComponentW'
  readonly component: number
}
export const unexpectedComponentW = (component: number): UnexpectedComponentW => ({
  _tag: 'UnexpectedComponentW',
  component
})

export interface IndexW {
  readonly _tag: 'IndexW'
  readonly index: number
}
export const indexW = (index: number): IndexW => ({ _tag: 'IndexW', index })

export interface NaNW {
  readonly _tag: 'NaNW'
}
export const naNW: NaNW = { _tag: 'NaNW' }

export type Warning = KeyW | UnexpectedKeyW | ComponentW | UnexpectedComponentW | IndexW | NaNW

export interface Warnings extends Forest<Warning> {}

export type Result<E, A> = readonly [E.Either<E, A>, Warnings]

export const result = <E, A>(e: E.Either<E, A>, w: Warnings): Result<E, A> => [e, w]

export const rmap = <A, B>(f: (a: A) => B) => <E>(fa: Result<E, A>): Result<E, B> =>
  result(pipe(fa[0], E.map(f)), fa[1])

export const rchainW = <E2, A, B>(f: (a: A) => Result<E2, B>) => <E1>(ma: Result<E1, A>): Result<E1 | E2, B> => {
  const [e1, w1] = ma
  if (E.isLeft(e1)) {
    return result(e1, w1)
  }
  const [e2, w2] = f(e1.right)
  return result(e2, [...w1, ...w2])
}

export const rmapLeft = <E, G>(f: (e: E) => G) => <A>(fa: Result<E, A>): Result<G, A> =>
  result(pipe(fa[0], E.mapLeft(f)), fa[1])

export interface Decoder<I, E, A> {
  readonly decode: (i: I) => Result<E, A>
}

interface AnyD extends Decoder<any, any, any> {}
interface AnyUD extends Decoder<unknown, any, any> {}

export type InputOf<D> = D extends Decoder<infer I, any, any> ? I : never
export type ErrorOf<D> = D extends Decoder<any, infer E, any> ? E : never
export type TypeOf<D> = D extends Decoder<any, any, infer A> ? A : never

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

export const success = <E = never, A = never>(a: A, w: Warnings = RA.empty): Result<E, A> => result(E.right(a), w)

export const failure = <E = never, A = never>(e: E, w: Warnings = RA.empty): Result<E, A> => result(E.left(e), w)

// -------------------------------------------------------------------------------------
// pipeables
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
      rmapLeft((de) => f(de, i))
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
  decode: flow(decoder.decode, rmap(f)),
  decoder,
  map: f
})

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

export interface StructE<E> extends CompoundE<E> {
  readonly _tag: 'StructE'
}
export const structE = <E>(errors: ReadonlyNonEmptyArray<E>): StructE<E> => ({ _tag: 'StructE', errors })

export interface PartialE<E> extends CompoundE<E> {
  readonly _tag: 'PartialE'
}

export interface RecordE<E> extends ActualE<Readonly<Record<string, unknown>>>, CompoundE<E> {
  readonly _tag: 'RecordE'
}

export interface ComponentE<I, E> extends SingleE<E> {
  readonly _tag: 'ComponentE'
  readonly index: I
}
export const componentE = <I, E>(index: I, error: E): ComponentE<I, E> => ({
  _tag: 'ComponentE',
  index,
  error
})

export interface TupleE<E> extends CompoundE<E> {
  readonly _tag: 'TupleE'
}
export const tupleE = <E>(errors: ReadonlyNonEmptyArray<E>): TupleE<E> => ({ _tag: 'TupleE', errors })

export interface IndexE<I, E> extends SingleE<E> {
  readonly _tag: 'IndexE'
  readonly index: I
}
export const indexE = <I, E>(index: I, error: E): IndexE<I, E> => ({
  _tag: 'IndexE',
  index,
  error
})

export interface ArrayE<E> extends ActualE<ReadonlyArray<unknown>>, CompoundE<E> {
  readonly _tag: 'ArrayE'
}
export const arrayE = <E>(actual: ReadonlyArray<unknown>, errors: ReadonlyNonEmptyArray<E>): ArrayE<E> => ({
  _tag: 'ArrayE',
  actual,
  errors
})

export interface UnionE<E> extends CompoundE<E> {
  readonly _tag: 'UnionE'
}

export interface RefineE<E> extends SingleE<E> {
  readonly _tag: 'RefineE'
}
export const refineE = <E>(error: E): RefineE<E> => ({ _tag: 'RefineE', error })

export interface ParseE<E> extends SingleE<E> {
  readonly _tag: 'ParseE'
}

export interface IntersectionE<E> extends CompoundE<E> {
  readonly _tag: 'IntersectionE'
}

export interface LazyE<E> extends SingleE<E> {
  readonly _tag: 'LazyE'
  readonly id: string
}

export interface MemberE<M, E> extends SingleE<E> {
  readonly _tag: 'MemberE'
  readonly member: M
}

export interface TagNotFoundE<T, E> extends SingleE<E> {
  readonly _tag: 'TagNotFoundE'
  readonly tag: T
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

// recursive helpers to please ts@3.5
export interface NullableRE<E> extends NullableE<DecodeError<E>> {}
export interface RefineRE<E> extends RefineE<DecodeError<E>> {}
export interface ParseRE<E> extends ParseE<DecodeError<E>> {}
export interface StructRE<E> extends StructE<DecodeError<E>> {}
export interface KeyRE<E> extends KeyE<string, DecodeError<E>> {}
export interface PartialRE<E> extends PartialE<DecodeError<E>> {}
export interface TupleRE<E> extends TupleE<DecodeError<E>> {}
export interface ComponentRE<E> extends ComponentE<string, DecodeError<E>> {}
export interface IndexRE<E> extends IndexE<number, DecodeError<E>> {}
export interface ArrayRE<E> extends ArrayE<DecodeError<E>> {}
export interface RecordRE<E> extends RecordE<DecodeError<E>> {}
export interface UnionRE<E> extends UnionE<DecodeError<E>> {}
export interface MemberRE<E> extends MemberE<string | number, DecodeError<E>> {}
export interface IntersectionRE<E> extends IntersectionE<DecodeError<E>> {}
export interface TagNotFoundRE<E> extends TagNotFoundE<string, DecodeError<E>> {}
export interface SumRE<E> extends SumE<DecodeError<E>> {}
export interface LazyRE<E> extends LazyE<DecodeError<E>> {}
export type DecodeError<E> =
  | LeafE<E>
  | NullableRE<E>
  | RefineRE<E>
  | ParseRE<E>
  | StructRE<E>
  | KeyRE<E>
  | PartialRE<E>
  | TupleRE<E>
  | ComponentRE<E>
  | IndexRE<E>
  | ArrayRE<E>
  | RecordRE<E>
  | UnionRE<E>
  | MemberRE<E>
  | IntersectionRE<E>
  | TagNotFoundRE<E>
  | SumRE<E>
  | LazyRE<E>

// -------------------------------------------------------------------------------------
// error utils
// -------------------------------------------------------------------------------------

export type BuiltinE =
  | StringE
  | NumberE
  | BooleanE
  | UnknownRecordE
  | UnknownArrayE
  | LiteralE<Literal>
  | MessageE<unknown>

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
  decode: (u) => (typeof u === 'string' ? success(u) : failure(leafE({ _tag: 'StringE', actual: u })))
}

export interface NumberE extends ActualE<unknown> {
  readonly _tag: 'NumberE'
}
export interface NumberLE extends LeafE<NumberE> {}
export interface numberUD extends Decoder<unknown, NumberLE, number> {
  readonly _tag: 'numberUD'
}
export const number: numberUD = {
  _tag: 'numberUD',
  decode: (u) =>
    typeof u === 'number'
      ? isNaN(u)
        ? success(u, [tree(naNW)])
        : success(u)
      : failure(leafE({ _tag: 'NumberE', actual: u }))
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
  decode: (u) => (Array.isArray(u) ? success(u) : failure(unknownArrayE(u)))
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
  decode: (u) => (isUnknownRecord(u) ? success(u) : failure(unknownRecordE(u)))
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
    const es: Array<{ readonly [K in keyof Properties]: KeyE<K, ErrorOf<Properties[K]>> }[keyof Properties]> = []
    const ws: Array<Tree<Warning>> = []
    for (const k in ur) {
      if (!properties.hasOwnProperty(k)) {
        ws.push(tree(unexpectedKeyW(k)))
      }
    }
    const ar: Record<string, unknown> = {}
    for (const k in properties) {
      const [e, w] = properties[k].decode(ur[k])
      if (RA.isNonEmpty(w)) {
        ws.push(tree(keyW(k), w))
      }
      if (E.isLeft(e)) {
        es.push(keyE(k, true, e.left))
      } else {
        ar[k] = e.right
      }
    }
    return RA.isNonEmpty(es) ? failure(structE(es), ws) : success(ar as any, ws)
  }
})

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

export const fromArray = <Item extends AnyD>(item: Item): FromArrayD<Item> => ({
  _tag: 'FromArrayD',
  item,
  decode: (us) => {
    const es: Array<IndexE<number, ErrorOf<typeof item>>> = []
    const ws: Array<Tree<Warning>> = []
    const as: Array<TypeOf<typeof item>> = []
    for (let index = 0; index < us.length; index++) {
      const [e, w] = item.decode(us[index])
      if (RA.isNonEmpty(w)) {
        ws.push(tree(indexW(index), w))
      }
      if (E.isLeft(e)) {
        es.push(indexE(index, e.left))
      } else {
        as[index] = e.right
      }
    }
    return RA.isNonEmpty(es) ? failure(arrayE(us, es), ws) : success(as, ws)
  }
})

export interface ArrayD<Item>
  extends Decoder<unknown, UnknownArrayLE | ArrayE<IndexE<number, ErrorOf<Item>>>, Array<TypeOf<Item>>> {
  readonly _tag: 'ArrayD'
  readonly item: Item
}
export const array = <Item extends AnyUD>(item: Item): ArrayD<Item> => {
  const fromArrayItem = fromArray(item)
  return {
    _tag: 'ArrayD',
    item,
    decode: (u) =>
      pipe(
        UnknownArray.decode(u),
        rchainW((us) => fromArrayItem.decode(us as any))
      )
  }
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

export interface FromTupleD<Components extends ReadonlyArray<AnyD>>
  extends Decoder<
    { [K in keyof Components]: InputOf<Components[K]> },
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
    const es: Array<ComponentE<number, ErrorOf<ErrorOf<Components[number]>>>> = []
    const ws: Array<Tree<Warning>> = []
    let index: number
    for (index = components.length; index < us.length; index++) {
      ws.push(tree(unexpectedComponentW(index)))
    }
    const as: Array<unknown> = []
    for (index = 0; index < components.length; index++) {
      const [e, w] = components[index].decode(us[index])
      if (RA.isNonEmpty(w)) {
        ws.push(tree(componentW(index), w))
      }
      if (E.isLeft(e)) {
        es.push(componentE(index, e.left))
      } else {
        as[index] = e.right
      }
    }
    return RA.isNonEmpty(es) ? failure(tupleE(es), ws) : success(as as any, ws)
  }
})

export interface TupleD<Components extends ReadonlyArray<AnyUD>>
  extends Decoder<
    unknown,
    UnknownArrayLE | TupleE<{ [K in keyof Components]: ComponentE<K, ErrorOf<Components[K]>> }[number]>,
    { [K in keyof Components]: TypeOf<Components[K]> }
  > {
  readonly _tag: 'TupleD'
  readonly components: Components
}

export const tuple = <Components extends ReadonlyArray<AnyUD>>(...components: Components): TupleD<Components> => {
  const fromTupleComponents = fromTuple(...components)
  return {
    _tag: 'TupleD',
    components,
    decode: (u) =>
      pipe(
        UnknownArray.decode(u),
        rchainW((us) => fromTupleComponents.decode(us as any))
      )
  }
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

export interface NullableD<Or> extends Decoder<null | InputOf<Or>, NullableE<ErrorOf<Or>>, null | TypeOf<Or>> {
  readonly _tag: 'NullableD'
  readonly or: Or
}
export declare const nullable: <Or extends AnyD>(or: Or) => NullableD<Or>

export interface RefineD<From, E, B extends TypeOf<From>>
  extends Decoder<InputOf<From>, ErrorOf<From> | RefineE<E>, B> {
  readonly _tag: 'RefineD'
  readonly from: From
  readonly parser: (a: TypeOf<From>) => Result<E, B>
}
export const refine = <From extends AnyD, B extends TypeOf<From>, E>(parser: (a: TypeOf<From>) => Result<E, B>) => (
  from: From
): RefineD<From, E, B> => ({
  _tag: 'RefineD',
  from,
  parser,
  decode: (i) => pipe(from.decode(i), rchainW(parser), rmapLeft(refineE))
})
export const fromRefinement = <From extends AnyD, B extends TypeOf<From>, E>(
  refinement: Refinement<TypeOf<From>, B>,
  error: (from: TypeOf<From>) => E
): ((from: From) => RefineD<From, E, B>) => refine((a) => (refinement(a) ? success(a) : failure(error(a))))

export interface ParseD<From, E, B> extends Decoder<InputOf<From>, ErrorOf<From> | ParseE<E>, B> {
  readonly _tag: 'ParseD'
  readonly from: From
  readonly parser: (a: TypeOf<From>) => Result<E, B>
}
export declare const parse: <From extends AnyD, E, B>(
  parser: (a: TypeOf<From>) => Result<E, B>
) => (from: From) => ParseD<From, E, B>

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
    | TagNotFoundE<T, LiteralE<keyof Members>>
    | SumE<{ [K in keyof Members]: MemberE<K, ErrorOf<Members[K]>> }[keyof Members]>,
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

export interface StructD<Properties>
  extends Decoder<
    unknown,
    UnknownRecordLE | StructE<{ readonly [K in keyof Properties]: KeyE<K, ErrorOf<Properties[K]>> }[keyof Properties]>,
    { [K in keyof Properties]: TypeOf<Properties[K]> }
  > {
  readonly _tag: 'StructD'
  readonly properties: Properties
}
export const struct = <Properties extends Record<string, AnyUD>>(properties: Properties): StructD<Properties> => {
  const fromStructProperties = fromStruct(properties)
  return {
    _tag: 'StructD',
    properties,
    decode: (u) =>
      pipe(
        UnknownRecord.decode(u),
        rchainW((ur) => fromStructProperties.decode(ur as any))
      )
  }
}

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

export interface RecordD<Codomain>
  extends Decoder<
    unknown,
    UnknownRecordLE | RecordE<KeyE<string, ErrorOf<Codomain>>>,
    Record<string, TypeOf<Codomain>>
  > {
  readonly _tag: 'RecordD'
  readonly codomain: Codomain
}
export declare const record: <Codomain extends AnyUD>(codomain: Codomain) => RecordD<Codomain>

export interface SumD<T extends string, Members>
  extends Decoder<
    unknown,
    | UnknownRecordLE
    | TagNotFoundE<T, LiteralE<keyof Members>>
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
// composition
// -------------------------------------------------------------------------------------

export interface IdentityD<A> extends Decoder<A, never, A> {
  readonly _tag: 'IdentityD'
}

export const id = <A>(): IdentityD<A> => ({
  _tag: 'IdentityD',
  decode: success
})

export interface CompositionD<F, S> extends Decoder<InputOf<F>, ErrorOf<F> | ErrorOf<S>, TypeOf<S>> {
  readonly _tag: 'CompositionD'
  readonly first: F
  readonly second: S
}

export const compose = <S extends AnyD>(second: S) => <F extends AnyD>(first: F): CompositionD<F, S> => ({
  _tag: 'CompositionD',
  first,
  second,
  decode: flow(first.decode, rchainW(second.decode))
})

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

export const URI = 'io-ts/Decoder-Tuple2'

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
// type MapLeftExampleE = UnknownArrayLE | TupleE<ComponentE<"0", StringLE> | ComponentE<"1", NumberLE>>
export type MapLeftExampleE = ErrorOf<typeof MapLeftExample>

// ...this means that you can pattern match on the error
// when you are mapping
export const result1 = pipe(
  MapLeftExample,
  mapLeft((de) => {
    switch (de._tag) {
      case 'LeafE':
        // const leafE: UnknownArrayE
        const leafE = de.error
        return `cannot decode ${leafE.actual}, should be a Record<string, unknown>`
      case 'TupleE':
        // const errors: RNEA.ReadonlyNonEmptyArray<ComponentE<"0", StringLE> | ComponentE<"1", NumberLE>>
        const errors = de.errors
        return errors
          .map((e): string => {
            switch (e.index) {
              case '0':
                return e.error.error._tag
              case '1':
                return e.error.error._tag
            }
          })
          .join('\n')
    }
  })
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
      case 'RefineE':
        return tree(`1 error(s) found while decoding a refinement`, [go(de.error)])
      default:
        // etc...
        return tree('TODO')
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

export const draw = rmapLeft(flow(toTree, drawTree))

const toForestW = (w: Warnings): Forest<string> => {
  const gow = (w: Warning): string => {
    switch (w._tag) {
      case 'ComponentW':
        return `component ${JSON.stringify(w.component)}`
      case 'IndexW':
        return `index ${JSON.stringify(w.index)}`
      case 'KeyW':
        return `key ${JSON.stringify(w.key)}`
      case 'UnexpectedKeyW':
        return `unexpected key ${JSON.stringify(w.key)}`
      case 'UnexpectedComponentW':
        return `unexpected component ${JSON.stringify(w.component)}`
      case 'NaNW':
        return 'value is NaN'
    }
  }
  const go = (w: Tree<Warning>): Tree<string> => tree(gow(w.value), w.forest.map(go))
  return w.map(go)
}
const printValue = <A>(a: A): string => 'Value:\n' + JSON.stringify(a, null, 2)
const printErrors = (s: string): string => (s === '' ? s : 'Errors:\n' + s)
const printWarnings = (w: Warnings): string => (w.length === 0 ? '' : '\n' + drawTree(tree('Warnings:', toForestW(w))))

export const print = <A>(ma: Result<string, A>): string => {
  const [e, w] = ma
  return pipe(e, E.fold(printErrors, printValue)) + printWarnings(w)
}

const DR1 = tuple(string, number)

export const treeLeft1 = pipe(DR1, mapLeft(toTree))

// what if the decoder contains a custom error?

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

const DR2 = tuple(string, IntUD)

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

const nonEmptyStringE = (actual: string): NonEmptyStringE => ({ _tag: 'NonEmptyStringE', actual })

export const NonEmptyStringD = pipe(
  id<string>(),
  fromRefinement(
    (s): s is NonEmptyString => s.length > 0,
    (actual) => leafE(nonEmptyStringE(actual))
  )
)

export const NonEmptyStringUD = pipe(string, compose(NonEmptyStringD))

// -------------------------------------------------------------------------------------
// use case: new decoder, custom error message
// -------------------------------------------------------------------------------------

export interface PositiveBrand {
  readonly Positive: unique symbol
}

export type Positive = number & PositiveBrand

const Positive = pipe(
  number,
  fromRefinement(
    (n): n is Positive => n > 0,
    (n) => message(n, `cannot decode ${n}, expected a positive number`)
  )
)

// pipe(Positive.decode(-1), draw, print, console.log)

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
      ? failure(message(s, 'too short'))
      : s.length > 4
      ? failure(message(s, 'too long'))
      : USERNAME_REGEX.test(s)
      ? failure(message(s, 'bad characters'))
      : success(s as Username)
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

export const warningsStruct = struct({
  a: string,
  b: struct({
    c: number
  })
})

pipe(
  warningsStruct.decode({
    a: 'a',
    b: {
      c: 1,
      e: 2,
      f: {
        h: 3
      }
    },
    d: 1
  }),
  draw,
  print,
  console.log
)
/*
Value:
{
  "a": "a",
  "b": {
    "c": 1
  }
}
Warnings:
├─ unexpected key "d"
└─ key "b"
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
// export const SUD = struct({
//   a: string,
//   b: number
// })
// export type SUDI = InputOf<typeof SUD>
// export type SUDE = ErrorOf<typeof SUD>
// export type SUDA = TypeOf<typeof SUD>

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
