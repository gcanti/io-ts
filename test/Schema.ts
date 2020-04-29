import { isRight, right } from 'fp-ts/lib/Either'
import { Schema, make } from '../src/Schema'
import * as G from '../src/Guard'
import * as D from '../src/Decoder'
import * as E from '../src/Encoder'
import * as C from '../src/Codec'
import * as A from './Arbitrary'
import * as fc from 'fast-check'
import * as assert from 'assert'

function isDeepStrictEqual(actual: unknown, expected: unknown): boolean {
  try {
    assert.deepStrictEqual(actual, expected)
    return true
  } catch {
    return false
  }
}

function check<A>(schema: Schema<A>): void {
  const arb = schema(A.arbitrary)
  const codec = schema(C.codec)
  const guard = schema(G.guard)
  // decoders and guards should be aligned
  fc.assert(fc.property(arb, (a) => guard.is(a) && isRight(codec.decode(a))))
  // laws
  fc.assert(fc.property(arb, (a) => isRight(codec.decode(codec.encode(a)))))
  fc.assert(
    fc.property(arb, (u) => {
      const a = codec.decode(u)
      return isRight(a) && isDeepStrictEqual(codec.encode(a.right), u)
    })
  )
}
describe('Schemable', () => {
  const Person = make((S) =>
    S.type({
      name: S.string,
      age: S.number
    })
  )

  it('should handle decoders', () => {
    assert.deepStrictEqual(Person(D.decoder).decode({ name: 'name', age: 46 }), right({ name: 'name', age: 46 }))
  })

  it('should handle encoders', () => {
    assert.deepStrictEqual(Person(E.encoder).encode({ name: 'name', age: 46 }), { name: 'name', age: 46 })
  })

  it('should handle guards', () => {
    assert.deepStrictEqual(Person(G.guard).is({ name: 'name', age: 46 }), true)
  })

  it('should handle codecs', () => {
    assert.deepStrictEqual(Person(C.codec).decode({ name: 'name', age: 46 }), right({ name: 'name', age: 46 }))
    assert.deepStrictEqual(Person(E.encoder).encode({ name: 'name', age: 46 }), { name: 'name', age: 46 })
  })

  it('string', () => {
    check(make((S) => S.string))
  })

  it('number', () => {
    check(make((S) => S.number))
  })

  it('boolean', () => {
    check(make((S) => S.boolean))
  })

  it('UnknownArray', () => {
    check(make((S) => S.UnknownArray))
  })

  it('UnknownRecord', () => {
    check(make((S) => S.UnknownRecord))
  })

  it('literal', () => {
    check(make((S) => S.literal('a')))
    check(make((S) => S.literal('a', 1)))
    check(make((S) => S.literal('a', null)))
  })

  it('nullable', () => {
    check(make((S) => S.nullable(S.string)))
  })

  it('type', () => {
    check(
      make((S) =>
        S.type({
          name: S.string,
          age: S.number
        })
      )
    )
  })

  it('partial', () => {
    check(
      make((S) =>
        S.partial({
          name: S.string,
          age: S.number
        })
      )
    )
  })

  it('record', () => {
    check(make((S) => S.record(S.string)))
  })

  it('array', () => {
    check(make((S) => S.array(S.string)))
  })

  it('tuple', () => {
    check(make((S) => S.tuple()))
    check(make((S) => S.tuple(S.string)))
    check(make((S) => S.tuple(S.string, S.number)))
  })

  it('intersection', () => {
    check(make((S) => S.intersection(S.type({ a: S.string }), S.type({ b: S.number }))))
  })

  it('sum', () => {
    const A = make((S) => S.type({ _tag: S.literal('A'), a: S.string }))
    const B = make((S) => S.type({ _tag: S.literal('B'), b: S.number }))
    check(make((S) => S.sum('_tag')({ A: A(S), B: B(S) })))
  })

  it('lazy', () => {
    interface A {
      a: string
      b?: A
      c?: number
    }

    const schema: Schema<A> = make((S) =>
      S.lazy('A', () => S.intersection(S.type({ a: S.string }), S.partial({ b: schema(S), c: S.number })))
    )
    check(schema)
  })
})
