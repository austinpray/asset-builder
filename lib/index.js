'use strict';
var _               = require('lodash');
var readManifest    = require('./readManifest');
var processManifest = require('./processManifest');
var buildGlobs      = require('./buildGlobs');
var mainBowerFiles  = require('main-bower-files');

var Manifest = function (path, options) {
  var m = processManifest(readManifest(path));
  var bower = mainBowerFiles(_.pick(options, [
    'paths'
  ]));
  return _.merge(m, {
    globs: new buildGlobs(m, bower, options)
  });
};

module.exports = Manifest;
