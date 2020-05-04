/**
 * @since 2.2.0
 */
import { Contravariant1 } from 'fp-ts/lib/Contravariant'
import { identity } from 'fp-ts/lib/function'
import { pipeable } from 'fp-ts/lib/pipeable'
import { Schemable, memoize } from './Schemable'
import { intersect } from './Decoder'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.0
 */
export interface Encoder<A> {
  readonly encode: (a: A) => unknown
}

/**
 * @since 2.2.2
 */
export type TypeOf<E> = E extends Encoder<infer A> ? A : never

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.0
 */
export const id: Encoder<unknown> = {
  encode: identity
}

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.0
 */
export function nullable<A>(or: Encoder<A>): Encoder<null | A> {
  return {
    encode: (a) => (a === null ? a : or.encode(a))
  }
}

/**
 * @since 2.2.0
 */
export function type<A>(properties: { [K in keyof A]: Encoder<A[K]> }): Encoder<A> {
  return {
    encode: (a) => {
      const o: Record<string, unknown> = {}
      for (const k in properties) {
        o[k] = properties[k].encode(a[k])
      }
      return o
    }
  }
}

/**
 * @since 2.2.0
 */
export function partial<A>(properties: { [K in keyof A]: Encoder<A[K]> }): Encoder<Partial<A>> {
  return {
    encode: (a) => {
      const o: Record<string, unknown> = {}
      for (const k in properties) {
        const v: A[Extract<keyof A, string>] | undefined = a[k]
        // don't add missing properties
        if (k in a) {
          // don't strip undefined properties
          o[k] = v === undefined ? v : properties[k].encode(v)
        }
      }
      return o
    }
  }
}

/**
 * @since 2.2.0
 */
export function record<A>(codomain: Encoder<A>): Encoder<Record<string, A>> {
  return {
    encode: (r) => {
      const o: Record<string, unknown> = {}
      for (const k in r) {
        o[k] = codomain.encode(r[k])
      }
      return o
    }
  }
}

/**
 * @since 2.2.0
 */
export function array<A>(items: Encoder<A>): Encoder<Array<A>> {
  return {
    encode: (as) => as.map(items.encode)
  }
}

/**
 * @since 2.2.0
 */
export function tuple<A extends ReadonlyArray<unknown>>(...components: { [K in keyof A]: Encoder<A[K]> }): Encoder<A> {
  return {
    encode: (as) => components.map((c, i) => c.encode(as[i]))
  }
}

/**
 * @since 2.2.0
 */
export function intersection<A, B>(left: Encoder<A>, right: Encoder<B>): Encoder<A & B> {
  return {
    encode: (ab) => intersect(left.encode(ab), right.encode(ab))
  }
}

/**
 * @since 2.2.0
 */
export function sum<T extends string>(
  tag: T
): <A>(members: { [K in keyof A]: Encoder<A[K] & Record<T, K>> }) => Encoder<A[keyof A]> {
  return (members: Record<string, Encoder<any>>) => {
    return {
      encode: (a: Record<string, any>) => members[a[tag]].encode(a)
    }
  }
}

/**
 * @since 2.2.0
 */
export function lazy<A>(f: () => Encoder<A>): Encoder<A> {
  const get = memoize<void, Encoder<A>>(f)
  return {
    encode: (a) => get().encode(a)
  }
}

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.0
 */
export const URI = 'Encoder'

/**
 * @since 2.2.0
 */
export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly Encoder: Encoder<A>
  }
}

/**
 * @since 2.2.0
 */
export const encoder: Contravariant1<URI> & Schemable<URI> = {
  URI,
  contramap: (fa, f) => ({
    encode: (b) => fa.encode(f(b))
  }),
  literal: () => id,
  string: id,
  number: id,
  boolean: id,
  UnknownArray: id,
  UnknownRecord: id,
  nullable,
  type,
  partial,
  record,
  array,
  tuple,
  intersection,
  sum,
  lazy: (_, f) => lazy(f)
}

const { contramap } = pipeable(encoder)

export {
  /**
   * @since 2.2.0
   */
  contramap
}
