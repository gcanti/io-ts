/**
 * @since 2.2.0
 */
import { Alternative1 } from 'fp-ts/lib/Alternative'
import { Applicative1 } from 'fp-ts/lib/Applicative'
import { Either, either, isLeft, isRight, left, mapLeft, right } from 'fp-ts/lib/Either'
import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray'
import { pipe, pipeable } from 'fp-ts/lib/pipeable'
import { Tree, Forest } from 'fp-ts/lib/Tree'
import * as G from './Guard'
import { Schemable, memoize, WithUnion, Literal } from './Schemable'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.0
 */
export interface Decoder<A> {
  readonly decode: (u: unknown) => Either<NonEmptyArray<Tree<string>>, A>
}

/**
 * @since 2.2.0
 */
export type TypeOf<D> = D extends Decoder<infer A> ? A : never

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

const empty: Array<never> = []

/**
 * @since 2.2.0
 */
export function tree<A>(value: A, forest: Forest<A> = empty): Tree<A> {
  return {
    value,
    forest
  }
}

/**
 * @since 2.2.0
 */
export function success<A>(a: A): Either<NonEmptyArray<Tree<string>>, A> {
  return right(a)
}

/**
 * @since 2.2.0
 */
export function failure<A = never>(message: string): Either<NonEmptyArray<Tree<string>>, A> {
  return left([tree(message)])
}

/**
 * @since 2.2.0
 */
export function failures<A = never>(
  message: string,
  errors: NonEmptyArray<Tree<string>>
): Either<NonEmptyArray<Tree<string>>, A> {
  return left([tree(message, errors)])
}

/**
 * @since 2.2.0
 */
export function fromGuard<A>(guard: G.Guard<A>, expected: string): Decoder<A> {
  return {
    decode: (u) => (guard.is(u) ? success(u) : failure(`cannot decode ${JSON.stringify(u)}, should be ${expected}`))
  }
}

/**
 * @since 2.2.0
 */
export function literal<A extends ReadonlyArray<Literal>>(...values: A): Decoder<A[number]> {
  if (values.length === 0) {
    return never
  }
  const expected = values.map((value) => JSON.stringify(value)).join(' | ')
  return fromGuard(G.guard.literal(...values), expected)
}

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.0
 */
export const never: Decoder<never> = fromGuard(G.never, 'never')

/**
 * @since 2.2.0
 */
export const string: Decoder<string> = fromGuard(G.string, 'string')

/**
 * @since 2.2.0
 */
export const number: Decoder<number> = fromGuard(G.number, 'number')

/**
 * @since 2.2.0
 */
export const boolean: Decoder<boolean> = fromGuard(G.boolean, 'boolean')

/**
 * @since 2.2.0
 */
export const UnknownArray: Decoder<Array<unknown>> = fromGuard(G.UnknownArray, 'Array<unknown>')

/**
 * @since 2.2.0
 */
export const UnknownRecord: Decoder<Record<string, unknown>> = fromGuard(G.UnknownRecord, 'Record<string, unknown>')

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.0
 */
export function withExpected<A>(
  decoder: Decoder<A>,
  expected: (actual: unknown, nea: NonEmptyArray<Tree<string>>) => NonEmptyArray<Tree<string>>
): Decoder<A> {
  return {
    decode: (u) =>
      pipe(
        decoder.decode(u),
        mapLeft((nea) => expected(u, nea))
      )
  }
}

/**
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
      if (isLeft(e)) {
        return e
      }
      const a = e.right
      return refinement(a) ? success(a) : failure(`cannot refine ${JSON.stringify(u)}, should be ${expected}`)
    }
  }
}

/**
 * @since 2.2.0
 */
export function parse<A, B>(from: Decoder<A>, parser: (a: A) => Either<string, B>): Decoder<B> {
  return {
    decode: (u) => {
      const e = from.decode(u)
      if (isLeft(e)) {
        return e
      }
      const pe = parser(e.right)
      if (isLeft(pe)) {
        return failure(pe.left)
      }
      return pe
    }
  }
}

/**
 * @since 2.2.0
 */
export function nullable<A>(or: Decoder<A>): Decoder<null | A> {
  return union(literal(null), or)
}

/**
 * @since 2.2.0
 */
export function type<A>(properties: { [K in keyof A]: Decoder<A[K]> }): Decoder<A> {
  return {
    decode: (u) => {
      const e = UnknownRecord.decode(u)
      if (isLeft(e)) {
        return e
      } else {
        const r = e.right
        let a: Partial<A> = {}
        for (const k in properties) {
          const e = properties[k].decode(r[k])
          if (isLeft(e)) {
            return failures(`required property ${JSON.stringify(k)}`, e.left)
          } else {
            a[k] = e.right
          }
        }
        return success(a as A)
      }
    }
  }
}

/**
 * @since 2.2.0
 */
export function partial<A>(properties: { [K in keyof A]: Decoder<A[K]> }): Decoder<Partial<A>> {
  return {
    decode: (u) => {
      const e = UnknownRecord.decode(u)
      if (isLeft(e)) {
        return e
      } else {
        const r = e.right
        let a: Partial<A> = {}
        for (const k in properties) {
          // don't add missing properties
          if (k in r) {
            const rk = r[k]
            // don't strip undefined properties
            if (rk === undefined) {
              a[k] = undefined
            } else {
              const e = properties[k].decode(rk)
              if (isLeft(e)) {
                return failures(`optional property ${JSON.stringify(k)}`, e.left)
              } else {
                a[k] = e.right
              }
            }
          }
        }
        return success(a)
      }
    }
  }
}

/**
 * @since 2.2.0
 */
export function record<A>(codomain: Decoder<A>): Decoder<Record<string, A>> {
  return {
    decode: (u) => {
      const e = UnknownRecord.decode(u)
      if (isLeft(e)) {
        return e
      } else {
        const r = e.right
        let a: Record<string, A> = {}
        for (const k in r) {
          const e = codomain.decode(r[k])
          if (isLeft(e)) {
            return failures(`key ${JSON.stringify(k)}`, e.left)
          } else {
            a[k] = e.right
          }
        }
        return success(a)
      }
    }
  }
}

/**
 * @since 2.2.0
 */
export function array<A>(items: Decoder<A>): Decoder<Array<A>> {
  return {
    decode: (u) => {
      const e = UnknownArray.decode(u)
      if (isLeft(e)) {
        return e
      } else {
        const us = e.right
        const len = us.length
        const a: Array<A> = new Array(len)
        for (let i = 0; i < len; i++) {
          const e = items.decode(us[i])
          if (isLeft(e)) {
            return failures(`item ${i}`, e.left)
          } else {
            a[i] = e.right
          }
        }
        return success(a)
      }
    }
  }
}

/**
 * @since 2.2.0
 */
export function tuple<A extends ReadonlyArray<unknown>>(...components: { [K in keyof A]: Decoder<A[K]> }): Decoder<A> {
  return {
    decode: (u) => {
      const e = UnknownArray.decode(u)
      if (isLeft(e)) {
        return e
      }
      const us = e.right
      const a: Array<unknown> = []
      for (let i = 0; i < components.length; i++) {
        const e = components[i].decode(us[i])
        if (isLeft(e)) {
          return failures(`component ${i}`, e.left)
        } else {
          a.push(e.right)
        }
      }
      return success(a as any)
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
 * @since 2.2.0
 */
export function intersection<A, B>(left: Decoder<A>, right: Decoder<B>): Decoder<A & B> {
  return {
    decode: (u) => {
      const ea = left.decode(u)
      if (isLeft(ea)) {
        return ea
      }
      const eb = right.decode(u)
      if (isLeft(eb)) {
        return eb
      }
      return success(intersect(ea.right, eb.right))
    }
  }
}

/**
 * @since 2.2.0
 */
export function lazy<A>(id: string, f: () => Decoder<A>): Decoder<A> {
  const get = memoize<void, Decoder<A>>(f)
  return {
    decode: (u) =>
      pipe(
        get().decode(u),
        mapLeft((nea) => [tree(id, nea)])
      )
  }
}

/**
 * @since 2.2.0
 */
export function sum<T extends string>(
  tag: T
): <A>(members: { [K in keyof A]: Decoder<A[K] & Record<T, K>> }) => Decoder<A[keyof A]> {
  return (members) => {
    const keys = Object.keys(members)
    if (keys.length === 0) {
      return never
    }
    const expected = keys.map((k) => JSON.stringify(k)).join(' | ')
    return {
      decode: (u) => {
        const e = UnknownRecord.decode(u)
        if (isLeft(e)) {
          return e
        }
        const v = e.right[tag]
        if (G.string.is(v) && v in members) {
          return (members as any)[v].decode(u)
        }
        return failures(`required property ${JSON.stringify(tag)}`, [
          tree(`cannot decode ${JSON.stringify(v)}, should be ${expected}`)
        ])
      }
    }
  }
}

/**
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
      if (isRight(e)) {
        return e
      } else {
        const forest: NonEmptyArray<Tree<string>> = [tree(`member 0`, e.left)]
        for (let i = 1; i < len; i++) {
          const e = members[i].decode(u)
          if (isRight(e)) {
            return e
          } else {
            forest.push(tree(`member ${i}`, e.left))
          }
        }
        return left(forest)
      }
    }
  }
}

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.0
 */
export const URI = 'Decoder'

/**
 * @since 2.2.0
 */
export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly Decoder: Decoder<A>
  }
}

/**
 * @since 2.2.0
 */
export const decoder: Applicative1<URI> & Alternative1<URI> & Schemable<URI> & WithUnion<URI> = {
  URI,
  map: (fa, f) => ({
    decode: (u) => either.map(fa.decode(u), f)
  }),
  of: (a) => ({
    decode: () => success(a)
  }),
  ap: (fab, fa) => ({
    decode: (u) => either.ap(fab.decode(u), fa.decode(u))
  }),
  alt: (fx, fy) => ({
    decode: (u) => either.alt(fx.decode(u), () => fy().decode(u))
  }),
  zero: () => never,
  literal,
  string,
  number,
  boolean,
  UnknownArray,
  UnknownRecord,
  nullable,
  type,
  partial,
  record,
  array,
  tuple: tuple as Schemable<URI>['tuple'],
  intersection,
  sum,
  lazy,
  union
}

const { alt, ap, apFirst, apSecond, map } = pipeable(decoder)

export {
  /**
   * @since 2.2.0
   */
  alt,
  /**
   * @since 2.2.0
   */
  ap,
  /**
   * @since 2.2.0
   */
  apFirst,
  /**
   * @since 2.2.0
   */
  apSecond,
  /**
   * @since 2.2.0
   */
  map
}
