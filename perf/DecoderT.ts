import * as Benchmark from 'benchmark'
import * as E from 'fp-ts/lib/Either'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import { pipe } from 'fp-ts/lib/pipeable'
import * as T from 'fp-ts/lib/Tree'
import * as D from '../src/Decoder'
import * as DT from '../src/DecoderT'

/*

Decoder (good) x 4,979,890 ops/sec ±0.75% (89 runs sampled)
DecoderT (good) x 2,391,887 ops/sec ±0.56% (89 runs sampled)
Decoder (bad) x 1,251,694 ops/sec ±0.45% (91 runs sampled)
DecoderT (bad) x 715,112 ops/sec ±0.45% (87 runs sampled)

*/

const decoder = D.type({
  name: D.string,
  age: D.number
})

const M = E.getValidation(NEA.getSemigroup<T.Tree<string>>())
const UnknownRecord = DT.UnknownRecord(M)((u) => [
  T.make(`cannot decode ${JSON.stringify(u)}, should be Record<string, unknown>`)
])
const string = DT.string(M)((u) => [T.make(`cannot decode ${JSON.stringify(u)}, should be string`)])
const number = DT.number(M)((u) => [T.make(`cannot decode ${JSON.stringify(u)}, should be number`)])
const type = DT.type(M)(UnknownRecord, (k, e) =>
  pipe(
    e,
    NEA.map((e) => T.make(`required property ${JSON.stringify(k)}`, [e]))
  )
)

const decoderT = type({
  name: string,
  age: number
})

const good = {
  name: 'name',
  age: 18
}

const bad = {}

// console.log(decoder.decode(bad))
// console.log(decoderT.decode(bad))

const suite = new Benchmark.Suite()

suite
  .add('Decoder (good)', function () {
    decoder.decode(good)
  })
  .add('DecoderT (good)', function () {
    decoderT.decode(good)
  })
  .add('Decoder (bad)', function () {
    decoder.decode(bad)
  })
  .add('DecoderT (bad)', function () {
    decoderT.decode(bad)
  })
  .on('cycle', function (event: any) {
    console.log(String(event.target))
  })
  .on('complete', function (this: any) {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
