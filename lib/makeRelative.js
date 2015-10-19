var path = require('path');

/**
 * makeRelative
 *
 * @type {Function}
 * @param {String|String[]} globs
 */
var makeRelative = function(globs) {
  if (_.isArray(globs) === false) {
    if (_.isString(globs) === false) {
      throw new Error(
        'ERROR: globs must be either a string or an array of strings'
      );
    }
    // add glob string to a single member array
    globs = [globs];
  }
  return globs.map(function(glob) {
    return path.relative(__dirname, glob);
  });
};

module.exports = makeRelative;
