var pull = require('pull-stream')

function rate (s) {
  var recent = []
  var stream = pull.through(function (d) {
    recent.push({size: d.length, ts: Date.now()})
    if(recent.length > 5)
      recent.shift()

  })

  stream.rate = function () {
    var ts = Date.now()
    if(recent.length > 1) {
      var rate = (recent.reduce(function (size, item) {
        return size + item.size
      }, 0)/1000000) / ((ts - recent[0].ts)/1000)

      console.error(rate)
      return rate
    }
  }

  return stream
}

module.exports = rate
