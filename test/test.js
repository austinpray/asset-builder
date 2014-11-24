/* jshint node: true */
/* global describe, it */
'use strict';

var should = require('chai').should();
var fs = require('fs');
var path = require('path');
var useref = require('../lib/index');

console.log(useref('./test/fixtures/manifest.json'));
