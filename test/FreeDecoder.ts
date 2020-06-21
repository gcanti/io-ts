import * as assert from 'assert'
import * as DE from '../src/DecoderError'
import * as FD from '../src/FreeDecoder'
import * as FS from '../src/FreeSemigroup'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import { drawTree } from 'fp-ts/lib/Tree'

describe('FreeDecoder', () => {
  it('type', () => {
    const decoder = FD.type({
      name: FD.string,
      age: FD.number
    })
    assert.deepStrictEqual(decoder.decode({ name: 'name', age: 18 }), E.right({ name: 'name', age: 18 }))
    assert.deepStrictEqual(decoder.decode(null), E.left(FS.of(DE.leaf(null, 'Record<string, unknown>'))))
    assert.deepStrictEqual(
      decoder.decode({}),
      E.left(
        FS.concat(
          FS.of(DE.required('name', FS.of(DE.leaf(undefined, 'string')))),
          FS.of(DE.required('age', FS.of(DE.leaf(undefined, 'number'))))
        )
      )
    )
  })

  it('toForest', () => {
    const decoder = FD.type({
      name: FD.string,
      age: FD.number
    })
    const s = pipe(
      decoder.decode({}),
      E.mapLeft(FD.toForest),
      E.fold(
        (forest) => forest.map(drawTree).join('\n'),
        () => ''
      )
    )
    assert.deepStrictEqual(
      s,
      `required property \"name\"
└─ cannot decode undefined, should be string
required property \"age\"
└─ cannot decode undefined, should be number`
    )
  })
})
