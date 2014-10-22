'use strict';

var request = require('request'),
  _ = require('underscore'),
  misc = require('./misc.js'),
  logger = misc.logger,
  dbgTrace = misc.dbgTrace('transport');

exports.fetch = function (opts, callback) {
  var req, chunks, totalLen, content, tmSpan;

  opts = opts || {};
  callback = callback || function () {};
  dbgTrace('fetch: %j', opts);
  
  totalLen = 0;
  chunks = [];
  content = undefined;
  tmSpan = misc.timeSpan();
  req = request({
    url: opts.url,
    proxy: opts.proxy,
    timeout: opts.fetchTimeout,
    agent: false,
    headers: {
      'User-Agent': opts.httpHdrUsrAgent
    }
  });
  req.on('error', function (err) {
    logger.error('Transport error: %s', err.toString());
    callback(err);
    callback = function () {};
  }).on('data', function (chunk) {
    if (!opts.needContentBuff) {
      return;
    }

    if (!Buffer.isBuffer(chunk)) {
      chunk = new Buffer(chunk);
    }
    chunks.push(chunk);
    totalLen += chunk.length;
  }).on('end', function () {
    var targetStart;

    if (opts.needContentBuff) {
      content = (totalLen === 0 ? new Buffer('') : new Buffer(totalLen));
      targetStart = 0;
      chunks = (totalLen === 0 ? [] : chunks);
      _.each(chunks, function (item) {
        item.copy(content, targetStart, 0, item.length);
        targetStart += item.length;
      });
    }
  }).on('complete', function (response) {
    tmSpan.end();
    callback(undefined, {
      statusCode: response.statusCode,
      contentType:misc.parseMediaType(response.headers['content-type']),
      content: opts.needContentBuff ? content : undefined,
      headers: response.headers,
      tmSpan: tmSpan.getData()
    });
    callback = function () {};
  });

  if (opts.stream) {
    req.pipe(opts.stream);
  }
};

