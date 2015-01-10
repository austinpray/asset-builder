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
  var globs = new buildGlobs(manifest.dependencies, bower, options).globs;
  return _.merge(manifest, {
    globs: globs
  });
};

module.exports = Manifest;
