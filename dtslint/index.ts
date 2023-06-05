import { either } from 'fp-ts/lib/Either'
import { TaskEither } from 'fp-ts/lib/TaskEither'

import * as t from '../src'

//
// helpers
//

type Compact<A> = { [K in keyof A]: A[K] }

/**
 * Returns the string literal 'T' if `A` and `B` are equal types, 'F' otherwise
 */
type Equals<A, B> = (<C>() => C extends Compact<A> ? 'T' : 'F') extends <C>() => C extends Compact<B> ? 'T' : 'F'
  ? 'T'
  : 'F'

export const NumberFromString = new t.Type<number, string, unknown>(
  'NumberFromString',
  t.number.is,
  (u, c) =>
    either.chain(t.string.validate(u, c), (s) => {
      const n = parseFloat(s)
      return isNaN(n) ? t.failure(s, c) : t.success(n)
    }),
  String
)

//
// recursion
//

interface Recursion1 {
  type: 'a'
  items: Array<Recursion1>
}

const Recursion1: t.Type<Recursion1> = t.recursion('T', () =>
  t.type({
    type: t.literal('a'),
    items: t.array(Recursion1)
  })
)

export const Recursion1TypeTest = Recursion1 // $ExpectType Type<Recursion1, Recursion1, unknown>

//
// literal
//

const Literal1 = t.literal('a') // $ExpectType LiteralC<"a">
export type Literal1TypeTest = t.TypeOf<typeof Literal1> // $ExpectType "a"
export type Literal1OutputTest = t.OutputOf<typeof Literal1> // $ExpectType "a"

//
// keyof
//

const Keyof1 = t.keyof({ a: true, b: true }) // $ExpectType KeyofC<{ a: boolean; b: boolean; }>
export type Keyof1TypeTest = t.TypeOf<typeof Keyof1> // $ExpectType "a" | "b"
export type Keyof1OutputTest = t.OutputOf<typeof Keyof1> // $ExpectType "a" | "b"

//
// refinement
//

const Refinement1 = t.refinement(t.number, (n) => n % 2 === 0) // $ExpectType RefinementC<NumberC, number>
export type Refinement1TypeTest = t.TypeOf<typeof Refinement1> // $ExpectType number
export type Refinement1OutputTest = t.OutputOf<typeof Refinement1> // $ExpectType number

const Refinement2 = t.refinement(NumberFromString, (n) => n % 2 === 0) // $ExpectType RefinementC<Type<number, string, unknown>, number>
export type Refinement2TypeTest = t.TypeOf<typeof Refinement2> // $ExpectType number
export type Refinement2OutputTest = t.OutputOf<typeof Refinement2> // $ExpectType string

type Int = number & { __brand__: 'Int' }

// $ExpectType RefinementC<NumberC, Int>
t.refinement(t.number, (n): n is Int => Number.isInteger(n), 'Int')

// $ExpectType RefinementC<NumberC, number>
t.refinement(t.number, Number.isInteger, 'Integer')

//
// array
//

const Array1 = t.array(t.number) // $ExpectType ArrayC<NumberC>
export type Array1TypeTest = t.TypeOf<typeof Array1> // $ExpectType number[]
export type Array1OutputTest = t.OutputOf<typeof Array1> // $ExpectType number[]

const Array2 = t.array(NumberFromString) // $ExpectType ArrayC<Type<number, string, unknown>>
export type Array2TypeTest = t.TypeOf<typeof Array2> // $ExpectType number[]
export type Array2OutputTest = t.OutputOf<typeof Array2> // $ExpectType string[]

//
// type
//

const Type1 = t.type({ a: t.string, b: t.number }) // $ExpectType TypeC<{ a: StringC; b: NumberC; }>
export type Type1TypeTest = Equals<t.TypeOf<typeof Type1>, { a: string; b: number }> // $ExpectType "T"
export type Type1OutputTest = Equals<t.OutputOf<typeof Type1>, { a: string; b: number }> // $ExpectType "T"

const Type2 = t.type({ a: t.type({ b: t.string }) }) // $ExpectType TypeC<{ a: TypeC<{ b: StringC; }>; }>
export type Type2TypeTest = Equals<t.TypeOf<typeof Type2>, { a: { b: string } }> // $ExpectType "T"
export type Type2OutputTest = Equals<t.OutputOf<typeof Type2>, { a: { b: string } }> // $ExpectType "T"

const Type3 = t.type({ a: NumberFromString }) // $ExpectType TypeC<{ a: Type<number, string, unknown>; }>
export type Type3TypeTest = Equals<t.TypeOf<typeof Type3>, { a: number }> // $ExpectType "T"
export type Type3OutputTest = Equals<t.OutputOf<typeof Type3>, { a: string }> // $ExpectType "T"

//
// record
//

const Record1 = t.record(t.keyof({ a: true }), t.number) // $ExpectType RecordC<KeyofC<{ a: boolean; }>, NumberC>
export type Record1TypeTest = Equals<t.TypeOf<typeof Record1>, { [K in 'a']: number }> // $ExpectType "T"
export type Record1OutputTest = Equals<t.OutputOf<typeof Record1>, { [K in 'a']: number }> // $ExpectType "T"

const Record2 = t.record(t.string, NumberFromString) // $ExpectType RecordC<StringC, Type<number, string, unknown>>
export type Record2TypeTest = Equals<t.TypeOf<typeof Record2>, { [K in string]: number }> // $ExpectType "T"
export type Record2OutputTest = Equals<t.OutputOf<typeof Record2>, { [K in string]: string }> // $ExpectType "T"

//
// union
//

// @ts-expect-error
t.union([])

// @ts-expect-error
t.union([t.boolean])

const Union2 = t.union([t.boolean, t.number]) // $ExpectType UnionC<[BooleanC, NumberC]>
export type Union2TypeTest = t.TypeOf<typeof Union2> // $ExpectType number | boolean
export type Union2OutputTest = t.OutputOf<typeof Union2> // $ExpectType number | boolean

const Union3 = t.union([t.boolean, NumberFromString]) // $ExpectType UnionC<[BooleanC, Type<number, string, unknown>]>
export type Union3TypeTest = t.TypeOf<typeof Union3> // $ExpectType number | boolean
export type Union3OutputTest = t.OutputOf<typeof Union3> // $ExpectType string | boolean

//
// intersection
//

const Intersection2 = t.intersection([t.type({ a: t.number }), t.type({ b: t.string })]) // $ExpectType IntersectionC<[TypeC<{ a: NumberC; }>, TypeC<{ b: StringC; }>]>
export type Intersection2TypeTest = Equals<t.TypeOf<typeof Intersection2>, { a: number; b: string }> // $ExpectType "T"
export type Intersection2OutputTest = Equals<t.OutputOf<typeof Intersection2>, { a: number; b: string }> // $ExpectType "T"

const Intersection3 = t.intersection([t.type({ a: t.number }), t.type({ b: t.string }), t.type({ c: t.boolean })])
export const Intersection3Test = Intersection3 // $ExpectType IntersectionC<[TypeC<{ a: NumberC; }>, TypeC<{ b: StringC; }>, TypeC<{ c: BooleanC; }>]>
export type Intersection3TypeTest = Equals<t.TypeOf<typeof Intersection3>, { a: number; b: string; c: boolean }> // $ExpectType "T"
export type Intersection23OutputTest = Equals<t.OutputOf<typeof Intersection3>, { a: number; b: string; c: boolean }> // $ExpectType "T"

const Intersection4 = t.intersection([
  t.type({ a: t.number }),
  t.type({ b: t.string }),
  t.type({ c: t.boolean }),
  t.type({ d: t.null })
])
export const Intersection4Test = Intersection4 // $ExpectType IntersectionC<[TypeC<{ a: NumberC; }>, TypeC<{ b: StringC; }>, TypeC<{ c: BooleanC; }>, TypeC<{ d: NullC; }>]>
// $ExpectType "T"
export type Intersection4TypeTest = Equals<
  t.TypeOf<typeof Intersection4>,
  { a: number; b: string; c: boolean; d: null }
>
// $ExpectType "T"
export type Intersection43OutputTest = Equals<
  t.OutputOf<typeof Intersection4>,
  { a: number; b: string; c: boolean; d: null }
>

const Intersection5 = t.intersection([
  t.type({ a: t.number }),
  t.type({ b: t.string }),
  t.type({ c: t.boolean }),
  t.type({ d: t.null }),
  t.type({ e: t.undefined })
])
export const Intersection5Test = Intersection5 // $ExpectType IntersectionC<[TypeC<{ a: NumberC; }>, TypeC<{ b: StringC; }>, TypeC<{ c: BooleanC; }>, TypeC<{ d: NullC; }>, TypeC<{ e: UndefinedC; }>]>
interface ExpectedIntersection5TypeTest {
  a: number
  b: string
  c: boolean
  d: null
  e: undefined
}
export type Intersection5TypeTest = Equals<t.TypeOf<typeof Intersection5>, ExpectedIntersection5TypeTest> // $ExpectType "T"
interface ExpectedIntersection53OutputTest {
  a: number
  b: string
  c: boolean
  d: null
  e: undefined
}
export type Intersection53OutputTest = Equals<t.OutputOf<typeof Intersection5>, ExpectedIntersection53OutputTest> // $ExpectType "T"

const Intersection6 = t.intersection([t.type({ a: NumberFromString }), t.type({ b: t.string })]) // $ExpectType IntersectionC<[TypeC<{ a: Type<number, string, unknown>; }>, TypeC<{ b: StringC; }>]>
export type Intersection6TypeTest = Equals<t.TypeOf<typeof Intersection6>, { a: number; b: string }> // $ExpectType "T"
export type Intersection6OutputTest = Equals<t.OutputOf<typeof Intersection6>, { a: string; b: string }> // $ExpectType "T"

// @ts-expect-error
t.intersection([t.string, t.string, t.string, t.string, t.string, t.string])

declare function testIntersectionInput<T>(x: t.Type<Record<keyof T, string>, any, unknown>): void
declare function testIntersectionOuput<T>(x: t.Type<any, Record<keyof T, string>, unknown>): void
const QueryString = t.intersection([
  t.type({
    a: t.string
  }),
  t.type({
    b: t.number
  })
])
// @ts-expect-error
testIntersectionInput(QueryString)
// @ts-expect-error
testIntersectionOuput(QueryString)

const IntersectionWithPrimitive = t.intersection([
  t.number,
  t.type({
    a: t.literal('a')
  })
])

export type IntersectionWithPrimitiveTest = Equals<t.TypeOf<typeof IntersectionWithPrimitive>, number & { a: 'a' }> // $ExpectType "T"

//
// tuple
//

// @ts-expect-error
t.tuple([])

const Tuple2 = t.tuple([t.string]) // $ExpectType TupleC<[StringC]>
export type Tuple2TypeTest = t.TypeOf<typeof Tuple2> // $ExpectType [string]
export type Tuple2OutputTest = t.OutputOf<typeof Tuple2> // $ExpectType [string]

const Tuple3 = t.tuple([t.string, t.number]) // $ExpectType TupleC<[StringC, NumberC]>
export type Tuple3TypeTest = t.TypeOf<typeof Tuple3> // $ExpectType [string, number]
export type Tuple3OutputTest = t.OutputOf<typeof Tuple3> // $ExpectType [string, number]

const Tuple4 = t.tuple([t.string, NumberFromString]) // $ExpectType TupleC<[StringC, Type<number, string, unknown>]>
export type Tuple4TypeTest = t.TypeOf<typeof Tuple4> // $ExpectType [string, number]
export type Tuple4OutputTest = t.OutputOf<typeof Tuple4> // $ExpectType [string, string]

const Tuple5 = t.tuple([t.string, t.number, t.boolean]) // $ExpectType TupleC<[StringC, NumberC, BooleanC]>
export type Tuple5TypeTest = t.TypeOf<typeof Tuple5> // $ExpectType [string, number, boolean]
export type Tuple5OutputTest = t.OutputOf<typeof Tuple5> // $ExpectType [string, number, boolean]

const Tuple6 = t.tuple([t.string, t.number, t.boolean, t.null]) // $ExpectType TupleC<[StringC, NumberC, BooleanC, NullC]>
export type Tuple6TypeTest = t.TypeOf<typeof Tuple6> // $ExpectType [string, number, boolean, null]
export type Tuple6OutputTest = t.OutputOf<typeof Tuple6> // $ExpectType [string, number, boolean, null]

const Tuple7 = t.tuple([t.string, t.number, t.boolean, t.null, t.undefined]) // $ExpectType TupleC<[StringC, NumberC, BooleanC, NullC, UndefinedC]>
export type Tuple7TypeTest = t.TypeOf<typeof Tuple7> // $ExpectType [string, number, boolean, null, undefined]
export type Tuple7OutputTest = t.OutputOf<typeof Tuple7> // $ExpectType [string, number, boolean, null, undefined]

// @ts-expect-error
t.tuple([t.string, t.string, t.string, t.string, t.string, t.string])

//
// partial
//

const Partial1 = t.partial({ a: t.string, b: t.number }) // $ExpectType PartialC<{ a: StringC; b: NumberC; }>
export type Partial1TypeTest = Equals<t.TypeOf<typeof Partial1>, { a?: string; b?: number }> // $ExpectType "T"
export type Partial1OutputTest = Equals<t.OutputOf<typeof Partial1>, { a?: string; b?: number }> // $ExpectType "T"

const Partial2 = t.partial({ a: t.string, b: NumberFromString }) // $ExpectType PartialC<{ a: StringC; b: Type<number, string, unknown>; }>
export type Partial2TypeTest = Equals<t.TypeOf<typeof Partial2>, { a?: string; b?: number }> // $ExpectType "T"
export type Partial2OutputTest = Equals<t.OutputOf<typeof Partial2>, { a?: string; b?: string }> // $ExpectType "T"

//
// readonly
//

const Readonly1 = t.readonly(t.type({ a: t.number })) // $ExpectType ReadonlyC<TypeC<{ a: NumberC; }>>
export type Readonly1TypeTest = Equals<t.TypeOf<typeof Readonly1>, { readonly a: number }> // $ExpectType "T"
export type Readonly1OutputTest = Equals<t.OutputOf<typeof Readonly1>, { readonly a: number }> // $ExpectType "T"

const Readonly2 = t.readonly(t.type({ a: NumberFromString })) // $ExpectType ReadonlyC<TypeC<{ a: Type<number, string, unknown>; }>>
export type Readonly2TypeTest = Equals<t.TypeOf<typeof Readonly2>, { readonly a: number }> // $ExpectType "T"
export type Readonly2OutputTest = Equals<t.OutputOf<typeof Readonly2>, { readonly a: string }> // $ExpectType "T"

const Readonly3 = t.readonly(t.tuple([t.string, NumberFromString]))
export type Readonly3TypeTest = Equals<t.TypeOf<typeof Readonly3>, Readonly<[string, number]>> // $ExpectType "T"
export type Readonly3OutputTest = Equals<t.OutputOf<typeof Readonly3>, Readonly<[string, string]>> // $ExpectType "T"

//
// readonlyArray
//

const ReadonlyArray1 = t.readonlyArray(t.number)
export type ReadonlyArray1TypeTest = t.TypeOf<typeof ReadonlyArray1> // $ExpectType ReadonlyArray<number>
export type ReadonlyArray1OutputTest = t.OutputOf<typeof ReadonlyArray1> // $ExpectType ReadonlyArray<number>

const ReadonlyArray2 = t.readonlyArray(NumberFromString)
export type ReadonlyArray2TypeTest = t.TypeOf<typeof ReadonlyArray2> // $ExpectType ReadonlyArray<number>
export type ReadonlyArray2OutputTest = t.OutputOf<typeof ReadonlyArray2> // $ExpectType ReadonlyArray<string>

//
// strict
//

const Strict1 = t.strict({ a: t.string, b: t.number }) // $ExpectType ExactC<TypeC<{ a: StringC; b: NumberC; }>>
export type Strict1TypeTest = Equals<t.TypeOf<typeof Strict1>, { a: string; b: number }> // $ExpectType "T"
export type Strict1OutputTest = Equals<t.OutputOf<typeof Strict1>, { a: string; b: number }> // $ExpectType "T"

const Strict2 = t.strict({ a: t.strict({ b: t.string }) }) // $ExpectType ExactC<TypeC<{ a: ExactC<TypeC<{ b: StringC; }>>; }>>
export type Strict2TypeTest = Equals<t.TypeOf<typeof Strict2>, { a: { b: string } }> // $ExpectType "T"
export type Strict2OutputTest = Equals<t.OutputOf<typeof Strict2>, { a: { b: string } }> // $ExpectType "T"

const Strict3 = t.strict({ a: NumberFromString }) // $ExpectType ExactC<TypeC<{ a: Type<number, string, unknown>; }>>
export type Strict3TypeTest = Equals<t.TypeOf<typeof Strict3>, { a: number }> // $ExpectType "T"
export type Strict3OutputTest = Equals<t.OutputOf<typeof Strict3>, { a: string }> // $ExpectType "T"

//
// tagged unions
//

const TaggedUnion1 = t.taggedUnion('type', [
  t.type({ type: t.literal('a'), a: t.number }),
  t.type({ type: t.literal('b') })
])
export const TaggedUnion1Type = TaggedUnion1 // $ExpectType TaggedUnionC<"type", [TypeC<{ type: LiteralC<"a">; a: NumberC; }>, TypeC<{ type: LiteralC<"b">; }>]>
export type TaggedUnion1TypeTest = Equals<t.TypeOf<typeof TaggedUnion1>, { type: 'a'; a: number } | { type: 'b' }> // $ExpectType "T"
export type TaggedUnion1OutputTest = Equals<t.OutputOf<typeof TaggedUnion1>, { type: 'a'; a: number } | { type: 'b' }> // $ExpectType "T"

interface TaggedUnion2_A {
  type: 'a'
  b: TaggedUnion2_B | undefined
}

interface TaggedUnion2_B {
  type: 'b'
  a: TaggedUnion2_A | undefined
}

const TaggedUnion2_A: t.RecursiveType<any, TaggedUnion2_A> = t.recursion<TaggedUnion2_A>('TaggedUnion2_A', (_) =>
  t.type({
    type: t.literal('a'),
    b: t.union([TaggedUnion2_B, t.undefined])
  })
)

const TaggedUnion2_B: t.RecursiveType<any, TaggedUnion2_B> = t.recursion<TaggedUnion2_B>('TaggedUnion2_B', (_) =>
  t.type({
    type: t.literal('b'),
    a: t.union([TaggedUnion2_A, t.undefined])
  })
)

const TaggedUnion2 = t.taggedUnion('type', [TaggedUnion2_A, TaggedUnion2_B])
export type TaggedUnion2TypeTest = Equals<t.TypeOf<typeof TaggedUnion2>, TaggedUnion2_A | TaggedUnion2_B> // $ExpectType "T"
export type TaggedUnion2OutputTest = Equals<t.OutputOf<typeof TaggedUnion2>, TaggedUnion2_A | TaggedUnion2_B> // $ExpectType "T"

//
// exact
//

const Exact1 = t.exact(t.type({ a: t.number })) // $ExpectType ExactC<TypeC<{ a: NumberC; }>>
export type Exact1TypeTest = Equals<t.TypeOf<typeof Exact1>, { a: number }> // $ExpectType "T"
export type Exact1OutputTest = Equals<t.OutputOf<typeof Exact1>, { a: number }> // $ExpectType "T"

const Exact2 = t.exact(t.type({ a: NumberFromString })) // $ExpectType ExactC<TypeC<{ a: Type<number, string, unknown>; }>>
export type Exact2TypeTest = Equals<t.TypeOf<typeof Exact2>, { a: number }> // $ExpectType "T"
export type Exact2OutputTest = Equals<t.OutputOf<typeof Exact2>, { a: string }> // $ExpectType "T"

//
// clean / alias
//

const C1 = t.type({
  a: t.string,
  b: NumberFromString
})

interface C1 {
  a: string
  b: number
}

interface C1O {
  a: string
  b: string
}

interface C1WithAdditionalProp extends C1 {
  c: boolean
}

// @ts-expect-error
export const C2 = t.clean<C1>(C1)
// @ts-expect-error
export const C3 = t.clean<C1WithAdditionalProp, C1O>(C1)
const C4 = t.clean<C1, C1O>(C1)
export type CleanTest1 = t.TypeOf<typeof C4> // $ExpectType C1
export type CleanTest2 = t.OutputOf<typeof C4> // $ExpectType C1O

const C5 = t.alias(C1)<C1>()
export type AliasTest1 = t.TypeOf<typeof C5> // $ExpectType C1
export type AliasTest2 = t.OutputOf<typeof C5>['a'] // $ExpectType string
export type AliasTest3 = t.OutputOf<typeof C5>['b'] // $ExpectType string
// @ts-expect-error
export const C6 = t.alias(C1)<C1, C1>()
// // @ts-expect-error
// bug fix: 647 const C7 = t.alias(C1)<C1WithAdditionalProp, C1O>()
const C8 = t.alias(C1)<C1, C1O>()
export type AliasTest4 = t.TypeOf<typeof C8> // $ExpectType C1
export type AliasTest5 = t.OutputOf<typeof C8> // $ExpectType C1O

//
// miscellanea
//

interface GenerableProps {
  [key: string]: Generable
}
type GenerableInterface = t.InterfaceType<GenerableProps>
type GenerableStrict = t.StrictType<GenerableProps>
type GenerablePartials = t.PartialType<GenerableProps>
interface GenerableRecord extends t.DictionaryType<Generable, Generable> {}
interface GenerableRefinement extends t.RefinementType<Generable> {}
interface GenerableArray extends t.ArrayType<Generable> {}
interface GenerableUnion extends t.UnionType<Array<Generable>> {}
interface GenerableIntersection extends t.IntersectionType<Array<Generable>> {}
interface GenerableTuple extends t.TupleType<Array<Generable>> {}
interface GenerableReadonly extends t.ReadonlyType<Generable> {}
interface GenerableReadonlyArray extends t.ReadonlyArrayType<Generable> {}
interface GenerableRecursive extends t.RecursiveType<Generable> {}
type Generable =
  | t.StringC
  | t.NumberC
  | t.BooleanType
  | GenerableInterface
  | GenerableRefinement
  | GenerableArray
  | GenerableStrict
  | GenerablePartials
  | GenerableRecord
  | GenerableUnion
  | GenerableIntersection
  | GenerableTuple
  | GenerableReadonly
  | GenerableReadonlyArray
  | t.LiteralType<any>
  | t.KeyofType<any>
  | GenerableRecursive
  | t.UndefinedType

function f(generable: Generable): string {
  switch (generable._tag) {
    case 'InterfaceType':
      return Object.keys(generable.props)
        .map((k) => f(generable.props[k]))
        .join('/')
    case 'StringType':
      return 'StringC'
    case 'NumberType':
      return 'StringC'
    case 'BooleanType':
      return 'BooleanType'
    case 'RefinementType':
      return f(generable.type)
    case 'ArrayType':
      return 'ArrayType'
    case 'StrictType':
      return 'StrictType'
    case 'PartialType':
      return 'PartialType'
    case 'DictionaryType':
      return 'DictionaryType'
    case 'UnionType':
      return 'UnionType'
    case 'IntersectionType':
      return 'IntersectionType'
    case 'TupleType':
      return generable.types.map(f).join('/')
    case 'ReadonlyType':
      return 'ReadonlyType'
    case 'ReadonlyArrayType':
      return 'ReadonlyArrayType'
    case 'LiteralType':
      return 'LiteralType'
    case 'KeyofType':
      return 'KeyofType'
    case 'RecursiveType':
      return f(generable.type)
    case 'UndefinedType':
      return 'UndefinedType'
  }
}

const schema = t.type({
  a: t.string,
  b: t.union([
    t.partial({
      c: t.string,
      d: t.literal('eee')
    }),
    t.boolean
  ]),
  e: t.intersection([
    t.type({
      f: t.array(t.string)
    }),
    t.type({
      g: t.union([t.literal('toto'), t.literal('tata')])
    })
  ])
})

f(schema) // OK!

interface Rec {
  a: number
  b: Rec | undefined
}

const Rec = t.recursion<Rec, Rec, t.mixed, GenerableInterface>('T', (self) =>
  t.type({
    a: t.number,
    b: t.union([self, t.undefined])
  })
)

f(Rec) // OK!

// ----------------

export function interfaceWithOptionals<RequiredProps extends t.Props, OptionalProps extends t.Props>(
  required: RequiredProps,
  optional: OptionalProps,
  name?: string
): t.IntersectionC<[t.TypeC<RequiredProps>, t.PartialC<OptionalProps>]> {
  return t.intersection([t.type(required), t.partial(optional)], name)
}

// ----------------

export function maybe<RT extends t.Any>(
  type: RT,
  name?: string
): t.UnionType<[RT, t.NullType], t.TypeOf<RT> | null, t.OutputOf<RT> | null, t.InputOf<RT> | null> {
  return t.union<[RT, t.NullType]>([type, t.null], name)
}

// ----------------

// tslint:disable-next-line:strict-export-declare-modifiers
declare function withValidation<L, A>(
  type: t.Type<A>,
  f: (errors: t.Errors) => L,
  fa: TaskEither<L, A>
): TaskEither<L, A>

// tslint:disable-next-line:void-return
declare const fa: TaskEither<string, void>

withValidation(t.void, () => 'validation error', fa)

//
// brand
//

interface PositiveBrand {
  readonly Positive: unique symbol
}

export const PositiveBad = t.brand(
  t.number,
  // @ts-expect-error
  (n): n is t.Branded<number, PositiveBrand> => n > 0,
  'Bad' // name doesn't match
)

const Positive = t.brand(t.number, (n): n is t.Branded<number, PositiveBrand> => n > 0, 'Positive') // $ExpectType BrandC<NumberC, PositiveBrand>

const PositiveInt = t.intersection([t.Int, Positive])

const Person = t.type({
  name: t.string,
  age: PositiveInt
})

type Person = t.TypeOf<typeof Person> // $ExpectType { name: string; age: number & Brand<IntBrand> & Brand<PositiveBrand>; }

// @ts-expect-error
export const person: Person = { name: 'name', age: -1.2 }

interface IntBrand2 {
  readonly Int: unique symbol
}

const Int2 = t.brand(t.number, (n): n is t.Branded<number, IntBrand2> => Number.isInteger(n), 'Int')
type Int2 = t.TypeOf<typeof Int2> // $ExpectType Branded<number, IntBrand2>

// should be possible to convert a branded type to its carrier type
export const toNumber = (n: t.Int): number => n

// @ts-expect-error
export const intToInt2 = (int: t.Int): Int2 => int

//
// UnknownRecord
//

// @ts-expect-error
export const ur1: Record<string, unknown> = [1, 2, 3]
// @ts-expect-error
export const ur2: Record<string, unknown> = new Date()
// @ts-expect-error
export const ur3: Record<string, unknown> = new Number()
// @ts-expect-error
export const ur4: Record<string, unknown> = new String()
// @ts-expect-error
export const ur5: Record<string, unknown> = new Boolean()
