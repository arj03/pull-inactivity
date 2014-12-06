
var pull = require('pull-stream')
var Abortable = require('pull-abortable')
var Rate = require('./rate')

module.exports = function (duplex, min, onEnd) {

  var n = 2, error, interval

  function done (err) {
    error = error || err
    if(--n) return
    clearInterval(interval)
    onEnd && onEnd(error)
  }

  min = min || 1000 //close after 1 second inactivity.

  var sourceAbort = Abortable(done)
  var sinkAbort   = Abortable(done)
  var sourceRate  = Rate()
  var sinkRate    = Rate()

  function rate () {
    return sourceRate.rate() + sinkRate.rate()
  }

  function abort () {
    clearInterval(interval)
    sourceAbort.abort()
    sinkAbort.abort()
  }

  interval = setInterval(function () {
    if(Math.max(sourceRate.ts, sinkRate.ts) + min < Date.now())
      abort()
  }, 200)

  return {
    source: pull(duplex.source, sourceRate, sourceAbort),
    sink  : pull(sinkRate, sinkAbort, duplex.sink),
    rate  : rate,
    abort : abort
  }

}

module.exports.through = function (min, onEnd) {
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
