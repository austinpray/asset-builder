'use strict';
var p = require('path');

/**
 * filePath
 * Converts a project relative path into a full system path
 *
 * @private
 * @param {String} path project relative path
 * @return {String} full system path
 */
module.exports = function (path) {
  return p.join(p.dirname(module.parent.filename), path);
};
