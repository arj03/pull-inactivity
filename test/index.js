var crypto = require('crypto')

var pull = require('pull-stream')
var inactivity = require('../')
var tape = require('tape')

function rand (n) {
  return ~~(Math.pow(2, Math.random()) * n)
}

tape('abort stream when flow reduces to 10k/s', function (t) {
  t.plan(1)

  var flow = inactivity(0.01, function (err) {
    t.notOk(err)
  })

  var s = 0.1, n = 0
  pull(
    pull.infinite(),
    pull.asyncMap(function (d, cb) {
      setTimeout(function () {
        cb(null, crypto.randomBytes(rand(100)).toString('hex'))
      }, n++ < 100 ? rand(10) : rand(3000))
    }),
    pull.through(console.log),
    flow,
    pull.drain(null, function () {
      clearInterval(int)
      t.end()
    })
  )

  var int = setInterval(function () {
    console.log(flow.rate())
  }, 100)

})
