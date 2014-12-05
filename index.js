
var pull = require('pull-stream')
var Abortable = require('pull-abortable')
var Rate = require('./rate')

module.exports = function (duplex, min, onEnd) {
  var n = 2, error

  function done (err) {
    error = error || err
    if(--n) return
    onEnd && onEnd(error)
  }

  var sourceAbort = Abortable(min, done)
  var sinkAbort   = Abortable(min, done)
  var sourceRate  = Rate()
  var sinkRate    = Rate()

  var interval = setInterval(function () {
    if((sourceRate.rate() + sinkRRate.rate()) < min) {
      clearInterval(interval)
      sourceAbort.abort(); sinkAbort.abort()
    }
  }, 500)


  return {
    source: pull(duplex.source, sourceRate, sourceAbort),
    sink  : pull(sinkRate, sinkAbort, duplex.sink)
  }

}

exports.through = function (min, onEnd) {
  min = min || 0.002 //2k per second
  var abortable = Abortable(onEnd)
  var flow = Rate()
  var interval = setInterval(function () {
    if(flow.rate() < min) {
      clearInterval(interval)
      abortable.abort()
    }
  }, 500)

  var stream = pull(
    flow,
    abortable,
    pull.through(null, function () {
      clearInterval(interval)
    })
  )

  stream.rate = flow.rate

  return stream
}

