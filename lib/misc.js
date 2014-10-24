'use strict';

var debug = require('debug'),
  dbgTrace = debug('misc'),
  util = require('util'),
  stream = require('stream'),
  mediaTyper = require('media-typer'),
  cheerio = require('cheerio'),
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
    httpHdrUsrAgent: exports.pkgInf.getFullName(),
    /* default data encoding */
    dataEncoding: 'utf8'
  };

  inst = {
    getItem: function (name) { return data[name]; },
    setItem: function (key, val) {
      data[key] = val;
      return inst;
    },
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

exports.timeSpan = function () {
  var beginTM, endTM, inst;
  
  function start() {
    beginTM = endTM = Date.now();
    return inst;
  }

  function end() {
    endTM = Date.now();
    return inst;
  }

  function getData() {
    return { begin: beginTM, end: endTM };
  }

  function getVal() {
    return Math.max(0, endTM - beginTM);
  }

  start();
  inst = { start: start, end: end, getData: getData, getVal: getVal };
  return inst;
};

exports.parseMediaType = function (srcType) {
  srcType = srcType || '';
  try {
    return mediaTyper.parse(srcType);
  }
  catch (err) {
    exports.logger.warn('Invalid media type(%s): %s', srcType, err.toString());
    return { type: 'unknown', err: err };
  }
};

exports.parseHTML = function (content) {
  var tmSpan, dom, domErr;

  content = content || '';
  tmSpan = exports.timeSpan();
  try {
    domErr = undefined;
    dom = cheerio.load(content);
  }
  catch (err) {
    dom = cheerio.load('');
    domErr = err;
  }
  tmSpan.end();
  return { dom: dom, tmSpan: tmSpan.getData(), domErr: domErr };
};

exports.sinkBuffStream = function (callback) {
  var sinkStream, chunks, totalLen;

  callback = callback || function () {};
  chunks = [];
  totalLen = 0;
  sinkStream = new stream.PassThrough();
  sinkStream.on('data', function (chunk) {
    if (!Buffer.isBuffer(chunk)) {
      chunk = new Buffer(chunk);
    }
    chunks.push(chunk);
    totalLen += chunk.length;
  }).on('end', function () {
    var content, targetStart;

    targetStart = 0;
    content = (totalLen === 0 ? new Buffer('') : new Buffer(totalLen));
    chunks = (totalLen === 0 ? [] : chunks);
    _.each(chunks, function (item) {
      item.copy(content, targetStart, 0, item.length);
      targetStart += item.length;
    });
    callback(undefined, content);
    callback = function () {};
  }).on('error', function (err) {
    callback(err);
    callback = function () {};
  });
  return sinkStream;
};

