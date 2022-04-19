import * as Benchmark from 'benchmark'
import { pipe } from 'fp-ts/lib/pipeable'
import * as D from '../src/Decoder'
import { flow } from 'fp-ts/lib/function'
import * as TH from 'fp-ts/lib/These'
import * as util from 'util'
import * as _ from '../src/Decoder'
import { draw } from '../src/TreeReporter'

const printValue = (a: unknown): string => 'Value:\n' + util.format(a)
const printErrors = (s: string): string => 'Errors:\n' + s
const printWarnings = (s: string): string => 'Warnings:\n' + s

export const printAll = TH.fold(printErrors, printValue, (e, a) => printValue(a) + '\n' + printWarnings(e))

export const print = flow(TH.mapLeft(draw), printAll)

/*

Guard (good) x 36,163,576 ops/sec ±1.45% (86 runs sampled)
Decoder (good) x 2,365,294 ops/sec ±0.70% (87 runs sampled)
Guard (bad) x 34,845,843 ops/sec ±1.27% (84 runs sampled)
Decoder (bad) x 1,977,286 ops/sec ±0.86% (86 runs sampled)
Decoder (draw) x 365,279 ops/sec ±1.17% (82 runs sampled)

*/

const decoder = D.struct({
  name: D.string,
  age: D.number
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
  .add('Decoder (good)', function () {
    decoder.decode(good)
  })
  .add('Decoder (bad)', function () {
    decoder.decode(bad)
  })
  .add('Decoder (draw)', function () {
    pipe(decoder.decode(bad), print)
  })
  .on('cycle', function (event: any) {
    console.log(String(event.target))
  })
  .on('complete', function (this: any) {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
