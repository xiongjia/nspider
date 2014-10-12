'use strict';

exports = module.exports = function (opts) {
  var misc;

  /* update logger handler */
  opts = opts || {};
  misc = require('./lib/misc.js');
  misc.logger.update({ silent: opts.silent, handler: opts.logger });
  return {
    Spider: require('./lib/spider.js')
  };
};

