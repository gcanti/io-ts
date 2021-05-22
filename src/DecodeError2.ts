import { flow } from 'fp-ts/lib/function'
import { ReadonlyNonEmptyArray } from 'fp-ts/lib/ReadonlyNonEmptyArray'

export interface SingleE<E> {
  readonly error: E
}

export interface RequiredKeyE<K, E> extends SingleE<E> {
  readonly _tag: 'RequiredKeyE'
  readonly key: K
}
export const requiredKeyE = <K, E>(key: K, error: E): RequiredKeyE<K, E> => ({
  _tag: 'RequiredKeyE',
  key,
  error
})

export interface OptionalKeyE<K, E> extends SingleE<E> {
  readonly _tag: 'OptionalKeyE'
  readonly key: K
}
export const optionalKeyE = <K, E>(key: K, error: E): OptionalKeyE<K, E> => ({
  _tag: 'OptionalKeyE',
  key,
  error
})

export interface RequiredIndexE<I, E> extends SingleE<E> {
  readonly _tag: 'RequiredIndexE'
  readonly index: I
}
export const requiredIndexE = <I, E>(index: I, error: E): RequiredIndexE<I, E> => ({
  _tag: 'RequiredIndexE',
  index,
  error
})

export interface OptionalIndexE<I, E> extends SingleE<E> {
  readonly _tag: 'OptionalIndexE'
  readonly index: I
}
export const optionalIndexE = <I, E>(index: I, error: E): OptionalIndexE<I, E> => ({
  _tag: 'OptionalIndexE',
  index,
  error
})

export interface LazyE<E> extends SingleE<E> {
  readonly _tag: 'LazyE'
  readonly id: string
}
export const lazyE = <E>(id: string, error: E): LazyE<E> => ({ _tag: 'LazyE', id, error })

export interface MemberE<M, E> extends SingleE<E> {
  readonly _tag: 'MemberE'
  readonly member: M
}
export const memberE = <M, E>(member: M, error: E): MemberE<M, E> => ({ _tag: 'MemberE', member, error })

export interface LeafE<E> extends SingleE<E> {
  readonly _tag: 'LeafE'
}
export const leafE = <E>(error: E): LeafE<E> => ({ _tag: 'LeafE', error })

export interface TagE {
  readonly _tag: 'TagE'
  readonly tag: string
  readonly literals: ReadonlyArray<string>
}
export interface TagLE extends LeafE<TagE> {}
export const tagLE = (tag: string, literals: ReadonlyArray<string>): TagLE => leafE({ _tag: 'TagE', tag, literals })

export interface NoMembersE {
  readonly _tag: 'NoMembersE'
}
export interface NoMembersLE extends LeafE<NoMembersE> {}
export const noMembersLE: NoMembersLE = leafE({
  _tag: 'NoMembersE'
})

export interface NullableE<E> extends SingleE<E> {
  readonly _tag: 'NullableE'
}
export const nullableE = <E>(error: E): NullableE<E> => ({ _tag: 'NullableE', error })

export interface PrevE<E> extends SingleE<E> {
  readonly _tag: 'PrevE'
}
export const prevE = <E>(error: E): PrevE<E> => ({ _tag: 'PrevE', error })

export interface NextE<E> extends SingleE<E> {
  readonly _tag: 'NextE'
}
export const nextE = <E>(error: E): NextE<E> => ({ _tag: 'NextE', error })

export interface MissingIndexesE {
  readonly _tag: 'MissingIndexesE'
  readonly indexes: ReadonlyNonEmptyArray<number>
}
export const missingIndexesE = (indexes: ReadonlyNonEmptyArray<number>): MissingIndexesE => ({
  _tag: 'MissingIndexesE',
  indexes
})

export interface UnexpectedIndexesE {
  readonly _tag: 'UnexpectedIndexesE'
  readonly indexes: ReadonlyNonEmptyArray<number>
}
export const unexpectedIndexesE = (indexes: ReadonlyNonEmptyArray<number>): UnexpectedIndexesE => ({
  _tag: 'UnexpectedIndexesE',
  indexes
})

export interface SumE<E> extends SingleE<E> {
  readonly _tag: 'SumE'
}
export const sumE = <E>(error: E): SumE<E> => ({
  _tag: 'SumE',
  error
})

export interface MessageE {
  readonly _tag: 'MessageE'
  readonly message: string
}
export interface MessageLE extends LeafE<MessageE> {}
export const messageE = (message: string): MessageE => ({
  _tag: 'MessageE',
  message
})
export const message: (message: string) => MessageLE = flow(messageE, leafE)

export interface MissingKeysE {
  readonly _tag: 'MissingKeysE'
  readonly keys: ReadonlyNonEmptyArray<string>
}
export const missingKeysE = (keys: ReadonlyNonEmptyArray<string>): MissingKeysE => ({
  _tag: 'MissingKeysE',
  keys
})
export interface UnexpectedKeysE {
  readonly _tag: 'UnexpectedKeysE'
  readonly keys: ReadonlyNonEmptyArray<string>
}
export const unexpectedKeysE = (keys: ReadonlyNonEmptyArray<string>): UnexpectedKeysE => ({
  _tag: 'UnexpectedKeysE',
  keys
})

// Compound errors

export interface CompoundE<E> {
  readonly _tag: 'CompoundE'
  readonly name: string
  readonly errors: ReadonlyNonEmptyArray<E>
}
export const compoundE = (name: string) => <E>(errors: ReadonlyNonEmptyArray<E>): CompoundE<E> => ({
  _tag: 'CompoundE',
  name,
  errors
})

export const unionE = compoundE('union')

export const structE = compoundE('struct')

export const partialE = compoundE('partial')

export const recordE = compoundE('record')

export const tupleE = compoundE('tuple')

export const arrayE = compoundE('array')

export const compositionE = compoundE('composition')

export const intersectionE = compoundE('intersection')

// -------------------------------------------------------------------------------------
// Builtin
// -------------------------------------------------------------------------------------

export interface StringE {
  readonly _tag: 'StringE'
  readonly actual: unknown
}
export interface StringLE extends LeafE<StringE> {}
export const stringLE = (actual: unknown): StringLE => leafE({ _tag: 'StringE', actual })

export interface NumberE {
  readonly _tag: 'NumberE'
  readonly actual: unknown
}
export interface NumberLE extends LeafE<NumberE> {}
export const numberLE = (actual: unknown): NumberLE => leafE({ _tag: 'NumberE', actual })

export interface NaNE {
  readonly _tag: 'NaNE'
}
export interface NaNLE extends LeafE<NaNE> {}
export const naNLE: NaNLE = leafE({ _tag: 'NaNE' })
export interface InfinityE {
  readonly _tag: 'InfinityE'
}
export interface InfinityLE extends LeafE<InfinityE> {}
export const infinityLE: InfinityLE = leafE({ _tag: 'InfinityE' })

export interface BooleanE {
  readonly _tag: 'BooleanE'
  readonly actual: unknown
}
export interface BooleanLE extends LeafE<BooleanE> {}
export const booleanLE = (actual: unknown): BooleanLE => leafE({ _tag: 'BooleanE', actual })

export interface UnknownArrayE {
  readonly _tag: 'UnknownArrayE'
  readonly actual: unknown
}
export interface UnknownArrayLE extends LeafE<UnknownArrayE> {}
export const unknownArrayLE = (actual: unknown): UnknownArrayLE =>
  leafE({
    _tag: 'UnknownArrayE',
    actual
  })

export interface UnknownRecordE {
  readonly _tag: 'UnknownRecordE'
  readonly actual: unknown
}
export interface UnknownRecordLE extends LeafE<UnknownRecordE> {}
export const unknownRecordLE = (actual: unknown): UnknownRecordLE =>
  leafE({
    _tag: 'UnknownRecordE',
    actual
  })

export type Literal = string | number | boolean | null | undefined | symbol

export interface LiteralE<A extends Literal> {
  readonly _tag: 'LiteralE'
  readonly literals: ReadonlyNonEmptyArray<A>
  readonly actual: unknown
}
export interface LiteralLE<A extends Literal> extends LeafE<LiteralE<A>> {}
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
export interface NullableRE<E> extends NullableE<DecodeError<E>> {}
export interface PrevRE<E> extends PrevE<DecodeError<E>> {}
export interface NextRE<E> extends NextE<DecodeError<E>> {}
export interface RequiredKeyRE<E> extends RequiredKeyE<string, DecodeError<E>> {}
export interface OptionalKeyRE<E> extends OptionalKeyE<string, DecodeError<E>> {}
export interface RequiredIndexRE<E> extends RequiredIndexE<string | number, DecodeError<E>> {}
export interface OptionalIndexRE<E> extends OptionalIndexE<number, DecodeError<E>> {}
export interface MemberRE<E> extends MemberE<string | number, DecodeError<E>> {}
export interface LazyRE<E> extends LazyE<DecodeError<E>> {}
export interface SumRE<E> extends SumE<DecodeError<E>> {}
export interface CompoundRE<E> extends CompoundE<DecodeError<E>> {}

export type DecodeError<E> =
  | UnexpectedKeysE
  | MissingKeysE
  | UnexpectedIndexesE
  | MissingIndexesE
  | LeafE<E>
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
  | NoMembersE
