import * as assert from 'assert'
import * as E from 'fp-ts/lib/Either'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as DT from '../src/DecoderT'
import { pipe } from 'fp-ts/lib/pipeable'
import * as TE from 'fp-ts/lib/TaskEither'
import * as T from 'fp-ts/lib/Tree'
import { draw } from '../src/Tree'
import { MonadThrow2C } from 'fp-ts/lib/MonadThrow'
import { Bifunctor2 } from 'fp-ts/lib/Bifunctor'

describe('DecoderT', () => {
  it('should support synchronous decoders', () => {
    const M = E.getValidation(NEA.getSemigroup<string>())
    const UnknownArray = DT.UnknownArray(M)((u) => [`cannot decode ${JSON.stringify(u)}, should be Array<unknown>`])
    const array = DT.array(M)(UnknownArray, (i, e) =>
      pipe(
        e,
        NEA.map((s) => `item ${i}: ${s}`)
      )
    )
    const string = DT.string(M)((u) => [`cannot decode ${JSON.stringify(u)}, should be string`])
    const decoder = array(string)
    assert.deepStrictEqual(decoder.decode(['a', 'b']), E.right(['a', 'b']))
    assert.deepStrictEqual(
      decoder.decode([1, 2]),
      E.left(['item 0: cannot decode 1, should be string', 'item 1: cannot decode 2, should be string'])
    )
  })

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

  it('should support default DecoderError', () => {
    const M = E.getValidation(NEA.getSemigroup<T.Tree<string>>())
    const UnknownArray = DT.UnknownArray(M)((u) => [
      T.make(`cannot decode ${JSON.stringify(u)}, should be Array<unknown>`)
    ])
    const array = DT.array(M)(UnknownArray, (i, e) => [T.make(`item ${i}`, e)])
    const string = DT.string(M)((u) => [T.make(`cannot decode ${JSON.stringify(u)}, should be string`)])
    const decoder = array(string)
    assert.deepStrictEqual(decoder.decode(['a', 'b']), E.right(['a', 'b']))
    assert.deepStrictEqual(
      pipe(decoder.decode([1, 2]), E.mapLeft(draw)),
      E.left(`item 0
└─ cannot decode 1, should be string
item 1
└─ cannot decode 2, should be string`)
    )
  })
})
