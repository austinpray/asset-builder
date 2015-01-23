/**
 * processManifest
 * @module
 */
'use strict';

var _        = require('lodash');
var traverse = require('traverse');
var obj      = require('object-path');

/**
 * processManifest
 *
 * @param {Object} json
 * @return {Object}
 */
module.exports = function(json) {
  var defaults = {
    paths: {
      source: 'assets/',
      dist: 'dist/'
    }
  };
  var err = function(msg) {
    msg = msg || 'file seems to be malformed';
    throw new Error('Manifest File Error: ' + msg);
  };
  var required = ['dependencies'];

  if (_.isPlainObject(json)) {
    json = _.defaults(json, defaults);

    // check to see if the JSON data has the minimum needed properties
    _.forEach(required, function(req) {
      if (!obj.has(json, req)) {
        err('missing "' + req + '" property');
      }
    });

    // add fonts property if it doesn't exist already
    json.dependencies = _.merge({
      fonts: {
        files: ['fonts/**/*']
      },
      images: {
        files: ['images/**/*']
      }
    }, json.dependencies);

    // users can specify files as either
    // * an array of file paths
    // * a string with a single file path
    // this function converts all strings to arrays
    traverse(json.dependencies).forEach(function(node) {
      if (this.isLeaf && !_.isArray(node) && !_.isArray(this.parent.node)) {
        this.update([node]);
      }
    });

    // users can specify their file paths as
    // * "path/to/file.js"
    // and it will be processed into
    // * "assets/path/to/file.js"
    // users can set the "external" property to true to not append the dir
    _.forOwn(json.dependencies, function(dependency, name) {
      if (!dependency.external) {
        json.dependencies[name].files = _.map(dependency.files, function(file) {
          return json.paths.source + file;
        });
      }
      return dependency;
    });

    return json;
  } else {
    err();
  }
};
