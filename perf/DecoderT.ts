import * as Benchmark from 'benchmark'
import * as E from 'fp-ts/lib/Either'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import { pipe } from 'fp-ts/lib/pipeable'
import * as T from 'fp-ts/lib/Tree'
import * as D from '../src/Decoder'
import * as DT from '../src/DecoderT'
import * as FD from '../src/FreeDecoder'
import { draw } from '../src/Tree'
import * as G from '../src/Guard'

/*

Guard (good) x 36,532,824 ops/sec ±1.24% (85 runs sampled)
Decoder (good) x 4,814,205 ops/sec ±0.72% (88 runs sampled)
DecoderT (good) x 2,401,887 ops/sec ±0.53% (89 runs sampled)
FreeDecoder (good) x 2,188,382 ops/sec ±0.55% (87 runs sampled)
Guard (bad) x 35,652,287 ops/sec ±1.48% (84 runs sampled)
Decoder (bad) x 1,231,770 ops/sec ±0.52% (89 runs sampled)
DecoderT (bad) x 742,324 ops/sec ±2.24% (88 runs sampled)
FreeDecoder (bad) x 1,877,380 ops/sec ±0.69% (86 runs sampled)
Decoder (draw) x 593,043 ops/sec ±0.53% (90 runs sampled)
DecoderT (draw) x 455,839 ops/sec ±0.52% (88 runs sampled)
FreeDecoder (draw) x 375,678 ops/sec ±0.50% (86 runs sampled)

*/

const decoder = D.type({
  name: D.string,
  age: D.number
})

function getDecoderT() {
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

  return type({
    name: string,
    age: number
  })
}

const decoderT = getDecoderT()

function getFreeDecoder() {
  return FD.type({
    name: FD.string,
    age: FD.number
  })
}

const freeDecoder = getFreeDecoder()

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
  .add('FreeDecoder (good)', function () {
    freeDecoder.decode(good)
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
  .add('FreeDecoder (bad)', function () {
    freeDecoder.decode(bad)
  })
  .add('Decoder (draw)', function () {
    pipe(decoder.decode(bad), E.mapLeft(draw))
  })
  .add('DecoderT (draw)', function () {
    pipe(decoderT.decode(bad), E.mapLeft(draw))
  })
  .add('FreeDecoder (draw)', function () {
    pipe(
      freeDecoder.decode(bad),
      E.mapLeft((e) => draw(FD.toForest(e)))
    )
  })
  .on('cycle', function (event: any) {
    console.log(String(event.target))
  })
  .on('complete', function (this: any) {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
