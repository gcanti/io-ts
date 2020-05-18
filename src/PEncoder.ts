/**
 * @since 2.2.3
 */
import { Contravariant2 } from 'fp-ts/lib/Contravariant'
import { pipeable } from 'fp-ts/lib/pipeable'
import { intersect } from './Decoder'
import { memoize } from './Schemable'
import { identity } from 'fp-ts/lib/function'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.3
 */
export interface PEncoder<O, A> {
  readonly encode: (a: A) => O
}

/**
 * @since 2.2.3
 */
export type TypeOf<E> = E extends PEncoder<any, infer A> ? A : never

/**
 * @since 2.2.3
 */
export type OutputOf<E> = E extends PEncoder<infer O, any> ? O : never

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.3
 */
export function id<A>(): PEncoder<A, A> {
  return {
    encode: identity
  }
}

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.3
 */
export function nullable<O, A>(or: PEncoder<O, A>): PEncoder<null | O, null | A> {
  return {
    encode: (a) => (a === null ? null : or.encode(a))
  }
}

/**
 * @since 2.2.3
 */
export function type<P extends Record<string, PEncoder<any, any>>>(
  properties: P
): PEncoder<{ [K in keyof P]: OutputOf<P[K]> }, { [K in keyof P]: TypeOf<P[K]> }> {
  return {
    encode: (a) => {
      const o: Record<keyof P, any> = {} as any
      for (const k in properties) {
        o[k] = properties[k].encode(a[k])
      }
      return o
    }
  }
}

/**
 * @since 2.2.3
 */
export function partial<P extends Record<string, PEncoder<any, any>>>(
  properties: P
): PEncoder<Partial<{ [K in keyof P]: OutputOf<P[K]> }>, Partial<{ [K in keyof P]: TypeOf<P[K]> }>> {
  return {
    encode: (a) => {
      const o: Record<keyof P, any> = {} as any
      for (const k in properties) {
        const v = a[k]
        // don't add missing properties
        if (k in a) {
          // don't strip undefined properties
          o[k] = v === undefined ? undefined : properties[k].encode(v)
        }
      }
      return o
    }
  }
}

/**
 * @since 2.2.3
 */
export function record<O, A>(codomain: PEncoder<O, A>): PEncoder<Record<string, O>, Record<string, A>> {
  return {
    encode: (r) => {
      const o: Record<string, O> = {}
      for (const k in r) {
        o[k] = codomain.encode(r[k])
      }
      return o
    }
  }
}

/**
 * @since 2.2.3
 */
export function array<O, A>(items: PEncoder<O, A>): PEncoder<Array<O>, Array<A>> {
  return {
    encode: (as) => as.map(items.encode)
  }
}

/**
 * @since 2.2.3
 */
export function tuple<C extends ReadonlyArray<PEncoder<any, any>>>(
  ...components: C
): PEncoder<{ [K in keyof C]: OutputOf<C[K]> }, { [K in keyof C]: TypeOf<C[K]> }> {
  return {
    encode: (as) => components.map((c, i) => c.encode(as[i])) as any
  }
}

/**
 * @since 2.2.3
 */
export function intersection<O, A, P, B>(left: PEncoder<O, A>, right: PEncoder<P, B>): PEncoder<O & P, A & B> {
  return {
    encode: (ab) => intersect(left.encode(ab), right.encode(ab))
  }
}

/**
 * @since 2.2.3
 */
export function sum<T extends string>(
  tag: T
): <M extends Record<string, PEncoder<any, any>>>(members: M) => PEncoder<OutputOf<M[keyof M]>, TypeOf<M[keyof M]>> {
  return (members: Record<string, PEncoder<any, any>>) => {
    return {
      encode: (a: Record<string, any>) => members[a[tag]].encode(a)
    }
  }
}

/**
 * @since 2.2.3
 */
export function lazy<O, A>(f: () => PEncoder<O, A>): PEncoder<O, A> {
  const get = memoize<void, PEncoder<O, A>>(f)
  return {
    encode: (a) => get().encode(a)
  }
}

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.3
 */
export const URI = 'PEncoder'

/**
 * @since 2.2.3
 */
export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind2<E, A> {
    readonly PEncoder: PEncoder<E, A>
  }
}

/**
 * @since 2.2.3
 */
export const pencoder: Contravariant2<URI> = {
  URI,
  contramap: (fa, f) => ({
    encode: (b) => fa.encode(f(b))
  })
}

const { contramap } = pipeable(pencoder)

export {
  /**
   * @since 2.2.3
   */
  contramap
}
