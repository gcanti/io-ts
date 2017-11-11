import { Either, Left, Right, isRight } from 'fp-ts/lib/Either'
import { Predicate } from 'fp-ts/lib/function'

declare global {
  interface Array<T> {
    _A: T
  }
}

export interface ContextEntry {
  readonly key: string
  readonly type: Any | NeverType
}
export type Context = Array<ContextEntry>
export interface ValidationError {
  readonly value: any
  readonly context: Context
}
export type Errors = Array<ValidationError>
export type Validation<A> = Either<Errors, A>
export type Is<A> = (v: any) => v is A
export type Validate<S, A> = (s: S, context: Context) => Validation<A>
export type Serialize<S, A> = (a: A) => S
export type Any = Type<any, any>
export type TypeOf<RT extends Any> = RT['_A']
export type InputOf<RT extends Any> = RT['_S']

/**
 * Laws:
 * 1. validate(x).fold(() => x, serialize) = x
 * 2. validate(serialize(x)) = Right(x)
 */
export class Type<S, A> {
  readonly _A: A
  readonly _S: S
  constructor(
    readonly name: string,
    readonly is: Is<A>,
    readonly validate: Validate<S, A>,
    readonly serialize: Serialize<S, A>
  ) {}
  compose<B>(ab: Type<A, B>, name?: string): Type<S, B> {
    return new Type(
      name || `compose(${this.name}, ${ab.name})`,
      (v): v is B => this.is(v) && ab.is(v),
      (s, c) => this.validate(s, c).chain(a => ab.validate(a, c)),
      this.serialize === identity && ab.serialize === identity ? identity as any : b => this.serialize(ab.serialize(b))
    )
  }
}

export const identity = <A>(a: A): A => a

export const getFunctionName = (f: any): string => f.displayName || f.name || `<function${f.length}>`

export const getContextEntry = (key: string, type: Any | NeverType): ContextEntry => ({ key, type })

export const getValidationError = (value: any, context: Context): ValidationError => ({ value, context })

export const getDefaultContext = (type: Any): Context => [{ key: '', type }]

export const failures = <T>(errors: Errors): Validation<T> => new Left(errors)

export const failure = <T>(value: any, context: Context): Validation<T> =>
  failures([getValidationError(value, context)])

export const success = <T>(value: T): Validation<T> => new Right<Errors, T>(value)

export const validate = <S, A>(value: S, type: Type<S, A>): Validation<A> =>
  type.validate(value, getDefaultContext(type))

const pushAll = <A>(xs: Array<A>, ys: Array<A>): void => Array.prototype.push.apply(xs, ys)

//
// basic types
//

export class NullType extends Type<any, null> {
  readonly _tag: 'NullType' = 'NullType'
  constructor() {
    super('null', (v): v is null => v === null, (s, c) => (this.is(s) ? success(s) : failure(s, c)), identity)
  }
}

/** @alias `null` */
export const nullType: NullType = new NullType()

export class UndefinedType extends Type<any, undefined> {
  readonly _tag: 'UndefinedType' = 'UndefinedType'
  constructor() {
    super(
      'undefined',
      (v): v is undefined => v === void 0,
      (s, c) => (this.is(s) ? success(s) : failure(s, c)),
      identity
    )
  }
}

const undefinedType: UndefinedType = new UndefinedType()

export class AnyType extends Type<any, any> {
  readonly _tag: 'AnyType' = 'AnyType'
  constructor() {
    super('any', (_): _ is any => true, success, identity)
  }
}

export const any: AnyType = new AnyType()

export class NeverType extends Type<any, never> {
  readonly _tag: 'NeverType' = 'NeverType'
  constructor() {
    super(
      'never',
      (_): _ is never => false,
      (s, c) => failure(s, c),
      () => {
        throw new Error('cannot serialize never')
      }
    )
  }
}

export const never: NeverType = new NeverType()

export class StringType extends Type<any, string> {
  readonly _tag: 'StringType' = 'StringType'
  constructor() {
    super(
      'string',
      (v): v is string => typeof v === 'string',
      (s, c) => (this.is(s) ? success(s) : failure(s, c)),
      identity
    )
  }
}

export const string: StringType = new StringType()

export class NumberType extends Type<any, number> {
  readonly _tag: 'NumberType' = 'NumberType'
  constructor() {
    super(
      'number',
      (v): v is number => typeof v === 'number',
      (s, c) => (this.is(s) ? success(s) : failure(s, c)),
      identity
    )
  }
}

export const number: NumberType = new NumberType()

export class BooleanType extends Type<any, boolean> {
  readonly _tag: 'BooleanType' = 'BooleanType'
  constructor() {
    super(
      'boolean',
      (v): v is boolean => typeof v === 'boolean',
      (s, c) => (this.is(s) ? success(s) : failure(s, c)),
      identity
    )
  }
}

export const boolean: BooleanType = new BooleanType()

export class AnyArrayType extends Type<any, Array<any>> {
  readonly _tag: 'AnyArrayType' = 'AnyArrayType'
  constructor() {
    super(
      'Array',
      (v): v is Array<any> => Array.isArray(v),
      (s, c) => (this.is(s) ? success(s) : failure(s, c)),
      identity
    )
  }
}

const arrayType: AnyArrayType = new AnyArrayType()

export class AnyDictionaryType extends Type<any, { [key: string]: any }> {
  readonly _tag: 'AnyDictionaryType' = 'AnyDictionaryType'
  constructor() {
    super(
      'Dictionary',
      (v): v is { [key: string]: any } => v !== null && typeof v === 'object',
      (s, c) => (this.is(s) ? success(s) : failure(s, c)),
      identity
    )
  }
}

export const Dictionary: AnyDictionaryType = new AnyDictionaryType()

export class ObjectType extends Type<any, object> {
  readonly _tag: 'ObjectType' = 'ObjectType'
  constructor() {
    super('object', Dictionary.is, Dictionary.validate, identity)
  }
}

export const object: ObjectType = new ObjectType()

export class FunctionType extends Type<any, Function> {
  readonly _tag: 'FunctionType' = 'FunctionType'
  constructor() {
    super(
      'Function',
      (v): v is Function => typeof v === 'function',
      (s, c) => (this.is(s) ? success(s) : failure(s, c)),
      identity
    )
  }
}

const functionType: FunctionType = new FunctionType()

//
// refinements
//

export class RefinementType<RT extends Any> extends Type<InputOf<RT>, TypeOf<RT>> {
  readonly _tag: 'RefinementType' = 'RefinementType'
  constructor(
    readonly type: RT,
    readonly predicate: Predicate<TypeOf<RT>>,
    readonly name: string = `(${type.name} | ${getFunctionName(predicate)})`
  ) {
    super(
      name,
      (v): v is TypeOf<RT> => type.is(v) && predicate(v),
      (s, c) => type.validate(s, c).chain(a => (predicate(a) ? success(a) : failure(a, c))),
      type.serialize
    )
  }
}

export const refinement = <RT extends Any>(
  type: RT,
  predicate: Predicate<TypeOf<RT>>,
  name?: string
): RefinementType<RT> => new RefinementType(type, predicate, name)

export const Integer = refinement(number, n => n % 1 === 0, 'Integer')

//
// literals
//

export class LiteralType<V extends string | number | boolean> extends Type<any, V> {
  readonly _tag: 'LiteralType' = 'LiteralType'
  constructor(readonly value: V, readonly name: string = JSON.stringify(value)) {
    super(name, (v): v is V => v === value, (s, c) => (this.is(s) ? success(value) : failure(s, c)), identity)
  }
}

export const literal = <V extends string | number | boolean>(value: V, name?: string): LiteralType<V> =>
  new LiteralType(value, name)

//
// keyof
//

export class KeyofType<D extends { [key: string]: any }> extends Type<any, keyof D> {
  readonly _tag: 'KeyofType' = 'KeyofType'
  constructor(readonly keys: D, readonly name: string = `(keyof ${JSON.stringify(Object.keys(keys))})`) {
    super(
      name,
      (v): v is keyof D => keys.hasOwnProperty(v),
      (s, c) => (this.is(s) ? success(s) : failure(s, c)),
      identity
    )
  }
}

export const keyof = <D extends { [key: string]: any }>(keys: D, name?: string): KeyofType<D> =>
  new KeyofType(keys, name)

//
// recursive types
//

export class RecursiveType<T> extends Type<any, T> {
  readonly _tag: 'RecursiveType' = 'RecursiveType'
  readonly type: Any
  constructor(
    readonly name: string,
    is: Is<T>,
    readonly validate: Validate<any, T>,
    readonly serialize: Serialize<any, T>
  ) {
    super(name, is, validate, serialize)
  }
}

export const recursion = <T>(name: string, definition: (self: Any) => Any): RecursiveType<T> => {
  const Self: any = new RecursiveType<T>(name, (v): v is T => type.is(v), (s, c) => type.validate(s, c), identity)
  const type = definition(Self)
  Self.type = type
  Self.serialize = type.serialize
  return Self
}

//
// arrays
//

export class ArrayType<RT extends Any> extends Type<any, Array<TypeOf<RT>>> {
  readonly _tag: 'ArrayType' = 'ArrayType'
  constructor(readonly type: RT, readonly name: string = `Array<${type.name}>`) {
    super(
      name,
      (v): v is Array<TypeOf<RT>> => arrayType.is(v) && v.every(type.is),
      (s, c) =>
        arrayType.validate(s, c).chain(xs => {
          const a: Array<TypeOf<RT>> = []
          const errors: Errors = []
          let changed = false
          for (let i = 0; i < xs.length; i++) {
            const x = xs[i]
            const validation = type.validate(x, c.concat(getContextEntry(String(i), type)))
            validation.fold(
              e => pushAll(errors, e),
              vx => {
                changed = changed || vx !== x
                a.push(vx)
              }
            )
          }
          return errors.length ? failures(errors) : success(changed ? a : xs)
        }),
      type.serialize === identity ? identity : v => v.map(type.serialize)
    )
  }
}

export const array = <RT extends Any>(type: RT, name?: string): ArrayType<RT> => new ArrayType(type, name)

//
// interfaces
//

export type Props = { [key: string]: Any }

export type InterfaceOf<P extends Props> = { [K in keyof P]: TypeOf<P[K]> }

const getNameFromProps = (props: Props): string =>
  `{ ${Object.keys(props).map(k => `${k}: ${props[k].name}`).join(', ')} }`

const useIdentity = (props: Props): boolean => {
  for (let k in props) {
    if (props[k].serialize !== identity) {
      return false
    }
  }
  return true
}

export class InterfaceType<P extends Props> extends Type<any, InterfaceOf<P>> {
  readonly _tag: 'InterfaceType' = 'InterfaceType'
  constructor(readonly props: P, readonly name: string = getNameFromProps(props)) {
    super(
      name,
      (v): v is InterfaceOf<P> => {
        if (!Dictionary.is(v)) {
          return false
        }
        for (let k in props) {
          if (!props[k].is(v[k])) {
            return false
          }
        }
        return true
      },
      (s, c) =>
        Dictionary.validate(s, c).chain(o => {
          const a = { ...o }
          const errors: Errors = []
          let changed = false
          for (let k in props) {
            const ok = o[k]
            const type = props[k]
            const validation = type.validate(ok, c.concat(getContextEntry(k, type)))
            validation.fold(
              e => pushAll(errors, e),
              vok => {
                changed = changed || vok !== ok
                a[k] = vok
              }
            )
          }
          return errors.length ? failures(errors) : success((changed ? a : o) as any)
        }),
      useIdentity(props)
        ? identity
        : v => {
            const s: { [x: string]: any } = { ...v as any }
            for (let k in props) {
              s[k] = props[k].serialize(v[k])
            }
            return s
          }
    )
  }
}

/** @alias `interface` */
export const type = <P extends Props>(props: P, name?: string): InterfaceType<P> => new InterfaceType(props, name)

//
// partials
//

export type PartialOf<P extends Props> = { [K in keyof P]?: TypeOf<P[K]> }
export type PartialPropsOf<P extends Props> = { [K in keyof P]: UnionType<[P[K], UndefinedType]> }

export class PartialType<P extends Props> extends Type<any, PartialOf<P>> {
  readonly _tag: 'PartialType' = 'PartialType'
  constructor(readonly props: P, name?: string) {
    super(
      name || `PartialType<${getNameFromProps(props)}>`,
      (_): _ is PartialOf<P> => partial.is as any,
      (s, c) => partial.validate(s, c) as any,
      useIdentity(props)
        ? identity
        : v => {
            const s: { [key: string]: any } = {}
            for (let k in props) {
              const vk = v[k]
              if (vk !== undefined) {
                s[k] = props[k].serialize(vk)
              }
            }
            return s
          }
    )
    const partials: Props = {}
    for (let k in props) {
      partials[k] = union([props[k], undefinedType])
    }
    const partial = type(partials)
  }
}

export const partial = <P extends Props>(props: P, name?: string): PartialType<P> => new PartialType(props, name)

//
// dictionaries
//

export class DictionaryType<C extends Any> extends Type<any, { [key: string]: TypeOf<C> }> {
  readonly _tag: 'DictionaryType' = 'DictionaryType'
  constructor(readonly type: C, readonly name: string = `{ [key: string]: ${type.name} }`) {
    super(
      name,
      (v): v is { [key: string]: TypeOf<C> } => Dictionary.is(v) && Object.keys(v).every(k => type.is(v[k])),
      (s, c) =>
        Dictionary.validate(s, c).chain(o => {
          const a: { [key: string]: any } = {}
          const errors: Errors = []
          let changed = false
          for (let k in o) {
            const ok = o[k]
            const validation = type.validate(ok, c.concat(getContextEntry(k, type)))
            validation.fold(
              e => pushAll(errors, e),
              vok => {
                changed = changed || vok !== ok
                a[k] = vok
              }
            )
          }
          return errors.length ? failures(errors) : success((changed ? a : o) as any)
        }),
      type.serialize === identity
        ? identity
        : v => {
            const s: { [key: string]: any } = {}
            for (let k in v) {
              s[k] = type.serialize(v[k])
            }
            return s
          }
    )
  }
}

export const dictionary = <C extends Any>(codomain: C, name?: string): DictionaryType<C> =>
  new DictionaryType(codomain, name)

//
// unions
//

export class UnionType<RTS extends Array<Any>> extends Type<any, TypeOf<RTS['_A']>> {
  readonly _tag: 'UnionType' = 'UnionType'
  constructor(readonly types: RTS, readonly name: string = `(${types.map(type => type.name).join(' | ')})`) {
    super(
      name,
      (v): v is TypeOf<RTS['_A']> => types.some(type => type.is(v)),
      (s, c) => {
        const errors: Errors = []
        for (let i = 0; i < types.length; i++) {
          const type = types[i]
          const validation = type.validate(s, c.concat(getContextEntry(String(i), type)))
          if (isRight(validation)) {
            return validation
          } else {
            pushAll(errors, validation.value)
          }
        }
        return failures(errors)
      },
      types.every(type => type.serialize === identity)
        ? identity
        : v => {
            for (let i = 0; i < types.length; i++) {
              const type = types[i]
              if (type.is(v)) {
                return type.serialize(v)
              }
            }
            return v
          }
    )
  }
}

export const union = <RTS extends Array<Any>>(types: RTS, name?: string): UnionType<RTS> => new UnionType(types, name)

//
// intersections
//

export class IntersectionType<RTS extends Array<Any>, A> extends Type<any, A> {
  readonly _tag: 'IntersectionType' = 'IntersectionType'
  constructor(readonly types: RTS, readonly name: string = `(${types.map(type => type.name).join(' & ')})`) {
    super(
      name,
      (v): v is A => types.every(type => type.is(v)),
      (s, c) => {
        let a = s
        let changed = false
        const errors: Errors = []
        for (let i = 0; i < types.length; i++) {
          const type = types[i]
          const validation = type.validate(a, c)
          validation.fold(
            e => pushAll(errors, e),
            va => {
              changed = changed || va !== a
              a = va
            }
          )
        }
        return errors.length ? failures(errors) : success(changed ? a : s)
      },
      types.every(type => type.serialize === identity)
        ? identity
        : v => {
            let s = v
            for (let i = 0; i < types.length; i++) {
              const type = types[i]
              s = type.serialize(s)
            }
            return s
          }
    )
  }
}

export function intersection<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any>(
  types: [A, B, C, D, E],
  name?: string
): IntersectionType<[A, B, C, D, E], TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D> & TypeOf<E>>
export function intersection<A extends Any, B extends Any, C extends Any, D extends Any>(
  types: [A, B, C, D],
  name?: string
): IntersectionType<[A, B, C, D], TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D>>
export function intersection<A extends Any, B extends Any, C extends Any>(
  types: [A, B, C],
  name?: string
): IntersectionType<[A, B, C], TypeOf<A> & TypeOf<B> & TypeOf<C>>
export function intersection<A extends Any, B extends Any>(
  types: [A, B],
  name?: string
): IntersectionType<[A, B], TypeOf<A> & TypeOf<B>>
export function intersection<A extends Any>(types: [A], name?: string): IntersectionType<[A], TypeOf<A>>
export function intersection<RTS extends Array<Any>>(types: RTS, name?: string): IntersectionType<RTS, any> {
  return new IntersectionType(types, name)
}

//
// tuples
//

export class TupleType<RTS extends Array<Any>, A> extends Type<any, A> {
  readonly _tag: 'TupleType' = 'TupleType'
  constructor(readonly types: RTS, readonly name: string = `[${types.map(type => type.name).join(', ')}]`) {
    super(
      name,
      (v): v is A => types.every((type, i) => type.is(v[i])),
      (s, c) =>
        arrayType.validate(s, c).chain(as => {
          const t: Array<any> = []
          const errors: Errors = []
          let changed = false
          for (let i = 0; i < types.length; i++) {
            const a = as[i]
            const type = types[i]
            const validation = type.validate(a, c.concat(getContextEntry(String(i), type)))
            validation.fold(
              e => pushAll(errors, e),
              va => {
                changed = changed || va !== a
                t.push(va)
              }
            )
          }
          return errors.length ? failures(errors) : success((changed ? t : as) as any)
        }),
      types.every(type => type.serialize === identity)
        ? identity
        : (v: any) => types.map((type, i) => type.serialize(v[i]))
    )
  }
}

export function tuple<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any>(
  types: [A, B, C, D, E],
  name?: string
): TupleType<[A, B, C, D, E], [TypeOf<A>, TypeOf<B>, TypeOf<C>, TypeOf<D>, TypeOf<E>]>
export function tuple<A extends Any, B extends Any, C extends Any, D extends Any>(
  types: [A, B, C, D],
  name?: string
): TupleType<[A, B, C, D], [TypeOf<A>, TypeOf<B>, TypeOf<C>, TypeOf<D>]>
export function tuple<A extends Any, B extends Any, C extends Any>(
  types: [A, B, C],
  name?: string
): TupleType<[A, B, C], [TypeOf<A>, TypeOf<B>, TypeOf<C>]>
export function tuple<A extends Any, B extends Any>(
  types: [A, B],
  name?: string
): TupleType<[A, B], [TypeOf<A>, TypeOf<B>]>
export function tuple<A extends Any>(types: [A], name?: string): TupleType<[A], [TypeOf<A>]>
export function tuple<RTS extends Array<Any>>(types: RTS, name?: string): TupleType<RTS, any> {
  return new TupleType(types, name)
}

//
// readonly
//

export class ReadonlyType<RT extends Any> extends Type<any, Readonly<TypeOf<RT>>> {
  readonly _tag: 'ReadonlyType' = 'ReadonlyType'
  constructor(readonly type: RT, readonly name: string = `Readonly<${type.name}>`) {
    super(
      name,
      type.is,
      (s, c) =>
        type.validate(s, c).map(x => {
          if (process.env.NODE_ENV !== 'production') {
            return Object.freeze(x)
          }
          return x
        }),
      type.serialize === identity ? identity : type.serialize
    )
  }
}

export const readonly = <RT extends Any>(type: RT, name?: string): ReadonlyType<RT> => new ReadonlyType(type, name)

//
// readonlyArray
//

export class ReadonlyArrayType<RT extends Any> extends Type<any, ReadonlyArray<TypeOf<RT>>> {
  readonly _tag: 'ReadonlyArrayType' = 'ReadonlyArrayType'
  constructor(readonly type: RT, readonly name: string = `ReadonlyArray<${type.name}>`) {
    super(
      name,
      (v): v is ReadonlyArray<TypeOf<RT>> => arrayType.is(v),
      (s, c) =>
        arrayType.validate(s, c).map(x => {
          if (process.env.NODE_ENV !== 'production') {
            return Object.freeze(x)
          } else {
            return x
          }
        }),
      (() => {
        arrayType = array(type)
        return arrayType.serialize as any
      })()
    )
    let arrayType: ArrayType<RT>
  }
}

export const readonlyArray = <RT extends Any>(type: RT, name?: string): ReadonlyArrayType<RT> =>
  new ReadonlyArrayType(type, name)

export class StrictType<P extends Props> extends Type<any, InterfaceOf<P>> {
  readonly _tag: 'StrictType' = 'StrictType'
  constructor(readonly props: P, name?: string) {
    super(
      name || `StrictType<${getNameFromProps(props)}>`,
      (v): v is InterfaceOf<P> => loose.is(v) && Object.getOwnPropertyNames(v).every(k => props.hasOwnProperty(k)),
      (s, c) =>
        loose.validate(s, c).chain(o => {
          const keys = Object.getOwnPropertyNames(o)
          if (keys.length !== len) {
            const errors: Errors = []
            for (let i = 0; i < keys.length; i++) {
              const key = keys[i]
              if (!props.hasOwnProperty(key)) {
                errors.push(getValidationError(o[key], c.concat(getContextEntry(key, never))))
              }
            }
            return errors.length ? failures(errors) : failure(o, c)
          } else {
            return success(o)
          }
        }),
      type(props).serialize
    )
    const loose = type(props)
    const len = Object.keys(props).length
  }
}

/** Specifies that only the given interface properties are allowed */
export function strict<P extends Props>(props: P, name?: string): StrictType<P> {
  return new StrictType(props, name)
}

export { nullType as null, undefinedType as undefined, arrayType as Array, functionType as Function, type as interface }
