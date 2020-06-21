import * as Benchmark from 'benchmark'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import * as D from '../src/Decoder'
import * as DE from '../src/DecoderError'
import * as DT from '../src/DecoderT'
import * as FD from '../src/FreeDecoder'
import * as FS from '../src/FreeSemigroup'
import * as G from '../src/Guard'

/*

Guard (good) x 35,369,047 ops/sec ±1.50% (86 runs sampled)
Decoder (good) x 4,653,320 ops/sec ±0.76% (87 runs sampled)
DecoderT (good) x 2,295,214 ops/sec ±1.10% (88 runs sampled)
Guard (bad) x 35,062,516 ops/sec ±1.48% (82 runs sampled)
Decoder (bad) x 1,225,890 ops/sec ±0.74% (89 runs sampled)
DecoderT (bad) x 2,011,330 ops/sec ±0.60% (86 runs sampled)
Decoder (draw) x 568,278 ops/sec ±2.85% (84 runs sampled)
DecoderT (draw) x 376,532 ops/sec ±1.78% (85 runs sampled)

*/

const decoder = D.type({
  name: D.string,
  age: D.number
})

function getDecoderT() {
  const M = E.getValidation(DE.getSemigroup<string>())
  const UnknownRecord = DT.UnknownRecord(M)((u) => FS.of(DE.leaf(u, 'Record<string, unknown>')))
  const string = DT.string(M)((u) => FS.of(DE.leaf(u, 'string')))
  const number = DT.number(M)((u) => FS.of(DE.leaf(u, 'number')))
  const type = DT.type(M)(UnknownRecord, (k, e) => FS.of(DE.required(k, e)))

  return type({
    name: string,
    age: number
  })
}

const decoderT = getDecoderT()

const guard = G.type({
  name: G.string,
  age: G.number
})

const good = {
  name: 'name',
  age: 18
}

const bad = {}

// console.log(decoder.decode(bad))
// console.log(decoderT.decode(bad))
// console.log(JSON.stringify(freeDecoder.decode(bad), null, 2))

const suite = new Benchmark.Suite()

suite
  .add('Guard (good)', function () {
    guard.is(bad)
  })
  .add('Decoder (good)', function () {
    decoder.decode(good)
  })
  .add('DecoderT (good)', function () {
    decoderT.decode(good)
  })
  .add('Guard (bad)', function () {
    guard.is(bad)
  })
  .add('Decoder (bad)', function () {
    decoder.decode(bad)
  })
  .add('DecoderT (bad)', function () {
    decoderT.decode(bad)
  })
  .add('Decoder (draw)', function () {
    pipe(decoder.decode(bad), E.mapLeft(D.draw))
  })
  .add('DecoderT (draw)', function () {
    pipe(
      decoderT.decode(bad),
      E.mapLeft((e) => D.draw(FD.toForest(e)))
    )
  })
  .on('cycle', function (event: any) {
    console.log(String(event.target))
  })
  .on('complete', function (this: any) {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
