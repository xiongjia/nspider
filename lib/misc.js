'use strict';

var debug = require('debug'),
  dbgTrace = debug('misc'),
  util = require('util'),
  _ = require('underscore');

exports.pkgInf = (function () {
  var pkg, name, version, fullName;

  pkg = require('../package.json');
  name = pkg.name;
  version = pkg.version;
  fullName = util.format('%s_%s', name, version);
  return {
    getName:     function () { return name; },
    getVersion:  function () { return version; },
    getFullName: function () { return fullName; }
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
    dbgTrace('Updating logger handler');
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

exports.defaultOpts = (function () {
  var data, inst;

  data = {
    /* fetcher timeout = 30 seconds */
    fetchTimeout: 1000 * 30,
    /* proxy = osProxy */
    proxy: exports.osProxy,
    /* http user-agent */
    httpHdrUsrAgent: exports.pkgInf.getFullName()
  };

  inst = {
    getItem: function (name) { return data[name]; },
    getData: function () { return data; },
    setData: function (vals) {
      _.each(_.keys(data), function (item) {
        data[item] = vals[item] || data[item];
      });
      return inst;
    },
    checkOpts: function (opts) {
      _.each(_.keys(data), function (item) {
        opts[item] = opts[item] || data[item];
      });
      return inst;
    }
  };
  return inst;
})();

