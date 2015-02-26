/**
 * buildGlobs
 * @module
 */
'use strict';

var _          = require('lodash');
var obj        = require('object-path');
var minimatch  = require('minimatch');
var Dependency = require('./Dependency');
var types      = require('./types.json');
var traverse   = require('traverse');
var path       = require('path');

/**
 * buildGlobs
 *
 * @class
 * @param {Object} dependencies a map of dependencies
 * @param {Array} bowerFiles an array bower component file paths
 * @param {Object} options
 *
 * @property {Object} globs the glob strings organized by type
 * @property {Object} globs.js an array of javascript Dependency objects
 * @property {Object} globs.css an array of css Dependency objects
 * @property {Object} globs.fonts an array of fonts path glob strings
 * @property {Object} globs.images an array of image path glob strings
 * @property {Object} globs.bower an array of image path glob strings
 */
var buildGlobs = module.exports = function(dependencies, bowerFiles, options) {
  options = options || {};

  this.globs = {
    // js is an array of objects because there can be multople js files
    js: this.getOutputFiles('js', dependencies, bowerFiles),
    // css is an array of objects because there can be multiple css files
    css: this.getOutputFiles('css', dependencies, bowerFiles),
    // fonts is a flat array since all the fonts go to the same place
    fonts: [].concat(
      this.filterByType(bowerFiles, 'fonts'),
      obj.get(dependencies, 'fonts.files')
    ),
    // fonts is a flat array since all the fonts go to the same place
    images: [].concat(
      obj.get(dependencies, 'images.files')
    ),
    bower: bowerFiles
  };
};

/**
 * getOutputFiles
 *
 * @param {String} type
 * @param {Object} dependencies
 * @param {Array} bowerFiles an array bower component file paths
 * @return {undefined}
 */
buildGlobs.prototype.getOutputFiles = function(type, dependencies, bowerFiles) {
  var outputFiles;

  outputFiles = _.pick(dependencies, function(dependency, name) {
    // only select dependencies with valid file extensions
    return new RegExp('\.' + type + '$').test(name);
  });

  outputFiles = _.transform(outputFiles, function(result, dependency, name) {
    // convert to an array of dependencyObjects
    var dep = new Dependency(name, dependency);
    var bower = [];
    var bowerExclude = this.bowerExclude(dependencies);

    if (dependency.bower) {
      bower = bower.concat(
        this.filterByType(
          this.filterByPackage(bowerFiles, dependency.bower),
          type
        )
      );
    } else {
      if (dependency.main) {
        bower = bower.concat(
          this.filterByType(
            this.rejectByPackage(bowerFiles, bowerExclude),
            type
          )
        );
      }
    }
    dep.prependGlobs(bower);
    result.push(dep);
  }, [], this);

  return outputFiles;
};

/**
 * filterByPackage
 *
 * @param {Array} files
 * @param {String|Array} names
 * @return {Array} files for a particular package name
 */
buildGlobs.prototype.filterByPackage = function(files, names, reject) {
  var method = reject ? 'reject' : 'filter';
  if (!_.isArray(names)) {
    names = [names];
  }
  return _[method](files, function(file) {
    return _.some(names, function(name) {
      return file.indexOf(
        path.normalize('/bower_components/' + name + '/')
      ) > -1;
    });
  });
};

buildGlobs.prototype.rejectByPackage = function(files, names) {
  return buildGlobs.prototype.filterByPackage(files, names, true);
};

/**
 * filterByType
 *
 * @param {Array} files
 * @param {String} type
 * @return {Array} files for a particular type
 */
buildGlobs.prototype.filterByType = function(files, type) {
  return _.filter(files, minimatch.filter(types[type], {matchBase: true}));
};

buildGlobs.prototype.bowerExclude = function(dependencies) {
  // resolve bower dependencies
  return traverse(dependencies).reduce(function(result) {
    var parentKey = obj.get(this, 'parent.key');
    if (this.isLeaf && parentKey === 'bower') {
      result.push(this.parent.node);
    }
    return _.flatten(result);
  }, []);
};
