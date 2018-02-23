var Benchmark = require('benchmark')
var t = require('../lib/index')

const suite = new Benchmark.Suite()

const T = t.partial({
  a: t.number,
  b: t.number,
  c: t.number,
  d: t.number
})

const valid = {
  a: 1,
  b: 2,
  c: 3,
  d: 4
}
const invalid = {
  a: 1,
  b: 2,
  c: 3,
  d: 'a'
}

suite
  .add('t.partial (valid)', function() {
    T.decode(valid)
  })
  .add('t.partial (invalid)', function() {
    T.decode(invalid)
  })
  .on('cycle', function(event) {
    console.log(String(event.target))
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
