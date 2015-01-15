'use strict';

var _ = require('lodash');

/**
 * Dependency
 *
 * @param {String} name
 * @param {Object} dependency
 * @param {Array} bowerFiles
 * @return {Object}
 */
var Dependency = function (name, dependency) {
  this.type = Dependency.parseType(name);
  this.name = name;
  this.globs = [].concat(
    (dependency.vendor || []),
    (dependency.files  || [])
  );
};

/**
 * prependGlobs
 *
 * @param {Array} files
 * @return {undefined}
 */
Dependency.prototype.prependGlobs = function (files) {
  this.globs = [].concat(files, this.globs);
};

Dependency.parseType = function (name) {
  return _.last(name.split('.'));
};

module.exports = Dependency;
