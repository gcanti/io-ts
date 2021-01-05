/**
 * @since 3.0.0
 */
import { Semigroup } from 'fp-ts/Semigroup'
import * as FS from './FreeSemigroup'

/**
 * @category model
 * @since 3.0.0
 */
export interface Leaf<E> {
  readonly _tag: 'Leaf'
  readonly actual: unknown
  readonly error: E
}

/**
 * @category model
 * @since 3.0.0
 */
export const required = 'required' as const

/**
 * @category model
 * @since 3.0.0
 */
export const optional = 'optional' as const

/**
 * @category model
 * @since 3.0.0
 */
export type Kind = 'required' | 'optional'

/**
 * @category model
 * @since 3.0.0
 */
export interface Key<E> {
  readonly _tag: 'Key'
  readonly key: string
  readonly kind: Kind
  readonly errors: FS.FreeSemigroup<DecodeError<E>>
}

/**
 * @category model
 * @since 3.0.0
 */
export interface Index<E> {
  readonly _tag: 'Index'
  readonly index: number
  readonly kind: Kind
  readonly errors: FS.FreeSemigroup<DecodeError<E>>
}

/**
 * @category model
 * @since 3.0.0
 */
export interface Member<E> {
  readonly _tag: 'Member'
  readonly index: number
  readonly errors: FS.FreeSemigroup<DecodeError<E>>
}

/**
 * @category model
 * @since 3.0.0
 */
export interface Lazy<E> {
  readonly _tag: 'Lazy'
  readonly id: string
  readonly errors: FS.FreeSemigroup<DecodeError<E>>
}

/**
 * @category model
 * @since 3.0.0
 */
export interface Wrap<E> {
  readonly _tag: 'Wrap'
  readonly error: E
  readonly errors: FS.FreeSemigroup<DecodeError<E>>
}

/**
 * @category model
 * @since 3.0.0
 */
export type DecodeError<E> = Leaf<E> | Key<E> | Index<E> | Member<E> | Lazy<E> | Wrap<E>

/**
 * @category constructors
 * @since 3.0.0
 */
export const leaf = <E>(actual: unknown, error: E): DecodeError<E> => ({ _tag: 'Leaf', actual, error })

/**
 * @category constructors
 * @since 3.0.0
 */
export const key = <E>(key: string, kind: Kind, errors: FS.FreeSemigroup<DecodeError<E>>): DecodeError<E> => ({
  _tag: 'Key',
  key,
  kind,
  errors
})

/**
 * @category constructors
 * @since 3.0.0
 */
export const index = <E>(index: number, kind: Kind, errors: FS.FreeSemigroup<DecodeError<E>>): DecodeError<E> => ({
  _tag: 'Index',
  index,
  kind,
  errors
})

/**
 * @category constructors
 * @since 3.0.0
 */
export const member = <E>(index: number, errors: FS.FreeSemigroup<DecodeError<E>>): DecodeError<E> => ({
  _tag: 'Member',
  index,
  errors
})

/**
 * @category constructors
 * @since 3.0.0
 */
export const lazy = <E>(id: string, errors: FS.FreeSemigroup<DecodeError<E>>): DecodeError<E> => ({
  _tag: 'Lazy',
  id,
  errors
})

/**
 * @category constructors
 * @since 3.0.0
 */
export const wrap = <E>(error: E, errors: FS.FreeSemigroup<DecodeError<E>>): DecodeError<E> => ({
  _tag: 'Wrap',
  error,
  errors
})

/**
 * @category destructors
 * @since 3.0.0
 */
export const fold = <E, R>(patterns: {
  readonly Leaf: (input: unknown, error: E) => R
  readonly Key: (key: string, kind: Kind, errors: FS.FreeSemigroup<DecodeError<E>>) => R
  readonly Index: (index: number, kind: Kind, errors: FS.FreeSemigroup<DecodeError<E>>) => R
  readonly Member: (index: number, errors: FS.FreeSemigroup<DecodeError<E>>) => R
  readonly Lazy: (id: string, errors: FS.FreeSemigroup<DecodeError<E>>) => R
  readonly Wrap: (error: E, errors: FS.FreeSemigroup<DecodeError<E>>) => R
}): ((e: DecodeError<E>) => R) => {
  const f = (e: DecodeError<E>): R => {
    switch (e._tag) {
      case 'Leaf':
        return patterns.Leaf(e.actual, e.error)
      case 'Key':
        return patterns.Key(e.key, e.kind, e.errors)
      case 'Index':
        return patterns.Index(e.index, e.kind, e.errors)
      case 'Member':
        return patterns.Member(e.index, e.errors)
      case 'Lazy':
        return patterns.Lazy(e.id, e.errors)
      case 'Wrap':
        return patterns.Wrap(e.error, e.errors)
    }
  }
  return f
}

/**
 * @category instances
 * @since 3.0.0
 */
export function getSemigroup<E = never>(): Semigroup<FS.FreeSemigroup<DecodeError<E>>> {
  return FS.getSemigroup()
}
