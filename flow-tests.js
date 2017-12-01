// @flow

import * as t from '.'
import { PathReporter } from './lib/PathReporter'

//
// Either
//
// $FlowFixMe
;(t.validate('a', t.string).fold(() => 'ko', () => 'ok'): number)
;(t.validate('a', t.string).fold(() => 'ko', () => 'ok'): string)

//
// refinements
//

type Integer = t.TypeOf<typeof t.Integer>

const int1: Integer = 1
// $FlowFixMe
const int2: Integer = 'foo'

//
// literals
//
const L1 = t.literal(('foo': 'foo'))
type L1T = t.TypeOf<typeof L1>
const l1: L1T = 'foo'
// $FlowFixMe
const l2: L1T = 'bar'

function testLiteralAsTagInUnion() {
  // Note that `t.literal(('foo': 'foo'))` does not work for this use case
  const Foo = t.type({
    type: (t.literal('foo'): t.Type<*, 'foo'>),
    foo: t.string
  })
  const Bar = t.type({
    type: (t.literal('bar'): t.Type<*, 'bar'>),
    bar: t.number
  })
  const FooOrBar = t.union([Foo, Bar])
  type FooOrBarT = t.TypeOf<typeof FooOrBar>

  // only passes type-checking if tag-based refinement works
  function getFoo(x: FooOrBarT): ?string {
    if (x.type === 'foo') {
      return x.foo
    }
  }
}

function testLiteralMismatch() {
  const LiteralMismatch = t.type({
    // $FlowFixMe
    type: (t.literal('sometag'): t.Type<*, 'differenttag'>)
  })
}

//
// keyof
//

const K1 = t.keyof({ a: true, b: true })
type K1T = t.TypeOf<typeof K1>
const k1: K1T = 'a'
const k2: K1T = 'b'
// $FlowFixMe
const k3: K1T = 'c'

//
// arrays
//
const A1 = t.array(t.number)
type A1T = t.TypeOf<typeof A1>
const a1: A1T = [1, 2, 3]
// $FlowFixMe
const a2: A1T = [1, 2, 'foo']

//
// interfaces
//

const Person = t.type({
  name: t.string,
  age: t.number
})

type PersonT = t.TypeOf<typeof Person>

const person1: PersonT = {
  name: 'foo',
  age: 43
}
const person2: PersonT = {
  name: 'foo',
  // $FlowFixMe
  age: 'bar'
}

//
// partials
//
const P1 = t.partial({
  foo: t.number
})
type P1T = t.TypeOf<typeof P1>
const p1: P1T = {}
const p2: P1T = { foo: 1 }
const p3: P1T = { foo: undefined }
// $FlowFixMe
const p4: P1T = { foo: 'foo' }

//
// dictionaries
//
const D1 = t.dictionary(t.string, t.number)
type D1T = t.TypeOf<typeof D1>
const d1: D1T = {}
const d2: D1T = { a: 1 }
const d3: D1T = { a: 1, b: 2 }
// $FlowFixMe
const d4: D1T = { a: 'foo' }
const D2 = t.dictionary(t.keyof({ a: true }), t.number)
type D2T = t.TypeOf<typeof D2>
const d5: D2T = {}
const d6: D2T = { a: 1 }
// $FlowFixMe
const d7: D2T = { a: 1, b: 2 }

//
// unions
//
const U1 = t.union([t.string, t.number])
type U1T = t.TypeOf<typeof U1>
const u1: U1T = 1
const u2: U1T = 'foo'
// $FlowFixMe
const u3: U1T = true

//
// intersections
//
const I1 = t.intersection([t.type({ a: t.string }), t.type({ b: t.number })])
type I1T = t.TypeOf<typeof I1>
const i1: I1T = { a: 'foo', b: 1 }
// $FlowFixMe
const i2: I1T = { a: 'foo' }

//
// tuples
//
const T1 = t.tuple([t.string, t.number])
type T1T = t.TypeOf<typeof T1>
const t1: T1T = ['foo', 1]
// $FlowFixMe
const t2: T1T = ['foo', true]
// $FlowFixMe
const t3: T1T = ['foo']
// $FlowFixMe
const t4: T1T = []

//
// readonly objects
//
const RO1 = t.readonly(t.type({ a: t.number }))
type RO1T = t.TypeOf<typeof RO1>
const ro1: RO1T = { a: 1 }
// $FlowFixMe
ro1.a = 2

//
// readonly arrays
//
const ROA1 = t.readonlyArray(t.number)
type ROA1T = t.TypeOf<typeof ROA1>
const roa1: ROA1T = [1, 2, 3]
// $FlowFixMe
roa1[0] = 2

//
// strict interfaces
//
const S1 = t.strict({ a: t.number })
type S1T = t.TypeOf<typeof S1>
const s1: S1T = { a: 1 }
// $FlowFixMe
const s2: S1T = { a: 1, b: 2 }

//
// validate
//
const validation = t.validate(1, t.number)
const result: string = validation.fold(() => 'error', () => 'ok')
const report = PathReporter.report(validation)
;(report: Array<string>)

function optional<A, RT: t.Type<any, A>>(type: RT, name?: string): t.UnionType<[RT, t.UndefinedType], A | void> {
  return t.union([type, t.undefined], name)
}

type GenerableProps = { +[key: string]: Generable }
type GenerableInterface = t.InterfaceType<GenerableProps, any>
type GenerableStrict = t.StrictType<GenerableProps, any>
type GenerablePartials = t.PartialType<GenerableProps, any>
type GenerableDictionary = t.DictionaryType<Generable, Generable, any>
type GenerableRefinement = t.RefinementType<Generable, any, any>
type GenerableArray = t.ArrayType<Generable, any>
type GenerableUnion = t.UnionType<Array<Generable>, any>
type GenerableIntersection = t.IntersectionType<Array<Generable>, any>
type GenerableTuple = t.TupleType<Array<Generable>, any>
type GenerableReadonly = t.ReadonlyType<Generable, any>
type GenerableReadonlyArray = t.ReadonlyArrayType<Generable, any>
type GenerableRecursive = t.RecursiveType<Generable, any>
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
  if (generable._tag === 'InterfaceType') {
    ;(generable: t.InterfaceType<any, any>)
  }
  switch (generable._tag) {
    case 'InterfaceType':
      const props = generable.props
      return Object.keys(props)
        .map(k => f(props[k]))
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
      return generable.types.map(type => f(type)).join('/')
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
  throw new Error('Impossible')
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

type RecT = {
  a: number,
  b: RecT | void
}

const Rec = t.recursion('T', self =>
  t.type({
    a: t.number,
    b: t.union([self, t.undefined])
  })
)

f(Rec) // OK!
