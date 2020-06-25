/**
 * @since 2.2.7
 */
import { Refinement } from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'
import * as DE from './DecodeError'
import * as FS from './FreeSemigroup'
import * as K from './Kleisli'
import * as KD from './KleisliDecoder'
import { Literal } from './Schemable'

// -------------------------------------------------------------------------------------
// Kleisli config
// -------------------------------------------------------------------------------------

const M =
  /*#__PURE__*/
  TE.getTaskValidation(DE.getSemigroup<string>())

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 2.2.7
 */
export interface KleisliTaskDecoder<I, A> {
  readonly decode: (i: I) => TE.TaskEither<DecodeError, A>
}

// -------------------------------------------------------------------------------------
// DecodeError
// -------------------------------------------------------------------------------------

/**
 * @category DecodeError
 * @since 2.2.7
 */
export type DecodeError = KD.DecodeError

/**
 * @category DecodeError
 * @since 2.2.7
 */
export const error: (actual: unknown, message: string) => DecodeError = KD.error

/**
 * @category DecodeError
 * @since 2.2.7
 */
export const success: <A>(a: A) => TE.TaskEither<DecodeError, A> = TE.right

/**
 * @category DecodeError
 * @since 2.2.7
 */
export const failure = <A = never>(actual: unknown, message: string): TE.TaskEither<DecodeError, A> =>
  TE.left(KD.error(actual, message))

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 2.2.7
 */
export const fromKleisliDecoder = <I, A>(decoder: KD.KleisliDecoder<I, A>): KleisliTaskDecoder<I, A> => ({
  decode: TE.fromEitherK(decoder.decode)
})

/**
 * @category constructors
 * @since 2.2.7
 */
export const fromRefinement = <I, A extends I>(
  refinement: Refinement<I, A>,
  expected: string
): KleisliTaskDecoder<I, A> => fromKleisliDecoder(KD.fromRefinement(refinement, expected))

/**
 * @category constructors
 * @since 2.2.7
 */
export const literal: <A extends readonly [Literal, ...Array<Literal>]>(
  ...values: A
) => KleisliTaskDecoder<unknown, A[number]> =
  /*#__PURE__*/
  K.literal(M)((u, values) => error(u, values.map((value) => JSON.stringify(value)).join(' | ')))

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 2.2.7
 */
export const mapLeftWithInput: <I>(
  f: (input: I, e: DecodeError) => DecodeError
) => <A>(decoder: KleisliTaskDecoder<I, A>) => KleisliTaskDecoder<I, A> =
  /*#__PURE__*/
  K.mapLeftWithInput(M)

/**
 * @category combinators
 * @since 2.2.7
 */
export const refine = <A, B extends A>(
  refinement: (a: A) => a is B,
  id: string
): (<I>(from: KleisliTaskDecoder<I, A>) => KleisliTaskDecoder<I, B>) => K.refine(M)(refinement, (a) => error(a, id))

/**
 * @category combinators
 * @since 2.2.7
 */
export const parse: <A, B>(
  parser: (a: A) => TE.TaskEither<DecodeError, B>
) => <I>(from: KleisliTaskDecoder<I, A>) => KleisliTaskDecoder<I, B> =
  /*#__PURE__*/
  K.parse(M)

/**
 * @category combinators
 * @since 2.2.7
 */
export const nullable: <I, A>(or: KleisliTaskDecoder<I, A>) => KleisliTaskDecoder<null | I, null | A> =
  /*#__PURE__*/
  K.nullable(M)((u, e) => FS.concat(FS.of(DE.member(0, error(u, 'null'))), FS.of(DE.member(1, e))))

/**
 * @category combinators
 * @since 2.2.7
 */
export const type = <P extends Record<string, KleisliTaskDecoder<any, any>>>(
  properties: P
): KleisliTaskDecoder<{ [K in keyof P]: InputOf<P[K]> }, { [K in keyof P]: TypeOf<P[K]> }> =>
  K.type(M)((k, e) => FS.of(DE.key(k, DE.required, e)))(properties)

/**
 * @category combinators
 * @since 2.2.7
 */
export const partial = <P extends Record<string, KleisliTaskDecoder<any, any>>>(
  properties: P
): KleisliTaskDecoder<{ [K in keyof P]: InputOf<P[K]> }, Partial<{ [K in keyof P]: TypeOf<P[K]> }>> =>
  K.partial(M)((k, e) => FS.of(DE.key(k, DE.optional, e)))(properties)

/**
 * @category combinators
 * @since 2.2.7
 */
export const array = <I, A>(items: KleisliTaskDecoder<I, A>): KleisliTaskDecoder<Array<I>, Array<A>> =>
  K.array(M)((i, e) => FS.of(DE.index(i, DE.optional, e)))(items)

/**
 * @category combinators
 * @since 2.2.7
 */
export const record = <I, A>(
  codomain: KleisliTaskDecoder<I, A>
): KleisliTaskDecoder<Record<string, I>, Record<string, A>> =>
  K.record(M)((k, e) => FS.of(DE.key(k, DE.optional, e)))(codomain)

/**
 * @category combinators
 * @since 2.2.7
 */
export const tuple = <C extends ReadonlyArray<KleisliTaskDecoder<any, any>>>(
  ...components: C
): KleisliTaskDecoder<{ [K in keyof C]: InputOf<C[K]> }, { [K in keyof C]: TypeOf<C[K]> }> =>
  K.tuple(M)((i, e) => FS.of(DE.index(i, DE.required, e)))(...components)

/**
 * @category combinators
 * @since 2.2.7
 */
export const union: <MS extends readonly [KleisliTaskDecoder<any, any>, ...Array<KleisliTaskDecoder<any, any>>]>(
  ...members: MS
) => KleisliTaskDecoder<InputOf<MS[keyof MS]>, TypeOf<MS[keyof MS]>> =
  /*#__PURE__*/
  K.union(M)((i, e) => FS.of(DE.member(i, e)))

/**
 * @category combinators
 * @since 2.2.7
 */
export const intersect: <IB, B>(
  right: KleisliTaskDecoder<IB, B>
) => <IA, A>(left: KleisliTaskDecoder<IA, A>) => KleisliTaskDecoder<IA & IB, A & B> =
  /*#__PURE__*/
  K.intersect(M)

/**
 * @category combinators
 * @since 2.2.7
 */
export const sum = <T extends string>(tag: T) => <MS extends Record<string, KleisliTaskDecoder<any, any>>>(
  members: MS
): KleisliTaskDecoder<InputOf<MS[keyof MS]>, TypeOf<MS[keyof MS]>> =>
  K.sum(M)((tag, value, keys) =>
    FS.of(
      DE.key(
        tag,
        DE.required,
        error(value, keys.length === 0 ? 'never' : keys.map((k) => JSON.stringify(k)).join(' | '))
      )
    )
  )(tag)(members)

/**
 * @category combinators
 * @since 2.2.7
 */
export const lazy: <I, A>(id: string, f: () => KleisliTaskDecoder<I, A>) => KleisliTaskDecoder<I, A> =
  /*#__PURE__*/
  K.lazy(M)((id, e) => FS.of(DE.lazy(id, e)))

/**
 * @category combinators
 * @since 2.2.7
 */
export const compose = <A, B>(to: KleisliTaskDecoder<A, B>) => <I>(
  from: KleisliTaskDecoder<I, A>
): KleisliTaskDecoder<I, B> => K.pipe(M)(from, to)

// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------

/**
 * @category Functor
 * @since 2.2.7
 */
export const map: <A, B>(f: (a: A) => B) => <I>(fa: KleisliTaskDecoder<I, A>) => KleisliTaskDecoder<I, B> =
  /*#__PURE__*/
  K.map(M)

/**
 * @category Alt
 * @since 2.2.7
 */
export const alt: <I, A>(
  that: () => KleisliTaskDecoder<I, A>
) => (me: KleisliTaskDecoder<I, A>) => KleisliTaskDecoder<I, A> =
  /*#__PURE__*/
  K.alt(M)

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.7
 */
export type TypeOf<KTD> = K.TypeOf<TE.URI, KTD>

/**
 * @since 2.2.7
 */
export type InputOf<KTD> = K.InputOf<TE.URI, KTD>
