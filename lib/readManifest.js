'use strict';

var fs = require('fs');
var p  = require('path');

/**
 * readManifest
 * Converts the manifest JSON file to an object
 *
 * @private
 * @param {String} path path to the manifest file
 * @return {Object} The contents of the JSON file
 */
module.exports = function(path) {
  var stripJsonComments = require('strip-json-comments');
  return JSON.parse(stripJsonComments(fs.readFileSync(p.normalize(path), 'utf8')));
};
