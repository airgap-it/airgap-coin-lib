var path = require('path');
var minimatch = require('../../minimatch-3.0.4/minimatch');
var getAllFiles = require('./getAllFiles');

function getFilteredFiles(options) {
  var searchPath = options.path;
  var includes = options.include || ['**/*'];
  var excludes = options.exclude || [];

  if (typeof includes === 'string') {
    includes = [includes];
  }

  if (typeof excludes === 'string') {
    excludes = [excludes];
  }

  return getAllFiles(searchPath)
    .map(toPathRelativeFilename)
    .filter(fileMatchesInclude)
    .reject(fileMatchesExclude)
    .map(toAbsoluteFilename);

  // --------------

  function toPathRelativeFilename(file) {
    return path.relative(searchPath, file);
  }

  function toAbsoluteFilename(file) {
    return path.resolve(searchPath, file);
  }

  function fileMatchesInclude(file) {
    return includes.some(function (include) {
      return minimatch(file, include);
    });
  }

  function fileMatchesExclude(file) {
    return excludes.some(function (excludes) {
      return minimatch(file, excludes);
    });
  }
}

module.exports = getFilteredFiles;
