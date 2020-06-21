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

Guard (good) x 35,343,457 ops/sec ±1.74% (82 runs sampled)
Decoder (good) x 4,830,970 ops/sec ±0.67% (87 runs sampled)
DecoderT (good) x 2,335,998 ops/sec ±0.78% (88 runs sampled)
Guard (bad) x 34,999,708 ops/sec ±1.77% (80 runs sampled)
Decoder (bad) x 1,225,579 ops/sec ±0.76% (89 runs sampled)
DecoderT (bad) x 2,048,515 ops/sec ±0.59% (87 runs sampled)
Decoder (draw) x 584,376 ops/sec ±2.17% (90 runs sampled)
DecoderT (draw) x 368,724 ops/sec ±0.66% (84 runs sampled)

*/

const decoder = D.type({
  name: D.string,
  age: D.number
})

function getDecoderT() {
  type E = string
  const M = E.getValidation(DE.getSemigroup<E>())
  function fromGuard<A>(guard: G.Guard<A>, expected: E): DT.DecoderT<E.URI, FS.FreeSemigroup<DE.DecodeError<E>>, A> {
    return {
      decode: (u) => (guard.is(u) ? E.right(u) : E.left(FS.of(DE.leaf(u, expected))))
    }
  }

  const UnknownRecord = fromGuard(G.UnknownRecord, 'Record<string, unknown>')
  const string = fromGuard(G.string, 'string')
  const number = fromGuard(G.number, 'number')
  const type = DT.type(M)(UnknownRecord, (k, e) => FS.of(DE.key(k, DE.required, e)))

  return type({
    name: string,
    age: number
  })
}

function toForest<E>(s: FS.FreeSemigroup<DE.DecodeError<E>>): NEA.NonEmptyArray<T.Tree<string>> {
  const toTree: (e: DE.DecodeError<E>) => T.Tree<string> = DE.fold({
    Leaf: (input, error) => T.make(`cannot decode ${JSON.stringify(input)}, should be ${error}`),
    Key: (key, required, errors) =>
      T.make(`${required ? 'required' : 'optional'} property ${JSON.stringify(key)}`, toForest(errors)),
    Index: (key, required, errors) =>
      T.make(`${required ? 'required' : 'optional'} index ${JSON.stringify(key)}`, toForest(errors))
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
