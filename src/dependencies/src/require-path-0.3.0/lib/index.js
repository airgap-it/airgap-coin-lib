var _ = require('../../highland-2.5.1/lib/index')
var path = require('path')
var getFilteredFiles = require('./getFilteredFiles')

module.exports = function requirePath(options) {
  var searchPaths = options.path
  if (typeof searchPaths === 'string') {
    searchPaths = [searchPaths]
  }

  return new Promise(function(resolve, reject) {
    _(searchPaths)
      .map(buildOptionsForPath)
      .flatMap(requireSinglePath)
      .collect()
      .map(tuplesToMap)
      .stopOnError(reject)
      .apply(resolve)
  })

  // ------

  function buildOptionsForPath(searchPath) {
    return {
      path: searchPath,
      include: options.include,
      exclude: options.exclude
    }
  }

  function tuplesToMap(tuples) {
    var result = {}
    tuples.forEach(function(tuple) {
      result[tuple[0]] = tuple[1]
    })
    return result
  }
}

function requireSinglePath(rawOptions) {
  var options = {
    path: rawOptions.path || '.',
    include: rawOptions.include || ['**/*.js', '**/*.json'],
    exclude: rawOptions.exclude || ['**/*Spec.js']
  }
  var searchPath = options.path

  var filteredAbsoluteFiles = getFilteredFiles(options)
  var relativeFiles = filteredAbsoluteFiles.observe().map(toPathRelativeFilename)

  var requiredModules = filteredAbsoluteFiles.map(require)

  var relativeFileRequireModuleTuples = relativeFiles.zip(requiredModules)

  return relativeFileRequireModuleTuples

  // ------

  function toPathRelativeFilename(file) {
    return path.relative(searchPath, file)
  }
}
