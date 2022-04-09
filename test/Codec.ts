import * as assert from 'assert'
import * as _ from '../src/Codec'
import * as D from '../src/Decoder'
import { pipe } from 'fp-ts/lib/pipeable'
import * as DE from '../src/DecodeError'
import * as E from 'fp-ts/lib/Either'
import * as H from './helpers'

const codecNumberFromString = _.codec(
  H.decoderNumberFromString,
  H.encoderNumberToString
)

const codecNumber = pipe(_.string, _.compose(codecNumberFromString))

const codecPositive = _.fromDecoder(H.decoderPositive)

const codecInt = _.fromDecoder(H.decoderInt)

const codecUndefined = _.fromDecoder(H.decoderUndefined)

export type Json = boolean | number | string | null | JsonArray | JsonRecord

export interface JsonRecord {
  readonly [key: string]: Json
}

export interface JsonArray extends ReadonlyArray<Json> {}

export function parseJSON<E>(s: string, onError: (reason: unknown) => E): E.Either<E, Json> {
  return E.tryCatch(() => JSON.parse(s), onError)
}

describe('Codec', () => {
  describe('Invariant', () => {

  describe('mapLeft', () => {
    describe('decode', () => {
      it('should, return the provided expected', () => {
        const decoder = pipe(
          _.number,
          _.mapLeft(() => DE.leafE({ message: 'not a number' }))
        )
        assert.deepStrictEqual(decoder.decoder.decode('a'), D.failure(DE.leafE({ message: 'not a number' })))
      })
    })
  })

  describe('string', () => {
    describe('decode', () => {
      it('should decode a valid input', () => {
        const codec = _.string
        assert.deepStrictEqual(codec.decoder.decode('a'), D.success('a'))
      })

      it('should reject an invalid input', () => {
        const codec = _.string
        assert.deepStrictEqual(codec.decoder.decode(null), D.failure(DE.leafE({ _tag: 'StringE', actual: null })))
      })
    })
  })

  describe('number', () => {
    describe('decode', () => {
      it('should decode a valid input', () => {
        const codec = _.number
        assert.deepStrictEqual(codec.decoder.decode(1), D.success(1))
      })

      it('should reject an invalid input', () => {
        const codec = _.number
        assert.deepStrictEqual(codec.decoder.decode(null), D.failure(DE.leafE({ _tag: 'StringE', actual: null })))
      })
    })
  })

  describe('boolean', () => {
    describe('decode', () => {
      it('should decode a valid input', () => {
        const codec = _.boolean
        assert.deepStrictEqual(codec.decoder.decode(true), D.success(true))
        assert.deepStrictEqual(codec.decoder.decode(false), D.success(false))
      })

      it('should reject an invalid input', () => {
        const codec = _.boolean
        assert.deepStrictEqual(codec.decoder.decode(null), D.failure(null))
      })
    })
  })

  describe('literal', () => {
    describe('decode', () => {
      it('should decode a valid input', () => {
        const codec = _.literal('a', null, 'b', 1, true)
        assert.deepStrictEqual(codec.decoder.decode('a'), D.success('a'))
        assert.deepStrictEqual(codec.decoder.decode(null), D.success(null))
      })

      it('should reject an invalid input', () => {
        const codec = _.literal('a', null)
        assert.deepStrictEqual(codec.decoder.decode('b'), D.failure('b'))
      })
    })

    describe('encode', () => {
      it('should encode a value', () => {
        const codec = _.literal('a')
        assert.deepStrictEqual(codec.encoder.decode('a'), D.success('a'))
      })
    })
  })

  describe('refine', () => {
    describe('decode', () => {
      it('should decode a valid input', () => {
        const codec = pipe(
          _.string,
          _.refine((s): s is string => s.length > 0)
        )
        assert.deepStrictEqual(codec.decoder.decode('a'), D.success('a'))
      })

      it('should reject an invalid input', () => {
        const codec = pipe(
          _.string,
          _.refine((s): s is string => s.length > 0)
        )
        assert.deepStrictEqual(codec.decoder.decode(undefined), D.failure(undefined))
        assert.deepStrictEqual(codec.decoder.decode(''), D.failure(''))
      })
    })

    describe('encode', () => {
      it('should encode a value', () => {
        const codec = pipe(
          _.string,
          _.refine((s): s is string => s.length > 0)
        )
        assert.strictEqual(codec.encoder.decode('a'), 'a')
      })
    })
  })

  describe('nullable', () => {
    describe('decode', () => {
      it('should decode a valid input', () => {
        const codec = _.nullable(codecNumber) 
        assert.deepStrictEqual(codec.decoder.decode(null), D.success(null))
        assert.deepStrictEqual(codec.decoder.decode('1'), D.success(1))
      })

      it('should reject an invalid input', () => {
        const codec = _.nullable(codecNumber)
        assert.deepStrictEqual(
          codec.decoder.decode(undefined),
          E.left(
            FS.concat(
              FS.of(DE.member(0, FS.of(DE.leaf(undefined, 'null')))),
              FS.of(DE.member(1, FS.of(DE.leaf(undefined, 'string'))))
            )
          )
        )
        assert.deepStrictEqual(
          codec.decoder.decode('a'),
          E.left(
            FS.concat(
              FS.of(DE.member(0, FS.of(DE.leaf('a', 'null')))),
              FS.of(DE.member(1, FS.of(DE.leaf('a', 'parsable to a number'))))
            )
          )
        )
      })
    })

    describe('encode', () => {
      it('should encode a value', () => {
        const codec = _.nullable(codecNumber)
        assert.strictEqual(codec.encoder.decode(null), null)
        assert.strictEqual(codec.encoder.decode(1), '1')
      })
    })
  })

  describe('struct', () => {
    describe('decode', () => {
      it('should decode a valid input', () => {
        const codec = _.struct({
          a: _.string
        })
        assert.deepStrictEqual(codec.decoder.decode({ a: 'a' }), D.success({ a: 'a' }))
      })

      it('should strip additional fields', () => {
        const codec = _.struct({
          a: _.string
        })
        assert.deepStrictEqual(codec.decoder.decode({ a: 'a', b: 1 }), D.success({ a: 'a' }))
      })

      it('should not strip fields corresponding to undefined values', () => {
        const codec = _.struct({
          a: codecUndefined
        })
        assert.deepStrictEqual(codec.decoder.decode({}), D.success({ a: undefined }))
      })

      it('should reject an invalid input', () => {
        const codec = _.struct({
          a: _.string
        })
        assert.deepStrictEqual(codec.decoder.decode(undefined), D.failure(undefined, 'Record<string, unknown>'))
        assert.deepStrictEqual(
          codec.decoder.decode({ a: 1 }),
          E.left(FS.of(DE.key('a', DE.required, FS.of(DE.leaf(1, 'string')))))
        )
      })

      it('should collect all errors', () => {
        const codec = _.struct({
          a: _.string,
          b: _.number
        })
        assert.deepStrictEqual(
          codec.decoder.decode({}),
          E.left(
            FS.concat(
              FS.of(DE.key('a', DE.required, FS.of(DE.leaf(undefined, 'string')))),
              FS.of(DE.key('b', DE.required, FS.of(DE.leaf(undefined, 'number'))))
            )
          )
        )
      })

      it('should support getters', () => {
        class A {
          get a() {
            return 'a'
          }
          get b() {
            return 'b'
          }
        }
        const codec = _.struct({ a: _.string, b: _.string })
        assert.deepStrictEqual(codec.decoder.decode(new A()), D.success({ a: 'a', b: 'b' }))
      })
    })

    describe('encode', () => {
      it('should encode a value', () => {
        const codec = _.struct({ a: codecNumber })
        assert.deepStrictEqual(codec.encoder.decode({ a: 1 }), { a: '1' })
      })

      it('should strip additional fields', () => {
        const codec = _.struct({ a: _.number })
        const a = { a: 1, b: true }
        assert.deepStrictEqual(codec.encoder.decode(a), { a: 1 })
      })
    })
  })

  describe('partial', () => {
    describe('decode', () => {
      it('should decode a valid input', () => {
        const codec = _.partial({ a: _.string })
        assert.deepStrictEqual(codec.decoder.decode({ a: 'a' }), D.success({ a: 'a' }))
        assert.deepStrictEqual(codec.decoder.decode({}), D.success({}))
      })

      it('should strip additional fields', () => {
        const codec = _.partial({ a: _.string })
        assert.deepStrictEqual(codec.decoder.decode({ a: 'a', b: 1 }), D.success({ a: 'a' }))
      })

      it('should not add missing fields', () => {
        const codec = _.partial({ a: _.string })
        assert.deepStrictEqual(codec.decoder.decode({}), D.success({}))
      })

      it('should not strip fields corresponding to undefined values', () => {
        const codec = _.partial({ a: _.string })
        assert.deepStrictEqual(codec.decoder.decode({ a: undefined }), D.success({ a: undefined }))
      })

      it('should reject an invalid input', () => {
        const codec = _.partial({ a: _.string })
        assert.deepStrictEqual(codec.decoder.decode(undefined), D.failure(undefined, 'Record<string, unknown>'))
        assert.deepStrictEqual(
          codec.decoder.decode({ a: 1 }),
          E.left(FS.of(DE.key('a', DE.optional, FS.of(DE.leaf(1, 'string')))))
        )
      })

      it('should collect all errors', () => {
        const codec = _.partial({
          a: _.string,
          b: _.number
        })
        assert.deepStrictEqual(
          codec.decoder.decode({ a: 1, b: 'b' }),
          E.left(
            FS.concat(
              FS.of(DE.key('a', DE.optional, FS.of(DE.leaf(1, 'string')))),
              FS.of(DE.key('b', DE.optional, FS.of(DE.leaf('b', 'number'))))
            )
          )
        )
      })

      it('should support getters', () => {
        class A {
          get a() {
            return 'a'
          }
          get b() {
            return 'b'
          }
        }
        const codec = _.partial({ a: _.string, b: _.string })
        assert.deepStrictEqual(codec.decoder.decode(new A()), D.success({ a: 'a', b: 'b' }))
      })
    })

    describe('encode', () => {
      it('should encode a value', () => {
        const codec = _.partial({ a: codecNumber })
        assert.deepStrictEqual(codec.encoder.decode({}), {})
        assert.deepStrictEqual(codec.encoder.decode({ a: 1 }), { a: '1' })
      })

      it('should strip additional fields', () => {
        const codec = _.partial({ a: _.string })
        const a = { a: 'a', b: true }
        assert.deepStrictEqual(codec.encoder.decode(a), { a: 'a' })
      })

      it('should not add missing fields', () => {
        const codec = _.partial({ a: _.string })
        assert.deepStrictEqual(codec.encoder.decode({}), {})
      })

      it('should not strip fields corresponding to undefined values', () => {
        const codec = _.partial({ a: _.string })
        assert.deepStrictEqual(codec.encoder.decode({ a: undefined }), { a: undefined })
      })
    })
  })

  describe('record', () => {
    describe('decode', () => {
      it('should decode a valid value', () => {
        const codec = _.record(_.number)
        assert.deepStrictEqual(codec.decoder.decode({}), D.success({}))
        assert.deepStrictEqual(codec.decoder.decode({ a: 1 }), D.success({ a: 1 }))
      })

      it('should reject an invalid value', () => {
        const codec = _.record(_.number)
        assert.deepStrictEqual(codec.decoder.decode(undefined), D.failure(undefined, 'Record<string, unknown>'))
        assert.deepStrictEqual(
          codec.decoder.decode({ a: 'a' }),
          E.left(FS.of(DE.key('a', DE.optional, FS.of(DE.leaf('a', 'number')))))
        )
      })

      it('should collect all errors', () => {
        const codec = _.record(_.number)
        assert.deepStrictEqual(
          codec.decoder.decode({ a: 'a', b: 'b' }),
          E.left(
            FS.concat(
              FS.of(DE.key('a', DE.optional, FS.of(DE.leaf('a', 'number')))),
              FS.of(DE.key('b', DE.optional, FS.of(DE.leaf('b', 'number'))))
            )
          )
        )
      })
    })

    describe('encode', () => {
      it('should encode a value', () => {
        const codec = _.record(codecNumber)
        assert.deepStrictEqual(codec.encoder.decode({ a: 1, b: 2 }), { a: '1', b: '2' })
      })
    })
  })

  describe('array', () => {
    describe('decode', () => {
      it('should decode a valid input', () => {
        const codec = _.array(_.string)
        assert.deepStrictEqual(codec.decoder.decode([]), D.success([]))
        assert.deepStrictEqual(codec.decoder.decode(['a']), D.success(['a']))
      })

      it('should reject an invalid input', () => {
        const codec = _.array(_.string)
        assert.deepStrictEqual(codec.decoder.decode(undefined), D.failure(undefined, 'Array<unknown>'))
        assert.deepStrictEqual(codec.decoder.decode([1]), E.left(FS.of(DE.index(0, DE.optional, FS.of(DE.leaf(1, 'string'))))))
      })

      it('should collect all errors', () => {
        const codec = _.array(_.string)
        assert.deepStrictEqual(
          codec.decoder.decode([1, 2]),
          E.left(
            FS.concat(
              FS.of(DE.index(0, DE.optional, FS.of(DE.leaf(1, 'string')))),
              FS.of(DE.index(1, DE.optional, FS.of(DE.leaf(2, 'string'))))
            )
          )
        )
      })
    })

    describe('encode', () => {
      it('should encode a value', () => {
        const codec = _.array(codecNumber)
        assert.deepStrictEqual(codec.encoder.decode([1, 2]), ['1', '2'])
      })
    })
  })

  describe('tuple', () => {
    describe('decode', () => {
      it('should decode a valid input', () => {
        const codec = _.tuple(_.string, _.number)
        assert.deepStrictEqual(codec.decoder.decode(['a', 1]), D.success(['a', 1]))
      })

      it('should handle zero components', () => {
        assert.deepStrictEqual(_.tuple().decode([]), D.success([]))
      })

      it('should reject an invalid input', () => {
        const codec = _.tuple(_.string, _.number)
        assert.deepStrictEqual(codec.decoder.decode(undefined), D.failure(undefined, 'Array<unknown>'))
        assert.deepStrictEqual(
          codec.decoder.decode(['a']),
          E.left(FS.of(DE.index(1, DE.required, FS.of(DE.leaf(undefined, 'number')))))
        )
        assert.deepStrictEqual(
          codec.decoder.decode([1, 2]),
          E.left(FS.of(DE.index(0, DE.required, FS.of(DE.leaf(1, 'string')))))
        )
      })

      it('should collect all errors', () => {
        const codec = _.tuple(_.string, _.number)
        assert.deepStrictEqual(
          codec.decoder.decode([1, 'a']),
          E.left(
            FS.concat(
              FS.of(DE.index(0, DE.required, FS.of(DE.leaf(1, 'string')))),
              FS.of(DE.index(1, DE.required, FS.of(DE.leaf('a', 'number'))))
            )
          )
        )
      })

      it('should strip additional components', () => {
        const codec = _.tuple(_.string, _.number)
        assert.deepStrictEqual(codec.decoder.decode(['a', 1, true]), D.success(['a', 1]))
      })
    })

    describe('encode', () => {
      it('should encode a value', () => {
        const codec = _.tuple(codecNumber, _.string)
        assert.deepStrictEqual(codec.encoder.decode([1, 'a']), ['1', 'a'])
      })
    })
  })

  describe('intersect', () => {
    describe('decode', () => {
      it('should decode a valid input', () => {
        const codec = pipe(_.struct({ a: _.string }), _.intersect(_.struct({ b: _.number })))
        assert.deepStrictEqual(codec.decoder.decode({ a: 'a', b: 1 }), D.success({ a: 'a', b: 1 }))
      })

      it('should handle primitives', () => {
        const codec = pipe(codecInt, _.intersect(codecPositive))
        assert.deepStrictEqual(codec.decoder.decode(1), D.success(1))
      })
    })

    describe('encode', () => {
      it('should encode a value', () => {
        const codec = pipe(_.struct({ a: _.string }), _.intersect(_.struct({ b: codecNumber })))
        assert.deepStrictEqual(codec.encoder.decode({ a: 'a', b: 1 }), { a: 'a', b: '1' })
      })

      it('should handle primitives', () => {
        const codec = pipe(codecInt, _.intersect(codecPositive))
        assert.deepStrictEqual(codec.encoder.decode(1 as any), 1)
      })
    })
  })

  describe('sum', () => {
    const sum = _.sum('_tag')

    describe('decode', () => {
      it('should decode a valid input', () => {
        const A = _.struct({ _tag: _.literal('A'), a: _.string })
        const B = _.struct({ _tag: _.literal('B'), b: _.number })
        const codec = sum({ A, B })
        assert.deepStrictEqual(codec.decoder.decode({ _tag: 'A', a: 'a' }), D.success({ _tag: 'A', a: 'a' }))
        assert.deepStrictEqual(codec.decoder.decode({ _tag: 'B', b: 1 }), D.success({ _tag: 'B', b: 1 }))
      })

      it('should reject an invalid input', () => {
        const A = _.struct({ _tag: _.literal('A'), a: _.string })
        const B = _.struct({ _tag: _.literal('B'), b: _.number })
        const codec = sum({ A, B })
        assert.deepStrictEqual(codec.decoder.decode(null), D.failure(null, 'Record<string, unknown>'))
        assert.deepStrictEqual(
          codec.decoder.decode({}),
          E.left(FS.of(DE.key('_tag', DE.required, FS.of(DE.leaf(undefined, '"A" | "B"')))))
        )
        assert.deepStrictEqual(
          codec.decoder.decode({ _tag: 'A', a: 1 }),
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

    describe('encode', () => {
      it('should encode a value', () => {
        const A = _.struct({ _tag: _.literal('A'), a: _.string })
        const B = _.struct({ _tag: _.literal('B'), b: codecNumber })
        const codec = sum({ A, B })
        assert.deepStrictEqual(codec.encoder.decode({ _tag: 'A', a: 'a' }), { _tag: 'A', a: 'a' })
        assert.deepStrictEqual(codec.encoder.decode({ _tag: 'B', b: 1 }), { _tag: 'B', b: '1' })
      })
    })
  })

  describe('lazy', () => {
    interface A {
      a: number
      b?: A
    }
    interface AOut {
      a: string
      b?: AOut
    }

    const lazyCodec: _.Codec<unknown, AOut, A> = _.lazy('A', () =>
      pipe(_.struct({ a: codecNumber }), _.intersect(_.partial({ b: lazyCodec })))
    )

    describe('decode', () => {
      it('should decode a valid input', () => {
        assert.deepStrictEqual(lazyCodec.decoder.decode({ a: '1' }), D.success({ a: 1 }))
        assert.deepStrictEqual(lazyCodec.decoder.decode({ a: '1', b: { a: '2' } }), D.success({ a: 1, b: { a: 2 } }))
      })

      it('should reject an invalid input', () => {
        assert.deepStrictEqual(
          lazyCodec.decode({ a: 1 }),
          E.left(FS.of(DE.lazy('A', FS.of(DE.key('a', DE.required, FS.of(DE.leaf(1, 'string')))))))
        )
        assert.deepStrictEqual(
          lazyCodec.decode({ a: 'a' }),
          E.left(FS.of(DE.lazy('A', FS.of(DE.key('a', DE.required, FS.of(DE.leaf('a', 'parsable to a number')))))))
        )
        assert.deepStrictEqual(
          lazyCodec.decode({ a: '1', b: {} }),
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

    describe('encode', () => {
      it('should encode a value', () => {
        assert.deepStrictEqual(lazyCodec.encoder.decode({ a: 1 }), { a: '1' })
        assert.deepStrictEqual(lazyCodec.encoder.decode({ a: 1, b: { a: 2 } }), { a: '1', b: { a: '2' } })
      })
    })
  })

  it('#453', () => {
    const Base64: _.Codec<string, string, string> = {
      decode: (s) =>
        E.tryCatch(
          () => Buffer.from(s, 'base64').toString(),
          () => D.error(s, 'Base64')
        ),
      encode: (s) => Buffer.from(s).toString('base64')
    }

    const Json: _.Codec<string, string, Json> = {
      decode: (s) => parseJSON(s, () => D.error(s, 'Json')),
      encode: (a) => JSON.stringify(a)
    }

    const DateFromString: _.Codec<string, string, Date> = _.make(
      {
        decode: (s) => {
          const d = new Date(s)
          return isNaN(d.getTime()) ? D.failure(s, 'DateFromISOString') : D.success(d)
        }
      },
      { encode: String }
    )

    const User = _.struct({ a: _.string, b: pipe(_.string, _.compose(DateFromString)) })

    const codec = pipe(_.string, _.compose(Base64), _.compose(Json), _.compose(User))

    assert.deepStrictEqual(
      codec.decode(codec.encoder.decode({ a: 'a', b: new Date('1980') })),
      E.right({
        a: 'a',
        b: new Date('1980')
      })
    )
  })
})
