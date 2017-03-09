import * as t from '../src'
import { TypeOf } from '../src'

//
// literal
//

const L1 = t.literal('a')
// $ExpectError Type '"s"' is not assignable to type '"a"'
const x1: TypeOf<typeof L1> = 's'
const x2: TypeOf<typeof L1> = 'a'

//
// keyof
//

const K1 = t.keyof({ a: true, b: true })
// $ExpectError Type '"s"' is not assignable to type '"a" | "b"'
const x3: TypeOf<typeof K1> = 's'
const x4: TypeOf<typeof K1> = 'a'
const x5: TypeOf<typeof K1> = 'b'

//
// default types
//

// $ExpectError Type 'undefined' cannot be converted to type 'null'
;(undefined as TypeOf<typeof t.null>)
;(null as TypeOf<typeof t.null>)

// $ExpectError Type 'null' cannot be converted to type 'undefined'
;(null as TypeOf<typeof t.undefined>)
;(undefined as TypeOf<typeof t.undefined>)

// $ExpectError Type 'number' cannot be converted to type 'string'
;(1 as TypeOf<typeof t.string>)
;('s' as TypeOf<typeof t.string>)

//
// refinement
//

const R1 = t.refinement(t.number, n => n % 2 === 0)
// $ExpectError Type 'string' cannot be converted to type 'number'
;('s' as TypeOf<typeof R1>)
;(2 as TypeOf<typeof R1>)

//
// array
//

const A1 = t.array(t.number)
// $ExpectError Type 'string' cannot be converted to type 'number[]'
;('s' as TypeOf<typeof A1>)
// $ExpectError Type 'string' is not comparable to type 'number'
;(['s'] as TypeOf<typeof A1>)
;([1] as TypeOf<typeof A1>)

//
// interface
//

const I1 = t.interface({ name: t.string, age: t.number })
// $ExpectError Property 'name' is missing in type '{}'
const x6: TypeOf<typeof I1> = {}
// $ExpectError Property 'age' is missing in type '{ name: string; }'
const x7: TypeOf<typeof I1> = { name: 'name' }
// $ExpectError Property 'name' is missing in type '{ age: number; }'
const x8: TypeOf<typeof I1> = { age: 43 }
const x9: TypeOf<typeof I1> = { name: 'name', age: 43 }

const I2 = t.interface({ name: t.string, father: t.interface({ surname: t.string }) })
// $ExpectError Property 'surname' is missing in type '{}'
const x10: TypeOf<typeof I2> = { name: 'name', father: {} }
const x11: TypeOf<typeof I2> = { name: 'name', father: { surname: 'surname' } }

//
// dictionary
//

const D1 = t.dictionary(t.string, t.number)
// $ExpectError Type 'string' is not assignable to type 'number'
const x12: TypeOf<typeof D1> = { a: 's' }
const x13: TypeOf<typeof D1> = { a: 1 }

//
// union
//

const U1 = t.union([t.string, t.number])
// $ExpectError Type 'true' is not assignable to type 'string | number'
const x14: TypeOf<typeof U1> = true
const x15: TypeOf<typeof U1> = 's'
const x16: TypeOf<typeof U1> = 1

//
// intersection
//

const IN1 = t.intersection([t.interface({ a: t.number }), t.interface({ b: t.string })])
// $ExpectError Property 'b' is missing in type '{ a: number; }'
const x17: TypeOf<typeof IN1> = { a: 1 }
const x18: TypeOf<typeof IN1> = { a: 1, b: 's' }

//
// tuple
//

const T1 = t.tuple([t.string, t.number])
// $ExpectError Type 'boolean' is not assignable to type 'number'
const x19: TypeOf<typeof T1> = ['s', true]
const x20: TypeOf<typeof T1> = ['s', 1]

//
// partial
//

const P1 = t.partial({ name: t.string })
// $ExpectError Type 'number' is not assignable to type 'string | undefined'
const x21: TypeOf<typeof P1> = { name: 1 }
const x22: TypeOf<typeof P1> = {}
const x23: TypeOf<typeof P1> = { name: 's' }

//
// readonly
//

const RO1 = t.readonly(t.interface({ name: t.string }))
const x24: TypeOf<typeof RO1> = { name: 's' }
// $ExpectError Cannot assign to 'name' because it is a constant or a read-only property
x24.name = 's2'
// $ExpectError Type 'number' is not assignable to type 'string'
const x25: TypeOf<typeof RO1> = { name: 1 }

//
// readonlyArray
//

const ROA1 = t.readonlyArray(t.number)
// $ExpectError Type 'string' is not assignable to type 'number'
const x26: TypeOf<typeof ROA1> = ['s']
const x27: TypeOf<typeof ROA1> = [1]
// $ExpectError Index signature in type 'ReadonlyArray<number>' only permits reading
x27[0] = 2
// $ExpectError Property 'push' does not exist on type 'ReadonlyArray<number>'
x27.push(2)

//
// fold on unions
//

const f1 = t.union([t.string, t.number])
  .fold(
    s => s.length,
    n => n
  )
f1('a')
f1(1)
// $ExpectError Argument of type 'true' is not assignable to parameter of type 'string | number'
f1(true)
