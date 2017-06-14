import { Either, Left, Right, isRight } from 'fp-ts/lib/Either'
import { Option } from 'fp-ts/lib/Option'
import { Predicate } from 'fp-ts/lib/function'

export interface ContextEntry {
  readonly key: string
  readonly type: Any
}
export type Context = Array<ContextEntry>
export interface ValidationError {
  readonly value: any
  readonly context: Context
}
export type Validation<T> = Either<Array<ValidationError>, T>
export type Validate<T> = (value: any, context: Context) => Validation<T>
export type Any = Type<any>

type Errors = Array<ValidationError>

export type TypeOf<RT extends Any> = RT['_A']

export interface Type<A> {
  readonly _A: A
  readonly name: string
  readonly validate: Validate<A>
}

export const _A = (null as any) as never

export function getFunctionName(f: any): string {
  return f.displayName || f.name || `<function${f.length}>`
}

function getContextEntry(key: string, type: Any): ContextEntry {
  return { key, type }
}

function getValidationError(value: any, context: Context): ValidationError {
  return { value, context }
}

function pushAll<A>(xs: Array<A>, ys: Array<A>): void {
  Array.prototype.push.apply(xs, ys)
}

export function failure<T>(value: any, context: Context): Validation<T> {
  return new Left<Errors, T>([getValidationError(value, context)])
}

export function success<T>(value: T): Validation<T> {
  return new Right<Errors, T>(value)
}

function getDefaultContext<T>(type: Type<T>): Context {
  return [{ key: '', type }]
}

export function validate<T>(value: any, type: Type<T>): Validation<T> {
  return type.validate(value, getDefaultContext(type))
}

export function is<T>(value: any, type: Type<T>): value is T {
  return isRight(validate(value, type))
}

//
// Functor
//

declare module 'fp-ts/lib/HKT' {
  interface HKT<A> {
    'io-ts/Type': Type<A>
  }
}

export const URI = 'io-ts/Type'

export type URI = typeof URI

export interface MapType<RT extends Any, B> extends Type<B> {
  readonly _tag: 'MapType'
  readonly type: RT
  readonly f: (a: TypeOf<RT>) => B
}

export function map<RT extends Any, B>(f: (a: TypeOf<RT>) => B, type: RT): MapType<RT, B> {
  return mapWithName(f, type, `(${type.name} => ?)`)
}

export function mapWithName<RT extends Any, B>(f: (a: TypeOf<RT>) => B, type: RT, name: string): MapType<RT, B> {
  return {
    _A,
    _tag: 'MapType',
    name,
    validate: (v, c) => type.validate(v, c).map(f),
    type,
    f
  }
}

//
// basic types
//

export interface NullType extends Type<null> {
  readonly _tag: 'NullType'
}

const nullType: NullType = {
  _A,
  _tag: 'NullType',
  name: 'null',
  validate: (v, c) => (v === null ? success(v) : failure(v, c))
}

export interface UndefinedType extends Type<undefined> {
  readonly _tag: 'UndefinedType'
}

const undefinedType: UndefinedType = {
  _A,
  _tag: 'UndefinedType',
  name: 'undefined',
  validate: (v, c) => (v === void 0 ? success(v) : failure(v, c))
}

export interface AnyType extends Type<any> {
  readonly _tag: 'AnyType'
}

export const any: AnyType = {
  _A,
  _tag: 'AnyType',
  name: 'any',
  validate: (v, _) => success(v)
}

export interface NeverType extends Type<never> {
  readonly _tag: 'NeverType'
}

export const never: NeverType = {
  _A,
  _tag: 'NeverType',
  name: 'never',
  validate: (v, c) => failure<never>(v, c)
}

export interface StringType extends Type<string> {
  readonly _tag: 'StringType'
}

export const string: StringType = {
  _A,
  _tag: 'StringType',
  name: 'string',
  validate: (v, c) => (typeof v === 'string' ? success(v) : failure<string>(v, c))
}

export interface NumberType extends Type<number> {
  readonly _tag: 'NumberType'
}

export const number: NumberType = {
  _A,
  _tag: 'NumberType',
  name: 'number',
  validate: (v, c) => (typeof v === 'number' ? success(v) : failure<number>(v, c))
}

export interface BooleanType extends Type<boolean> {
  readonly _tag: 'BooleanType'
}

export const boolean: BooleanType = {
  _A,
  _tag: 'BooleanType',
  name: 'boolean',
  validate: (v, c) => (typeof v === 'boolean' ? success(v) : failure<boolean>(v, c))
}

export interface AnyArrayType extends Type<Array<any>> {
  readonly _tag: 'AnyArrayType'
}

const arrayType: AnyArrayType = {
  _A,
  _tag: 'AnyArrayType',
  name: 'Array',
  validate: (v, c) => (Array.isArray(v) ? success(v) : failure<Array<any>>(v, c))
}

export interface AnyDictionaryType extends Type<{ [key: string]: any }> {
  readonly _tag: 'AnyDictionaryType'
}

export const Dictionary: AnyDictionaryType = {
  _A,
  _tag: 'AnyDictionaryType',
  name: 'Dictionary',
  validate: (v, c) => (v !== null && typeof v === 'object' ? success(v) : failure(v, c))
}

export interface FunctionType extends Type<Function> {
  readonly _tag: 'FunctionType'
}

const functionType: FunctionType = {
  _A,
  _tag: 'FunctionType',
  name: 'Function',
  validate: (v, c) => (typeof v === 'function' ? success(v) : failure<Function>(v, c))
}

//
// refinements
//

export interface RefinementType<RT extends Any> extends Type<TypeOf<RT>> {
  readonly _tag: 'RefinementType'
  readonly type: RT
  readonly predicate: Predicate<TypeOf<RT>>
}

export function refinement<RT extends Any>(
  type: RT,
  predicate: Predicate<TypeOf<RT>>,
  name?: string
): RefinementType<RT> {
  return {
    _A,
    _tag: 'RefinementType',
    name: name || `(${type.name} | ${getFunctionName(predicate)})`,
    validate: (v, c) => type.validate(v, c).chain(t => (predicate(t) ? success(t) : failure(v, c))),
    type,
    predicate
  }
}

export const Integer = refinement(number, n => n % 1 === 0, 'Integer')

//
// prisms
//

export type GetOption<S, A> = (s: S) => Option<A>

export interface PrismType<RT extends Any, B> extends Type<B> {
  readonly _tag: 'PrismType'
  readonly type: RT
  readonly getOption: GetOption<TypeOf<RT>, B>
}

export function prism<RT extends Any, B>(
  type: RT,
  getOption: GetOption<TypeOf<RT>, B>,
  name?: string
): PrismType<RT, B> {
  return {
    _A,
    _tag: 'PrismType',
    name: name || `Prism<${type.name}, ?>`,
    validate: (v, c) => type.validate(v, c).chain(a => getOption(a).fold(() => failure<B>(a, c), b => success(b))),
    type,
    getOption
  }
}

//
// literal types
//

export interface LiteralType<T> extends Type<T> {
  readonly _tag: 'LiteralType'
  readonly value: T
}

export function literal<T extends string | number | boolean>(value: T): LiteralType<T> {
  return {
    _A,
    _tag: 'LiteralType',
    name: JSON.stringify(value),
    validate: (v, c) => (v === value ? success(value) : failure<T>(v, c)),
    value
  }
}

//
// keyof types
//

export interface KeyofType<D extends { [key: string]: any }> extends Type<keyof D> {
  readonly _tag: 'KeyofType'
  readonly keys: D
}

export function keyof<D extends { [key: string]: any }>(keys: D, name?: string): KeyofType<D> {
  return {
    _A,
    _tag: 'KeyofType',
    name: name || `(keyof ${JSON.stringify(Object.keys(keys))})`,
    validate: (v, c) => (keys.hasOwnProperty(v) ? success(v) : failure(v, c)),
    keys
  }
}

//
// recursive types
//

export function recursion<T>(name: string, definition: (self: Any) => Any): Type<T> {
  const Self = { name, validate: (v, c) => Result.validate(v, c) } as Type<any>
  const Result: any = definition(Self)
  Result.name = name
  return Result
}

//
// arrays
//

export interface ArrayType<RT extends Any> extends Type<Array<TypeOf<RT>>> {
  readonly _tag: 'ArrayType'
  readonly type: RT
}

export function array<RT extends Any>(type: RT, name?: string): ArrayType<RT> {
  return {
    _A,
    _tag: 'ArrayType',
    name: name || `Array<${type.name}>`,
    validate: (v, c) =>
      arrayType.validate(v, c).chain(as => {
        const t: Array<TypeOf<RT>> = []
        const errors: Errors = []
        let changed = false
        for (let i = 0; i < as.length; i++) {
          const a = as[i]
          const validation = type.validate(a, c.concat(getContextEntry(String(i), type)))
          validation.fold(
            error => pushAll(errors, error),
            va => {
              changed = changed || va !== a
              t.push(va)
            }
          )
        }
        return errors.length ? new Left<Errors, Array<TypeOf<RT>>>(errors) : success(changed ? t : as)
      }),
    type
  }
}

//
// interfaces
//

export type Props = { [key: string]: Any }

// TODO remove this once https://github.com/Microsoft/TypeScript/issues/14041 is fixed
export type InterfaceOf<P extends Props> = { [K in keyof P]: TypeOf<P[K]> }

export interface InterfaceType<P extends Props> extends Type<InterfaceOf<P>> {
  readonly _tag: 'InterfaceType'
  readonly props: P
}

function interfaceType<P extends Props>(props: P, name?: string): InterfaceType<P> {
  return {
    _A,
    _tag: 'InterfaceType',
    name: name || `{ ${Object.keys(props).map(k => `${k}: ${props[k].name}`).join(', ')} }`,
    validate: (v, c) =>
      Dictionary.validate(v, c).chain(o => {
        const t = { ...o }
        const errors: Errors = []
        let changed = false
        for (let k in props) {
          const ok = o[k]
          const type = props[k]
          const validation = type.validate(ok, c.concat(getContextEntry(k, type)))
          validation.fold(
            error => pushAll(errors, error),
            vok => {
              changed = changed || vok !== ok
              t[k] = vok
            }
          )
        }
        return errors.length ? new Left(errors) : success((changed ? t : o) as any)
      }),
    props
  }
}

//
// partials
//

// TODO remove this once https://github.com/Microsoft/TypeScript/issues/14041 is fixed
export type PartialOf<P extends Props> = { [K in keyof P]?: TypeOf<P[K]> }
// TODO remove this once https://github.com/Microsoft/TypeScript/issues/14041 is fixed
export type PartialPropsOf<P extends Props> = {
  [K in keyof P]: UnionType<[P[K], Type<undefined>], [TypeOf<P[K]>, undefined]>
}

export interface PartialType<P extends Props> extends Type<PartialOf<P>> {
  readonly _tag: 'PartialType'
  readonly props: PartialPropsOf<P>
}

export function partial<P extends Props>(props: P, name?: string): PartialType<P> {
  const partials: Props = {}
  for (let k in props) {
    partials[k] = union([props[k], undefinedType])
  }
  const type = interfaceType(partials)
  return {
    _A,
    _tag: 'PartialType',
    name: name || type.name,
    validate: (v, c) => type.validate(v, c) as any,
    props: (partials as any) as PartialPropsOf<P>
  }
}

//
// dictionaries
//

export interface DictionaryType<D extends Type<string>, C extends Any> extends Type<{ [key: string]: TypeOf<C> }> {
  readonly _tag: 'DictionaryType'
  readonly domain: D
  readonly codomain: C
}

export function dictionary<D extends Type<string>, C extends Any>(
  domain: D,
  codomain: C,
  name?: string
): DictionaryType<D, C> {
  return {
    _A,
    _tag: 'DictionaryType',
    name: name || `{ [key: ${domain.name}]: ${codomain.name} }`,
    validate: (v, c) =>
      Dictionary.validate(v, c).chain(o => {
        const t: { [key: string]: any } = {}
        const errors: Errors = []
        let changed = false
        for (let k in o) {
          const ok = o[k]
          const domainValidation = domain.validate(k, c.concat(getContextEntry(k, domain)))
          const codomainValidation = codomain.validate(ok, c.concat(getContextEntry(k, codomain)))
          domainValidation.fold(
            error => pushAll(errors, error),
            vk => {
              changed = changed || vk !== k
              k = vk
            }
          )
          codomainValidation.fold(
            error => pushAll(errors, error),
            vok => {
              changed = changed || vok !== ok
              t[k] = vok
            }
          )
        }
        return errors.length ? new Left(errors) : success((changed ? t : o) as any)
      }),
    domain,
    codomain
  }
}

//
// unions
//

export interface UnionType<RTS extends Array<Any>, U> extends Type<U> {
  readonly _tag: 'UnionType'
  readonly types: RTS
}

export function union<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any>(
  types: [A, B, C, D, E],
  name?: string
): UnionType<[A, B, C, D, E], TypeOf<A> | TypeOf<B> | TypeOf<C> | TypeOf<D> | TypeOf<E>>
export function union<A extends Any, B extends Any, C extends Any, D extends Any>(
  types: [A, B, C, D],
  name?: string
): UnionType<[A, B, C, D], TypeOf<A> | TypeOf<B> | TypeOf<C> | TypeOf<D>>
export function union<A extends Any, B extends Any, C extends Any>(
  types: [A, B, C],
  name?: string
): UnionType<[A, B, C], TypeOf<A> | TypeOf<B> | TypeOf<C>>
export function union<A extends Any, B extends Any>(
  types: [A, B],
  name?: string
): UnionType<[A, B], TypeOf<A> | TypeOf<B>>
export function union<A extends Any>(types: [A], name?: string): UnionType<[A], TypeOf<A>>
export function union<RTS extends Array<Any>>(types: RTS, name?: string): UnionType<RTS, any> {
  return {
    _A,
    _tag: 'UnionType',
    name: name || `(${types.map(type => type.name).join(' | ')})`,
    validate: (v, c) => {
      for (let i = 0; i < types.length; i++) {
        const validation = types[i].validate(v, c)
        if (isRight(validation)) {
          return validation
        }
      }
      return failure(v, c)
    },
    types
  }
}

//
// intersections
//

export interface IntersectionType<RTS extends Array<Any>, I> extends Type<I> {
  readonly _tag: 'IntersectionType'
  readonly types: RTS
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
  return {
    _A,
    _tag: 'IntersectionType',
    name: name || `(${types.map(type => type.name).join(' & ')})`,
    validate: (v, c) => {
      let t = v
      let changed = false
      const errors: Errors = []
      for (let i = 0; i < types.length; i++) {
        const type = types[i]
        const validation = type.validate(t, c)
        validation.fold(
          error => pushAll(errors, error),
          vv => {
            changed = changed || vv !== t
            t = vv
          }
        )
      }
      return errors.length ? new Left(errors) : success(changed ? t : v)
    },
    types
  }
}

//
// tuples
//

export interface TupleType<RTS extends Array<Any>, I> extends Type<I> {
  readonly _tag: 'TupleType'
  readonly types: RTS
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
  return {
    _A,
    _tag: 'TupleType',
    name: name || `[${types.map(type => type.name).join(', ')}]`,
    validate: (v, c) =>
      arrayType.validate(v, c).chain(as => {
        const t: Array<any> = []
        const errors: Errors = []
        let changed = false
        for (let i = 0; i < types.length; i++) {
          const a = as[i]
          const type = types[i]
          const validation = type.validate(a, c.concat(getContextEntry(String(i), type)))
          validation.fold(
            error => pushAll(errors, error),
            va => {
              changed = changed || va !== a
              t.push(va)
            }
          )
        }
        return errors.length ? new Left(errors) : success(changed ? t : as)
      }),
    types
  }
}

//
// readonly
//

export interface ReadonlyType<RT extends Any> extends Type<Readonly<TypeOf<RT>>> {
  readonly _tag: 'ReadonlyType'
  readonly type: RT
}

export function readonly<RT extends Any>(type: RT, name?: string): ReadonlyType<RT> {
  return {
    _A,
    _tag: 'ReadonlyType',
    name: name || `Readonly<${type.name}>`,
    validate: (v, c) =>
      type.validate(v, c).map(x => {
        if (process.env.NODE_ENV !== 'production') {
          return Object.freeze(x)
        }
        return x
      }),
    type
  }
}

//
// readonlyArray
//

export interface ReadonlyArrayType<RT extends Any> extends Type<ReadonlyArray<TypeOf<RT>>> {
  readonly _tag: 'ReadonlyArrayType'
  readonly type: RT
}

export function readonlyArray<RT extends Any>(type: RT, name?: string): ReadonlyArrayType<RT> {
  const arrayType = array(type)
  return {
    _A,
    _tag: 'ReadonlyArrayType',
    name: name || `ReadonlyArray<${type.name}>`,
    validate: (v, c) =>
      arrayType.validate(v, c).map(x => {
        if (process.env.NODE_ENV !== 'production') {
          return Object.freeze(x)
        }
        return x
      }),
    type
  }
}

export {
  nullType as null,
  undefinedType as undefined,
  arrayType as Array,
  functionType as Function,
  interfaceType as interface
}
