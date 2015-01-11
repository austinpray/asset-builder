'use strict';
var _               = require('lodash');
var readManifest    = require('./readManifest');
var processManifest = require('./processManifest');
var buildGlobs      = require('./buildGlobs');
var mainBowerFiles  = require('main-bower-files');

var Manifest = function (path, options) {
  var manifest = processManifest(readManifest(path));
  var bower = mainBowerFiles(_.pick(options, [
    'paths'
  ]));
  this.globs = new buildGlobs(manifest.dependencies, bower, options).globs;
  this.paths = manifest.paths;
  this.config = manifest.config;
};

Manifest.prototype.forEachDependency = function (type, callback) {
  _.forEach(this.globs[type], callback);
};

module.exports = function (path, options) {
  return new Manifest(path, options);
};
module.exports.Manifest = Manifest;
