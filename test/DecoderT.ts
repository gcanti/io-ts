import * as assert from 'assert'
import * as E from 'fp-ts/lib/Either'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as T from 'fp-ts/lib/Tree'
import * as DT from '../src/DecoderT'
import * as G from '../src/Guard'

const M = E.getValidation(NEA.getSemigroup<T.Tree<string>>())

describe('DecoderT', () => {
  it('fromGuard', () => {
    const fromGuard = <A>(guard: G.Guard<A>, expected: string) =>
      DT.fromGuard(M)(guard, (u) => [T.make(`cannot decode ${JSON.stringify(u)}, should be ${expected}`)])

    const string = fromGuard(G.string, 'string')
    assert.deepStrictEqual(string.decode('a'), E.right('a'))
    assert.deepStrictEqual(string.decode(null), E.left([T.make('cannot decode null, should be string')]))
  })

  it('literal', () => {
    const literal = DT.literal(M)((u, values) => [
      T.make(
        `cannot decode ${JSON.stringify(u)}, should be ${values.map((value) => JSON.stringify(value)).join(' | ')}`
      )
    ])
    assert.deepStrictEqual(literal('a').decode('a'), E.right('a'))
    assert.deepStrictEqual(literal('a').decode('b'), E.left([T.make('cannot decode "b", should be "a"')]))
  })
})
