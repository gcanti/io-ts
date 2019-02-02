import { Either, Left, Right } from 'fp-ts/lib/Either'
import { Predicate } from 'fp-ts/lib/function'
import { Monoid } from 'fp-ts/lib/Monoid'

/**
 * @since 1.0.0
 */
export type mixed = unknown

/**
 * @since 1.0.0
 */
export interface ContextEntry {
  readonly key: string
  readonly type: Decoder<any, any>
  /** the input data */
  readonly actual?: unknown
}
/**
 * @since 1.0.0
 */
export interface Context extends ReadonlyArray<ContextEntry> {}

/**
 * @since 1.0.0
 */
export interface ValidationError {
  /** the offending (sub)value */
  readonly value: unknown
  /** where the error originated */
  readonly context: Context
  /** optional custom error message */
  readonly message?: string
}

/**
 * @since 1.0.0
 */
export interface Errors extends Array<ValidationError> {}

/**
 * @since 1.0.0
 */
export type Validation<A> = Either<Errors, A>

/**
 * @since 1.0.0
 */
export type Is<A> = (u: unknown) => u is A

/**
 * @since 1.0.0
 */
export type Validate<I, A> = (i: I, context: Context) => Validation<A>

/**
 * @since 1.0.0
 */
export type Decode<I, A> = (i: I) => Validation<A>

/**
 * @since 1.0.0
 */
export type Encode<A, O> = (a: A) => O

/**
 * @since 1.0.0
 */
export interface Any extends Type<any, any, any> {}

/**
 * @since 1.0.0
 */
export interface Mixed extends Type<any, any, unknown> {}

/**
 * @since 1.0.0
 */
export type TypeOf<C extends Any> = C['_A']

/**
 * @since 1.0.0
 */
export type InputOf<C extends Any> = C['_I']

/**
 * @since 1.0.0
 */
export type OutputOf<C extends Any> = C['_O']

/**
 * @since 1.0.0
 */
export interface Decoder<I, A> {
  readonly name: string
  readonly validate: Validate<I, A>
  readonly decode: Decode<I, A>
}

/**
 * @since 1.0.0
 */
export interface Encoder<A, O> {
  readonly encode: Encode<A, O>
}

/**
 * @since 1.0.0
 */
export class Type<A, O = A, I = unknown> implements Decoder<I, A>, Encoder<A, O> {
  readonly _A!: A
  readonly _O!: O
  readonly _I!: I
  constructor(
    /** a unique name for this codec */
    readonly name: string,
    /** a custom type guard */
    readonly is: Is<A>,
    /** succeeds if a value of type I can be decoded to a value of type A */
    readonly validate: Validate<I, A>,
    /** converts a value of type A to a value of type O */
    readonly encode: Encode<A, O>
  ) {}

  pipe<B, IB, A extends IB, OB extends A>(
    this: Type<A, O, I>,
    ab: Type<B, OB, IB>,
    name: string = `pipe(${this.name}, ${ab.name})`
  ): Type<B, O, I> {
    return new Type(
      name,
      ab.is,
      (i, c) => {
        const validation = this.validate(i, c)
        if (validation.isLeft()) {
          return validation as any
        }
        return ab.validate(validation.value, c)
      },
      this.encode === identity && ab.encode === identity ? (identity as any) : b => this.encode(ab.encode(b))
    )
  }
  asDecoder(): Decoder<I, A> {
    return this
  }
  asEncoder(): Encoder<A, O> {
    return this
  }
  /** a version of `validate` with a default context */
  decode(i: I): Validation<A> {
    return this.validate(i, [{ key: '', type: this, actual: i }])
  }
}

/**
 * @since 1.0.0
 */
export const identity = <A>(a: A): A => a

/**
 * @since 1.0.0
 */
export const getFunctionName = (f: Function): string =>
  (f as any).displayName || (f as any).name || `<function${f.length}>`

/**
 * @since 1.0.0
 */
export const getContextEntry = (key: string, decoder: Decoder<any, any>): ContextEntry => ({ key, type: decoder })

/**
 * @since 1.0.0
 * @deprecated
 */
export const getValidationError /* istanbul ignore next */ = (value: unknown, context: Context): ValidationError => ({
  value,
  context
})

/**
 * @since 1.0.0
 * @deprecated
 */
export const getDefaultContext /* istanbul ignore next */ = (decoder: Decoder<any, any>): Context => [
  { key: '', type: decoder }
]

/**
 * @since 1.0.0
 */
export const appendContext = (c: Context, key: string, decoder: Decoder<any, any>, actual?: unknown): Context => {
  const len = c.length
  const r = Array(len + 1)
  for (let i = 0; i < len; i++) {
    r[i] = c[i]
  }
  r[len] = { key, type: decoder, actual }
  return r
}

/**
 * @since 1.0.0
 */
export const failures = <T>(errors: Errors): Validation<T> => new Left(errors)

/**
 * @since 1.0.0
 */
export const failure = <T>(value: unknown, context: Context, message?: string): Validation<T> =>
  failures([{ value, context, message }])

/**
 * @since 1.0.0
 */
export const success = <T>(value: T): Validation<T> => new Right<Errors, T>(value)

const pushAll = <A>(xs: Array<A>, ys: Array<A>): void => {
  const l = ys.length
  for (let i = 0; i < l; i++) {
    xs.push(ys[i])
  }
}

const getIsCodec = <T extends Any>(tag: string) => (codec: Any): codec is T => (codec as any)._tag === tag

const isUnknownCodec = getIsCodec<UnknownType>('UnknownType')

const isAnyCodec = getIsCodec<AnyType>('AnyType')

const isLiteralCodec = getIsCodec<LiteralType<LiteralValue>>('LiteralType')

const isInterfaceCodec = getIsCodec<InterfaceType<Props>>('InterfaceType')

const isPartialCodec = getIsCodec<PartialType<Props>>('PartialType')

const isStrictCodec = getIsCodec<StrictType<Props>>('StrictType')

const isIntersectionCodec = getIsCodec<IntersectionType<Array<Any>>>('IntersectionType')

const isUnionCodec = getIsCodec<UnionType<Array<Any>>>('UnionType')

const isExactCodec = getIsCodec<ExactType<Any>>('ExactType')

const isRefinementCodec = getIsCodec<RefinementType<Any>>('RefinementType')

const isRecursiveCodec = getIsCodec<RecursiveType<Any>>('RecursiveType')

//
// basic types
//

/**
 * @since 1.0.0
 */
export class NullType extends Type<null> {
  readonly _tag: 'NullType' = 'NullType'
  constructor() {
    super('null', (u): u is null => u === null, (u, c) => (this.is(u) ? success(u) : failure(u, c)), identity)
  }
}

/**
 * @since 1.5.3
 */
export interface NullC extends NullType {}

/**
 * @alias `null`
 * @since 1.0.0
 */
export const nullType: NullC = new NullType()

/**
 * @since 1.0.0
 */
export class UndefinedType extends Type<undefined> {
  readonly _tag: 'UndefinedType' = 'UndefinedType'
  constructor() {
    super(
      'undefined',
      (u): u is undefined => u === void 0,
      (u, c) => (this.is(u) ? success(u) : failure(u, c)),
      identity
    )
  }
}

/**
 * @since 1.5.3
 */
export interface UndefinedC extends UndefinedType {}

const undefinedType: UndefinedC = new UndefinedType()

/**
 * @since 1.2.0
 */
export class VoidType extends Type<void> {
  readonly _tag: 'VoidType' = 'VoidType'
  constructor() {
    super('void', undefinedType.is, undefinedType.validate, identity)
  }
}

/**
 * @since 1.5.3
 */
export interface VoidC extends VoidType {}

/**
 * @alias `void`
 * @since 1.2.0
 */
export const voidType: VoidC = new VoidType()

/**
 * @since 1.0.0
 */
export class AnyType extends Type<any> {
  readonly _tag: 'AnyType' = 'AnyType'
  constructor() {
    super('any', (_): _ is any => true, success, identity)
  }
}

/**
 * @since 1.5.3
 */
export interface AnyC extends AnyType {}

/**
 * Use `unknown` instead
 * @since 1.0.0
 * @deprecated
 */
export const any: AnyC = new AnyType()

/**
 * @since 1.5.0
 */
export class UnknownType extends Type<unknown> {
  readonly _tag: 'UnknownType' = 'UnknownType'
  constructor() {
    super('unknown', (_): _ is unknown => true, success, identity)
  }
}

/**
 * @since 1.5.3
 */
export interface UnknownC extends UnknownType {}

/**
 * @since 1.5.0
 */
export const unknown: UnknownC = new UnknownType()

/**
 * @since 1.0.0
 */
export class NeverType extends Type<never> {
  readonly _tag: 'NeverType' = 'NeverType'
  constructor() {
    super(
      'never',
      (_): _ is never => false,
      (u, c) => failure(u, c),
      /* istanbul ignore next */
      () => {
        throw new Error('cannot encode never')
      }
    )
  }
}

/**
 * @since 1.5.3
 */
export interface NeverC extends NeverType {}

/**
 * @since 1.0.0
 */
export const never: NeverC = new NeverType()

/**
 * @since 1.0.0
 */
export class StringType extends Type<string> {
  readonly _tag: 'StringType' = 'StringType'
  constructor() {
    super(
      'string',
      (u): u is string => typeof u === 'string',
      (u, c) => (this.is(u) ? success(u) : failure(u, c)),
      identity
    )
  }
}

/**
 * @since 1.5.3
 */
export interface StringC extends StringType {}

/**
 * @since 1.0.0
 */
export const string: StringC = new StringType()

/**
 * @since 1.0.0
 */
export class NumberType extends Type<number> {
  readonly _tag: 'NumberType' = 'NumberType'
  constructor() {
    super(
      'number',
      (u): u is number => typeof u === 'number',
      (u, c) => (this.is(u) ? success(u) : failure(u, c)),
      identity
    )
  }
}

/**
 * @since 1.5.3
 */
export interface NumberC extends NumberType {}

/**
 * @since 1.0.0
 */
export const number: NumberC = new NumberType()

/**
 * @since 1.0.0
 */
export class BooleanType extends Type<boolean> {
  readonly _tag: 'BooleanType' = 'BooleanType'
  constructor() {
    super(
      'boolean',
      (u): u is boolean => typeof u === 'boolean',
      (u, c) => (this.is(u) ? success(u) : failure(u, c)),
      identity
    )
  }
}

/**
 * @since 1.5.3
 */
export interface BooleanC extends BooleanType {}

/**
 * @since 1.0.0
 */
export const boolean: BooleanC = new BooleanType()

/**
 * @since 1.0.0
 */
export class AnyArrayType extends Type<Array<unknown>> {
  readonly _tag: 'AnyArrayType' = 'AnyArrayType'
  constructor() {
    super('UnknownArray', Array.isArray, (u, c) => (this.is(u) ? success(u) : failure(u, c)), identity)
  }
}

/**
 * @since 1.5.3
 */
export interface UnknownArrayC extends AnyArrayType {}

/**
 * @since 1.7.1
 */
export const UnknownArray: UnknownArrayC = new AnyArrayType()

/**
 * @since 1.0.0
 */
export class AnyDictionaryType extends Type<{ [key: string]: unknown }> {
  readonly _tag: 'AnyDictionaryType' = 'AnyDictionaryType'
  constructor() {
    super(
      'UnknownRecord',
      (u): u is { [key: string]: unknown } => u !== null && typeof u === 'object',
      (u, c) => (this.is(u) ? success(u) : failure(u, c)),
      identity
    )
  }
}

/**
 * @since 1.7.1
 */
export const UnknownRecord: UnknownRecordC = new AnyDictionaryType()

/**
 * @since 1.5.3
 */
export interface UnknownRecordC extends AnyDictionaryType {}

/**
 * Use `UnknownRecord` instead
 * @since 1.0.0
 * @deprecated
 */
export const Dictionary: UnknownRecordC = UnknownRecord

/**
 * @since 1.0.0
 */
export class ObjectType extends Type<object> {
  readonly _tag: 'ObjectType' = 'ObjectType'
  constructor() {
    super('object', UnknownRecord.is, UnknownRecord.validate, identity)
  }
}

/**
 * @since 1.5.3
 */
export interface ObjectC extends ObjectType {}

/**
 * Use `UnknownRecord` instead
 * @since 1.0.0
 * @deprecated
 */
export const object: ObjectC = new ObjectType()

/**
 * @since 1.0.0
 */
export class FunctionType extends Type<Function> {
  readonly _tag: 'FunctionType' = 'FunctionType'
  constructor() {
    super(
      'Function',
      // tslint:disable-next-line:strict-type-predicates
      (u): u is Function => typeof u === 'function',
      (u, c) => (this.is(u) ? success(u) : failure(u, c)),
      identity
    )
  }
}

/**
 * @since 1.5.3
 */
export interface FunctionC extends FunctionType {}

/**
 * @since 1.0.0
 */
export const Function: FunctionC = new FunctionType()

/**
 * @since 1.0.0
 */
export class RefinementType<C extends Any, A = any, O = A, I = unknown> extends Type<A, O, I> {
  readonly _tag: 'RefinementType' = 'RefinementType'
  constructor(
    name: string,
    is: RefinementType<C, A, O, I>['is'],
    validate: RefinementType<C, A, O, I>['validate'],
    encode: RefinementType<C, A, O, I>['encode'],
    readonly type: C,
    readonly predicate: Predicate<A>
  ) {
    super(name, is, validate, encode)
  }
}

/**
 * @since 1.5.3
 */
export interface RefinementC<C extends Any> extends RefinementType<C, TypeOf<C>, OutputOf<C>, InputOf<C>> {}

/**
 * @since 1.0.0
 */
export const refinement = <C extends Any>(
  codec: C,
  predicate: Predicate<TypeOf<C>>,
  name: string = `(${codec.name} | ${getFunctionName(predicate)})`
): RefinementC<C> =>
  new RefinementType(
    name,
    (u): u is TypeOf<C> => codec.is(u) && predicate(u),
    (i, c) => {
      const validation = codec.validate(i, c)
      if (validation.isLeft()) {
        return validation
      }
      const a = validation.value
      return predicate(a) ? success(a) : failure(a, c)
    },
    codec.encode,
    codec,
    predicate
  )

/**
 * @since 1.0.0
 */
export const Integer = refinement(number, Number.isInteger, 'Integer')

type LiteralValue = string | number | boolean

/**
 * @since 1.0.0
 */
export class LiteralType<V extends LiteralValue> extends Type<V> {
  readonly _tag: 'LiteralType' = 'LiteralType'
  constructor(
    name: string,
    is: LiteralType<V>['is'],
    validate: LiteralType<V>['validate'],
    encode: LiteralType<V>['encode'],
    readonly value: V
  ) {
    super(name, is, validate, encode)
  }
}

/**
 * @since 1.5.3
 */
export interface LiteralC<V extends LiteralValue> extends LiteralType<V> {}

/**
 * @since 1.0.0
 */
export const literal = <V extends LiteralValue>(value: V, name: string = JSON.stringify(value)): LiteralC<V> => {
  const is = (u: unknown): u is V => u === value
  return new LiteralType(name, is, (u, c) => (is(u) ? success(value) : failure(u, c)), identity, value)
}

/**
 * @since 1.0.0
 */
export class KeyofType<D extends { [key: string]: unknown }> extends Type<keyof D> {
  readonly _tag: 'KeyofType' = 'KeyofType'
  constructor(
    name: string,
    is: KeyofType<D>['is'],
    validate: KeyofType<D>['validate'],
    encode: KeyofType<D>['encode'],
    readonly keys: D
  ) {
    super(name, is, validate, encode)
  }
}

const hasOwnProperty = Object.prototype.hasOwnProperty

/**
 * @since 1.5.3
 */
export interface KeyofC<D extends { [key: string]: unknown }> extends KeyofType<D> {}

/**
 * @since 1.0.0
 */
export const keyof = <D extends { [key: string]: unknown }>(
  keys: D,
  name: string = Object.keys(keys)
    .map(k => JSON.stringify(k))
    .join(' | ')
): KeyofC<D> => {
  const is = (u: unknown): u is keyof D => string.is(u) && hasOwnProperty.call(keys, u)
  return new KeyofType(name, is, (u, c) => (is(u) ? success(u) : failure(u, c)), identity, keys)
}

/**
 * @since 1.0.0
 */
export class RecursiveType<C extends Any, A = any, O = A, I = unknown> extends Type<A, O, I> {
  readonly _tag: 'RecursiveType' = 'RecursiveType'
  /** @internal */
  getIndexRecord!: () => IndexRecord
  constructor(
    name: string,
    is: RecursiveType<C, A, O, I>['is'],
    validate: RecursiveType<C, A, O, I>['validate'],
    encode: RecursiveType<C, A, O, I>['encode'],
    private runDefinition: () => C
  ) {
    super(name, is, validate, encode)
  }
  get type(): C {
    return this.runDefinition()
  }
}

/**
 * @since 1.0.0
 */
export const recursion = <A, O = A, I = unknown, C extends Type<A, O, I> = Type<A, O, I>>(
  name: string,
  definition: (self: C) => C
): RecursiveType<C, A, O, I> => {
  let cache: C
  const runDefinition = (): C => {
    if (!cache) {
      cache = definition(Self)
      ;(cache as any).name = name
    }
    return cache
  }
  const Self: any = new RecursiveType<C, A, O, I>(
    name,
    (u): u is A => runDefinition().is(u),
    (u, c) => runDefinition().validate(u, c),
    a => runDefinition().encode(a),
    runDefinition
  )
  let indexRecordCache: IndexRecord
  Self.getIndexRecord = () => {
    if (!indexRecordCache) {
      isRecursiveCodecIndexable = false
      indexRecordCache = getCodecIndexRecord(definition(Self), Self, Self)
      isRecursiveCodecIndexable = true
    }
    return indexRecordCache
  }
  return Self
}

/**
 * @since 1.0.0
 */
export class ArrayType<C extends Any, A = any, O = A, I = unknown> extends Type<A, O, I> {
  readonly _tag: 'ArrayType' = 'ArrayType'
  constructor(
    name: string,
    is: ArrayType<C, A, O, I>['is'],
    validate: ArrayType<C, A, O, I>['validate'],
    encode: ArrayType<C, A, O, I>['encode'],
    readonly type: C
  ) {
    super(name, is, validate, encode)
  }
}

/**
 * @since 1.5.3
 */
export interface ArrayC<C extends Mixed> extends ArrayType<C, Array<TypeOf<C>>, Array<OutputOf<C>>, unknown> {}

/**
 * @since 1.0.0
 */
export const array = <C extends Mixed>(codec: C, name: string = `Array<${codec.name}>`): ArrayC<C> =>
  new ArrayType(
    name,
    (u): u is Array<TypeOf<C>> => UnknownArray.is(u) && u.every(codec.is),
    (u, c) => {
      const unknownArrayValidation = UnknownArray.validate(u, c)
      if (unknownArrayValidation.isLeft()) {
        return unknownArrayValidation
      }
      const us = unknownArrayValidation.value
      const len = us.length
      let as: Array<TypeOf<C>> = us
      const errors: Errors = []
      for (let i = 0; i < len; i++) {
        const ui = us[i]
        const validation = codec.validate(ui, appendContext(c, String(i), codec, ui))
        if (validation.isLeft()) {
          pushAll(errors, validation.value)
        } else {
          const ai = validation.value
          if (ai !== ui) {
            if (as === us) {
              as = us.slice()
            }
            as[i] = ai
          }
        }
      }
      return errors.length > 0 ? failures(errors) : success(as)
    },
    codec.encode === identity ? identity : a => a.map(codec.encode),
    codec
  )

/**
 * @since 1.0.0
 */
export class InterfaceType<P, A = any, O = A, I = unknown> extends Type<A, O, I> {
  readonly _tag: 'InterfaceType' = 'InterfaceType'
  constructor(
    name: string,
    is: InterfaceType<P, A, O, I>['is'],
    validate: InterfaceType<P, A, O, I>['validate'],
    encode: InterfaceType<P, A, O, I>['encode'],
    readonly props: P
  ) {
    super(name, is, validate, encode)
  }
}

/**
 * @since 1.0.0
 */
export interface AnyProps {
  [key: string]: Any
}

const getNameFromProps = (props: Props): string =>
  Object.keys(props)
    .map(k => `${k}: ${props[k].name}`)
    .join(', ')

const useIdentity = (codecs: Array<Any>, len: number): boolean => {
  for (let i = 0; i < len; i++) {
    if (codecs[i].encode !== identity) {
      return false
    }
  }
  return true
}

/**
 * @since 1.0.0
 */
export type TypeOfProps<P extends AnyProps> = { [K in keyof P]: TypeOf<P[K]> }

/**
 * @since 1.0.0
 */
export type OutputOfProps<P extends AnyProps> = { [K in keyof P]: OutputOf<P[K]> }

/**
 * @since 1.0.0
 */
export interface Props {
  [key: string]: Mixed
}

/**
 * @since 1.5.3
 */
export interface TypeC<P extends Props>
  extends InterfaceType<P, { [K in keyof P]: TypeOf<P[K]> }, { [K in keyof P]: OutputOf<P[K]> }, unknown> {}

const getInterfaceTypeName = (props: Props): string => {
  return `{ ${getNameFromProps(props)} }`
}

/**
 * @alias `interface`
 * @since 1.0.0
 */
export const type = <P extends Props>(props: P, name: string = getInterfaceTypeName(props)): TypeC<P> => {
  const keys = Object.keys(props)
  const types = keys.map(key => props[key])
  const len = keys.length
  return new InterfaceType(
    name,
    (u): u is { [K in keyof P]: TypeOf<P[K]> } => {
      if (!UnknownRecord.is(u)) {
        return false
      }
      for (let i = 0; i < len; i++) {
        const k = keys[i]
        if (!hasOwnProperty.call(u, k) || !types[i].is(u[k])) {
          return false
        }
      }
      return true
    },
    (u, c) => {
      const unknownRecordValidation = UnknownRecord.validate(u, c)
      if (unknownRecordValidation.isLeft()) {
        return unknownRecordValidation
      }
      const o = unknownRecordValidation.value
      let a = o
      const errors: Errors = []
      for (let i = 0; i < len; i++) {
        const k = keys[i]
        if (!hasOwnProperty.call(a, k)) {
          if (a === o) {
            a = { ...o }
          }
          a[k] = a[k]
        }
        const ak = a[k]
        const type = types[i]
        const validation = type.validate(ak, appendContext(c, k, type, ak))
        if (validation.isLeft()) {
          pushAll(errors, validation.value)
        } else {
          const vak = validation.value
          if (vak !== ak) {
            /* istanbul ignore next */
            if (a === o) {
              a = { ...o }
            }
            a[k] = vak
          }
        }
      }
      return errors.length > 0 ? failures(errors) : success(a as any)
    },
    useIdentity(types, len)
      ? identity
      : a => {
          const s: { [x: string]: any } = { ...a }
          for (let i = 0; i < len; i++) {
            const k = keys[i]
            const encode = types[i].encode
            if (encode !== identity) {
              s[k] = encode(a[k])
            }
          }
          return s as any
        },
    props
  )
}

/**
 * @since 1.0.0
 */
export class PartialType<P, A = any, O = A, I = unknown> extends Type<A, O, I> {
  readonly _tag: 'PartialType' = 'PartialType'
  constructor(
    name: string,
    is: PartialType<P, A, O, I>['is'],
    validate: PartialType<P, A, O, I>['validate'],
    encode: PartialType<P, A, O, I>['encode'],
    readonly props: P
  ) {
    super(name, is, validate, encode)
  }
}

/**
 * @since 1.0.0
 */
export type TypeOfPartialProps<P extends AnyProps> = { [K in keyof P]?: TypeOf<P[K]> }

/**
 * @since 1.0.0
 */
export type OutputOfPartialProps<P extends AnyProps> = { [K in keyof P]?: OutputOf<P[K]> }

/**
 * @since 1.5.3
 */
export interface PartialC<P extends Props>
  extends PartialType<P, { [K in keyof P]?: TypeOf<P[K]> }, { [K in keyof P]?: OutputOf<P[K]> }, unknown> {}

const getPartialTypeName = (inner: string): string => {
  return `Partial<${inner}>`
}

/**
 * @since 1.0.0
 */
export const partial = <P extends Props>(
  props: P,
  name: string = getPartialTypeName(getInterfaceTypeName(props))
): PartialC<P> => {
  const keys = Object.keys(props)
  const types = keys.map(key => props[key])
  const len = keys.length
  return new PartialType(
    name,
    (u): u is { [K in keyof P]?: TypeOf<P[K]> } => {
      if (!UnknownRecord.is(u)) {
        return false
      }
      for (let i = 0; i < len; i++) {
        const k = keys[i]
        const uk = u[k]
        if (uk !== undefined && !props[k].is(uk)) {
          return false
        }
      }
      return true
    },
    (u, c) => {
      const unknownRecordValidation = UnknownRecord.validate(u, c)
      if (unknownRecordValidation.isLeft()) {
        return unknownRecordValidation
      }
      const o = unknownRecordValidation.value
      let a = o
      const errors: Errors = []
      for (let i = 0; i < len; i++) {
        const k = keys[i]
        const ak = a[k]
        const type = props[k]
        const validation = type.validate(ak, appendContext(c, k, type, ak))
        if (validation.isLeft() && ak !== undefined) {
          pushAll(errors, validation.value)
        } else if (validation.isRight()) {
          const vak = validation.value
          if (vak !== ak) {
            /* istanbul ignore next */
            if (a === o) {
              a = { ...o }
            }
            a[k] = vak
          }
        }
      }
      return errors.length > 0 ? failures(errors) : success(a as any)
    },
    useIdentity(types, len)
      ? identity
      : a => {
          const s: { [key: string]: any } = { ...a }
          for (let i = 0; i < len; i++) {
            const k = keys[i]
            const ak = a[k]
            if (ak !== undefined) {
              s[k] = types[i].encode(ak)
            }
          }
          return s as any
        },
    props
  )
}

/**
 * @since 1.0.0
 */
export class DictionaryType<D extends Any, C extends Any, A = any, O = A, I = unknown> extends Type<A, O, I> {
  readonly _tag: 'DictionaryType' = 'DictionaryType'
  constructor(
    name: string,
    is: DictionaryType<D, C, A, O, I>['is'],
    validate: DictionaryType<D, C, A, O, I>['validate'],
    encode: DictionaryType<D, C, A, O, I>['encode'],
    readonly domain: D,
    readonly codomain: C
  ) {
    super(name, is, validate, encode)
  }
}

/**
 * @since 1.0.0
 */
export type TypeOfDictionary<D extends Any, C extends Any> = { [K in TypeOf<D>]: TypeOf<C> }

/**
 * @since 1.0.0
 */
export type OutputOfDictionary<D extends Any, C extends Any> = { [K in OutputOf<D>]: OutputOf<C> }

/**
 * @since 1.5.3
 */
export interface RecordC<D extends Mixed, C extends Mixed>
  extends DictionaryType<D, C, { [K in TypeOf<D>]: TypeOf<C> }, { [K in OutputOf<D>]: OutputOf<C> }, unknown> {}

const isObject = (r: Record<string, unknown>) => Object.prototype.toString.call(r) === '[object Object]'

/**
 * @since 1.7.1
 */
export const record = <D extends Mixed, C extends Mixed>(
  domain: D,
  codomain: C,
  name: string = `{ [K in ${domain.name}]: ${codomain.name} }`
): RecordC<D, C> => {
  return new DictionaryType(
    name,
    (u): u is { [K in TypeOf<D>]: TypeOf<C> } => {
      if (!UnknownRecord.is(u)) {
        return false
      }
      if (!isUnknownCodec(codomain) && !isAnyCodec(codomain) && !isObject(u)) {
        return false
      }
      return Object.keys(u).every(k => domain.is(k) && codomain.is(u[k]))
    },
    (u, c) => {
      const unknownRecordValidation = UnknownRecord.validate(u, c)
      if (unknownRecordValidation.isLeft()) {
        return unknownRecordValidation
      }
      const o = unknownRecordValidation.value
      if (!isUnknownCodec(codomain) && !isAnyCodec(codomain) && !isObject(o)) {
        return failure(u, c)
      }
      const a: { [key: string]: any } = {}
      const errors: Errors = []
      const keys = Object.keys(o)
      const len = keys.length
      let changed: boolean = false
      for (let i = 0; i < len; i++) {
        let k = keys[i]
        const ok = o[k]
        const domainValidation = domain.validate(k, appendContext(c, k, domain, k))
        if (domainValidation.isLeft()) {
          pushAll(errors, domainValidation.value)
        } else {
          const vk = domainValidation.value
          changed = changed || vk !== k
          k = vk
          const codomainValidation = codomain.validate(ok, appendContext(c, k, codomain, ok))
          if (codomainValidation.isLeft()) {
            pushAll(errors, codomainValidation.value)
          } else {
            const vok = codomainValidation.value
            changed = changed || vok !== ok
            a[k] = vok
          }
        }
      }
      return errors.length > 0 ? failures(errors) : success((changed ? a : o) as any)
    },
    domain.encode === identity && codomain.encode === identity
      ? identity
      : a => {
          const s: { [key: string]: any } = {}
          const keys = Object.keys(a)
          const len = keys.length
          for (let i = 0; i < len; i++) {
            const k = keys[i]
            s[String(domain.encode(k))] = codomain.encode(a[k])
          }
          return s as any
        },
    domain,
    codomain
  )
}

/**
 * Use `record` instead
 * @since 1.0.0
 * @deprecated
 */
export const dictionary: typeof record = record

/**
 * @since 1.0.0
 */
export class UnionType<CS extends Array<Any>, A = any, O = A, I = unknown> extends Type<A, O, I> {
  readonly _tag: 'UnionType' = 'UnionType'
  constructor(
    name: string,
    is: UnionType<CS, A, O, I>['is'],
    validate: UnionType<CS, A, O, I>['validate'],
    encode: UnionType<CS, A, O, I>['encode'],
    readonly types: CS
  ) {
    super(name, is, validate, encode)
  }
}

/**
 * @since 1.5.3
 */
export interface UnionC<CS extends [Mixed, Mixed, ...Array<Mixed>]>
  extends UnionType<CS, TypeOf<CS[number]>, OutputOf<CS[number]>, unknown> {}

const getUnionName = <CS extends [Mixed, Mixed, ...Array<Mixed>]>(codecs: CS): string => {
  return '(' + codecs.map(type => type.name).join(' | ') + ')'
}

/**
 * @since 1.0.0
 */
export const union = <CS extends [Mixed, Mixed, ...Array<Mixed>]>(
  codecs: CS,
  name: string = getUnionName(codecs)
): UnionC<CS> => {
  const len = codecs.length
  return new UnionType(
    name,
    (u): u is TypeOf<CS[number]> => codecs.some(type => type.is(u)),
    (u, c) => {
      const errors: Errors = []
      for (let i = 0; i < len; i++) {
        const type = codecs[i]
        const validation = type.validate(u, appendContext(c, String(i), type, u))
        if (validation.isRight()) {
          return validation
        }
        pushAll(errors, validation.value)
      }
      return errors.length > 0 ? failures(errors) : failure(u, c)
    },
    useIdentity(codecs, len)
      ? identity
      : a => {
          let i = 0
          for (; i < len - 1; i++) {
            const type = codecs[i]
            if (type.is(a)) {
              return type.encode(a)
            }
          }
          return codecs[i].encode(a)
        },
    codecs
  )
}

/**
 * @since 1.0.0
 */
export class IntersectionType<CS extends Array<Any>, A = any, O = A, I = unknown> extends Type<A, O, I> {
  readonly _tag: 'IntersectionType' = 'IntersectionType'
  constructor(
    name: string,
    is: IntersectionType<CS, A, O, I>['is'],
    validate: IntersectionType<CS, A, O, I>['validate'],
    encode: IntersectionType<CS, A, O, I>['encode'],
    readonly types: CS
  ) {
    super(name, is, validate, encode)
  }
}

/**
 * used in `intersection` as a workaround for #234
 * @since 1.4.2
 * @deprecated
 */
export type Compact<A> = { [K in keyof A]: A[K] }

/**
 * @since 1.5.3
 */
export interface IntersectionC<CS extends [Mixed, Mixed, ...Array<Mixed>]>
  extends IntersectionType<
    CS,
    CS extends [Mixed, Mixed]
      ? TypeOf<CS['0']> & TypeOf<CS['1']>
      : CS extends [Mixed, Mixed, Mixed]
      ? TypeOf<CS['0']> & TypeOf<CS['1']> & TypeOf<CS['2']>
      : CS extends [Mixed, Mixed, Mixed, Mixed]
      ? TypeOf<CS['0']> & TypeOf<CS['1']> & TypeOf<CS['2']> & TypeOf<CS['3']>
      : CS extends [Mixed, Mixed, Mixed, Mixed, Mixed]
      ? TypeOf<CS['0']> & TypeOf<CS['1']> & TypeOf<CS['2']> & TypeOf<CS['3']> & TypeOf<CS['4']>
      : unknown,
    CS extends [Mixed, Mixed]
      ? OutputOf<CS['0']> & OutputOf<CS['1']>
      : CS extends [Mixed, Mixed, Mixed]
      ? OutputOf<CS['0']> & OutputOf<CS['1']> & OutputOf<CS['2']>
      : CS extends [Mixed, Mixed, Mixed, Mixed]
      ? OutputOf<CS['0']> & OutputOf<CS['1']> & OutputOf<CS['2']> & OutputOf<CS['3']>
      : CS extends [Mixed, Mixed, Mixed, Mixed, Mixed]
      ? OutputOf<CS['0']> & OutputOf<CS['1']> & OutputOf<CS['2']> & OutputOf<CS['3']> & OutputOf<CS['4']>
      : unknown,
    unknown
  > {}

const mergeAll = (us: Array<unknown>): any => {
  let r: unknown = us[0]
  for (let i = 1; i < us.length; i++) {
    const u = us[i]
    if (u !== r) {
      r = Object.assign(r, u)
    }
  }
  return r
}

/**
 * @since 1.0.0
 */
export function intersection<A extends Mixed, B extends Mixed, C extends Mixed, D extends Mixed, E extends Mixed>(
  codecs: [A, B, C, D, E],
  name?: string
): IntersectionC<[A, B, C, D, E]>
export function intersection<A extends Mixed, B extends Mixed, C extends Mixed, D extends Mixed>(
  codecs: [A, B, C, D],
  name?: string
): IntersectionC<[A, B, C, D]>
export function intersection<A extends Mixed, B extends Mixed, C extends Mixed>(
  codecs: [A, B, C],
  name?: string
): IntersectionC<[A, B, C]>
export function intersection<A extends Mixed, B extends Mixed>(codecs: [A, B], name?: string): IntersectionC<[A, B]>
export function intersection<CS extends [Mixed, Mixed, ...Array<Mixed>]>(
  codecs: CS,
  name: string = `(${codecs.map(type => type.name).join(' & ')})`
): IntersectionC<CS> {
  const len = codecs.length
  return new IntersectionType(
    name,
    (u: unknown): u is any => codecs.every(type => type.is(u)),
    codecs.length === 0
      ? success
      : (u, c) => {
          const us: Array<unknown> = []
          const errors: Errors = []
          for (let i = 0; i < len; i++) {
            const codec = codecs[i]
            const validation = codec.validate(u, appendContext(c, String(i), codec, u))
            if (validation.isLeft()) {
              pushAll(errors, validation.value)
            } else {
              us.push(validation.value)
            }
          }
          return errors.length > 0 ? failures(errors) : success(mergeAll(us))
        },
    codecs.length === 0 ? identity : a => mergeAll(codecs.map(codec => codec.encode(a))),
    codecs
  )
}

/**
 * @since 1.0.0
 */
export class TupleType<CS extends Array<Any>, A = any, O = A, I = unknown> extends Type<A, O, I> {
  readonly _tag: 'TupleType' = 'TupleType'
  constructor(
    name: string,
    is: TupleType<CS, A, O, I>['is'],
    validate: TupleType<CS, A, O, I>['validate'],
    encode: TupleType<CS, A, O, I>['encode'],
    readonly types: CS
  ) {
    super(name, is, validate, encode)
  }
}

/**
 * @since 1.5.3
 */
export interface TupleC<CS extends [Mixed, ...Array<Mixed>]>
  extends TupleType<
    CS,
    CS extends [Mixed]
      ? [TypeOf<CS['0']>]
      : CS extends [Mixed, Mixed]
      ? [TypeOf<CS['0']>, TypeOf<CS['1']>]
      : CS extends [Mixed, Mixed, Mixed]
      ? [TypeOf<CS['0']>, TypeOf<CS['1']>, TypeOf<CS['2']>]
      : CS extends [Mixed, Mixed, Mixed, Mixed]
      ? [TypeOf<CS['0']>, TypeOf<CS['1']>, TypeOf<CS['2']>, TypeOf<CS['3']>]
      : CS extends [Mixed, Mixed, Mixed, Mixed, Mixed]
      ? [TypeOf<CS['0']>, TypeOf<CS['1']>, TypeOf<CS['2']>, TypeOf<CS['3']>, TypeOf<CS['4']>]
      : unknown,
    CS extends [Mixed]
      ? [OutputOf<CS['0']>]
      : CS extends [Mixed, Mixed]
      ? [OutputOf<CS['0']>, OutputOf<CS['1']>]
      : CS extends [Mixed, Mixed, Mixed]
      ? [OutputOf<CS['0']>, OutputOf<CS['1']>, OutputOf<CS['2']>]
      : CS extends [Mixed, Mixed, Mixed, Mixed]
      ? [OutputOf<CS['0']>, OutputOf<CS['1']>, OutputOf<CS['2']>, OutputOf<CS['3']>]
      : CS extends [Mixed, Mixed, Mixed, Mixed, Mixed]
      ? [OutputOf<CS['0']>, OutputOf<CS['1']>, OutputOf<CS['2']>, OutputOf<CS['3']>, OutputOf<CS['4']>]
      : unknown,
    unknown
  > {}

/**
 * @since 1.0.0
 */
export function tuple<A extends Mixed, B extends Mixed, C extends Mixed, D extends Mixed, E extends Mixed>(
  codecs: [A, B, C, D, E],
  name?: string
): TupleC<[A, B, C, D, E]>
export function tuple<A extends Mixed, B extends Mixed, C extends Mixed, D extends Mixed>(
  codecs: [A, B, C, D],
  name?: string
): TupleC<[A, B, C, D]>
export function tuple<A extends Mixed, B extends Mixed, C extends Mixed>(
  codecs: [A, B, C],
  name?: string
): TupleC<[A, B, C]>
export function tuple<A extends Mixed, B extends Mixed>(codecs: [A, B], name?: string): TupleC<[A, B]>
export function tuple<A extends Mixed>(codecs: [A], name?: string): TupleC<[A]>
export function tuple<CS extends [Mixed, ...Array<Mixed>]>(
  codecs: CS,
  name: string = `[${codecs.map(type => type.name).join(', ')}]`
): TupleC<CS> {
  const len = codecs.length
  return new TupleType(
    name,
    (u): u is any => UnknownArray.is(u) && u.length === len && codecs.every((type, i) => type.is(u[i])),
    (u, c) => {
      const unknownArrayValidation = UnknownArray.validate(u, c)
      if (unknownArrayValidation.isLeft()) {
        return unknownArrayValidation
      }
      const us = unknownArrayValidation.value
      let as: Array<any> = us.length > len ? us.slice(0, len) : us // strip additional components
      const errors: Errors = []
      for (let i = 0; i < len; i++) {
        const a = us[i]
        const type = codecs[i]
        const validation = type.validate(a, appendContext(c, String(i), type, a))
        if (validation.isLeft()) {
          pushAll(errors, validation.value)
        } else {
          const va = validation.value
          if (va !== a) {
            /* istanbul ignore next */
            if (as === us) {
              as = us.slice()
            }
            as[i] = va
          }
        }
      }
      return errors.length > 0 ? failures(errors) : success(as)
    },
    useIdentity(codecs, len) ? identity : a => codecs.map((type, i) => type.encode(a[i])),
    codecs
  )
}

/**
 * @since 1.0.0
 */
export class ReadonlyType<C extends Any, A = any, O = A, I = unknown> extends Type<A, O, I> {
  readonly _tag: 'ReadonlyType' = 'ReadonlyType'
  constructor(
    name: string,
    is: ReadonlyType<C, A, O, I>['is'],
    validate: ReadonlyType<C, A, O, I>['validate'],
    encode: ReadonlyType<C, A, O, I>['encode'],
    readonly type: C
  ) {
    super(name, is, validate, encode)
  }
}

/**
 * @since 1.5.3
 */
export interface ReadonlyC<C extends Mixed>
  extends ReadonlyType<
    C,
    { readonly [K in keyof TypeOf<C>]: TypeOf<C>[K] },
    { readonly [K in keyof OutputOf<C>]: OutputOf<C>[K] },
    unknown
  > {}

/**
 * @since 1.0.0
 */
export const readonly = <C extends Mixed>(codec: C, name: string = `Readonly<${codec.name}>`): ReadonlyC<C> =>
  new ReadonlyType(
    name,
    codec.is,
    (u, c) =>
      codec.validate(u, c).map(x => {
        if (process.env.NODE_ENV !== 'production') {
          return Object.freeze(x)
        }
        return x
      }),
    codec.encode === identity ? identity : codec.encode,
    codec
  )

/**
 * @since 1.0.0
 */
export class ReadonlyArrayType<C extends Any, A = any, O = A, I = unknown> extends Type<A, O, I> {
  readonly _tag: 'ReadonlyArrayType' = 'ReadonlyArrayType'
  constructor(
    name: string,
    is: ReadonlyArrayType<C, A, O, I>['is'],
    validate: ReadonlyArrayType<C, A, O, I>['validate'],
    encode: ReadonlyArrayType<C, A, O, I>['encode'],
    readonly type: C
  ) {
    super(name, is, validate, encode)
  }
}

/**
 * @since 1.5.3
 */
export interface ReadonlyArrayC<C extends Mixed>
  extends ReadonlyArrayType<C, ReadonlyArray<TypeOf<C>>, ReadonlyArray<OutputOf<C>>, unknown> {}

/**
 * @since 1.0.0
 */
export const readonlyArray = <C extends Mixed>(
  codec: C,
  name: string = `ReadonlyArray<${codec.name}>`
): ReadonlyArrayC<C> => {
  const arrayType = array(codec)
  return new ReadonlyArrayType(
    name,
    arrayType.is,
    (u, c) =>
      arrayType.validate(u, c).map(x => {
        if (process.env.NODE_ENV !== 'production') {
          return Object.freeze(x)
        }
        return x
      }),
    arrayType.encode as any,
    codec
  )
}

/**
 * @since 1.0.0
 * @deprecated
 */
export class StrictType<P, A = any, O = A, I = unknown> extends Type<A, O, I> {
  readonly _tag: 'StrictType' = 'StrictType'
  constructor(
    name: string,
    is: StrictType<P, A, O, I>['is'],
    validate: StrictType<P, A, O, I>['validate'],
    encode: StrictType<P, A, O, I>['encode'],
    readonly props: P
  ) {
    super(name, is, validate, encode)
  }
}

/**
 * @since 1.5.3
 * @deprecated
 */
export interface StrictC<P extends Props>
  extends StrictType<P, { [K in keyof P]: TypeOf<P[K]> }, { [K in keyof P]: OutputOf<P[K]> }, unknown> {}

/**
 * Strips additional properties
 * @since 1.0.0
 */
export const strict = <P extends Props>(props: P, name?: string): ExactC<TypeC<P>> => {
  return exact(type(props), name)
}

/**
 * @since 1.3.0
 */
export type TaggedProps<Tag extends string> = { [K in Tag]: LiteralType<any> }
/**
 * @since 1.3.0
 */
export interface TaggedRefinement<Tag extends string, A, O = A> extends RefinementType<Tagged<Tag>, A, O> {}
/**
 * @since 1.3.0
 */
export interface TaggedUnion<Tag extends string, A, O = A> extends UnionType<Array<Tagged<Tag>>, A, O> {}
/**
 * @since 1.3.0
 */
export type TaggedIntersectionArgument<Tag extends string> =
  | [Tagged<Tag>]
  | [Tagged<Tag>, Mixed]
  | [Mixed, Tagged<Tag>]
  | [Tagged<Tag>, Mixed, Mixed]
  | [Mixed, Tagged<Tag>, Mixed]
  | [Mixed, Mixed, Tagged<Tag>]
  | [Tagged<Tag>, Mixed, Mixed, Mixed]
  | [Mixed, Tagged<Tag>, Mixed, Mixed]
  | [Mixed, Mixed, Tagged<Tag>, Mixed]
  | [Mixed, Mixed, Mixed, Tagged<Tag>]
  | [Tagged<Tag>, Mixed, Mixed, Mixed, Mixed]
  | [Mixed, Tagged<Tag>, Mixed, Mixed, Mixed]
  | [Mixed, Mixed, Tagged<Tag>, Mixed, Mixed]
  | [Mixed, Mixed, Mixed, Tagged<Tag>, Mixed]
  | [Mixed, Mixed, Mixed, Mixed, Tagged<Tag>]
/**
 * @since 1.3.0
 */
export interface TaggedIntersection<Tag extends string, A, O = A>
  extends IntersectionType<TaggedIntersectionArgument<Tag>, A, O> {}
/**
 * @since 1.3.0
 */
export interface TaggedExact<Tag extends string, A, O = A> extends ExactType<Tagged<Tag>, A, O> {}
/**
 * @since 1.3.0
 */
export type Tagged<Tag extends string, A = any, O = A> =
  | InterfaceType<TaggedProps<Tag>, A, O>
  | StrictType<TaggedProps<Tag>, A, O>
  | TaggedRefinement<Tag, A, O>
  | TaggedUnion<Tag, A, O>
  | TaggedIntersection<Tag, A, O>
  | TaggedExact<Tag, A, O>
  | RecursiveType<any, A, O>

type IndexItem = [unknown, Any, Any]

interface Index extends Array<IndexItem> {}

interface IndexRecord extends Record<string, Index> {}

/** @internal */
export const emptyIndexRecord: IndexRecord = {}

const monoidIndexRecord: Monoid<IndexRecord> = {
  concat: (a, b) => {
    if (a === monoidIndexRecord.empty) {
      return b
    }
    if (b === monoidIndexRecord.empty) {
      return a
    }
    const r = cloneIndexRecord(a)
    for (const k in b) {
      if (r.hasOwnProperty(k)) {
        r[k].push(...b[k])
      } else {
        r[k] = b[k]
      }
    }
    return r
  },
  empty: emptyIndexRecord
}

const isIndexRecordEmpty = (a: IndexRecord): boolean => {
  for (const _ in a) {
    return false
  }
  return true
}

const foldMapIndexRecord = <A>(as: Array<A>, f: (a: A) => IndexRecord): IndexRecord => {
  return as.reduce((acc, a) => monoidIndexRecord.concat(acc, f(a)), monoidIndexRecord.empty)
}

const cloneIndexRecord = (a: IndexRecord): IndexRecord => {
  const r: IndexRecord = {}
  for (const k in a) {
    r[k] = a[k].slice()
  }
  return r
}

const updateindexRecordOrigin = (origin: Any, indexRecord: IndexRecord): IndexRecord => {
  const r: IndexRecord = {}
  for (const k in indexRecord) {
    r[k] = indexRecord[k].map<IndexItem>(([v, _, id]) => [v, origin, id])
  }
  return r
}

const getCodecIndexRecord = (codec: Any, origin: Any, id: Any): IndexRecord => {
  if (isInterfaceCodec(codec) || isStrictCodec(codec)) {
    const interfaceIndex: IndexRecord = {}
    for (let k in codec.props) {
      const prop = codec.props[k]
      if (isLiteralCodec(prop)) {
        const value = prop.value
        interfaceIndex[k] = [[value, origin, id]]
      }
    }
    return interfaceIndex
  }
  if (isIntersectionCodec(codec)) {
    return foldMapIndexRecord(codec.types, type => getCodecIndexRecord(type, origin, codec))
  }
  if (isUnionCodec(codec)) {
    return foldMapIndexRecord(codec.types, type => getCodecIndexRecord(type, origin, type))
  }
  if (isExactCodec(codec) || isRefinementCodec(codec)) {
    return getCodecIndexRecord(codec.type, origin, codec)
  }
  if (isRecursiveCodec(codec)) {
    const indexRecord = codec.getIndexRecord()
    if (codec !== origin) {
      return updateindexRecordOrigin(origin, indexRecord)
    }
    return indexRecord
  }
  return monoidIndexRecord.empty
}

let isRecursiveCodecIndexable = true

const isIndexableCodec = (codec: Any): boolean => {
  return (
    ((isInterfaceCodec(codec) || isStrictCodec(codec)) &&
      Object.keys(codec.props).some(key => isLiteralCodec(codec.props[key]))) ||
    ((isExactCodec(codec) || isRefinementCodec(codec)) && isIndexableCodec(codec.type)) ||
    (isIntersectionCodec(codec) && codec.types.some(isIndexableCodec)) ||
    (isUnionCodec(codec) && codec.types.every(isIndexableCodec)) ||
    (isRecursiveCodecIndexable && isRecursiveCodec(codec))
  )
}

/**
 * @internal
 */
export const getIndexRecord = (codecs: Array<Mixed>): IndexRecord => {
  const len = codecs.length
  if (len === 0 || !codecs.every(isIndexableCodec)) {
    return monoidIndexRecord.empty
  }
  const firstCodec = codecs[0]
  const ir: IndexRecord = cloneIndexRecord(getCodecIndexRecord(firstCodec, firstCodec, firstCodec))
  for (let i = 1; i < len; i++) {
    const codec = codecs[i]
    const cir = getCodecIndexRecord(codec, codec, codec)
    for (const k in ir) {
      if (cir.hasOwnProperty(k)) {
        const is = ir[k]
        const cis = cir[k]
        for (let j = 0; j < cis.length; j++) {
          const indexItem = cis[j]
          const index = is.findIndex(([v]) => v === indexItem[0])
          if (index === -1) {
            is.push(indexItem)
          } else if (indexItem[2] !== is[index][2]) {
            delete ir[k]
            break
          }
        }
      } else {
        delete ir[k]
      }
    }
  }
  return isIndexRecordEmpty(ir) ? monoidIndexRecord.empty : ir
}

const getTaggedUnion = <Tag extends string, CS extends [Tagged<Tag>, Tagged<Tag>, ...Array<Tagged<Tag>>]>(
  index: Index,
  tag: Tag,
  codecs: CS,
  name: string
): TaggedUnionC<Tag, CS> => {
  const len = codecs.length
  const indexWithPosition: Array<[unknown, number]> = index.map<[unknown, number]>(([v, origin]) => [
    v,
    codecs.findIndex(codec => codec === origin)
  ])
  const find = (tagValue: unknown): [number, Mixed] | undefined => {
    for (let i = 0; i < indexWithPosition.length; i++) {
      const [value, position] = indexWithPosition[i]
      if (value === tagValue) {
        return [i, codecs[position]]
      }
    }
  }
  const isTagValue = (u: unknown): u is LiteralValue => find(u) !== undefined
  return new TaggedUnionType(
    name,
    (u): u is TypeOf<CS[number]> => {
      if (!UnknownRecord.is(u)) {
        return false
      }
      const tagValue = u[tag]
      const type = find(tagValue)
      return type ? type[1].is(u) : false
    },
    (u, c) => {
      const dictionaryResult = UnknownRecord.validate(u, c)
      if (dictionaryResult.isLeft()) {
        return dictionaryResult
      }
      const d = dictionaryResult.value
      const tagValue = d[tag]
      if (!isTagValue(tagValue)) {
        return failure(u, c)
      }
      const [i, type] = find(tagValue)!
      return type.validate(d, appendContext(c, String(i), type, d))
    },
    useIdentity(codecs, len) ? identity : a => find(a[tag])![1].encode(a),
    codecs,
    tag
  )
}

/**
 * @since 1.3.0
 */
export class TaggedUnionType<
  Tag extends string,
  CS extends Array<Tagged<Tag>>,
  A = any,
  O = A,
  I = unknown
> extends UnionType<CS, A, O, I> {
  constructor(
    name: string,
    is: TaggedUnionType<Tag, CS, A, O, I>['is'],
    validate: TaggedUnionType<Tag, CS, A, O, I>['validate'],
    encode: TaggedUnionType<Tag, CS, A, O, I>['encode'],
    codecs: CS,
    readonly tag: Tag
  ) {
    super(name, is, validate, encode, codecs) /* istanbul ignore next */ // <= workaround for https://github.com/Microsoft/TypeScript/issues/13455
  }
}

/**
 * @since 1.5.3
 */
export interface TaggedUnionC<Tag extends string, CS extends [Tagged<Tag>, Tagged<Tag>, ...Array<Tagged<Tag>>]>
  extends TaggedUnionType<Tag, CS, TypeOf<CS[number]>, OutputOf<CS[number]>, unknown> {}

/**
 * @since 1.3.0
 */
export const taggedUnion = <Tag extends string, CS extends [Tagged<Tag>, Tagged<Tag>, ...Array<Tagged<Tag>>]>(
  tag: Tag,
  codecs: CS,
  name: string = getUnionName(codecs)
): TaggedUnionC<Tag, CS> => {
  const indexRecord = getIndexRecord(codecs)
  if (!indexRecord.hasOwnProperty(tag)) {
    if (isRecursiveCodecIndexable && codecs.length > 0) {
      console.warn(`[io-ts] Cannot build a tagged union for (B | A), returning a de-optimized union`)
    }
    const U = union(codecs, name)
    return new TaggedUnionType(name, U.is, U.validate, U.encode, codecs, tag)
  }
  return getTaggedUnion(indexRecord[tag], tag, codecs, name)
}

/**
 * @since 1.1.0
 */
export class ExactType<C extends Any, A = any, O = A, I = unknown> extends Type<A, O, I> {
  readonly _tag: 'ExactType' = 'ExactType'
  constructor(
    name: string,
    is: ExactType<C, A, O, I>['is'],
    validate: ExactType<C, A, O, I>['validate'],
    encode: ExactType<C, A, O, I>['encode'],
    readonly type: C
  ) {
    super(name, is, validate, encode)
  }
}

/**
 * @since 1.1.0
 */
export interface HasPropsRefinement extends RefinementType<HasProps, any, any, any> {}
/**
 * @since 1.1.0
 */
export interface HasPropsReadonly extends ReadonlyType<HasProps, any, any, any> {}
/**
 * @since 1.1.0
 */
export interface HasPropsIntersection extends IntersectionType<Array<HasProps>, any, any, any> {}
/**
 * @since 1.1.0
 */
export type HasProps =
  | HasPropsRefinement
  | HasPropsReadonly
  | HasPropsIntersection
  | InterfaceType<any, any, any, any>
  | StrictType<any, any, any, any>
  | PartialType<any, any, any, any>

const getProps = (codec: HasProps): Props => {
  switch (codec._tag) {
    case 'RefinementType':
    case 'ReadonlyType':
      return getProps(codec.type)
    case 'InterfaceType':
    case 'StrictType':
    case 'PartialType':
      return codec.props
    case 'IntersectionType':
      return codec.types.reduce<Props>((props, type) => Object.assign(props, getProps(type)), {})
  }
}

/**
 * @since 1.5.3
 */
export interface ExactC<C extends HasProps> extends ExactType<C, TypeOf<C>, OutputOf<C>, InputOf<C>> {}

const stripKeys = (o: any, props: Props): unknown => {
  const keys = Object.getOwnPropertyNames(o)
  let shouldStrip = false
  const r: any = {}
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (!hasOwnProperty.call(props, key)) {
      shouldStrip = true
    } else {
      r[key] = o[key]
    }
  }
  return shouldStrip ? r : o
}

const getExactTypeName = (codec: Any): string => {
  if (isInterfaceCodec(codec)) {
    return `{| ${getNameFromProps(codec.props)} |}`
  } else if (isPartialCodec(codec)) {
    return getPartialTypeName(`{| ${getNameFromProps(codec.props)} |}`)
  }
  return `Exact<${codec.name}>`
}

/**
 * Strips additional properties
 * @since 1.1.0
 */
export const exact = <C extends HasProps>(codec: C, name: string = getExactTypeName(codec)): ExactC<C> => {
  const props: Props = getProps(codec)
  return new ExactType(
    name,
    (u): u is TypeOf<C> => codec.is(u) && Object.getOwnPropertyNames(u).every(k => hasOwnProperty.call(props, k)),
    (u, c) => {
      const unknownRecordValidation = UnknownRecord.validate(u, c)
      if (unknownRecordValidation.isLeft()) {
        return unknownRecordValidation
      }
      const validation = codec.validate(u, c)
      if (validation.isLeft()) {
        return validation
      }
      return success(stripKeys(validation.value, props))
    },
    a => codec.encode(stripKeys(a, props)),
    codec
  )
}

/**
 * Drops the codec "kind"
 * @since 1.1.0
 * @deprecated
 */
export function clean<A, O = A, I = unknown>(codec: Type<A, O, I>): Type<A, O, I> {
  return codec as any
}

/**
 * @since 1.0.0
 * @deprecated
 */
export type PropsOf<T extends { props: any }> = T['props']

/**
 * @since 1.1.0
 * @deprecated
 */
export type Exact<T, X extends T> = T &
  { [K in ({ [K in keyof X]: K } & { [K in keyof T]: never } & { [key: string]: never })[keyof X]]?: never }

/**
 * Keeps the codec "kind"
 * @since 1.1.0
 * @deprecated
 */
export function alias<A, O, P, I>(
  codec: PartialType<P, A, O, I>
): <
  AA extends Exact<A, AA>,
  OO extends Exact<O, OO> = O,
  PP extends Exact<P, PP> = P,
  II extends I = I
>() => PartialType<PP, AA, OO, II>
export function alias<A, O, P, I>(
  codec: StrictType<P, A, O, I>
): <
  AA extends Exact<A, AA>,
  OO extends Exact<O, OO> = O,
  PP extends Exact<P, PP> = P,
  II extends I = I
>() => StrictType<PP, AA, OO, II>
export function alias<A, O, P, I>(
  codec: InterfaceType<P, A, O, I>
): <
  AA extends Exact<A, AA>,
  OO extends Exact<O, OO> = O,
  PP extends Exact<P, PP> = P,
  II extends I = I
>() => InterfaceType<PP, AA, OO, II>
export function alias<A, O, I>(
  codec: Type<A, O, I>
): <AA extends Exact<A, AA>, OO extends Exact<O, OO> = O>() => Type<AA, OO, I> {
  return () => codec as any
}

export { nullType as null, undefinedType as undefined, UnknownArray as Array, type as interface, voidType as void }
