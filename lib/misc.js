'use strict';

var debug = require('debug'),
  dbgTrace = debug('misc'),
  util = require('util');

exports.nspider = (function () {
  var name, majorVer, minorVer;

  name = 'nspider';
  majorVer = 0;
  minorVer = 1;
  return {
    getName: function () { return name; },
    getMajorVer: function () { return majorVer; },
    getMinorVer: function () { return minorVer; },
    getVer: function () {
      return util.format('%s_%d.%d', name, majorVer, minorVer);
    }
  };
})();

exports.dbgTrace = debug;

exports.logger = (function (opts) {
  var logCtx, log;

  log = {};
  logCtx = opts || {};

  function getHandler(level) {
    var handler;
    if (logCtx.silent) {
      return function () {}; 
    }
    handler = logCtx.handler || {};
    return handler[level] || function () {};
  }

  function updateAllHandler() {
    dbgTrace('Update logger handler');
    log.debug = getHandler('debug');
    log.warn  = getHandler('warn');
    log.info  = getHandler('info');
    log.error = getHandler('error');
  }

  updateAllHandler();
  log.update = function (ctx) {
      logCtx = ctx || {};
      updateAllHandler();
  };
  return log;
})();

exports.osProxy = (function () {
  var proxy;
  proxy = process.env.http_proxy || process.env.HTTP_PROXY ||
    process.env.https_proxy || process.env.HTTPS_PROXY;
  dbgTrace('OS Proxy: %s', proxy);
  return proxy; 
})();

exports.defaultOpts = {
  /* fetcher timeout = 30 seconds */
  fetchTimeout: 1000 * 30,
  /* proxy = osProxy */
  proxy: exports.osProxy,
  /* http user-agent */
  httpHdrUsrAgent: exports.nspider.getVer()
};

