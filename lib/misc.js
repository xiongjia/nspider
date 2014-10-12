'use strict';

var debug = require('debug'),
  dbgTrace = debug('misc');

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
  /* default fetcher timeout = 30 seconds */
  fetchTimeout: 1000 * 30
};

