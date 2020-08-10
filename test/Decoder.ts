import * as assert from 'assert'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import * as DE from '../src/DecodeError'
import * as FS from '../src/FreeSemigroup'
import * as _ from '../src/Decoder'
import * as H from './helpers'

describe('Decoder', () => {
  // -------------------------------------------------------------------------------------
  // instances
  // -------------------------------------------------------------------------------------

  it('Functor', () => {
    const decoder = _.Functor.map(_.string, (s) => s + '!')
    assert.deepStrictEqual(decoder.decode('a'), _.success('a!'))
  })

  it('Alt', () => {
    const decoder = _.Alt.alt<unknown, string | number>(_.string, () => _.number)
    assert.deepStrictEqual(decoder.decode('a'), _.success('a'))
    assert.deepStrictEqual(decoder.decode(1), _.success(1))
  })

  it('Category', () => {
    const decoder = _.Category.compose(_.id<unknown>(), _.string)
    assert.deepStrictEqual(decoder.decode('a'), _.success('a'))
    assert.deepStrictEqual(decoder.decode(1), _.failure(1, 'string'))
  })

  // -------------------------------------------------------------------------------------
  // primitives
  // -------------------------------------------------------------------------------------

  it('string', async () => {
    assert.deepStrictEqual(_.string.decode('a'), _.success('a'))
    assert.deepStrictEqual(_.string.decode(null), E.left(FS.of(DE.leaf(null, 'string'))))
  })

  describe('number', () => {
    it('number', async () => {
      assert.deepStrictEqual(_.number.decode(1), _.success(1))
      assert.deepStrictEqual(_.number.decode(null), E.left(FS.of(DE.leaf(null, 'number'))))
    })

    it('should exclude NaN', () => {
      assert.deepStrictEqual(_.number.decode(NaN), E.left(FS.of(DE.leaf(NaN, 'number'))))
    })
  })

  it('boolean', async () => {
    assert.deepStrictEqual(_.boolean.decode(true), _.success(true))
    assert.deepStrictEqual(_.boolean.decode(null), E.left(FS.of(DE.leaf(null, 'boolean'))))
  })

  it('UnknownArray', async () => {
    assert.deepStrictEqual(_.UnknownArray.decode([1, 'a']), _.success([1, 'a']))
    assert.deepStrictEqual(_.UnknownArray.decode(null), E.left(FS.of(DE.leaf(null, 'Array<unknown>'))))
  })

  it('UnknownRecord', async () => {
    assert.deepStrictEqual(_.UnknownRecord.decode({ a: 1, b: 'b' }), _.success({ a: 1, b: 'b' }))
    assert.deepStrictEqual(_.UnknownRecord.decode(null), E.left(FS.of(DE.leaf(null, 'Record<string, unknown>'))))
  })

  // -------------------------------------------------------------------------------------
  // constructors
  // -------------------------------------------------------------------------------------

  describe('literal', () => {
    it('should decode a valid input', async () => {
      const decoder = _.literal('a', null, 'b', 1, true)
      assert.deepStrictEqual(decoder.decode('a'), _.success('a'))
      assert.deepStrictEqual(decoder.decode(null), _.success(null))
    })

    it('should reject an invalid input', async () => {
      const decoder = _.literal('a', null)
      assert.deepStrictEqual(decoder.decode('b'), E.left(FS.of(DE.leaf('b', '"a" | null'))))
    })
  })

  // -------------------------------------------------------------------------------------
  // combinators
  // -------------------------------------------------------------------------------------

  it('mapLeftWithInput', () => {
    const decoder = pipe(
      _.number,
      _.mapLeftWithInput((u) => FS.of(DE.leaf(u, 'not a number')))
    )
    assert.deepStrictEqual(decoder.decode('a'), E.left(FS.of(DE.leaf('a', 'not a number'))))
  })

  it('withMessage', () => {
    const decoder = pipe(
      _.type({
        name: _.string,
        age: _.number
      }),
      _.withMessage(() => 'Person')
    )
    assert.deepStrictEqual(
      pipe(decoder.decode({}), E.mapLeft(_.draw)),
      E.left(`Person
├─ required property "name"
│  └─ cannot decode undefined, should be string
└─ required property "age"
   └─ cannot decode undefined, should be number`)
    )
  })

  it('compose', () => {
    interface IntBrand {
      readonly Int: unique symbol
    }

    type Int = number & IntBrand

    const decoder = pipe(_.number, _.compose(_.fromRefinement((n): n is Int => Number.isInteger(n), 'IntFromNumber')))
    assert.deepStrictEqual(decoder.decode(1), _.success(1))
    assert.deepStrictEqual(decoder.decode('a'), _.failure('a', 'number'))
    assert.deepStrictEqual(decoder.decode(1.2), _.failure(1.2, 'IntFromNumber'))
  })

  describe('nullable', () => {
    it('should decode a valid input', () => {
      const decoder = _.nullable(H.decoderNumberFromUnknownString)
      assert.deepStrictEqual(decoder.decode(null), _.success(null))
      assert.deepStrictEqual(decoder.decode('1'), _.success(1))
    })

    it('should reject an invalid input', () => {
      const decoder = _.nullable(H.decoderNumberFromUnknownString)
      assert.deepStrictEqual(
        decoder.decode(undefined),
        E.left(
          FS.concat(
            FS.of(DE.member(0, FS.of(DE.leaf(undefined, 'null')))),
            FS.of(DE.member(1, FS.of(DE.leaf(undefined, 'string'))))
          )
        )
      )
      assert.deepStrictEqual(
        decoder.decode('a'),
        E.left(
          FS.concat(
            FS.of(DE.member(0, FS.of(DE.leaf('a', 'null')))),
            FS.of(DE.member(1, FS.of(DE.leaf('a', 'parsable to a number'))))
          )
        )
      )
    })
  })

  describe('type', () => {
    it('should decode a valid input', async () => {
      const decoder = _.type({
        a: _.string
      })
      assert.deepStrictEqual(decoder.decode({ a: 'a' }), _.success({ a: 'a' }))
    })

    it('should strip additional fields', async () => {
      const decoder = _.type({
        a: _.string
      })
      assert.deepStrictEqual(decoder.decode({ a: 'a', b: 1 }), _.success({ a: 'a' }))
    })

    it('should not strip fields corresponding to undefined values', async () => {
      const decoder = _.type({
        a: H.decoderUndefined
      })
      assert.deepStrictEqual(decoder.decode({}), _.success({ a: undefined }))
    })

    it('should reject an invalid input', async () => {
      const decoder = _.type({
        a: _.string
      })
      assert.deepStrictEqual(decoder.decode(undefined), E.left(FS.of(DE.leaf(undefined, 'Record<string, unknown>'))))
      assert.deepStrictEqual(
        decoder.decode({ a: 1 }),
        E.left(FS.of(DE.key('a', DE.required, FS.of(DE.leaf(1, 'string')))))
      )
    })

    it('should collect all errors', async () => {
      const decoder = _.type({
        a: _.string,
        b: _.number
      })
      assert.deepStrictEqual(
        decoder.decode({}),
        E.left(
          FS.concat(
            FS.of(DE.key('a', DE.required, FS.of(DE.leaf(undefined, 'string')))),
            FS.of(DE.key('b', DE.required, FS.of(DE.leaf(undefined, 'number'))))
          )
        )
      )
    })

    it('should support getters', async () => {
      class A {
        get a() {
          return 'a'
        }
        get b() {
          return 'b'
        }
      }
      const decoder = _.type({ a: _.string, b: _.string })
      assert.deepStrictEqual(decoder.decode(new A()), _.success({ a: 'a', b: 'b' }))
    })
  })

  describe('partial', () => {
    it('should decode a valid input', async () => {
      const decoder = _.partial({ a: _.string })
      assert.deepStrictEqual(decoder.decode({ a: 'a' }), _.success({ a: 'a' }))
      assert.deepStrictEqual(decoder.decode({}), _.success({}))
    })

    it('should strip additional fields', async () => {
      const decoder = _.partial({ a: _.string })
      assert.deepStrictEqual(decoder.decode({ a: 'a', b: 1 }), _.success({ a: 'a' }))
    })

    it('should not add missing fields', async () => {
      const decoder = _.partial({ a: _.string })
      assert.deepStrictEqual(decoder.decode({}), _.success({}))
    })

    it('should not strip fields corresponding to undefined values', async () => {
      const decoder = _.partial({ a: _.string })
      assert.deepStrictEqual(decoder.decode({ a: undefined }), _.success({ a: undefined }))
    })

    it('should reject an invalid input', async () => {
      const decoder = _.partial({ a: _.string })
      assert.deepStrictEqual(decoder.decode(undefined), E.left(FS.of(DE.leaf(undefined, 'Record<string, unknown>'))))
      assert.deepStrictEqual(
        decoder.decode({ a: 1 }),
        E.left(FS.of(DE.key('a', DE.optional, FS.of(DE.leaf(1, 'string')))))
      )
    })

    it('should collect all errors', async () => {
      const decoder = _.partial({
        a: _.string,
        b: _.number
      })
      assert.deepStrictEqual(
        decoder.decode({ a: 1, b: 'b' }),
        E.left(
          FS.concat(
            FS.of(DE.key('a', DE.optional, FS.of(DE.leaf(1, 'string')))),
            FS.of(DE.key('b', DE.optional, FS.of(DE.leaf('b', 'number'))))
          )
        )
      )
    })

    it('should support getters', async () => {
      class A {
        get a() {
          return 'a'
        }
        get b() {
          return 'b'
        }
      }
      const decoder = _.partial({ a: _.string, b: _.string })
      assert.deepStrictEqual(decoder.decode(new A()), _.success({ a: 'a', b: 'b' }))
    })
  })

  describe('array', () => {
    it('should decode a valid input', async () => {
      const decoder = _.array(_.string)
      assert.deepStrictEqual(decoder.decode([]), _.success([]))
      assert.deepStrictEqual(decoder.decode(['a']), _.success(['a']))
    })

    it('should reject an invalid input', async () => {
      const decoder = _.array(_.string)
      assert.deepStrictEqual(decoder.decode(undefined), E.left(FS.of(DE.leaf(undefined, 'Array<unknown>'))))
      assert.deepStrictEqual(decoder.decode([1]), E.left(FS.of(DE.index(0, DE.optional, FS.of(DE.leaf(1, 'string'))))))
    })

    it('should collect all errors', async () => {
      const decoder = _.array(_.string)
      assert.deepStrictEqual(
        decoder.decode([1, 2]),
        E.left(
          FS.concat(
            FS.of(DE.index(0, DE.optional, FS.of(DE.leaf(1, 'string')))),
            FS.of(DE.index(1, DE.optional, FS.of(DE.leaf(2, 'string'))))
          )
        )
      )
    })
  })

  describe('record', () => {
    it('should decode a valid value', async () => {
      const decoder = _.record(_.number)
      assert.deepStrictEqual(decoder.decode({}), _.success({}))
      assert.deepStrictEqual(decoder.decode({ a: 1 }), _.success({ a: 1 }))
    })

    it('should reject an invalid value', async () => {
      const decoder = _.record(_.number)
      assert.deepStrictEqual(decoder.decode(undefined), E.left(FS.of(DE.leaf(undefined, 'Record<string, unknown>'))))
      assert.deepStrictEqual(
        decoder.decode({ a: 'a' }),
        E.left(FS.of(DE.key('a', DE.optional, FS.of(DE.leaf('a', 'number')))))
      )
    })

    it('should collect all errors', async () => {
      const decoder = _.record(_.number)
      assert.deepStrictEqual(
        decoder.decode({ a: 'a', b: 'b' }),
        E.left(
          FS.concat(
            FS.of(DE.key('a', DE.optional, FS.of(DE.leaf('a', 'number')))),
            FS.of(DE.key('b', DE.optional, FS.of(DE.leaf('b', 'number'))))
          )
        )
      )
    })
  })

  describe('tuple', () => {
    it('should decode a valid input', async () => {
      const decoder = _.tuple(_.string, _.number)
      assert.deepStrictEqual(decoder.decode(['a', 1]), _.success(['a', 1]))
    })

    it('should handle zero components', async () => {
      assert.deepStrictEqual(_.tuple().decode([]), _.success([]))
    })

    it('should reject an invalid input', async () => {
      const decoder = _.tuple(_.string, _.number)
      assert.deepStrictEqual(decoder.decode(undefined), E.left(FS.of(DE.leaf(undefined, 'Array<unknown>'))))
      assert.deepStrictEqual(
        decoder.decode(['a']),
        E.left(FS.of(DE.index(1, DE.required, FS.of(DE.leaf(undefined, 'number')))))
      )
      assert.deepStrictEqual(
        decoder.decode([1, 2]),
        E.left(FS.of(DE.index(0, DE.required, FS.of(DE.leaf(1, 'string')))))
      )
    })

    it('should collect all errors', async () => {
      const decoder = _.tuple(_.string, _.number)
      assert.deepStrictEqual(
        decoder.decode([1, 'a']),
        E.left(
          FS.concat(
            FS.of(DE.index(0, DE.required, FS.of(DE.leaf(1, 'string')))),
            FS.of(DE.index(1, DE.required, FS.of(DE.leaf('a', 'number'))))
          )
        )
      )
    })

    it('should strip additional components', async () => {
      const decoder = _.tuple(_.string, _.number)
      assert.deepStrictEqual(decoder.decode(['a', 1, true]), _.success(['a', 1]))
    })
  })

  describe('union', () => {
    it('should decode a valid input', () => {
      assert.deepStrictEqual(_.union(_.string).decode('a'), _.success('a'))
      const decoder = _.union(_.string, _.number)
      assert.deepStrictEqual(decoder.decode('a'), _.success('a'))
      assert.deepStrictEqual(decoder.decode(1), _.success(1))
    })

    it('should reject an invalid input', () => {
      const decoder = _.union(_.string, _.number)
      assert.deepStrictEqual(
        decoder.decode(true),
        E.left(
          FS.concat(
            FS.of(DE.member(0, FS.of(DE.leaf(true, 'string')))),
            FS.of(DE.member(1, FS.of(DE.leaf(true, 'number'))))
          )
        )
      )
    })
  })

  describe('refine', () => {
    it('should decode a valid input', () => {
      const decoder = pipe(
        _.string,
        _.refine((s): s is string => s.length > 0, 'NonEmptyString')
      )
      assert.deepStrictEqual(decoder.decode('a'), _.success('a'))
    })

    it('should reject an invalid input', () => {
      const decoder = pipe(
        _.string,
        _.refine((s): s is string => s.length > 0, 'NonEmptyString')
      )
      assert.deepStrictEqual(decoder.decode(undefined), E.left(FS.of(DE.leaf(undefined, 'string'))))
      assert.deepStrictEqual(decoder.decode(''), E.left(FS.of(DE.leaf('', 'NonEmptyString'))))
    })
  })

  describe('intersect', () => {
    it('should decode a valid input', () => {
      const decoder = pipe(_.type({ a: _.string }), _.intersect(_.type({ b: _.number })))
      assert.deepStrictEqual(decoder.decode({ a: 'a', b: 1 }), _.success({ a: 'a', b: 1 }))
    })

    it('should handle primitives', () => {
      const decoder = pipe(H.decoderInt, _.intersect(H.decoderPositive))
      assert.deepStrictEqual(decoder.decode(1), _.success(1))
    })

    it('should accumulate all errors', () => {
      const decoder = pipe(_.type({ a: _.string }), _.intersect(_.type({ b: _.number })))
      assert.deepStrictEqual(
        decoder.decode({ a: 'a' }),
        E.left(FS.of(DE.key('b', DE.required, FS.of(DE.leaf(undefined, 'number')))))
      )
      assert.deepStrictEqual(
        decoder.decode({ b: 1 }),
        E.left(FS.of(DE.key('a', DE.required, FS.of(DE.leaf(undefined, 'string')))))
      )
      assert.deepStrictEqual(
        decoder.decode({}),
        E.left(
          FS.concat(
            FS.of(DE.key('a', DE.required, FS.of(DE.leaf(undefined, 'string')))),
            FS.of(DE.key('b', DE.required, FS.of(DE.leaf(undefined, 'number'))))
          )
        )
      )
    })
  })

  describe('sum', () => {
    const sum = _.sum('_tag')

    it('should decode a valid input', () => {
      const A = _.type({ _tag: _.literal('A'), a: _.string })
      const B = _.type({ _tag: _.literal('B'), b: _.number })
      const decoder = sum({ A, B })
      assert.deepStrictEqual(decoder.decode({ _tag: 'A', a: 'a' }), _.success({ _tag: 'A', a: 'a' }))
      assert.deepStrictEqual(decoder.decode({ _tag: 'B', b: 1 }), _.success({ _tag: 'B', b: 1 }))
    })

    it('should reject an invalid input', () => {
      const A = _.type({ _tag: _.literal('A'), a: _.string })
      const B = _.type({ _tag: _.literal('B'), b: _.number })
      const decoder = sum({ A, B })
      assert.deepStrictEqual(decoder.decode(null), E.left(FS.of(DE.leaf(null, 'Record<string, unknown>'))))
      assert.deepStrictEqual(
        decoder.decode({}),
        E.left(FS.of(DE.key('_tag', DE.required, FS.of(DE.leaf(undefined, '"A" | "B"')))))
      )
      assert.deepStrictEqual(
        decoder.decode({ _tag: 'A', a: 1 }),
        E.left(FS.of(DE.key('a', DE.required, FS.of(DE.leaf(1, 'string')))))
      )
    })

    it('should support empty records', () => {
      const decoder = sum({})
      assert.deepStrictEqual(
        decoder.decode({}),
        E.left(FS.of(DE.key('_tag', DE.required, FS.of(DE.leaf(undefined, 'never')))))
      )
    })
  })

  interface A {
    a: number
    b?: A
  }

  const lazyDecoder: _.Decoder<unknown, A> = _.lazy('A', () =>
    pipe(_.type({ a: H.decoderNumberFromUnknownString }), _.intersect(_.partial({ b: lazyDecoder })))
  )

  describe('lazy', () => {
    it('should decode a valid input', () => {
      assert.deepStrictEqual(lazyDecoder.decode({ a: '1' }), _.success({ a: 1 }))
      assert.deepStrictEqual(lazyDecoder.decode({ a: '1', b: { a: '2' } }), _.success({ a: 1, b: { a: 2 } }))
    })

    it('should reject an invalid input', () => {
      assert.deepStrictEqual(
        lazyDecoder.decode({ a: 1 }),
        E.left(FS.of(DE.lazy('A', FS.of(DE.key('a', DE.required, FS.of(DE.leaf(1, 'string')))))))
      )
      assert.deepStrictEqual(
        lazyDecoder.decode({ a: 'a' }),
        E.left(FS.of(DE.lazy('A', FS.of(DE.key('a', DE.required, FS.of(DE.leaf('a', 'parsable to a number')))))))
      )
      assert.deepStrictEqual(
        lazyDecoder.decode({ a: '1', b: {} }),
        E.left(
          FS.of(
            DE.lazy(
              'A',
              FS.of(
                DE.key(
                  'b',
                  DE.optional,
                  FS.of(DE.lazy('A', FS.of(DE.key('a', DE.required, FS.of(DE.leaf(undefined, 'string'))))))
                )
              )
            )
          )
        )
      )
    })
  })

  // -------------------------------------------------------------------------------------
  // utils
  // -------------------------------------------------------------------------------------

  describe('draw', () => {
    it('draw', () => {
      const decoder = _.type({
        a: _.string,
        b: _.number,
        c: _.array(_.boolean),
        d: _.nullable(_.string)
      })
      assert.deepStrictEqual(
        pipe(decoder.decode({ c: [1] }), E.mapLeft(_.draw)),
        E.left(`required property "a"
└─ cannot decode undefined, should be string
required property "b"
└─ cannot decode undefined, should be number
required property "c"
└─ optional index 0
   └─ cannot decode 1, should be boolean
required property "d"
├─ member 0
│  └─ cannot decode undefined, should be null
└─ member 1
   └─ cannot decode undefined, should be string`)
      )
    })

    it('should support lazy combinators', () => {
      assert.deepStrictEqual(
        pipe(lazyDecoder.decode({ a: '1', b: {} }), E.mapLeft(_.draw)),
        E.left(`lazy type A
└─ optional property \"b\"
   └─ lazy type A
      └─ required property \"a\"
         └─ cannot decode undefined, should be string`)
      )
    })
  })

  it('stringify', () => {
    assert.deepStrictEqual(_.stringify(_.string.decode('a')), '"a"')
    assert.deepStrictEqual(_.stringify(_.string.decode(null)), 'cannot decode null, should be string')
  })

  it('fromRefinement', () => {
    const IntFromNumber = _.fromRefinement((n: number): n is H.Int => Number.isInteger(n), 'IntFromNumber')
    assert.deepStrictEqual(IntFromNumber.decode(1), _.success(1))
    assert.deepStrictEqual(IntFromNumber.decode(1.2), _.failure(1.2, 'IntFromNumber'))
  })
})
