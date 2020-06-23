import * as Benchmark from 'benchmark'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import * as D from '../src/Decoder'
import * as G from '../src/Guard'

/*

Guard (good) x 35,916,863 ops/sec ±1.28% (86 runs sampled)
Decoder (good) x 4,855,216 ops/sec ±0.83% (89 runs sampled)
Decoder2 (good) x 2,397,112 ops/sec ±0.53% (87 runs sampled)
Guard (bad) x 35,685,300 ops/sec ±1.45% (85 runs sampled)
Decoder (bad) x 1,255,976 ops/sec ±0.60% (90 runs sampled)
Decoder2 (bad) x 2,054,836 ops/sec ±0.73% (85 runs sampled)
Decoder (draw) x 584,770 ops/sec ±1.83% (87 runs sampled)
Decoder2 (draw) x 368,364 ops/sec ±0.45% (84 runs sampled)

*/

const decoder = D.type({
  name: D.string,
  age: D.number
})

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
// console.log(JSON.stringify(freeDecoder.decode(bad), null, 2))

const suite = new Benchmark.Suite()

suite
  .add('Guard (good)', function () {
    guard.is(bad)
  })
  .add('Decoder (good)', function () {
    decoder.decode(good)
  })
  .add('Guard (bad)', function () {
    guard.is(bad)
  })
  .add('Decoder (bad)', function () {
    decoder.decode(bad)
  })
  .add('Decoder (draw)', function () {
    pipe(decoder.decode(bad), E.mapLeft(D.draw))
  })
  .on('cycle', function (event: any) {
    console.log(String(event.target))
  })
  .on('complete', function (this: any) {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
