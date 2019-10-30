/*
 * Bitcoin BIP32 path helpers
 * (C) 2016 Alex Beregszaszi
 */

const HARDENED = 0x80000000

var BIPPath = function (path) {
  if (!Array.isArray(path)) {
    throw new Error('Input must be an Array')
  }
  if (path.length === 0) {
    throw new Error('Path must contain at least one level')
  }
  for (var i = 0; i < path.length; i++) {
    if (typeof path[i] !== 'number') {
      throw new Error('Path element is not a number')
    }
  }
  this.path = path
}

BIPPath.validatePathArray = function (path) {
  try {
    BIPPath.fromPathArray(path)
    return true
  } catch (e) {
    return false
  }
}

BIPPath.validateString = function (text, reqRoot) {
  try {
    BIPPath.fromString(text, reqRoot)
    return true
  } catch (e) {
    return false
  }
}

BIPPath.fromPathArray = function (path) {
  return new BIPPath(path)
}

BIPPath.fromString = function (text, reqRoot) {
  // skip the root
  if (/^m\//i.test(text)) {
    text = text.slice(2)
  } else if (reqRoot) {
    throw new Error('Root element is required')
  }

  var path = text.split('/')
  var ret = new Array(path.length)
  for (var i = 0; i < path.length; i++) {
    var tmp = /(\d+)([hH\']?)/.exec(path[i])
    if (tmp === null) {
      throw new Error('Invalid input')
    }
    ret[i] = parseInt(tmp[1], 10)

    if (ret[i] >= HARDENED) {
      throw new Error('Invalid child index')
    }

    if (tmp[2] === 'h' || tmp[2] === 'H' || tmp[2] === '\'') {
      ret[i] += HARDENED
    } else if (tmp[2].length != 0) {
      throw new Error('Invalid modifier')
    }
  }
  return new BIPPath(ret)
}

BIPPath.prototype.toPathArray = function () {
  return this.path
}

BIPPath.prototype.toString = function (noRoot, oldStyle) {
  var ret = new Array(this.path.length)
  for (var i = 0; i < this.path.length; i++) {
    var tmp = this.path[i]
    if (tmp & HARDENED) {
      ret[i] = (tmp & ~HARDENED) + (oldStyle ? 'h' : '\'')
    } else {
      ret[i] = tmp
    }
  }
  return (noRoot ? '' : 'm/') + ret.join('/')
}

BIPPath.prototype.inspect = function () {
  return 'BIPPath <' + this.toString() + '>'
}

module.exports = BIPPath
