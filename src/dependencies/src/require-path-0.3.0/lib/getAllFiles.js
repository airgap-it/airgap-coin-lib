var _ = require('../../highland-2.5.1/lib/index')
var fs = require('fs')
var readdir = _.wrapCallback(fs.readdir)
var stat = _.wrapCallback(fs.lstat)
var path = require('path')

function getAllFiles(searchPath) {
  return readdir(searchPath)
    .flatten()
    .map(toAbsolutePath(searchPath))
    .flatMap(mapFileOrDirectory)
}

function toAbsolutePath(parentPath) {
  return function(filename) {
    return path.join(parentPath, filename)
  }
}

function mapFileOrDirectory(absoluteFsEntry) {
  return stat(absoluteFsEntry).flatMap(function(fileStats) {
    if (fileStats.isDirectory()) {
      return getAllFiles(absoluteFsEntry)
    } else {
      return _([absoluteFsEntry])
    }
  })
}

module.exports = getAllFiles
