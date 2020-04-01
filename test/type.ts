import * as assert from 'assert'
import { fold } from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import * as t from '../src/index'
import { assertFailure, assertStrictEqual, assertSuccess, NumberFromString } from './helpers'

describe('type', () => {
  describe('name', () => {
    it('should assign a default name', () => {
      const T = t.type({ a: t.string })
      assert.strictEqual(T.name, '{ a: string }')
    })

    it('should accept a name', () => {
      const T = t.type({ a: t.string }, 'T')
      assert.strictEqual(T.name, 'T')
    })
  })

  const successCases = [
    // [ props, value ]
    [{ a: t.null }, { a: null }],
    [{ a: t.nullType }, { a: null }],
    [{ a: t.undefined }, { a: undefined }],
    [{ a: t.void }, { a: undefined }],
    [{ a: t.voidType }, { a: undefined }],
    [{ a: t.unknown }, { a: 'a' }],
    [{ a: t.unknown }, { a: undefined }],
    [{ a: t.string }, { a: 'a' }],
    [{ a: t.number }, { a: Number.MAX_VALUE }],
    [{ a: t.bigint }, { a: BigInt(Number.MAX_VALUE + 1), toJSON: () => `a: BigInt(Number.MAX_VALUE +1)` }],
    [{ a: t.boolean }, { a: true }],
    [{ a: t.UnknownArray }, { a: [[1], [2]] }],
    [{ a: t.UnknownArray }, { a: [] }],
    [{ a: t.UnknownArray }, { a: [undefined] }],
    [{ a: t.UnknownArray }, { a: [[undefined], [2]] }],
    [{ a: t.array(t.number) }, { a: [1, 2] }],
    [{ a: t.UnknownRecord }, { a: { b: 'b' } }],
    [{ a: t.UnknownRecord }, { a: {} }],
    [{ a: t.UnknownRecord }, { a: { undefined } }],
    [{ a: t.UnknownRecord }, { a: { b: undefined } }],
    [{ a: t.record(t.string, t.string) }, { a: { b: 'b' } }],
    [{ a: t.Int }, { a: -1 }],
    [{ a: t.literal('YES') }, { a: 'YES' }],
    [{ a: t.partial({ b: t.string, c: t.string }) }, { a: {} }],
    [{ a: t.partial({ b: t.string, c: t.string }) }, { a: { b: undefined, c: undefined } }],
    [{ a: t.readonly(t.number) }, { a: 1 }],
    [{ a: t.readonlyArray(t.number) }, { a: [1, 2] }],
    [{ a: t.type({ b: t.string, c: t.string }) }, { a: { b: 'b', c: 'c' } }],
    [{ a: t.tuple([t.string, t.string]) }, { a: ['A', 'B'] }],
    [
      { a: t.union([t.string, t.number]), b: t.union([t.string, t.number]) },
      { a: 1, b: 'b' }
    ],
    [{ a: t.intersection([t.number, t.Int]) }, { a: 1 }],
    [
      { a: t.brand(t.number, (n): n is t.Branded<number, { readonly Positive: unique symbol }> => n >= 0, 'Positive') },
      { a: 1 }
    ],
    [{ a: t.keyof({ foo: null, bar: null }) }, { a: 'foo' }],
    [{ a: t.exact(t.type({ x: t.number, y: t.number })) }, { a: { x: 1, y: 2, z: 3 } }],
    [{ a: t.strict({ x: t.number, y: t.number }) }, { a: { x: 1, y: 2, z: 3 } }]
  ]

  describe('`is` should return `true` for', () => {
    test.each(successCases)(`props %j given valid input %j`, (props, value) => {
      const T = t.type(props)
      assert.strictEqual(T.is(value), true)
    })
  })

  const failureCases = [
    // [ props, value, messages ]
    [{ a: t.null }, { a: 'a' }, ['Invalid value "a" supplied to : { a: null }/a: null']],
    [{ a: t.null }, {}, ['Invalid value undefined supplied to : { a: null }/a: null']],
    [{ a: t.null }, { a: undefined }, ['Invalid value undefined supplied to : { a: null }/a: null']],
    [{ a: t.nullType }, { a: 'a' }, ['Invalid value "a" supplied to : { a: null }/a: null']],
    [{ a: t.nullType }, {}, ['Invalid value undefined supplied to : { a: null }/a: null']],
    [{ a: t.nullType }, { a: undefined }, ['Invalid value undefined supplied to : { a: null }/a: null']],
    [{ a: t.undefined }, { a: 'a' }, ['Invalid value "a" supplied to : { a: undefined }/a: undefined']],
    [{ a: t.undefined }, {}, ['Invalid value undefined supplied to : { a: undefined }/a: undefined']],
    [{ a: t.void }, { a: 'a' }, ['Invalid value "a" supplied to : { a: void }/a: void']],
    [{ a: t.void }, {}, ['Invalid value undefined supplied to : { a: void }/a: void']],
    [{ a: t.voidType }, { a: 'a' }, ['Invalid value "a" supplied to : { a: void }/a: void']],
    [{ a: t.voidType }, {}, ['Invalid value undefined supplied to : { a: void }/a: void']],
    [{ a: t.unknown }, {}, ['Invalid value undefined supplied to : { a: unknown }/a: unknown']],
    [{ a: t.string }, 1, ['Invalid value 1 supplied to : { a: string }']],
    [{ a: t.string }, {}, ['Invalid value undefined supplied to : { a: string }/a: string']],
    [{ a: t.string }, { a: undefined }, ['Invalid value undefined supplied to : { a: string }/a: string']],
    [{ a: t.string }, { a: 1 }, ['Invalid value 1 supplied to : { a: string }/a: string']],
    [{ a: t.string }, [], ['Invalid value [] supplied to : { a: string }']], // #407
    [{ a: t.number }, { a: 'a' }, ['Invalid value "a" supplied to : { a: number }/a: number']],
    [{ a: t.number }, {}, ['Invalid value undefined supplied to : { a: number }/a: number']],
    [{ a: t.bigint }, { a: 'a' }, ['Invalid value "a" supplied to : { a: bigint }/a: bigint']],
    [{ a: t.bigint }, {}, ['Invalid value undefined supplied to : { a: bigint }/a: bigint']],
    [{ a: t.boolean }, { a: 1 }, ['Invalid value 1 supplied to : { a: boolean }/a: boolean']],
    [{ a: t.boolean }, {}, ['Invalid value undefined supplied to : { a: boolean }/a: boolean']],
    [{ a: t.UnknownArray }, { a: 'a' }, ['Invalid value "a" supplied to : { a: UnknownArray }/a: UnknownArray']],
    [{ a: t.UnknownArray }, {}, ['Invalid value undefined supplied to : { a: UnknownArray }/a: UnknownArray']],
    [
      { a: t.UnknownArray },
      { a: undefined },
      ['Invalid value undefined supplied to : { a: UnknownArray }/a: UnknownArray']
    ],
    [{ a: t.array(t.number) }, { a: 1 }, ['Invalid value 1 supplied to : { a: Array<number> }/a: Array<number>']],
    [{ a: t.array(t.number) }, {}, ['Invalid value undefined supplied to : { a: Array<number> }/a: Array<number>']],
    [{ a: t.UnknownRecord }, { a: [1] }, ['Invalid value [1] supplied to : { a: UnknownRecord }/a: UnknownRecord']],
    [{ a: t.UnknownRecord }, {}, ['Invalid value undefined supplied to : { a: UnknownRecord }/a: UnknownRecord']],
    [
      { a: t.UnknownRecord },
      { a: undefined },
      ['Invalid value undefined supplied to : { a: UnknownRecord }/a: UnknownRecord']
    ],
    [
      { a: t.record(t.string, t.string) },
      { a: 1 },
      ['Invalid value 1 supplied to : { a: { [K in string]: string } }/a: { [K in string]: string }']
    ],
    [
      { a: t.record(t.string, t.string) },
      {},
      ['Invalid value undefined supplied to : { a: { [K in string]: string } }/a: { [K in string]: string }']
    ],
    [{ a: t.Int }, { a: -1.1 }, ['Invalid value -1.1 supplied to : { a: Int }/a: Int']],
    [{ a: t.Int }, {}, ['Invalid value undefined supplied to : { a: Int }/a: Int']],
    [{ a: t.literal('YES') }, { a: 'NO' }, ['Invalid value "NO" supplied to : { a: "YES" }/a: "YES"']],
    [{ a: t.literal('YES') }, {}, ['Invalid value undefined supplied to : { a: "YES" }/a: "YES"']],
    [
      { a: t.partial({ b: t.string, c: t.string }) },
      { a: { b: 1 } },
      [
        'Invalid value 1 supplied to : ' +
          '{ a: Partial<{ b: string, c: string }> }/a: Partial<{ b: string, c: string }>/b: string'
      ]
    ],
    [
      { a: t.partial({ b: t.string, c: t.string }) },
      {},
      [
        'Invalid value undefined supplied to : ' +
          '{ a: Partial<{ b: string, c: string }> }/a: Partial<{ b: string, c: string }>'
      ]
    ],
    [
      { a: t.readonly(t.number) },
      { a: 'a' },
      ['Invalid value "a" supplied to : { a: Readonly<number> }/a: Readonly<number>']
    ],
    [
      { a: t.readonly(t.number) },
      {},
      ['Invalid value undefined supplied to : { a: Readonly<number> }/a: Readonly<number>']
    ],
    [
      { a: t.readonlyArray(t.number) },
      { a: 1 },
      ['Invalid value 1 supplied to : { a: ReadonlyArray<number> }/a: ReadonlyArray<number>']
    ],
    [
      { a: t.readonlyArray(t.number) },
      {},
      ['Invalid value undefined supplied to : { a: ReadonlyArray<number> }/a: ReadonlyArray<number>']
    ],
    [
      { a: t.tuple([t.string, t.string]) },
      { a: [1, 2] },
      [
        'Invalid value 1 supplied to : { a: [string, string] }/a: [string, string]/0: string',
        'Invalid value 2 supplied to : { a: [string, string] }/a: [string, string]/1: string'
      ]
    ],
    [
      { a: t.tuple([t.string, t.string]) },
      {},
      ['Invalid value undefined supplied to : { a: [string, string] }/a: [string, string]']
    ],
    [
      { a: t.union([t.string, t.number]), b: t.union([t.string, t.number]) },
      { a: [1], b: ['b'] },
      [
        'Invalid value [1] supplied to : { a: (string | number), b: (string | number) }/a: (string | number)/0: string',
        'Invalid value [1] supplied to : { a: (string | number), b: (string | number) }/a: (string | number)/1: number',
        'Invalid value ["b"] supplied to : { a: (string | number), b: (string | number) }/b: (string | number)/0: string',
        'Invalid value ["b"] supplied to : { a: (string | number), b: (string | number) }/b: (string | number)/1: number'
      ]
    ],
    [
      { a: t.union([t.string, t.number]), b: t.union([t.string, t.number]) },
      {},
      [
        'Invalid value undefined supplied to : { a: (string | number), b: (string | number) }/a: (string | number)',
        'Invalid value undefined supplied to : { a: (string | number), b: (string | number) }/b: (string | number)'
      ]
    ],
    [
      { a: t.intersection([t.number, t.Int]) },
      { a: 'a' },
      [
        'Invalid value "a" supplied to : { a: (number & Int) }/a: (number & Int)/0: number',
        'Invalid value "a" supplied to : { a: (number & Int) }/a: (number & Int)/1: Int'
      ]
    ],
    [
      { a: t.intersection([t.number, t.Int]) },
      {},
      ['Invalid value undefined supplied to : { a: (number & Int) }/a: (number & Int)']
    ],
    [
      { a: t.brand(t.number, (n): n is t.Branded<number, { readonly Positive: unique symbol }> => n >= 0, 'Positive') },
      { a: 'a' },
      ['Invalid value "a" supplied to : { a: Positive }/a: Positive']
    ],
    [
      { a: t.brand(t.number, (n): n is t.Branded<number, { readonly Positive: unique symbol }> => n >= 0, 'Positive') },
      {},
      ['Invalid value undefined supplied to : { a: Positive }/a: Positive']
    ],
    [
      { a: t.keyof({ foo: null, bar: null }) },
      { a: 'baz' },
      ['Invalid value "baz" supplied to : { a: "foo" | "bar" }/a: "foo" | "bar"']
    ],
    [
      { a: t.keyof({ foo: null, bar: null }) },
      {},
      ['Invalid value undefined supplied to : { a: "foo" | "bar" }/a: "foo" | "bar"']
    ],
    [
      { a: t.exact(t.type({ x: t.number, y: t.number })) },
      { a: { x: 1, z: 3 } },
      [
        'Invalid value undefined supplied to : ' +
          '{ a: {| x: number, y: number |} }/a: {| x: number, y: number |}/y: number'
      ]
    ],
    [
      { a: t.exact(t.type({ x: t.number, y: t.number })) },
      {},
      ['Invalid value undefined supplied to : ' + '{ a: {| x: number, y: number |} }/a: {| x: number, y: number |}']
    ],
    [
      { a: t.strict({ x: t.number, y: t.number }) },
      { a: { x: 1, z: 3 } },
      [
        'Invalid value undefined supplied to : ' +
          '{ a: {| x: number, y: number |} }/a: {| x: number, y: number |}/y: number'
      ]
    ],
    [
      { a: t.strict({ x: t.number, y: t.number }) },
      {},
      ['Invalid value undefined supplied to : ' + '{ a: {| x: number, y: number |} }/a: {| x: number, y: number |}']
    ]
  ]

  describe('`is` should return `false` for', () => {
    test.each(failureCases)('props %j given invalid input %j', (props, value) => {
      const T = t.type(props)
      assert.strictEqual(T.is(value), false)
    })
  })

  describe('`decode` should fail decoding', () => {
    test.each(failureCases)('with props %j and value %j', (props, value, messages) => {
      const T = t.type(props)
      assertFailure(T, value, messages)
    })
  })

  describe('is', () => {
    it('should allow additional properties', () => {
      const T = t.type({ a: t.string })
      assert.strictEqual(T.is({ a: 'a', b: 1 }), true)
    })

    it('should handle recursive types properly', () => {
      interface Tree {
        name: string
        children?: Array<Tree> | undefined
      }

      const Tree: t.Type<Tree> = t.recursion('Tree', () =>
        t.intersection([t.type({ name: t.string }), t.partial({ children: t.union([t.array(Tree), t.undefined]) })])
      )

      const subtree: Tree = { name: 'subtree', children: [] }
      const childlessSubtree: Tree = { name: 'childless' }
      const invalidSubtree = { name: 'invalid', children: 'children ' }

      assert.strictEqual(Tree.is({ name: 'a', children: [subtree] }), true)
      assert.strictEqual(Tree.is({ name: 'b', children: [childlessSubtree] }), true)
      assert.strictEqual(Tree.is({ name: 'c' }), true)
      assert.strictEqual(Tree.is({ name: 'd', children: [invalidSubtree] }), false)
    })

    it('#423', () => {
      class A {
        get a() {
          return 'a'
        }
        get b() {
          return 'b'
        }
      }
      const T = t.type({ a: t.string, b: t.string })
      assert.strictEqual(T.is(new A()), true)
    })
  })

  describe('decode', () => {
    it('should decode a isomorphic value', () => {
      const T = t.type({ a: t.string })
      assertSuccess(T.decode({ a: 'a' }))
    })

    it('should decode a prismatic value', () => {
      const T = t.type({ a: NumberFromString })
      assertSuccess(T.decode({ a: '1' }), { a: 1 })
    })

    it('should decode undefined properties', () => {
      const T1 = t.type({ a: t.undefined })
      assertSuccess(T1.decode({ a: undefined }), { a: undefined })

      const T2 = t.type({ a: t.union([t.number, t.undefined]) })
      assertSuccess(T2.decode({ a: undefined }), { a: undefined })
      assertSuccess(T2.decode({ a: 1 }), { a: 1 })

      const T3 = t.type({ a: t.unknown })
      assertSuccess(T3.decode({ a: undefined }), { a: undefined })

      const T4 = t.type({ a: t.void })
      assertSuccess(T4.decode({ a: undefined }), { a: undefined })
    })

    it('should support the alias `interface`', () => {
      const T = t.interface({ a: t.string })
      assertSuccess(T.decode({ a: 'a' }))
    })

    it('#423', () => {
      class A {
        get a() {
          return 'a'
        }
        get b() {
          return 'b'
        }
      }
      const T = t.type({ a: t.string, b: t.string })
      assertSuccess(T.decode(new A()))
    })
  })

  describe('encode', () => {
    it('should encode a isomorphic value', () => {
      const T = t.type({ a: t.string })
      assert.deepStrictEqual(T.encode({ a: 'a' }), { a: 'a' })
    })

    it('should encode a prismatic value', () => {
      const T = t.type({ a: NumberFromString })
      assert.deepStrictEqual(T.encode({ a: 1 }), { a: '1' })
    })
  })

  it('should keep unknown properties', () => {
    const T = t.type({ a: t.string })
    const validation = T.decode({ a: 's', b: 1 })
    pipe(
      validation,
      fold(
        () => {
          assert.ok(false)
        },
        a => {
          assert.deepStrictEqual(a, { a: 's', b: 1 })
        }
      )
    )
  })

  it('should return the same reference if validation succeeded and nothing changed', () => {
    const T = t.type({ a: t.string })
    const value = { a: 's' }
    assertStrictEqual(T.decode(value), value)
  })

  it('should return the same reference while encoding', () => {
    const T = t.type({ a: t.number })
    assert.strictEqual(T.encode, t.identity)
  })
})
