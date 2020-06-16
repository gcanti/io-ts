/**
 * @since 2.2.0
 */
import * as E from 'fp-ts/lib/Either'
import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray'
import { pipe } from 'fp-ts/lib/pipeable'
import { Forest, Tree } from 'fp-ts/lib/Tree'
import * as G from './Guard'
import { Literal, memoize, Schemable1, WithRefinement1, WithUnion1, WithUnknownContainers1 } from './Schemable'
import { Functor1 } from 'fp-ts/lib/Functor'
import { Alt1 } from 'fp-ts/lib/Alt'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

import Either = E.Either

/**
 * @category model
 * @since 2.2.0
 */
export interface Decoder<A> {
  readonly decode: (u: unknown) => Either<DecodeError, A>
}

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.0
 */
export type TypeOf<D> = D extends Decoder<infer A> ? A : never

// -------------------------------------------------------------------------------------
// DecodeError
// -------------------------------------------------------------------------------------

/**
 * @category DecodeError
 * @since 2.2.2
 */
export interface DecodeError extends NonEmptyArray<Tree<string>> {}

const empty: Array<never> = []

/**
 * @category DecodeError
 * @since 2.2.0
 */
export function tree<A>(value: A, forest: Forest<A> = empty): Tree<A> {
  return {
    value,
    forest
  }
}

/**
 * @category DecodeError
 * @since 2.2.0
 */
export function success<A>(a: A): Either<DecodeError, A> {
  return E.right(a)
}

/**
 * @category DecodeError
 * @since 2.2.0
 */
export function failure<A = never>(message: string): Either<DecodeError, A> {
  return E.left([tree(message)])
}

/**
 * @category DecodeError
 * @since 2.2.2
 */
export function isNotEmpty<A>(as: ReadonlyArray<A>): as is NonEmptyArray<A> {
  return as.length > 0
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 2.2.3
 */
export function of<A>(a: A): Decoder<A> {
  return {
    decode: () => success(a)
  }
}

/**
 * @category constructors
 * @since 2.2.0
 */
export function fromGuard<A>(guard: G.Guard<A>, expected: string): Decoder<A> {
  return {
    decode: (u) => (guard.is(u) ? success(u) : failure(`cannot decode ${JSON.stringify(u)}, should be ${expected}`))
  }
}

/**
 * @category constructors
 * @since 2.2.0
 */
export function literal<A extends ReadonlyArray<Literal>>(...values: A): Decoder<A[number]> {
  if (values.length === 0) {
    return never
  }
  const expected = values.map((value) => JSON.stringify(value)).join(' | ')
  return fromGuard(G.schemableGuard.literal(...values), expected)
}

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * @category primitives
 * @since 2.2.0
 */
export const never: Decoder<never> = fromGuard(G.never, 'never')

/**
 * @category primitives
 * @since 2.2.0
 */
export const string: Decoder<string> = fromGuard(G.string, 'string')

/**
 * @category primitives
 * @since 2.2.0
 */
export const number: Decoder<number> = fromGuard(G.number, 'number')

/**
 * @category primitives
 * @since 2.2.0
 */
export const boolean: Decoder<boolean> = fromGuard(G.boolean, 'boolean')

/**
 * @category primitives
 * @since 2.2.0
 */
export const UnknownArray: Decoder<Array<unknown>> = fromGuard(G.UnknownArray, 'Array<unknown>')

/**
 * @category primitives
 * @since 2.2.0
 */
export const UnknownRecord: Decoder<Record<string, unknown>> = fromGuard(G.UnknownRecord, 'Record<string, unknown>')

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 2.2.0
 */
export function withExpected<A>(
  decoder: Decoder<A>,
  expected: (actual: unknown, e: DecodeError) => DecodeError
): Decoder<A> {
  return {
    decode: (u) =>
      pipe(
        decoder.decode(u),
        E.mapLeft((nea) => expected(u, nea))
      )
  }
}

/**
 * @category combinators
 * @since 2.2.0
 */
export function refinement<A, B extends A>(
  from: Decoder<A>,
  refinement: (a: A) => a is B,
  expected: string
): Decoder<B> {
  return {
    decode: (u) => {
      const e = from.decode(u)
      if (E.isLeft(e)) {
        return e
      }
      const a = e.right
      return refinement(a) ? success(a) : failure(`cannot refine ${JSON.stringify(u)}, should be ${expected}`)
    }
  }
}

/**
 * @category combinators
 * @since 2.2.0
 */
export function parse<A, B>(from: Decoder<A>, parser: (a: A) => Either<string, B>): Decoder<B> {
  return {
    decode: (u) => {
      const e = from.decode(u)
      if (E.isLeft(e)) {
        return e
      }
      const pe = parser(e.right)
      if (E.isLeft(pe)) {
        return failure(pe.left)
      }
      return pe
    }
  }
}

/**
 * @category combinators
 * @since 2.2.0
 */
export function nullable<A>(or: Decoder<A>): Decoder<null | A> {
  return union(literal(null), or)
}

/**
 * @category combinators
 * @since 2.2.0
 */
export function type<A>(properties: { [K in keyof A]: Decoder<A[K]> }): Decoder<{ [K in keyof A]: A[K] }> {
  return {
    decode: (u) => {
      const e = UnknownRecord.decode(u)
      if (E.isLeft(e)) {
        return e
      } else {
        const r = e.right
        const a: Partial<A> = {}
        const errors: Array<Tree<string>> = []
        for (const k in properties) {
          const e = properties[k].decode(r[k])
          if (E.isLeft(e)) {
            errors.push(tree(`required property ${JSON.stringify(k)}`, e.left))
          } else {
            a[k] = e.right
          }
        }
        return isNotEmpty(errors) ? E.left(errors) : success(a as A)
      }
    }
  }
}

/**
 * @category combinators
 * @since 2.2.0
 */
export function partial<A>(properties: { [K in keyof A]: Decoder<A[K]> }): Decoder<Partial<{ [K in keyof A]: A[K] }>> {
  return {
    decode: (u) => {
      const e = UnknownRecord.decode(u)
      if (E.isLeft(e)) {
        return e
      } else {
        const r = e.right
        const a: Partial<A> = {}
        const errors: Array<Tree<string>> = []
        for (const k in properties) {
          // don't add missing properties
          if (k in r) {
            const rk = r[k]
            // don't strip undefined properties
            if (rk === undefined) {
              a[k] = undefined
            } else {
              const e = properties[k].decode(rk)
              if (E.isLeft(e)) {
                errors.push(tree(`optional property ${JSON.stringify(k)}`, e.left))
              } else {
                a[k] = e.right
              }
            }
          }
        }
        return isNotEmpty(errors) ? E.left(errors) : success(a)
      }
    }
  }
}

/**
 * @category combinators
 * @since 2.2.0
 */
export function record<A>(codomain: Decoder<A>): Decoder<Record<string, A>> {
  return {
    decode: (u) => {
      const e = UnknownRecord.decode(u)
      if (E.isLeft(e)) {
        return e
      } else {
        const r = e.right
        const a: Record<string, A> = {}
        const errors: Array<Tree<string>> = []
        for (const k in r) {
          const e = codomain.decode(r[k])
          if (E.isLeft(e)) {
            errors.push(tree(`key ${JSON.stringify(k)}`, e.left))
          } else {
            a[k] = e.right
          }
        }
        return isNotEmpty(errors) ? E.left(errors) : success(a)
      }
    }
  }
}

/**
 * @category combinators
 * @since 2.2.0
 */
export function array<A>(items: Decoder<A>): Decoder<Array<A>> {
  return {
    decode: (u) => {
      const e = UnknownArray.decode(u)
      if (E.isLeft(e)) {
        return e
      } else {
        const us = e.right
        const len = us.length
        const a: Array<A> = new Array(len)
        const errors: Array<Tree<string>> = []
        for (let i = 0; i < len; i++) {
          const e = items.decode(us[i])
          if (E.isLeft(e)) {
            errors.push(tree(`item ${i}`, e.left))
          } else {
            a[i] = e.right
          }
        }
        return isNotEmpty(errors) ? E.left(errors) : success(a)
      }
    }
  }
}

/**
 * @category combinators
 * @since 2.2.0
 */
export function tuple<A extends ReadonlyArray<unknown>>(...components: { [K in keyof A]: Decoder<A[K]> }): Decoder<A> {
  return {
    decode: (u) => {
      const e = UnknownArray.decode(u)
      if (E.isLeft(e)) {
        return e
      }
      const us = e.right
      const a: Array<unknown> = []
      const errors: Array<Tree<string>> = []
      for (let i = 0; i < components.length; i++) {
        const e = components[i].decode(us[i])
        if (E.isLeft(e)) {
          errors.push(tree(`component ${i}`, e.left))
        } else {
          a.push(e.right)
        }
      }
      return isNotEmpty(errors) ? E.left(errors) : success(a as any)
    }
  }
}

function typeOf(x: unknown): string {
  return x === null ? 'null' : typeof x
}

/**
 * @internal
 */
export function intersect<A, B>(a: A, b: B): A & B {
  if (a !== undefined && b !== undefined) {
    const tx = typeOf(a)
    const ty = typeOf(b)
    if (tx === 'object' || ty === 'object') {
      return Object.assign({}, a, b)
    }
  }
  return b as any
}

/**
 * @category combinators
 * @since 2.2.0
 */
export function intersection<A, B>(left: Decoder<A>, right: Decoder<B>): Decoder<A & B> {
  return {
    decode: (u) => {
      const ea = left.decode(u)
      const eb = right.decode(u)
      if (E.isLeft(ea)) {
        return E.isLeft(eb) ? E.left(ea.left.concat(eb.left) as DecodeError) : ea
      }
      if (E.isLeft(eb)) {
        return eb
      }
      return success(intersect(ea.right, eb.right))
    }
  }
}

/**
 * @category combinators
 * @since 2.2.0
 */
export function lazy<A>(id: string, f: () => Decoder<A>): Decoder<A> {
  const get = memoize<void, Decoder<A>>(f)
  return {
    decode: (u) =>
      pipe(
        get().decode(u),
        E.mapLeft((nea) => [tree(id, nea)])
      )
  }
}

/**
 * @category combinators
 * @since 2.2.0
 */
export function sum<T extends string>(tag: T): <A>(members: { [K in keyof A]: Decoder<A[K]> }) => Decoder<A[keyof A]> {
  return <A>(members: { [K in keyof A]: Decoder<A[K]> }) => {
    const keys = Object.keys(members)
    if (keys.length === 0) {
      return never
    }
    const expected = keys.map((k) => JSON.stringify(k)).join(' | ')
    return {
      decode: (u) => {
        const e = UnknownRecord.decode(u)
        if (E.isLeft(e)) {
          return e
        }
        const v = e.right[tag] as keyof A
        if (v in members) {
          return members[v].decode(u)
        }
        return E.left([
          tree(`required property ${JSON.stringify(tag)}`, [
            tree(`cannot decode ${JSON.stringify(v)}, should be ${expected}`)
          ])
        ])
      }
    }
  }
}

/**
 * @category combinators
 * @since 2.2.0
 */
export function union<A extends ReadonlyArray<unknown>>(
  ...members: { [K in keyof A]: Decoder<A[K]> }
): Decoder<A[number]> {
  const len = members.length
  if (len === 0) {
    return never
  }
  return {
    decode: (u) => {
      const e = members[0].decode(u)
      if (E.isRight(e)) {
        return e
      } else {
        const errors: DecodeError = [tree(`member 0`, e.left)]
        for (let i = 1; i < len; i++) {
          const e = members[i].decode(u)
          if (E.isRight(e)) {
            return e
          } else {
            errors.push(tree(`member ${i}`, e.left))
          }
        }
        return E.left(errors)
      }
    }
  }
}

// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------

/**
 * @category Functor
 * @since 2.2.0
 */
export const map: <A, B>(f: (a: A) => B) => (fa: Decoder<A>) => Decoder<B> = (f) => (fa) => map_(fa, f)

const map_: <A, B>(fa: Decoder<A>, f: (a: A) => B) => Decoder<B> = (fa, f) => ({
  decode: (u) => {
    const e = fa.decode(u)
    return E.isLeft(e) ? e : E.right(f(e.right))
  }
})

/**
 * @category Alt
 * @since 2.2.0
 */
export const alt: <A>(that: () => Decoder<A>) => (fa: Decoder<A>) => Decoder<A> = (that) => (fa) => alt_(fa, that)

const alt_: <A>(fx: Decoder<A>, fy: () => Decoder<A>) => Decoder<A> = (fx, fy) => ({
  decode: (u) => {
    const e = fx.decode(u)
    return E.isLeft(e) ? fy().decode(u) : e
  }
})

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 2.2.0
 */
export const URI = 'io-ts/Decoder'

/**
 * @category instances
 * @since 2.2.0
 */
export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly [URI]: Decoder<A>
  }
}

/**
 * @category instances
 * @since 2.2.3
 */
export const functorDecoder: Functor1<URI> = {
  URI,
  map: map_
}

/**
 * @category instances
 * @since 2.2.3
 */
export const altDecoder: Alt1<URI> = {
  URI,
  map: map_,
  alt: alt_
}

/**
 * @category instances
 * @since 2.2.3
 */
export const schemableDecoder: Schemable1<URI> &
  WithUnknownContainers1<URI> &
  WithUnion1<URI> &
  WithRefinement1<URI> = {
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
  tuple: tuple as Schemable1<URI>['tuple'],
  intersection,
  sum,
  lazy,
  UnknownArray,
  UnknownRecord,
  union,
  refinement: refinement as WithRefinement1<URI>['refinement']
}
