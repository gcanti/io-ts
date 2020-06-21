import * as Benchmark from 'benchmark'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import * as D from '../src/Decoder'
import * as DE from '../src/DecodeError'
import * as DT from '../src/DecoderT'
import * as FS from '../src/FreeSemigroup'
import * as G from '../src/Guard'
import * as T from 'fp-ts/lib/Tree'
import * as NEA from 'fp-ts/lib/NonEmptyArray'

/*

Guard (good) x 34,238,300 ops/sec ±1.99% (82 runs sampled)
Decoder (good) x 4,617,403 ops/sec ±0.87% (88 runs sampled)
DecoderT (good) x 2,334,698 ops/sec ±1.04% (87 runs sampled)
Guard (bad) x 35,743,005 ops/sec ±1.31% (82 runs sampled)
Decoder (bad) x 1,239,790 ops/sec ±0.65% (91 runs sampled)
DecoderT (bad) x 1,980,574 ops/sec ±0.51% (88 runs sampled)
Decoder (draw) x 589,953 ops/sec ±2.11% (87 runs sampled)
DecoderT (draw) x 380,337 ops/sec ±0.36% (85 runs sampled)

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

function toForest<E>(s: FS.FreeSemigroup<DE.DecodeError<E>>): NEA.NonEmptyArray<T.Tree<string>> {
  const toTree: (e: DE.DecodeError<E>) => T.Tree<string> = DE.fold({
    Leaf: (input, error) => T.make(`cannot decode ${JSON.stringify(input)}, should be ${error}`),
    Required: (key, errors) => T.make(`required property ${JSON.stringify(key)}`, toForest(errors))
  })
  const toForest: (f: FS.FreeSemigroup<DE.DecodeError<E>>) => NEA.NonEmptyArray<T.Tree<string>> = FS.fold(
    (value) => NEA.of(toTree(value)),
    (left, right) => NEA.concat(toForest(left), toForest(right))
  )
  return toForest(s)
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
      E.mapLeft((e) => D.draw(toForest(e)))
    )
  })
  .on('cycle', function (event: any) {
    console.log(String(event.target))
  })
  .on('complete', function (this: any) {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
