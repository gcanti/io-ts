/**
 * **This module is experimental**
 *
 * Experimental features are published in order to get early feedback from the community, see these tracking
 * [issues](https://github.com/gcanti/io-ts/issues?q=label%3Av2.2+) for further discussions and enhancements.
 *
 * A feature tagged as _Experimental_ is in a high state of flux, you're at risk of it changing without notice.
 *
 * @since 2.2.7
 */
import { Bifunctor3 } from 'fp-ts/lib/Bifunctor'
import { flow, identity, Lazy, Refinement } from 'fp-ts/lib/function'
import { Functor3 } from 'fp-ts/lib/Functor'
import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import * as RA from 'fp-ts/lib/ReadonlyArray'
import * as RNEA from 'fp-ts/lib/ReadonlyNonEmptyArray'
import * as TH from 'fp-ts/lib/These'
import * as DE from './DecodeError'

import These = TH.These
import ReadonlyNonEmptyArray = RNEA.ReadonlyNonEmptyArray

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 2.2.17
 */
export interface Decoder<I, E, A> {
  readonly decode: (i: I) => These<E, A>
}

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 2.2.7
 */
export const URI = 'io-ts/Decoder'

/**
 * @category instances
 * @since 2.2.7
 */
export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind3<R, E, A> {
    readonly [URI]: Decoder<R, E, A>
  }
}

/**
 * @category meta
 * @since 2.2.17
 */
export interface MapD<D, B> extends Decoder<InputOf<D>, ErrorOf<D>, B> {
  readonly _tag: 'MapD'
  readonly decoder: D
  readonly map: (a: TypeOf<D>) => B
}

/**
 * @category instance operations
 * @since 2.2.7
 */
export function map<D extends AnyD, B>(f: (a: TypeOf<D>) => B): (decoder: D) => MapD<D, B>
export function map<A, B>(f: (a: A) => B): <I, E>(decoder: Decoder<I, E, A>) => MapD<typeof decoder, B> {
  return (decoder) => ({
    _tag: 'MapD',
    decode: flow(decoder.decode, TH.map(f)),
    decoder,
    map: f
  })
}

/**
 * @category instances
 * @since 2.2.8
 */
export const Functor: Functor3<URI> = {
  URI,
  map: (fa, f) => pipe(fa, map(f))
}

/**
 * @category meta
 * @since 2.2.17
 */
export interface MapLeftD<D, E> extends Decoder<InputOf<D>, E, TypeOf<D>> {
  readonly _tag: 'MapLeftD'
  readonly decoder: D
  readonly mapLeft: (de: ErrorOf<D>) => E
}

/**
 * @category instance operations
 * @since 2.2.17
 */
export function mapLeft<D extends AnyD, E>(f: (e: ErrorOf<D>) => E): (decoder: D) => MapLeftD<D, E>
export function mapLeft<E1, I, E2>(f: (e: E1) => E2): <A>(decoder: Decoder<I, E1, A>) => MapLeftD<typeof decoder, E2> {
  return (decoder) => ({
    _tag: 'MapLeftD',
    decode: flow(decoder.decode, TH.mapLeft(f)),
    decoder,
    mapLeft: f
  })
}

/**
 * @category instances
 * @since 2.2.17
 */
export const Bifunctor: Bifunctor3<URI> = {
  URI,
  mapLeft: (fa, f) => pipe(fa, mapLeft(f)),
  bimap: (fea, f, g) => pipe(fea, mapLeft(f), map(g))
}

/**
 * @category meta
 * @since 2.2.17
 */
export interface IdentityD<A> extends Decoder<A, never, A> {
  readonly _tag: 'IdentityD'
}

/**
 * @category instance operations
 * @since 2.2.8
 */
export const id = <A = never>(): IdentityD<A> => ({
  _tag: 'IdentityD',
  decode: TH.right
})

/**
 * @since 2.2.17
 */
export interface CompositionE<P, N> extends DE.CompoundE<DE.PrevE<ErrorOf<P>> | DE.NextE<ErrorOf<N>>> {}

/**
 * @category meta
 * @since 2.2.17
 */
export interface CompositionD<P, N> extends Decoder<InputOf<P>, CompositionE<P, N>, TypeOf<N>> {
  readonly _tag: 'CompositionD'
  readonly prev: P
  readonly next: N
}

/**
 * @category instance operations
 * @since 2.2.8
 */
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
        (e1) => failure(DE.compositionE([DE.prevE(e1)])),
        (a) =>
          pipe(
            next.decode(a),
            TH.mapLeft((e) => DE.compositionE([DE.nextE(e)]))
          ),
        (w1, a) =>
          pipe(
            next.decode(a),
            TH.fold(
              (e2) => failure(DE.compositionE([DE.prevE(w1), DE.nextE(e2)])),
              (b) => warning(DE.compositionE([DE.prevE(w1)]), b),
              (w2, b) => warning(DE.compositionE([DE.prevE(w1), DE.nextE(w2)]), b)
            )
          )
      )
    )
  })
}

// -------------------------------------------------------------------------------------
// DecodeError
// -------------------------------------------------------------------------------------

/**
 * @category DecodeError
 * @since 2.2.7
 */
export const success = TH.right

/**
 * @category DecodeError
 * @since 2.2.17
 */
export const failure = TH.left

/**
 * @category DecodeError
 * @since 2.2.17
 */
export const warning = TH.both

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * @category meta
 * @since 2.2.17
 */
export interface stringUD extends Decoder<unknown, DE.StringLE, string> {
  readonly _tag: 'stringUD'
}

const isString = (u: unknown): u is string => typeof u === 'string'

/**
 * @category primitives
 * @since 2.2.7
 */
export const string: stringUD = {
  _tag: 'stringUD',
  decode: (u) => (isString(u) ? success(u) : failure(DE.stringLE(u)))
}

/**
 * @category meta
 * @since 2.2.17
 */
export interface numberUD extends Decoder<unknown, DE.NumberLE | DE.NaNLE | DE.InfinityLE, number> {
  readonly _tag: 'numberUD'
}

const isNumber = (u: unknown): u is number => typeof u === 'number'

/**
 * @category primitives
 * @since 2.2.7
 */
export const number: numberUD = {
  _tag: 'numberUD',
  decode: (u) =>
    isNumber(u)
      ? isNaN(u)
        ? warning(DE.naNLE, u)
        : isFinite(u)
        ? success(u)
        : warning(DE.infinityLE, u)
      : failure(DE.numberLE(u))
}

/**
 * @category meta
 * @since 2.2.17
 */
export interface booleanUD extends Decoder<unknown, DE.BooleanLE, boolean> {
  readonly _tag: 'booleanUD'
}

const isBoolean = (u: unknown): u is boolean => typeof u === 'boolean'

/**
 * @category primitives
 * @since 2.2.7
 */
export const boolean: booleanUD = {
  _tag: 'booleanUD',
  decode: (u) => (isBoolean(u) ? success(u) : failure(DE.booleanLE(u)))
}

/**
 * @category meta
 * @since 2.2.17
 */
export interface UnknownArrayUD extends Decoder<unknown, DE.UnknownArrayLE, Array<unknown>> {
  readonly _tag: 'UnknownArrayUD'
}

/**
 * @category primitives
 * @since 2.2.7
 */
export const UnknownArray: UnknownArrayUD = {
  _tag: 'UnknownArrayUD',
  decode: (u) => (Array.isArray(u) ? success(u) : failure(DE.unknownArrayLE(u)))
}

/**
 * @category meta
 * @since 2.2.17
 */
export interface UnknownRecordUD extends Decoder<unknown, DE.UnknownRecordLE, Record<string, unknown>> {
  readonly _tag: 'UnknownRecordUD'
}

const isUnknownRecord = (u: unknown): u is Record<string, unknown> =>
  u !== null && typeof u === 'object' && !Array.isArray(u)

/**
 * @category primitives
 * @since 2.2.7
 */
export const UnknownRecord: UnknownRecordUD = {
  _tag: 'UnknownRecordUD',
  decode: (u) => (isUnknownRecord(u) ? success(u) : failure(DE.unknownRecordLE(u)))
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category meta
 * @since 2.2.17
 */
export interface LiteralD<A extends ReadonlyNonEmptyArray<DE.Literal>>
  extends Decoder<unknown, DE.LiteralLE<A[number]>, A[number]> {
  readonly _tag: 'LiteralD'
  readonly literals: A
}

const isLiteral = <A extends ReadonlyNonEmptyArray<DE.Literal>>(...literals: A) => (u: unknown): u is A[number] =>
  literals.findIndex((literal) => literal === u) !== -1

/**
 * @category constructors
 * @since 2.2.7
 */
export const literal = <A extends ReadonlyNonEmptyArray<DE.Literal>>(...literals: A): LiteralD<A> => {
  const is = isLiteral(...literals)
  return {
    _tag: 'LiteralD',
    literals,
    decode: (u) => (is(u) ? success(u) : failure(DE.literalLE(u, literals)))
  }
}

// -------------------------------------------------------------------------------------
// decoder combinators
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.17
 */
export interface FromStructE<Properties>
  extends DE.CompoundE<
    { readonly [K in keyof Properties]: DE.RequiredKeyE<K, ErrorOf<Properties[K]>> }[keyof Properties]
  > {}

/**
 * @category meta
 * @since 2.2.17
 */
export interface FromStructD<Properties>
  extends Decoder<
    { [K in keyof Properties]: InputOf<Properties[K]> },
    FromStructE<Properties>,
    { [K in keyof Properties]: TypeOf<Properties[K]> }
  > {
  readonly _tag: 'FromStructD'
  readonly properties: Properties
}

/**
 * @category combinators
 * @since 2.2.15
 */
export const fromStruct = <Properties extends Record<string, AnyD>>(
  properties: Properties
): FromStructD<Properties> => ({
  _tag: 'FromStructD',
  properties,
  decode: (ur) => {
    const es: Array<DE.RequiredKeyE<string, ErrorOf<Properties[keyof Properties]>>> = []
    const ar: any = {}
    let isBoth = true
    for (const k in properties) {
      const de = properties[k].decode(ur[k])
      if (TH.isLeft(de)) {
        isBoth = false
        es.push(DE.requiredKeyE(k, de.left))
      } else if (TH.isRight(de)) {
        ar[k] = de.right
      } else {
        es.push(DE.requiredKeyE(k, de.left))
        ar[k] = de.right
      }
    }
    return RA.isNonEmpty(es) ? (isBoth ? warning(DE.structE(es), ar) : failure(DE.structE(es))) : success(ar)
  }
})

/**
 * @category meta
 * @since 2.2.17
 */
export interface UnexpectedKeysD<Properties>
  extends Decoder<Record<string, unknown>, DE.UnexpectedKeysE, Partial<{ [K in keyof Properties]: unknown }>> {
  readonly _tag: 'UnexpectedKeysD'
  readonly properties: Properties
}

/**
 * @category combinators
 * @since 2.2.17
 */
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
      return RA.isNonEmpty(es) ? warning(DE.unexpectedKeysE(es), out) : success(ur)
    }
  }
}

/**
 * @category meta
 * @since 2.2.17
 */
export interface MissingKeysD<Properties>
  extends Decoder<
    Partial<{ [K in keyof Properties]: unknown }>,
    DE.MissingKeysE,
    { [K in keyof Properties]: unknown }
  > {
  readonly _tag: 'MissingKeysD'
  readonly properties: Properties
}

/**
 * @category combinators
 * @since 2.2.17
 */
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
      return RA.isNonEmpty(es) ? failure(DE.missingKeysE(es)) : success(r as any)
    }
  }
}

/**
 * @category meta
 * @since 2.2.17
 */
export interface StructD<Properties>
  extends CompositionD<
    CompositionD<CompositionD<UnknownRecordUD, UnexpectedKeysD<Properties>>, MissingKeysD<Properties>>,
    FromStructD<Properties>
  > {}

/**
 * @category combinators
 * @since 2.2.15
 */
export function struct<Properties extends Record<string, AnyUD>>(properties: Properties): StructD<Properties>
export function struct(properties: Record<string, AnyUD>): StructD<typeof properties> {
  return pipe(
    UnknownRecord, // unknown -> Record<string, unknown>
    compose(unexpectedKeys(properties)), // Record<string, unknown> -> { a?: unknown, b?: unknown, ... }
    compose(missingKeys(properties)), // { a?: unknown, b?: unknown, ... } -> { a: unknown, b: unknown, ..., }
    compose(fromStruct(properties)) // { a: unknown, b: unknown, ..., } -> { a: string, b: number, ... }
  )
}

/**
 * @since 2.2.17
 */
export interface FromPartialE<Properties>
  extends DE.CompoundE<
    { readonly [K in keyof Properties]: DE.OptionalKeyE<K, ErrorOf<Properties[K]>> }[keyof Properties]
  > {}

/**
 * @category meta
 * @since 2.2.17
 */
export interface FromPartialD<Properties>
  extends Decoder<
    Partial<{ [K in keyof Properties]: InputOf<Properties[K]> }>,
    FromPartialE<Properties>,
    Partial<{ [K in keyof Properties]: TypeOf<Properties[K]> }>
  > {
  readonly _tag: 'FromPartialD'
  readonly properties: Properties
}

/**
 * @category combinators
 * @since 2.2.8
 */
export const fromPartial = <Properties extends Record<string, AnyD>>(
  properties: Properties
): FromPartialD<Properties> => ({
  _tag: 'FromPartialD',
  properties,
  decode: (ur) => {
    const es: Array<DE.OptionalKeyE<string, ErrorOf<Properties[keyof Properties]>>> = []
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
        es.push(DE.optionalKeyE(k, de.left))
      } else if (TH.isRight(de)) {
        ar[k] = de.right
      } else {
        es.push(DE.optionalKeyE(k, de.left))
        ar[k] = de.right
      }
    }
    return RA.isNonEmpty(es) ? (isBoth ? warning(DE.partialE(es), ar) : failure(DE.partialE(es))) : success(ar)
  }
})

/**
 * @category meta
 * @since 2.2.17
 */
export interface PartialD<Properties>
  extends CompositionD<CompositionD<UnknownRecordUD, UnexpectedKeysD<Properties>>, FromPartialD<Properties>> {}

/**
 * @category combinators
 * @since 2.2.7
 */
export function partial<Properties extends Record<string, AnyUD>>(properties: Properties): PartialD<Properties>
export function partial(properties: Record<string, AnyUD>): PartialD<typeof properties> {
  return pipe(UnknownRecord, compose(unexpectedKeys(properties)), compose(fromPartial(properties)))
}

/**
 * @since 2.2.17
 */
export interface FromTupleE<Components extends ReadonlyArray<unknown>>
  extends DE.CompoundE<{ [K in keyof Components]: DE.RequiredIndexE<K, ErrorOf<Components[K]>> }[number]> {}

/**
 * @category meta
 * @since 2.2.17
 */
export interface FromTupleD<Components extends ReadonlyArray<unknown>>
  extends Decoder<
    { readonly [K in keyof Components]: InputOf<Components[K]> },
    FromTupleE<Components>,
    { [K in keyof Components]: TypeOf<Components[K]> }
  > {
  readonly _tag: 'FromTupleD'
  readonly components: Components
}

/**
 * @category combinators
 * @since 2.2.8
 */
export const fromTuple = <Components extends ReadonlyArray<AnyD>>(
  ...components: Components
): FromTupleD<Components> => ({
  _tag: 'FromTupleD',
  components,
  decode: (us) => {
    const es: Array<DE.RequiredIndexE<number, ErrorOf<Components[number]>>> = []
    const as: any = []
    let isBoth = true
    for (let index = 0; index < components.length; index++) {
      const de = components[index].decode(us[index])
      if (TH.isLeft(de)) {
        isBoth = false
        es.push(DE.requiredIndexE(index, de.left))
      } else if (TH.isRight(de)) {
        as[index] = de.right
      } else {
        es.push(DE.requiredIndexE(index, de.left))
        as[index] = de.right
      }
    }
    return RA.isNonEmpty(es) ? (isBoth ? warning(DE.tupleE(es), as) : failure(DE.tupleE(es))) : success(as)
  }
})

/**
 * @category meta
 * @since 2.2.17
 */
export interface UnexpectedIndexesD<Components>
  extends Decoder<Array<unknown>, DE.UnexpectedIndexesE, { [K in keyof Components]?: unknown }> {
  readonly _tag: 'UnexpectedIndexesD'
  readonly components: Components
}

/**
 * @category combinators
 * @since 2.2.17
 */
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
      return RA.isNonEmpty(es) ? warning(DE.unexpectedIndexesE(es), us.slice(0, components.length) as any) : success(us)
    }
  }
}

/**
 * @category meta
 * @since 2.2.17
 */
export interface MissingIndexesD<Components>
  extends Decoder<
    { readonly [K in keyof Components]?: unknown },
    DE.MissingIndexesE,
    { [K in keyof Components]: unknown }
  > {
  readonly _tag: 'MissingIndexesD'
  readonly components: Components
}

/**
 * @category combinators
 * @since 2.2.17
 */
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
      return RA.isNonEmpty(es) ? failure(DE.missingIndexesE(es)) : success(us as any)
    }
  }
}

/**
 * @category meta
 * @since 2.2.17
 */
export interface TupleD<Components extends ReadonlyArray<unknown>>
  extends CompositionD<
    CompositionD<CompositionD<UnknownArrayUD, UnexpectedIndexesD<Components>>, MissingIndexesD<Components>>,
    FromTupleD<Components>
  > {}

/**
 * @category combinators
 * @since 2.2.7
 */
export function tuple<Components extends ReadonlyArray<AnyUD>>(...cs: Components): TupleD<Components>
export function tuple(...cs: ReadonlyArray<AnyUD>): TupleD<typeof cs> {
  return pipe(
    UnknownArray, // unknown -> Array<unknown>
    compose(unexpectedIndexes(...cs)), // Array<unknown> -> [unknown?, unknown?, ...]
    compose(missingIndexes(...cs)), // [unknown?, unknown?, ...] -> [unknown, unknown, ...]
    compose(fromTuple(...cs)) // [unknown, unknown, ...] -> [string, number, ...]
  )
}

/**
 * @since 2.2.17
 */
export interface FromArrayE<Item> extends DE.CompoundE<DE.OptionalIndexE<number, ErrorOf<Item>>> {}

/**
 * @category meta
 * @since 2.2.17
 */
export interface FromArrayD<Item> extends Decoder<Array<InputOf<Item>>, FromArrayE<Item>, Array<TypeOf<Item>>> {
  readonly _tag: 'FromArrayD'
  readonly item: Item
}

/**
 * @category combinators
 * @since 2.2.8
 */
export function fromArray<Item extends AnyD>(item: Item): FromArrayD<Item>
export function fromArray<I, E, A>(item: Decoder<I, E, A>): FromArrayD<typeof item> {
  return {
    _tag: 'FromArrayD',
    item,
    decode: (us) => {
      const es: Array<DE.OptionalIndexE<number, E>> = []
      const as: Array<A> = []
      let isBoth = true
      for (let index = 0; index < us.length; index++) {
        const de = item.decode(us[index])
        if (TH.isLeft(de)) {
          isBoth = false
          es.push(DE.optionalIndexE(index, de.left))
        } else if (TH.isRight(de)) {
          as[index] = de.right
        } else {
          es.push(DE.optionalIndexE(index, de.left))
          as[index] = de.right
        }
      }
      if (RA.isNonEmpty(es)) {
        return isBoth ? warning(DE.arrayE(es), as) : failure(DE.arrayE(es))
      }
      return success(as)
    }
  }
}

/**
 * @category meta
 * @since 2.2.17
 */
export interface ArrayD<Item> extends CompositionD<UnknownArrayUD, FromArrayD<Item>> {}

/**
 * @category combinators
 * @since 2.2.7
 */
export function array<Item extends AnyUD>(item: Item): ArrayD<Item>
export function array<E, A>(item: Decoder<unknown, E, A>): ArrayD<typeof item> {
  return pipe(UnknownArray, compose(fromArray(item)))
}

/**
 * @since 2.2.17
 */
export interface FromRecordE<Codomain> extends DE.CompoundE<DE.OptionalKeyE<string, ErrorOf<Codomain>>> {}

/**
 * @category meta
 * @since 2.2.17
 */
export interface FromRecordD<Codomain>
  extends Decoder<Record<string, InputOf<Codomain>>, FromRecordE<Codomain>, Record<string, TypeOf<Codomain>>> {
  readonly _tag: 'FromRecordD'
  readonly codomain: Codomain
}

/**
 * @category combinators
 * @since 2.2.8
 */
export function fromRecord<Codomain extends AnyD>(codomain: Codomain): FromRecordD<Codomain>
export function fromRecord<I, E, A>(codomain: Decoder<I, E, A>): FromRecordD<typeof codomain> {
  return {
    _tag: 'FromRecordD',
    codomain,
    decode: (i) => {
      const es: Array<DE.OptionalKeyE<string, E>> = []
      const r: Record<string, A> = {}
      let isBoth = true
      for (const k in i) {
        const de = codomain.decode(i[k])
        if (TH.isLeft(de)) {
          isBoth = false
          es.push(DE.optionalKeyE(k, de.left))
        } else if (TH.isRight(de)) {
          r[k] = de.right
        } else {
          es.push(DE.optionalKeyE(k, de.left))
          r[k] = de.right
        }
      }
      if (RA.isNonEmpty(es)) {
        return isBoth ? warning(DE.recordE(es), r) : failure(DE.recordE(es))
      }
      return success(r)
    }
  }
}

/**
 * @category meta
 * @since 2.2.17
 */
export interface RecordD<Codomain> extends CompositionD<UnknownRecordUD, FromRecordD<Codomain>> {}

/**
 * @category combinators
 * @since 2.2.7
 */
export function record<Codomain extends AnyUD>(codomain: Codomain): RecordD<Codomain>
export function record<E, A>(codomain: Decoder<unknown, E, A>): RecordD<typeof codomain> {
  return pipe(UnknownRecord, compose(fromRecord(codomain)))
}

/**
 * @since 2.2.17
 */
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

/**
 * @since 2.2.17
 */
export interface UnionE<Members extends ReadonlyNonEmptyArray<AnyD>>
  extends DE.CompoundE<{ [K in keyof Members]: DE.MemberE<K, ErrorOf<Members[K]>> }[number]> {}

/**
 * @category meta
 * @since 2.2.17
 */
export interface UnionD<Members extends ReadonlyNonEmptyArray<AnyD>>
  extends Decoder<UnionToIntersection<InputOf<Members[number]>>, UnionE<Members>, TypeOf<Members[keyof Members]>> {
  readonly _tag: 'UnionD'
  readonly members: Members
}

/**
 * @category combinators
 * @since 2.2.7
 */
export function union<Members extends ReadonlyNonEmptyArray<AnyD>>(...members: Members): UnionD<Members> {
  return {
    _tag: 'UnionD',
    members,
    decode: (i) => {
      const de = members[0].decode(i)
      if (TH.isLeft(de)) {
        const es: NonEmptyArray<DE.MemberE<number, ErrorOf<Members[number]>>> = [DE.memberE('0' as any, de.left)]
        for (let m = 1; m < members.length; m++) {
          const de = members[m].decode(i)
          if (TH.isLeft(de)) {
            es.push(DE.memberE(String(m) as any, de.left))
          } else {
            return pipe(
              de,
              TH.mapLeft((e) => {
                es.push(DE.memberE(String(m) as any, e))
                return DE.unionE(es)
              })
            )
          }
        }
        return failure(DE.unionE(es))
      } else {
        return pipe(
          de,
          TH.mapLeft((e) => DE.unionE([DE.memberE('0' as any, e)]))
        )
      }
    }
  }
}

export type RefinementError<E, A, B> =
  | DE.RefinementE<E>
  | DE.RefinementLE<Exclude<A, B>>
  | DE.CompoundE<DE.RefinementE<E> | DE.RefinementLE<Exclude<A, B>>>

/**
 * @category combinators
 * @since 2.2.7
 */
export const refine = <A, B extends A>(refinement: Refinement<A, B>) => <I, E>(
  from: Decoder<I, E, A>
): Decoder<I, RefinementError<E, A, B>, B> =>
  /*#__PURE__*/
  ({
    decode: (i) =>
      pipe(
        from.decode(i),
        TH.fold<E, A, TH.These<RefinementError<E, A, B>, B>>(
          flow(DE.refinementE, TH.left),
          (a) => (refinement(a) ? TH.right(a) : TH.left(DE.refinementLE(a as Exclude<A, B>))),
          (e, a) =>
            refinement(a)
              ? TH.both(DE.refinementE(e), a)
              : TH.left(DE.compoundE('refinement')([DE.refinementE(e), DE.refinementLE(a as Exclude<A, B>)]))
        )
      )
  })

export type ParseError<E, E2> = DE.ParseE<E> | DE.ParseE<E2> | DE.CompoundE<DE.ParseE<E> | DE.ParseE<E2>>

/**
 * @category combinators
 * @since 2.2.7
 */
export const parse = <A, B, E2>(parser: (a: A) => TH.These<E2, B>) => <I, E>(
  from: Decoder<I, E, A>
): Decoder<I, ParseError<E, E2>, B> =>
  /*#__PURE__*/
  ({
    decode: (i) => {
      const { chain } = TH.getMonad<ParseError<E, E2>>({
        concat: (x, y) => (x._tag === 'CompoundE' ? x : y._tag === 'CompoundE' ? y : DE.compoundE('parse')([x, y]))
      })
      return chain(pipe(from.decode(i), TH.mapLeft(DE.parseE)), flow(parser, TH.mapLeft(DE.parseE)))
    }
  })

/**
 * @category meta
 * @since 2.2.17
 */
export interface NullableD<D> extends Decoder<null | InputOf<D>, DE.NullableE<ErrorOf<D>>, null | TypeOf<D>> {
  readonly _tag: 'NullableD'
  readonly or: D
}

/**
 * @category combinators
 * @since 2.2.7
 */
export function nullable<D extends AnyD>(or: D): NullableD<D> {
  return {
    _tag: 'NullableD',
    or,
    decode: (i) => (i === null ? success(null) : pipe(or.decode(i), TH.mapLeft(DE.nullableE)))
  }
}

export const readonly: <I, E, A>(codec: Decoder<I, E, A>) => Decoder<I, E, Readonly<A>> = identity

/**
 * @since 2.2.17
 */
export interface IntersectE<F, S> extends DE.CompoundE<DE.MemberE<0, ErrorOf<F>> | DE.MemberE<1, ErrorOf<S>>> {}

/**
 * @category meta
 * @since 2.2.17
 */
export interface IntersectD<F, S> extends Decoder<InputOf<F> & InputOf<S>, IntersectE<F, S>, TypeOf<F> & TypeOf<S>> {
  readonly _tag: 'IntersectD'
  readonly first: F
  readonly second: S
}

type Prunable = ReadonlyArray<string>

/* istanbul ignore next */
const collectPrunable = <E>(de: DE.DecodeError<E>): Prunable => {
  const go = (de: DE.DecodeError<E>): Prunable => {
    switch (de._tag) {
      case 'CompoundE':
        return pipe(de.errors, RA.chain(go))
      case 'LazyE':
      case 'MemberE':
      case 'NextE':
      case 'NullableE':
      case 'PrevE':
      case 'SumE':
      case 'RefinementE':
      case 'ParseE':
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

/* istanbul ignore next */
const prune = (
  prunable: Prunable,
  anticollision: string
): (<E>(de: DE.DecodeError<E>) => O.Option<DE.DecodeError<E>>) => {
  const go = <E>(de: DE.DecodeError<E>): O.Option<DE.DecodeError<E>> => {
    switch (de._tag) {
      case 'CompoundE':
        return pipe(de.errors, RA.filterMap(prune(prunable, anticollision)), (pdes) =>
          RA.isNonEmpty(pdes) ? O.some(DE.compoundE(de.name)(pdes)) : O.none
        )
      case 'SumE':
        return pipe(de.error, prune(prunable, anticollision), O.map(DE.sumE))
      case 'NextE':
        return pipe(de.error, prune(prunable, anticollision), O.map(DE.nextE))
      case 'NullableE':
        return pipe(de.error, prune(prunable, anticollision), O.map(DE.nullableE))
      case 'PrevE':
        return pipe(de.error, prune(prunable, anticollision), O.map(DE.prevE))
      case 'LazyE':
        return pipe(
          de.error,
          prune(prunable, anticollision),
          O.map((pde) => DE.lazyE(de.id, pde))
        )
      case 'RefinementE':
        return pipe(de.error, prune(prunable, anticollision), O.map(DE.refinementE))
      case 'ParseE':
        return pipe(de.error, prune(prunable, anticollision), O.map(DE.parseE))
      case 'LeafE':
      case 'MissingIndexesE':
      case 'MissingKeysE':
        return O.some(de)
      case 'MemberE':
        return pipe(
          de.error,
          prune(prunable, anticollision),
          O.map((pde) => DE.memberE(de.member, pde))
        )
      case 'OptionalIndexE': {
        return pipe(
          de.error,
          prune(prunable, anticollision + de.index + '.'),
          O.map((pde) => DE.optionalIndexE(de.index, pde))
        )
      }
      case 'OptionalKeyE': {
        return pipe(
          de.error,
          prune(prunable, anticollision + de.key + '.'),
          O.map((pde) => DE.optionalKeyE(de.key, pde))
        )
      }
      case 'RequiredIndexE': {
        return pipe(
          de.error,
          prune(prunable, anticollision + de.index + '.'),
          O.map((pde) => DE.requiredIndexE(de.index, pde))
        )
      }
      case 'RequiredKeyE': {
        return pipe(
          de.error,
          prune(prunable, anticollision + de.key + '.'),
          O.map((pde) => DE.requiredKeyE(de.key, pde))
        )
      }
      case 'UnexpectedIndexesE': {
        const pindexes = de.indexes.filter((index) => prunable.indexOf(anticollision + String(index)) !== -1)
        return RA.isNonEmpty(pindexes) ? O.some(DE.unexpectedIndexesE(pindexes)) : O.none
      }
      case 'UnexpectedKeysE': {
        const pkeys = de.keys.filter((key) => prunable.indexOf(anticollision + key) !== -1)
        return RA.isNonEmpty(pkeys) ? O.some(DE.unexpectedKeysE(pkeys)) : O.none
      }
    }
  }
  return go
}

const emptyString = ''
/** @internal */
export const pruneAllUnexpected: <E>(de: DE.DecodeError<E>) => O.Option<DE.DecodeError<E>> = prune(
  RA.empty,
  emptyString
)

/** @internal */
export const pruneDifference = <E1, E2>(
  de1: DE.DecodeError<E1>,
  de2: DE.DecodeError<E2>
): O.Option<DE.CompoundE<DE.MemberE<0, DE.DecodeError<E1>> | DE.MemberE<1, DE.DecodeError<E2>>>> => {
  const pde1 = pipe(de1, prune(collectPrunable(de2), emptyString))
  const pde2 = pipe(de2, prune(collectPrunable(de1), emptyString))
  if (O.isSome(pde1)) {
    return O.isSome(pde2)
      ? O.some(DE.intersectionE([DE.memberE(0, pde1.value), DE.memberE(1, pde2.value)]))
      : O.some(DE.intersectionE([DE.memberE(0, pde1.value)]))
  }
  return O.isSome(pde2) ? O.some(DE.intersectionE([DE.memberE(1, pde2.value)])) : O.none
}

/** @internal */
export const intersect_ = <A, B>(a: A, b: B): A & B => {
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

/**
 * @category combinators
 * @since 2.2.7
 */
export function intersect<S extends Decoder<any, DE.DecodeError<any>, any>>(
  second: S
): <F extends Decoder<any, DE.DecodeError<any>, any>>(first: F) => IntersectD<F, S>
export function intersect<I2, E2, A2>(
  second: Decoder<I2, DE.DecodeError<E2>, A2>
): <I1, E1, A1>(first: Decoder<I1, DE.DecodeError<E1>, A1>) => IntersectD<typeof first, typeof second> {
  return <I1, E1, A1>(first: Decoder<I1, DE.DecodeError<E1>, A1>): IntersectD<typeof first, typeof second> => ({
    _tag: 'IntersectD',
    first,
    second,
    decode: (i) => {
      const out: These<
        DE.CompoundE<DE.MemberE<0, DE.DecodeError<E1>> | DE.MemberE<1, DE.DecodeError<E2>>>,
        A1 & A2
      > = pipe(
        first.decode(i),
        TH.fold(
          (de1) =>
            pipe(
              second.decode(i),
              TH.fold(
                (de2) => failure(DE.intersectionE([DE.memberE(0, de1), DE.memberE(1, de2)])),
                () => failure(DE.intersectionE([DE.memberE(0, de1)])),
                (de2) => {
                  const pde2 = pruneAllUnexpected(de2)
                  return O.isSome(pde2)
                    ? failure(DE.intersectionE([DE.memberE(0, de1), DE.memberE(1, pde2.value)]))
                    : failure(DE.intersectionE([DE.memberE(0, de1)]))
                }
              )
            ),
          (a1) =>
            pipe(
              second.decode(i),
              TH.fold(
                (de2) => failure(DE.intersectionE([DE.memberE(1, de2)])),
                (a2) => success(intersect_(a1, a2)),
                (de2, a2) => {
                  const pde2 = pruneAllUnexpected(de2)
                  return O.isSome(pde2)
                    ? warning(DE.intersectionE([DE.memberE(1, pde2.value)]), intersect_(a1, a2))
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
                    ? failure(DE.intersectionE([DE.memberE(0, pde1.value), DE.memberE(1, de2)]))
                    : failure(DE.intersectionE([DE.memberE(1, de2)]))
                },
                (a2) => {
                  const pde1 = pruneAllUnexpected(de1)
                  return O.isSome(pde1)
                    ? warning(DE.intersectionE([DE.memberE(0, pde1.value)]), intersect_(a1, a2))
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

/**
 * @category meta
 * @since 2.2.17
 */
export interface LazyD<I, E, A> extends Decoder<I, DE.LazyE<E>, A> {
  readonly _tag: 'LazyD'
  readonly id: string
  readonly f: Lazy<Decoder<I, E, A>>
}

/**
 * @category combinators
 * @since 2.2.7
 */
export const lazy = <I, E, A>(id: string, f: Lazy<Decoder<I, E, A>>): LazyD<I, E, A> => {
  const get = memoize<void, Decoder<I, E, A>>(f)
  return {
    _tag: 'LazyD',
    id,
    f,
    decode: (i) =>
      pipe(
        get().decode(i),
        TH.mapLeft((e) => DE.lazyE(id, e))
      )
  }
}

/**
 * @since 2.2.17
 */
export interface FromSumE<Members>
  extends DE.SumE<{ [K in keyof Members]: DE.MemberE<K, ErrorOf<Members[K]>> }[keyof Members]> {}

/**
 * @category meta
 * @since 2.2.17
 */
export interface FromSumD<T extends string, Members>
  extends Decoder<InputOf<Members[keyof Members]>, DE.TagLE | FromSumE<Members>, TypeOf<Members[keyof Members]>> {
  readonly _tag: 'FromSumD'
  readonly tag: T
  readonly members: Members
}

/**
 * @category combinators
 * @since 2.2.8
 */
export function fromSum<T extends string>(
  tag: T
): <Members extends Record<string, AnyD>>(members: Members) => FromSumD<T, Members>
export function fromSum<T extends string>(
  tag: T
): <I extends Record<T, string>, E, A>(members: Record<I[T], Decoder<I, E, A>>) => FromSumD<T, typeof members> {
  return <I extends Record<T, string>, E, A>(members: Record<I[T], Decoder<I, E, A>>): FromSumD<T, typeof members> => {
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
            TH.mapLeft((e) => DE.sumE(DE.memberE(v, e)))
          ) as any
        }
        return failure(DE.tagLE(tag, literals))
      }
    }
  }
}

/**
 * @category meta
 * @since 2.2.17
 */
export interface SumD<T extends string, Members>
  extends CompositionD<UnionD<[UnknownRecordUD, UnknownArrayUD]>, FromSumD<T, Members>> {}

//                    tagged objects --v             v-- tagged tuples
const UnknownRecordArray = union(UnknownRecord, UnknownArray)

/**
 * @category combinators
 * @since 2.2.7
 */
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
// utils
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.17
 */
export interface AnyD extends Decoder<any, any, any> {}

/**
 * @since 2.2.17
 */
export interface AnyUD extends Decoder<unknown, any, any> {}

/**
 * @since 2.2.8
 */
export type InputOf<D> = D extends Decoder<infer I, any, any> ? I : never

/**
 * @since 2.2.17
 */
export type ErrorOf<D> = D extends Decoder<any, infer E, any> ? E : never

/**
 * @since 2.2.7
 */
export type TypeOf<D> = D extends Decoder<any, any, infer A> ? A : never

/**
 * @since 2.2.17
 */
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

/**
 * @since 2.2.17
 */
export const message = DE.messageLE
