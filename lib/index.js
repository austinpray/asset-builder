'use strict';
var _               = require('lodash');
var readManifest    = require('./readManifest');
var processManifest = require('./processManifest');
var buildGlobs      = require('./buildGlobs');
var Dependency      = require('./Dependency');
var mainBowerFiles  = require('main-bower-files');

var Manifest = function (path, options) {
  var manifest = processManifest(readManifest(path));
  var bower = mainBowerFiles(_.pick(options, [
    'paths'
  ]));
  this.config = manifest.config;
  this.dependencies = manifest.dependencies;
  this.globs = new buildGlobs(manifest.dependencies, bower, options).globs;
  this.paths = manifest.paths;
};

Manifest.prototype.forEachDependency = function (type, callback) {
  _.forEach(this.globs[type], callback);
};

Manifest.prototype.getProjectGlobs = function () {
  return _.reduce(this.dependencies, function (result, dep, key) {
    var type = Dependency.parseType(key);
    if(!_.isArray(result[type])) {
      result[type] = [];
    }
    result[type] = result[type].concat(dep.files);
    return result;
  }, {});
};

module.exports = function (path, options) {
  return new Manifest(path, options);
};
module.exports.Manifest = Manifest;
