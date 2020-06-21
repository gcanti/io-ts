/**
 * @since 2.2.7
 */
import { Semigroup } from 'fp-ts/lib/Semigroup'
import * as FS from './FreeSemigroup'

/**
 * @category model
 * @since 2.2.7
 */
export interface Leaf<E> {
  readonly _tag: 'Leaf'
  readonly input: unknown
  readonly error: E
}

/**
 * @category model
 * @since 2.2.7
 */
export interface Required<E> {
  readonly _tag: 'Required'
  readonly key: string
  readonly errors: FS.FreeSemigroup<DecodeError<E>>
}

/**
 * @category model
 * @since 2.2.7
 */
export type DecodeError<E> = Leaf<E> | Required<E>

/**
 * @category constructors
 * @since 2.2.7
 */
export const leaf = <E>(input: unknown, error: E): DecodeError<E> => ({ _tag: 'Leaf', input, error })

/**
 * @category constructors
 * @since 2.2.7
 */
export const required = <E>(key: string, errors: FS.FreeSemigroup<DecodeError<E>>): DecodeError<E> => ({
  _tag: 'Required',
  key,
  errors
})

/**
 * @category destructors
 * @since 2.2.7
 */
export const fold = <E, R>(patterns: {
  Leaf: (input: unknown, error: E) => R
  Required: (k: string, errors: FS.FreeSemigroup<DecodeError<E>>) => R
}): ((e: DecodeError<E>) => R) => {
  const f = (e: DecodeError<E>): R => {
    switch (e._tag) {
      case 'Leaf':
        return patterns.Leaf(e.input, e.error)
      case 'Required':
        return patterns.Required(e.key, e.errors)
    }
  }
  return f
}

/**
 * @category instances
 * @since 2.2.7
 */
export function getSemigroup<E = never>(): Semigroup<FS.FreeSemigroup<DecodeError<E>>> {
  return FS.getSemigroup()
}
