import * as assert from 'assert'
import * as E from 'fp-ts/lib/Either'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as DT from '../src/DecoderT'
import { pipe } from 'fp-ts/lib/pipeable'
import * as TE from 'fp-ts/lib/TaskEither'
import * as T from 'fp-ts/lib/Tree'
import { MonadThrow2C } from 'fp-ts/lib/MonadThrow'
import { Bifunctor2 } from 'fp-ts/lib/Bifunctor'

const M = E.getValidation(NEA.getSemigroup<T.Tree<string>>())
const UnknownArray = DT.UnknownArray(M)((u) => [T.make(`cannot decode ${JSON.stringify(u)}, should be Array<unknown>`)])
const UnknownRecord = DT.UnknownRecord(M)((u) => [
  T.make(`cannot decode ${JSON.stringify(u)}, should be Record<string, unknown>`)
])
export const string = DT.string(M)((u) => [T.make(`cannot decode ${JSON.stringify(u)}, should be string`)])
export const number = DT.number(M)((u) => [T.make(`cannot decode ${JSON.stringify(u)}, should be number`)])
export const boolean = DT.boolean(M)((u) => [T.make(`cannot decode ${JSON.stringify(u)}, should be boolean`)])
export const type = DT.type(M)(UnknownRecord, (k, e) =>
  pipe(
    e,
    NEA.map((e) => T.make(`required property ${JSON.stringify(k)}`, [e]))
  )
)

describe('DecoderT', () => {
  it('should support asynchronous decoders', async () => {
    const M = TE.getTaskValidation(NEA.getSemigroup<string>())
    const UnknownArray = DT.UnknownArray(M)((u) => [`cannot decode ${JSON.stringify(u)}, should be Array<unknown>`])
    const array = DT.array(M)(UnknownArray, (i, e) =>
      pipe(
        e,
        NEA.map((s) => `item ${i}: ${s}`)
      )
    )
    const string = DT.string(M)((u) => [`cannot decode ${JSON.stringify(u)}, should be string`])
    const decoder = array(string)
    assert.deepStrictEqual(await decoder.decode(['a', 'b'])(), E.right(['a', 'b']))
    assert.deepStrictEqual(
      await decoder.decode([1, 2])(),
      E.left(['item 0: cannot decode 1, should be string', 'item 1: cannot decode 2, should be string'])
    )
  })

  it('should support fail fast decoders', () => {
    const M: MonadThrow2C<E.URI, string> & Bifunctor2<E.URI> = E.either as any
    const UnknownArray = DT.UnknownArray(M)((u) => `cannot decode ${JSON.stringify(u)}, should be Array<unknown>`)
    const array = DT.array(M)(UnknownArray, (i, e) => `item ${i}: ${e}`)
    const string = DT.string(M)((u) => `cannot decode ${JSON.stringify(u)}, should be string`)
    const decoder = array(string)
    assert.deepStrictEqual(decoder.decode(['a', 'b']), E.right(['a', 'b']))
    assert.deepStrictEqual(decoder.decode([1, 2]), E.left('item 0: cannot decode 1, should be string'))
  })

  it('boolean', () => {
    assert.deepStrictEqual(boolean.decode(true), E.right(true))
    assert.deepStrictEqual(boolean.decode(false), E.right(false))
    assert.deepStrictEqual(boolean.decode(null), E.left([T.make('cannot decode null, should be boolean')]))
  })

  it('array', () => {
    const array = DT.array(M)(UnknownArray, (i, e) =>
      pipe(
        e,
        NEA.map((e) => T.make(`item ${i}`, [e]))
      )
    )
    const decoder = array(string)
    assert.deepStrictEqual(decoder.decode(['a', 'b']), E.right(['a', 'b']))
    assert.deepStrictEqual(decoder.decode(null), E.left([T.make('cannot decode null, should be Array<unknown>')]))
    assert.deepStrictEqual(
      decoder.decode([1, 2]),
      E.left([
        T.make('item 0', [T.make('cannot decode 1, should be string')]),
        T.make('item 1', [T.make('cannot decode 2, should be string')])
      ])
    )
  })

  it('record', () => {
    const record = DT.record(M)(UnknownRecord, (k, e) =>
      pipe(
        e,
        NEA.map((e) => T.make(`key ${JSON.stringify(k)}`, [e]))
      )
    )
    const decoder = record(string)
    assert.deepStrictEqual(decoder.decode({}), E.right({}))
    assert.deepStrictEqual(decoder.decode({ a: 'a' }), E.right({ a: 'a' }))
    assert.deepStrictEqual(
      decoder.decode(null),
      E.left([T.make('cannot decode null, should be Record<string, unknown>')])
    )
    assert.deepStrictEqual(
      decoder.decode({ a: 1, b: 2 }),
      E.left([
        T.make('key "a"', [T.make('cannot decode 1, should be string')]),
        T.make('key "b"', [T.make('cannot decode 2, should be string')])
      ])
    )
  })

  it('type', () => {
    const decoder = type({
      name: string,
      age: number
    })
    assert.deepStrictEqual(decoder.decode({ name: 'name', age: 18 }), E.right({ name: 'name', age: 18 }))
    assert.deepStrictEqual(
      decoder.decode(null),
      E.left([T.make('cannot decode null, should be Record<string, unknown>')])
    )
    assert.deepStrictEqual(
      decoder.decode({}),
      E.left([
        T.make('required property "name"', [T.make('cannot decode undefined, should be string')]),
        T.make('required property "age"', [T.make('cannot decode undefined, should be number')])
      ])
    )
  })

  it('partial', () => {
    const partial = DT.partial(M)(UnknownRecord, (k, e) =>
      pipe(
        e,
        NEA.map((e) => T.make(`optional property ${JSON.stringify(k)}`, [e]))
      )
    )
    const decoder = partial({
      name: string,
      age: number
    })
    assert.deepStrictEqual(decoder.decode({ name: 'name', age: 18 }), E.right({ name: 'name', age: 18 }))
    assert.deepStrictEqual(decoder.decode({}), E.right({}))
    assert.deepStrictEqual(
      decoder.decode(null),
      E.left([T.make('cannot decode null, should be Record<string, unknown>')])
    )
    assert.deepStrictEqual(
      decoder.decode({ name: 1, age: 'a' }),
      E.left([
        T.make('optional property "name"', [T.make('cannot decode 1, should be string')]),
        T.make('optional property "age"', [T.make('cannot decode "a", should be number')])
      ])
    )
  })
})
