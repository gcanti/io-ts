var Benchmark = require('benchmark')
var t = require('../lib/index')

const suite = new Benchmark.Suite()

const pushAll = (xs, ys) => Array.prototype.push.apply(xs, ys)

const pushAll2 = (xs, ys) => {
  const ly = ys.length
  for (var i = 0; i < ly; i++) {
    xs.push(ys[i])
  }
}

suite
  .add('pushAll', function() {
    pushAll([], [1, 2, 3])
  })
  .add('pushAll2', function() {
    pushAll2([], [1, 2, 3])
  })
  .on('cycle', function(event) {
    console.log(String(event.target))
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
