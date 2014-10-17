'use strict';

var misc = require('./lib/misc.js'),
  dbgTrace = misc.dbgTrace('nspider');

exports = module.exports = function (opts) {
  var defOpts;

  /* update logger handler */
  opts = opts || {};
  misc.logger.update({ silent: opts.silent, handler: opts.logger });

  /* update default options */
  defOpts = misc.defaultOpts.setData(opts).getData();
  dbgTrace('%s options: %j', misc.pkgInf.getFullName(), defOpts);

  return {
    version: misc.pkgInf.getVersion(),
    Spider: require('./lib/spider.js')
  };
};

