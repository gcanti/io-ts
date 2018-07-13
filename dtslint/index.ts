import * as t from '../src'

//
// recursion
//

interface RecT1 {
  type: 'a'
  items: Array<RecT1>
}

const Rec1 = t.recursion<RecT1>('T', Self =>
  t.interface({
    type: t.literal('a'),
    items: t.array(Self)
  })
)

// $ExpectError
const Rec2 = t.recursion<string>('T', Self =>
  t.interface({
    type: t.literal('a'),
    items: t.array(Self)
  })
)

//
// literal
//

const L1 = t.literal('a')
type Assert1 = t.TypeOf<typeof L1> // $ExpectType "a"

//
// keyof
//

const K1 = t.keyof({ a: true, b: true })
type Assert2 = t.TypeOf<typeof K1> // $ExpectType "a" | "b"

//
// default types
//

type Assert3 = t.TypeOf<typeof t.null> // $ExpectType null

type Assert4 = t.TypeOf<typeof t.undefined> // $ExpectType undefined

type Assert5 = t.TypeOf<typeof t.string> // $ExpectType string

//
// refinement
//

const R1 = t.refinement(t.number, n => n % 2 === 0)
type Assert6 = t.TypeOf<typeof R1> // $ExpectType number

//
// array
//

const A1 = t.array(t.number)
type Assert7 = t.TypeOf<typeof A1> // $ExpectType number[]

//
// interface
//

const I1 = t.interface({ name: t.string, age: t.number })
type Assert8 = t.TypeOf<typeof I1> // $ExpectType TypeOfProps<{ name: StringType; age: NumberType; }>
// $ExpectError
const x6: t.TypeOf<typeof I1> = {}
// $ExpectError
const x7: t.TypeOf<typeof I1> = { name: 'name' }
// $ExpectError
const x8: t.TypeOf<typeof I1> = { age: 43 }
const x9: t.TypeOf<typeof I1> = { name: 'name', age: 43 }

const I2 = t.interface({ name: t.string, father: t.interface({ surname: t.string }) })
type I2T = t.TypeOf<typeof I2>
// $ExpectError
const x10: I2T = { name: 'name', father: {} }
const x11: I2T = { name: 'name', father: { surname: 'surname' } }

//
// dictionary
//

const D1 = t.dictionary(t.keyof({ a: true }), t.number)
type Assert9 = t.TypeOf<typeof D1> // $ExpectType TypeOfDictionary<KeyofType<{ a: true; }>, NumberType>
// $ExpectError
const x12: t.TypeOf<typeof D1> = { a: 's' }
// $ExpectError
const x12_2: t.TypeOf<typeof D1> = { c: 1 }
const x13: t.TypeOf<typeof D1> = { a: 1 }

//
// union
//

const U1 = t.union([t.string, t.number])
type Assert10 = t.TypeOf<typeof U1> // $ExpectType string | number

//
// intersection
//

const IN1 = t.intersection([t.string, t.number])
type Assert11 = t.TypeOf<typeof IN1> // $ExpectType string & number
const IN2 = t.intersection([t.interface({ a: t.number }), t.interface({ b: t.string })])
type Assert12 = t.TypeOf<typeof IN2> // $ExpectType TypeOfProps<{ a: NumberType; }> & TypeOfProps<{ b: StringType; }>
// $ExpectError
const x17: t.TypeOf<typeof IN2> = { a: 1 }
const x18: t.TypeOf<typeof IN2> = { a: 1, b: 's' }

//
// tuple
//

const T1 = t.tuple([t.string, t.number])
type Assert13 = t.TypeOf<typeof T1> // $ExpectType [string, number]

//
// partial
//

const P1 = t.partial({ name: t.string })
type Assert14 = t.TypeOf<typeof P1> // $ExpectType TypeOfPartialProps<{ name: StringType; }>
type P1T = t.TypeOf<typeof P1>
// $ExpectError
const x21: P1T = { name: 1 }
const x22: P1T = {}
const x23: P1T = { name: 's' }

//
// readonly
//

const RO1 = t.readonly(t.interface({ name: t.string }))
type Assert15 = t.TypeOf<typeof RO1> // $ExpectType Readonly<TypeOfProps<{ name: StringType; }>>
const x24: t.TypeOf<typeof RO1> = { name: 's' }
// $ExpectError
x24.name = 's2'
// $ExpectError
const x25: t.TypeOf<typeof RO1> = { name: 1 }

//
// readonlyArray
//

const ROA1 = t.readonlyArray(t.number)
type Assert16 = t.TypeOf<typeof ROA1> // $ExpectType ReadonlyArray<number>
// $ExpectError
const x26: t.TypeOf<typeof ROA1> = ['s']
const x27: t.TypeOf<typeof ROA1> = [1]
// $ExpectError
x27[0] = 2
// $ExpectError
x27.push(2)

//
// strict
//

const S1 = t.strict({ name: t.string })
type Assert17 = t.TypeOf<typeof S1> // $ExpectType TypeOfProps<{ name: StringType; }>
type TS1 = t.TypeOf<typeof S1>
const x32: TS1 = { name: 'Giulio' }
const x33input = { name: 'foo', foo: 'foo' }
const x33: TS1 = x33input
// $ExpectError
const S2 = t.strict(t.string)

//
// object
//

const O1 = t.object
type Assert18 = t.TypeOf<typeof O1> // $ExpectType object

//
// tagged unions
//

const TU1 = t.taggedUnion('type', [t.type({ type: t.literal('a') }), t.type({ type: t.literal('b') })])

interface TU2A1 {
  type: 'TU2A1'
  b: TU2B1 | undefined
}

interface TU2B1 {
  type: 'TU2B1'
  a: TU2A1 | undefined
}

const TU2A1: t.RecursiveType<any, TU2A1> = t.recursion<TU2A1>('TU2A1', _ =>
  t.interface({
    type: t.literal('TU2A1'),
    b: t.union([TU2B1, t.undefined])
  })
)

const TU2B1: t.RecursiveType<any, TU2B1> = t.recursion<TU2B1>('TU2B1', _ =>
  t.interface({
    type: t.literal('TU2B1'),
    a: t.union([TU2A1, t.undefined])
  })
)

const TU2 = t.taggedUnion('type', [TU2A1, TU2B1])

// $ExpectError
const TU3 = t.taggedUnion('type', [t.type({ type: t.literal('a') }), t.type({ bad: t.literal('b') })])
type Assert19 = t.TypeOf<typeof TU1> // $ExpectType TypeOfProps<{ type: LiteralType<"a">; }> | TypeOfProps<{ type: LiteralType<"b">; }>
// $ExpectError
const x36: t.TypeOf<typeof TU1> = true
const x37: t.TypeOf<typeof TU1> = { type: 'a' }
const x38: t.TypeOf<typeof TU1> = { type: 'b' }

//
// exact
//

declare const E1: t.InterfaceType<{ a: t.NumberType }, { a: number }, { a: number }, { a: number }>
const E2 = t.exact(E1) // $ExpectType ExactType<InterfaceType<{ a: NumberType; }, { a: number; }, { a: number; }, { a: number; }>, { a: number; }, { a: number; }, { a: number; }>

//
// clean / alias
//

import { DateFromNumber } from '../test/helpers'

const C1 = t.type({
  a: t.string,
  b: DateFromNumber
})

interface C1 {
  a: string
  b: Date
}

interface C1O {
  a: string
  b: number
}

interface C1WithAdditionalProp {
  a: string
  b: Date
  c: boolean
}

// $ExpectError
const C2 = t.clean<C1>(C1)
// $ExpectError
const C3 = t.clean<C1WithAdditionalProp, C1O>(C1)
const C4 = t.clean<C1, C1O>(C1) // $ExpectType Type<C1, C1O, mixed>
const C5 = t.alias(C1)<C1>() // $ExpectType InterfaceType<{ a: StringType; b: Type<Date, number, mixed>; }, C1, OutputOfProps<{ a: StringType; b: Type<Date, number, mixed>; }>, mixed>
// $ExpectError
const C6 = t.alias(C1)<C1, C1>()
// $ExpectError
const C7 = t.alias(C1)<C1WithAdditionalProp, C1O>()
const C8 = t.alias(C1)<C1, C1O>() // $ExpectType InterfaceType<{ a: StringType; b: Type<Date, number, mixed>; }, C1, C1O, mixed>

//
// combinators
//

interface GenerableProps {
  [key: string]: Generable
}
type GenerableInterface = t.InterfaceType<GenerableProps>
type GenerableStrict = t.StrictType<GenerableProps>
type GenerablePartials = t.PartialType<GenerableProps>
interface GenerableDictionary extends t.DictionaryType<Generable, Generable> {}
interface GenerableRefinement extends t.RefinementType<Generable> {}
interface GenerableArray extends t.ArrayType<Generable> {}
interface GenerableUnion extends t.UnionType<Array<Generable>> {}
interface GenerableIntersection extends t.IntersectionType<Array<Generable>> {}
interface GenerableTuple extends t.TupleType<Array<Generable>> {}
interface GenerableReadonly extends t.ReadonlyType<Generable> {}
interface GenerableReadonlyArray extends t.ReadonlyArrayType<Generable> {}
interface GenerableRecursive extends t.RecursiveType<Generable> {}
type Generable =
  | t.StringType
  | t.NumberType
  | t.BooleanType
  | GenerableInterface
  | GenerableRefinement
  | GenerableArray
  | GenerableStrict
  | GenerablePartials
  | GenerableDictionary
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
        .map(k => f(generable.props[k]))
        .join('/')
    case 'StringType':
      return 'StringType'
    case 'NumberType':
      return 'StringType'
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

const schema = t.interface({
  a: t.string,
  b: t.union([
    t.partial({
      c: t.string,
      d: t.literal('eee')
    }),
    t.boolean
  ]),
  e: t.intersection([
    t.interface({
      f: t.array(t.string)
    }),
    t.interface({
      g: t.union([t.literal('toto'), t.literal('tata')])
    })
  ])
})

f(schema) // OK!

interface Rec {
  a: number
  b: Rec | undefined
}

const Rec = t.recursion<Rec, Rec, t.mixed, GenerableInterface>('T', self =>
  t.interface({
    a: t.number,
    b: t.union([self, t.undefined])
  })
)

f(Rec) // OK!

export function interfaceWithOptionals<RequiredProps extends t.Props, OptionalProps extends t.Props>(
  required: RequiredProps,
  optional: OptionalProps,
  name?: string
): t.IntersectionType<
  [
    t.InterfaceType<RequiredProps, t.TypeOfProps<RequiredProps>>,
    t.PartialType<OptionalProps, t.TypeOfPartialProps<OptionalProps>>
  ],
  t.TypeOfProps<RequiredProps> & t.TypeOfPartialProps<OptionalProps>
> {
  return t.intersection([t.interface(required), t.partial(optional)], name)
}

export function maybe<RT extends t.Any>(
  type: RT,
  name?: string
): t.UnionType<[RT, t.NullType], t.TypeOf<RT> | null, t.OutputOf<RT> | null, t.InputOf<RT> | null> {
  return t.union<[RT, t.NullType]>([type, t.null], name)
}

const pluck = <F extends string, U extends t.UnionType<Array<t.InterfaceType<{ [K in F]: t.Mixed }>>>>(
  union: U,
  field: F
): t.Type<t.TypeOf<U>[F]> => {
  return t.union(union.types.map(type => type.props[field]))
}

export const Action = t.union([
  t.type({
    type: t.literal('Action1'),
    payload: t.type({
      foo: t.string
    })
  }),
  t.type({
    type: t.literal('Action2'),
    payload: t.type({
      bar: t.string
    })
  })
])

const ActionType = pluck(Action, 'type')
type Assert20 = t.TypeOf<typeof ActionType> // $ExpectType "Action1" | "Action2"

//
// void
//

import { TaskEither } from 'fp-ts/lib/TaskEither'

// tslint:disable-next-line:strict-export-declare-modifiers
declare function withValidation<L, A>(
  type: t.Type<A>,
  f: (errors: t.Errors) => L,
  fa: TaskEither<L, A>
): TaskEither<L, A>

// tslint:disable-next-line:void-return
declare const fa: TaskEither<string, void>

withValidation(t.void, () => 'validation error', fa)
