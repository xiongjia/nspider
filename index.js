'use strict';

var misc = require('./lib/misc.js'),
  dbgTrace = misc.dbgTrace('nspider');

exports = module.exports = function (opts) {
  var defOpts;

  /* update logger handler */
  opts = opts || {};
  misc.logger.update({ silent: opts.silent, handler: opts.logger });

  /* update default options */
  defOpts = misc.defaultOpts;
  defOpts.proxy = opts.proxy || defOpts.proxy;
  defOpts.fetchTimeout = opts.fetchTimeout || defOpts.fetchTimeout;
  defOpts.httpHdrUsrAgent = opts.httpHdrUsrAgent || defOpts.httpHdrUsrAgent;
  dbgTrace('%s options: %j', misc.pkgInf.getFullName(), defOpts);

  return {
    version: misc.pkgInf.getVersion(),
    Spider: require('./lib/spider.js')
  };
};

