import { Bifunctor3 } from 'fp-ts/lib/Bifunctor'
import { flow, Lazy } from 'fp-ts/lib/function'
import { Functor3 } from 'fp-ts/lib/Functor'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import * as RA from 'fp-ts/lib/ReadonlyArray'
import * as RNEA from 'fp-ts/lib/ReadonlyNonEmptyArray'
import * as TH from 'fp-ts/lib/These'
import * as util from 'util'

import These = TH.These
import ReadonlyNonEmptyArray = RNEA.ReadonlyNonEmptyArray

/*

  BREAKING CHANGES

  - Either -> These
  - error model
  - `mapLeftWithInput`
  - `refine`
  - `parse`

*/

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

export interface AnyD extends Decoder<any, any, any> {}
export interface AnyUD extends Decoder<unknown, any, any> {}

export type InputOf<D> = D extends Decoder<infer I, any, any> ? I : never
export type ErrorOf<D> = D extends Decoder<any, infer E, any> ? E : never
export type TypeOf<D> = D extends Decoder<any, any, infer A> ? A : never

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

export const URI = 'io-ts/poc'

export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind3<R, E, A> {
    readonly [URI]: Decoder<R, E, A>
  }
}

export const Functor: Functor3<URI> = {
  URI,
  map: (fa, f) => pipe(fa, map(f))
}

export const Bifunctor: Bifunctor3<URI> = {
  URI,
  mapLeft: (fa, f) => pipe(fa, mapLeft(f)),
  bimap: (fea, f, g) => pipe(fea, mapLeft(f), map(g))
}

// -------------------------------------------------------------------------------------
// decoding constructors
// -------------------------------------------------------------------------------------

// success
export const success = TH.right

// failure
export const failure = TH.left

// warning
export const warning = TH.both

// -------------------------------------------------------------------------------------
// Bifunctor
// -------------------------------------------------------------------------------------

export interface MapLeftD<D, E> extends Decoder<InputOf<D>, E, TypeOf<D>> {
  readonly _tag: 'MapLeftD'
  readonly decoder: D
  readonly mapLeft: (de: ErrorOf<D>) => E
}

export function mapLeft<D extends AnyD, E>(f: (de: ErrorOf<D>) => E): (decoder: D) => MapLeftD<D, E>
export function mapLeft<E1, I, E2>(f: (e: E1) => E2): <A>(decoder: Decoder<I, E1, A>) => MapLeftD<typeof decoder, E2> {
  return (decoder) => ({
    _tag: 'MapLeftD',
    decode: flow(decoder.decode, TH.mapLeft(f)),
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
// Category
// -------------------------------------------------------------------------------------

export interface IdentityD<A> extends Decoder<A, never, A> {
  readonly _tag: 'IdentityD'
}

export const id = <A = never>(): IdentityD<A> => ({
  _tag: 'IdentityD',
  decode: TH.right
})

export interface CompositionE<P, N> extends CompoundE<PrevE<ErrorOf<P>> | NextE<ErrorOf<N>>> {}
export interface CompositionD<P, N> extends Decoder<InputOf<P>, CompositionE<P, N>, TypeOf<N>> {
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
        (e1) => failure(compositionE([prevE(e1)])),
        (a) =>
          pipe(
            next.decode(a),
            TH.mapLeft((e) => compositionE([nextE(e)]))
          ),
        (w1, a) =>
          pipe(
            next.decode(a),
            TH.fold(
              (e2) => failure(compositionE([prevE(w1), nextE(e2)])),
              (b) => warning(compositionE([prevE(w1)]), b),
              (w2, b) => warning(compositionE([prevE(w1), nextE(w2)]), b)
            )
          )
      )
    )
  })
}

// -------------------------------------------------------------------------------------
// error model
// -------------------------------------------------------------------------------------

export interface RequiredKeyE<K, E> {
  readonly _tag: 'RequiredKeyE'
  readonly key: K
  readonly error: E
}
export const requiredKeyE = <K, E>(key: K, error: E): RequiredKeyE<K, E> => ({
  _tag: 'RequiredKeyE',
  key,
  error
})

export interface OptionalKeyE<K, E> {
  readonly _tag: 'OptionalKeyE'
  readonly key: K
  readonly error: E
}
export const optionalKeyE = <K, E>(key: K, error: E): OptionalKeyE<K, E> => ({
  _tag: 'OptionalKeyE',
  key,
  error
})

export interface RequiredIndexE<I, E> {
  readonly _tag: 'RequiredIndexE'
  readonly index: I
  readonly error: E
}
export const requiredIndexE = <I, E>(index: I, error: E): RequiredIndexE<I, E> => ({
  _tag: 'RequiredIndexE',
  index,
  error
})

export interface OptionalIndexE<I, E> {
  readonly _tag: 'OptionalIndexE'
  readonly index: I
  readonly error: E
}
export const optionalIndexE = <I, E>(index: I, error: E): OptionalIndexE<I, E> => ({
  _tag: 'OptionalIndexE',
  index,
  error
})

export interface LazyE<E> {
  readonly _tag: 'LazyE'
  readonly id: string
  readonly error: E
}
export const lazyE = <E>(id: string, error: E): LazyE<E> => ({ _tag: 'LazyE', id, error })

export interface MemberE<M, E> {
  readonly _tag: 'MemberE'
  readonly member: M
  readonly error: E
}
export const memberE = <M, E>(member: M, error: E): MemberE<M, E> => ({ _tag: 'MemberE', member, error })

export interface LeafE<E> {
  readonly _tag: 'LeafE'
  readonly error: E
}
export const leafE = <E>(error: E): LeafE<E> => ({ _tag: 'LeafE', error })

export interface TagE {
  readonly _tag: 'TagE'
  readonly tag: string
  readonly literals: ReadonlyArray<string>
}
export interface TagLE extends LeafE<TagE> {}
export const tagLE = (tag: string, literals: ReadonlyArray<string>): TagLE => leafE({ _tag: 'TagE', tag, literals })

export interface NoMembersE {
  readonly _tag: 'NoMembersE'
}
export interface NoMembersLE extends LeafE<NoMembersE> {}
export const noMembersLE: NoMembersLE = leafE({
  _tag: 'NoMembersE'
})

export interface NullableE<E> {
  readonly _tag: 'NullableE'
  readonly error: E
}
export const nullableE = <E>(error: E): NullableE<E> => ({ _tag: 'NullableE', error })

export interface PrevE<E> {
  readonly _tag: 'PrevE'
  readonly error: E
}
export const prevE = <E>(error: E): PrevE<E> => ({ _tag: 'PrevE', error })

export interface NextE<E> {
  readonly _tag: 'NextE'
  readonly error: E
}
export const nextE = <E>(error: E): NextE<E> => ({ _tag: 'NextE', error })

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

export interface SumE<E> {
  readonly _tag: 'SumE'
  readonly error: E
}
export const sumE = <E>(error: E): SumE<E> => ({
  _tag: 'SumE',
  error
})

export interface MessageE {
  readonly _tag: 'MessageE'
  readonly message: string
}
export interface MessageLE extends LeafE<MessageE> {}
export const messageE = (message: string): MessageE => ({
  _tag: 'MessageE',
  message
})
export const messageLE: (message: string) => MessageLE = flow(messageE, leafE)

export const message = messageLE

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

// Compound errors

export interface CompoundE<E> {
  readonly _tag: 'CompoundE'
  readonly name: string
  readonly errors: ReadonlyNonEmptyArray<E>
}
export const compoundE = (name: string) => <E>(errors: ReadonlyNonEmptyArray<E>): CompoundE<E> => ({
  _tag: 'CompoundE',
  name,
  errors
})

export const unionE = compoundE('union')

export const structE = compoundE('struct')

export const partialE = compoundE('partial')

export const recordE = compoundE('record')

export const tupleE = compoundE('tuple')

export const arrayE = compoundE('array')

export const compositionE = compoundE('composition')

export const intersectionE = compoundE('intersection')

// recursive helpers to please ts@3.5
export interface NullableRE<E> extends NullableE<DecodeError<E>> {}
export interface PrevRE<E> extends PrevE<DecodeError<E>> {}
export interface NextRE<E> extends NextE<DecodeError<E>> {}
export interface RequiredKeyRE<E> extends RequiredKeyE<string, DecodeError<E>> {}
export interface OptionalKeyRE<E> extends OptionalKeyE<string, DecodeError<E>> {}
export interface RequiredIndexRE<E> extends RequiredIndexE<string | number, DecodeError<E>> {}
export interface OptionalIndexRE<E> extends OptionalIndexE<number, DecodeError<E>> {}
export interface MemberRE<E> extends MemberE<string | number, DecodeError<E>> {}
export interface LazyRE<E> extends LazyE<DecodeError<E>> {}
export interface SumRE<E> extends SumE<DecodeError<E>> {}
export interface CompoundRE<E> extends CompoundE<DecodeError<E>> {}

export type DecodeError<E> =
  | UnexpectedKeysE
  | MissingKeysE
  | UnexpectedIndexesE
  | MissingIndexesE
  | LeafE<E>
  | NullableRE<E>
  | PrevRE<E>
  | NextRE<E>
  | RequiredKeyRE<E>
  | OptionalKeyRE<E>
  | RequiredIndexRE<E>
  | OptionalIndexRE<E>
  | MemberRE<E>
  | LazyRE<E>
  | SumRE<E>
  | CompoundRE<E>

export type BuiltinE =
  | StringE
  | NumberE
  | BooleanE
  | UnknownRecordE
  | UnknownArrayE
  | LiteralE<Literal>
  | MessageE
  | NaNE
  | InfinityE
  | TagE
  | NoMembersE

// -------------------------------------------------------------------------------------
// decoder primitives
// -------------------------------------------------------------------------------------

export interface StringE {
  readonly _tag: 'StringE'
  readonly actual: unknown
}
export interface StringLE extends LeafE<StringE> {}
export const stringLE = (actual: unknown): StringLE => leafE({ _tag: 'StringE', actual })
export interface stringUD extends Decoder<unknown, StringLE, string> {
  readonly _tag: 'stringUD'
}
const isString = (u: unknown): u is string => typeof u === 'string'
export const string: stringUD = {
  _tag: 'stringUD',
  decode: (u) => (isString(u) ? success(u) : failure(stringLE(u)))
}

export interface NumberE {
  readonly _tag: 'NumberE'
  readonly actual: unknown
}
export interface NumberLE extends LeafE<NumberE> {}
export const numberLE = (actual: unknown): NumberLE => leafE({ _tag: 'NumberE', actual })
export interface NaNE {
  readonly _tag: 'NaNE'
}
export interface NaNLE extends LeafE<NaNE> {}
export const naNLE: NaNLE = leafE({ _tag: 'NaNE' })
export interface InfinityE {
  readonly _tag: 'InfinityE'
}
export interface InfinityLE extends LeafE<InfinityE> {}
export const infinityLE: InfinityLE = leafE({ _tag: 'InfinityE' })
export interface numberUD extends Decoder<unknown, NumberLE | NaNLE | InfinityLE, number> {
  readonly _tag: 'numberUD'
}
const isNumber = (u: unknown): u is number => typeof u === 'number'
export const number: numberUD = {
  _tag: 'numberUD',
  decode: (u) =>
    isNumber(u)
      ? isNaN(u)
        ? warning(naNLE, u)
        : isFinite(u)
        ? success(u)
        : warning(infinityLE, u)
      : failure(numberLE(u))
}

export interface BooleanE {
  readonly _tag: 'BooleanE'
  readonly actual: unknown
}
export interface BooleanLE extends LeafE<BooleanE> {}
export const booleanLE = (actual: unknown): BooleanLE => leafE({ _tag: 'BooleanE', actual })
export interface booleanUD extends Decoder<unknown, BooleanLE, boolean> {
  readonly _tag: 'booleanUD'
}
const isBoolean = (u: unknown): u is boolean => typeof u === 'boolean'
export const boolean: booleanUD = {
  _tag: 'booleanUD',
  decode: (u) => (isBoolean(u) ? success(u) : failure(booleanLE(u)))
}

export interface UnknownArrayE {
  readonly _tag: 'UnknownArrayE'
  readonly actual: unknown
}
export interface UnknownArrayLE extends LeafE<UnknownArrayE> {}
export const unknownArrayLE = (actual: unknown): UnknownArrayLE =>
  leafE({
    _tag: 'UnknownArrayE',
    actual
  })
export interface UnknownArrayUD extends Decoder<unknown, UnknownArrayLE, Array<unknown>> {
  readonly _tag: 'UnknownArrayUD'
}
export const UnknownArray: UnknownArrayUD = {
  _tag: 'UnknownArrayUD',
  decode: (u) => (Array.isArray(u) ? success(u) : failure(unknownArrayLE(u)))
}

export interface UnknownRecordE {
  readonly _tag: 'UnknownRecordE'
  readonly actual: unknown
}
export interface UnknownRecordLE extends LeafE<UnknownRecordE> {}
export const unknownRecordLE = (actual: unknown): UnknownRecordLE =>
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
  decode: (u) => (isUnknownRecord(u) ? success(u) : failure(unknownRecordLE(u)))
}

// -------------------------------------------------------------------------------------
// decoder constructors
// -------------------------------------------------------------------------------------

export type Literal = string | number | boolean | null | undefined | symbol

export interface LiteralE<A extends Literal> {
  readonly _tag: 'LiteralE'
  readonly literals: ReadonlyNonEmptyArray<A>
  readonly actual: unknown
}
export interface LiteralLE<A extends Literal> extends LeafE<LiteralE<A>> {}
export const literalLE = <A extends Literal>(actual: unknown, literals: ReadonlyNonEmptyArray<A>): LiteralLE<A> =>
  leafE({
    _tag: 'LiteralE',
    actual,
    literals
  })
export interface LiteralD<A extends ReadonlyNonEmptyArray<Literal>>
  extends Decoder<unknown, LiteralLE<A[number]>, A[number]> {
  readonly _tag: 'LiteralD'
  readonly literals: A
}

const isLiteral = <A extends ReadonlyNonEmptyArray<Literal>>(...literals: A) => (u: unknown): u is A[number] =>
  literals.findIndex((literal) => literal === u) !== -1

export const literal = <A extends ReadonlyNonEmptyArray<Literal>>(...literals: A): LiteralD<A> => {
  const is = isLiteral(...literals)
  return {
    _tag: 'LiteralD',
    literals,
    decode: (u) => (is(u) ? success(u) : failure(literalLE(u, literals)))
  }
}

// -------------------------------------------------------------------------------------
// decoder combinators
// -------------------------------------------------------------------------------------

export interface FromStructE<Properties>
  extends CompoundE<{ readonly [K in keyof Properties]: RequiredKeyE<K, ErrorOf<Properties[K]>> }[keyof Properties]> {}
export interface FromStructD<Properties>
  extends Decoder<
    { [K in keyof Properties]: InputOf<Properties[K]> },
    FromStructE<Properties>,
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
    return RA.isNonEmpty(es) ? (isBoth ? warning(structE(es), ar) : failure(structE(es))) : success(ar)
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
      return RA.isNonEmpty(es) ? warning(unexpectedKeysE(es), out) : success(ur)
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
    decode: (r) => {
      const es: Array<string> = []
      for (const k in properties) {
        if (!(k in r)) {
          es.push(k)
        }
      }
      return RA.isNonEmpty(es) ? failure(missingKeysE(es)) : success(r as any)
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

export interface FromPartialE<Properties>
  extends CompoundE<{ readonly [K in keyof Properties]: OptionalKeyE<K, ErrorOf<Properties[K]>> }[keyof Properties]> {}
export interface FromPartialD<Properties>
  extends Decoder<
    Partial<{ [K in keyof Properties]: InputOf<Properties[K]> }>,
    FromPartialE<Properties>,
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
    return RA.isNonEmpty(es) ? (isBoth ? warning(partialE(es), ar) : failure(partialE(es))) : success(ar)
  }
})

export interface PartialD<Properties>
  extends CompositionD<CompositionD<UnknownRecordUD, UnexpectedKeysD<Properties>>, FromPartialD<Properties>> {}

export function partial<Properties extends Record<PropertyKey, AnyUD>>(properties: Properties): PartialD<Properties>
export function partial(properties: Record<PropertyKey, AnyUD>): PartialD<typeof properties> {
  return pipe(UnknownRecord, compose(unexpectedKeys(properties)), compose(fromPartial(properties)))
}

export interface FromTupleE<Components extends ReadonlyArray<unknown>>
  extends CompoundE<{ [K in keyof Components]: RequiredIndexE<K, ErrorOf<Components[K]>> }[number]> {}
export interface FromTupleD<Components extends ReadonlyArray<unknown>>
  extends Decoder<
    { readonly [K in keyof Components]: InputOf<Components[K]> },
    FromTupleE<Components>,
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
    return RA.isNonEmpty(es) ? (isBoth ? warning(tupleE(es), as) : failure(tupleE(es))) : success(as)
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
      return RA.isNonEmpty(es) ? warning(unexpectedIndexesE(es), us.slice(0, components.length) as any) : success(us)
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
        if (len <= index) {
          es.push(index)
        }
      }
      return RA.isNonEmpty(es) ? failure(missingIndexesE(es)) : success(us as any)
    }
  }
}

export interface TupleD<Components extends ReadonlyArray<unknown>>
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

export interface FromArrayE<Item> extends CompoundE<OptionalIndexE<number, ErrorOf<Item>>> {}
export interface FromArrayD<Item> extends Decoder<Array<InputOf<Item>>, FromArrayE<Item>, Array<TypeOf<Item>>> {
  readonly _tag: 'FromArrayD'
  readonly item: Item
}

export function fromArray<Item extends AnyD>(item: Item): FromArrayD<Item>
export function fromArray<I, E, A>(item: Decoder<I, E, A>): FromArrayD<typeof item> {
  return {
    _tag: 'FromArrayD',
    item,
    decode: (us) => {
      const es: Array<OptionalIndexE<number, E>> = []
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
        return isBoth ? warning(arrayE(es), as) : failure(arrayE(es))
      }
      return success(as)
    }
  }
}

export interface ArrayD<Item> extends CompositionD<UnknownArrayUD, FromArrayD<Item>> {}
export function array<Item extends AnyUD>(item: Item): ArrayD<Item>
export function array<E, A>(item: Decoder<unknown, E, A>): ArrayD<typeof item> {
  return pipe(UnknownArray, compose(fromArray(item)))
}

export interface FromRecordE<Codomain> extends CompoundE<OptionalKeyE<string, ErrorOf<Codomain>>> {}
export interface FromRecordD<Codomain>
  extends Decoder<
    Record<PropertyKey, InputOf<Codomain>>,
    FromRecordE<Codomain>,
    Record<PropertyKey, TypeOf<Codomain>>
  > {
  readonly _tag: 'FromRecordD'
  readonly codomain: Codomain
}
export function fromRecord<Codomain extends AnyD>(codomain: Codomain): FromRecordD<Codomain>
export function fromRecord<I, E, A>(codomain: Decoder<I, E, A>): FromRecordD<typeof codomain> {
  return {
    _tag: 'FromRecordD',
    codomain,
    decode: (i) => {
      const es: Array<OptionalKeyE<string, E>> = []
      const r: Record<string, A> = {}
      let isBoth = true
      for (const k in i) {
        const de = codomain.decode(i[k])
        if (TH.isLeft(de)) {
          isBoth = false
          es.push(optionalKeyE(k, de.left))
        } else if (TH.isRight(de)) {
          r[k] = de.right
        } else {
          es.push(optionalKeyE(k, de.left))
          r[k] = de.right
        }
      }
      if (RA.isNonEmpty(es)) {
        return isBoth ? warning(recordE(es), r) : failure(recordE(es))
      }
      return success(r)
    }
  }
}

export interface RecordD<Codomain> extends CompositionD<UnknownRecordUD, FromRecordD<Codomain>> {}
export function record<Codomain extends AnyUD>(codomain: Codomain): RecordD<Codomain>
export function record<E, A>(codomain: Decoder<unknown, E, A>): RecordD<typeof codomain> {
  return pipe(UnknownRecord, compose(fromRecord(codomain)))
}

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

const append = <A>(end: A) => (init: ReadonlyArray<A>): ReadonlyNonEmptyArray<A> => {
  if (RA.isNonEmpty(init)) {
    const tail = init.slice(1)
    tail.push(end)
    return [init[0], ...tail]
  }
  return [end]
}

export interface UnionE<Members extends ReadonlyArray<AnyD>>
  extends CompoundE<{ [K in keyof Members]: MemberE<K, ErrorOf<Members[K]>> }[number]> {}
export interface UnionD<Members extends ReadonlyArray<AnyD>>
  extends Decoder<
    UnionToIntersection<InputOf<Members[number]>>,
    NoMembersLE | UnionE<Members>,
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
      return RA.isNonEmpty(es) ? failure(unionE(es)) : failure(noMembersLE)
    }
  }
}

export interface NullableD<D> extends Decoder<null | InputOf<D>, NullableE<ErrorOf<D>>, null | TypeOf<D>> {
  readonly _tag: 'NullableD'
  readonly or: D
}
export function nullable<D extends AnyD>(or: D): NullableD<D> {
  return {
    _tag: 'NullableD',
    or,
    decode: (i) => (i === null ? success(null) : pipe(or.decode(i), TH.mapLeft(nullableE)))
  }
}

export interface IntersectE<F, S> extends CompoundE<MemberE<0, ErrorOf<F>> | MemberE<1, ErrorOf<S>>> {}
export interface IntersectD<F, S> extends Decoder<InputOf<F> & InputOf<S>, IntersectE<F, S>, TypeOf<F> & TypeOf<S>> {
  readonly _tag: 'IntersectD'
  readonly first: F
  readonly second: S
}

type Prunable = ReadonlyArray<string>

const collectPrunable = <E>(de: DecodeError<E>): Prunable => {
  const go = (de: DecodeError<E>): Prunable => {
    switch (de._tag) {
      case 'CompoundE':
        return pipe(de.errors, RA.chain(go))
      case 'LazyE':
      case 'MemberE':
      case 'NextE':
      case 'NullableE':
      case 'PrevE':
      case 'SumE':
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

const prune = (prunable: Prunable, anticollision: string): (<E>(de: DecodeError<E>) => O.Option<DecodeError<E>>) => {
  const go = <E>(de: DecodeError<E>): O.Option<DecodeError<E>> => {
    switch (de._tag) {
      case 'CompoundE':
        return pipe(de.errors, RA.filterMap(prune(prunable, anticollision)), (pdes) =>
          RA.isNonEmpty(pdes) ? O.some(compoundE(de.name)(pdes)) : O.none
        )
      case 'SumE':
        return pipe(de.error, prune(prunable, anticollision), O.map(sumE))
      case 'NextE':
        return pipe(de.error, prune(prunable, anticollision), O.map(nextE))
      case 'NullableE':
        return pipe(de.error, prune(prunable, anticollision), O.map(nullableE))
      case 'PrevE':
        return pipe(de.error, prune(prunable, anticollision), O.map(prevE))
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

const emptyString = ''

const pruneAllUnexpected: <E>(de: DecodeError<E>) => O.Option<DecodeError<E>> = prune(RA.empty, emptyString)

const pruneDifference = <E1, E2>(
  de1: DecodeError<E1>,
  de2: DecodeError<E2>
): O.Option<CompoundE<MemberE<0, DecodeError<E1>> | MemberE<1, DecodeError<E2>>>> => {
  const pde1 = pipe(de1, prune(collectPrunable(de2), emptyString))
  const pde2 = pipe(de2, prune(collectPrunable(de1), emptyString))
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

/** @internal */
export const intersect_ = <A extends Intersecable, B extends Intersecable>(a: A, b: B): A & B => {
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

export function intersect<S extends Decoder<any, DecodeError<any>, any>>(
  second: S
): <F extends Decoder<any, DecodeError<any>, any>>(first: F) => IntersectD<F, S>
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
      const out: These<CompoundE<MemberE<0, DecodeError<E1>> | MemberE<1, DecodeError<E2>>>, A1 & A2> = pipe(
        first.decode(i),
        TH.fold(
          (de1) =>
            pipe(
              second.decode(i),
              TH.fold(
                (de2) => failure(intersectionE([memberE(0, de1), memberE(1, de2)])),
                () => failure(intersectionE([memberE(0, de1)])),
                (de2) => {
                  const pde2 = pruneAllUnexpected(de2)
                  return O.isSome(pde2)
                    ? failure(intersectionE([memberE(0, de1), memberE(1, pde2.value)]))
                    : failure(intersectionE([memberE(0, de1)]))
                }
              )
            ),
          (a1) =>
            pipe(
              second.decode(i),
              TH.fold(
                (de2) => failure(intersectionE([memberE(1, de2)])),
                (a2) => success(intersect_(a1, a2)),
                (de2, a2) => {
                  const pde2 = pruneAllUnexpected(de2)
                  return O.isSome(pde2)
                    ? warning(intersectionE([memberE(1, pde2.value)]), intersect_(a1, a2))
                    : success(intersect_(a1, a2))
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
                    ? failure(intersectionE([memberE(0, pde1.value), memberE(1, de2)]))
                    : failure(intersectionE([memberE(1, de2)]))
                },
                (a2) => {
                  const pde1 = pruneAllUnexpected(de1)
                  return O.isSome(pde1)
                    ? warning(intersectionE([memberE(0, pde1.value)]), intersect_(a1, a2))
                    : success(intersect_(a1, a2))
                },
                (de2, a2) => {
                  const difference = pruneDifference(de1, de2)
                  return O.isSome(difference)
                    ? warning(difference.value, intersect_(a1, a2))
                    : success(intersect_(a1, a2))
                }
              )
            )
        )
      )
      return out
    }
  })
}

export interface LazyD<I, E, A> extends Decoder<I, LazyE<E>, A> {
  readonly _tag: 'LazyD'
  readonly id: string
  readonly f: Lazy<Decoder<I, E, A>>
}
export const lazy = <I, E, A>(id: string, f: Lazy<Decoder<I, E, A>>): LazyD<I, E, A> => {
  const get = memoize<void, Decoder<I, E, A>>(f)
  return {
    _tag: 'LazyD',
    id,
    f,
    decode: (i) =>
      pipe(
        get().decode(i),
        TH.mapLeft((e) => lazyE(id, e))
      )
  }
}

export interface FromSumE<Members>
  extends SumE<{ [K in keyof Members]: MemberE<K, ErrorOf<Members[K]>> }[keyof Members]> {}
export interface FromSumD<T extends string, Members>
  extends Decoder<InputOf<Members[keyof Members]>, TagLE | FromSumE<Members>, TypeOf<Members[keyof Members]>> {
  readonly _tag: 'FromSumD'
  readonly tag: T
  readonly members: Members
}
export function fromSum<T extends string>(
  tag: T
): <Members extends Record<string, AnyD>>(members: Members) => FromSumD<T, Members>
export function fromSum<T extends string>(
  tag: T
): <I extends Record<T, PropertyKey>, E, A>(members: Record<I[T], Decoder<I, E, A>>) => FromSumD<T, typeof members> {
  return <I extends Record<T, PropertyKey>, E, A>(
    members: Record<I[T], Decoder<I, E, A>>
  ): FromSumD<T, typeof members> => {
    const literals = Object.keys(members)
    return {
      _tag: 'FromSumD',
      tag,
      members,
      decode: (i: I) => {
        const v = i[tag]
        const member: Decoder<I, E, A> = members[v]
        if (member) {
          return pipe(
            member.decode(i),
            TH.mapLeft((e) => sumE(memberE(v, e)))
          ) as any
        }
        return failure(tagLE(tag, literals))
      }
    }
  }
}

export interface SumD<T extends string, Members>
  extends CompositionD<UnionD<[UnknownRecordUD, UnknownArrayUD]>, FromSumD<T, Members>> {}

//                    tagged objects --v             v-- tagged tuples
const UnknownRecordArray = union(UnknownRecord, UnknownArray)

export function sum<T extends string>(
  tag: T
): <Members extends Record<string, AnyUD>>(members: Members) => SumD<T, Members>
export function sum<T extends string>(
  tag: T
): <E, A>(members: Record<string, Decoder<unknown, E, A>>) => SumD<T, typeof members> {
  const fromSumTag = fromSum(tag)
  return (members) => pipe(UnknownRecordArray, compose(fromSumTag(members)))
}

// -------------------------------------------------------------------------------------
// use cases
// -------------------------------------------------------------------------------------

import * as assert from 'assert'
import { HKT, URIS, Kind } from 'fp-ts/lib/HKT'

// -------------------------------------------------------------------------------------
// use case: custom errors #578
// -------------------------------------------------------------------------------------

// Let's say we want to check the minimum length of a string

// the model of the custom error
export interface MinLengthE<N extends number> {
  readonly _tag: 'MinLengthE'
  readonly minLength: N
  readonly actual: string
}

// all custom errors must be wrapped in a `LeafE` error
export interface MinLengthLE<N extends number> extends LeafE<MinLengthE<N>> {}

// constructor
export const minLengthLE = <N extends number>(minLength: N, actual: string): MinLengthLE<N> =>
  leafE({ _tag: 'MinLengthE', minLength, actual })

// custom combinator
export const minLength = <N extends number>(minLength: N): Decoder<string, MinLengthLE<N>, string> => ({
  decode: (s) => (s.length >= minLength ? success(s) : failure(minLengthLE(minLength, s)))
})

const string3 = minLength(3)
assert.deepStrictEqual(string3.decode('abc'), success('abc'))
assert.deepStrictEqual(string3.decode('a'), failure(minLengthLE(3, 'a')))

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
      case 'LeafE':
        return toTree(de.error)
      case 'NullableE':
        return tree(`1 error(s) found while decoding a nullable`, [go(de.error)])
      case 'PrevE':
      case 'NextE':
        return go(de.error)
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
      case 'LazyE':
        return tree(`1 error(s) found while decoding lazy decoder ${de.id}`, [go(de.error)])
      case 'SumE':
        return tree(`1 error(s) found while decoding a sum`, [go(de.error)])
      case 'CompoundE': {
        if (de.name === 'composition') {
          return de.errors.length === 1
            ? go(de.errors[0]) // less noise in the output if there's only one error
            : tree(`${de.errors.length} error(s) found while decoding (${de.name})`, de.errors.map(go))
        }
        return tree(`${de.errors.length} error(s) found while decoding (${de.name})`, de.errors.map(go))
      }
    }
  }
  return go
}

// this is exported because users may need to define a custom `toTree` function
export const format = (a: unknown): string => {
  if (typeof a === 'string') return JSON.stringify(a)
  return util.format(a)
}

export const toTreeBuiltin = (de: BuiltinE): Tree<string> => {
  switch (de._tag) {
    case 'StringE':
      return tree(`cannot decode ${format(de.actual)}, expected a string`)
    case 'NumberE':
      return tree(`cannot decode ${format(de.actual)}, expected a number`)
    case 'BooleanE':
      return tree(`cannot decode ${format(de.actual)}, expected a boolean`)
    case 'UnknownArrayE':
      return tree(`cannot decode ${format(de.actual)}, expected an array`)
    case 'UnknownRecordE':
      return tree(`cannot decode ${format(de.actual)}, expected an object`)
    case 'LiteralE':
      return tree(
        `cannot decode ${format(de.actual)}, expected one of ${de.literals
          .map((literal) => JSON.stringify(literal))
          .join(', ')}`
      )
    case 'MessageE':
      return tree(de.message)
    case 'NaNE':
      return tree('value is NaN')
    case 'InfinityE':
      return tree('value is Infinity')
    case 'TagE':
      return tree(
        `1 error(s) found while decoding sum tag ${JSON.stringify(
          de.tag
        )}, expected one of ${de.literals.map((literal) => JSON.stringify(literal)).join(', ')}`
      )
    case 'NoMembersE':
      return tree('no members')
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
// use case: form
// -------------------------------------------------------------------------------------

// let's use `string3` in a `fromStruct`
export const PersonForm = fromStruct({
  name: string3,
  age: number
})
/*
const PersonForm: FromStructD<{
    name: Decoder<string, MinLengthLE<3>, string>;
    age: numberUD;
}>
*/

// The decoding error is fully typed, this means that you can pattern match on the error:
export const formatPersonFormE = (de: ErrorOf<typeof PersonForm>): string =>
  de.errors
    .map((e): string => {
      switch (e.key) {
        case 'name':
          //     this is of type `MinLengthE<3>` ---v
          return `invalid name, must be ${e.error.error.minLength} or more characters long`
        case 'age':
          return 'invalid age'
      }
    })
    .join(', ')

assert.deepStrictEqual(
  pipe(PersonForm.decode({ name: 'name', age: 18 }), TH.mapLeft(formatPersonFormE)),
  success({ name: 'name', age: 18 })
)
assert.deepStrictEqual(
  pipe(PersonForm.decode({ name: '', age: 18 }), TH.mapLeft(formatPersonFormE)),
  failure('invalid name, must be 3 or more characters long')
)
assert.deepStrictEqual(
  pipe(PersonForm.decode({ name: '', age: null }), TH.mapLeft(formatPersonFormE)),
  failure('invalid name, must be 3 or more characters long, invalid age')
)

// -------------------------------------------------------------------------------------
// use case: draw a custom error
// -------------------------------------------------------------------------------------

// pipe(PersonForm.decode({ name: '', age: 18 }), TH.mapLeft(toTree)) // Type 'MinLengthLE<3>' is not assignable to type 'LeafE<BuiltinE>'

export const myToTree = toTreeWith((e: BuiltinE | MinLengthE<number>) => {
  switch (e._tag) {
    case 'MinLengthE':
      return tree(`cannot decode ${format(e.actual)}, must be ${e.minLength} or more characters long`)
    default:
      return toTreeBuiltin(e)
  }
})

assert.deepStrictEqual(
  pipe(PersonForm.decode({ name: '', age: 18 }), TH.mapLeft(myToTree)),
  failure(
    tree('1 error(s) found while decoding (struct)', [
      tree('1 error(s) found while decoding required key "name"', [
        tree('cannot decode "", must be 3 or more characters long')
      ])
    ])
  )
)

// -------------------------------------------------------------------------------------
// use case: return warnings other than errors
// -------------------------------------------------------------------------------------

// the `number` decoder can raise a `NumberE` error but also two warnings:
// - NaNE
// - InfinityE

export const formatNumberE = (de: ErrorOf<typeof number>): string => {
  switch (de.error._tag) {
    case 'NumberE':
      return 'the input is not even a number'
    case 'NaNE':
      return 'the input is NaN'
    case 'InfinityE':
      return 'the input is Infinity'
  }
}

assert.deepStrictEqual(pipe(number.decode(1), TH.mapLeft(formatNumberE)), success(1))
assert.deepStrictEqual(pipe(number.decode(null), TH.mapLeft(formatNumberE)), failure('the input is not even a number'))
assert.deepStrictEqual(pipe(number.decode(NaN), TH.mapLeft(formatNumberE)), warning('the input is NaN', NaN))

// -------------------------------------------------------------------------------------
// use case: optionally fail on additional properties
// -------------------------------------------------------------------------------------

export const A = struct({ a: string })

assert.deepStrictEqual(
  //                                   v-- this utility transforms a decoding error in a tree
  pipe(A.decode({ a: 'a', c: true }), draw),
  warning('1 error(s) found while checking keys\n└─ unexpected key "c"', { a: 'a' })
  // warning ---^                                                             ^-- stripped out result
)

// since additional properties are reported as warnings rather than errors,
// this mechanism play well with intersections too

export const B = struct({ b: number })
export const AB = pipe(A, intersect(B))

assert.deepStrictEqual(
  pipe(AB.decode({ a: 'a', b: 1, c: true }), draw),
  warning(
    `2 error(s) found while decoding (intersection)
├─ 1 error(s) found while decoding member 0
│  └─ 1 error(s) found while checking keys
│     └─ unexpected key "c"
└─ 1 error(s) found while decoding member 1
   └─ 1 error(s) found while checking keys
      └─ unexpected key "c"`,
    { a: 'a', b: 1 }
  )
)

// -------------------------------------------------------------------------------------
// debug utils
// -------------------------------------------------------------------------------------

const printValue = (a: unknown): string => 'Value:\n' + format(a)
const printErrors = (s: string): string => 'Errors:\n' + s
const printWarnings = (s: string): string => 'Warnings:\n' + s

export const print = TH.fold(printErrors, printValue, (e, a) => printValue(a) + '\n' + printWarnings(e))

export const toString = flow(draw, print)
export const debug = flow(toString, console.log)

// -------------------------------------------------------------------------------------
// use case: old decoder, custom error message
// -------------------------------------------------------------------------------------

export const mystring = pipe(
  string,
  mapLeft(() => message(`please insert a string`))
)

assert.deepStrictEqual(
  pipe(string.decode(null), toString),
  `Errors:
cannot decode null, expected a string` // <= default message
)
assert.deepStrictEqual(
  pipe(mystring.decode(null), toString),
  `Errors:
please insert a string` // <= custom message
)

// -------------------------------------------------------------------------------------
// use case: new decoder, custom error message
// -------------------------------------------------------------------------------------

export const date: Decoder<unknown, MessageLE, Date> = {
  decode: (u) => (u instanceof Date ? success(u) : failure(message('not a Date')))
}

assert.deepStrictEqual(
  pipe(date.decode(null), toString),
  `Errors:
not a Date`
)

// -------------------------------------------------------------------------------------
// use case: new decoder, multiple custom messages #487
// -------------------------------------------------------------------------------------

export interface UsernameBrand {
  readonly Username: unique symbol
}

export type Username = string & UsernameBrand

const USERNAME_REGEX = /(a|b)*d/

export const Username = pipe(
  mystring,
  compose({
    decode: (s) =>
      s.length < 2
        ? failure(message('too short'))
        : s.length > 4
        ? failure(message('too long'))
        : USERNAME_REGEX.test(s)
        ? failure(message('bad characters'))
        : success(s as Username)
  })
)

assert.deepStrictEqual(
  pipe(tuple(Username, Username, Username, Username, Username).decode([null, 'a', 'bbbbb', 'abd', 'ok']), toString),
  `Errors:
4 error(s) found while decoding (tuple)
├─ 1 error(s) found while decoding required component 0
│  └─ please insert a string
├─ 1 error(s) found while decoding required component 1
│  └─ too short
├─ 1 error(s) found while decoding required component 2
│  └─ too long
└─ 1 error(s) found while decoding required component 3
   └─ bad characters`
)

// -------------------------------------------------------------------------------------
// use case: extend https://github.com/gcanti/io-ts/issues/453#issuecomment-756768089 by @mmkal
// -------------------------------------------------------------------------------------

export const User = struct({
  name: string,
  address: string
})

export const UserWithAge = struct({
  ...User.next.properties,
  age: number
})

assert.deepStrictEqual(
  UserWithAge.decode({ name: 'name', address: 'address', age: 18 }),
  success({ name: 'name', address: 'address', age: 18 })
)

// -------------------------------------------------------------------------------------
// use case: pick, omit #553
// -------------------------------------------------------------------------------------

const Original = struct({
  a: string,
  b: number,
  c: boolean
})

const { a, b } = Original.next.properties

const Pick = struct({ a, b })

assert.deepStrictEqual(Pick.decode({ a: 'a', b: 1 }), success({ a: 'a', b: 1 }))

const { a: _a, ...rest } = Original.next.properties

const Omit = struct({ ...rest })

assert.deepStrictEqual(Omit.decode({ b: 1, c: true }), success({ b: 1, c: true }))

// -------------------------------------------------------------------------------------
// use case: reflection, for example generating a match function from a sum
// -------------------------------------------------------------------------------------

export const matchSum = <T extends string, Members extends Record<string, Decoder<any, any, Record<T, any>>>>(
  decoder: SumD<T, Members>
) => <B>(patterns: { [K in keyof Members]: (member: TypeOf<Members[K]>) => B }) => (
  a: TypeOf<Members[keyof Members]>
): B => {
  const tag = decoder.next.tag
  const value = a[tag]
  return patterns[value](a)
}

export const matchSum1 = sum('type')({
  A: struct({ type: literal('A'), a: string }),
  B: struct({ type: literal('B'), b: number })
})

export const match1 = matchSum(matchSum1)

assert.deepStrictEqual(
  pipe(
    { type: 'A', a: 'a' },
    match1({
      A: ({ a }) => `A: ${a}`,
      B: ({ b }) => `B: ${b}`
    })
  ),
  'A: a'
)

export const matchSum2 = sum('0')({
  A: tuple(literal('A'), string),
  B: tuple(literal('B'), number)
})

export const match2 = matchSum(matchSum2)

assert.deepStrictEqual(
  pipe(
    ['A', 'a'],
    match2({
      A: ([_, a]) => `A: ${a}`,
      B: ([_, b]) => `B: ${b}`
    })
  ),
  'A: a'
)

export const matchFromSum = <T extends string, Members extends Record<string, Decoder<any, any, Record<T, any>>>>(
  decoder: FromSumD<T, Members>
) => <B>(patterns: { [K in keyof Members]: (member: TypeOf<Members[K]>) => B }) => (
  a: TypeOf<Members[keyof Members]>
): B => {
  const tag = decoder.tag
  const value = a[tag]
  return patterns[value](a)
}

export const matchFromSum1 = fromSum('type')({
  A: struct({ type: literal('A'), a: string }),
  B: struct({ type: literal('B'), b: number })
})

export const match3 = matchFromSum(matchFromSum1)

assert.deepStrictEqual(
  pipe(
    { type: 'A', a: 'a' },
    match3({
      A: ({ a }) => `A: ${a}`,
      B: ({ b }) => `B: ${b}`
    })
  ),
  'A: a'
)

export const matchFromSum2 = fromSum('0')({
  A: tuple(literal('A'), string),
  B: tuple(literal('B'), number)
})

export const match4 = matchFromSum(matchFromSum2)

assert.deepStrictEqual(
  pipe(
    ['A', 'a'],
    match4({
      A: ([_, a]) => `A: ${a}`,
      B: ([_, b]) => `B: ${b}`
    })
  ),
  'A: a'
)

// -------------------------------------------------------------------------------------
// use case: Schemable
// -------------------------------------------------------------------------------------

export function memoize<A, B>(f: (a: A) => B): (a: A) => B {
  const cache = new Map()
  return (a) => {
    if (!cache.has(a)) {
      const b = f(a)
      cache.set(a, b)
      return b
    }
    return cache.get(a)
  }
}

export interface Schemable<S> {
  readonly URI: S
  //                         v-- this is the actual string decoder
  readonly string: HKT<S, stringUD>
  // this is the actual decoder returned by the nullable combinator --v
  readonly nullable: <A extends AnyD>(or: HKT<S, A>) => HKT<S, NullableD<A>>
  // etc...
}

export interface Schemable1<S extends URIS> {
  readonly URI: S
  readonly string: Kind<S, stringUD>
  readonly nullable: <A extends AnyD>(or: Kind<S, A>) => Kind<S, NullableD<A>>
  // etc...
}

export interface Schema<A> {
  <S>(S: Schemable<S>): HKT<S, A>
}

export function make<A>(schema: Schema<A>): Schema<A> {
  return memoize(schema)
}

export function compile<S extends URIS>(S: Schemable1<S>): <A>(schema: Schema<A>) => Kind<S, A>
export function compile<S>(S: Schemable<S>): <A>(schema: Schema<A>) => HKT<S, A> {
  return (schema) => schema(S)
}

// declare module 'fp-ts/lib/HKT' {
//   interface URItoKind<A> {
//     readonly 'io-ts/toDecoder': A
//   }
// }

// export const toDecoder: Schemable1<'io-ts/toDecoder'> = {
//   URI: 'io-ts/toDecoder',
//   string: string,
//   nullable: nullable
//   // etc...
// }

// import { Eq } from 'fp-ts/lib/Eq'
// import * as E from './Eq'

// declare module 'fp-ts/lib/HKT' {
//   interface URItoKind<A> {
//     readonly 'io-ts/toEq': Eq<TypeOf<A>>
//   }
// }

// export const toEq: Schemable1<'io-ts/toEq'> = {
//   URI: 'io-ts/toEq',
//   string: E.string,
//   nullable: E.nullable
//   // etc...
// }

// // const schema: Schema<NullableD<stringUD>>
// const schema = make((S) => S.nullable(S.string))

// // const decoder: NullableD<stringUD>
// const decoder = compile(toDecoder)(schema)

// // you can get access to the meta infos as usual
// export const referenceToString = decoder.or

// // const eq: Eq<string | null>
// const eq = compile(toEq)(schema)

// assert.deepStrictEqual(decoder.decode('a'), success('a'))
// assert.deepStrictEqual(decoder.decode(null), success(null))
// assert.deepStrictEqual(decoder.decode(1), failure(nullableE(stringLE(1))))

// assert.deepStrictEqual(eq.equals('a', 'a'), true)
// assert.deepStrictEqual(eq.equals(null, null), true)
// assert.deepStrictEqual(eq.equals('a', 'b'), false)

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
      return TH.isBoth(de) ? failure(de.left) : de
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
      case 'CompoundE':
        return de.errors.some(go)
      case 'PrevE':
      case 'NextE':
      case 'RequiredKeyE':
      case 'MemberE':
      case 'NullableE':
      case 'OptionalKeyE':
      case 'RequiredIndexE':
      case 'OptionalIndexE':
      case 'LazyE':
      case 'SumE':
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
  return (result) => {
    if (TH.isBoth(result)) {
      const de = result.left
      if (should(de)) {
        return failure(de)
      }
    }
    return result
  }
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

export const exactEndo = condemnWhen(
  (e: BuiltinE | UnexpectedKeysE | UnexpectedIndexesE) =>
    e._tag === 'UnexpectedKeysE' || e._tag === 'UnexpectedIndexesE'
)

export const exact = endo(exactEndo)

export const failOnAdditionalProps = exact(warnOnAdditionalProps)

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
// use case: how to encode `Record<'a' | 'b', number>`
// -------------------------------------------------------------------------------------

// with `struct`
export const Recordab = struct({
  a: number,
  b: number
})

// -------------------------------------------------------------------------------------
// use case: how to encode `Partial<Record<'a' | 'b', number>>`
// -------------------------------------------------------------------------------------

// with `partial`
export const PartialRecordab = partial({
  a: number,
  b: number
})

// -------------------------------------------------------------------------------------
// use case: opaque decoder
// -------------------------------------------------------------------------------------

interface OpaqueD
  extends StructD<{
    a: stringUD
    b: numberUD
  }> {}

const Opaque: OpaqueD = struct({
  a: string,
  b: number
})

export const Opaque2 = struct({
  c: Opaque
})
/*
const Opaque2: StructD<{
    c: OpaqueD;
}>
instead of
const Opaque2: StructD<{
    c: StructD<{
        a: stringUD;
        b: numberUD;
    }>;
}>
*/

// -------------------------------------------------------------------------------------
// use case: undefined -> Option<A>
// -------------------------------------------------------------------------------------

export const optionE = compoundE('option')

export interface FromOptionE<Properties>
  extends CompoundE<{ readonly [K in keyof Properties]: OptionalKeyE<K, ErrorOf<Properties[K]>> }[keyof Properties]> {}
export interface FromOptionD<Properties>
  extends Decoder<
    Partial<{ [K in keyof Properties]: InputOf<Properties[K]> }>,
    FromPartialE<Properties>,
    { [K in keyof Properties]: O.Option<TypeOf<Properties[K]>> }
  > {
  readonly _tag: 'FromOptionD'
  readonly properties: Properties
}
export const fromOption = <Properties extends Record<PropertyKey, AnyD>>(
  properties: Properties
): FromOptionD<Properties> => ({
  _tag: 'FromOptionD',
  properties,
  decode: (ur) => {
    const es: Array<OptionalKeyE<string, ErrorOf<Properties[keyof Properties]>>> = []
    const ar: any = {}
    let isBoth = true
    for (const k in properties) {
      if (ur[k] === undefined) {
        ar[k] = O.none
        continue
      }
      const de = properties[k].decode(ur[k])
      if (TH.isLeft(de)) {
        isBoth = false
        es.push(optionalKeyE(k, de.left))
      } else if (TH.isRight(de)) {
        ar[k] = O.some(de.right)
      } else {
        es.push(optionalKeyE(k, de.left))
        ar[k] = O.some(de.right)
      }
    }
    return RA.isNonEmpty(es) ? (isBoth ? warning(optionE(es), ar) : failure(optionE(es))) : success(ar)
  }
})

export interface OptionD<Properties>
  extends CompositionD<CompositionD<UnknownRecordUD, UnexpectedKeysD<Properties>>, FromOptionD<Properties>> {}

export function option<Properties extends Record<PropertyKey, AnyUD>>(properties: Properties): OptionD<Properties>
export function option(properties: Record<PropertyKey, AnyUD>): OptionD<typeof properties> {
  return pipe(UnknownRecord, compose(unexpectedKeys(properties)), compose(fromOption(properties)))
}

// -------------------------------------------------------------------------------------
// use case: readonly by default #525
// -------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------
// use case: more user friendly optional fields #542
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

// -------------------------------------------------------------------------------------
// use case: #586
// -------------------------------------------------------------------------------------

export type Value = string | number | boolean | NoFunctionObject | NoFunctionArray

export interface NoFunctionObject {
  [key: string]: Value
}

export interface NoFunctionArray extends Array<Value | NoFunctionObject> {}

export const Value: Decoder<
  unknown,
  DecodeError<StringE | NumberE | NaNE | InfinityE | BooleanE | UnknownRecordE | UnknownArrayE | NoMembersE>,
  Value
> = lazy('Value', () => {
  const NoFunctionObject = record(Value)
  const NoFunctionArray = array(union(Value, NoFunctionObject))
  return union(string, number, boolean, NoFunctionObject, NoFunctionArray)
})

// -------------------------------------------------------------------------------------
// use case: intersection of primitives
// -------------------------------------------------------------------------------------

export interface PositiveBrand {
  readonly Positive: unique symbol
}

export type Positive = number & PositiveBrand

const isPositive = (n: number): n is Positive => n > 0 || isNaN(n)

const PositiveD = {
  decode: (n: number) =>
    isPositive(n) ? success(n) : failure(message(`cannot decode ${n}, expected a positive number`))
}

export interface IntegerBrand {
  readonly Integer: unique symbol
}
export type Integer = number & IntegerBrand

const isInteger = (n: number): n is Integer => Number.isInteger(n)

const IntegerD = {
  decode: (n: number) => (isInteger(n) ? success(n) : failure(message('not an integer')))
}

export const PositiveIntD = pipe(PositiveD, intersect(IntegerD))
export type PositiveIntDI = InputOf<typeof PositiveIntD>
export type PositiveIntDE = ErrorOf<typeof PositiveIntD>
export type PositiveIntDA = TypeOf<typeof PositiveIntD>

export const PositiveIntUD = pipe(number, compose(PositiveIntD))
export type PositiveIntUDI = InputOf<typeof PositiveIntUD>
export type PositiveIntUDE = ErrorOf<typeof PositiveIntUD>
export type PositiveIntUDA = TypeOf<typeof PositiveIntUD>

// pipe(PositiveIntUD.decode(null), debug)
// pipe(PositiveIntUD.decode(-1), debug)
// pipe(PositiveIntUD.decode(1.2), debug)

// interface NonEmptyStringBrand {
//   readonly NonEmptyString: unique symbol
// }

// export type NonEmptyString = string & NonEmptyStringBrand

// export interface NonEmptyStringE {
//   readonly _tag: 'NonEmptyStringE'
//   readonly actual: string
// }
// export interface NonEmptyStringLE extends LeafE<NonEmptyStringE> {}

// const isNonEmptyString = (s: string): s is NonEmptyString => s.length > 0

// export const NonEmptyStringD = refinement((s: string) =>
//   isNonEmptyString(s) ? success(s) : failure(leafE({ _tag: 'NonEmptyStringE', actual: s }))
// )

// export const NonEmptyStringUD = pipe(string, compose(NonEmptyStringD))
// export type NonEmptyStringUDE = ErrorOf<typeof NonEmptyStringUD>
