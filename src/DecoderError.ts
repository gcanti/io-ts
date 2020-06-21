/**
 * @since 2.2.7
 */
import { Semigroup } from 'fp-ts/lib/Semigroup'
import * as FS from './FreeSemigroup'

/**
 * @category model
 * @since 2.2.7
 */
export interface Leaf {
  readonly _tag: 'Leaf'
  readonly input: unknown
  readonly error: string
}

/**
 * @category model
 * @since 2.2.7
 */
export interface Required {
  readonly _tag: 'Required'
  readonly key: string
  readonly errors: FS.FreeSemigroup<DecodeError>
}

/**
 * @category model
 * @since 2.2.7
 */
export type DecodeError = Leaf | Required

/**
 * @category constructors
 * @since 2.2.7
 */
export const leaf = (input: unknown, error: string): DecodeError => ({ _tag: 'Leaf', input, error })

/**
 * @category constructors
 * @since 2.2.7
 */
export const required = (key: string, errors: FS.FreeSemigroup<DecodeError>): DecodeError => ({
  _tag: 'Required',
  key,
  errors
})

/**
 * @category destructors
 * @since 2.2.7
 */
export const fold = <R>(patterns: {
  Leaf: (input: unknown, error: string) => R
  Required: (k: string, errors: FS.FreeSemigroup<DecodeError>) => R
}): ((e: DecodeError) => R) => {
  const f = (e: DecodeError): R => {
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
export function getSemigroup(): Semigroup<FS.FreeSemigroup<DecodeError>> {
  return FS.getSemigroup()
}
