'use strict';

var _              = require('lodash');
var obj            = require('object-path');
var filePath       = require('./filePath');

/**
 * buildGlobs
 *
 * @param {Object} manifest
 * @param {Array} bowerFiles
 * @param {Object} options
 * @return {Object}
 */
var buildGlobs = function (manifest, bowerFiles, options) {
  options = options || {};
  this.fonts = [];
  this.css = [];
  this.js = [];
};

/**
 * getPackageFiles
 *
 * @param {Array} files
 * @param {String} name
 * @return {Array} files for a particular package name
 */
buildGlobs.prototype.filterByPackage = function (files, name) {
  return _.filter(files, function (file) {
    return new RegExp('bower_components\/'+name+'\/').test(file);
  });
};

/**
 * filterByType
 *
 * @param {Array} files
 * @param {String} type
 * @return {undefined} files for a particular type
 */
buildGlobs.prototype.filterByType = function (files, type) {
  var types = {
    "fonts": [
      /\.eot$/,
      /\.svg$/,
      /\.ttf$/,
      /\.woff$/,
    ],
    "js": [
      /\.js$/
    ],
    "css": [
      /\.css$/,
      /\.less$/,
      /\.scss$/,
      /\.sass$/
    ]
  }

  return _.filter(files, function (file) {
    return _.some(types[type], function (regex) {
      return regex.test(file);
    });
  });
};

Object.defineProperty(buildGlobs.prototype, "name", {
    get: function() {
        return this._name ? this._name : "John Doe";
    }
});

module.exports = buildGlobs;
