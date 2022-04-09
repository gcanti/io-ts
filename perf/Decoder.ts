import * as Benchmark from 'benchmark'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import * as D from '../src/Decoder'
import * as G from '../src/Guard'

/*

Guard (good) x 36,163,576 ops/sec ±1.45% (86 runs sampled)
Decoder (good) x 2,365,294 ops/sec ±0.70% (87 runs sampled)
Guard (bad) x 34,845,843 ops/sec ±1.27% (84 runs sampled)
Decoder (bad) x 1,977,286 ops/sec ±0.86% (86 runs sampled)
Decoder (draw) x 365,279 ops/sec ±1.17% (82 runs sampled)

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
