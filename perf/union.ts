import * as Benchmark from 'benchmark'
import * as t from '../src'

const suite = new Benchmark.Suite()

const makeType = <L extends string>(L: L) =>
  t.type(
    {
      type: t.literal(L),
      a: t.string
    },
    L
  )

const T = t.union(['A', 'B', 'C', 'D', 'E'].map(makeType) as any)

const valid = { type: 'E', a: 'a' }
const invalid = { type: 'Z' }

suite
  .add('union (decode) (valid)', function() {
    T.decode(valid)
  })
  .add('union (decode) (invalid)', function() {
    T.decode(invalid)
  })
  .add('union (encode) (valid)', function() {
    T.encode(valid)
  })
  .add('union (create)', function() {
    t.union(['A', 'B', 'C', 'D', 'E'].map(makeType) as any)
  })
  .on('cycle', function(event: any) {
    console.log(String(event.target))
  })
  .on('complete', function(this: any) {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
