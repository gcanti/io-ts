import * as assert from 'assert'
import * as t from '../src/index'
import { assertSuccess, assertFailure, assertStrictEqual, NumberFromString } from './helpers'

interface PositiveBrand {
  readonly Positive: unique symbol
}

const Positive = t.brand(t.number, (n): n is t.Branded<number, PositiveBrand> => n >= 0, 'Positive')

interface MyDictionaryBrand {
  readonly MyDictionary: unique symbol
}

const MyDictionary = t.brand(
  t.UnknownRecord,
  (_): _ is t.Branded<t.TypeOf<typeof t.UnknownRecord>, MyDictionaryBrand> => true,
  'MyDictionary'
)

interface MyNumberArrayBrand {
  readonly MyNumberArray: unique symbol
}

const MyNumberArray = t.brand(
  t.array(t.number),
  (_): _ is t.Branded<Array<number>, MyNumberArrayBrand> => true,
  'MyNumberArray'
)

interface MyNumberFromStringArrayBrand {
  readonly MyNumberFromStringArray: unique symbol
}

const MyNumberFromStringArray = t.brand(
  t.array(NumberFromString),
  (_): _ is t.Branded<Array<number>, MyNumberFromStringArrayBrand> => true,
  'MyNumberFromStringArray'
)

const IntFromString = NumberFromString.pipe(t.Int, 'IntFromString')

describe('brand', () => {
  describe('name', () => {
    it('should accept a name', () => {
      const T = Positive
      assert.strictEqual(T.name, 'Positive')
    })
  })

  describe('is', () => {
    it('should check a isomorphic value', () => {
      const T = t.Int
      assert.strictEqual(T.is(1.2), false)
      assert.strictEqual(T.is('a'), false)
      assert.strictEqual(T.is(1), true)
    })

    it('should check a prismatic value', () => {
      const T = IntFromString
      assert.strictEqual(T.is(1.2), false)
      assert.strictEqual(T.is('a'), false)
      assert.strictEqual(T.is(1), true)
    })
  })

  describe('decode', () => {
    it('should succeed validating a valid value', () => {
      const T = Positive
      assertSuccess(T.decode(0))
      assertSuccess(T.decode(1))
    })

    it('should return the same reference if validation succeeded', () => {
      const T = MyDictionary
      const value = {}
      assertStrictEqual(T.decode(value), value)
    })

    it('should fail validating an invalid value', () => {
      const T = t.Int
      assertFailure(T, 'a', ['Invalid value "a" supplied to : Int'])
      assertFailure(T, 1.2, ['Invalid value 1.2 supplied to : Int'])
    })

    it('should fail with the last deserialized value', () => {
      const T = IntFromString
      assertFailure(T, 'a', ['cannot parse to a number'])
      assertFailure(T, '1.2', ['Invalid value 1.2 supplied to : IntFromString'])
    })
  })

  describe('encode', () => {
    it('should encode a prismatic value', () => {
      const T = MyNumberFromStringArray
      assert.deepStrictEqual(T.encode([1] as any), ['1'])
    })

    it('should return the same reference while encoding', () => {
      const T = MyNumberArray
      assert.strictEqual(T.encode, t.identity)
    })
  })
})
