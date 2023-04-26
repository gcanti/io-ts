import * as assert from 'assert'
import * as fc from 'fast-check'
import { isLeft, isRight } from 'fp-ts/lib/Either'
import { HKT, Kind, Kind2, URIS, URIS2 } from 'fp-ts/lib/HKT'
import { pipe } from 'fp-ts/lib/pipeable'

import * as t from '../src'
import * as D from '../src/Decoder'
import * as G from '../src/Guard'
import {
  memoize,
  Schemable,
  Schemable1,
  Schemable2C,
  WithUnion,
  WithUnion1,
  WithUnion2C,
  WithUnknownContainers,
  WithUnknownContainers1,
  WithUnknownContainers2C
} from '../src/Schemable'
import * as _ from '../src/Type'
import * as A from './Arbitrary'

interface Schema<A> {
  <S>(S: Schemable<S> & WithUnknownContainers<S> & WithUnion<S>): HKT<S, A>
}

function make<A>(f: Schema<A>): Schema<A> {
  return memoize(f)
}

const interpreter: {
  <S extends URIS2>(S: Schemable2C<S, unknown> & WithUnknownContainers2C<S, unknown> & WithUnion2C<S, unknown>): <A>(
    schema: Schema<A>
  ) => Kind2<S, unknown, A>
  <S extends URIS>(S: Schemable1<S> & WithUnknownContainers1<S> & WithUnion1<S>): <A>(schema: Schema<A>) => Kind<S, A>
} = (S: any) => (schema: any) => schema(S)

function check<A>(schema: Schema<A>, type: t.Type<A>): void {
  const arb = interpreter(A.Schemable)(schema)
  const decoder = interpreter({ ...D.Schemable, ...D.WithUnknownContainers, ...D.WithUnion })(schema)
  const guard = interpreter({ ...G.Schemable, ...G.WithUnknownContainers, ...G.WithUnion })(schema)
  const itype = interpreter({ ..._.Schemable, ..._.WithUnknownContainers, ..._.WithUnion })(schema)
  // decoder and type should be aligned
  fc.assert(fc.property(arb, (a) => isRight(decoder.decode(a)) === isRight(type.decode(a))))
  // interpreted type and type should be aligned
  fc.assert(fc.property(arb, (a) => isRight(itype.decode(a)) === isRight(type.decode(a))))
  // guard and `Type`'s `is` should be aligned
  fc.assert(fc.property(arb, (a) => guard.is(a) === type.is(a)))
}

describe.concurrent('Type', () => {
  it('string', () => {
    check(
      make((S) => S.string),
      t.string
    )
  })

  describe.concurrent('number', () => {
    it('number', () => {
      check(
        make((S) => S.number),
        t.number
      )
    })

    it('should exclude NaN', () => {
      assert.deepStrictEqual(isLeft(_.number.decode(NaN)), true)
    })
  })

  it('boolean', () => {
    check(
      make((S) => S.boolean),
      t.boolean
    )
  })

  it('UnknownArray', () => {
    check(
      make((S) => S.UnknownArray),
      t.UnknownArray
    )
  })

  it('UnknownRecord', () => {
    check(
      make((S) => S.UnknownRecord),
      t.UnknownRecord
    )
  })

  it('literal', () => {
    check(
      make((S) => S.literal('a', 'b')),
      t.keyof({ a: null, b: null })
    )
  })

  it('nullable', () => {
    check(
      make((S) => S.nullable(S.string)),
      t.union([t.null, t.string])
    )
  })

  it('struct', () => {
    check(
      make((S) =>
        S.struct({
          name: S.string,
          age: S.number
        })
      ),
      t.type({
        name: t.string,
        age: t.number
      })
    )
  })

  it('partial', () => {
    check(
      make((S) =>
        S.partial({
          name: S.string,
          age: S.number
        })
      ),
      t.partial({
        name: t.string,
        age: t.number
      })
    )
  })

  it('record', () => {
    check(
      make((S) => S.record(S.string)),
      t.record(t.string, t.string)
    )
  })

  it('array', () => {
    check(
      make((S) => S.array(S.string)),
      t.array(t.string)
    )
  })

  it('tuple', () => {
    check(
      make((S) => S.tuple(S.string)),
      t.tuple([t.string])
    )
    check(
      make((S) => S.tuple(S.string, S.number)),
      t.tuple([t.string, t.number])
    )
  })

  it('intersect', () => {
    check(
      make((S) => pipe(S.struct({ a: S.string }), S.intersect(S.struct({ b: S.number })))),
      t.intersection([t.type({ a: t.string }), t.type({ b: t.number })])
    )
  })

  it('sum', () => {
    check(
      make((S) =>
        S.sum('_tag')({
          A: S.struct({ _tag: S.literal('A'), a: S.string }),
          B: S.struct({ _tag: S.literal('B'), b: S.number })
        })
      ),
      t.union([t.type({ _tag: t.literal('A'), a: t.string }), t.type({ _tag: t.literal('B'), b: t.number })])
    )
  })

  it('lazy', () => {
    interface A {
      a: string
      b?: A
      c?: number
    }

    const schema: Schema<A> = make((S) =>
      S.lazy('A', () => pipe(S.struct({ a: S.string }), S.intersect(S.partial({ b: schema(S), c: S.number }))))
    )
    const type: t.Type<A> = t.recursion('A', () =>
      t.intersection([t.type({ a: t.string }), t.partial({ b: type, c: t.number })])
    )
    check(schema, type)
  })

  it('union', () => {
    check(
      make((S) => S.union(S.string, S.number)),
      t.union([t.string, t.number])
    )
  })

  it('refine', () => {
    interface NonEmptyStringBrand {
      readonly NonEmptyString: unique symbol
    }
    type NonEmptyString = string & NonEmptyStringBrand
    const type = pipe(
      _.string,
      _.refine((s): s is NonEmptyString => s.length > 0, 'NonEmptyString')
    )
    assert.deepStrictEqual(isRight(type.decode('a')), true)
    assert.deepStrictEqual(isRight(type.decode('')), false)
  })
})
