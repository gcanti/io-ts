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
import { Alt2, Alt2C } from 'fp-ts/lib/Alt'
import { Bifunctor2 } from 'fp-ts/lib/Bifunctor'
import { Category2 } from 'fp-ts/lib/Category'
import * as E from 'fp-ts/lib/Either'
import { Refinement } from 'fp-ts/lib/function'
import { Functor2 } from 'fp-ts/lib/Functor'
import { MonadThrow2C } from 'fp-ts/lib/MonadThrow'
import { pipe } from 'fp-ts/lib/pipeable'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import * as DE from './DecodeError'
import * as D from './Decoder'
import * as FS from './FreeSemigroup'
import * as G from './Guard'
import * as K from './Kleisli'
import * as S from './Schemable'

// -------------------------------------------------------------------------------------
// Kleisli config
// -------------------------------------------------------------------------------------

const M: MonadThrow2C<TE.URI, DecodeError> & Bifunctor2<TE.URI> & Alt2C<TE.URI, DecodeError> = {
  URI: TE.URI,
  _E: undefined as any,
  map: (fa, f) => pipe(fa, TE.map(f)),
  ap: <A, B>(fab: TE.TaskEither<DecodeError, (a: A) => B>, fa: TE.TaskEither<DecodeError, A>) =>
    pipe(
      pipe(
        fab,
        T.map((h) => (ga: E.Either<DecodeError, A>) => D.ap(h, ga))
      ),
      T.ap(fa)
    ),
  of: TE.right,
  chain: (ma, f) => pipe(ma, TE.chain(f)),
  throwError: TE.left,
  bimap: (fa, f, g) => pipe(fa, TE.bimap(f, g)),
  mapLeft: (fa, f) => pipe(fa, TE.mapLeft(f)),
  alt: (me, that) =>
    pipe(
      me,
      T.chain((e1) =>
        E.isRight(e1)
          ? T.of(e1)
          : pipe(
              that(),
              T.map((e2) => (E.isLeft(e2) ? E.left(D.SE.concat(e1.left, e2.left)) : e2))
            )
      )
    )
}

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 2.2.8
 */
export interface TaskDecoder<I, A> extends K.Kleisli<TE.URI, I, DecodeError, A> {}

// -------------------------------------------------------------------------------------
// DecodeError
// -------------------------------------------------------------------------------------

/**
 * @category DecodeError
 * @since 2.2.7
 */
export type DecodeError = D.DecodeError

/**
 * @category DecodeError
 * @since 2.2.7
 */
export const error: (actual: unknown, message: string) => DecodeError = D.error

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
  TE.left(D.error(actual, message))

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 2.2.7
 */
export const fromDecoder = <I, A>(decoder: D.Decoder<I, A>): TaskDecoder<I, A> => ({
  decode: TE.fromEitherK(decoder.decode)
})

/**
 * @category constructors
 * @since 2.2.8
 */
export const fromRefinement = <I, A extends I>(refinement: Refinement<I, A>, expected: string): TaskDecoder<I, A> =>
  fromDecoder(D.fromRefinement(refinement, expected))

/**
 * @category constructors
 * @since 2.2.7
 */
export const fromGuard = <I, A extends I>(guard: G.Guard<I, A>, expected: string): TaskDecoder<I, A> =>
  fromRefinement(guard.is, expected)

/**
 * @category constructors
 * @since 2.2.7
 */
export const literal: <A extends readonly [S.Literal, ...Array<S.Literal>]>(
  ...values: A
) => TaskDecoder<unknown, A[number]> =
  /*#__PURE__*/
  K.literal(M)((u, values) => error(u, values.map((value) => JSON.stringify(value)).join(' | ')))

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * @category primitives
 * @since 2.2.7
 */
export const string: TaskDecoder<unknown, string> =
  /*#__PURE__*/
  fromDecoder(D.string)

/**
 * @category primitives
 * @since 2.2.7
 */
export const number: TaskDecoder<unknown, number> =
  /*#__PURE__*/
  fromDecoder(D.number)

/**
 * @category primitives
 * @since 2.2.7
 */
export const boolean: TaskDecoder<unknown, boolean> =
  /*#__PURE__*/
  fromDecoder(D.boolean)

/**
 * @category primitives
 * @since 2.2.7
 */
export const UnknownArray: TaskDecoder<unknown, Array<unknown>> =
  /*#__PURE__*/
  fromDecoder(D.UnknownArray)

/**
 * @category primitives
 * @since 2.2.7
 */
export const UnknownRecord: TaskDecoder<unknown, Record<string, unknown>> =
  /*#__PURE__*/
  fromDecoder(D.UnknownRecord)

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 2.2.7
 */
export const mapLeftWithInput: <I>(
  f: (input: I, e: DecodeError) => DecodeError
) => <A>(decoder: TaskDecoder<I, A>) => TaskDecoder<I, A> =
  /*#__PURE__*/
  K.mapLeftWithInput(M)

/**
 * @category combinators
 * @since 2.2.9
 */
export const withMessage = <I>(
  message: (input: I, e: DecodeError) => string
): (<A>(decoder: TaskDecoder<I, A>) => TaskDecoder<I, A>) =>
  mapLeftWithInput((input, e) => FS.of(DE.wrap(message(input, e), e)))

/**
 * @category combinators
 * @since 2.2.7
 */
export const refine = <A, B extends A>(
  refinement: (a: A) => a is B,
  id: string
): (<I>(from: TaskDecoder<I, A>) => TaskDecoder<I, B>) => K.refine(M)(refinement, (a) => error(a, id))

/**
 * @category combinators
 * @since 2.2.7
 */
export const parse: <A, B>(
  parser: (a: A) => TE.TaskEither<DecodeError, B>
) => <I>(from: TaskDecoder<I, A>) => TaskDecoder<I, B> =
  /*#__PURE__*/
  K.parse(M)

/**
 * @category combinators
 * @since 2.2.7
 */
export const nullable: <I, A>(or: TaskDecoder<I, A>) => TaskDecoder<null | I, null | A> =
  /*#__PURE__*/
  K.nullable(M)((u, e) => FS.concat(FS.of(DE.member(0, error(u, 'null'))), FS.of(DE.member(1, e))))

/**
 * @category combinators
 * @since 2.2.8
 */
export const fromType = <P extends Record<string, TaskDecoder<any, any>>>(
  properties: P
): TaskDecoder<{ [K in keyof P]: InputOf<P[K]> }, { [K in keyof P]: TypeOf<P[K]> }> =>
  K.fromType(M)((k, e) => FS.of(DE.key(k, DE.required, e)))(properties)

/**
 * @category combinators
 * @since 2.2.7
 */
export const type = <A>(
  properties: { [K in keyof A]: TaskDecoder<unknown, A[K]> }
): TaskDecoder<unknown, { [K in keyof A]: A[K] }> => pipe(UnknownRecord as any, compose(fromType(properties)))

/**
 * @category combinators
 * @since 2.2.8
 */
export const fromPartial = <P extends Record<string, TaskDecoder<any, any>>>(
  properties: P
): TaskDecoder<Partial<{ [K in keyof P]: InputOf<P[K]> }>, Partial<{ [K in keyof P]: TypeOf<P[K]> }>> =>
  K.fromPartial(M)((k, e) => FS.of(DE.key(k, DE.optional, e)))(properties)

/**
 * @category combinators
 * @since 2.2.7
 */
export const partial = <A>(
  properties: { [K in keyof A]: TaskDecoder<unknown, A[K]> }
): TaskDecoder<unknown, Partial<{ [K in keyof A]: A[K] }>> =>
  pipe(UnknownRecord as any, compose(fromPartial(properties)))

/**
 * @category combinators
 * @since 2.2.8
 */
export const fromArray = <I, A>(item: TaskDecoder<I, A>): TaskDecoder<Array<I>, Array<A>> =>
  K.fromArray(M)((i, e) => FS.of(DE.index(i, DE.optional, e)))(item)

/**
 * @category combinators
 * @since 2.2.7
 */
export const array = <A>(item: TaskDecoder<unknown, A>): TaskDecoder<unknown, Array<A>> =>
  pipe(UnknownArray, compose(fromArray(item)))

/**
 * @category combinators
 * @since 2.2.8
 */
export const fromRecord = <I, A>(codomain: TaskDecoder<I, A>): TaskDecoder<Record<string, I>, Record<string, A>> =>
  K.fromRecord(M)((k, e) => FS.of(DE.key(k, DE.optional, e)))(codomain)

/**
 * @category combinators
 * @since 2.2.7
 */
export const record = <A>(codomain: TaskDecoder<unknown, A>): TaskDecoder<unknown, Record<string, A>> =>
  pipe(UnknownRecord, compose(fromRecord(codomain)))

/**
 * @category combinators
 * @since 2.2.8
 */
export const fromTuple = <C extends ReadonlyArray<TaskDecoder<any, any>>>(
  ...components: C
): TaskDecoder<{ [K in keyof C]: InputOf<C[K]> }, { [K in keyof C]: TypeOf<C[K]> }> =>
  K.fromTuple(M)((i, e) => FS.of(DE.index(i, DE.required, e)))(...components)

/**
 * @category combinators
 * @since 2.2.7
 */
export const tuple = <A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: TaskDecoder<unknown, A[K]> }
): TaskDecoder<unknown, A> => pipe(UnknownArray as any, compose(fromTuple(...components))) as any

/**
 * @category combinators
 * @since 2.2.7
 */
export const union: <MS extends readonly [TaskDecoder<any, any>, ...Array<TaskDecoder<any, any>>]>(
  ...members: MS
) => TaskDecoder<InputOf<MS[keyof MS]>, TypeOf<MS[keyof MS]>> =
  /*#__PURE__*/
  K.union(M)((i, e) => FS.of(DE.member(i, e)))

/**
 * @category combinators
 * @since 2.2.7
 */
export const intersect: <IB, B>(
  right: TaskDecoder<IB, B>
) => <IA, A>(left: TaskDecoder<IA, A>) => TaskDecoder<IA & IB, A & B> =
  /*#__PURE__*/
  K.intersect(M)

/**
 * @category combinators
 * @since 2.2.8
 */
export const fromSum = <T extends string>(tag: T) => <MS extends Record<string, TaskDecoder<any, any>>>(
  members: MS
): TaskDecoder<InputOf<MS[keyof MS]>, TypeOf<MS[keyof MS]>> =>
  K.fromSum(M)((tag, value, keys) =>
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
export const sum = <T extends string>(tag: T) => <A>(
  members: { [K in keyof A]: TaskDecoder<unknown, A[K]> }
): TaskDecoder<unknown, A[keyof A]> => pipe(UnknownRecord as any, compose(fromSum(tag)(members)))

/**
 * @category combinators
 * @since 2.2.7
 */
export const lazy: <I, A>(id: string, f: () => TaskDecoder<I, A>) => TaskDecoder<I, A> =
  /*#__PURE__*/
  K.lazy(M)((id, e) => FS.of(DE.lazy(id, e)))

// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------

const map_: Functor2<URI>['map'] = (fa, f) => pipe(fa, map(f))

const alt_: Alt2<URI>['alt'] = (me, that) => pipe(me, alt(that))

const compose_: Category2<URI>['compose'] = (ab, la) => pipe(la, compose(ab))

// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------

/**
 * @category Functor
 * @since 2.2.7
 */
export const map: <A, B>(f: (a: A) => B) => <I>(fa: TaskDecoder<I, A>) => TaskDecoder<I, B> =
  /*#__PURE__*/
  K.map(M)

/**
 * @category Alt
 * @since 2.2.7
 */
export const alt: <I, A>(that: () => TaskDecoder<I, A>) => (me: TaskDecoder<I, A>) => TaskDecoder<I, A> =
  /*#__PURE__*/
  K.alt(M)

/**
 * @category Semigroupoid
 * @since 2.2.8
 */
export const compose: <A, B>(to: TaskDecoder<A, B>) => <I>(from: TaskDecoder<I, A>) => TaskDecoder<I, B> =
  /*#__PURE__*/
  K.compose(M)

/**
 * @category Category
 * @since 2.2.8
 */
export const id: <A>() => TaskDecoder<A, A> =
  /*#__PURE__*/
  K.id(M)

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 2.2.7
 */
export const URI = 'io-ts/TaskDecoder'

/**
 * @category instances
 * @since 2.2.7
 */
export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind2<E, A> {
    readonly [URI]: TaskDecoder<E, A>
  }
}

/**
 * @category instances
 * @since 2.2.8
 */
export const Functor: Functor2<URI> = {
  URI,
  map: map_
}

/**
 * @category instances
 * @since 2.2.8
 */
export const Alt: Alt2<URI> = {
  URI,
  map: map_,
  alt: alt_
}

/**
 * @category instances
 * @since 2.2.8
 */
export const Category: Category2<URI> = {
  URI,
  compose: compose_,
  id
}

/**
 * @category instances
 * @since 2.2.8
 */
export const Schemable: S.Schemable2C<URI, unknown> = {
  URI,
  literal,
  string,
  number,
  boolean,
  nullable,
  type,
  partial,
  record,
  array,
  tuple: tuple as S.Schemable2C<URI, unknown>['tuple'],
  intersect,
  sum,
  lazy
}

/**
 * @category instances
 * @since 2.2.8
 */
export const WithUnknownContainers: S.WithUnknownContainers2C<URI, unknown> = {
  UnknownArray,
  UnknownRecord
}

/**
 * @category instances
 * @since 2.2.8
 */
export const WithUnion: S.WithUnion2C<URI, unknown> = {
  union: union as S.WithUnion2C<URI, unknown>['union']
}

/**
 * @category instances
 * @since 2.2.8
 */
export const WithRefine: S.WithRefine2C<URI, unknown> = {
  refine: refine as S.WithRefine2C<URI, unknown>['refine']
}

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.7
 */
export type TypeOf<KTD> = K.TypeOf<TE.URI, KTD>

/**
 * @since 2.2.8
 */
export type InputOf<KTD> = K.InputOf<TE.URI, KTD>

/**
 * @since 2.2.7
 */
export const draw: (e: DecodeError) => string = D.draw

/**
 * @internal
 */
export const stringify: <A>(e: TE.TaskEither<DecodeError, A>) => T.Task<string> = TE.fold(
  (e) => T.of(draw(e)),
  (a) => T.of(JSON.stringify(a, null, 2))
)
