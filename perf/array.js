var Benchmark = require('benchmark')
var t = require('../lib/index')

const suite = new Benchmark.Suite()

const T = t.array(t.number)

const valid = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const invalid = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'a']

suite
  .add('t.array (valid)', function() {
    T.decode(valid)
  })
  .add('t.array (invalid)', function() {
    T.decode(invalid)
  })
  .on('cycle', function(event) {
    console.log(String(event.target))
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
