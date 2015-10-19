var _ = require('lodash');

/**
 * validateOptions
 *
 * @param {Object} options
 * @return {Object}
 */
var validateOptions = module.exports = function(options) {

  if (_.isPlainObject(options) === false) {
    if (_.isUndefined(options) === false) {
      // options is something other than an object or undefined
      throw new Error('ERROR: options is supposed to be an object');
    }
    // options is undefined so default to an object
    options = {};
  }

  // asset-builder default options
  options = _.defaultsDeep(options, {
    makePathsRelative: false
  });

  var validations = {
    makePathsRelative: function(value) {
      return _.isBoolean(value) || new Error(
        'ERROR: option makePathsRelative must be a boolean'
      );
    }
  };

  _.forEach(options, function(option, name) {
    var validation = validations[name];
    if (_.isFunction(validation)) {
      var result = validation(option);
      if (_.isError(result)) {
        throw result;
      }
    }
  });

  // options is valid and the default options are loaded in

  return options;
};
