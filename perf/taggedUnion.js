var Benchmark = require('benchmark')
var t = require('../lib/index')

const suite = new Benchmark.Suite()

const CreateCart = t.type(
  {
    aggType: t.literal('cart'),
    eventType: t.literal('create'),
    foo: t.string,
    bar: t.number
  },
  'CreateCart'
)

const CheckoutCart = t.type(
  {
    aggType: t.literal('cart'),
    eventType: t.literal('checkout'),
    foo: t.string,
    bar: t.number
  },
  'CheckoutCart'
)

const CreateItem = t.strict(
  {
    aggType: t.literal('item'),
    eventType: t.literal('create'),
    foo: t.string,
    bar: t.number
  },
  'CreateItem'
)

const UpdatePriceItem = t.refinement(
  t.type({
    aggType: t.literal('item'),
    eventType: t.literal('updatePrice'),
    foo: t.string,
    bar: t.number
  }),
  ({ bar }) => bar > 2,
  'UpdatePriceItem'
)

const TaggedCarts = t.taggedUnion('eventType', [CreateCart, CheckoutCart], 'Carts')
const TaggedItems = t.taggedUnion('eventType', [CreateItem, UpdatePriceItem], 'Items')
const TaggedAll = t.taggedUnion('aggType', [TaggedCarts, TaggedItems], 'All')

const Carts = t.union([CreateCart, CheckoutCart], 'Carts')
const Items = t.union([CreateItem, UpdatePriceItem], 'Items')
const All = t.union([Carts, Items], 'All')

const goodCart = { aggType: 'cart', eventType: 'create', foo: 'foo', bar: 1 }
const badCart = { aggType: 'cart', eventType: 'create', foo: 'foo' }

const goodUpdatePrice = { aggType: 'item', eventType: 'updatePrice', foo: 'foo', bar: 3 }
const badUpdatePrice = { aggType: 'item', eventType: 'updatePrice', foo: 'foo' }

// console.log(t.validate(goodPayload, TaggedAll))
// console.log(t.validate(goodPayload, All))
// console.log(t.validate(badPayload, TaggedAll))
// console.log(t.validate(badPayload, All))

suite
  .add('union (good cart)', function() {
    t.validate(goodCart, All)
  })
  .add('taggedUnion (good cart)', function() {
    t.validate(goodCart, TaggedAll)
  })
  .add('union (bad cart)', function() {
    t.validate(badCart, All)
  })
  .add('taggedUnion (bad cart)', function() {
    t.validate(badCart, TaggedAll)
  })
  .add('union (good updatePrice)', function() {
    t.validate(goodUpdatePrice, All)
  })
  .add('taggedUnion (good updatePrice)', function() {
    t.validate(goodUpdatePrice, TaggedAll)
  })
  .add('union (bad updatePrice)', function() {
    t.validate(badUpdatePrice, All)
  })
  .add('taggedUnion (bad updatePrice)', function() {
    t.validate(badUpdatePrice, TaggedAll)
  })
  .on('cycle', function(event) {
    console.log(String(event.target))
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
