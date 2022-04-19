/**
 * **This module is experimental**
 *
 * Experimental features are published in order to get early feedback from the community, see these tracking
 * [issues](https://github.com/gcanti/io-ts/issues?q=label%3Av2.2+) for further discussions and enhancements.
 *
 * A feature tagged as _Experimental_ is in a high state of flux, you're at risk of it changing without notice.
 *
 * @since 2.2.17
 */
import { flow } from 'fp-ts/lib/function'
import { ReadonlyNonEmptyArray } from 'fp-ts/lib/ReadonlyNonEmptyArray'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 2.2.17
 */
export interface RequiredKeyE<K, E> {
  readonly _tag: 'RequiredKeyE'
  readonly key: K
  readonly error: E
}

/**
 * @category model
 * @since 2.2.17
 */
export interface OptionalKeyE<K, E> {
  readonly _tag: 'OptionalKeyE'
  readonly key: K
  readonly error: E
}

/**
 * @category model
 * @since 2.2.17
 */
export interface RequiredIndexE<I, E> {
  readonly _tag: 'RequiredIndexE'
  readonly index: I
  readonly error: E
}

/**
 * @category model
 * @since 2.2.17
 */
export interface OptionalIndexE<I, E> {
  readonly _tag: 'OptionalIndexE'
  readonly index: I
  readonly error: E
}

/**
 * @category model
 * @since 2.2.17
 */
export interface LazyE<E> {
  readonly _tag: 'LazyE'
  readonly id: string
  readonly error: E
}

/**
 * @category model
 * @since 2.2.17
 */
export interface MemberE<M, E> {
  readonly _tag: 'MemberE'
  readonly member: M
  readonly error: E
}

/**
 * @category model
 * @since 2.2.17
 */
export interface LeafE<E> {
  readonly _tag: 'LeafE'
  readonly error: E
}

/**
 * @category model
 * @since 2.2.17
 */
export interface TagE {
  readonly _tag: 'TagE'
  readonly tag: string
  readonly literals: ReadonlyArray<string>
}

/**
 * @category model
 * @since 2.2.17
 */
export interface TagLE extends LeafE<TagE> {}

/**
 * @category model
 * @since 2.2.17
 */
export interface RefinementE<E> {
  readonly _tag: 'RefinementE'
  readonly error: E
}
/**
 * @category model
 * @since 2.2.17
 */
export interface RefinementRE<E> extends RefinementE<DecodeError<E>> {}

/**
 * @category model
 * @since 2.2.17
 */
export interface RefinementL<A> {
  readonly _tag: 'RefinementL'
  readonly actual: A
}

/**
 * @category model
 * @since 2.2.17
 */
export interface RefinementLE<A> extends LeafE<RefinementL<A>> {}

/**
 * @category model
 * @since 2.2.17
 */
export interface ParseE<E> {
  readonly _tag: 'ParseE'
  readonly error: E
}
/**
 * @category model
 * @since 2.2.17
 */
export interface ParseRE<E> extends ParseE<DecodeError<E>> {}

/**
 * @category model
 * @since 2.2.17
 */
export interface NullableE<E> {
  readonly _tag: 'NullableE'
  readonly error: E
}

/**
 * @category model
 * @since 2.2.17
 */
export interface PrevE<E> {
  readonly _tag: 'PrevE'
  readonly error: E
}

/**
 * @category model
 * @since 2.2.17
 */
export interface NextE<E> {
  readonly _tag: 'NextE'
  readonly error: E
}

/**
 * @category model
 * @since 2.2.17
 */
export interface MissingIndexesE {
  readonly _tag: 'MissingIndexesE'
  readonly indexes: ReadonlyNonEmptyArray<number>
}

/**
 * @category model
 * @since 2.2.17
 */
export interface UnexpectedIndexesE {
  readonly _tag: 'UnexpectedIndexesE'
  readonly indexes: ReadonlyNonEmptyArray<number>
}

/**
 * @category model
 * @since 2.2.17
 */
export interface SumE<E> {
  readonly _tag: 'SumE'
  readonly error: E
}

/**
 * @category model
 * @since 2.2.17
 */
export interface MessageE {
  readonly _tag: 'MessageE'
  readonly message: string
}

/**
 * @category model
 * @since 2.2.17
 */
export interface MessageLE extends LeafE<MessageE> {}

/**
 * @category model
 * @since 2.2.17
 */
export interface MissingKeysE {
  readonly _tag: 'MissingKeysE'
  readonly keys: ReadonlyNonEmptyArray<string>
}

/**
 * @category model
 * @since 2.2.17
 */
export interface UnexpectedKeysE {
  readonly _tag: 'UnexpectedKeysE'
  readonly keys: ReadonlyNonEmptyArray<string>
}

/**
 * @category model
 * @since 2.2.17
 */
export interface CompoundE<E> {
  readonly _tag: 'CompoundE'
  readonly name: string
  readonly errors: ReadonlyNonEmptyArray<E>
}

/**
 * @category model
 * @since 2.2.17
 */
export interface StringE {
  readonly _tag: 'StringE'
  readonly actual: unknown
}

/**
 * @category model
 * @since 2.2.17
 */
export interface StringLE extends LeafE<StringE> {}

/**
 * @category model
 * @since 2.2.17
 */
export interface NumberE {
  readonly _tag: 'NumberE'
  readonly actual: unknown
}
/**
 * @category model
 * @since 2.2.17
 */
export interface NumberLE extends LeafE<NumberE> {}

/**
 * @category model
 * @since 2.2.17
 */
export interface NaNE {
  readonly _tag: 'NaNE'
}

/**
 * @category model
 * @since 2.2.17
 */
export interface NaNLE extends LeafE<NaNE> {}

/**
 * @category model
 * @since 2.2.17
 */
export interface InfinityE {
  readonly _tag: 'InfinityE'
}

/**
 * @category model
 * @since 2.2.17
 */
export interface InfinityLE extends LeafE<InfinityE> {}

/**
 * @category model
 * @since 2.2.17
 */
export interface BooleanE {
  readonly _tag: 'BooleanE'
  readonly actual: unknown
}

/**
 * @category model
 * @since 2.2.17
 */
export interface BooleanLE extends LeafE<BooleanE> {}

/**
 * @category model
 * @since 2.2.17
 */
export interface UnknownArrayE {
  readonly _tag: 'UnknownArrayE'
  readonly actual: unknown
}

/**
 * @category model
 * @since 2.2.17
 */
export interface UnknownArrayLE extends LeafE<UnknownArrayE> {}

/**
 * @category model
 * @since 2.2.17
 */
export interface UnknownRecordE {
  readonly _tag: 'UnknownRecordE'
  readonly actual: unknown
}
/**
 * @category model
 * @since 2.2.17
 */
export interface UnknownRecordLE extends LeafE<UnknownRecordE> {}

/**
 * @category model
 * @since 2.2.17
 */
export type Literal = string | number | boolean | null | undefined | symbol

/**
 * @category model
 * @since 2.2.17
 */
export interface LiteralE<A extends Literal> {
  readonly _tag: 'LiteralE'
  readonly literals: ReadonlyNonEmptyArray<A>
  readonly actual: unknown
}

/**
 * @category model
 * @since 2.2.17
 */
export interface LiteralLE<A extends Literal> extends LeafE<LiteralE<A>> {}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 2.2.17
 */
export const requiredKeyE = <K, E>(key: K, error: E): RequiredKeyE<K, E> => ({
  _tag: 'RequiredKeyE',
  key,
  error
})

/**
 * @category constructors
 * @since 2.2.17
 */
export const optionalKeyE = <K, E>(key: K, error: E): OptionalKeyE<K, E> => ({
  _tag: 'OptionalKeyE',
  key,
  error
})

/**
 * @category constructors
 * @since 2.2.17
 */
export const requiredIndexE = <I, E>(index: I, error: E): RequiredIndexE<I, E> => ({
  _tag: 'RequiredIndexE',
  index,
  error
})

/**
 * @category constructors
 * @since 2.2.17
 */
export const optionalIndexE = <I, E>(index: I, error: E): OptionalIndexE<I, E> => ({
  _tag: 'OptionalIndexE',
  index,
  error
})

/**
 * @category constructors
 * @since 2.2.17
 */
export const lazyE = <E>(id: string, error: E): LazyE<E> => ({ _tag: 'LazyE', id, error })

/**
 * @category constructors
 * @since 2.2.17
 */
export const memberE = <M, E>(member: M, error: E): MemberE<M, E> => ({ _tag: 'MemberE', member, error })

/**
 * @category constructors
 * @since 2.2.17
 */
export const leafE = <E>(error: E): LeafE<E> => ({ _tag: 'LeafE', error })

/**
 * @category constructors
 * @since 2.2.17
 */
export const tagLE = (tag: string, literals: ReadonlyArray<string>): TagLE => leafE({ _tag: 'TagE', tag, literals })

/**
 * @category constructors
 * @since 2.2.17
 */
export const refinementE = <E>(error: E): RefinementE<E> => ({ _tag: 'RefinementE', error })

/**
 * @category constructors
 * @since 2.2.17
 */
export const refinementLE = <A>(actual: A): RefinementLE<A> =>
  leafE({
    _tag: 'RefinementL',
    actual
  })

/**
 * @category constructors
 * @since 2.2.17
 */
export const parseE = <E>(error: E): ParseE<E> => ({ _tag: 'ParseE', error })

/**
 * @category constructors
 * @since 2.2.17
 */
export const nullableE = <E>(error: E): NullableE<E> => ({ _tag: 'NullableE', error })

/**
 * @category constructors
 * @since 2.2.17
 */
export const prevE = <E>(error: E): PrevE<E> => ({ _tag: 'PrevE', error })

/**
 * @category constructors
 * @since 2.2.17
 */
export const nextE = <E>(error: E): NextE<E> => ({ _tag: 'NextE', error })

/**
 * @category constructors
 * @since 2.2.17
 */
export const missingIndexesE = (indexes: ReadonlyNonEmptyArray<number>): MissingIndexesE => ({
  _tag: 'MissingIndexesE',
  indexes
})

/**
 * @category constructors
 * @since 2.2.17
 */
export const unexpectedIndexesE = (indexes: ReadonlyNonEmptyArray<number>): UnexpectedIndexesE => ({
  _tag: 'UnexpectedIndexesE',
  indexes
})

/**
 * @category constructors
 * @since 2.2.17
 */
export const sumE = <E>(error: E): SumE<E> => ({
  _tag: 'SumE',
  error
})

/**
 * @category constructors
 * @since 2.2.17
 */
export const messageE = (message: string): MessageE => ({
  _tag: 'MessageE',
  message
})

/**
 * @category constructors
 * @since 2.2.17
 */
export const messageLE: (message: string) => MessageLE = flow(messageE, leafE)

/**
 * @category constructors
 * @since 2.2.17
 */
export const missingKeysE = (keys: ReadonlyNonEmptyArray<string>): MissingKeysE => ({
  _tag: 'MissingKeysE',
  keys
})

/**
 * @category constructors
 * @since 2.2.17
 */
export const unexpectedKeysE = (keys: ReadonlyNonEmptyArray<string>): UnexpectedKeysE => ({
  _tag: 'UnexpectedKeysE',
  keys
})

/**
 * @category constructors
 * @since 2.2.17
 */
export const compoundE = (name: string) => <E>(errors: ReadonlyNonEmptyArray<E>): CompoundE<E> => ({
  _tag: 'CompoundE',
  name,
  errors
})

/**
 * @category constructors
 * @since 2.2.17
 */
export const unionE = compoundE('union')

/**
 * @category constructors
 * @since 2.2.17
 */
export const structE = compoundE('struct')

/**
 * @category constructors
 * @since 2.2.17
 */
export const partialE = compoundE('partial')

/**
 * @category constructors
 * @since 2.2.17
 */
export const recordE = compoundE('record')

/**
 * @category constructors
 * @since 2.2.17
 */
export const tupleE = compoundE('tuple')

/**
 * @category constructors
 * @since 2.2.17
 */
export const arrayE = compoundE('array')

/**
 * @category constructors
 * @since 2.2.17
 */
export const compositionE = compoundE('composition')

/**
 * @category constructors
 * @since 2.2.17
 */
export const intersectionE = compoundE('intersection')

/**
 * @category constructors
 * @since 2.2.17
 */
export const stringLE = (actual: unknown): StringLE => leafE({ _tag: 'StringE', actual })

/**
 * @category constructors
 * @since 2.2.17
 */
export const numberLE = (actual: unknown): NumberLE => leafE({ _tag: 'NumberE', actual })

/**
 * @category constructors
 * @since 2.2.17
 */
export const naNLE: NaNLE = leafE({ _tag: 'NaNE' })

/**
 * @category constructors
 * @since 2.2.17
 */
export const infinityLE: InfinityLE = leafE({ _tag: 'InfinityE' })

/**
 * @category constructors
 * @since 2.2.17
 */
export const booleanLE = (actual: unknown): BooleanLE => leafE({ _tag: 'BooleanE', actual })

/**
 * @category constructors
 * @since 2.2.17
 */
export const unknownArrayLE = (actual: unknown): UnknownArrayLE =>
  leafE({
    _tag: 'UnknownArrayE',
    actual
  })

/**
 * @category constructors
 * @since 2.2.17
 */
export const unknownRecordLE = (actual: unknown): UnknownRecordLE =>
  leafE({
    _tag: 'UnknownRecordE',
    actual
  })

/**
 * @category constructors
 * @since 2.2.17
 */
export const literalLE = <A extends Literal>(actual: unknown, literals: ReadonlyNonEmptyArray<A>): LiteralLE<A> =>
  leafE({
    _tag: 'LiteralE',
    actual,
    literals
  })

// -------------------------------------------------------------------------------------
// DecodeError
// -------------------------------------------------------------------------------------

// recursive helpers to please ts@3.5
/**
 * @category model
 * @since 2.2.17
 */
export interface NullableRE<E> extends NullableE<DecodeError<E>> {}
/**
 * @category model
 * @since 2.2.17
 */
export interface PrevRE<E> extends PrevE<DecodeError<E>> {}
/**
 * @category model
 * @since 2.2.17
 */
export interface NextRE<E> extends NextE<DecodeError<E>> {}
/**
 * @category model
 * @since 2.2.17
 */
export interface RequiredKeyRE<E> extends RequiredKeyE<string, DecodeError<E>> {}
/**
 * @category model
 * @since 2.2.17
 */
export interface OptionalKeyRE<E> extends OptionalKeyE<string, DecodeError<E>> {}
/**
 * @category model
 * @since 2.2.17
 */
export interface RequiredIndexRE<E> extends RequiredIndexE<string | number, DecodeError<E>> {}
/**
 * @category model
 * @since 2.2.17
 */
export interface OptionalIndexRE<E> extends OptionalIndexE<number, DecodeError<E>> {}
/**
 * @category model
 * @since 2.2.17
 */
export interface MemberRE<E> extends MemberE<string | number, DecodeError<E>> {}
/**
 * @category model
 * @since 2.2.17
 */
export interface LazyRE<E> extends LazyE<DecodeError<E>> {}
/**
 * @category model
 * @since 2.2.17
 */
export interface SumRE<E> extends SumE<DecodeError<E>> {}
/**
 * @category model
 * @since 2.2.17
 */
export interface CompoundRE<E> extends CompoundE<DecodeError<E>> {}

/**
 * @category model
 * @since 2.2.17
 */
export type DecodeError<E> =
  | UnexpectedKeysE
  | MissingKeysE
  | UnexpectedIndexesE
  | MissingIndexesE
  | LeafE<E>
  | RefinementRE<E>
  | ParseRE<E>
  | NullableRE<E>
  | PrevRE<E>
  | NextRE<E>
  | RequiredKeyRE<E>
  | OptionalKeyRE<E>
  | RequiredIndexRE<E>
  | OptionalIndexRE<E>
  | MemberRE<E>
  | LazyRE<E>
  | SumRE<E>
  | CompoundRE<E>

/**
 * @category model
 * @since 2.2.17
 */
export type BuiltinE =
  | StringE
  | NumberE
  | BooleanE
  | UnknownRecordE
  | UnknownArrayE
  | LiteralE<Literal>
  | MessageE
  | NaNE
  | InfinityE
  | TagE
