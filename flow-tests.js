// @flow

import * as t from '.'
import { PathReporter } from './lib/PathReporter'

//
// refinements
//

type Integer = t.TypeOf<typeof t.Integer>

const int1: Integer = 1
// $ExpectError
const int2: Integer = 'foo'

//
// literals
//
const L1 = t.literal(('foo': 'foo'))
type L1T = t.TypeOf<typeof L1>
const l1: L1T = 'foo'
// $ExpectError
const l2: L1T = 'bar'

//
// keyof
//

const K1 = t.keyof({ a: true, b: true })
type K1T = t.TypeOf<typeof K1>
const k1: K1T = 'a'
const k2: K1T = 'b'
// $ExpectError
const k3: K1T = 'c'

//
// arrays
//
const A1 = t.array(t.number)
type A1T = t.TypeOf<typeof A1>
const a1: A1T = [1, 2, 3]
// $ExpectError
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
  // $ExpectError
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
// $ExpectError
const p4: P1T = { foo: 'foo' }

//
// dictionaries
//
const D1 = t.dictionary(t.string, t.number)
type D1T = t.TypeOf<typeof D1>
const d1: D1T = {}
const d2: D1T = {a: 1}
const d3: D1T = {a: 1, b: 2}
// $ExpectError
const d4: D1T = {a: 'foo'}
const D2 = t.dictionary(t.keyof({a: true}), t.number)
type D2T = t.TypeOf<typeof D2>
const d5: D2T = {}
const d6: D2T = {a: 1}
// $ExpectError
const d7: D2T = {a: 1, b: 2}

//
// unions
//
const U1 = t.union([t.string, t.number])
type U1T = t.TypeOf<typeof U1>
const u1: U1T = 1
const u2: U1T = 'foo'
// $ExpectError
const u3: U1T = true

//
// intersections
//
const I1 = t.intersection([t.type({ a: t.string }), t.type({ b: t.number })])
type I1T = t.TypeOf<typeof I1>
const i1: I1T = { a: 'foo', b: 1 }
// $ExpectError
const i2: I1T = { a: 'foo' }

//
// tuples
//
const T1 = t.tuple([t.string, t.number])
type T1T = t.TypeOf<typeof T1>
const t1: T1T = ['foo', 1]
// $ExpectError
const t2: T1T = ['foo', true]
// $ExpectError
const t3: T1T = ['foo']
// $ExpectError
const t4: T1T = []

//
// readonly objects
//
const RO1 = t.readonly(t.type({ a: t.number }))
type RO1T = t.TypeOf<typeof RO1>
const ro1: RO1T = {a: 1}
// $ExpectError
ro1.a = 2

//
// readonly arrays
//
const ROA1 = t.readonlyArray(t.number)
type ROA1T = t.TypeOf<typeof ROA1>
const roa1: ROA1T = [1, 2, 3]
// $ExpectError
roa1[0] = 2

//
// strict interfaces
//
const S1 = t.strict({a: t.number})
type S1T = t.TypeOf<typeof S1>
const s1: S1T = {a: 1}
// $ExpectError
const s2: S1T = {a: 1, b: 2}

//
// validate
//
const validation = t.validate(1, t.number)
const result: string = validation.fold(() => 'error', () => 'ok')
const report = PathReporter.report(validation)
;(report: Array<string>)



