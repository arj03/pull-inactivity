
var pull = require('pull-stream')
var Abortable = require('pull-abortable')
var Rate = require('./rate')

module.exports = function (min, onEnd) {
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
