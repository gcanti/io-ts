import * as Benchmark from 'benchmark'
import { SpaceObject, valid, invalid } from './SpaceObject'

const suite = new Benchmark.Suite()

suite
  .add('space-object (decode, valid)', function() {
    SpaceObject.decode(valid)
  })
  .add('space-object (is, valid)', function() {
    SpaceObject.is(valid)
  })
  .add('space-object (decode, invalid)', function() {
    SpaceObject.decode(invalid)
  })
  .add('space-object (is, invalid)', function() {
    SpaceObject.is(invalid)
  })
  .on('cycle', function(event: any) {
    console.log(String(event.target))
  })
  .on('complete', function(this: any) {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
