import * as Benchmark from 'benchmark'
import * as t from '../src'

const suite = new Benchmark.Suite()

const Vector = t.tuple([t.number, t.number, t.number])

const Asteroid = t.type({
  type: t.literal('asteroid'),
  location: Vector,
  mass: t.number
})

const Planet = t.type({
  type: t.literal('planet'),
  location: Vector,
  mass: t.number,
  population: t.number,
  habitable: t.boolean
})

const Rank = t.keyof({
  captain: null,
  'first mate': null,
  officer: null,
  ensign: null
})

const CrewMember = t.type({
  name: t.string,
  age: t.number,
  rank: Rank,
  home: Planet
})

const Ship = t.type({
  type: t.literal('ship'),
  location: Vector,
  mass: t.number,
  name: t.string,
  crew: t.array(CrewMember)
})

const SpaceObjectIots = t.union([Asteroid, Planet, Ship])

const valid = {
  type: 'ship',
  location: [1, 2, 3],
  mass: 4,
  name: 'foo',
  crew: [
    {
      name: 'bar',
      age: 44,
      rank: 'captain',
      home: {
        type: 'planet',
        location: [5, 6, 7],
        mass: 8,
        population: 1000,
        habitable: true
      }
    }
  ]
}

const invalid = {
  type: 'ship',
  location: [1, 2, 3],
  mass: 4,
  name: 'foo',
  crew: [
    {
      name: 'bar',
      age: 44,
      rank: 'captain',
      home: {
        type: 'planet',
        location: [5, 6, 7],
        mass: 8,
        population: 'a', // <= bad value here
        habitable: true
      }
    }
  ]
}

suite
  .add('space-object (decode, valid)', function() {
    SpaceObjectIots.decode(valid)
  })
  .add('space-object (is, valid)', function() {
    SpaceObjectIots.is(valid)
  })
  .add('space-object (decode, invalid)', function() {
    SpaceObjectIots.decode(invalid)
  })
  .add('space-object (is, invalid)', function() {
    SpaceObjectIots.is(invalid)
  })
  .on('cycle', function(event: any) {
    console.log(String(event.target))
  })
  .on('complete', function(this: any) {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
