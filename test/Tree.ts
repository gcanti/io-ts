import * as assert from 'assert'
import * as E from 'fp-ts/lib/Either'
import * as D from '../src/Decoder'
import { draw } from '../src/Tree'
import { pipe } from 'fp-ts/lib/pipeable'

describe('Tree', () => {
  it('should draw a tree', () => {
    const codec = D.type({
      a: D.string
    })
    assert.deepStrictEqual(pipe(codec.decode({ a: 'a' }), E.mapLeft(draw)), E.right({ a: 'a' }))
    assert.deepStrictEqual(
      pipe(codec.decode({ a: 1 }), E.mapLeft(draw)),
      E.left(`required property "a"
└─ cannot decode 1, should be string`)
    )
  })
})
