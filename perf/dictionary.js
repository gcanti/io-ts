var Benchmark = require('benchmark')
var t = require('../lib/index')

const suite = new Benchmark.Suite()

const T = t.dictionary(t.string, t.number)

const valid = {
  a: 1,
  b: 2,
  c: 3,
  d: 4,
  e: 5,
  f: 6,
  g: 7,
  h: 8,
  i: 9
}
const invalid = {
  a: 1,
  b: 2,
  c: 3,
  d: 4,
  e: 5,
  f: 6,
  g: 7,
  h: 8,
  i: 'a'
}

suite
  .add('t.dictionary (valid)', function() {
    T.decode(valid)
  })
  .add('t.dictionary (invalid)', function() {
    T.decode(invalid)
  })
  .on('cycle', function(event) {
    console.log(String(event.target))
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
